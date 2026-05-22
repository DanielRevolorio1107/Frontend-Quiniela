import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EquipoAdminService } from '../../services/equipo-admin.service';

@Component({
  selector: 'app-equipo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './equipo-list.component.html',
  styleUrl: './equipo-list.component.css'
})
export class EquipoListComponent implements OnInit {
  private service = inject(EquipoAdminService);
  private router = inject(Router);

  equipos: any[] = [];
  filtrados: any[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  searchNombre = '';
  searchCodigo = '';

  ngOnInit(): void { this.load(); }

load(): void {
  this.isLoading = true;
  this.service.getAll().subscribe({
    next: (res: any) => {
      console.log('RAW response:', res);        
      this.equipos = this.toArray(res);
      console.log('Equipos parseados:', this.equipos.length);
      this.filter();
      this.isLoading = false;
    },
    error: err => {
      console.error('Error:', err);
      this.isLoading = false;
      this.errorMessage = err?.error?.error || 'Error al cargar.';
    }
  });
}

  filter(): void {
    const n = this.searchNombre.toLowerCase();
    const c = this.searchCodigo.toLowerCase();
    this.filtrados = this.equipos.filter(e =>
      (!n || e.nombre?.toLowerCase().includes(n)) &&
      (!c || e.codigoFifa?.toLowerCase().includes(c))
    );
  }

  crear(): void { this.router.navigate(['/admin/equipos/crear']); }
  editar(id: number): void { this.router.navigate(['/admin/equipos', id, 'editar']); }

  eliminar(id: number, nombre: string): void {
    if (!confirm(`¿Eliminar el equipo "${nombre}"?`)) return;
    this.errorMessage = '';
    this.successMessage = '';
    this.service.delete(id).subscribe({
      next: () => { this.successMessage = 'Equipo eliminado.'; this.load(); },
      error: err => { this.errorMessage = err?.error?.error || 'No se pudo eliminar.'; }
    });
  }

  private toArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    return res?.items ?? res?.data ?? [];
  }
  
}