import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UserAdminService } from '../../services/user-admin.service';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserAdminService);

  usuarios: User[] = [];

  page = 1;
  pageSize = 10;
  hasNextPage = false;

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  deletingUserId: number | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getAll(this.page, this.pageSize).subscribe({
      next: (users) => {
        this.usuarios = users;
        // Como el backend no manda totalCount, asumimos que si la página
        // viene llena podría haber más
        this.hasNextPage = users.length === this.pageSize;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
          return;
        }

        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'No tienes permisos para acceder a esta sección.';
          return;
        }

        this.errorMessage =
          error?.error?.message || error?.error?.error || 'No se pudieron cargar los usuarios.';
      }
    });
  }

  changePage(newPage: number): void {
    if (newPage < 1) return;
    if (newPage > this.page && !this.hasNextPage) return;
    this.page = newPage;
    this.loadUsers();
  }

  eliminar(usuario: User): void {
    const ok = confirm(
      `¿Eliminar al usuario ${usuario.email}? (Soft delete, se puede revertir desde el backend)`
    );
    if (!ok) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.deletingUserId = usuario.id;

    this.userService.delete(usuario.id).subscribe({
      next: () => {
        this.deletingUserId = null;
        this.successMessage = `Usuario ${usuario.email} eliminado correctamente.`;
        // Si era el último de la página y no estamos en la primera, retrocedemos
        if (this.usuarios.length === 1 && this.page > 1) {
          this.page--;
        }
        this.loadUsers();
      },
      error: (error) => {
        this.deletingUserId = null;

        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'No tienes permisos para esta acción.';
          return;
        }

        this.errorMessage =
          error?.error?.message || error?.error?.error || 'No se pudo eliminar el usuario.';
      }
    });
  }
}