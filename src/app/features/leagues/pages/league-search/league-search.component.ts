import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { LeagueService } from '../../services/league.service';
import { SessionService } from '../../../../core/services/session.service';

@Component({
  selector: 'app-league-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './league-search.component.html',
  styleUrl: './league-search.component.css'
})
export class LeagueSearchComponent implements OnInit {
  private fb = inject(FormBuilder);
  private leagueService = inject(LeagueService);
  private sessionService = inject(SessionService);

  isAdmin = false;

  searchForm: FormGroup = this.fb.group({ nombre: [''] });

  torneos: any[] = [];
  resultados: any[] = [];
  private allLigas: any[] = [];       // lista completa sin filtrar
  private misLigaIds = new Set<number>();
  private rankingMap = new Map<number, any>(); // ligaId → { totalMiembros, premioTotal }

  teamNames: Record<number, string> = {};
  joiningId: number | null = null;
  joinSuccess: Record<number, boolean> = {};

  // Miembros por liga (admin)
  expandedId: number | null = null;
  loadingMembersId: number | null = null;
  membersMap: Record<number, any[]> = {};

  isLoading = true;
  joinLoadingId: number | null = null;
  errorMessage = '';
  successMessage = '';

  get nombre() { return this.searchForm.get('nombre')!; }

  ngOnInit(): void {
    this.isAdmin = this.sessionService.getRole() === 'Administrador';
    forkJoin({
      torneos:      this.leagueService.getTorneosSelect(),
      ligas:        this.leagueService.getAll(1, 100),
      misLigas:     this.leagueService.getMisLigas(1, 100),
      rankingLigas: this.leagueService.getRankingGlobalLigas()
    }).subscribe({
      next: ({ torneos, ligas, misLigas, rankingLigas }) => {
        this.torneos = Array.isArray(torneos) ? torneos : [];

        // IDs de ligas en las que ya participo
        this.misLigaIds = new Set(this.toArray(misLigas).map((l: any) => l.id));

        // Mapa con miembros y fondo para ligas de apuesta
        this.rankingMap = new Map();
        if (Array.isArray(rankingLigas)) {
          for (const r of rankingLigas) {
            this.rankingMap.set(r.ligaId, r);
          }
        }

        this.allLigas = this.enriquecer(this.toArray(ligas));
        this.resultados = [...this.allLigas];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.status === 0
          ? 'No se pudo conectar con el servidor.'
          : (err?.error?.error || 'No se pudieron cargar las ligas.');
      }
    });
  }

  private enriquecer(ligas: any[]): any[] {
    return ligas.map(liga => {
      const r = this.rankingMap.get(liga.id);
      const totalMiembros = r?.totalMiembros ?? null;
      const fondoTotal = (totalMiembros !== null && liga.precioPorUnirse)
        ? totalMiembros * Number(liga.precioPorUnirse)
        : null;
      return {
        ...liga,
        _totalMiembros: totalMiembros,
        _fondoTotal:    fondoTotal,
        _yaPertenezco:  this.misLigaIds.has(liga.id)
      };
    });
  }

  onSearch(): void {
    this.errorMessage = '';
    this.successMessage = '';
    const nombre = this.nombre.value.trim();

    if (nombre.length === 0) {
      this.resultados = [...this.allLigas];
      return;
    }
    if (nombre.length < 2) {
      this.errorMessage = 'Ingresa al menos 2 caracteres para buscar.';
      return;
    }

    this.isLoading = true;
    this.leagueService.search(nombre, 1, 100).subscribe({
      next: (response: any) => {
        this.resultados = this.enriquecer(this.toArray(response));
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.status === 0
          ? 'No se pudo conectar con el servidor.'
          : (error?.error?.error || 'No se pudieron buscar ligas.');
      }
    });
  }

  clearSearch(): void {
    this.searchForm.reset({ nombre: '' });
    this.errorMessage = '';
    this.resultados = [...this.allLigas];
  }

  // Flujo de solicitud
  startJoin(ligaId: number): void {
    this.joiningId = ligaId;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelJoin(): void {
    if (this.joiningId !== null) this.teamNames[this.joiningId] = '';
    this.joiningId = null;
  }

  unirseALiga(ligaId: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    const nombreEquipo = (this.teamNames[ligaId] || '').trim();
    if (nombreEquipo.length < 2) {
      this.errorMessage = 'Ingresa un nombre de equipo válido (mínimo 2 caracteres).';
      return;
    }

    this.joinLoadingId = ligaId;
    this.leagueService.unirse(ligaId, { nombreEquipo }).subscribe({
      next: () => {
        this.joinLoadingId = null;
        this.joiningId = null;
        this.joinSuccess[ligaId] = true;
        this.teamNames[ligaId] = '';
        this.successMessage = '✔ Solicitud enviada. Quedó pendiente de aprobación del administrador.';
      },
      error: (error) => {
        this.joinLoadingId = null;
        this.errorMessage = error?.status === 0
          ? 'No se pudo conectar con el servidor.'
          : (error?.error?.error || 'No se pudo enviar la solicitud.');
      }
    });
  }

  // Miembros
  toggleMembers(ligaId: number): void {
    if (this.expandedId === ligaId) {
      this.expandedId = null;
      return;
    }
    if (this.membersMap[ligaId]) {
      this.expandedId = ligaId;
      return;
    }
    this.loadingMembersId = ligaId;
    this.leagueService.getMiembros(ligaId).subscribe({
      next: (res: any) => {
        this.membersMap[ligaId] = this.toArray(res);
        this.loadingMembersId = null;
        this.expandedId = ligaId;
      },
      error: () => {
        this.membersMap[ligaId] = [];
        this.loadingMembersId = null;
        this.expandedId = ligaId;
      }
    });
  }

  // Helpers de display
  getTorneoNombre(torneoId: number): string {
    const t = this.torneos.find(t => t.id === torneoId);
    return t?.nombre || `Torneo #${torneoId}`;
  }

  getTipoLabel(liga: any): string {
    return liga.esDeApuestas ? '💰 Apuestas' : '🎮 Diversión';
  }

  private toArray(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }
}
