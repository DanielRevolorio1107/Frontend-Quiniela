import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminTournamentService } from '../admin/services/admin-tournament.service';

@Component({
  selector: 'app-torneo-config',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './torneo-config.component.html',
  styleUrl: './torneo-config.component.css'
})
export class TorneoConfigComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tournamentService = inject(AdminTournamentService);

  torneoId = 0;
  torneo: any = null;

  fases: any[] = [];
  grupos: any[] = [];
  partidos: any[] = [];

  equiposDisponibles: any[] = [];
  estadiosDisponibles: any[] = [];

  activeTab: 'fases' | 'grupos' | 'partidos' = 'fases';

  faseNombre = '';
  faseOrden: number | null = null;

  grupoNombre = '';
  grupoSeleccionadoId: number | null = null;
  equipoSeleccionadoId: number | null = null;

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

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || id <= 0) {
      this.errorMessage = 'El torneo no es válido.';
      this.isLoading = false;
      return;
    }

    this.torneoId = id;
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.tournamentService.getById(this.torneoId).subscribe({
      next: (torneo: any) => {
        this.torneo = {
          ...torneo,
          anio: torneo['año'] ?? torneo.anio ?? torneo.Año
        };

        this.loadFases();
        this.loadGrupos();
        this.loadEquipos();
        this.loadEstadios();
        this.loadPartidos();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'No se pudo cargar el torneo.';
      }
    });
  }

  loadFases(): void {
    this.tournamentService.getFasesByTorneo(this.torneoId).subscribe({
      next: (response: any) => {
        this.fases = this.extractArray(response);
        this.finishLoading();
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'No se pudieron cargar las fases.';
        this.finishLoading();
      }
    });
  }

  loadGrupos(): void {
    this.tournamentService.getGruposByTorneo(this.torneoId).subscribe({
      next: (response: any) => {
        this.grupos = this.extractArray(response);
        this.finishLoading();
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'No se pudieron cargar los grupos.';
        this.finishLoading();
      }
    });
  }

  loadEquipos(): void {
    this.tournamentService.getEquiposSelect().subscribe({
      next: (response: any) => {
        this.equiposDisponibles = this.extractArray(response);
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'No se pudieron cargar los equipos.';
      }
    });
  }

  loadEstadios(): void {
    this.tournamentService.getEstadiosSelect().subscribe({
      next: (response: any) => {
        this.estadiosDisponibles = this.extractArray(response);
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'No se pudieron cargar los estadios.';
      }
    });
  }

  loadPartidos(): void {
    this.tournamentService.getPartidosByTorneo(this.torneoId).subscribe({
      next: (response: any) => {
        this.partidos = this.extractArray(response);
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'No se pudieron cargar los partidos.';
      }
    });
  }

  private finishLoading(): void {
    this.isLoading = false;
  }

  createFase(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const nombre = this.faseNombre.trim();
    const orden = Number(this.faseOrden);

    if (!nombre) {
      this.errorMessage = 'Debes ingresar el nombre de la fase.';
      return;
    }

    if (!orden || orden <= 0) {
      this.errorMessage = 'Debes ingresar un orden válido para la fase.';
      return;
    }

    this.tournamentService.createFase({
      nombre,
      orden,
      torneoId: this.torneoId
    }).subscribe({
      next: () => {
        this.successMessage = 'Fase creada correctamente.';
        this.faseNombre = '';
        this.faseOrden = null;
        this.loadFases();
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'No se pudo crear la fase.';
      }
    });
  }

  deleteFase(id: number): void {
    const confirmed = window.confirm('¿Deseas eliminar esta fase?');
    if (!confirmed) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.tournamentService.deleteFase(id).subscribe({
      next: () => {
        this.successMessage = 'Fase eliminada correctamente.';
        this.loadFases();
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'No se pudo eliminar la fase.';
      }
    });
  }

  createGrupo(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const nombre = this.grupoNombre.trim();

    if (!nombre) {
      this.errorMessage = 'Debes ingresar el nombre del grupo.';
      return;
    }

    this.tournamentService.createGrupo({
      nombre,
      torneoId: this.torneoId
    }).subscribe({
      next: () => {
        this.successMessage = 'Grupo creado correctamente.';
        this.grupoNombre = '';
        this.loadGrupos();
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'No se pudo crear el grupo.';
      }
    });
  }

  deleteGrupo(id: number): void {
    const confirmed = window.confirm('¿Deseas eliminar este grupo?');
    if (!confirmed) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.tournamentService.deleteGrupo(id).subscribe({
      next: () => {
        this.successMessage = 'Grupo eliminado correctamente.';
        this.loadGrupos();
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'No se pudo eliminar el grupo.';
      }
    });
  }

  asignarEquipoAGrupo(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.grupoSeleccionadoId || !this.equipoSeleccionadoId) {
      this.errorMessage = 'Debes seleccionar grupo y equipo.';
      return;
    }

    this.tournamentService
      .asignarEquipoAGrupo(this.grupoSeleccionadoId, this.equipoSeleccionadoId)
      .subscribe({
        next: () => {
          this.successMessage = 'Equipo asignado correctamente.';
          this.equipoSeleccionadoId = null;
          this.loadGrupos();
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'No se pudo asignar el equipo al grupo.';
        }
      });
  }

  removerEquipoDeGrupo(grupoId: number, equipoId: number): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.tournamentService.removerEquipoDeGrupo(grupoId, equipoId).subscribe({
      next: () => {
        this.successMessage = 'Equipo removido correctamente.';
        this.loadGrupos();
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'No se pudo remover el equipo del grupo.';
      }
    });
  }

  savePartido(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.partidoForm.faseId) {
      this.errorMessage = 'Debes seleccionar una fase.';
      return;
    }

    if (!this.partidoForm.estadioId) {
      this.errorMessage = 'Debes seleccionar un estadio.';
      return;
    }

    if (!this.partidoForm.fechaHora) {
      this.errorMessage = 'Debes ingresar la fecha y hora del partido.';
      return;
    }

    if (!this.partidoForm.equipoLocalId && !this.partidoForm.descripcionLocal.trim()) {
      this.errorMessage = 'Debes seleccionar equipo local o escribir descripción local.';
      return;
    }

    if (!this.partidoForm.equipoVisitanteId && !this.partidoForm.descripcionVisitante.trim()) {
      this.errorMessage = 'Debes seleccionar equipo visitante o escribir descripción visitante.';
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
      this.tournamentService.updatePartido(this.partidoEditId, {
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
        error: (error) => {
          this.errorMessage = error?.error?.error || 'No se pudo actualizar el partido.';
        }
      });

      return;
    }

    this.tournamentService.createPartido(payload).subscribe({
      next: () => {
        this.successMessage = 'Partido creado correctamente.';
        this.resetPartidoForm();
        this.loadPartidos();
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'No se pudo crear el partido.';
      }
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
    const confirmed = window.confirm('¿Deseas eliminar este partido?');
    if (!confirmed) return;

    this.errorMessage = '';
    this.successMessage = '';

    this.tournamentService.deletePartido(id).subscribe({
      next: () => {
        this.successMessage = 'Partido eliminado correctamente.';
        this.loadPartidos();
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'No se pudo eliminar el partido.';
      }
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

    const grupo = this.grupos.find((g: any) => g.id === this.partidoForm.grupoId);
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
      timeZone: 'UTC'
    }).format(new Date(fecha));
  }

  private toDateTimeLocal(dateValue: string): string {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  private extractArray(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }
}