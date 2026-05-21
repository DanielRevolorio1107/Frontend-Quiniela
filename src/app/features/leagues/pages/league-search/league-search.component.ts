import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { LeagueService } from '../../services/league.service';

@Component({
  selector: 'app-league-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './league-search.component.html',
  styleUrl: './league-search.component.css'
})
export class LeagueSearchComponent {
  private fb = inject(FormBuilder);
  private leagueService = inject(LeagueService);

  searchForm!: FormGroup;

  resultados: any[] = [];
  teamNames: Record<number, string> = {};

  isLoading = false;
  joinLoadingLeagueId: number | null = null;

  errorMessage = '';
  successMessage = '';

  constructor() {
    this.searchForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  get nombre() {
    return this.searchForm.get('nombre')!;
  }

  onSearch(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.resultados = [];

    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const nombre = this.nombre.value.trim();

    this.leagueService.search(nombre, 1, 10).subscribe({
      next: (response: any) => {
        this.resultados = this.extractArray(response);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
          return;
        }

        this.errorMessage = error?.error?.error || 'No se pudieron buscar ligas.';
      }
    });
  }

  unirseALiga(ligaId: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    const nombreEquipo = (this.teamNames[ligaId] || '').trim();

    if (!nombreEquipo || nombreEquipo.length < 2) {
      this.errorMessage = 'Debes ingresar un nombre de equipo válido para unirte.';
      return;
    }

    this.joinLoadingLeagueId = ligaId;

    this.leagueService.unirse(ligaId, { nombreEquipo }).subscribe({
      next: () => {
        this.successMessage = 'Solicitud enviada correctamente. Quedó pendiente de aprobación.';
        this.joinLoadingLeagueId = null;
        this.teamNames[ligaId] = '';
      },
      error: (error) => {
        this.joinLoadingLeagueId = null;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
          return;
        }

        this.errorMessage = error?.error?.error || 'No se pudo enviar la solicitud para unirse.';
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

  getTipoLiga(liga: any): string {
    return liga?.esDeApuestas ? 'Apuestas' : 'Diversión';
  }
}