import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UserAdminService } from '../../services/user-admin.service';
import { CreateUserRequest } from '../../interfaces/create-user-request.interface';
import { Role } from '../../interfaces/role.interface';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.css',
})
export class UserCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserAdminService);
  private router = inject(Router);

  isLoading = false;
  isLoadingRoles = true;
  errorMessage = '';
  successMessage = '';

  roles: Role[] = [];
  createForm!: FormGroup;

  constructor() {
    this.createForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]+$/
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        roleId: [null, [Validators.required]],
      },
      {
        validators: passwordMatchValidator('password', 'confirmPassword'),
      }
    );
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoadingRoles = true;
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.isLoadingRoles = false;
      },
      error: (error) => {
        this.isLoadingRoles = false;
        this.errorMessage =
          error?.error?.message ||
          error?.error?.error ||
          'No se pudieron cargar los roles.';
      },
    });
  }

  get firstName() { return this.createForm.get('firstName')!; }
  get lastName() { return this.createForm.get('lastName')!; }
  get email() { return this.createForm.get('email')!; }
  get password() { return this.createForm.get('password')!; }
  get confirmPassword() { return this.createForm.get('confirmPassword')!; }
  get roleId() { return this.createForm.get('roleId')!; }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload: CreateUserRequest = {
      email: this.email.value.trim(),
      password: this.password.value,
      firstName: this.firstName.value.trim(),
      lastName: this.lastName.value.trim(),
      roleId: Number(this.roleId.value),
    };

    this.userService.create(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Usuario creado correctamente.';
        setTimeout(() => this.router.navigate(['/admin/usuarios']), 1000);
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
          return;
        }

        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'No tienes permisos para esta acción.';
          return;
        }

        if (error.status === 400 || error.status === 409) {
          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Datos inválidos o el email ya está en uso.';
          return;
        }

        this.errorMessage =
          error?.error?.message ||
          error?.error?.error ||
          'No se pudo crear el usuario.';
      },
    });
  }
}