import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PredictionService } from '../../services/prediction.service';
import { LeagueService } from '../../../leagues/services/league.service';

@Component({
  selector: 'app-my-predictions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './my-predictions.component.html',
  styleUrl: './my-predictions.component.css'
})
export class MyPredictionsComponent implements OnInit {
  private predictionService = inject(PredictionService);
  private leagueService = inject(LeagueService);

  ligas: any[] = [];
  selectedLigaId: number | null = null;
  selectedLiga: any = null;
  predicciones: any[] = [];

  // mapa partidoId → partido completo (para obtener banderaUrl)
  private partidoMap = new Map<number, any>();

  isLoadingLigas = true;
  isLoadingPredicciones = false;
  errorMessage = '';

  // Edición inline
  editingId: number | null = null;
  editGolesLocal = 0;
  editGolesVisitante = 0;
  editLoading = false;
  editError = '';

  ngOnInit(): void {
    this.loadMisLigas();
  }

  loadMisLigas(): void {
    this.isLoadingLigas = true;
    this.leagueService.getMisLigas(1, 100).subscribe({
      next: (response: any) => {
        this.ligas = this.toArray(response);
        this.isLoadingLigas = false;
        if (this.ligas.length === 1) {
          this.onLigaChange(this.ligas[0].id);
        }
      },
      error: (error) => {
        this.isLoadingLigas = false;
        this.errorMessage = error?.error?.error || 'No se pudieron cargar tus ligas.';
      }
    });
  }

  onLigaChange(id: number): void {
    this.selectedLigaId = id || null;
    this.selectedLiga = this.ligas.find(l => l.id === id) || null;
    this.predicciones = [];
    this.partidoMap.clear();
    this.errorMessage = '';
    this.cancelEdit();
    if (this.selectedLigaId) this.loadPredicciones();
  }

  loadPredicciones(): void {
    if (!this.selectedLigaId) return;
    this.isLoadingPredicciones = true;

    const torneoId = this.selectedLiga?.torneoId;

    const predicciones$ = this.predictionService.getMisPredicciones(this.selectedLigaId, 1, 100);
    const partidos$ = torneoId
      ? this.predictionService.getPartidosByTorneo(torneoId)
      : null;

    if (partidos$) {
      forkJoin({ predicciones: predicciones$, partidos: partidos$ }).subscribe({
        next: ({ predicciones, partidos }) => {
          const lista: any[] = this.toArray(partidos);
          for (const p of lista) {
            this.partidoMap.set(p.id, p);
          }
          this.predicciones = this.normalizePreds(this.toArray(predicciones));
          this.isLoadingPredicciones = false;
        },
        error: (error) => {
          this.isLoadingPredicciones = false;
          this.errorMessage = error?.error?.error || 'No se pudieron cargar tus predicciones.';
        }
      });
    } else {
      predicciones$.subscribe({
        next: (response: any) => {
          this.predicciones = this.normalizePreds(this.toArray(response));
          this.isLoadingPredicciones = false;
        },
        error: (error) => {
          this.isLoadingPredicciones = false;
          this.errorMessage = error?.error?.error || 'No se pudieron cargar tus predicciones.';
        }
      });
    }
  }

  // Banderas
  getLocalFlag(pred: any): string {
    return this.partidoMap.get(pred.partidoId)?.equipoLocal?.banderaUrl || '';
  }

  getVisitanteFlag(pred: any): string {
    return this.partidoMap.get(pred.partidoId)?.equipoVisitante?.banderaUrl || '';
  }

  getLocalCode(pred: any): string {
    return this.partidoMap.get(pred.partidoId)?.equipoLocal?.codigoFifa || '';
  }

  getVisitanteCode(pred: any): string {
    return this.partidoMap.get(pred.partidoId)?.equipoVisitante?.codigoFifa || '';
  }

  // Edición inline
  startEdit(pred: any): void {
    this.editingId = pred.id;
    this.editGolesLocal = pred.golesLocal ?? 0;
    this.editGolesVisitante = pred.golesVisitante ?? 0;
    this.editError = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editError = '';
    this.editLoading = false;
  }

  saveEdit(predId: number): void {
    if (this.editGolesLocal < 0 || this.editGolesVisitante < 0) {
      this.editError = 'Los goles no pueden ser negativos.';
      return;
    }

    this.editLoading = true;
    this.editError = '';

    this.predictionService.updatePrediccion(predId, {
      golesLocal: Number(this.editGolesLocal),
      golesVisitante: Number(this.editGolesVisitante)
    }).subscribe({
      next: () => {
        const pred = this.predicciones.find(p => p.id === predId);
        if (pred) {
          pred.golesLocal = Number(this.editGolesLocal);
          pred.golesVisitante = Number(this.editGolesVisitante);
        }
        this.editLoading = false;
        this.editingId = null;
      },
      error: (err) => {
        this.editLoading = false;
        this.editError = err?.error?.error || 'No se pudo actualizar. El partido puede haber comenzado.';
      }
    });
  }

  // Helpers
  canEdit(pred: any): boolean {
    return !pred.finalizado;
  }

  minutosParaPartido(pred: any): number | null {
    const partido = this.partidoMap.get(pred.partidoId);
    if (!partido?.fechaHora) return null;
    const ms = new Date(partido.fechaHora).getTime() - Date.now();
    if (ms <= 0) return null;
    return Math.floor(ms / 60000);
  }

  isMatchSoon(pred: any): boolean {
    const min = this.minutosParaPartido(pred);
    return min !== null && min <= 60;
  }

  getMatchFechaHora(pred: any): string {
    const partido = this.partidoMap.get(pred.partidoId);
    return partido?.fechaHora ? this.formatDate(partido.fechaHora) : '';
  }

  getTotalPuntos(): number {
    return this.predicciones
      .filter(p => p.finalizado)
      .reduce((sum, p) => sum + (p.puntosGanados || 0), 0);
  }

  getCountFinalizados(): number {
    return this.predicciones.filter(p => p.finalizado).length;
  }

  formatDate(fecha: string): string {
    if (!fecha) return '';
    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'America/Guatemala'
    }).format(new Date(fecha));
  }

  private toArray(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  // Normaliza el campo de puntos: la API puede devolver 'puntos' o 'puntosGanados'
  private normalizePreds(preds: any[]): any[] {
    return preds.map(p => ({
      ...p,
      puntosGanados: p.puntosGanados ?? p.puntos ?? null
    }));
  }
}
