import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PredictionService } from '../../services/prediction.service';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './match-list.component.html',
  styleUrl: './match-list.component.css'
})
export class MatchListComponent {
  private fb = inject(FormBuilder);
  private predictionService = inject(PredictionService);

  filtroForm!: FormGroup;

  partidos: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.filtroForm = this.fb.group({
      torneoId: [1, [Validators.required, Validators.min(1)]]
    });
  }

  get torneoId() {
    return this.filtroForm.get('torneoId')!;
  }

  buscarPartidos(): void {
    this.errorMessage = '';
    this.partidos = [];

    if (this.filtroForm.invalid) {
      this.filtroForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.predictionService.getPartidosPendientes(Number(this.torneoId.value)).subscribe({
      next: (response: any) => {
        this.partidos = this.extractArray(response);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
          return;
        }

        this.errorMessage = error?.error?.error || 'No se pudieron cargar los partidos pendientes.';
      }
    });
  }

  private extractArray(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.items)) {
      return response.items;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
  }

  getEquipoLocal(partido: any): string {
    return partido?.equipoLocal?.nombre || partido?.equipoLocal || partido?.local || 'Equipo local';
  }

  getEquipoVisitante(partido: any): string {
    return partido?.equipoVisitante?.nombre || partido?.equipoVisitante || partido?.visitante || 'Equipo visitante';
  }

  getFecha(partido: any): string {
  const fecha = partido?.fechaHora || partido?.fecha || partido?.fechaPartido;

  if (!fecha) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-GT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  }).format(new Date(fecha));
}

  getEstado(partido: any): string {
    return partido?.estado || 'Pendiente';
  }
}