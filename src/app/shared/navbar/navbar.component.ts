import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  private sessionService = inject(SessionService);
  private router = inject(Router);

  activeDropdown: string | null = null;
  isMobileMenuOpen = false;
  isSidebarCollapsed = false;
  currentUrl = '';

  openSections: Record<string, boolean> = {
    ligas: true,
    predicciones: true,
    admin: true,
    adminMundial: true,
  };

  private readonly sectionRoutes: Record<string, string[]> = {
    ligas:        ['/ligas'],
    predicciones: ['/partidos', '/predicciones', '/ranking'],
    admin:        ['/admin/usuarios', '/admin/torneo', '/admin/reportes', '/admin/premios'],
    adminMundial: ['/admin/partidos', '/admin/estadios', '/admin/equipos'],
  };

  get userFullName(): string {
    const name = localStorage.getItem('fullName');
    return (name && name !== 'undefined' && name !== 'null') ? name : 'Usuario';
  }

  get isAuthenticated(): boolean {
    return this.sessionService.isAuthenticated();
  }

  get isAdmin(): boolean {
    return this.sessionService.getRole() === 'Administrador';
  }

  isSectionActive(section: string): boolean {
    return (this.sectionRoutes[section] ?? []).some(r => this.currentUrl.startsWith(r));
  }

  ngOnInit(): void {
    // Restaurar estado colapsado desde localStorage
    const saved = localStorage.getItem('sb-collapsed');
    if (saved !== null) this.isSidebarCollapsed = saved === 'true';

    // URL inicial
    this.currentUrl = this.router.url;
    this.autoOpenSection(this.currentUrl);

    // Escuchar navegación: auto-abrir sección activa y cerrar sidebar móvil
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e) => {
      this.currentUrl = (e as NavigationEnd).urlAfterRedirects;
      this.autoOpenSection(this.currentUrl);
      this.isMobileMenuOpen = false;
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.activeDropdown = null;
    this.isMobileMenuOpen = false;
  }

  toggleDropdown(name: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  toggleMobileMenu(event: Event): void {
    event.stopPropagation();
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) this.activeDropdown = null;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  closeAll(): void {
    this.activeDropdown = null;
    this.isMobileMenuOpen = false;
  }

  toggleSidebar(event: Event): void {
    event.stopPropagation();
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    localStorage.setItem('sb-collapsed', String(this.isSidebarCollapsed));
  }

  toggleSection(name: string, event: Event): void {
    event.stopPropagation();
    this.openSections[name] = !this.openSections[name];
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.sessionService.clearSession();
    this.isMobileMenuOpen = false;
    this.router.navigate(['/login']);
  }

  private autoOpenSection(url: string): void {
    for (const [section, routes] of Object.entries(this.sectionRoutes)) {
      if (routes.some(r => url.startsWith(r))) {
        this.openSections[section] = true;
      }
    }
  }
}
