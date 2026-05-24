import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  private sessionService = inject(SessionService);
  private router = inject(Router);

  //isAdmin = false;
  activeDropdown: string | null = null;

  get userFullName(): string {
    const name = localStorage.getItem('fullName');
    return (name && name !== 'undefined' && name !== 'null') ? name : 'Usuario';
  }

  get isAuthenticated(): boolean {
    return this.sessionService.isAuthenticated();
  }

  ngOnInit(): void {
    //this.isAdmin = this.sessionService.getRole() === 'Administrador';
  }
  
  get isAdmin(): boolean {
  return this.sessionService.getRole() === 'Administrador';
}

  @HostListener('document:click')
  onDocumentClick(): void {
    this.activeDropdown = null;
  }

  toggleDropdown(name: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  closeDropdowns(): void {
    this.activeDropdown = null;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('fullName');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }
}