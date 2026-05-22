import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { SessionService } from '../../../../core/services/session.service';
import { DashboardService } from '../../services/dashboard.service';
import { Partido } from '../../interfaces/partido.interface';
import { GrupoConClasificacion } from '../../interfaces/grupo-clasificacion.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private sessionService = inject(SessionService);
  private router = inject(Router);

  readonly TORNEO_ID = 1;

  // Datos del bracket
  partidos: Partido[] = [];
  grupos: GrupoConClasificacion[] = [];
  isLoading = true;
  errorMessage = '';

  // Nav
  isAdmin = false;
  activeDropdown: string | null = null;

  get userFullName(): string {
    return localStorage.getItem('fullName') || 'Usuario';
  }

  ngOnInit(): void {
    this.isAdmin = this.sessionService.getRole() === 'Administrador';
    this.loadAll();
  }

  // ========= Nav =========

  @HostListener('document:click')
  onDocumentClick(): void { this.activeDropdown = null; }

  toggleDropdown(name: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  closeDropdowns(): void { this.activeDropdown = null; }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('fullName');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  // ========= Bracket =========

  loadAll(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      partidos: this.dashboardService.getPartidos(this.TORNEO_ID),
      grupos: this.dashboardService.getGrupos(this.TORNEO_ID),
    }).subscribe({
      next: ({ partidos, grupos }) => {
        this.partidos = partidos.sort((a, b) => a.id - b.id);

        const clasif$ = grupos
          .sort((a, b) => a.id - b.id)
          .map(g =>
            this.dashboardService.getClasificacion(g.id).pipe(
              map(clasificacion => ({ ...g, clasificacion }))
            )
          );

        forkJoin(clasif$).subscribe({
          next: gruposClasif => { this.grupos = gruposClasif; this.isLoading = false; },
          error: () => { this.isLoading = false; this.errorMessage = 'No se pudieron cargar las clasificaciones.'; }
        });
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage = error?.status === 0
          ? 'No se pudo conectar con el servidor.'
          : 'No se pudo cargar el torneo.';
      }
    });
  }

  get leftGroups(): GrupoConClasificacion[] { return this.grupos.slice(0, 6); }
  get rightGroups(): GrupoConClasificacion[] { return this.grupos.slice(6, 12); }

  private byFase(faseId: number): Partido[] {
    return this.partidos.filter(p => p.fase.id === faseId);
  }

  get leftR32Pairs(): [Partido, Partido][] {
    const r = this.byFase(2).slice(0, 8);
    const s = Array.from({ length: 8 }, (_, i) => (r[i] ?? null) as Partido);
    return [[s[0],s[1]], [s[2],s[3]], [s[4],s[5]], [s[6],s[7]]];
  }

  get rightR32Pairs(): [Partido, Partido][] {
    const r = this.byFase(2).slice(8, 16);
    const s = Array.from({ length: 8 }, (_, i) => (r[i] ?? null) as Partido);
    return [[s[0],s[1]], [s[2],s[3]], [s[4],s[5]], [s[6],s[7]]];
  }

  get leftR16Pairs(): [Partido, Partido][] {
    const r = this.byFase(3).slice(0, 4);
    const s = Array.from({ length: 4 }, (_, i) => (r[i] ?? null) as Partido);
    return [[s[0],s[1]], [s[2],s[3]]];
  }

  get rightR16Pairs(): [Partido, Partido][] {
    const r = this.byFase(3).slice(4, 8);
    const s = Array.from({ length: 4 }, (_, i) => (r[i] ?? null) as Partido);
    return [[s[0],s[1]], [s[2],s[3]]];
  }

  get leftQFPair(): [Partido, Partido] {
    const r = this.byFase(4).slice(0, 2);
    return [(r[0] ?? null) as Partido, (r[1] ?? null) as Partido];
  }

  get rightQFPair(): [Partido, Partido] {
    const r = this.byFase(4).slice(2, 4);
    return [(r[0] ?? null) as Partido, (r[1] ?? null) as Partido];
  }

  get leftSF(): Partido  { return (this.byFase(5)[0] ?? null) as Partido; }
  get rightSF(): Partido { return (this.byFase(5)[1] ?? null) as Partido; }
  get finalPartido(): Partido  { return (this.byFase(7)[0] ?? null) as Partido; }
  get tercerPuesto(): Partido  { return (this.byFase(6)[0] ?? null) as Partido; }

  isWinner(p: Partido | null, lado: 'local' | 'visitante'): boolean {
    if (!p?.finalizado || p.golesLocal === null || p.golesVisitante === null) return false;
    return lado === 'local' ? p.golesLocal > p.golesVisitante : p.golesVisitante > p.golesLocal;
  }
}