import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../../enviroments/enviroments';
import { LeagueService } from '../../services/league.service';

@Component({
  selector: 'app-ranking-global',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ranking-global.component.html',
  styleUrl: './ranking-global.component.css'
})
export class RankingGlobalComponent implements OnInit, OnDestroy {
  private leagueService = inject(LeagueService);
  private hubConnection: signalR.HubConnection | null = null;

  rankingUsuarios: any[] = [];
  rankingLigas: any[] = [];
  activeTab: 'usuarios' | 'ligas' = 'usuarios';

  isLoading = true;
  isLive = false;
  errorMessage = '';

  private prevUsuarios: Record<number, number> = {};
  private prevLigas: Record<number, number> = {};

  ngOnInit(): void {
    this.loadRanking();
    this.connectSignalR();
  }

  ngOnDestroy(): void {
    this.hubConnection?.stop();
  }

  loadRanking(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      usuarios: this.leagueService.getRankingGlobalUsuarios(),
      ligas:    this.leagueService.getRankingGlobalLigas()
    }).subscribe({
      next: ({ usuarios, ligas }) => {
        const us = Array.isArray(usuarios) ? usuarios : [];
        const ls = Array.isArray(ligas)    ? ligas    : [];

        this.rankingUsuarios = us.map(u => ({
          ...u,
          variacion: this.prevUsuarios[u.userId] !== undefined
            ? this.prevUsuarios[u.userId] - u.posicion : 0
        }));
        this.rankingLigas = ls.map(l => ({
          ...l,
          variacion: this.prevLigas[l.ligaId] !== undefined
            ? this.prevLigas[l.ligaId] - l.posicion : 0
        }));

        this.prevUsuarios = Object.fromEntries(us.map(u => [u.userId, u.posicion]));
        this.prevLigas    = Object.fromEntries(ls.map(l => [l.ligaId, l.posicion]));

        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.error || 'No se pudo cargar el ranking.';
      }
    });
  }

  private connectSignalR(): void {
    const token = localStorage.getItem('token') || '';

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => { this.isLive = true; this.joinTorneoGroups(); })
      .catch(() => {});

    this.hubConnection.onreconnected(() => { this.isLive = true; this.joinTorneoGroups(); });
    this.hubConnection.onclose(() => { this.isLive = false; });

    // ResultadoActualizado → torneo_X group (actualiza puntos y ranking)
    this.hubConnection.on('ResultadoActualizado', () => { this.loadRanking(); });
    // RankingActualizado → liga_X group (si alguna vez se une a un grupo de liga)
    this.hubConnection.on('RankingActualizado', () => { this.loadRanking(); });
  }

  private joinTorneoGroups(): void {
    this.leagueService.getTorneosSelect().subscribe({
      next: (ts: any[]) => {
        for (const t of (ts || [])) {
          this.hubConnection?.invoke('UnirseATorneo', t.id).catch(() => {});
        }
      },
      error: () => {}
    });
  }

  variacionLabel(fila: any): string {
    if (!fila?.variacion) return '—';
    return fila.variacion > 0 ? `▲ +${fila.variacion}` : `▼ ${fila.variacion}`;
  }

  variacionClass(fila: any): string {
    if (!fila?.variacion) return 'var-neutral';
    return fila.variacion > 0 ? 'var-up' : 'var-down';
  }

  getMedal(pos: number): string {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return `${pos}`;
  }
}
