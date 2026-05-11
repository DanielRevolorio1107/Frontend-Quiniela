import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';


import { ForgotPasswordRequest } from '../../interfaces/forgot-password-request.interface';
import { AuthService } from '../../services/auth.services';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  forgotPasswordForm!: FormGroup;

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email')!;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload: ForgotPasswordRequest = {
      email: this.email.value.trim()
    };

    this.authService.forgotPassword(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message;
        this.forgotPasswordForm.reset();
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
          return;
        }

        this.errorMessage = error?.error?.message || 'Ocurrió un error al procesar la solicitud.';
      }
    });
  }
}