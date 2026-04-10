import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-postulantes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    StatusBadgeComponent,
    ProgressBarComponent,
    ModalComponent,
    FormFieldComponent,
  ],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Postulantes</h1>
        <button
          (click)="openCreateModal()"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Postulante
        </button>
      </div>

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
        <button (click)="loadPostulantes()" class="mt-2 text-xs text-red-700 underline">Reintentar</button>
      </div>

      <div *ngIf="!loading">
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[200px] max-w-xs">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="filterData()"
              placeholder="Buscar por nombre o DNI..."
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              [(ngModel)]="filterEstado"
              (ngModelChange)="filterData()"
              class="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="">Todos los estados</option>
              <option value="Nuevo">Nuevo</option>
              <option value="En Evaluacion">En Evaluacion</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
              <option value="Trabajador">Trabajador</option>
            </select>
          </div>
          <span class="text-xs text-gray-400">{{ filteredPostulantes.length }} registros</span>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">DNI</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Puesto</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Avance</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Riesgo</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  *ngFor="let p of paginatedPostulantes"
                  class="hover:bg-gray-50 transition-colors cursor-pointer"
                  (click)="openDetailModal(p)"
                >
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ p.nombre }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ p.dni }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ p.puesto }}</td>
                  <td class="px-4 py-3">
                    <app-status-badge [status]="p.estado"></app-status-badge>
                  </td>
                  <td class="px-4 py-3 w-32">
                    <app-progress-bar [value]="p.avance ?? 0" [height]="6"></app-progress-bar>
                    <span class="text-xs text-gray-400 mt-1">{{ p.avance ?? 0 }}%</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-1 rounded-full font-medium"
                      [ngClass]="{
                        'bg-red-50 text-red-700': p.riesgo === 'Alto',
                        'bg-yellow-50 text-yellow-700': p.riesgo === 'Medio',
                        'bg-green-50 text-green-700': p.riesgo === 'Bajo' || !p.riesgo
                      }">
                      {{ p.riesgo || 'N/A' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button
                        (click)="$event.stopPropagation(); openDetailModal(p)"
                        class="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >Ver</button>
                      <button
                        *ngIf="p.estado === 'En Evaluacion'"
                        (click)="$event.stopPropagation(); aprobarPostulante(p)"
                        class="text-green-600 hover:text-green-800 text-xs font-medium"
                      >Aprobar</button>
                      <button
                        *ngIf="p.estado === 'En Evaluacion'"
                        (click)="$event.stopPropagation(); rechazarPostulante(p)"
                        class="text-red-600 hover:text-red-800 text-xs font-medium"
                      >Rechazar</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="paginatedPostulantes.length === 0">
                  <td colspan="7" class="px-4 py-8 text-center text-sm text-gray-400">No se encontraron postulantes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between" *ngIf="totalPages > 1">
            <span class="text-xs text-gray-500">
              Mostrando {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredPostulantes.length) }} de {{ filteredPostulantes.length }}
            </span>
            <div class="flex items-center gap-1">
              <button
                class="px-3 py-1 text-xs rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                [disabled]="currentPage === 1"
                (click)="currentPage = currentPage - 1"
              >Anterior</button>
              <button
                class="px-3 py-1 text-xs rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                [disabled]="currentPage === totalPages"
                (click)="currentPage = currentPage + 1"
              >Siguiente</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Modal -->
      <app-modal [isOpen]="detailModalOpen" [title]="selectedPostulante?.nombre || 'Detalle'" size="lg" (close)="detailModalOpen = false">
        <div *ngIf="selectedPostulante">
          <!-- Info Grid -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span class="text-xs text-gray-400">Nombre</span>
              <p class="text-sm font-medium text-gray-900">{{ selectedPostulante.nombre }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-400">DNI</span>
              <p class="text-sm font-medium text-gray-900">{{ selectedPostulante.dni }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-400">Email</span>
              <p class="text-sm font-medium text-gray-900">{{ selectedPostulante.email }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-400">Puesto</span>
              <p class="text-sm font-medium text-gray-900">{{ selectedPostulante.puesto }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-400">Estado</span>
              <app-status-badge [status]="selectedPostulante.estado"></app-status-badge>
            </div>
            <div>
              <span class="text-xs text-gray-400">Riesgo</span>
              <p class="text-sm font-medium text-gray-900">{{ selectedPostulante.riesgo || 'N/A' }}</p>
            </div>
          </div>

          <!-- Radar Chart -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Evaluaciones</h4>
            <div class="flex justify-center">
              <canvas #radarChartCanvas width="280" height="280"></canvas>
            </div>
          </div>

          <!-- Timeline -->
          <div class="mb-6" *ngIf="selectedPostulante.timeline && selectedPostulante.timeline.length > 0">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Timeline</h4>
            <div class="space-y-3">
              <div *ngFor="let item of selectedPostulante.timeline" class="flex items-start gap-3">
                <div class="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                <div>
                  <p class="text-sm text-gray-900">{{ item.accion }}</p>
                  <p class="text-xs text-gray-400">{{ item.fecha }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              *ngIf="selectedPostulante.estado === 'En Evaluacion'"
              (click)="aprobarPostulante(selectedPostulante); detailModalOpen = false"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >Aprobar</button>
            <button
              *ngIf="selectedPostulante.estado === 'En Evaluacion'"
              (click)="rechazarPostulante(selectedPostulante); detailModalOpen = false"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >Rechazar</button>
            <button
              *ngIf="selectedPostulante.estado === 'Trabajador'"
              (click)="verLegajo(selectedPostulante)"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >Ver Legajo</button>
          </div>
        </div>
      </app-modal>

      <!-- Create Modal -->
      <app-modal [isOpen]="createModalOpen" title="Nuevo Postulante" size="lg" (close)="createModalOpen = false">
        <div class="grid grid-cols-2 gap-4">
          <app-form-field label="Usuario (ID)" type="number" [required]="true" placeholder="ID del usuario" [(ngModel)]="newPostulante.usuario_id"></app-form-field>
          <app-form-field label="Puesto" [required]="true" placeholder="Puesto al que postula" [(ngModel)]="newPostulante.puesto"></app-form-field>
          <app-form-field label="Estado" type="select" [options]="estadoOptions" [(ngModel)]="newPostulante.estado"></app-form-field>
          <app-form-field label="Riesgo" type="select" [options]="riesgoOptions" [(ngModel)]="newPostulante.riesgo"></app-form-field>
          <div class="col-span-2">
            <app-form-field label="Comentarios" type="textarea" placeholder="Comentarios adicionales..." [(ngModel)]="newPostulante.comentarios"></app-form-field>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            (click)="createModalOpen = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >Cancelar</button>
          <button
            (click)="createPostulante()"
            [disabled]="saving"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </app-modal>
    </div>
  `,
})
export class PostulantesComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  @ViewChild('radarChartCanvas') radarChartCanvas!: ElementRef<HTMLCanvasElement>;

  loading = true;
  error = '';
  saving = false;
  Math = Math;

  postulantes: any[] = [];
  filteredPostulantes: any[] = [];
  searchTerm = '';
  filterEstado = '';

  currentPage = 1;
  pageSize = 8;

  detailModalOpen = false;
  createModalOpen = false;
  selectedPostulante: any = null;

  newPostulante: any = {
    usuario_id: null,
    puesto: '',
    estado: 'En Evaluacion',
    riesgo: 'bajo',
    comentarios: '',
  };

  estadoOptions = [
    { value: 'En Evaluacion', label: 'En Evaluacion' },
    { value: 'Nuevo', label: 'Nuevo' },
  ];

  riesgoOptions = [
    { value: 'bajo', label: 'Bajo' },
    { value: 'medio', label: 'Medio' },
    { value: 'alto', label: 'Alto' },
  ];

  private radarChart: Chart | null = null;

  get totalPages(): number {
    return Math.ceil(this.filteredPostulantes.length / this.pageSize);
  }

  get paginatedPostulantes(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPostulantes.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.loadPostulantes();
  }

  loadPostulantes(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/postulantes/`).subscribe({
      next: (data) => {
        this.postulantes = data ?? [];
        this.filterData();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar postulantes.';
        this.loading = false;
        console.error('Postulantes error:', err);
      },
    });
  }

  filterData(): void {
    this.currentPage = 1;
    let result = [...this.postulantes];
    if (this.filterEstado) {
      result = result.filter((p) => p.estado === this.filterEstado);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          (p.nombre ?? '').toLowerCase().includes(term) ||
          (p.dni ?? '').toLowerCase().includes(term) ||
          (p.puesto ?? '').toLowerCase().includes(term)
      );
    }
    this.filteredPostulantes = result;
  }

  openDetailModal(p: any): void {
    this.selectedPostulante = p;
    this.detailModalOpen = true;
    setTimeout(() => this.initRadarChart(), 200);
  }

  openCreateModal(): void {
    this.newPostulante = {
      usuario_id: null,
      puesto: '',
      estado: 'En Evaluacion',
      riesgo: 'bajo',
      comentarios: '',
    };
    this.createModalOpen = true;
  }

  private initRadarChart(): void {
    if (!this.radarChartCanvas?.nativeElement || !this.selectedPostulante) return;
    if (this.radarChart) this.radarChart.destroy();

    const p = this.selectedPostulante;
    this.radarChart = new Chart(this.radarChartCanvas.nativeElement, {
      type: 'radar',
      data: {
        labels: ['Tecnico', 'Psicologico', 'Entrevista'],
        datasets: [
          {
            label: 'Puntuacion',
            data: [
              p.tecnico ?? 0,
              p.psicologico ?? 0,
              p.entrevista ?? 0,
            ],
            backgroundColor: 'rgba(26, 126, 197, 0.2)',
            borderColor: '#1a7ec5',
            borderWidth: 2,
            pointBackgroundColor: '#1a7ec5',
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20, font: { size: 10 } },
            pointLabels: { font: { size: 11 } },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  }

  aprobarPostulante(p: any): void {
    this.http.put(`${this.apiUrl}/postulantes/${p.id}/estado`, null, {
      params: { estado: 'Aprobado' }
    }).subscribe({
      next: () => {
        p.estado = 'Aprobado';
      },
      error: (err) => console.error('Error aprobando:', err),
    });
  }

  rechazarPostulante(p: any): void {
    const comentario = prompt('Motivo de rechazo (opcional):') || '';
    this.http.put(`${this.apiUrl}/postulantes/${p.id}/estado`, null, {
      params: { estado: 'Rechazado', ...(comentario ? { comentario } : {}) }
    }).subscribe({
      next: () => {
        p.estado = 'Rechazado';
      },
      error: (err) => console.error('Error rechazando:', err),
    });
  }

  verLegajo(p: any): void {
    this.detailModalOpen = false;
    window.location.hash = `/admin/legajo?id=${p.id}`;
  }

  createPostulante(): void {
    if (!this.newPostulante.usuario_id || !this.newPostulante.puesto) return;
    this.saving = true;
    this.http.post<any>(`${this.apiUrl}/postulantes/`, this.newPostulante).subscribe({
      next: (created) => {
        this.postulantes.unshift(created);
        this.filterData();
        this.createModalOpen = false;
        this.saving = false;
      },
      error: (err) => {
        console.error('Error creando postulante:', err);
        this.saving = false;
      },
    });
  }
}
