import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { LeagueService } from '../../services/league.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-league-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './league-detail.component.html',
  styleUrl: './league-detail.component.css'
})
export class LeagueDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private leagueService = inject(LeagueService);

  ligaId = 0;

  liga: any = null;
  miembros: any[] = [];
  pendientes: any[] = [];

  isLoadingLiga = true;
  isLoadingMiembros = true;
  isLoadingPendientes = true;

  actionLoadingUserId: number | null = null;

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || id <= 0) {
      this.errorMessage = 'El identificador de la liga no es válido.';
      this.isLoadingLiga = false;
      this.isLoadingMiembros = false;
      this.isLoadingPendientes = false;
      return;
    }

    this.ligaId = id;
    this.invitationForm = this.fb.group({
    emailInvitado: ['', [Validators.required, Validators.email]]
});
    this.loadAll();
  }

  loadAll(): void {
    this.loadLiga();
    this.loadMiembros();
    this.loadPendientes();
    this.loadInvitaciones();
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

        if (error.status === 403) {
          return;
        }
      }
    });
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

  extractArray(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.items)) {
      return response.items;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
  }

  getTipoLiga(): string {
    return this.liga?.esDeApuestas ? 'Apuestas' : 'Diversión';
  }

  get emailInvitado() {
  return this.invitationForm.get('emailInvitado')!;
}

  private fb = inject(FormBuilder);

  invitationForm!: FormGroup;
  invitaciones: any[] = [];
  isLoadingInvitaciones = true;
  isSendingInvitation = false;
  cancelLoadingInvitationId: number | null = null;

  loadInvitaciones(): void {
  this.isLoadingInvitaciones = true;

  this.leagueService.getInvitationsByLiga(this.ligaId).subscribe({
    next: (response: any) => {
      this.invitaciones = this.extractArray(response);
      this.isLoadingInvitaciones = false;
    },
    error: (error) => {
      this.isLoadingInvitaciones = false;

      if (error.status === 403) {
        return;
      }
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
}