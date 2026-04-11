import { Routes } from '@angular/router';

export const PORTAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/portal-layout.component').then((m) => m.PortalLayoutComponent),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./inicio/inicio.component').then((m) => m.InicioComponent)
      },
      {
        path: 'ficha',
        loadComponent: () =>
          import('./ficha/ficha.component').then((m) => m.FichaComponent)
      },
      {
        path: 'evaluaciones',
        loadComponent: () =>
          import('./evaluaciones/evaluaciones.component').then((m) => m.EvaluacionesPortalComponent)
      },
      {
        path: 'documentos',
        loadComponent: () =>
          import('./documentos/documentos.component').then((m) => m.DocumentosComponent)
      },
      {
        path: 'entrevistas',
        loadComponent: () =>
          import('./entrevistas/entrevistas.component').then((m) => m.EntrevistasComponent)
      },
      {
        path: 'firma-digital',
        loadComponent: () =>
          import('./firma-digital/firma-digital.component').then((m) => m.FirmaDigitalComponent)
      },
      {
        path: 'derechohabientes',
        loadComponent: () =>
          import('./derechohabientes/derechohabientes.component').then((m) => m.DerechohabientesComponent)
      },
      {
        path: 'datos-bancarios',
        loadComponent: () =>
          import('./datos-bancarios/datos-bancarios.component').then((m) => m.DatosBancariosComponent)
      },
      {
        path: 'regimen-pensionario',
        loadComponent: () =>
          import('./regimen-pensionario/regimen-pensionario.component').then((m) => m.RegimenPensionarioComponent)
      },
      {
        path: 'docs-digitales',
        loadComponent: () =>
          import('./docs-digitales/docs-digitales.component').then((m) => m.DocsDigitalesComponent)
      },
      {
        path: 'capacitaciones',
        loadComponent: () =>
          import('./capacitaciones/capacitaciones.component').then((m) => m.CapacitacionesComponent)
      },
      {
        path: 'anuncios',
        loadComponent: () =>
          import('./anuncios/anuncios-portal.component').then((m) => m.AnunciosPortalComponent)
      }
    ]
  }
];
