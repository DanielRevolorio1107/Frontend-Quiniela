import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EquipoAdminService } from '../admin/services/equipo-admin.service';

@Component({
  selector: 'app-equipo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './equipo-list.component.html',
  styleUrl: './equipo-list.component.css'
})
export class EquipoListComponent implements OnInit {
  private equipoService = inject(EquipoAdminService);
  private router = inject(Router);

  equipos: any[] = [];
  equiposFiltrados: any[] = [];

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  searchNombre = '';
  searchCodigo = '';
  searchEntrenador = '';

  ngOnInit(): void {
    this.loadEquipos();
  }

  loadEquipos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.equipoService.getAll(1, 200).subscribe({
      next: (response: any) => {
        this.equipos = this.extractArray(response);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'No se pudieron cargar los equipos.';
      }
    });
  }

  applyFilters(): void {
    const nombre = this.searchNombre.trim().toLowerCase();
    const codigo = this.searchCodigo.trim().toLowerCase();
    const entrenador = this.searchEntrenador.trim().toLowerCase();

    this.equiposFiltrados = this.equipos.filter((e: any) => {
      const matchNombre = !nombre || (e.nombre || '').toLowerCase().includes(nombre);
      const matchCodigo = !codigo || (e.codigoFifa || '').toLowerCase().includes(codigo);
      const matchEntrenador = !entrenador || (e.entrenador || '').toLowerCase().includes(entrenador);
      return matchNombre && matchCodigo && matchEntrenador;
    });
  }

  createEquipo(): void {
    this.router.navigate(['/admin/equipos/crear']);
  }

  editEquipo(id: number): void {
    this.router.navigate(['/admin/equipos', id, 'editar']);
  }

  deleteEquipo(id: number, nombre: string): void {
    const confirmed = window.confirm(`¿Deseas eliminar el equipo "${nombre}"?`);
    if (!confirmed) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.equipoService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Equipo eliminado correctamente.';
        this.loadEquipos();
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'No se pudo eliminar el equipo.';
      }
    });
  }

  private extractArray(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }
}