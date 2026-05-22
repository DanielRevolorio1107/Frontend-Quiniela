import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EstadioAdminService } from '../../services/estadio-admin.service';

@Component({
  selector: 'app-estadio-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './estadio-list.component.html',
  styleUrl: './estadio-list.component.css'
})
export class EstadioListComponent implements OnInit {
  private service = inject(EstadioAdminService);
  private router = inject(Router);

  estadios: any[] = [];
  filtrados: any[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  searchNombre = '';
  searchCiudad = '';
  searchPais = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.service.getAll().subscribe({
      next: (res: any) => {
        this.estadios = this.toArray(res);
        this.filter();
        this.isLoading = false;
      },
      error: err => { this.isLoading = false; this.errorMessage = err?.error?.error || 'Error al cargar estadios.'; }
    });
  }

  filter(): void {
    const n = this.searchNombre.toLowerCase();
    const c = this.searchCiudad.toLowerCase();
    const p = this.searchPais.toLowerCase();
    this.filtrados = this.estadios.filter(e =>
      (!n || e.nombre?.toLowerCase().includes(n)) &&
      (!c || e.ciudad?.toLowerCase().includes(c)) &&
      (!p || e.pais?.toLowerCase().includes(p))
    );
  }

  crear(): void { this.router.navigate(['/admin/estadios/crear']); }
  editar(id: number): void { this.router.navigate(['/admin/estadios', id, 'editar']); }

  eliminar(id: number, nombre: string): void {
    if (!confirm(`¿Eliminar el estadio "${nombre}"?`)) return;
    this.errorMessage = '';
    this.successMessage = '';
    this.service.delete(id).subscribe({
      next: () => { this.successMessage = 'Estadio eliminado.'; this.load(); },
      error: err => { this.errorMessage = err?.error?.error || 'No se pudo eliminar.'; }
    });
  }

  private toArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    return res?.items ?? res?.data ?? [];
  }
}