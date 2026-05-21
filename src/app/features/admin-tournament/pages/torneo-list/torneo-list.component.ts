import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TorneoAdminService } from '../../services/torneo-admin.service';
import { Torneo } from '../../interfaces/torneo.interface';

@Component({
  selector: 'app-torneo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './torneo-list.component.html',
  styleUrl: './torneo-list.component.css',
})
export class TorneoListComponent implements OnInit {
  private torneoService = inject(TorneoAdminService);

  torneos: Torneo[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  deletingId: number | null = null;

  searchNombre = '';
  searchAnio = '';
  searchPais = '';

  ngOnInit(): void {
    this.loadTorneos();
  }

  loadTorneos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.torneoService.getAll().subscribe({
      next: (data) => { this.torneos = data; this.isLoading = false; },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.parseError(error, 'No se pudieron cargar los torneos.');
      },
    });
  }

  get filteredTorneos(): Torneo[] {
    return this.torneos.filter(t => {
      const matchNombre = !this.searchNombre ||
        t.nombre.toLowerCase().includes(this.searchNombre.toLowerCase());
      const matchAnio = !this.searchAnio || String(t['año']).includes(this.searchAnio);
      const matchPais = !this.searchPais ||
        t.paisSede.toLowerCase().includes(this.searchPais.toLowerCase());
      return matchNombre && matchAnio && matchPais;
    });
  }

  get hayFiltrosActivos(): boolean {
    return !!(this.searchNombre || this.searchAnio || this.searchPais);
  }

  clearFilters(): void {
    this.searchNombre = '';
    this.searchAnio = '';
    this.searchPais = '';
  }

  eliminar(torneo: Torneo): void {
    const ok = confirm(`¿Eliminar el torneo "${torneo.nombre}"?`);
    if (!ok) return;

    this.deletingId = torneo.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.torneoService.delete(torneo.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.successMessage = `Torneo "${torneo.nombre}" eliminado.`;
        this.loadTorneos();
      },
      error: (error) => {
        this.deletingId = null;
        this.errorMessage = this.parseError(error, 'No se pudo eliminar el torneo.');
      },
    });
  }

  private parseError(error: any, fallback: string): string {
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
    if (error.status === 401 || error.status === 403) return 'No tienes permisos.';
    return error?.error?.error || error?.error?.message || fallback;
  }
}