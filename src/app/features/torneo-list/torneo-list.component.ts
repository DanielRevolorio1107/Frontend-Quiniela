import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminTournamentService } from '../admin/services/admin-tournament.service';

@Component({
  selector: 'app-torneo-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './torneo-list.component.html',
  styleUrl: './torneo-list.component.css'
})
export class TorneoListComponent implements OnInit {
  private tournamentService = inject(AdminTournamentService);
  private router = inject(Router);

  torneos: any[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  deleteLoadingId: number | null = null;

  ngOnInit(): void {
    this.loadTorneos();
  }

  loadTorneos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.tournamentService.getAll(1, 50).subscribe({
      next: (response: any) => {
        this.torneos = this.extractArray(response).map((torneo: any) => ({
          ...torneo,
          anio: torneo['año'] ?? torneo.anio ?? torneo.Año
        }));

        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'No se pudieron cargar los torneos.';
      }
    });
  }

  editTorneo(id: number): void {
    this.router.navigate(['/admin/torneo', id, 'editar']);
  }

  configTorneo(id: number): void {
    this.router.navigate(['/admin/torneo', id, 'configurar']);
  }

  deleteTorneo(id: number): void {
    const confirmed = window.confirm('¿Deseas eliminar este torneo?');
    if (!confirmed) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.deleteLoadingId = id;

    this.tournamentService.delete(id).subscribe({
      next: () => {
        this.deleteLoadingId = null;
        this.successMessage = 'Torneo eliminado correctamente.';
        this.loadTorneos();
      },
      error: (error) => {
        this.deleteLoadingId = null;
        this.errorMessage = error?.error?.error || 'No se pudo eliminar el torneo.';
      }
    });
  }

  private extractArray(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  getFecha(fecha: string): string {
    if (!fecha) return 'N/D';

    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(fecha));
  }
}