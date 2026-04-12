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
import { AuthService } from '../../core/services/auth.service';

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

          <!-- Cadena de Aprobacion -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-gray-700">Cadena de Aprobacion</h4>
              <button
                (click)="openConfigurarAprobadores()"
                class="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >Configurar Aprobadores</button>
            </div>
            <div *ngIf="aprobadoresLoading" class="flex items-center justify-center py-6">
              <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div *ngIf="!aprobadoresLoading && aprobadores.length === 0" class="text-sm text-gray-400 bg-gray-50 rounded-lg p-4 text-center">
              No hay aprobadores asignados
            </div>
            <div *ngIf="!aprobadoresLoading && aprobadores.length > 0" class="space-y-2">
              <div *ngFor="let ap of aprobadores" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {{ ap.orden }}
                </span>
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {{ getInitials(ap.usuario_nombre) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ ap.usuario_nombre || 'Sin nombre' }}</p>
                  <p class="text-xs text-gray-500">{{ ap.usuario_area || 'Sin area' }}</p>
                </div>
                <span class="text-xs px-2 py-1 rounded-full font-medium"
                  [ngClass]="{
                    'bg-gray-100 text-gray-600': ap.estado === 'pendiente',
                    'bg-green-100 text-green-700': ap.estado === 'aprobado',
                    'bg-red-100 text-red-700': ap.estado === 'rechazado',
                    'bg-gray-100 text-gray-400 line-through': ap.estado === 'omitido'
                  }">
                  {{ ap.estado }}
                </span>
              </div>
            </div>
            <!-- Inline approve/reject if current user is active approver -->
            <div *ngIf="miAprobacionActiva" class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p class="text-sm font-medium text-amber-800 mb-2">Es tu turno de aprobar</p>
              <div class="flex items-center gap-2">
                <button
                  (click)="aprobarComoAprobador()"
                  class="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >Aprobar</button>
                <button
                  (click)="rechazarComoAprobador()"
                  class="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >Rechazar</button>
              </div>
            </div>
            <!-- Approval history/timeline -->
            <div *ngIf="aprobadoresConAccion.length > 0" class="mt-3">
              <h5 class="text-xs font-semibold text-gray-500 uppercase mb-2">Historial</h5>
              <div class="space-y-1">
                <div *ngFor="let ap of aprobadoresConAccion" class="flex items-center gap-2 text-xs text-gray-500">
                  <span class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    [ngClass]="ap.estado === 'aprobado' ? 'bg-green-500' : 'bg-red-500'"></span>
                  <span>{{ ap.usuario_nombre }} - {{ ap.estado }}</span>
                  <span *ngIf="ap.fecha_accion" class="text-gray-400">{{ ap.fecha_accion | date:'short' }}</span>
                  <span *ngIf="ap.comentario" class="text-gray-400 italic truncate">{{ ap.comentario }}</span>
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
      <!-- Configurar Aprobadores Modal (inline) -->
      <div *ngIf="configAprobadoresOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" (click)="configAprobadoresOpen = false"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 z-10 max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Configurar Aprobadores</h3>
            <button (click)="configAprobadoresOpen = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div *ngIf="configAprobadoresLoading" class="flex items-center justify-center py-12">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <div *ngIf="!configAprobadoresLoading" class="grid grid-cols-2 gap-4">
            <!-- Left: Available users -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">Usuarios Disponibles</h4>
              <div class="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                <div
                  *ngFor="let u of availableUsers"
                  class="flex items-center justify-between p-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                  (click)="addAprobadorToChain(u)"
                >
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ u.nombre }}</p>
                    <p class="text-xs text-gray-500">{{ u.area || 'Sin area' }} - {{ u.rol }}</p>
                  </div>
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                </div>
                <div *ngIf="availableUsers.length === 0" class="p-4 text-center text-xs text-gray-400">
                  No hay usuarios disponibles
                </div>
              </div>
            </div>

            <!-- Right: Selected chain -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-2">Cadena de Aprobacion</h4>
              <div class="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                <div
                  *ngFor="let item of chainAprobadores; let i = index"
                  class="flex items-center gap-2 p-2.5 border-b border-gray-100 last:border-0"
                >
                  <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {{ i + 1 }}
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ item.nombre }}</p>
                  </div>
                  <button (click)="moveAprobadorUp(i)" [disabled]="i === 0" class="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                    </svg>
                  </button>
                  <button (click)="moveAprobadorDown(i)" [disabled]="i === chainAprobadores.length - 1" class="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  <button (click)="removeAprobadorFromChain(i)" class="text-red-400 hover:text-red-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <div *ngIf="chainAprobadores.length === 0" class="p-4 text-center text-xs text-gray-400">
                  Agrega usuarios a la cadena
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              (click)="configAprobadoresOpen = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >Cancelar</button>
            <button
              (click)="guardarAprobadores()"
              [disabled]="savingAprobadores"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ savingAprobadores ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
      <!-- Success Toast -->
      <div *ngIf="successMsg" class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span class="text-sm font-medium">{{ successMsg }}</span>
      </div>

      <!-- Error Toast -->
      <div *ngIf="errorMsg" class="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span class="text-sm font-medium">{{ errorMsg }}</span>
      </div>
    </div>
  `,
})
export class PostulantesComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
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

  // Aprobadores
  aprobadores: any[] = [];
  aprobadoresLoading = false;
  configAprobadoresLoading = false;
  miAprobacionActiva: any = null;
  configAprobadoresOpen = false;
  availableUsers: any[] = [];
  chainAprobadores: any[] = [];
  savingAprobadores = false;

  successMsg = '';
  errorMsg = '';

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
    this.loadAprobadores(p.id);
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
      next: () => {
        this.createModalOpen = false;
        this.saving = false;
        this.showSuccess('Postulante creado exitosamente');
        this.loadPostulantes();
      },
      error: (err) => {
        this.saving = false;
        this.showError(err?.error?.detail || 'Error al crear postulante');
      },
    });
  }

  // --- Aprobadores ---

  loadAprobadores(postulanteId: number): void {
    this.aprobadores = [];
    this.miAprobacionActiva = null;
    this.aprobadoresLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/aprobadores/${postulanteId}`).subscribe({
      next: (data) => {
        this.aprobadores = data ?? [];
        this.aprobadoresLoading = false;
        this.checkMiAprobacion();
      },
      error: () => {
        this.aprobadores = [];
        this.aprobadoresLoading = false;
      },
    });
  }

  private checkMiAprobacion(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.miAprobacionActiva = null;
      return;
    }
    // Find if current user is a pending approver and it's their turn
    for (const ap of this.aprobadores) {
      if (ap.usuario_id === currentUser.id && ap.estado === 'pendiente') {
        const anteriores = this.aprobadores.filter((a: any) => a.orden < ap.orden);
        const todosAprobados = anteriores.every((a: any) => a.estado === 'aprobado');
        if (todosAprobados) {
          this.miAprobacionActiva = ap;
          return;
        }
      }
    }
    this.miAprobacionActiva = null;
  }

  get aprobadoresConAccion(): any[] {
    return this.aprobadores.filter((a: any) => a.estado === 'aprobado' || a.estado === 'rechazado');
  }

  getInitials(nombre: string | null): string {
    if (!nombre) return '?';
    return nombre.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  openConfigurarAprobadores(): void {
    this.chainAprobadores = this.aprobadores
      .filter((a: any) => a.estado === 'pendiente' || a.estado === 'aprobado')
      .map((a: any) => ({
        usuario_id: a.usuario_id,
        nombre: a.usuario_nombre || 'Sin nombre',
      }));

    // Load available users
    this.configAprobadoresLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/usuarios/`, { params: { rol: 'admin,evaluador' } }).subscribe({
      next: (users) => {
        this.availableUsers = (users ?? []).filter(
          (u: any) => !this.chainAprobadores.some((c: any) => c.usuario_id === u.id)
        );
        this.configAprobadoresLoading = false;
      },
      error: () => {
        this.availableUsers = [];
        this.configAprobadoresLoading = false;
      },
    });

    this.configAprobadoresOpen = true;
  }

  addAprobadorToChain(user: any): void {
    this.chainAprobadores.push({ usuario_id: user.id, nombre: user.nombre });
    this.availableUsers = this.availableUsers.filter((u: any) => u.id !== user.id);
  }

  removeAprobadorFromChain(index: number): void {
    const removed = this.chainAprobadores.splice(index, 1)[0];
    // Re-add to available
    this.availableUsers.push({ id: removed.usuario_id, nombre: removed.nombre, area: '', rol: '' });
  }

  moveAprobadorUp(index: number): void {
    if (index <= 0) return;
    const temp = this.chainAprobadores[index];
    this.chainAprobadores[index] = this.chainAprobadores[index - 1];
    this.chainAprobadores[index - 1] = temp;
  }

  moveAprobadorDown(index: number): void {
    if (index >= this.chainAprobadores.length - 1) return;
    const temp = this.chainAprobadores[index];
    this.chainAprobadores[index] = this.chainAprobadores[index + 1];
    this.chainAprobadores[index + 1] = temp;
  }

  guardarAprobadores(): void {
    if (!this.selectedPostulante) return;
    this.savingAprobadores = true;
    const body = {
      aprobadores: this.chainAprobadores.map((c: any, i: number) => ({
        usuario_id: c.usuario_id,
        orden: i + 1,
      })),
    };
    this.http.post(`${this.apiUrl}/aprobadores/${this.selectedPostulante.id}`, body).subscribe({
      next: () => {
        this.configAprobadoresOpen = false;
        this.savingAprobadores = false;
        this.showSuccess('Aprobadores guardados exitosamente');
        this.loadAprobadores(this.selectedPostulante.id);
      },
      error: (err) => {
        this.savingAprobadores = false;
        this.showError(err?.error?.detail || 'Error al guardar aprobadores');
      },
    });
  }

  aprobarComoAprobador(): void {
    if (!this.miAprobacionActiva) return;
    const comentario = prompt('Comentario (opcional):') || '';
    this.http.post(`${this.apiUrl}/aprobadores/${this.miAprobacionActiva.id}/aprobar`, { comentario }).subscribe({
      next: () => {
        if (this.selectedPostulante) this.loadAprobadores(this.selectedPostulante.id);
        this.loadPostulantes();
      },
      error: (err) => console.error('Error aprobando:', err),
    });
  }

  rechazarComoAprobador(): void {
    if (!this.miAprobacionActiva) return;
    const comentario = prompt('Motivo de rechazo (opcional):') || '';
    this.http.post(`${this.apiUrl}/aprobadores/${this.miAprobacionActiva.id}/rechazar`, { comentario }).subscribe({
      next: () => {
        if (this.selectedPostulante) this.loadAprobadores(this.selectedPostulante.id);
        this.loadPostulantes();
      },
      error: (err) => console.error('Error rechazando:', err),
    });
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 4000);
  }
}
