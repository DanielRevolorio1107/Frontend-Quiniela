import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EstadioAdminService } from '../admin/services/estadio-admin.service';

@Component({
  selector: 'app-estadio-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './estadio-form.component.html',
  styleUrl: './estadio-form.component.css'
})
export class EstadioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private estadioService = inject(EstadioAdminService);

  estadioId: number | null = null;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    ciudad: ['', [Validators.required, Validators.minLength(2)]],
    pais: ['', [Validators.required, Validators.minLength(2)]],
    capacidad: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id && id > 0) {
      this.estadioId = id;
      this.isEditMode = true;
      this.loadEstadio(id);
    }
  }

  loadEstadio(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.estadioService.getById(id).subscribe({
      next: (estadio: any) => {
        this.form.patchValue({
          nombre: estadio.nombre,
          ciudad: estadio.ciudad,
          pais: estadio.pais,
          capacidad: estadio.capacidad
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'No se pudo cargar el estadio.';
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
      ciudad: this.form.value.ciudad!.trim(),
      pais: this.form.value.pais!.trim(),
      capacidad: Number(this.form.value.capacidad)
    };

    if (this.isEditMode && this.estadioId) {
      this.estadioService.update(this.estadioId, payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/admin/estadios']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error?.error?.error || 'No se pudo actualizar el estadio.';
        }
      });
      return;
    }

    this.estadioService.create(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/estadios']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.error || 'No se pudo crear el estadio.';
      }
    });
  }

  get nombre() {
    return this.form.get('nombre')!;
  }

  get ciudad() {
    return this.form.get('ciudad')!;
  }

  get pais() {
    return this.form.get('pais')!;
  }

  get capacidad() {
    return this.form.get('capacidad')!;
  }
}