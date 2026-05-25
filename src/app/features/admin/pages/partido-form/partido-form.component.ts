import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PartidoAdminService } from '../../services/partido-admin.service';

@Component({
  selector: 'app-partido-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './partido-form.component.html',
  styleUrl: './partido-form.component.css'
})
export class PartidoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PartidoAdminService);

  id: number | null = null;
  isEdit = false;
  isLoading = false;
  isLoadingData = true;
  errorMessage = '';

  torneos: any[] = [];
  grupos: any[] = [];
  equipos: any[] = [];
  estadios: any[] = [];
  mejoresTerceros: any[] = [];


  readonly fases = [
    { id: 1, nombre: 'Fase de Grupos' },
    { id: 2, nombre: 'Dieciseisavos de Final' },
    { id: 3, nombre: 'Octavos de Final' },
    { id: 4, nombre: 'Cuartos de Final' },
    { id: 5, nombre: 'Semifinal' },
    { id: 6, nombre: 'Tercer Puesto' },
    { id: 7, nombre: 'Final' },
  ];

  form = this.fb.group({
    torneoId: [null as number | null],
    faseId: [1],
    grupoId: [null as number | null],
    equipoLocalId: [null as number | null],
    equipoVisitanteId: [null as number | null],
    descripcionLocal: [''],
    descripcionVisitante: [''],
    fechaHora: [''],
    estadioId: [null as number | null],
  });

  get esFaseGrupos(): boolean {
    return Number(this.form.value.faseId) === 1;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) { this.id = id; this.isEdit = true; }

    forkJoin({
      torneos: this.service.getTorneosSelect(),
      grupos: this.service.getGruposByTorneo(1), // carga inicial, se puede filtrar por torneo después
      equipos: this.service.getEquiposSelect(),
      estadios: this.service.getEstadiosSelect(),
    }).subscribe({
      next: ({ torneos, grupos, equipos, estadios }) => {
        this.torneos = this.toArray(torneos);
        this.grupos = this.toArray(grupos);
        this.equipos = this.toArray(equipos);
        this.estadios = this.toArray(estadios);
        this.isLoadingData = false;
        if (this.isEdit) this.loadPartido(id);
      },
      error: err => {
        this.isLoadingData = false;
        this.errorMessage = err?.error?.error || 'Error al cargar datos.';
      }
    });
    this.service.getMejoresTerceros(1).subscribe({
      next: (res: any) => { this.mejoresTerceros = this.toArray(res); },
      error: () => { } 
    });
  }

  loadPartido(id: number): void {
    this.isLoading = true;
    this.service.getById(id).subscribe({
      next: (p: any) => {
        this.form.patchValue({
          torneoId: p.torneoId || null,
          faseId: p.fase?.id || 1,
          grupoId: p.grupoId || null,
          equipoLocalId: p.equipoLocal?.id || null,
          equipoVisitanteId: p.equipoVisitante?.id || null,
          descripcionLocal: p.descripcionLocal || '',
          descripcionVisitante: p.descripcionVisitante || '',
          fechaHora: p.fechaHora ? this.toLocalInput(p.fechaHora) : '',
          estadioId: p.estadio?.id || null,
        });
        this.isLoading = false;
      },
      error: err => { this.isLoading = false; this.errorMessage = err?.error?.error || 'Error al cargar.'; }
    });
  }
  private toLocalInput(utcDate: string): string {
    const d = new Date(utcDate);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  }

  submit(): void {
    this.errorMessage = '';
    const v = this.form.value;

    if (!v.torneoId) { this.errorMessage = 'Seleccioná un torneo.'; return; }
    if (!v.fechaHora) { this.errorMessage = 'La fecha es obligatoria.'; return; }
    if (!v.estadioId) { this.errorMessage = 'El estadio es obligatorio.'; return; }

    this.isLoading = true;

    if (this.isEdit) {
      const payload = {
        equipoLocalId: v.equipoLocalId ? Number(v.equipoLocalId) : null,
        equipoVisitanteId: v.equipoVisitanteId ? Number(v.equipoVisitanteId) : null,
        descripcionLocal: v.descripcionLocal || null,
        descripcionVisitante: v.descripcionVisitante || null,
        fechaHora: new Date(v.fechaHora!).toISOString(),
        estadioId: Number(v.estadioId),
      };

      this.service.update(this.id!, payload).subscribe({
        next: () => { this.isLoading = false; this.router.navigate(['/admin/partidos']); },
        error: err => { this.isLoading = false; this.errorMessage = err?.error?.error || err?.error?.message || 'Error al actualizar.'; }
      });

    } else {
      const payload = {
        torneoId: Number(v.torneoId),
        faseId: Number(v.faseId),
        grupoId: v.grupoId ? Number(v.grupoId) : null,
        equipoLocalId: v.equipoLocalId ? Number(v.equipoLocalId) : null,
        equipoVisitanteId: v.equipoVisitanteId ? Number(v.equipoVisitanteId) : null,
        descripcionLocal: v.descripcionLocal || null,
        descripcionVisitante: v.descripcionVisitante || null,
        fechaHora: new Date(v.fechaHora!).toISOString(),
        estadioId: Number(v.estadioId),
      };

      this.service.create(payload).subscribe({
        next: () => { this.isLoading = false; this.router.navigate(['/admin/partidos']); },
        error: err => { this.isLoading = false; this.errorMessage = err?.error?.error || err?.error?.message || 'Error al crear.'; }
      });
    }
  }

  get localEsTercero(): boolean {
    const desc = this.form.value.descripcionLocal;
    return !!(desc?.includes('3º') || desc?.includes('3°'));
  }

  get visitanteEsTercero(): boolean {
    const desc = this.form.value.descripcionVisitante;
    return !!(desc?.includes('3º') || desc?.includes('3°'));
  }

  formatTercero(t: any): string {
    const dg = t.diferenciaGoles >= 0 ? `+${t.diferenciaGoles}` : `${t.diferenciaGoles}`;
    return `${t.grupoNombre} — ${t.equipoNombre} (${t.puntos} pts, ${dg})`;
  }

  private toArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    return res?.items ?? res?.data ?? [];
  }
}