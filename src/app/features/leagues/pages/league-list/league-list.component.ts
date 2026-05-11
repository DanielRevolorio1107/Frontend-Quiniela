import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LeagueService } from '../../services/league.service';

@Component({
  selector: 'app-league-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './league-list.component.html',
  styleUrl: './league-list.component.css'
})
export class LeagueListComponent implements OnInit {
  private leagueService = inject(LeagueService);

  ligas: any[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadMisLigas();
  }

  loadMisLigas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.leagueService.getMisLigas(1, 10).subscribe({
      next: (response: any) => {
        this.ligas = this.extractLigas(response);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor.';
          return;
        }

        this.errorMessage = error?.error?.error || 'No se pudieron cargar tus ligas.';
      }
    });
  }

  private extractLigas(response: any): any[] {
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