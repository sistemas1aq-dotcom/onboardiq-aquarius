import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CalendarComponent, CalendarEvent } from '../../shared/components/calendar/calendar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

interface Entrevista {
  id: number;
  tipo: string;
  fecha: string;
  hora: string;
  lugar: string;
  evaluador_nombre: string;
  duracion: number;
  notas: string;
  estado: string;
}

@Component({
  selector: 'app-entrevistas',
  standalone: true,
  imports: [CommonModule, CalendarComponent, StatusBadgeComponent],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Mis Entrevistas</h1>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <p class="text-red-700 text-sm">{{ error }}</p>
        <button (click)="loadEntrevistas()" class="mt-2 text-sm text-red-600 underline">Reintentar</button>
      </div>

      <div *ngIf="!loading && !error">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Calendar -->
          <div class="lg:col-span-2">
            <app-calendar
              [events]="calendarEvents"
              (eventClick)="onEventClick($event)"
            ></app-calendar>

            <!-- Color legend for interview types -->
            <div class="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h4 class="text-xs font-semibold text-gray-500 uppercase mb-3">Tipos de Entrevista</h4>
              <div class="flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span class="text-xs text-gray-600">Tecnica</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span class="text-xs text-gray-600">Psicologica</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  <span class="text-xs text-gray-600">Entrevista General</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Detail panel -->
          <div>
            <!-- Selected detail -->
            <div *ngIf="selectedEntrevista" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-gray-900">Detalle de Entrevista</h3>
                <button (click)="selectedEntrevista = null" class="text-gray-400 hover:text-gray-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <span class="text-xs px-2.5 py-1 rounded-full font-medium"
                    [ngClass]="{
                      'bg-blue-100 text-blue-700': selectedEntrevista.tipo === 'tecnica',
                      'bg-purple-100 text-purple-700': selectedEntrevista.tipo === 'psicologica',
                      'bg-green-100 text-green-700': selectedEntrevista.tipo === 'entrevista'
                    }">
                    {{ selectedEntrevista.tipo | titlecase }}
                  </span>
                  <app-status-badge [status]="selectedEntrevista.estado"></app-status-badge>
                </div>

                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span class="text-gray-600">{{ selectedEntrevista.fecha }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-gray-600">{{ selectedEntrevista.hora }} ({{ selectedEntrevista.duracion }} min)</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span class="text-gray-600">{{ selectedEntrevista.lugar }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <span class="text-gray-600">{{ selectedEntrevista.evaluador_nombre }}</span>
                  </div>
                </div>

                <div *ngIf="selectedEntrevista.notas" class="bg-gray-50 rounded-lg p-3 mt-3">
                  <p class="text-xs text-gray-500 font-medium mb-1">Notas</p>
                  <p class="text-sm text-gray-700">{{ selectedEntrevista.notas }}</p>
                </div>
              </div>
            </div>

            <!-- Upcoming list -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 class="text-sm font-semibold text-gray-900 mb-4">Proximas Entrevistas</h3>
              <div *ngIf="upcomingEntrevistas.length > 0" class="space-y-3">
                <div *ngFor="let ent of upcomingEntrevistas"
                  (click)="selectedEntrevista = ent"
                  class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100">
                  <div class="w-3 h-3 rounded-full flex-shrink-0"
                    [ngClass]="{
                      'bg-blue-500': ent.tipo === 'tecnica',
                      'bg-purple-500': ent.tipo === 'psicologica',
                      'bg-green-500': ent.tipo === 'entrevista'
                    }">
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 capitalize">{{ ent.tipo }}</p>
                    <p class="text-xs text-gray-500">{{ ent.fecha }} - {{ ent.hora }}</p>
                  </div>
                  <app-status-badge [status]="ent.estado"></app-status-badge>
                </div>
              </div>
              <div *ngIf="upcomingEntrevistas.length === 0" class="text-center py-6">
                <p class="text-sm text-gray-400">No hay entrevistas proximas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EntrevistasComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  entrevistas: Entrevista[] = [];
  selectedEntrevista: Entrevista | null = null;
  loading = true;
  error = '';

  get calendarEvents(): CalendarEvent[] {
    return this.entrevistas.map(e => ({
      fecha: e.fecha,
      tipo: e.tipo,
      hora: e.hora,
      lugar: e.lugar,
      evaluador: e.evaluador_nombre,
      titulo: `${e.tipo} - ${e.hora}`,
    }));
  }

  get upcomingEntrevistas(): Entrevista[] {
    const today = new Date().toISOString().split('T')[0];
    return this.entrevistas
      .filter(e => e.fecha >= today)
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
  }

  ngOnInit(): void {
    this.loadEntrevistas();
  }

  loadEntrevistas(): void {
    this.loading = true;
    this.error = '';
    this.http.get<Entrevista[]>(`${this.apiUrl}/portal/mis-entrevistas`).subscribe({
      next: (res) => {
        this.entrevistas = res;
        this.loading = false;
      },
      error: (err: any) => {
        if (err.status === 404) {
          this.entrevistas = [];
          this.loading = false;
        } else {
          this.error = 'Error al cargar las entrevistas.';
          this.loading = false;
        }
      },
    });
  }

  onEventClick(event: CalendarEvent): void {
    const match = this.entrevistas.find(e =>
      e.fecha === event.fecha && e.tipo === event.tipo && e.hora === event.hora
    );
    if (match) {
      this.selectedEntrevista = match;
    }
  }
}
