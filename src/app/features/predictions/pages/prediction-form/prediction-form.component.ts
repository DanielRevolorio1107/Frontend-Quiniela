import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { PredictionService } from '../../services/prediction.service';
import { LeagueService } from '../../../leagues/services/league.service';
import { PredictionCreateRequest } from '../../../leagues/Interfaces/prediction-create-request.interface';

@Component({
  selector: 'app-prediction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './prediction-form.component.html',
  styleUrl: './prediction-form.component.css'
})
export class PredictionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private predictionService = inject(PredictionService);
  private leagueService = inject(LeagueService);

  partidoId = 0;
  partido: any = null;
  ligas: any[] = [];

  isLoadingPartido = true;
  isLoadingLigas = true;
  isSubmitting = false;

  errorMessage = '';
  successMessage = '';

  predictionForm!: FormGroup;

  constructor() {
    this.predictionForm = this.fb.group({
      ligaId: ['', [Validators.required]],
      golesLocal: [0, [Validators.required, Validators.min(0)]],
      golesVisitante: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('partidoId'));

    if (!id || id <= 0) {
      this.errorMessage = 'El identificador del partido no es válido.';
      this.isLoadingPartido = false;
      this.isLoadingLigas = false;
      return;
    }

    this.partidoId = id;
    this.loadPartido();
    this.loadMisLigas();
  }

  get ligaId() {
    return this.predictionForm.get('ligaId')!;
  }

  get golesLocal() {
    return this.predictionForm.get('golesLocal')!;
  }

  get golesVisitante() {
    return this.predictionForm.get('golesVisitante')!;
  }

  loadPartido(): void {
    this.isLoadingPartido = true;

    this.predictionService.getPartidoById(this.partidoId).subscribe({
      next: (response: any) => {
        this.partido = response;
        this.isLoadingPartido = false;
      },
      error: (error) => {
        this.isLoadingPartido = false;
        this.errorMessage = error?.error?.error || 'No se pudo cargar el partido.';
      }
    });
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

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.predictionForm.invalid) {
      this.predictionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload: PredictionCreateRequest = {
      partidoId: this.partidoId,
      ligaId: Number(this.ligaId.value),
      golesLocal: Number(this.golesLocal.value),
      golesVisitante: Number(this.golesVisitante.value)
    };

    this.predictionService.createPrediccion(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Predicción registrada correctamente.';
        setTimeout(() => this.router.navigate(['/partidos']), 1000);
      },
      error: (error) => {
        this.isSubmitting = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
          return;
        }

        this.errorMessage = error?.error?.error || 'No se pudo registrar la predicción.';
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

  getEquipoLocal(): string {
    return this.partido?.equipoLocal?.nombre || this.partido?.equipoLocal || this.partido?.local || 'Equipo local';
  }

  getEquipoVisitante(): string {
    return this.partido?.equipoVisitante?.nombre || this.partido?.equipoVisitante || this.partido?.visitante || 'Equipo visitante';
  }

  localFlag(): string {
    return this.partido?.equipoLocal?.banderaUrl || this.partido?.equipoLocal?.flagUrl || '';
  }

  visitanteFlag(): string {
    return this.partido?.equipoVisitante?.banderaUrl || this.partido?.equipoVisitante?.flagUrl || '';
  }

  localCode(): string {
    return this.partido?.equipoLocal?.codigoFifa || this.partido?.equipoLocal?.codigo || '';
  }

  visitanteCode(): string {
    return this.partido?.equipoVisitante?.codigoFifa || this.partido?.equipoVisitante?.codigo || '';
  }

  getEstadio(): string {
    const est = this.partido?.estadio;
    if (!est) return '';
    if (typeof est === 'string') return est;
    return est.nombre || est.name || '';
  }

  getFase(): string {
    const fase = this.partido?.fase;
    if (!fase) return '';
    if (typeof fase === 'string') return fase;
    const nombres: Record<number, string> = {
      1: 'Fase de Grupos', 2: 'Dieciseisavos', 3: 'Octavos de Final',
      4: 'Cuartos de Final', 5: 'Semifinal', 6: 'Tercer Puesto', 7: 'Final'
    };
    return nombres[fase.id] || fase.nombre || `Fase ${fase.id}`;
  }

  getFecha(): string {
    const fecha = this.partido?.fechaHora || this.partido?.fecha || this.partido?.fechaPartido;

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