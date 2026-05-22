import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminTournamentService } from '../admin/services/admin-tournament.service';

@Component({
  selector: 'app-torneo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './torneo-form.component.html',
  styleUrl: './torneo-form.component.css'
})
export class TorneoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tournamentService = inject(AdminTournamentService);

  form!: FormGroup;
  torneoId: number | null = null;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      año: [2026, [Validators.required]],
      paisSede: ['', [Validators.required]],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id && id > 0) {
      this.torneoId = id;
      this.isEditMode = true;
      this.loadTorneo(id);
      this.form.get('año')?.disable();
    }
  }

  get nombre() {
    return this.form.get('nombre')!;
  }

  get año() {
    return this.form.get('año')!;
  }

  get paisSede() {
    return this.form.get('paisSede')!;
  }

  get fechaInicio() {
    return this.form.get('fechaInicio')!;
  }

  get fechaFin() {
    return this.form.get('fechaFin')!;
  }

  loadTorneo(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tournamentService.getById(id).subscribe({
      next: (torneo: any) => {
        this.form.patchValue({
          nombre: torneo.nombre,
          año: torneo['año'] ?? torneo.anio ?? torneo.Año,
          paisSede: torneo.paisSede,
          fechaInicio: this.toInputDate(torneo.fechaInicio),
          fechaFin: this.toInputDate(torneo.fechaFin)
        });

        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'No se pudo cargar el torneo.';
      }
    });
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.fechaFin.value < this.fechaInicio.value) {
      this.errorMessage = 'La fecha de fin no puede ser menor que la fecha de inicio.';
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.torneoId) {
      const payload = {
        nombre: this.nombre.value.trim(),
        paisSede: this.paisSede.value.trim(),
        fechaInicio: this.fechaInicio.value,
        fechaFin: this.fechaFin.value
      };

      this.tournamentService.update(this.torneoId, payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/admin/torneo']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error?.error?.error || 'No se pudo actualizar el torneo.';
        }
      });

      return;
    }

    const payload = {
      nombre: this.nombre.value.trim(),
      año: Number(this.año.value),
      paisSede: this.paisSede.value.trim(),
      fechaInicio: this.fechaInicio.value,
      fechaFin: this.fechaFin.value
    };

    this.tournamentService.create(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/torneo']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'No se pudo crear el torneo.';
      }
    });
  }

  private toInputDate(dateValue: string): string {
    if (!dateValue) return '';
    return new Date(dateValue).toISOString().split('T')[0];
  }
}