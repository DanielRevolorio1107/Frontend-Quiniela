import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { TorneoAdminService } from '../../services/torneo-admin.service';
import { FaseAdminService } from '../../services/fase-admin.service';
import { GrupoAdminService } from '../../services/grupo-admin.service';

import { Torneo } from '../../interfaces/torneo.interface';
import { Fase, FaseCreate } from '../../interfaces/fase.interface';
import { Grupo, GrupoCreate, EquipoSelect } from '../../interfaces/grupo.interface';
import { EstadioAdminService } from '../../../admin/services/estadio-admin.service';
import { PartidoAdminService } from '../../../admin/services/partido-admin.service';

@Component({
  selector: 'app-torneo-config',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './torneo-config.component.html',
  styleUrl: './torneo-config.component.css',
})
export class TorneoConfigComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private torneoService = inject(TorneoAdminService);
  private faseService = inject(FaseAdminService);
  private grupoService = inject(GrupoAdminService);
  private partidoService = inject(PartidoAdminService);
  private estadioService = inject(EstadioAdminService);

  torneoId = 0;
  torneo: Torneo | null = null;

  fases: Fase[] = [];
  grupos: Grupo[] = [];
  equiposDisponibles: EquipoSelect[] = [];
  estadiosDisponibles: any[] = [];
  partidos: any[] = [];

  isLoadingTorneo = true;
  isLoadingFases = false;
  isLoadingGrupos = false;
  isLoadingEquipos = false;
  isLoadingEstadios = false;
  isLoadingPartidos = false;

  activeTab: 'fases' | 'grupos' | 'partidos' = 'fases';

  searchFase = '';
  searchGrupo = '';
  searchEquipoDisponible = '';

  showNuevaFase = false;
  nuevaFase: FaseCreate = { nombre: '', orden: 1, torneoId: 0 };
  isSubmittingFase = false;

  editingFaseId: number | null = null;
  editFase = { nombre: '', orden: 1 };

  showNuevoGrupo = false;
  nuevoGrupoNombre = '';
  isSubmittingGrupo = false;

  editingGrupoId: number | null = null;
  editGrupoNombre = '';

  managingEquiposGrupoId: number | null = null;
  equipoParaAsignar: number | null = null;
  isAsignando = false;

  partidoEditId: number | null = null;
  partidoForm = {
    faseId: null as number | null,
    grupoId: null as number | null,
    equipoLocalId: null as number | null,
    equipoVisitanteId: null as number | null,
    descripcionLocal: '',
    descripcionVisitante: '',
    fechaHora: '',
    estadioId: null as number | null
  };

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.torneoId = Number(this.route.snapshot.paramMap.get('id'));
    this.nuevaFase.torneoId = this.torneoId;
    this.loadTorneo();
  }

  loadTorneo(): void {
    this.torneoService.getById(this.torneoId).subscribe({
      next: (t) => {
        this.torneo = t;
        this.isLoadingTorneo = false;
        this.loadFases();
        this.loadGrupos();
        this.loadEquiposSelectIfNeeded();
        this.loadEstadios();
        this.loadPartidos();
      },
      error: (e) => {
        this.isLoadingTorneo = false;
        this.showError(this.parseError(e, 'No se pudo cargar el torneo.'));
      },
    });
  }

  loadFases(): void {
    this.isLoadingFases = true;
    this.faseService.getByTorneo(this.torneoId).subscribe({
      next: (data) => {
        this.fases = data.sort((a, b) => a.orden - b.orden);
        this.isLoadingFases = false;
      },
      error: (e) => {
        this.isLoadingFases = false;
        this.showError(this.parseError(e, 'No se pudieron cargar las fases.'));
      },
    });
  }

  loadGrupos(): void {
    this.isLoadingGrupos = true;
    this.grupoService.getByTorneo(this.torneoId).subscribe({
      next: (data) => {
        this.grupos = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.isLoadingGrupos = false;
      },
      error: (e) => {
        this.isLoadingGrupos = false;
        this.showError(this.parseError(e, 'No se pudieron cargar los grupos.'));
      },
    });
  }

  loadEquiposSelectIfNeeded(): void {
    if (this.equiposDisponibles.length > 0) return;

    this.isLoadingEquipos = true;
    this.grupoService.getEquiposSelect().subscribe({
      next: (data) => {
        this.equiposDisponibles = data;
        this.isLoadingEquipos = false;
      },
      error: (e) => {
        this.isLoadingEquipos = false;
        this.showError(this.parseError(e, 'No se pudieron cargar los equipos.'));
      },
    });
  }

  loadEstadios(): void {
    this.isLoadingEstadios = true;
    this.estadioService.getSelect().subscribe({
      next: (data: any) => {
        this.estadiosDisponibles = Array.isArray(data) ? data : [];
        this.isLoadingEstadios = false;
      },
      error: (e: any) => {
        this.isLoadingEstadios = false;
        this.showError(this.parseError(e, 'No se pudieron cargar los estadios.'));
      }
    });
  }

  loadPartidos(): void {
    this.isLoadingPartidos = true;
    this.partidoService.getByTorneo(this.torneoId).subscribe({
      next: (data: any) => {
        this.partidos = Array.isArray(data) ? data : [];
        this.isLoadingPartidos = false;
      },
      error: (e: any) => {
        this.isLoadingPartidos = false;
        this.showError(this.parseError(e, 'No se pudieron cargar los partidos.'));
      }
    });
  }

  get filteredFases(): Fase[] {
    if (!this.searchFase.trim()) return this.fases;
    const q = this.searchFase.toLowerCase();
    return this.fases.filter(f => f.nombre.toLowerCase().includes(q));
  }

  get filteredGrupos(): Grupo[] {
    if (!this.searchGrupo.trim()) return this.grupos;
    const q = this.searchGrupo.toLowerCase();
    return this.grupos.filter(g => g.nombre.toLowerCase().includes(q));
  }

  equiposDisponiblesParaGrupo(grupoId: number): EquipoSelect[] {
    const grupo = this.grupos.find(g => g.id === grupoId);
    const asignados = new Set(grupo?.equipos.map(e => e.id) ?? []);
    let disponibles = this.equiposDisponibles.filter(e => !asignados.has(e.id));

    if (this.searchEquipoDisponible.trim()) {
      const q = this.searchEquipoDisponible.toLowerCase();
      disponibles = disponibles.filter(e =>
        e.nombre.toLowerCase().includes(q) || e.codigoFifa.toLowerCase().includes(q)
      );
    }

    return disponibles;
  }

  toggleNuevaFase(): void {
    this.showNuevaFase = !this.showNuevaFase;
    if (this.showNuevaFase) {
      const maxOrden = this.fases.length > 0 ? Math.max(...this.fases.map(f => f.orden)) : 0;
      this.nuevaFase = { nombre: '', orden: maxOrden + 1, torneoId: this.torneoId };
    }
  }

  crearFase(): void {
    if (!this.nuevaFase.nombre.trim()) return;
    this.isSubmittingFase = true;
    this.clearMessages();

    this.faseService.create(this.nuevaFase).subscribe({
      next: (fase) => {
        this.fases = [...this.fases, fase].sort((a, b) => a.orden - b.orden);
        this.isSubmittingFase = false;
        this.showNuevaFase = false;
        this.nuevaFase = { nombre: '', orden: 1, torneoId: this.torneoId };
        this.successMessage = 'Fase creada correctamente.';
      },
      error: (e) => {
        this.isSubmittingFase = false;
        this.showError(this.parseError(e, 'No se pudo crear la fase.'));
      },
    });
  }

  startEditFase(fase: Fase): void {
    this.editingFaseId = fase.id;
    this.editFase = { nombre: fase.nombre, orden: fase.orden };
  }

  saveEditFase(id: number): void {
    if (!this.editFase.nombre.trim()) return;
    this.clearMessages();

    this.faseService.update(id, { nombre: this.editFase.nombre, orden: this.editFase.orden }).subscribe({
      next: (updated) => {
        this.fases = this.fases.map(f => f.id === id ? updated : f).sort((a, b) => a.orden - b.orden);
        this.editingFaseId = null;
        this.successMessage = 'Fase actualizada.';
      },
      error: (e) => this.showError(this.parseError(e, 'No se pudo actualizar la fase.')),
    });
  }

  cancelEditFase(): void {
    this.editingFaseId = null;
  }

  deleteFase(id: number, nombre: string): void {
    if (!confirm(`¿Eliminar la fase "${nombre}"?`)) return;
    this.clearMessages();

    this.faseService.delete(id).subscribe({
      next: () => {
        this.fases = this.fases.filter(f => f.id !== id);
        this.successMessage = 'Fase eliminada.';
      },
      error: (e) => this.showError(this.parseError(e, 'No se pudo eliminar la fase.')),
    });
  }

  toggleNuevoGrupo(): void {
    this.showNuevoGrupo = !this.showNuevoGrupo;
    if (this.showNuevoGrupo) this.nuevoGrupoNombre = '';
  }

  crearGrupo(): void {
    if (!this.nuevoGrupoNombre.trim()) return;
    this.isSubmittingGrupo = true;
    this.clearMessages();

    const payload: GrupoCreate = { nombre: this.nuevoGrupoNombre.trim(), torneoId: this.torneoId };

    this.grupoService.create(payload).subscribe({
      next: (grupo) => {
        this.grupos = [...this.grupos, grupo].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.isSubmittingGrupo = false;
        this.showNuevoGrupo = false;
        this.nuevoGrupoNombre = '';
        this.successMessage = 'Grupo creado correctamente.';
      },
      error: (e) => {
        this.isSubmittingGrupo = false;
        this.showError(this.parseError(e, 'No se pudo crear el grupo.'));
      },
    });
  }

  startEditGrupo(grupo: Grupo): void {
    this.editingGrupoId = grupo.id;
    this.editGrupoNombre = grupo.nombre;
  }

  saveEditGrupo(id: number): void {
    if (!this.editGrupoNombre.trim()) return;
    this.clearMessages();

    this.grupoService.update(id, { nombre: this.editGrupoNombre }).subscribe({
      next: (updated) => {
        this.grupos = this.grupos.map(g => g.id === id ? { ...updated, equipos: g.equipos } : g)
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.editingGrupoId = null;
        this.successMessage = 'Grupo actualizado.';
      },
      error: (e) => this.showError(this.parseError(e, 'No se pudo actualizar el grupo.')),
    });
  }

  cancelEditGrupo(): void {
    this.editingGrupoId = null;
  }

  deleteGrupo(id: number, nombre: string): void {
    if (!confirm(`¿Eliminar el grupo "${nombre}"? Se removerán todos los equipos asignados.`)) return;
    this.clearMessages();

    this.grupoService.delete(id).subscribe({
      next: () => {
        this.grupos = this.grupos.filter(g => g.id !== id);
        if (this.managingEquiposGrupoId === id) this.managingEquiposGrupoId = null;
        this.successMessage = 'Grupo eliminado.';
      },
      error: (e) => this.showError(this.parseError(e, 'No se pudo eliminar el grupo.')),
    });
  }

  toggleEquiposGrupo(id: number): void {
    this.managingEquiposGrupoId = this.managingEquiposGrupoId === id ? null : id;
    this.equipoParaAsignar = null;
    this.searchEquipoDisponible = '';
    this.loadEquiposSelectIfNeeded();
  }

  asignarEquipoAGrupo(grupoId: number): void {
    if (!this.equipoParaAsignar) return;
    this.isAsignando = true;
    this.clearMessages();

    this.grupoService.asignarEquipo(grupoId, this.equipoParaAsignar).subscribe({
      next: (grupoActualizado) => {
        this.grupos = this.grupos.map(g => g.id === grupoId ? grupoActualizado : g)
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.isAsignando = false;
        this.equipoParaAsignar = null;
        this.successMessage = 'Equipo asignado correctamente.';
      },
      error: (e) => {
        this.isAsignando = false;
        this.showError(this.parseError(e, 'No se pudo asignar el equipo.'));
      },
    });
  }

  removerEquipoDeGrupo(grupoId: number, equipoId: number, nombreEquipo: string): void {
    if (!confirm(`¿Quitar "${nombreEquipo}" de este grupo?`)) return;
    this.clearMessages();

    this.grupoService.removerEquipo(grupoId, equipoId).subscribe({
      next: () => {
        this.loadGrupos();
        this.successMessage = 'Equipo removido del grupo.';
      },
      error: (e) => this.showError(this.parseError(e, 'No se pudo remover el equipo.')),
    });
  }

  savePartido(): void {
    this.clearMessages();

    if (!this.partidoForm.faseId) {
      this.showError('Debes seleccionar una fase.');
      return;
    }

    if (!this.partidoForm.estadioId) {
      this.showError('Debes seleccionar un estadio.');
      return;
    }

    if (!this.partidoForm.fechaHora) {
      this.showError('Debes ingresar la fecha y hora del partido.');
      return;
    }

    if (!this.partidoForm.equipoLocalId && !this.partidoForm.descripcionLocal.trim()) {
      this.showError('Debes seleccionar equipo local o escribir descripción local.');
      return;
    }

    if (!this.partidoForm.equipoVisitanteId && !this.partidoForm.descripcionVisitante.trim()) {
      this.showError('Debes seleccionar equipo visitante o escribir descripción visitante.');
      return;
    }

    const payload = {
      torneoId: this.torneoId,
      faseId: this.partidoForm.faseId,
      grupoId: this.partidoForm.grupoId || null,
      equipoLocalId: this.partidoForm.equipoLocalId || null,
      equipoVisitanteId: this.partidoForm.equipoVisitanteId || null,
      descripcionLocal: this.partidoForm.descripcionLocal.trim() || null,
      descripcionVisitante: this.partidoForm.descripcionVisitante.trim() || null,
      fechaHora: this.partidoForm.fechaHora,
      estadioId: this.partidoForm.estadioId
    };

    if (this.partidoEditId) {
      this.partidoService.update(this.partidoEditId, {
        equipoLocalId: payload.equipoLocalId,
        equipoVisitanteId: payload.equipoVisitanteId,
        descripcionLocal: payload.descripcionLocal,
        descripcionVisitante: payload.descripcionVisitante,
        fechaHora: payload.fechaHora,
        estadioId: payload.estadioId
      }).subscribe({
        next: () => {
          this.successMessage = 'Partido actualizado correctamente.';
          this.resetPartidoForm();
          this.loadPartidos();
        },
        error: (e) => this.showError(this.parseError(e, 'No se pudo actualizar el partido.'))
      });
      return;
    }

    this.partidoService.create(payload).subscribe({
      next: () => {
        this.successMessage = 'Partido creado correctamente.';
        this.resetPartidoForm();
        this.loadPartidos();
      },
      error: (e) => this.showError(this.parseError(e, 'No se pudo crear el partido.'))
    });
  }

  editPartido(partido: any): void {
    this.partidoEditId = partido.id;
    this.activeTab = 'partidos';
    this.partidoForm = {
      faseId: partido.fase?.id || null,
      grupoId: partido.grupoId || null,
      equipoLocalId: partido.equipoLocal?.id || null,
      equipoVisitanteId: partido.equipoVisitante?.id || null,
      descripcionLocal: partido.descripcionLocal || '',
      descripcionVisitante: partido.descripcionVisitante || '',
      fechaHora: this.toDateTimeLocal(partido.fechaHora),
      estadioId: partido.estadio?.id || null
    };
  }

  deletePartido(id: number): void {
    if (!confirm('¿Deseas eliminar este partido?')) return;
    this.clearMessages();

    this.partidoService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Partido eliminado correctamente.';
        this.loadPartidos();
      },
      error: (e) => this.showError(this.parseError(e, 'No se pudo eliminar el partido.'))
    });
  }

  resetPartidoForm(): void {
    this.partidoEditId = null;
    this.partidoForm = {
      faseId: null,
      grupoId: null,
      equipoLocalId: null,
      equipoVisitanteId: null,
      descripcionLocal: '',
      descripcionVisitante: '',
      fechaHora: '',
      estadioId: null
    };
  }

  getEquiposDeGrupoSeleccionado(): any[] {
    if (!this.partidoForm.grupoId) return this.equiposDisponibles;
    const grupo = this.grupos.find(g => g.id === this.partidoForm.grupoId);
    return grupo?.equipos || [];
  }

  getFechaPartido(fecha: string): string {
  if (!fecha) return 'N/D';

  return new Intl.DateTimeFormat('es-GT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Guatemala'
  }).format(new Date(fecha));
}

  private toDateTimeLocal(dateValue: string): string {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    this.successMessage = '';
  }

  private parseError(error: any, fallback: string): string {
    return error?.error?.error || fallback;
  }
}