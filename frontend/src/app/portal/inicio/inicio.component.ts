import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { RingChartComponent } from '../../shared/components/ring-chart/ring-chart.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';

interface DashboardData {
  avance_general: number;
  documentos_subidos: number;
  documentos_total: number;
  evaluaciones_completadas: number;
  evaluaciones_total: number;
  entrevistas_programadas: number;
  proxima_entrevista: {
    fecha: string;
    hora: string;
    lugar: string;
    tipo: string;
    evaluador: string;
  } | null;
  actividad_reciente: {
    fecha: string;
    descripcion: string;
    tipo: string;
  }[];
  firmas_pendientes?: number;
  capacitaciones_pendientes?: number;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RingChartComponent, KpiCardComponent, ProgressBarComponent],
  template: `
    <div>
      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <p class="text-red-700 text-sm">{{ error }}</p>
        <button (click)="loadDashboard()" class="mt-2 text-sm text-red-600 underline">Reintentar</button>
      </div>

      <div *ngIf="!loading && !error">
        <!-- Welcome header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Bienvenido, {{ userName }}</h1>
          <p class="text-gray-500 mt-1">Resumen de tu proceso de seleccion</p>
        </div>

        <!-- Top section: Ring + KPIs -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <!-- Progress Ring -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
            <p class="text-sm font-medium text-gray-500 mb-3">Avance General</p>
            <app-ring-chart
              [value]="data?.avance_general ?? 0"
              [size]="140"
              [strokeWidth]="12"
              [color]="'#1a7ec5'"
            ></app-ring-chart>
            <p class="text-xs text-gray-400 mt-3">de tu proceso completado</p>
          </div>

          <!-- KPI Cards -->
          <app-kpi-card
            title="Documentos Subidos"
            [value]="(data?.documentos_subidos ?? 0) + ' / ' + (data?.documentos_total ?? 0)"
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            color="#10b981"
          ></app-kpi-card>

          <app-kpi-card
            title="Evaluaciones Completadas"
            [value]="(data?.evaluaciones_completadas ?? 0) + ' / ' + (data?.evaluaciones_total ?? 0)"
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            color="#f59e0b"
          ></app-kpi-card>

          <app-kpi-card
            title="Entrevistas Programadas"
            [value]="data?.entrevistas_programadas ?? 0"
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            color="#8b5cf6"
          ></app-kpi-card>
        </div>

        <!-- Trabajador extra cards -->
        <div *ngIf="isTrabajador" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <app-kpi-card
            title="Firmas Pendientes"
            [value]="data?.firmas_pendientes ?? 0"
            subtitle="documentos por firmar"
            icon="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            color="#ec4899"
          ></app-kpi-card>
          <app-kpi-card
            title="Capacitaciones Pendientes"
            [value]="data?.capacitaciones_pendientes ?? 0"
            subtitle="cursos por completar"
            icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            color="#06b6d4"
          ></app-kpi-card>
        </div>

        <!-- Bottom section: Next interview + Activity timeline -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Next Interview -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Proxima Entrevista</h3>
            <div *ngIf="data?.proxima_entrevista; else noEntrevista">
              <div class="flex items-start gap-4">
                <div class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 capitalize">{{ data?.proxima_entrevista?.tipo }}</p>
                  <div class="mt-2 space-y-1">
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      {{ data?.proxima_entrevista?.fecha }} a las {{ data?.proxima_entrevista?.hora }}
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {{ data?.proxima_entrevista?.lugar }}
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      {{ data?.proxima_entrevista?.evaluador }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ng-template #noEntrevista>
              <div class="text-center py-6">
                <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p class="text-sm text-gray-400">No hay entrevistas programadas</p>
              </div>
            </ng-template>
          </div>

          <!-- Activity Timeline -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div *ngIf="data?.actividad_reciente?.length; else noActividad" class="space-y-4">
              <div *ngFor="let act of data!.actividad_reciente; let last = last" class="flex gap-3">
                <div class="flex flex-col items-center">
                  <div class="w-2.5 h-2.5 rounded-full mt-1.5"
                    [ngClass]="{
                      'bg-green-500': act.tipo === 'documento',
                      'bg-blue-500': act.tipo === 'evaluacion',
                      'bg-purple-500': act.tipo === 'entrevista',
                      'bg-yellow-500': act.tipo === 'ficha',
                      'bg-gray-400': !['documento','evaluacion','entrevista','ficha'].includes(act.tipo)
                    }">
                  </div>
                  <div *ngIf="!last" class="w-px flex-1 bg-gray-200 mt-1"></div>
                </div>
                <div class="pb-4 flex-1">
                  <p class="text-sm text-gray-700">{{ act.descripcion }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ act.fecha }}</p>
                </div>
              </div>
            </div>
            <ng-template #noActividad>
              <div class="text-center py-6">
                <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-gray-400">No hay actividad reciente</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InicioComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  data: DashboardData | null = null;
  loading = true;
  error = '';

  get userName(): string {
    const user = this.authService.getCurrentUser();
    return user ? user.nombre : 'Usuario';
  }

  get isTrabajador(): boolean {
    return this.authService.getUserRole() === 'trabajador';
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      ficha: this.http.get<any>(`${this.apiUrl}/portal/mi-ficha`).pipe(catchError(() => of(null))),
      documentos: this.http.get<any[]>(`${this.apiUrl}/portal/mis-documentos`).pipe(catchError(() => of([]))),
      evaluaciones: this.http.get<any[]>(`${this.apiUrl}/portal/mis-evaluaciones`).pipe(catchError(() => of([]))),
      entrevistas: this.http.get<any[]>(`${this.apiUrl}/portal/mis-entrevistas`).pipe(catchError(() => of([]))),
      firmas: this.http.get<any[]>(`${this.apiUrl}/portal/mis-firmas`).pipe(catchError(() => of([]))),
      capacitaciones: this.http.get<any[]>(`${this.apiUrl}/portal/mis-capacitaciones`).pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        const docs = res.documentos || [];
        const evals = res.evaluaciones || [];
        const entrevistas = res.entrevistas || [];
        const firmas = res.firmas || [];
        const capacitaciones = res.capacitaciones || [];

        const docsSubidos = docs.filter((d: any) => d.estado === 'aprobado' || d.estado === 'pendiente').length;
        const evalsCompletadas = evals.filter((e: any) => e.estado === 'Completado' || e.estado === 'completado').length;

        const today = new Date().toISOString().split('T')[0];
        const upcoming = entrevistas
          .filter((e: any) => e.fecha >= today && e.estado !== 'cancelada')
          .sort((a: any, b: any) => a.fecha.localeCompare(b.fecha) || (a.hora || '').localeCompare(b.hora || ''));

        const proximaEntrevista = upcoming.length > 0 ? {
          fecha: upcoming[0].fecha,
          hora: upcoming[0].hora,
          lugar: upcoming[0].lugar,
          tipo: upcoming[0].tipo,
          evaluador: upcoming[0].evaluador_nombre || '',
        } : null;

        // Build activity from recent events
        const actividad: { fecha: string; descripcion: string; tipo: string }[] = [];
        docs.filter((d: any) => d.estado === 'aprobado' || d.estado === 'pendiente').slice(0, 3).forEach((d: any) => {
          actividad.push({ fecha: '', descripcion: `Documento "${d.nombre_archivo}" subido`, tipo: 'documento' });
        });
        evals.filter((e: any) => e.estado === 'Completado' || e.estado === 'completado').slice(0, 3).forEach((e: any) => {
          actividad.push({ fecha: '', descripcion: `Evaluacion "${e.evaluacion_nombre}" completada`, tipo: 'evaluacion' });
        });

        // Compute overall progress
        const totalSteps = Math.max(docs.length + evals.length, 1);
        const completedSteps = docsSubidos + evalsCompletadas;
        const avance = Math.round((completedSteps / totalSteps) * 100);

        const firmasPendientes = firmas.length > 0 ? 0 : docs.filter((d: any) => d.requerido).length;
        const capPendientes = capacitaciones.filter((c: any) => (c.cumplimiento || 0) < 100).length;

        this.data = {
          avance_general: avance,
          documentos_subidos: docsSubidos,
          documentos_total: docs.length,
          evaluaciones_completadas: evalsCompletadas,
          evaluaciones_total: evals.length,
          entrevistas_programadas: upcoming.length,
          proxima_entrevista: proximaEntrevista,
          actividad_reciente: actividad,
          firmas_pendientes: firmasPendientes,
          capacitaciones_pendientes: capPendientes,
        };
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar el dashboard. Intente nuevamente.';
        this.loading = false;
      },
    });
  }
}
