import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TorneoAdminService } from '../../services/torneo-admin.service';
import { TorneoCreate, TorneoUpdate } from '../../interfaces/torneo.interface';

@Component({
  selector: 'app-torneo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './torneo-form.component.html',
  styleUrl: './torneo-form.component.css',
})
export class TorneoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private torneoService = inject(TorneoAdminService);

  torneoId: number | null = null;
  isEditMode = false;
  isLoadingTorneo = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  form!: FormGroup;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.torneoId = Number(id); this.isEditMode = true; }

    this.form = this.fb.group({
      nombre:     ['', [Validators.required, Validators.minLength(3)]],
      año:        [{ value: new Date().getFullYear(), disabled: this.isEditMode },
                   [Validators.required, Validators.min(2000), Validators.max(2100)]],
      paisSede:   ['', Validators.required],
      fechaInicio:['', Validators.required],
      fechaFin:   ['', Validators.required],
    });

    if (this.isEditMode && this.torneoId) this.loadTorneo(this.torneoId);
  }

  loadTorneo(id: number): void {
    this.isLoadingTorneo = true;
    this.torneoService.getById(id).subscribe({
      next: (t) => {
        this.form.patchValue({
          nombre: t.nombre,
          año: t['año'],
          paisSede: t.paisSede,
          fechaInicio: t.fechaInicio?.substring(0, 10) ?? '',
          fechaFin: t.fechaFin?.substring(0, 10) ?? '',
        });
        this.isLoadingTorneo = false;
      },
      error: (error) => {
        this.isLoadingTorneo = false;
        this.errorMessage = this.parseError(error, 'No se pudo cargar el torneo.');
      },
    });
  }

  get nombre()      { return this.form.get('nombre')!; }
  get anio()        { return this.form.get('año')!; }
  get paisSede()    { return this.form.get('paisSede')!; }
  get fechaInicio() { return this.form.get('fechaInicio')!; }
  get fechaFin()    { return this.form.get('fechaFin')!; }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading = true;

    if (this.isEditMode && this.torneoId) {
      const payload: TorneoUpdate = {
        nombre: this.nombre.value,
        paisSede: this.paisSede.value,
        fechaInicio: this.fechaInicio.value,
        fechaFin: this.fechaFin.value,
      };
      this.torneoService.update(this.torneoId, payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Torneo actualizado correctamente.';
          setTimeout(() => this.router.navigate(['/admin/torneo']), 1000);
        },
        error: (e) => { this.isLoading = false; this.errorMessage = this.parseError(e, 'No se pudo actualizar.'); },
      });
    } else {
      const payload: TorneoCreate = {
        nombre: this.nombre.value,
        año: Number(this.anio.value),
        paisSede: this.paisSede.value,
        fechaInicio: this.fechaInicio.value,
        fechaFin: this.fechaFin.value,
      };
      this.torneoService.create(payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Torneo creado correctamente.';
          setTimeout(() => this.router.navigate(['/admin/torneo']), 1000);
        },
        error: (e) => { this.isLoading = false; this.errorMessage = this.parseError(e, 'No se pudo crear.'); },
      });
    }
  }

  private parseError(error: any, fallback: string): string {
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
    if (error.status === 401 || error.status === 403) return 'No tienes permisos.';
    return error?.error?.error || error?.error?.message || fallback;
  }
}