import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EquipoAdminService } from '../../services/equipo-admin.service';

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
  private service = inject(EquipoAdminService);

  id: number | null = null;
  isEdit = false;
  isLoading = false;
  errorMessage = '';

  form = this.fb.group({
    nombre:     ['', [Validators.required, Validators.minLength(2)]],
    codigoFifa: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(6)]],
    banderaUrl: [''],
    entrenador: [''],
    capitan:    ['']
  });

  get banderaPreview(): string {
    return this.form.value.banderaUrl || '';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) { this.id = id; this.isEdit = true; this.loadData(id); }

    // Auto-generar banderaUrl cuando cambia codigoFifa
    this.form.get('codigoFifa')!.valueChanges.subscribe(code => {
      if (!code) return;
      const current = this.form.value.banderaUrl;
      // Solo auto-completa si está vacío o fue auto-generado antes
      if (!current || current.startsWith('https://flagcdn.com/')) {
        this.form.patchValue({ banderaUrl: `https://flagcdn.com/${code.toLowerCase()}.svg` }, { emitEvent: false });
      }
    });
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
      nombre:     this.form.value.nombre!.trim(),
      codigoFifa: this.form.value.codigoFifa!.trim().toUpperCase(),
      banderaUrl: (this.form.value.banderaUrl || '').trim(),
      entrenador: (this.form.value.entrenador || '').trim(),
      capitan:    (this.form.value.capitan || '').trim()
    };

    const obs = this.isEdit ? this.service.update(this.id!, payload) : this.service.create(payload);
    obs.subscribe({
      next: () => { this.isLoading = false; this.router.navigate(['/admin/equipos']); },
      error: err => { this.isLoading = false; this.errorMessage = err?.error?.error || 'Error al guardar.'; }
    });
  }

  get nombre()     { return this.form.get('nombre')!; }
  get codigoFifa() { return this.form.get('codigoFifa')!; }
}