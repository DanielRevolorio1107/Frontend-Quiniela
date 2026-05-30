import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.services';
import { SessionService } from '../../../../core/services/session.service';

@Component({
  selector: 'app-github-callback',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './github-callback.component.html',
  styleUrl: './github-callback.component.css'
})
export class GithubCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);

  errorMessage = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error) {
      this.errorMessage = decodeURIComponent(error);
      return;
    }

    if (!token) {
      this.errorMessage = 'No se recibió el token de autenticación.';
      return;
    }

    // Store token so the interceptor can use it for getMe()
    localStorage.setItem('token', token);

    this.authService.getMe().subscribe({
      next: (r: any) => {
        const fullName = r.fullName ?? r.fullname ?? '';
        const role = r.role?.name ?? r.role ?? '';
        this.sessionService.setSession(token, r.email, fullName, role);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        localStorage.removeItem('token');
        this.errorMessage = 'No se pudo completar el inicio de sesión con GitHub.';
      }
    });
  }
}
