import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PartidoAdminService } from '../../services/partido-admin.service';

@Component({
  selector: 'app-admin-match-results',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-match-results.component.html',
  styleUrl: './admin-match-results.component.css'
})
export class AdminMatchResultsComponent implements OnInit {
  private partidoService = inject(PartidoAdminService);

  torneos: any[] = [];
  selectedTorneoId: number | null = null;
  isLoadingTorneos = true;

  partidos: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  faseActiva = 1;

  readonly fases = [
    { id: 1, nombre: 'Grupos' },
    { id: 2, nombre: 'Dieciseisavos' },
    { id: 3, nombre: 'Octavos' },
    { id: 4, nombre: 'Cuartos' },
    { id: 5, nombre: 'Semifinal' },
    { id: 6, nombre: '3er Puesto' },
    { id: 7, nombre: 'Final' },
  ];

  marcadores: Record<number, {
    local: number | null;
    visitante: number | null;
    penalesLocal: number | null;
    penalesVisitante: number | null;
  }> = {};

  savingId: number | null = null;

  // Modal mejores terceros
  showTercerosModal = false;
  terceros: any[] = [];
  isLoadingTerceros = false;
  partidoTerceroId: number | null = null;
  esTerceroLocal = false;

  ngOnInit(): void { this.loadTorneos(); }

  loadTorneos(): void {
    this.isLoadingTorneos = true;
    this.partidoService.getTorneosSelect().subscribe({
      next: (ts: any[]) => {
        this.torneos = ts || [];
        this.isLoadingTorneos = false;
        if (this.torneos.length === 1) {
          this.selectedTorneoId = this.torneos[0].id;
          this.loadPartidos();
        }
      },
      error: () => { this.isLoadingTorneos = false; }
    });
  }

  onTorneoChange(id: number): void {
    this.selectedTorneoId = id || null;
    this.partidos = [];
    this.marcadores = {};
    this.errorMessage = '';
    this.successMessage = '';
    if (this.selectedTorneoId) this.loadPartidos();
  }

  loadPartidos(): void {
    if (!this.selectedTorneoId) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.partidoService.getByTorneo(this.selectedTorneoId!).subscribe({
      next: (res: any) => {
        this.partidos = this.toArray(res).sort((a, b) => a.id - b.id);
        for (const p of this.partidos) {
          this.marcadores[p.id] = {
            local:          p.golesLocal          ?? null,
            visitante:      p.golesVisitante      ?? null,
            penalesLocal:   p.golesLocalPenales   ?? null,
            penalesVisitante: p.golesVisitantePenales ?? null,
          };
        }
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err?.error?.error || 'No se pudieron cargar los partidos.';
      }
    });
  }

  get partidosFiltrados(): any[] {
    return this.partidos.filter(p => p.fase?.id === this.faseActiva);
  }

  cambiarFase(id: number): void {
    this.faseActiva = id;
    this.successMessage = '';
    this.errorMessage = '';
  }


  esEliminatoria(partido: any): boolean {
    return partido?.fase?.id > 1;
  }

  hayEmpate(partidoId: number): boolean {
    const m = this.marcadores[partidoId];
    return m?.local !== null && m?.visitante !== null && m.local === m.visitante;
  }

  mostrarPenales(partido: any): boolean {
    return this.esEliminatoria(partido) && this.hayEmpate(partido.id) && !partido.finalizado;
  }


  actualizarEnVivo(partido: any): void {
    const m = this.marcadores[partido.id];
    if (m.local === null || m.visitante === null) return;

    this.savingId = partido.id;
    this.errorMessage = '';

    this.partidoService.actualizarMarcador(partido.id, {
      golesLocal:    Number(m.local),
      golesVisitante: Number(m.visitante)
    }).subscribe({
      next: () => {
        this.savingId = null;
        this.successMessage = `⟳ Marcador actualizado: ${this.nombreLocal(partido)} ${m.local} - ${m.visitante} ${this.nombreVisitante(partido)}`;
        this.loadPartidos();
      },
      error: err => {
        this.savingId = null;
        this.errorMessage = err?.error?.error || 'No se pudo actualizar el marcador.';
      }
    });
  }


