import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PremioLiga } from '../interfaces/premio-liga.interface';
import { PremiosService } from '../../admin-premios/services/premios.service';

@Component({
  selector: 'app-liga-premios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './liga-premios.component.html',
  styleUrl: './liga-premios.component.css'
})
export class LigaPremiosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private premiosService = inject(PremiosService);

  ligaId = 0;
  premios: PremioLiga[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.ligaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.ligaId || this.ligaId <= 0) {
      this.isLoading = false;
      this.errorMessage = 'Liga inválida.';
      return;
    }

    this.loadPremios();
  }

  loadPremios(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.premiosService.getPremiosLiga(this.ligaId).subscribe({
      next: (data) => {
        this.premios = data ?? [];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'No se pudieron cargar los premios estimados.';
      }
    });
  }

  tienePremios(): boolean {
    return this.premios.some(x => x.premioAsignado !== null);
  }
}