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

  torneoId = 0;
  torneo: Torneo | null = null;
  fases: Fase[] = [];
  grupos: Grupo[] = [];
  equiposSelect: EquipoSelect[] = [];

  isLoadingTorneo = true;
  isLoadingFases = false;
  isLoadingGrupos = false;
  isLoadingEquipos = false;

  activeTab: 'fases' | 'grupos' = 'fases';

  // Búsqueda
  searchFase = '';
  searchGrupo = '';
  searchEquipoDisponible = '';

  // Fase — nueva
  showNuevaFase = false;
  nuevaFase: FaseCreate = { nombre: '', orden: 1, torneoId: 0 };
  isSubmittingFase = false;

  // Fase — edición inline
  editingFaseId: number | null = null;
  editFase = { nombre: '', orden: 1 };

  // Grupo — nuevo
  showNuevoGrupo = false;
  nuevoGrupoNombre = '';
  isSubmittingGrupo = false;

  // Grupo — edición inline
  editingGrupoId: number | null = null;
  editGrupoNombre = '';

  // Equipos
  managingEquiposGrupoId: number | null = null;
  equipoParaAsignar: number | null = null;
  isAsignando = false;

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.torneoId = Number(this.route.snapshot.paramMap.get('id'));
    this.nuevaFase.torneoId = this.torneoId;
    this.loadTorneo();
  }


  loadTorneo(): void {
    this.torneoService.getById(this.torneoId).subscribe({
      next: (t) => { this.torneo = t; this.isLoadingTorneo = false; this.loadFases(); this.loadGrupos(); },
      error: (e) => { this.isLoadingTorneo = false; this.showError(this.parseError(e, 'No se pudo cargar el torneo.')); },
    });
  }

  loadFases(): void {
    this.isLoadingFases = true;
    this.faseService.getByTorneo(this.torneoId).subscribe({
      next: (data) => { this.fases = data.sort((a, b) => a.orden - b.orden); this.isLoadingFases = false; },
      error: (e) => { this.isLoadingFases = false; this.showError(this.parseError(e, 'No se pudieron cargar las fases.')); },
    });
  }

  loadGrupos(): void {
    this.isLoadingGrupos = true;
    this.grupoService.getByTorneo(this.torneoId).subscribe({
      next: (data) => { this.grupos = data.sort((a, b) => a.nombre.localeCompare(b.nombre)); this.isLoadingGrupos = false; },
      error: (e) => { this.isLoadingGrupos = false; this.showError(this.parseError(e, 'No se pudieron cargar los grupos.')); },
    });
  }

  loadEquiposSelectIfNeeded(): void {
    if (this.equiposSelect.length > 0) return;
    this.isLoadingEquipos = true;
    this.grupoService.getEquiposSelect().subscribe({
      next: (data) => { this.equiposSelect = data; this.isLoadingEquipos = false; },
      error: () => { this.isLoadingEquipos = false; },
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
    let disponibles = this.equiposSelect.filter(e => !asignados.has(e.id));

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
      error: (e) => { this.isSubmittingFase = false; this.showError(this.parseError(e, 'No se pudo crear la fase.')); },
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
      error: (e) => { this.isSubmittingGrupo = false; this.showError(this.parseError(e, 'No se pudo crear el grupo.')); },
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

  cancelEditGrupo(): void { this.editingGrupoId = null; }

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



  toggleEquipos(grupoId: number): void {
    if (this.managingEquiposGrupoId === grupoId) {
      this.managingEquiposGrupoId = null;
    } else {
      this.managingEquiposGrupoId = grupoId;
      this.equipoParaAsignar = null;
      this.searchEquipoDisponible = '';
      this.loadEquiposSelectIfNeeded();
    }
  }

  asignarEquipo(grupoId: number): void {
    if (!this.equipoParaAsignar) return;
    this.isAsignando = true;
    this.clearMessages();

    this.grupoService.asignarEquipo(grupoId, this.equipoParaAsignar).subscribe({
      next: () => {
        const equipo = this.equiposSelect.find(e => e.id === this.equipoParaAsignar)!;
        this.grupos = this.grupos.map(g => g.id === grupoId
          ? { ...g, equipos: [...g.equipos, { ...equipo, entrenador: '', capitan: '' }] }
          : g
        );
        this.equipoParaAsignar = null;
        this.searchEquipoDisponible = '';
        this.isAsignando = false;
        this.successMessage = 'Equipo asignado correctamente.';
      },
      error: (e) => { this.isAsignando = false; this.showError(this.parseError(e, 'No se pudo asignar el equipo.')); },
    });
  }

  removerEquipo(grupoId: number, equipoId: number, equipoNombre: string): void {
    if (!confirm(`¿Remover "${equipoNombre}" del grupo?`)) return;
    this.clearMessages();

    this.grupoService.removerEquipo(grupoId, equipoId).subscribe({
      next: () => {
        this.grupos = this.grupos.map(g => g.id === grupoId
          ? { ...g, equipos: g.equipos.filter(e => e.id !== equipoId) }
          : g
        );
        this.successMessage = 'Equipo removido.';
      },
      error: (e) => this.showError(this.parseError(e, 'No se pudo remover el equipo.')),
    });
  }


  private showError(msg: string): void { this.errorMessage = msg; this.successMessage = ''; }
  private clearMessages(): void { this.errorMessage = ''; this.successMessage = ''; }
  private parseError(error: any, fallback: string): string {
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
    if (error.status === 401 || error.status === 403) return 'No tienes permisos.';
    return error?.error?.error || error?.error?.message || fallback;
  }
}