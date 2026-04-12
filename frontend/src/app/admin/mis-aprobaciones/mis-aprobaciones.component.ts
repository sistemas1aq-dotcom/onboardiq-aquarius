import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mis-aprobaciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Mis Aprobaciones</h1>
        <button
          (click)="loadPendientes()"
          class="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Summary -->
      <div *ngIf="!loading && pendientes.length > 0" class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p class="text-sm font-medium text-amber-800">
          Tienes {{ pendientes.length }} aprobaci{{ pendientes.length === 1 ? 'on' : 'ones' }} pendiente{{ pendientes.length === 1 ? '' : 's' }}
        </p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-500">Cargando...</span>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && pendientes.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-500">No tienes aprobaciones pendientes</h3>
        <p class="text-sm text-gray-400 mt-1">Cuando se te asigne una aprobacion, aparecera aqui.</p>
      </div>

      <!-- Cards -->
      <div *ngIf="!loading && pendientes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let p of pendientes"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-gray-900">{{ p.postulante_nombre || 'Sin nombre' }}</h3>
              <p class="text-xs text-gray-500 mt-0.5">{{ p.postulante_puesto || 'Sin puesto' }}</p>
            </div>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Nivel #{{ p.orden }}
            </span>
          </div>

          <div class="flex items-center gap-2 mb-4">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Tu turno
            </span>
            <span *ngIf="p.evaluacion_nombre" class="text-xs text-gray-400">
              {{ p.evaluacion_nombre }}
            </span>
          </div>

          <button
            (click)="verPostulante(p.postulante_id)"
            class="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            Ver Postulante
          </button>
        </div>
      </div>
    </div>
  `,
})
export class MisAprobacionesComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  loading = true;
  pendientes: any[] = [];

  ngOnInit(): void {
    this.loadPendientes();
  }

  loadPendientes(): void {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/aprobadores/mis-pendientes`).subscribe({
      next: (data) => {
        this.pendientes = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando pendientes:', err);
        this.pendientes = [];
        this.loading = false;
      },
    });
  }

  verPostulante(postulanteId: number): void {
    this.router.navigate(['/admin/postulantes'], { queryParams: { detail: postulanteId } });
  }
}
