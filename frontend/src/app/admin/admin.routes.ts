import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'postulantes',
        loadComponent: () =>
          import('./postulantes/postulantes.component').then((m) => m.PostulantesComponent)
      },
      {
        path: 'evaluaciones',
        loadComponent: () =>
          import('./evaluaciones/evaluaciones.component').then((m) => m.EvaluacionesComponent)
      },
      {
        path: 'legajo',
        loadComponent: () =>
          import('./legajo/legajo.component').then((m) => m.LegajoComponent)
      },
      {
        path: 'embudo',
        loadComponent: () =>
          import('./embudo/embudo.component').then((m) => m.EmbudoComponent)
      },
      {
        path: 'ia-insights',
        loadComponent: () =>
          import('./ia-insights/ia-insights.component').then((m) => m.IaInsightsComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./usuarios/usuarios.component').then((m) => m.UsuariosComponent)
      },
      {
        path: 'seguridad',
        loadComponent: () =>
          import('./seguridad/seguridad.component').then((m) => m.SeguridadComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./configuracion/configuracion.component').then((m) => m.ConfiguracionComponent)
      },
      {
        path: 'carga-masiva',
        loadComponent: () =>
          import('./carga-masiva/carga-masiva.component').then((m) => m.CargaMasivaComponent)
      },
      {
        path: 'anuncios',
        loadComponent: () =>
          import('./anuncios/anuncios.component').then((m) => m.AnunciosComponent)
      },
      {
        path: 'comunicaciones',
        loadComponent: () =>
          import('./comunicaciones/comunicaciones.component').then((m) => m.ComunicacionesComponent)
      },
      {
        path: 'capacitaciones',
        loadComponent: () =>
          import('./capacitaciones/capacitaciones-admin.component').then((m) => m.CapacitacionesAdminComponent)
      },
      {
        path: 'eval-desempeno',
        loadComponent: () =>
          import('./eval-desempeno/eval-desempeno.component').then((m) => m.EvalDesempenoComponent)
      },
      {
        path: 'mis-aprobaciones',
        loadComponent: () =>
          import('./mis-aprobaciones/mis-aprobaciones.component').then((m) => m.MisAprobacionesComponent)
      }
    ]
  }
];
