import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';

interface Capacitacion {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_limite: string;
  cumplimiento: number;
}

@Component({
  selector: 'app-capacitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ProgressBarComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold text-gray-900">Capacitaciones</h1>
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <span class="text-sm text-gray-600">Mostrar completadas</span>
          <div class="relative">
            <input type="checkbox" [(ngModel)]="showCompleted" class="sr-only peer"/>
            <div class="w-9 h-5 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors"></div>
            <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
          </div>
        </label>
      </div>
      <p class="text-sm text-gray-500 mb-6">Complete los cursos de capacitacion asignados</p>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <p class="text-red-700 text-sm">{{ error }}</p>
        <button (click)="loadCapacitaciones()" class="mt-2 text-sm text-red-600 underline">Reintentar</button>
      </div>

      <!-- Success -->
      <div *ngIf="successMsg" class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
        {{ successMsg }}
      </div>

      <div *ngIf="!loading && !error">
        <!-- Overall progress -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Progreso General de Capacitaciones</span>
            <span class="text-sm font-bold text-gray-900">{{ overallProgress }}%</span>
          </div>
          <app-progress-bar [value]="overallProgress" [height]="10"></app-progress-bar>
          <p class="text-xs text-gray-400 mt-2">{{ completedCount }} de {{ capacitaciones.length }} capacitaciones completadas</p>
        </div>

        <!-- Courses list -->
        <div *ngIf="filteredCapacitaciones.length > 0" class="space-y-4">
          <div *ngFor="let cap of filteredCapacitaciones" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-sm font-semibold text-gray-900">{{ cap.nombre }}</h3>
                  <span *ngIf="cap.cumplimiento >= 100" class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Completado</span>
                  <span *ngIf="cap.cumplimiento < 100 && isOverdue(cap)" class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Vencido</span>
                </div>
                <p class="text-xs text-gray-500 mb-3">{{ cap.descripcion }}</p>

                <!-- Progress bar -->
                <div class="flex items-center gap-3 mb-2">
                  <div class="flex-1">
                    <app-progress-bar [value]="cap.cumplimiento" [height]="6"></app-progress-bar>
                  </div>
                  <span class="text-xs font-bold text-gray-700 w-10 text-right">{{ cap.cumplimiento }}%</span>
                </div>

                <div class="flex items-center gap-4 text-xs text-gray-400">
                  <div class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Fecha limite: {{ cap.fecha_limite }}
                  </div>
                </div>
              </div>

              <!-- Action -->
              <div class="flex-shrink-0">
                <button
                  *ngIf="cap.cumplimiento < 100"
                  (click)="marcarCompleto(cap)"
                  [disabled]="markingId === cap.id"
                  class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {{ markingId === cap.id ? 'Procesando...' : 'Marcar Completo' }}
                </button>
                <div *ngIf="cap.cumplimiento >= 100" class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="filteredCapacitaciones.length === 0 && capacitaciones.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
          <p>No tiene capacitaciones pendientes. Active "Mostrar completadas" para ver todas.</p>
        </div>

        <div *ngIf="capacitaciones.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          <p>No tiene capacitaciones asignadas</p>
        </div>
      </div>
    </div>
  `,
})
export class CapacitacionesComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  capacitaciones: Capacitacion[] = [];
  loading = true;
  error = '';
  successMsg = '';
  markingId: number | null = null;
  showCompleted = false;

  get filteredCapacitaciones(): Capacitacion[] {
    if (this.showCompleted) return this.capacitaciones;
    return this.capacitaciones.filter(c => c.cumplimiento < 100);
  }

  get overallProgress(): number {
    if (this.capacitaciones.length === 0) return 0;
    const sum = this.capacitaciones.reduce((acc, c) => acc + c.cumplimiento, 0);
    return Math.round(sum / this.capacitaciones.length);
  }

  get completedCount(): number {
    return this.capacitaciones.filter(c => c.cumplimiento >= 100).length;
  }

  ngOnInit(): void {
    this.loadCapacitaciones();
  }

  loadCapacitaciones(): void {
    this.loading = true;
    this.error = '';
    this.http.get<Capacitacion[]>(`${this.apiUrl}/portal/mis-capacitaciones`).subscribe({
      next: (res) => {
        this.capacitaciones = res;
        this.loading = false;
      },
      error: (err: any) => {
        if (err.status === 404) {
          this.capacitaciones = [];
          this.loading = false;
        } else {
          this.error = 'Error al cargar las capacitaciones.';
          this.loading = false;
        }
      },
    });
  }

  marcarCompleto(cap: Capacitacion): void {
    this.markingId = cap.id;
    this.successMsg = '';
    this.http.put(`${this.apiUrl}/portal/mis-capacitaciones/${cap.id}`, { cumplimiento: 100 }).subscribe({
      next: () => {
        cap.cumplimiento = 100;
        this.markingId = null;
        this.successMsg = `Capacitacion "${cap.nombre}" marcada como completada.`;
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: () => {
        this.markingId = null;
        this.error = 'Error al actualizar la capacitacion.';
        setTimeout(() => this.error = '', 4000);
      },
    });
  }

  isOverdue(cap: Capacitacion): boolean {
    return new Date(cap.fecha_limite) < new Date();
  }
}
