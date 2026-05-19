import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

const ADMIN_ROLE = 'Administrador';

export const adminGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (!sessionService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (sessionService.getRole() === ADMIN_ROLE) {
    return true;
  }

  router.navigate(['/profile']);
  return false;
};