import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { PredictionService } from '../../services/prediction.service';
import { PredictionUpdateRequest } from '../../../leagues/Interfaces/prediction-update-request.interface';

@Component({
  selector: 'app-prediction-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './prediction-edit.component.html',
  styleUrl: './prediction-edit.component.css'
})
export class PredictionEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private predictionService = inject(PredictionService);

  prediccionId = 0;
  prediccion: any = null;

  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  editForm!: FormGroup;

  constructor() {
    this.editForm = this.fb.group({
      golesLocal: [0, [Validators.required, Validators.min(0)]],
      golesVisitante: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || id <= 0) {
      this.errorMessage = 'El identificador de la predicción no es válido.';
      this.isLoading = false;
      return;
    }

    this.prediccionId = id;
    this.loadPrediccion();
  }

  get golesLocal() {
    return this.editForm.get('golesLocal')!;
  }

  get golesVisitante() {
    return this.editForm.get('golesVisitante')!;
  }

  loadPrediccion(): void {
    this.isLoading = true;

    this.predictionService.getPrediccionById(this.prediccionId).subscribe({
      next: (response: any) => {
        this.prediccion = response;

        this.editForm.patchValue({
          golesLocal: response?.golesLocal ?? 0,
          golesVisitante: response?.golesVisitante ?? 0
        });

        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'No se pudo cargar la predicción.';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload: PredictionUpdateRequest = {
      golesLocal: Number(this.golesLocal.value),
      golesVisitante: Number(this.golesVisitante.value)
    };

    this.predictionService.updatePrediccion(this.prediccionId, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Predicción actualizada correctamente.';
        setTimeout(() => this.router.navigate(['/predicciones/mias']), 1000);
      },
      error: (error) => {
        this.isSubmitting = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
          return;
        }

        this.errorMessage = error?.error?.error || 'No se pudo actualizar la predicción.';
      }
    });
  }

  getPartido(): string {
    const local =
      this.prediccion?.partido?.equipoLocal?.nombre ||
      this.prediccion?.partido?.equipoLocal ||
      this.prediccion?.equipoLocal ||
      'Local';

    const visitante =
      this.prediccion?.partido?.equipoVisitante?.nombre ||
      this.prediccion?.partido?.equipoVisitante ||
      this.prediccion?.equipoVisitante ||
      'Visitante';

    return `${local} vs ${visitante}`;
  }

  getFecha(): string {
    const fecha =
      this.prediccion?.partido?.fechaHora ||
      this.prediccion?.fechaHora ||
      this.prediccion?.partido?.fecha ||
      this.prediccion?.fecha;

    if (!fecha) return 'Sin fecha';

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