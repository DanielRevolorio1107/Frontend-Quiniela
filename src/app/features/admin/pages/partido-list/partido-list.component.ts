import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PartidoAdminService } from '../../services/partido-admin.service';

@Component({
  selector: 'app-partido-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './partido-list.component.html',
  styleUrl: './partido-list.component.css'
})
export class PartidoListComponent implements OnInit {
  private service = inject(PartidoAdminService);
  private router = inject(Router);

  readonly TORNEO_ID = 1;

  partidos: any[] = [];
  filtrados: any[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  faseActiva = 0; // 0 = todos

  readonly fases = [
    { id: 0, nombre: 'Todos' },
    { id: 1, nombre: 'Grupos' },
    { id: 2, nombre: 'Dieciseisavos' },
    { id: 3, nombre: 'Octavos' },
    { id: 4, nombre: 'Cuartos' },
    { id: 5, nombre: 'Semifinal' },
    { id: 6, nombre: '3er Puesto' },
    { id: 7, nombre: 'Final' },
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.service.getByTorneo(this.TORNEO_ID).subscribe({
      next: (res: any) => {
        this.partidos = this.toArray(res).sort((a, b) => a.id - b.id);
        this.filter();
        this.isLoading = false;
      },
      error: err => { this.isLoading = false; this.errorMessage = err?.error?.error || 'Error al cargar.'; }
    });
  }

  filter(): void {
    this.filtrados = this.faseActiva === 0
      ? this.partidos
      : this.partidos.filter(p => p.fase?.id === this.faseActiva);
  }

  cambiarFase(id: number): void { this.faseActiva = id; this.filter(); }

  crear(): void { this.router.navigate(['/admin/partidos/crear']); }
  editar(id: number): void { this.router.navigate(['/admin/partidos', id, 'editar']); }

  eliminar(id: number, desc: string): void {
    if (!confirm(`¿Eliminar partido "${desc}"?`)) return;
    this.errorMessage = '';
    this.successMessage = '';
    this.service.delete(id).subscribe({
      next: () => { this.successMessage = 'Partido eliminado.'; this.load(); },
      error: err => { this.errorMessage = err?.error?.error || 'No se pudo eliminar.'; }
    });
  }

  nombreLocal(p: any): string {
    return p?.equipoLocal?.nombre || p?.descripcionLocal || '—';
  }

  nombreVisitante(p: any): string {
    return p?.equipoVisitante?.nombre || p?.descripcionVisitante || '—';
  }

  getFecha(p: any): string {
    if (!p?.fechaHora) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true, //timeZone: 'UTC'
    }).format(new Date(p.fechaHora));
  }

  estadoBadge(p: any): string {
    if (p.finalizado) return 'finalizado';
    if (p.golesLocal !== null) return 'en-vivo';
    return 'pendiente';
  }

  estadoLabel(p: any): string {
    if (p.finalizado) return 'Finalizado';
    if (p.golesLocal !== null) return 'En curso';
    return 'Pendiente';
  }

  private toArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    return res?.items ?? res?.data ?? [];
  }
}