import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EstadioAdminService } from '../admin/services/estadio-admin.service';

@Component({
  selector: 'app-estadio-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './estadio-list.component.html',
  styleUrl: './estadio-list.component.css'
})
export class EstadioListComponent implements OnInit {
  private estadioService = inject(EstadioAdminService);
  private router = inject(Router);

  estadios: any[] = [];
  estadiosFiltrados: any[] = [];

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  searchNombre = '';
  searchPais = '';
  searchCiudad = '';

  ngOnInit(): void {
    this.loadEstadios();
  }

  loadEstadios(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.estadioService.getAll(1, 100).subscribe({
      next: (response: any) => {
        this.estadios = this.extractArray(response);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'No se pudieron cargar los estadios.';
      }
    });
  }

  applyFilters(): void {
    const nombre = this.searchNombre.trim().toLowerCase();
    const pais = this.searchPais.trim().toLowerCase();
    const ciudad = this.searchCiudad.trim().toLowerCase();

    this.estadiosFiltrados = this.estadios.filter((e: any) => {
      const matchNombre = !nombre || (e.nombre || '').toLowerCase().includes(nombre);
      const matchPais = !pais || (e.pais || '').toLowerCase().includes(pais);
      const matchCiudad = !ciudad || (e.ciudad || '').toLowerCase().includes(ciudad);
      return matchNombre && matchPais && matchCiudad;
    });
  }

  createEstadio(): void {
    this.router.navigate(['/admin/estadios/crear']);
  }

  editEstadio(id: number): void {
    this.router.navigate(['/admin/estadios', id, 'editar']);
  }

  deleteEstadio(id: number, nombre: string): void {
    const confirmed = window.confirm(`¿Deseas eliminar el estadio "${nombre}"?`);
    if (!confirmed) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.estadioService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Estadio eliminado correctamente.';
        this.loadEstadios();
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'No se pudo eliminar el estadio.';
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