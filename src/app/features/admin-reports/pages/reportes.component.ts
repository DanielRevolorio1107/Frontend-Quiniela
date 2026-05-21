import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ReporteService } from '../services/reporte.service';
import { ReporteResumen } from '../interfaces/reporte-resumen.interface';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css',
})
export class ReportesComponent implements OnInit {
  private reporteService = inject(ReporteService);

  resumen: ReporteResumen | null = null;
  isLoadingResumen = true;
  isDownloadingUsuarios = false;
  isDownloadingLigas = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadResumen();
  }

  loadResumen(): void {
    this.isLoadingResumen = true;
    this.errorMessage = '';

    this.reporteService.getResumen().subscribe({
      next: (data) => {
        this.resumen = data;
        this.isLoadingResumen = false;
      },
      error: (error) => {
        this.isLoadingResumen = false;
        this.errorMessage = this.parseError(error, 'No se pudo cargar el resumen.');
      },
    });
  }

  descargarUsuarios(): void {
    this.isDownloadingUsuarios = true;
    this.errorMessage = '';

    this.reporteService.descargarUsuarios().subscribe({
      next: (blob) => {
        this.isDownloadingUsuarios = false;
        this.triggerDownload(blob, `usuarios_${this.timestamp()}.csv`);
      },
      error: (error) => {
        this.isDownloadingUsuarios = false;
        this.errorMessage = this.parseError(error, 'No se pudo generar el reporte de usuarios.');
      },
    });
  }

  descargarLigas(): void {
    this.isDownloadingLigas = true;
    this.errorMessage = '';

    this.reporteService.descargarLigas().subscribe({
      next: (blob) => {
        this.isDownloadingLigas = false;
        this.triggerDownload(blob, `ligas_${this.timestamp()}.csv`);
      },
      error: (error) => {
        this.isDownloadingLigas = false;
        this.errorMessage = this.parseError(error, 'No se pudo generar el reporte de ligas.');
      },
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private timestamp(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  }

  private parseError(error: any, fallback: string): string {
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
    if (error.status === 401 || error.status === 403) return 'No tienes permisos para esta acción.';
    return error?.error?.error || error?.error?.message || fallback;
  }
}