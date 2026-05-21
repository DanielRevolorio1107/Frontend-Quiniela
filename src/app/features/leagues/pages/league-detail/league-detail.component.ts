import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { LeagueService } from '../../services/league.service';
import { QuinielaSignalrService } from '../../services/quiniela-signalr.service';

@Component({
  selector: 'app-league-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './league-detail.component.html',
  styleUrl: './league-detail.component.css'
})
export class LeagueDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private leagueService = inject(LeagueService);
  private fb = inject(FormBuilder);
  private signalrService = inject(QuinielaSignalrService);

  ligaId = 0;

  liga: any = null;
  miembros: any[] = [];
  pendientes: any[] = [];
  ranking: any[] = [];

  isLoadingLiga = true;
  isLoadingMiembros = true;
  isLoadingPendientes = true;
  isLoadingInvitaciones = true;
  isLoadingRanking = true;

  actionLoadingUserId: number | null = null;
  cancelLoadingInvitationId: number | null = null;

  errorMessage = '';
  successMessage = '';

  invitationForm!: FormGroup;
  invitaciones: any[] = [];
  isSendingInvitation = false;

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || id <= 0) {
      this.errorMessage = 'El identificador de la liga no es válido.';
      this.isLoadingLiga = false;
      this.isLoadingMiembros = false;
      this.isLoadingPendientes = false;
      this.isLoadingInvitaciones = false;
      this.isLoadingRanking = false;
      return;
    }

    this.ligaId = id;

    this.invitationForm = this.fb.group({
      emailInvitado: ['', [Validators.required, Validators.email]]
    });

    this.loadAll();
    await this.initSignalr();
  }

  async ngOnDestroy(): Promise<void> {
    await this.signalrService.leaveLeague(this.ligaId);
    await this.signalrService.stopConnection();
  }

  get emailInvitado() {
    return this.invitationForm.get('emailInvitado')!;
  }

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
      next: (response: any) => {
        this.liga = response;
        this.isLoadingLiga = false;
      },
      error: (error) => {
        this.isLoadingLiga = false;
        this.errorMessage = error?.error?.error || 'No se pudo cargar la información de la liga.';
      }
    });
  }

  loadMiembros(): void {
    this.isLoadingMiembros = true;

    this.leagueService.getMiembros(this.ligaId).subscribe({
      next: (response: any) => {
        this.miembros = this.extractArray(response);
        this.isLoadingMiembros = false;
      },
      error: () => {
        this.isLoadingMiembros = false;
      }
    });
  }

  loadPendientes(): void {
    this.isLoadingPendientes = true;

    this.leagueService.getMiembrosPendientes(this.ligaId).subscribe({
      next: (response: any) => {
        this.pendientes = this.extractArray(response);
        this.isLoadingPendientes = false;
      },
      error: (error) => {
        this.isLoadingPendientes = false;
        if (error.status === 403) return;
      }
    });
  }

  loadInvitaciones(): void {
    this.isLoadingInvitaciones = true;

    this.leagueService.getInvitationsByLiga(this.ligaId).subscribe({
      next: (response: any) => {
        this.invitaciones = this.extractArray(response);
        this.isLoadingInvitaciones = false;
      },
      error: (error) => {
        this.isLoadingInvitaciones = false;
        if (error.status === 403) return;
      }
    });
  }

  loadRanking(): void {
    this.isLoadingRanking = true;

    this.leagueService.getRanking(this.ligaId).subscribe({
      next: (response: any) => {
        this.ranking = this.extractArray(response);
        this.isLoadingRanking = false;
      },
      error: () => {
        this.isLoadingRanking = false;
      }
    });
  }

  async initSignalr(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await this.signalrService.startConnection(token);
      await this.signalrService.joinLeague(this.ligaId);

      this.signalrService.onRankingUpdated((payload: any) => {
        if (payload?.ligaId === this.ligaId && Array.isArray(payload?.ranking)) {
          this.ranking = payload.ranking;
        }
      });
    } catch {
      // si falla la conexión en tiempo real, el ranking sigue funcionando por carga normal
    }
  }

  aprobarParticipante(userId: number): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.actionLoadingUserId = userId;

    this.leagueService.aprobarMiembro(this.ligaId, {
      userId,
      aprobar: true
    }).subscribe({
      next: () => {
        this.successMessage = 'Participante aprobado correctamente.';
        this.actionLoadingUserId = null;
        this.loadMiembros();
        this.loadPendientes();
      },
      error: (error) => {
        this.actionLoadingUserId = null;
        this.errorMessage = error?.error?.error || 'No se pudo aprobar al participante.';
      }
    });
  }

  rechazarParticipante(userId: number): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.actionLoadingUserId = userId;

    this.leagueService.aprobarMiembro(this.ligaId, {
      userId,
      aprobar: false
    }).subscribe({
      next: () => {
        this.successMessage = 'Solicitud rechazada correctamente.';
        this.actionLoadingUserId = null;
        this.loadPendientes();
      },
      error: (error) => {
        this.actionLoadingUserId = null;
        this.errorMessage = error?.error?.error || 'No se pudo rechazar la solicitud.';
      }
    });
  }

  enviarInvitacion(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.invitationForm.invalid) {
      this.invitationForm.markAllAsTouched();
      return;
    }

    this.isSendingInvitation = true;

    const payload = {
      emailInvitado: this.emailInvitado.value.trim()
    };

    this.leagueService.sendInvitation(this.ligaId, payload).subscribe({
      next: () => {
        this.isSendingInvitation = false;
        this.successMessage = 'Invitación enviada correctamente.';
        this.invitationForm.reset();
        this.loadInvitaciones();
      },
      error: (error) => {
        this.isSendingInvitation = false;
        this.errorMessage = error?.error?.error || 'No se pudo enviar la invitación.';
      }
    });
  }

  cancelarInvitacion(invitacionId: number): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.cancelLoadingInvitationId = invitacionId;

    this.leagueService.cancelInvitation(invitacionId).subscribe({
      next: () => {
        this.cancelLoadingInvitationId = null;
        this.successMessage = 'Invitación cancelada correctamente.';
        this.loadInvitaciones();
      },
      error: (error) => {
        this.cancelLoadingInvitationId = null;
        this.errorMessage = error?.error?.error || 'No se pudo cancelar la invitación.';
      }
    });
  }

  extractArray(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  getTipoLiga(): string {
    return this.liga?.esDeApuestas ? 'Apuestas' : 'Diversión';
  }
}