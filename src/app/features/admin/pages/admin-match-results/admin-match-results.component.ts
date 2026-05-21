import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AdminMatchService } from '../../services/admin-match.service';

@Component({
  selector: 'app-admin-match-results',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-match-results.component.html',
  styleUrl: './admin-match-results.component.css'
})
export class AdminMatchResultsComponent implements OnInit {
  private adminMatchService = inject(AdminMatchService);

  partidos: any[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  resultados: Record<number, { golesLocal: number | null; golesVisitante: number | null }> = {};

  ngOnInit(): void {
    this.loadPartidos();
  }

  loadPartidos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminMatchService.getAllPartidos(1, 100).subscribe({
      next: (response: any) => {
        this.partidos = this.extractArray(response);

        for (const partido of this.partidos) {
          this.resultados[partido.id] = {
            golesLocal: partido.golesLocal ?? null,
            golesVisitante: partido.golesVisitante ?? null
          };
        }

        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 403) {
          this.errorMessage = 'Solo un administrador del sistema puede ingresar resultados.';
          return;
        }

        if (error.status === 401) {
          this.errorMessage = 'Tu sesión no tiene permisos para esta pantalla.';
          return;
        }

        this.errorMessage = error?.error?.error || 'No se pudieron cargar los partidos.';
      }
    });
  }

  guardarResultado(partido: any): void {
    this.errorMessage = '';
    this.successMessage = '';

    const data = this.resultados[partido.id];

    if (
      data?.golesLocal === null ||
      data?.golesVisitante === null ||
      data?.golesLocal < 0 ||
      data?.golesVisitante < 0
    ) {
      this.errorMessage = 'Debes ingresar un resultado válido.';
      return;
    }

    this.adminMatchService.ingresarResultado(partido.id, {
      golesLocal: Number(data.golesLocal),
      golesVisitante: Number(data.golesVisitante)
    }).subscribe({
      next: () => {
        this.successMessage = 'Resultado oficial ingresado correctamente.';
        this.loadPartidos();
      },
      error: (error) => {
        if (error.status === 403) {
          this.errorMessage = 'Solo un administrador del sistema puede ingresar resultados.';
          return;
        }

        if (error.status === 401) {
          this.errorMessage = 'Tu sesión no tiene permisos para esta acción.';
          return;
        }

        this.errorMessage = error?.error?.error || 'No se pudo ingresar el resultado.';
      }
    });
  }

  private extractArray(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  getEquipoLocal(partido: any): string {
    return partido?.equipoLocal?.nombre || 'Equipo local';
  }

  getEquipoVisitante(partido: any): string {
    return partido?.equipoVisitante?.nombre || 'Equipo visitante';
  }

  getFecha(partido: any): string {
    if (!partido?.fechaHora) return 'Sin fecha';

    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    }).format(new Date(partido.fechaHora));
  }
}