import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PartidoAdminService } from '../../services/partido-admin.service';

@Component({
  selector: 'app-admin-match-results',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-match-results.component.html',
  styleUrl: './admin-match-results.component.css'
})
export class AdminMatchResultsComponent implements OnInit {
  private partidoService = inject(PartidoAdminService);

  readonly TORNEO_ID = 1;

  partidos: any[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  faseActiva = 1;

  readonly fases = [
    { id: 1, nombre: 'Grupos' },
    { id: 2, nombre: 'Dieciseisavos' },
    { id: 3, nombre: 'Octavos' },
    { id: 4, nombre: 'Cuartos' },
    { id: 5, nombre: 'Semifinal' },
    { id: 6, nombre: '3er Puesto' },
    { id: 7, nombre: 'Final' },
  ];

  // marcador temporal por partido { [id]: {local, visitante} }
  marcadores: Record<number, { local: number | null; visitante: number | null }> = {};
  savingId: number | null = null;

  ngOnInit(): void { this.loadPartidos(); }

  loadPartidos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.partidoService.getByTorneo(this.TORNEO_ID).subscribe({
      next: (res: any) => {
        this.partidos = this.toArray(res).sort((a, b) => a.id - b.id);
        for (const p of this.partidos) {
          this.marcadores[p.id] = {
            local: p.golesLocal ?? null,
            visitante: p.golesVisitante ?? null
          };
        }
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err?.error?.error || 'No se pudieron cargar los partidos.';
      }
    });
  }

  get partidosFiltrados(): any[] {
    return this.partidos.filter(p => p.fase?.id === this.faseActiva);
  }

  cambiarFase(id: number): void {
    this.faseActiva = id;
    this.successMessage = '';
    this.errorMessage = '';
  }

  actualizarEnVivo(partido: any): void {
    const m = this.marcadores[partido.id];
    if (m.local === null || m.visitante === null) return;

    this.savingId = partido.id;
    this.errorMessage = '';

    this.partidoService.actualizarMarcador(partido.id, {
      golesLocal: Number(m.local),
      golesVisitante: Number(m.visitante)
    }).subscribe({
      next: () => {
        this.savingId = null;
        this.successMessage = `Marcador actualizado: ${this.nombreLocal(partido)} ${m.local} - ${m.visitante} ${this.nombreVisitante(partido)}`;
        this.loadPartidos();
      },
      error: err => {
        this.savingId = null;
        this.errorMessage = err?.error?.error || 'No se pudo actualizar el marcador.';
      }
    });
  }

  finalizarPartido(partido: any): void {
    const m = this.marcadores[partido.id];
    if (m.local === null || m.visitante === null) return;

    const confirmar = confirm(
      `¿Finalizar ${this.nombreLocal(partido)} ${m.local} - ${m.visitante} ${this.nombreVisitante(partido)}?\n\nEsto calculará puntos y no podrá revertirse.`
    );
    if (!confirmar) return;

    this.savingId = partido.id;
    this.errorMessage = '';

    this.partidoService.ingresarResultado(partido.id, {
      golesLocal: Number(m.local),
      golesVisitante: Number(m.visitante)
    }).subscribe({
      next: () => {
        this.savingId = null;
        this.successMessage = `Partido finalizado correctamente.`;
        this.loadPartidos();
      },
      error: err => {
        this.savingId = null;
        this.errorMessage = err?.error?.error || 'No se pudo finalizar el partido.';
      }
    });
  }

  nombreLocal(p: any): string {
    return p?.equipoLocal?.nombre || p?.descripcionLocal || 'Local';
  }

  nombreVisitante(p: any): string {
    return p?.equipoVisitante?.nombre || p?.descripcionVisitante || 'Visitante';
  }

  getFecha(p: any): string {
    if (!p?.fechaHora) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC'
    }).format(new Date(p.fechaHora));
  }

  estadoBadge(p: any): string {
    if (p.finalizado) return 'finalizado';
    if (p.golesLocal !== null) return 'en-vivo';
    return 'pendiente';
  }

  estadoLabel(p: any): string {
    if (p.finalizado) return 'Finalizado';
    if (p.golesLocal !== null) return 'En curso';
    return 'Pendiente';
  }

  private toArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    return res?.items ?? res?.data ?? [];
  }
}