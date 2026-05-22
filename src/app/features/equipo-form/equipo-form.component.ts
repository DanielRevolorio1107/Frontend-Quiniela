import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EquipoAdminService } from '../admin/services/equipo-admin.service';

@Component({
  selector: 'app-equipo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './equipo-form.component.html',
  styleUrl: './equipo-form.component.css'
})
export class EquipoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private equipoService = inject(EquipoAdminService);

  equipoId: number | null = null;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    codigoFifa: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(5)]],
    banderaUrl: [''],
    entrenador: [''],
    capitan: ['']
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id && id > 0) {
      this.equipoId = id;
      this.isEditMode = true;
      this.loadEquipo(id);
    }
  }

  loadEquipo(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.equipoService.getById(id).subscribe({
      next: (equipo: any) => {
        this.form.patchValue({
          nombre: equipo.nombre,
          codigoFifa: equipo.codigoFifa,
          banderaUrl: equipo.banderaUrl,
          entrenador: equipo.entrenador,
          capitan: equipo.capitan
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'No se pudo cargar el equipo.';
      }
    });
  }

  submit(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload = {
      nombre: this.form.value.nombre!.trim(),
      codigoFifa: this.form.value.codigoFifa!.trim().toUpperCase(),
      banderaUrl: (this.form.value.banderaUrl || '').trim(),
      entrenador: (this.form.value.entrenador || '').trim(),
      capitan: (this.form.value.capitan || '').trim()
    };

    if (this.isEditMode && this.equipoId) {
      this.equipoService.update(this.equipoId, payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/admin/equipos']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error?.error?.error || 'No se pudo actualizar el equipo.';
        }
      });
      return;
    }

    this.equipoService.create(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/equipos']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'No se pudo crear el equipo.';
      }
    });
  }

  get nombre() {
    return this.form.get('nombre')!;
  }

  get codigoFifa() {
    return this.form.get('codigoFifa')!;
  }
}