import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';


import { RecoverPasswordRequest } from '../../interfaces/recover-password-request.interface';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';
import { AuthService } from '../../services/auth.services';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.css'
})
export class RecoverPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  token = '';

  recoverPasswordForm!: FormGroup;

  constructor() {
    this.recoverPasswordForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8)
          ]
        ],
        confirmPassword: ['', [Validators.required]]
      },
      {
        validators: passwordMatchValidator('newPassword', 'confirmPassword')
      }
    );

    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.errorMessage = 'El enlace de recuperación no contiene un token válido.';
    }
  }

  get newPassword() {
    return this.recoverPasswordForm.get('newPassword')!;
  }

  get confirmPassword() {
    return this.recoverPasswordForm.get('confirmPassword')!;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.token) {
      this.errorMessage = 'No se encontró el token de recuperación.';
      return;
    }

    if (this.recoverPasswordForm.invalid) {
      this.recoverPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload: RecoverPasswordRequest = {
      token: this.token,
      newPassword: this.newPassword.value
    };

    this.authService.recoverPassword(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message;
        this.recoverPasswordForm.reset();
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
          return;
        }

        this.errorMessage = error?.error?.message || 'No se pudo actualizar la contraseña.';
      }
    });
  }
  goToLogin(): void {
  this.router.navigate(['/login']);
}
}