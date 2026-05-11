import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';


import { SessionService } from '../../../../core/services/session.service';
import { AuthService } from '../../services/auth.services';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private router = inject(Router);

  user: any = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (response) => {
        this.user = response;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la información del usuario.';
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.sessionService.clearSession();
    this.router.navigate(['/login']);
  }
}