  finalizarPartido(partido: any): void {
    const m = this.marcadores[partido.id];
    if (m.local === null || m.visitante === null) return;

    // Validar penales en eliminatorias con empate
    if (this.esEliminatoria(partido) && m.local === m.visitante) {
      if (m.penalesLocal === null || m.penalesVisitante === null) {
        this.errorMessage = 'En fases eliminatorias con empate debés ingresar el marcador de penales.';
        return;
      }
      if (Number(m.penalesLocal) === Number(m.penalesVisitante)) {
        this.errorMessage = 'El resultado de penales no puede ser empate.';
        return;
      }
    }

    const confirmar = confirm(
      `¿Finalizar ${this.nombreLocal(partido)} ${m.local} - ${m.visitante} ${this.nombreVisitante(partido)}?\n\nEsto calculará puntos y no podrá revertirse.`
    );
    if (!confirmar) return;

    this.savingId = partido.id;
    this.errorMessage = '';

    const hayEmpate = m.local === m.visitante;
    const body: any = {
      golesLocal:             Number(m.local),
      golesVisitante:         Number(m.visitante),
      golesLocalPenales:      this.esEliminatoria(partido) && hayEmpate ? Number(m.penalesLocal)    : null,
      golesVisitantePenales:  this.esEliminatoria(partido) && hayEmpate ? Number(m.penalesVisitante) : null,
    };

    this.partidoService.ingresarResultado(partido.id, body).subscribe({
      next: () => {
        this.savingId = null;
        this.successMessage = '✓ Partido finalizado correctamente.';
        this.loadPartidos();
      },
      error: err => {
        this.savingId = null;
        this.errorMessage = err?.error?.error || 'No se pudo finalizar el partido.';
      }
    });
  }


  abrirTerceros(partido: any, esLocal: boolean): void {
    this.partidoTerceroId = partido.id;
    this.esTerceroLocal   = esLocal;
    this.isLoadingTerceros = true;
    this.showTercerosModal = true;

    this.partidoService.getMejoresTerceros(this.selectedTorneoId!).subscribe({
      next: (res: any) => {
        this.terceros = this.toArray(res);
        this.isLoadingTerceros = false;
      },
      error: () => {
        this.isLoadingTerceros = false;
        this.errorMessage = 'No se pudieron cargar los mejores terceros.';
        this.showTercerosModal = false;
      }
    });
  }

  asignarTercero(equipo: any): void {
    if (!this.partidoTerceroId) return;

    const body: any = this.esTerceroLocal
      ? { equipoLocalId: equipo.equipoId }
      : { equipoVisitanteId: equipo.equipoId };

    const partido = this.partidos.find(p => p.id === this.partidoTerceroId);
    if (partido?.fechaHora) body.fechaHora = partido.fechaHora;
    if (partido?.estadio?.id) body.estadioId = partido.estadio.id;

    this.partidoService.update(this.partidoTerceroId, body).subscribe({
      next: () => {
        this.showTercerosModal = false;
        this.successMessage = `✓ ${equipo.equipoNombre} asignado correctamente.`;
        this.loadPartidos();
      },
      error: err => {
        this.errorMessage = err?.error?.error || 'No se pudo asignar el equipo.';
      }
    });
  }

  esTerceroSlot(partido: any, esLocal: boolean): boolean {
    const desc = esLocal ? partido.descripcionLocal : partido.descripcionVisitante;
    return !!(desc?.includes('3º') || desc?.includes('3°'));
  }


  nombreLocal(p: any): string {
    return p?.equipoLocal?.nombre || p?.descripcionLocal || 'Local';
  }

  nombreVisitante(p: any): string {
    return p?.equipoVisitante?.nombre || p?.descripcionVisitante || 'Visitante';
  }

  resultadoFinalizado(p: any): string {
    const base = `${p.golesLocal} — ${p.golesVisitante}`;
    if (p.golesLocalPenales != null) {
      return `${base}  (pen: ${p.golesLocalPenales}-${p.golesVisitantePenales})`;
    }
    return base;
  }

  getFecha(p: any): string {
    if (!p?.fechaHora) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
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