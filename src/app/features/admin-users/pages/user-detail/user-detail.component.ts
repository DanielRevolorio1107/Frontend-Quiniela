import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { UserAdminService } from '../../services/user-admin.service';
import { User } from '../../interfaces/user.interface';
import { Role } from '../../interfaces/role.interface';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserAdminService);
  private fb = inject(FormBuilder);

  userId = 0;
  user: User | null = null;
  roles: Role[] = [];

  isLoadingUser = true;
  isLoadingRoles = false;
  isSubmittingRole = false;
  isSubmittingPassword = false;
  isDeleting = false;

  errorMessage = '';
  successMessage = '';

  showRoleSection = false;
  showPasswordSection = false;

  roleForm!: FormGroup;
  passwordForm!: FormGroup;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || id <= 0) {
      this.errorMessage = 'Identificador de usuario inválido.';
      this.isLoadingUser = false;
      return;
    }
    this.userId = id;

    this.roleForm = this.fb.group({
      roleId: [null, Validators.required],
    });

    this.passwordForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]+$/
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator('newPassword', 'confirmPassword') }
    );

    this.loadUser();
  }

  loadUser(): void {
    this.isLoadingUser = true;
    this.userService.getById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.isLoadingUser = false;
      },
      error: (error) => {
        this.isLoadingUser = false;
        this.errorMessage = this.parseError(error, 'No se pudo cargar el usuario.');
      },
    });
  }

  loadRolesIfNeeded(): void {
    if (this.roles.length > 0) {
      this.preselectCurrentRole();
      return;
    }
    this.isLoadingRoles = true;
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.isLoadingRoles = false;
        this.preselectCurrentRole();
      },
      error: (error) => {
        this.isLoadingRoles = false;
        this.errorMessage = this.parseError(error, 'No se pudieron cargar los roles.');
      },
    });
  }

  private preselectCurrentRole(): void {
    if (!this.user) return;
    const current = this.roles.find((r) => r.name === this.user!.role);
    if (current) {
      this.roleForm.patchValue({ roleId: current.id });
    }
  }

  toggleRoleSection(): void {
    this.showRoleSection = !this.showRoleSection;
    this.showPasswordSection = false;
    this.clearMessages();
    if (this.showRoleSection) {
      this.loadRolesIfNeeded();
    }
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    this.showRoleSection = false;
    this.clearMessages();
    if (!this.showPasswordSection) {
      this.passwordForm.reset();
    }
  }

  submitRole(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }
    this.isSubmittingRole = true;
    this.clearMessages();

    const roleId = Number(this.roleForm.value.roleId);

    this.userService.updateRole(this.userId, { roleId }).subscribe({
      next: (updated) => {
        this.user = updated;
        this.isSubmittingRole = false;
        this.successMessage = 'Rol actualizado correctamente.';
        this.showRoleSection = false;
      },
      error: (error) => {
        this.isSubmittingRole = false;
        this.errorMessage = this.parseError(error, 'No se pudo actualizar el rol.');
      },
    });
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.isSubmittingPassword = true;
    this.clearMessages();

    const newPassword = this.passwordForm.value.newPassword;

    this.userService.updatePassword(this.userId, { newPassword }).subscribe({
      next: () => {
        this.isSubmittingPassword = false;
        this.successMessage = 'Contraseña actualizada correctamente.';
        this.passwordForm.reset();
        this.showPasswordSection = false;
      },
      error: (error) => {
        this.isSubmittingPassword = false;
        this.errorMessage = this.parseError(error, 'No se pudo actualizar la contraseña.');
      },
    });
  }

  eliminar(): void {
    if (!this.user) return;
    const ok = confirm(`¿Eliminar al usuario ${this.user.email}? (Soft delete)`);
    if (!ok) return;

    this.isDeleting = true;
    this.clearMessages();

    this.userService.delete(this.userId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.router.navigate(['/admin/usuarios']);
      },
      error: (error) => {
        this.isDeleting = false;
        this.errorMessage = this.parseError(error, 'No se pudo eliminar el usuario.');
      },
    });
  }

  get roleId() { return this.roleForm.get('roleId')!; }
  get newPassword() { return this.passwordForm.get('newPassword')!; }
  get confirmPassword() { return this.passwordForm.get('confirmPassword')!; }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private parseError(error: any, fallback: string): string {
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
    if (error.status === 401 || error.status === 403) return 'No tienes permisos para esta acción.';
    return error?.error?.message || error?.error?.error || fallback;
  }
}