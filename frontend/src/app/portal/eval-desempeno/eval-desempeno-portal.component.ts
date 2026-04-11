import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-eval-desempeno-portal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Mis Evaluaciones de Desempeno</h1>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-500">Cargando...</span>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <!-- List View -->
      <div *ngIf="!loading && !selectedEval">
        <!-- Cards -->
        <div *ngIf="evaluaciones.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let ev of evaluaciones"
            (click)="selectEval(ev)"
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="text-sm font-semibold text-gray-900">{{ ev.periodo }}</h3>
                <p class="text-xs text-gray-500">{{ ev.tipo }}</p>
              </div>
              <span
                class="px-2 py-0.5 text-xs font-medium rounded-full"
                [ngClass]="{
                  'bg-yellow-100 text-yellow-700': ev.estado === 'Borrador',
                  'bg-blue-100 text-blue-700': ev.estado === 'Enviado',
                  'bg-green-100 text-green-700': ev.estado === 'Completado'
                }"
              >{{ ev.estado }}</span>
            </div>
            <div class="flex items-center gap-3 mb-2">
              <span class="text-3xl font-bold" [ngClass]="ev.puntaje_general >= 4 ? 'text-green-600' : ev.puntaje_general >= 3 ? 'text-blue-600' : 'text-orange-600'">
                {{ ev.puntaje_general?.toFixed(1) || '0.0' }}
              </span>
              <span class="text-xs text-gray-400">/ 5.0</span>
            </div>
            <p *ngIf="ev.fecha" class="text-xs text-gray-400">{{ ev.fecha | date:'dd/MM/yyyy' }}</p>
          </div>
        </div>

        <!-- Empty -->
        <div *ngIf="evaluaciones.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <p class="text-sm text-gray-400">No tiene evaluaciones de desempeno registradas</p>
        </div>
      </div>

      <!-- Detail View -->
      <div *ngIf="!loading && selectedEval">
        <button
          (click)="selectedEval = null"
          class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          Volver a la lista
        </button>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ selectedEval.periodo }} - {{ selectedEval.tipo }}</h2>
              <p *ngIf="selectedEval.fecha" class="text-xs text-gray-500">{{ selectedEval.fecha | date:'dd/MM/yyyy' }}</p>
            </div>
            <div class="text-right">
              <span class="text-3xl font-bold" [ngClass]="selectedEval.puntaje_general >= 4 ? 'text-green-600' : selectedEval.puntaje_general >= 3 ? 'text-blue-600' : 'text-orange-600'">
                {{ selectedEval.puntaje_general?.toFixed(1) || '0.0' }}
              </span>
              <span class="text-xs text-gray-400"> / 5.0</span>
            </div>
          </div>

          <div *ngIf="loadingDetail" class="flex items-center justify-center py-8">
            <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>

          <div *ngIf="!loadingDetail" class="space-y-4">
            <div *ngFor="let criterio of detailCriterios" class="bg-gray-50 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-semibold text-gray-900">{{ criterio.nombre }}</h4>
                  <span class="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">{{ criterio.categoria }}</span>
                </div>
                <span class="text-xs text-gray-400">Peso: {{ criterio.peso }}%</span>
              </div>

              <!-- Stars (read-only) -->
              <div class="flex items-center gap-1 mb-2">
                <svg *ngFor="let star of [1,2,3,4,5]"
                  class="w-6 h-6" [ngClass]="star <= criterio.puntaje ? 'text-yellow-400' : 'text-gray-300'" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span class="ml-2 text-sm font-medium text-gray-600">{{ criterio.puntaje }}/5</span>
              </div>

              <p *ngIf="criterio.comentario" class="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-200">{{ criterio.comentario }}</p>
            </div>

            <!-- Comentarios generales -->
            <div *ngIf="selectedEval.comentarios_generales" class="pt-4 border-t border-gray-200">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Comentarios Generales</h4>
              <p class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{{ selectedEval.comentarios_generales }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EvalDesempenoPortalComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  evaluaciones: any[] = [];
  loading = false;
  error = '';

  selectedEval: any = null;
  detailCriterios: any[] = [];
  loadingDetail = false;

  ngOnInit(): void {
    this.loadEvaluaciones();
  }

  loadEvaluaciones(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/evaluacion-desempeno/mis-evaluaciones`).subscribe({
      next: (data) => {
        this.evaluaciones = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.evaluaciones = [];
        this.error = 'Error al cargar evaluaciones.';
        this.loading = false;
        console.error('Load error:', err);
      },
    });
  }

  selectEval(ev: any): void {
    this.selectedEval = ev;
    this.detailCriterios = [];
    this.loadingDetail = true;

    // Load detail with criterios
    this.http.get<any>(`${this.apiUrl}/evaluacion-desempeno/mis-evaluaciones/${ev.id}`).subscribe({
      next: (data) => {
        if (data) {
          this.selectedEval = { ...this.selectedEval, ...data };
          this.detailCriterios = data.puntajes ?? data.criterios ?? [];
        }
        this.loadingDetail = false;
      },
      error: () => {
        // Fallback: use puntajes from list data
        this.detailCriterios = ev.puntajes ?? [];
        this.loadingDetail = false;
      },
    });
  }
}
