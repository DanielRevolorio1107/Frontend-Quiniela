import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { LeagueService } from '../../services/league.service';
import { CreateLeagueRequest } from '../../Interfaces/create-league-request.interface';

@Component({
  selector: 'app-league-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './league-create.component.html',
  styleUrl: './league-create.component.css'
})
export class LeagueCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private leagueService = inject(LeagueService);
  private router = inject(Router);

  torneos: any[] = [];
  isLoadingTorneos = true;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  leagueForm: FormGroup = this.fb.group({
    nombre:          ['', [Validators.required, Validators.minLength(3)]],
    esDeApuestas:    [false, Validators.required],
    precioPorUnirse: [null],
    torneoId:        [null, Validators.required],
    nombreEquipo:    ['', [Validators.required, Validators.minLength(2)]]
  });

  ngOnInit(): void {
    this.leagueService.getTorneosSelect().subscribe({
      next: (res: any) => {
        this.torneos = Array.isArray(res) ? res : [];
        this.isLoadingTorneos = false;
        if (this.torneos.length === 1) {
          this.leagueForm.patchValue({ torneoId: this.torneos[0].id });
        }
      },
      error: () => { this.isLoadingTorneos = false; }
    });
  }

  get nombre()          { return this.leagueForm.get('nombre')!; }
  get esDeApuestas()    { return this.leagueForm.get('esDeApuestas')!; }
  get precioPorUnirse() { return this.leagueForm.get('precioPorUnirse')!; }
  get torneoId()        { return this.leagueForm.get('torneoId')!; }
  get nombreEquipo()    { return this.leagueForm.get('nombreEquipo')!; }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.leagueForm.invalid) {
      this.leagueForm.markAllAsTouched();
      return;
    }

    const esDeApuestas = this.esDeApuestas.value === true;
    const precio = this.precioPorUnirse.value;

    if (esDeApuestas && (!precio || Number(precio) <= 0)) {
      this.errorMessage = 'Debes ingresar un precio válido para una liga de apuestas.';
      return;
    }

    this.isLoading = true;

    const payload: CreateLeagueRequest = {
      nombre:          this.nombre.value.trim(),
      esDeApuestas,
      precioPorUnirse: esDeApuestas ? Number(precio) : null,
      torneoId:        Number(this.torneoId.value),
      nombreEquipo:    this.nombreEquipo.value.trim()
    };

    this.leagueService.create(payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = '¡Liga creada correctamente!';
        const ligaId = response?.id;
        if (ligaId) {
          setTimeout(() => this.router.navigate(['/ligas', ligaId]), 1200);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.status === 0
          ? 'No se pudo conectar con el servidor.'
          : (error?.error?.error || 'No se pudo crear la liga.');
      }
    });
  }
}
