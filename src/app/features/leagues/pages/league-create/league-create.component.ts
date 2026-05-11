import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { LeagueService } from '../../services/league.service';
import { CreateLeagueRequest } from '../../Interfaces/create-league-request.interface';

@Component({
  selector: 'app-league-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './league-create.component.html',
  styleUrl: './league-create.component.css'
})
export class LeagueCreateComponent {
  private fb = inject(FormBuilder);
  private leagueService = inject(LeagueService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  leagueForm!: FormGroup;

  constructor() {
    this.leagueForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      esDeApuestas: [false, [Validators.required]],
      precioPorUnirse: [null],
      torneoId: [1, [Validators.required, Validators.min(1)]],
      nombreEquipo: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  get nombre() {
    return this.leagueForm.get('nombre')!;
  }

  get esDeApuestas() {
    return this.leagueForm.get('esDeApuestas')!;
  }

  get precioPorUnirse() {
    return this.leagueForm.get('precioPorUnirse')!;
  }

  get torneoId() {
    return this.leagueForm.get('torneoId')!;
  }

  get nombreEquipo() {
    return this.leagueForm.get('nombreEquipo')!;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.leagueForm.invalid) {
      this.leagueForm.markAllAsTouched();
      return;
    }

    const esDeApuestas = this.esDeApuestas.value === true;
    const precio = this.precioPorUnirse.value;

    if (esDeApuestas && (precio === null || precio === '' || Number(precio) <= 0)) {
      this.errorMessage = 'Debes ingresar un precio válido para una liga de apuestas.';
      return;
    }

    this.isLoading = true;

    const payload: CreateLeagueRequest = {
      nombre: this.nombre.value.trim(),
      esDeApuestas: esDeApuestas,
      precioPorUnirse: esDeApuestas ? Number(precio) : null,
      torneoId: Number(this.torneoId.value),
      nombreEquipo: this.nombreEquipo.value.trim()
    };

    this.leagueService.create(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'Liga creada correctamente.';

        const ligaId = response?.id;
        if (ligaId) {
          setTimeout(() => this.router.navigate(['/ligas', ligaId]), 1000);
        }
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
          return;
        }

        this.errorMessage = error?.error?.error || 'No se pudo crear la liga.';
      }
    });
  }
}