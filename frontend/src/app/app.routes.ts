import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./landing/landing.component').then((m) => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('admin', 'evaluador')],
    loadChildren: () =>
      import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES)
  },
  {
    path: 'portal',
    canActivate: [authGuard, roleGuard('postulante', 'trabajador')],
    loadChildren: () =>
      import('./portal/portal.routes').then((m) => m.PORTAL_ROUTES)
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
