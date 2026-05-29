import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../../enviroments/enviroments';

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
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private sessionService = inject(SessionService);
  private hubConnection: signalR.HubConnection | null = null;

  torneos: any[] = [];
  torneoId = 1;
  isLoadingTorneos = true;

  partidos: Partido[] = [];
  grupos: GrupoConClasificacion[] = [];
  isLoading = false;
  errorMessage = '';
  topUsuarios: any[] = [];
  topLigas: any[] = [];
  isLoadingRanking = false;

  isAdmin = false;

  mejoresTerceros: any[] = [];
  mejoresTercerosSet = new Set<number>();

  ngOnInit(): void {
    this.isAdmin = this.sessionService.getRole() === 'Administrador';
    this.loadTorneos();
    this.loadRanking();
    this.connectSignalR();
  }

  ngOnDestroy(): void {
    this.hubConnection?.stop();
  }

  loadTorneos(): void {
    this.isLoadingTorneos = true;
    this.dashboardService.getTorneosSelect().subscribe({
      next: (ts: any[]) => {
        this.torneos = ts || [];
        this.isLoadingTorneos = false;
        if (this.torneos.length > 0) {
          this.torneoId = this.torneos[0].id;
        }
        this.loadAll();
      },
      error: () => {
        this.isLoadingTorneos = false;
        this.loadAll();
      }
    });
  }

  onTorneoChange(id: number): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('SalirDeTorneo', this.torneoId).catch(() => {});
    }
    this.torneoId = id;
    this.partidos = [];
    this.grupos = [];
    this.loadAll();
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('UnirseATorneo', this.torneoId).catch(() => {});
    }
  }

  loadAll(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.mejoresTerceros = [];
    this.mejoresTercerosSet = new Set();

    forkJoin({
      partidos: this.dashboardService.getPartidos(this.torneoId),
      grupos: this.dashboardService.getGrupos(this.torneoId),
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
          next: gruposClasif => {
            this.grupos = gruposClasif;
            this.isLoading = false;
            this.loadMejoresTerceros();
          },
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

  loadMejoresTerceros(): void {
    this.dashboardService.getMejoresTerceros(this.torneoId).subscribe({
      next: (terceros: any[]) => {
        this.mejoresTerceros = terceros || [];
        this.mejoresTercerosSet = new Set(this.mejoresTerceros.map((t: any) => t.equipoId));
      },
      error: () => { /* non-critical — silently ignore */ }
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
    return [[s[0], s[1]], [s[2], s[3]], [s[4], s[5]], [s[6], s[7]]];
  }

  get rightR32Pairs(): [Partido, Partido][] {
    const r = this.byFase(2).slice(8, 16);
    const s = Array.from({ length: 8 }, (_, i) => (r[i] ?? null) as Partido);
    return [[s[0], s[1]], [s[2], s[3]], [s[4], s[5]], [s[6], s[7]]];
  }

  get leftR16Pairs(): [Partido, Partido][] {
    const r = this.byFase(3).slice(0, 4);
    const s = Array.from({ length: 4 }, (_, i) => (r[i] ?? null) as Partido);
    return [[s[0], s[1]], [s[2], s[3]]];
  }

  get rightR16Pairs(): [Partido, Partido][] {
    const r = this.byFase(3).slice(4, 8);
    const s = Array.from({ length: 4 }, (_, i) => (r[i] ?? null) as Partido);
    return [[s[0], s[1]], [s[2], s[3]]];
  }

  get leftQFPair(): [Partido, Partido] {
    const r = this.byFase(4).slice(0, 2);
    return [(r[0] ?? null) as Partido, (r[1] ?? null) as Partido];
  }

  get rightQFPair(): [Partido, Partido] {
    const r = this.byFase(4).slice(2, 4);
    return [(r[0] ?? null) as Partido, (r[1] ?? null) as Partido];
  }

  get leftSF(): Partido { return (this.byFase(5)[0] ?? null) as Partido; }
  get rightSF(): Partido { return (this.byFase(5)[1] ?? null) as Partido; }
  get finalPartido(): Partido { return (this.byFase(7)[0] ?? null) as Partido; }
  get tercerPuesto(): Partido { return (this.byFase(6)[0] ?? null) as Partido; }

  isWinner(p: Partido | null, lado: 'local' | 'visitante'): boolean {
    if (!p?.finalizado || p.golesLocal === null || p.golesVisitante === null) return false;
    if (p.golesLocal !== p.golesVisitante) {
      return lado === 'local' ? p.golesLocal > p.golesVisitante : p.golesVisitante > p.golesLocal;
    }
    if (p.golesLocalPenales !== null && p.golesVisitantePenales !== null) {
      return lado === 'local'
        ? p.golesLocalPenales > p.golesVisitantePenales
        : p.golesVisitantePenales > p.golesLocalPenales;
    }
    return false;
  }

  loadRanking(): void {
    this.isLoadingRanking = true;
    forkJoin({
      usuarios: this.dashboardService.getRankingUsuarios(),
      ligas: this.dashboardService.getRankingLigas(),
    }).subscribe({
      next: ({ usuarios, ligas }) => {
        this.topUsuarios = usuarios.slice(0, 10);
        this.topLigas = ligas.slice(0, 10);
        this.isLoadingRanking = false;
      },
      error: () => { this.isLoadingRanking = false; }
    });
  }

  private connectSignalR(): void {
    const token = localStorage.getItem('token') || '';

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.onreconnected(() => {
      this.hubConnection!.invoke('UnirseATorneo', this.torneoId).catch(() => {});
    });

    this.hubConnection.start()
      .then(() => {
        this.hubConnection!.invoke('UnirseATorneo', this.torneoId)
          .catch((err: unknown) => console.warn('UnirseATorneo error:', err));
      })
      .catch((err: unknown) => console.warn('SignalR connection failed:', err));

    this.hubConnection.on('ResultadoActualizado', () => { this.loadAll(); });
    this.hubConnection.on('ClasificacionActualizada', () => { this.loadAll(); });
    this.hubConnection.on('RankingActualizado', () => { this.loadRanking(); });
  }
}
