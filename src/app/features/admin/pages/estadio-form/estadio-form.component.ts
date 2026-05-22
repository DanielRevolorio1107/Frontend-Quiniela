import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EstadioAdminService } from '../../services/estadio-admin.service';

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
  private service = inject(EstadioAdminService);

  id: number | null = null;
  isEdit = false;
  isLoading = false;
  errorMessage = '';

  form = this.fb.group({
    nombre:    ['', [Validators.required, Validators.minLength(2)]],
    ciudad:    ['', [Validators.required, Validators.minLength(2)]],
    pais:      ['', [Validators.required, Validators.minLength(2)]],
    capacidad: [0,  [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) { this.id = id; this.isEdit = true; this.loadData(id); }
  }

  loadData(id: number): void {
    this.isLoading = true;
    this.service.getById(id).subscribe({
      next: e => { this.form.patchValue(e); this.isLoading = false; },
      error: err => { this.isLoading = false; this.errorMessage = err?.error?.error || 'Error al cargar.'; }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      nombre:    this.form.value.nombre!.trim(),
      ciudad:    this.form.value.ciudad!.trim(),
      pais:      this.form.value.pais!.trim(),
      capacidad: Number(this.form.value.capacidad)
    };

    const obs = this.isEdit
      ? this.service.update(this.id!, payload)
      : this.service.create(payload);

    obs.subscribe({
      next: () => { this.isLoading = false; this.router.navigate(['/admin/estadios']); },
      error: err => { this.isLoading = false; this.errorMessage = err?.error?.error || 'Error al guardar.'; }
    });
  }

  get nombre()    { return this.form.get('nombre')!; }
  get ciudad()    { return this.form.get('ciudad')!; }
  get pais()      { return this.form.get('pais')!; }
  get capacidad() { return this.form.get('capacidad')!; }
}