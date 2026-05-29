import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
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
  private router = inject(Router);

  ligas: any[] = [];
  torneos: any[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      ligas:   this.leagueService.getMisLigas(1, 50),
      torneos: this.leagueService.getTorneosSelect()
    }).subscribe({
      next: ({ ligas, torneos }) => {
        this.ligas   = this.toArray(ligas);
        this.torneos = Array.isArray(torneos) ? torneos : [];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.status === 0
          ? 'No se pudo conectar con el servidor.'
          : (error?.error?.error || 'No se pudieron cargar tus ligas.');
      }
    });
  }

  getTorneoNombre(torneoId: number): string {
    const t = this.torneos.find(t => t.id === torneoId);
    return t?.nombre || `Torneo #${torneoId}`;
  }

  getTipoLabel(liga: any): string {
    return liga.esDeApuestas ? '💰 Apuestas' : '🎮 Diversión';
  }

  getPrecioLabel(liga: any): string {
    if (!liga.esDeApuestas || !liga.precioPorUnirse) return '';
    return `Q ${Number(liga.precioPorUnirse).toFixed(2)} por miembro`;
  }

  goToPredict(torneoId: number): void {
    this.router.navigate(['/partidos'], { queryParams: { torneo: torneoId } });
  }

  private toArray(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }
}
