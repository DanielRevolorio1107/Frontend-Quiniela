import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { SessionService } from '../../../../core/services/session.service';
import { AuthService } from '../../services/auth.services';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  user: any = null;
  isLoading = true;
  errorMessage = '';

  // Change password
  passwordForm: FormGroup = this.fb.group({
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator('newPassword', 'confirmPassword') });

  isSavingPassword = false;
  passwordSuccess = '';
  passwordError = '';

  get newPassword()     { return this.passwordForm.get('newPassword')!; }
  get confirmPassword() { return this.passwordForm.get('confirmPassword')!; }

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (r: any) => { this.user = r; this.isLoading = false; },
      error: () => { this.errorMessage = 'No se pudo cargar la información del usuario.'; this.isLoading = false; }
    });
  }

  changePassword(): void {
    this.passwordSuccess = '';
    this.passwordError = '';
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }

    const userId = this.user?.id;
    if (!userId) { this.passwordError = 'No se pudo identificar tu usuario.'; return; }

    this.isSavingPassword = true;
    this.authService.changeOwnPassword(userId, this.newPassword.value).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.passwordSuccess = 'Contraseña actualizada correctamente.';
        this.passwordForm.reset();
      },
      error: (e) => {
        this.isSavingPassword = false;
        this.passwordError = e?.error?.error || 'No se pudo actualizar la contraseña.';
      }
    });
  }

  logout(): void {
    this.authService.logoutApi().subscribe({
      next: () => { this.sessionService.clearSession(); this.router.navigate(['/login']); },
      error: () => { this.sessionService.clearSession(); this.router.navigate(['/login']); }
    });
  }
}
