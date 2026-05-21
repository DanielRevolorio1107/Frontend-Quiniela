import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { LeagueService } from '../../services/league.service';
import { LeagueInvitationResponseRequest } from '../../Interfaces/league-invitation-response-request.interface';

@Component({
  selector: 'app-invitation-response',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './invitation-response.component.html',
  styleUrl: './invitation-response.component.css'
})
export class InvitationResponseComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private leagueService = inject(LeagueService);

  token = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  responseForm!: FormGroup;

  constructor() {
    this.responseForm = this.fb.group({
      nombreEquipo: ['', [Validators.minLength(2)]]
    });

    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.errorMessage = 'El enlace no contiene un token válido.';
    }
  }

  get nombreEquipo() {
    return this.responseForm.get('nombreEquipo')!;
  }

  aceptarInvitacion(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.token) {
      this.errorMessage = 'No se encontró el token de invitación.';
      return;
    }

    const nombreEquipo = this.nombreEquipo.value?.trim() || '';

    if (nombreEquipo.length < 2) {
      this.nombreEquipo.markAsTouched();
      this.errorMessage = 'Debes ingresar un nombre de equipo válido para aceptar la invitación.';
      return;
    }

    this.isLoading = true;

    const payload: LeagueInvitationResponseRequest = {
      token: this.token,
      aceptar: true,
      nombreEquipo
    };

    this.leagueService.respondInvitation(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Invitación aceptada correctamente.';
        this.responseForm.reset();
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
          return;
        }

        this.errorMessage = error?.error?.error || 'No se pudo aceptar la invitación.';
      }
    });
  }

  rechazarInvitacion(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.token) {
      this.errorMessage = 'No se encontró el token de invitación.';
      return;
    }

    this.isLoading = true;

    const payload: LeagueInvitationResponseRequest = {
      token: this.token,
      aceptar: false,
      nombreEquipo: ''
    };

    this.leagueService.respondInvitation(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Invitación rechazada correctamente.';
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
          return;
        }

        this.errorMessage = error?.error?.error || 'No se pudo rechazar la invitación.';
      }
    });
  }
}