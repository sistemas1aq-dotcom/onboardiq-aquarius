import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export function roleGuard(...allowedRoles: string[]): CanActivateFn {
  return (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Si no esta autenticado, dejar que authGuard maneje la redireccion
    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    const userRole = authService.getUserRole();
    const roles = route.data?.['roles'] as string[] | undefined ?? allowedRoles;

    if (roles.includes(userRole)) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
}
