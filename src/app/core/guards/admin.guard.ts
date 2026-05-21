import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  if (role !== 'Administrador') {
    router.navigate(['/ligas']);
    return false;
  }

  return true;
};