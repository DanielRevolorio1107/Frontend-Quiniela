import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PredictionService } from '../../services/prediction.service';
import { LeagueService } from '../../../leagues/services/league.service';

@Component({
  selector: 'app-my-predictions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './my-predictions.component.html',
  styleUrl: './my-predictions.component.css'
})
export class MyPredictionsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private predictionService = inject(PredictionService);
  private leagueService = inject(LeagueService);

  filtroForm!: FormGroup;

  ligas: any[] = [];
  predicciones: any[] = [];

  isLoadingLigas = true;
  isLoadingPredicciones = false;
  errorMessage = '';

  constructor() {
    this.filtroForm = this.fb.group({
      ligaId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadMisLigas();
  }

  get ligaId() {
    return this.filtroForm.get('ligaId')!;
  }

  loadMisLigas(): void {
    this.isLoadingLigas = true;

    this.leagueService.getMisLigas(1, 100).subscribe({
      next: (response: any) => {
        this.ligas = this.extractArray(response);
        this.isLoadingLigas = false;
      },
      error: (error) => {
        this.isLoadingLigas = false;
        this.errorMessage = error?.error?.error || 'No se pudieron cargar tus ligas.';
      }
    });
  }

  buscarPredicciones(): void {
    this.errorMessage = '';
    this.predicciones = [];

    if (this.filtroForm.invalid) {
      this.filtroForm.markAllAsTouched();
      return;
    }

    this.isLoadingPredicciones = true;

    this.predictionService.getMisPredicciones(Number(this.ligaId.value), 1, 50).subscribe({
      next: (response: any) => {
        this.predicciones = this.extractArray(response);
        this.isLoadingPredicciones = false;
      },
      error: (error) => {
        this.isLoadingPredicciones = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
          return;
        }

        this.errorMessage = error?.error?.error || 'No se pudieron cargar tus predicciones.';
      }
    });
  }

  private extractArray(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  canEdit(prediccion: any): boolean {
  if (prediccion?.finalizado) {
    return false;
  }

  const fecha = prediccion?.fechaHora;
  if (!fecha) {
    return false;
  }

  const limite = new Date(fecha).getTime() - (15 * 60 * 1000);
  return Date.now() < limite;
}

  getPartido(prediccion: any): string {
    const local =
      prediccion?.partido?.equipoLocal?.nombre ||
      prediccion?.partido?.equipoLocal ||
      prediccion?.equipoLocal ||
      'Local';

    const visitante =
      prediccion?.partido?.equipoVisitante?.nombre ||
      prediccion?.partido?.equipoVisitante ||
      prediccion?.equipoVisitante ||
      'Visitante';

    return `${local} vs ${visitante}`;
  }

  getMarcador(prediccion: any): string {
    return `${prediccion?.golesLocal ?? 0} - ${prediccion?.golesVisitante ?? 0}`;
  }

  getFecha(prediccion: any): string {
  const fecha = prediccion?.fechaHora;

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
}