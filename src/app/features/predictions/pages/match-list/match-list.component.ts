import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import * as signalR from '@microsoft/signalr';
import { PredictionService } from '../../services/prediction.service';
import { environment } from '../../../../../enviroments/enviroments';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './match-list.component.html',
  styleUrl: './match-list.component.css'
})
export class MatchListComponent implements OnInit, OnDestroy {
  private predictionService = inject(PredictionService);
  private route = inject(ActivatedRoute);
  private hubConnection: signalR.HubConnection | null = null;

  torneos: any[] = [];
  selectedTorneoId: number | null = null;
  isLive = false;

  readonly fasesInfo: Record<number, { nombre: string; emoji: string }> = {
    1: { nombre: 'Fase de Grupos',        emoji: '🏟️' },
    2: { nombre: 'Dieciseisavos de Final', emoji: '⚡' },
    3: { nombre: 'Octavos de Final',       emoji: '🎯' },
    4: { nombre: 'Cuartos de Final',       emoji: '🔥' },
    5: { nombre: 'Semifinal',              emoji: '⭐' },
    6: { nombre: 'Tercer Puesto',          emoji: '🥉' },
    7: { nombre: 'Final',                  emoji: '🏆' },
  };

  partidosByFase: { faseId: number; nombre: string; emoji: string; partidos: any[] }[] = [];

  isLoadingTorneos = true;
  isLoadingPartidos = false;
  errorMessage = '';

  ngOnInit(): void {
    const torneoParam = this.route.snapshot.queryParamMap.get('torneo');
    this.loadTorneos(torneoParam ? Number(torneoParam) : null);
    this.connectSignalR();
  }

  ngOnDestroy(): void {
    if (this.hubConnection) {
      if (this.selectedTorneoId && this.hubConnection.state === signalR.HubConnectionState.Connected) {
        this.hubConnection.invoke('SalirDeTorneo', this.selectedTorneoId).catch(() => {});
      }
      this.hubConnection.stop();
    }
  }

  loadTorneos(preselect: number | null = null): void {
    this.isLoadingTorneos = true;
    this.predictionService.getTorneosSelect().subscribe({
      next: (res: any) => {
        this.torneos = Array.isArray(res) ? res : [];
        this.isLoadingTorneos = false;
        if (preselect && this.torneos.some(t => t.id === preselect)) {
          this.selectedTorneoId = preselect;
          this.loadPartidos();
        } else if (this.torneos.length === 1) {
          this.selectedTorneoId = this.torneos[0].id;
          this.loadPartidos();
        }
      },
      error: () => { this.isLoadingTorneos = false; }
    });
  }

  onTorneoChange(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    if (this.selectedTorneoId && this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('SalirDeTorneo', this.selectedTorneoId).catch(() => {});
    }
    this.selectedTorneoId = id || null;
    this.partidosByFase = [];
    this.errorMessage = '';
    if (this.selectedTorneoId) {
      this.loadPartidos();
      this.joinTorneoSignalR();
    }
  }

  loadPartidos(): void {
    if (!this.selectedTorneoId) return;
    this.isLoadingPartidos = true;
    this.errorMessage = '';

    this.predictionService.getPartidosByTorneo(this.selectedTorneoId).subscribe({
      next: (res: any) => {
        const all: any[] = Array.isArray(res) ? res : (res?.items ?? res?.data ?? []);
        this.agruparPorFase(all);
        this.isLoadingPartidos = false;
      },
      error: (err) => {
        this.isLoadingPartidos = false;
        this.errorMessage = err?.error?.error || 'No se pudieron cargar los partidos.';
      }
    });
  }

  agruparPorFase(partidos: any[]): void {
    const map = new Map<number, any[]>();
    for (const p of partidos) {
      const id = p.fase?.id ?? 0;
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(p);
    }
    this.partidosByFase = Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([faseId, ps]) => ({
        faseId,
        nombre: this.fasesInfo[faseId]?.nombre ?? `Fase ${faseId}`,
        emoji: this.fasesInfo[faseId]?.emoji ?? '⚽',
        partidos: ps.sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
      }));
  }

  // SignalR
  private connectSignalR(): void {
    const token = localStorage.getItem('token') || '';
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.onreconnected(() => { this.isLive = true; this.joinTorneoSignalR(); });
    this.hubConnection.onclose(() => { this.isLive = false; });

    this.hubConnection.start()
      .then(() => { this.isLive = true; this.joinTorneoSignalR(); })
      .catch(() => {});

    this.hubConnection.on('ResultadoActualizado', (payload: any) => {
      this.updatePartidoInPlace(payload);
    });
  }

  private joinTorneoSignalR(): void {
    if (!this.selectedTorneoId || !this.hubConnection) return;
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('UnirseATorneo', this.selectedTorneoId).catch(() => {});
    }
  }

  private updatePartidoInPlace(payload: any): void {
    if (!payload?.partidoId) return;
    for (const fase of this.partidosByFase) {
      const p = fase.partidos.find(x => x.id === payload.partidoId);
      if (p) {
        p.golesLocal = payload.golesLocal ?? p.golesLocal;
        p.golesVisitante = payload.golesVisitante ?? p.golesVisitante;
        p.finalizado = payload.finalizado ?? p.finalizado;
        break;
      }
    }
  }

  // Helpers
  getStatus(p: any): 'finalizado' | 'en-curso' | 'pendiente' {
    if (p.finalizado) return 'finalizado';
    if (p.golesLocal !== null && p.golesLocal !== undefined) return 'en-curso';
    return 'pendiente';
  }

  canPredict(p: any): boolean {
    if (p.finalizado) return false;
    if (!p.fechaHora) return false;
    return Date.now() < new Date(p.fechaHora).getTime() - 15 * 60 * 1000;
  }

  getScore(p: any): string {
    if (p.golesLocal === null || p.golesLocal === undefined) return 'vs';
    let score = `${p.golesLocal} - ${p.golesVisitante}`;
    if (p.golesLocalPenales !== null && p.golesLocalPenales !== undefined) {
      score += ` (pen. ${p.golesLocalPenales}-${p.golesVisitantePenales})`;
    }
    return score;
  }

  formatDate(fecha: string): string {
    if (!fecha) return '';
    return new Intl.DateTimeFormat('es-GT', {
      weekday: 'short', day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'America/Guatemala'
    }).format(new Date(fecha));
  }

  localNombre(p: any): string    { return p.equipoLocal?.nombre    || p.descripcionLocal    || '?'; }
  visitanteNombre(p: any): string { return p.equipoVisitante?.nombre || p.descripcionVisitante || '?'; }
  localFlag(p: any): string      { return p.equipoLocal?.banderaUrl    || ''; }
  visitanteFlag(p: any): string  { return p.equipoVisitante?.banderaUrl || ''; }
  localCode(p: any): string      { return p.equipoLocal?.codigoFifa    || ''; }
  visitanteCode(p: any): string  { return p.equipoVisitante?.codigoFifa || ''; }
}
