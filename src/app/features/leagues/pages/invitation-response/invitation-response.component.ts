import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { LeagueService } from '../../services/league.service';
import { SessionService } from '../../../../core/services/session.service';
import { LeagueInvitationResponseRequest } from '../../Interfaces/league-invitation-response-request.interface';

@Component({
  selector: 'app-invitation-response',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './invitation-response.component.html',
  styleUrl: './invitation-response.component.css'
})
export class InvitationResponseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private leagueService = inject(LeagueService);
  private sessionService = inject(SessionService);

  token = '';
  isLoading = false;
  errorMessage = '';
  done = false;

  isAuthenticated = false;
  loginUrl = '';
  registerUrl = '';

  responseForm!: FormGroup;

  ngOnInit(): void {
    this.responseForm = this.fb.group({
      nombreEquipo: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.errorMessage = 'El enlace no contiene un token válido.';
      return;
    }

    this.isAuthenticated = this.sessionService.isAuthenticated();

    const returnUrl = encodeURIComponent(`/invitacion/responder?token=${this.token}`);
    this.loginUrl = `/login?returnUrl=${returnUrl}`;
    this.registerUrl = `/register?returnUrl=${returnUrl}`;
  }

  get nombreEquipo() {
    return this.responseForm.get('nombreEquipo')!;
  }

  aceptarInvitacion(): void {
    this.errorMessage = '';

    if (this.responseForm.invalid) {
      this.responseForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload: LeagueInvitationResponseRequest = {
      token: this.token,
      aceptar: true,
      nombreEquipo: this.nombreEquipo.value.trim()
    };

    this.leagueService.respondInvitation(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.done = true;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'No se pudo aceptar la invitación.';
      }
    });
  }

  rechazarInvitacion(): void {
    this.errorMessage = '';
    this.isLoading = true;

    const payload: LeagueInvitationResponseRequest = {
      token: this.token,
      aceptar: false,
      nombreEquipo: ''
    };

    this.leagueService.respondInvitation(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'No se pudo rechazar la invitación.';
      }
    });
  }
}
