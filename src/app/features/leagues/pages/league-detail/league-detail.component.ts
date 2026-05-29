import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../../enviroments/enviroments';

import { LeagueService } from '../../services/league.service';
import { SessionService } from '../../../../core/services/session.service';

type Tab = 'ranking' | 'miembros' | 'pendientes' | 'invitaciones';

@Component({
  selector: 'app-league-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './league-detail.component.html',
  styleUrl: './league-detail.component.css'
})
export class LeagueDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private leagueService = inject(LeagueService);
  private sessionService = inject(SessionService);
  private fb = inject(FormBuilder);
  private hubConnection: signalR.HubConnection | null = null;

  ligaId = 0;
  liga: any = null;
  torneoNombre = '';
  miembros: any[] = [];
  pendientes: any[] = [];
  ranking: any[] = [];
  private rankingAnterior: any[] = [];
  invitaciones: any[] = [];

  activeTab: Tab = 'ranking';
  esAdminDeLiga = false;
  isLive = false;

  isLoadingLiga = true;
  isLoadingMiembros = true;
  isLoadingPendientes = true;
  isLoadingInvitaciones = true;
  isLoadingRanking = true;
  isSaliendo = false;

  actionLoadingUserId: number | null = null;
  cancelLoadingInvitationId: number | null = null;

  errorMessage = '';
  successMessage = '';

  invitationForm!: FormGroup;
  isSendingInvitation = false;

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || id <= 0) {
      this.errorMessage = 'El identificador de la liga no es válido.';
      this.isLoadingLiga = this.isLoadingMiembros = this.isLoadingPendientes =
        this.isLoadingInvitaciones = this.isLoadingRanking = false;
      return;
    }

    this.ligaId = id;
    this.invitationForm = this.fb.group({
      emailInvitado: ['', [Validators.required, Validators.email]]
    });

    this.loadAll();
    await this.initSignalR();
  }

  async ngOnDestroy(): Promise<void> {
    try {
      if (this.hubConnection) {
        await this.hubConnection.invoke('SalirDeLiga', this.ligaId).catch(() => {});
        await this.hubConnection.stop();
      }
    } catch { /* noop */ }
  }

  get emailInvitado() { return this.invitationForm.get('emailInvitado')!; }

  // Carga inicial
  loadAll(): void {
    this.loadLiga();
    this.loadMiembros();
    this.loadPendientes();
    this.loadInvitaciones();
    this.loadRanking();
  }

  loadLiga(): void {
    this.isLoadingLiga = true;
    this.leagueService.getById(this.ligaId).subscribe({
      next: (r: any) => {
        this.liga = r;
        this.isLoadingLiga = false;
        if (r?.torneoId) this.loadTorneoNombre(r.torneoId);
      },
      error: (e) => {
        this.isLoadingLiga = false;
        this.errorMessage = e?.error?.error || 'No se pudo cargar la liga.';
      }
    });
  }

  private loadTorneoNombre(torneoId: number): void {
    this.leagueService.getTorneosSelect().subscribe({
      next: (ts: any[]) => {
        const t = ts.find(x => x.id === torneoId);
        this.torneoNombre = t?.nombre || `Torneo #${torneoId}`;
      },
      error: () => { this.torneoNombre = `Torneo #${torneoId}`; }
    });
  }

  loadMiembros(): void {
    this.isLoadingMiembros = true;
    this.leagueService.getMiembros(this.ligaId).subscribe({
      next: (r: any) => {
        this.miembros = this.toArr(r);
        const email = this.sessionService.getEmail();
        this.esAdminDeLiga = this.miembros.some(m => m.email === email && m.esAdmin);
        this.isLoadingMiembros = false;
      },
      error: () => { this.isLoadingMiembros = false; }
    });
  }

  loadPendientes(): void {
    this.isLoadingPendientes = true;
    this.leagueService.getMiembrosPendientes(this.ligaId).subscribe({
      next: (r: any) => { this.pendientes = this.toArr(r); this.isLoadingPendientes = false; },
      error: (e) => { this.isLoadingPendientes = false; if (e.status === 403) return; }
    });
  }

  loadInvitaciones(): void {
    this.isLoadingInvitaciones = true;
    this.leagueService.getInvitationsByLiga(this.ligaId).subscribe({
      next: (r: any) => { this.invitaciones = this.toArr(r); this.isLoadingInvitaciones = false; },
      error: (e) => { this.isLoadingInvitaciones = false; if (e.status === 403) return; }
    });
  }

  loadRanking(): void {
    this.isLoadingRanking = true;
    this.leagueService.getPremiosLiga(this.ligaId).subscribe({
      next: (r: any) => {
        const nuevo = this.toArr(r);
        this.ranking = this.applyVariation(nuevo);
        this.rankingAnterior = this.ranking.map(f => ({ ...f }));
        this.isLoadingRanking = false;
      },
      error: () => { this.isLoadingRanking = false; }
    });
  }

  private applyVariation(nuevo: any[]): any[] {
    const prev: Record<number, number> = {};
    for (const f of this.rankingAnterior) prev[f.userId] = f.posicion;
    return nuevo.map(f => ({
      ...f,
      variacion: prev[f.userId] !== undefined ? prev[f.userId] - f.posicion : 0
    }));
  }

  // SignalR
  private async initSignalR(): Promise<void> {
    const token = this.sessionService.getToken();
    if (!token) return;
    try {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(environment.hubUrl, { accessTokenFactory: () => token })
        .withAutomaticReconnect()
        .build();

      this.hubConnection.onreconnected(() => {
        this.isLive = true;
        this.hubConnection?.invoke('UnirseALiga', this.ligaId).catch(() => {});
      });
      this.hubConnection.onclose(() => { this.isLive = false; });

      await this.hubConnection.start();
      this.isLive = true;
      await this.hubConnection.invoke('UnirseALiga', this.ligaId);

      this.hubConnection.on('RankingActualizado', (payload: any) => {
        if (payload?.ligaId === this.ligaId) this.loadRanking();
      });
    } catch { /* conexión opcional */ }
  }

  // Acciones
  setTab(tab: Tab): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  salirLiga(): void {
    if (!confirm('¿Estás seguro de que deseas salir de esta liga?')) return;
    this.isSaliendo = true;
    this.leagueService.salir(this.ligaId).subscribe({
      next: () => this.router.navigate(['/ligas']),
      error: (e) => {
        this.isSaliendo = false;
        this.errorMessage = e?.error?.error || 'No se pudo salir de la liga.';
      }
    });
  }

  aprobarParticipante(userId: number): void {
    this.clearMessages();
    this.actionLoadingUserId = userId;
    this.leagueService.aprobarMiembro(this.ligaId, { userId, aprobar: true }).subscribe({
      next: () => {
        this.actionLoadingUserId = null;
        this.successMessage = 'Participante aprobado correctamente.';
        this.loadMiembros();
        this.loadPendientes();
      },
      error: (e) => {
        this.actionLoadingUserId = null;
        this.errorMessage = e?.error?.error || 'No se pudo aprobar al participante.';
      }
    });
  }

  rechazarParticipante(userId: number): void {
    this.clearMessages();
    this.actionLoadingUserId = userId;
    this.leagueService.aprobarMiembro(this.ligaId, { userId, aprobar: false }).subscribe({
      next: () => {
        this.actionLoadingUserId = null;
        this.successMessage = 'Solicitud rechazada.';
        this.loadPendientes();
      },
      error: (e) => {
        this.actionLoadingUserId = null;
        this.errorMessage = e?.error?.error || 'No se pudo rechazar la solicitud.';
      }
    });
  }

  enviarInvitacion(): void {
    this.clearMessages();
    if (this.invitationForm.invalid) { this.invitationForm.markAllAsTouched(); return; }
    this.isSendingInvitation = true;
    this.leagueService.sendInvitation(this.ligaId, { emailInvitado: this.emailInvitado.value.trim() }).subscribe({
      next: () => {
        this.isSendingInvitation = false;
        this.successMessage = 'Invitación enviada correctamente.';
        this.invitationForm.reset();
        this.loadInvitaciones();
      },
      error: (e) => {
        this.isSendingInvitation = false;
        this.errorMessage = e?.error?.error || 'No se pudo enviar la invitación.';
      }
    });
  }

  cancelarInvitacion(id: number): void {
    this.clearMessages();
    this.cancelLoadingInvitationId = id;
    this.leagueService.cancelInvitation(id).subscribe({
      next: () => {
        this.cancelLoadingInvitationId = null;
        this.successMessage = 'Invitación cancelada.';
        this.loadInvitaciones();
      },
      error: (e) => {
        this.cancelLoadingInvitationId = null;
        this.errorMessage = e?.error?.error || 'No se pudo cancelar la invitación.';
      }
    });
  }

  // Helpers
  getTipoLiga(): string { return this.liga?.esDeApuestas ? '💰 Apuestas' : '🎮 Diversión'; }

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

  private clearMessages(): void { this.errorMessage = ''; this.successMessage = ''; }

  private toArr(r: any): any[] {
    if (Array.isArray(r)) return r;
    return r?.items ?? r?.data ?? [];
  }
}
