import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-comunicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Comunicaciones</h1>
        <div class="flex items-center gap-2">
          <button
            (click)="openBienvenidaModal()"
            class="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >Enviar Bienvenida</button>
          <button
            (click)="openCesadoModal()"
            class="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >Enviar Aviso Cesado</button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex items-center gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          (click)="switchTab('anuncios')"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          [ngClass]="activeTab === 'anuncios' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >Anuncios</button>
        <button
          (click)="switchTab('cumpleanos')"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          [ngClass]="activeTab === 'cumpleanos' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >Cumpleanos</button>
        <button
          (click)="switchTab('festividades')"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          [ngClass]="activeTab === 'festividades' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >Festividades</button>
        <button
          (click)="switchTab('historial')"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          [ngClass]="activeTab === 'historial' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >Historial</button>
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
        <button (click)="retryCurrentTab()" class="mt-2 text-xs text-red-700 underline">Reintentar</button>
      </div>

      <!-- ==================== TAB: ANUNCIOS ==================== -->
      <div *ngIf="!loading && activeTab === 'anuncios'">
        <!-- Filters + New button -->
        <div class="flex items-center justify-between mb-4">
          <select
            [(ngModel)]="filterTipo"
            (ngModelChange)="applyAnuncioFilter()"
            class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Todos los tipos</option>
            <option value="bienvenida">Bienvenida</option>
            <option value="cesado">Cesado</option>
            <option value="cumpleanos">Cumpleanos</option>
            <option value="festividad">Festividad</option>
            <option value="general">General</option>
          </select>
          <button
            (click)="openCreateAnuncioModal()"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo Anuncio
          </button>
        </div>

        <!-- Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div
            *ngFor="let anuncio of paginatedAnuncios"
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-sm font-semibold text-gray-900 flex-1">{{ anuncio.titulo }}</h3>
              <span
                class="ml-2 px-2 py-0.5 text-xs font-medium rounded-full"
                [ngClass]="tipoBadgeClass(anuncio.tipo)"
              >{{ anuncio.tipo }}</span>
            </div>
            <p class="text-sm text-gray-500 line-clamp-2 mb-3">{{ anuncio.contenido?.substring(0, 120) }}{{ anuncio.contenido?.length > 120 ? '...' : '' }}</p>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-400">{{ anuncio.fecha_publicacion | date:'dd/MM/yyyy' }}</span>
              <div class="flex items-center gap-2">
                <button
                  (click)="sendAnuncioEmail(anuncio)"
                  [disabled]="sendingEmail === anuncio.id"
                  class="px-2.5 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  {{ sendingEmail === anuncio.id ? 'Enviando...' : 'Enviar por Email' }}
                </button>
                <button
                  (click)="openEditAnuncioModal(anuncio)"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  (click)="deleteAnuncio(anuncio)"
                  class="text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredAnuncios.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
          No hay anuncios {{ filterTipo ? 'de tipo ' + filterTipo : '' }}
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages > 1" class="flex items-center justify-between">
          <span class="text-xs text-gray-500">
            Mostrando {{ ((currentPage - 1) * pageSize) + 1 }} a {{ currentPage * pageSize > filteredAnuncios.length ? filteredAnuncios.length : currentPage * pageSize }} de {{ filteredAnuncios.length }}
          </span>
          <div class="flex items-center gap-2">
            <button (click)="currentPage = currentPage - 1" [disabled]="currentPage === 1" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Anterior</button>
            <span class="text-xs text-gray-600">Pagina {{ currentPage }} de {{ totalPages }}</span>
            <button (click)="currentPage = currentPage + 1" [disabled]="currentPage >= totalPages" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Siguiente</button>
          </div>
        </div>
      </div>

      <!-- ==================== TAB: CUMPLEANOS ==================== -->
      <div *ngIf="!loading && activeTab === 'cumpleanos'">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Cumpleanos de Hoy</h2>
          <button
            (click)="enviarFelicitaciones()"
            [disabled]="sendingCumpleanos || cumpleaneros.length === 0"
            class="px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.75 1.75 0 013 15.546V12a9 9 0 0118 0v3.546z"/>
            </svg>
            {{ sendingCumpleanos ? 'Enviando...' : 'Enviar Felicitaciones' }}
          </button>
        </div>

        <div *ngIf="cumpleaneros.length > 0" class="grid gap-3">
          <div
            *ngFor="let persona of cumpleaneros"
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
          >
            <div class="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.75 1.75 0 013 15.546V12a9 9 0 0118 0v3.546z"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900">{{ persona.nombre }}</p>
              <p class="text-xs text-gray-500">{{ persona.puesto || 'Sin puesto asignado' }}</p>
            </div>
            <span class="text-xs text-gray-400">{{ persona.fecha_nacimiento | date:'dd/MM' }}</span>
          </div>
        </div>

        <div *ngIf="cumpleaneros.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
          No hay cumpleanos hoy
        </div>
      </div>

      <!-- ==================== TAB: FESTIVIDADES ==================== -->
      <div *ngIf="!loading && activeTab === 'festividades'">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Festividades</h2>
          <button
            (click)="enviarSaludoFestividad()"
            [disabled]="sendingFestividad"
            class="px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
          >{{ sendingFestividad ? 'Enviando...' : 'Enviar Saludo' }}</button>
        </div>

        <div *ngIf="festividades.length > 0" class="space-y-6">
          <div *ngFor="let group of festividadesByMonth">
            <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">{{ group.month }}</h3>
            <div class="grid gap-2">
              <div
                *ngFor="let fest of group.items"
                class="bg-white rounded-lg shadow-sm border p-3 flex items-center gap-3"
                [ngClass]="fest.is_today ? 'border-purple-300 bg-purple-50' : 'border-gray-100'"
              >
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                  [ngClass]="fest.is_today ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'"
                >{{ fest.dia }}</div>
                <div class="flex-1">
                  <p class="text-sm font-medium" [ngClass]="fest.is_today ? 'text-purple-900' : 'text-gray-900'">{{ fest.nombre }}</p>
                  <p *ngIf="fest.descripcion" class="text-xs text-gray-500">{{ fest.descripcion }}</p>
                </div>
                <span *ngIf="fest.is_today" class="px-2 py-0.5 text-xs font-medium bg-purple-500 text-white rounded-full">HOY</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="festividades.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
          No hay festividades registradas
        </div>
      </div>

      <!-- ==================== TAB: HISTORIAL ==================== -->
      <div *ngIf="!loading && activeTab === 'historial'">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Historial de Comunicaciones</h2>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Destinatario</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Asunto</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let item of historial" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-600">{{ item.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ item.tipo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ item.destinatario }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{{ item.asunto }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="px-2 py-0.5 text-xs font-medium rounded-full"
                      [ngClass]="{
                        'bg-green-100 text-green-700': item.estado === 'enviado',
                        'bg-red-100 text-red-700': item.estado === 'fallido',
                        'bg-yellow-100 text-yellow-700': item.estado === 'pendiente'
                      }"
                    >{{ item.estado }}</span>
                  </td>
                </tr>
                <tr *ngIf="historial.length === 0">
                  <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">No hay registros en el historial</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Success message -->
      <div *ngIf="successMsg" class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50">
        {{ successMsg }}
      </div>

      <!-- ==================== MODAL: Crear/Editar Anuncio ==================== -->
      <div *ngIf="anuncioModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="anuncioModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">{{ editingAnuncio ? 'Editar Anuncio' : 'Nuevo Anuncio' }}</h3>
            <button (click)="anuncioModalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
              <input type="text" [(ngModel)]="anuncioForm.titulo" placeholder="Titulo del anuncio" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contenido *</label>
              <textarea [(ngModel)]="anuncioForm.contenido" rows="5" placeholder="Contenido del anuncio..." class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select [(ngModel)]="anuncioForm.tipo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">Seleccionar...</option>
                  <option value="bienvenida">Bienvenida</option>
                  <option value="cesado">Cesado</option>
                  <option value="cumpleanos">Cumpleanos</option>
                  <option value="festividad">Festividad</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Destinatarios</label>
                <select [(ngModel)]="anuncioForm.destinatarios" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="all">Todos</option>
                  <option value="marketing">Marketing</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Publicacion</label>
              <input type="date" [(ngModel)]="anuncioForm.fecha_publicacion" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button (click)="anuncioModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="saveAnuncio()" [disabled]="savingAnuncio" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{ savingAnuncio ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== MODAL: Seleccionar Postulante (Bienvenida / Cesado) ==================== -->
      <div *ngIf="selectorModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="selectorModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">{{ selectorTitle }}</h3>
            <button (click)="selectorModalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div *ngIf="selectorModalLoading" class="flex items-center justify-center py-8">
              <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div *ngIf="!selectorModalLoading">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Seleccionar Postulante</label>
              <select [(ngModel)]="selectedPostulanteId" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="">Seleccionar...</option>
                <option *ngFor="let p of postulantesOptions" [value]="p.id">{{ p.nombre }} - {{ p.dni }}</option>
              </select>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button (click)="selectorModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="sendSelectorAction()" [disabled]="!selectedPostulanteId || sendingAction" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{ sendingAction ? 'Enviando...' : 'Enviar' }}
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ComunicacionesComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  activeTab: 'anuncios' | 'cumpleanos' | 'festividades' | 'historial' = 'anuncios';
  loading = false;
  error = '';
  successMsg = '';

  // ---- Anuncios ----
  anuncios: any[] = [];
  filteredAnuncios: any[] = [];
  filterTipo = '';
  currentPage = 1;
  pageSize = 8;
  sendingEmail: number | null = null;
  anuncioModalOpen = false;
  editingAnuncio: any = null;
  savingAnuncio = false;
  anuncioForm: any = { titulo: '', contenido: '', tipo: '', destinatarios: 'all', fecha_publicacion: '' };

  // ---- Cumpleanos ----
  cumpleaneros: any[] = [];
  sendingCumpleanos = false;

  // ---- Festividades ----
  festividades: any[] = [];
  festividadesByMonth: { month: string; items: any[] }[] = [];
  sendingFestividad = false;

  // ---- Historial ----
  historial: any[] = [];

  // ---- Selector modal (Bienvenida / Cesado) ----
  selectorModalOpen = false;
  selectorModalLoading = false;
  selectorTitle = '';
  selectorAction: 'bienvenida' | 'cesado' = 'bienvenida';
  selectedPostulanteId = '';
  postulantesOptions: any[] = [];
  sendingAction = false;

  private monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  get totalPages(): number {
    return Math.ceil(this.filteredAnuncios.length / this.pageSize) || 1;
  }

  get paginatedAnuncios(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAnuncios.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.loadAnuncios();
  }

  switchTab(tab: 'anuncios' | 'cumpleanos' | 'festividades' | 'historial'): void {
    this.activeTab = tab;
    this.error = '';
    if (tab === 'anuncios') this.loadAnuncios();
    else if (tab === 'cumpleanos') this.loadCumpleanos();
    else if (tab === 'festividades') this.loadFestividades();
    else if (tab === 'historial') this.loadHistorial();
  }

  retryCurrentTab(): void {
    this.switchTab(this.activeTab);
  }

  // ==================== ANUNCIOS ====================

  loadAnuncios(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/anuncios/`).subscribe({
      next: (data) => {
        this.anuncios = data ?? [];
        this.applyAnuncioFilter();
        this.loading = false;
      },
      error: (err) => {
        this.anuncios = [];
        this.filteredAnuncios = [];
        this.error = 'Error al cargar anuncios.';
        this.loading = false;
        console.error('Anuncios error:', err);
      },
    });
  }

  applyAnuncioFilter(): void {
    this.currentPage = 1;
    this.filteredAnuncios = this.filterTipo
      ? this.anuncios.filter(a => a.tipo === this.filterTipo)
      : [...this.anuncios];
  }

  tipoBadgeClass(tipo: string): Record<string, boolean> {
    return {
      'bg-green-100 text-green-700': tipo === 'bienvenida',
      'bg-red-100 text-red-700': tipo === 'cesado',
      'bg-pink-100 text-pink-700': tipo === 'cumpleanos',
      'bg-purple-100 text-purple-700': tipo === 'festividad',
      'bg-gray-100 text-gray-700': tipo === 'general',
    };
  }

  openCreateAnuncioModal(): void {
    this.editingAnuncio = null;
    this.anuncioForm = { titulo: '', contenido: '', tipo: '', destinatarios: 'all', fecha_publicacion: new Date().toISOString().split('T')[0] };
    this.anuncioModalOpen = true;
  }

  openEditAnuncioModal(anuncio: any): void {
    this.editingAnuncio = anuncio;
    this.anuncioForm = {
      titulo: anuncio.titulo,
      contenido: anuncio.contenido,
      tipo: anuncio.tipo,
      destinatarios: anuncio.destinatarios || 'all',
      fecha_publicacion: anuncio.fecha_publicacion?.split('T')[0] || '',
    };
    this.anuncioModalOpen = true;
  }

  saveAnuncio(): void {
    if (!this.anuncioForm.titulo || !this.anuncioForm.tipo) return;
    this.savingAnuncio = true;
    this.error = '';

    const payload = {
      titulo: this.anuncioForm.titulo,
      contenido: this.anuncioForm.contenido,
      tipo: this.anuncioForm.tipo,
      destinatarios: this.anuncioForm.destinatarios,
      fecha_publicacion: this.anuncioForm.fecha_publicacion || null,
    };

    const url = this.editingAnuncio
      ? `${this.apiUrl}/anuncios/${this.editingAnuncio.id}`
      : `${this.apiUrl}/anuncios/`;
    const req = this.editingAnuncio
      ? this.http.put<any>(url, payload)
      : this.http.post<any>(url, payload);

    req.subscribe({
      next: () => {
        this.anuncioModalOpen = false;
        this.savingAnuncio = false;
        this.showSuccess(this.editingAnuncio ? 'Anuncio actualizado exitosamente' : 'Anuncio creado exitosamente');
        this.loadAnuncios();
      },
      error: (err) => {
        this.error = 'Error al guardar anuncio.';
        this.savingAnuncio = false;
        console.error('Save anuncio error:', err);
      },
    });
  }

  deleteAnuncio(anuncio: any): void {
    if (!confirm('Eliminar este anuncio?')) return;
    this.http.delete(`${this.apiUrl}/anuncios/${anuncio.id}`).subscribe({
      next: () => {
        this.showSuccess('Anuncio eliminado');
        this.loadAnuncios();
      },
      error: (err) => console.error('Error eliminando anuncio:', err),
    });
  }

  sendAnuncioEmail(anuncio: any): void {
    this.sendingEmail = anuncio.id;
    this.http.post<any>(`${this.apiUrl}/anuncios/${anuncio.id}/enviar`, {}).subscribe({
      next: () => {
        this.sendingEmail = null;
        this.showSuccess('Anuncio enviado por email exitosamente');
      },
      error: (err) => {
        this.sendingEmail = null;
        console.error('Send email error:', err);
        this.error = 'Error al enviar el anuncio por email.';
      },
    });
  }

  // ==================== CUMPLEANOS ====================

  loadCumpleanos(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/comunicaciones/cumpleanos-hoy`).subscribe({
      next: (data) => {
        this.cumpleaneros = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.cumpleaneros = [];
        this.error = 'Error al cargar cumpleanos.';
        this.loading = false;
        console.error('Cumpleanos error:', err);
      },
    });
  }

  enviarFelicitaciones(): void {
    this.sendingCumpleanos = true;
    this.http.post<any>(`${this.apiUrl}/comunicaciones/cumpleanos`, {}).subscribe({
      next: () => {
        this.sendingCumpleanos = false;
        this.showSuccess('Felicitaciones enviadas exitosamente');
      },
      error: (err) => {
        this.sendingCumpleanos = false;
        const detail = err?.error?.detail || '';
        if (detail.includes('No hay') || detail.includes('cumple')) {
          this.showSuccess('No hay cumpleaños hoy. Las felicitaciones se envían cuando hay cumpleañeros.');
        } else {
          this.error = detail || 'Error al enviar felicitaciones.';
        }
      },
    });
  }

  // ==================== FESTIVIDADES ====================

  loadFestividades(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/comunicaciones/festividades`).subscribe({
      next: (data) => {
        this.festividades = data ?? [];
        this.groupFestividades();
        this.loading = false;
      },
      error: (err) => {
        this.festividades = [];
        this.festividadesByMonth = [];
        this.error = 'Error al cargar festividades.';
        this.loading = false;
        console.error('Festividades error:', err);
      },
    });
  }

  private groupFestividades(): void {
    const today = new Date();
    const todayStr = `${today.getMonth() + 1}-${today.getDate()}`;
    const groups: Record<string, any[]> = {};

    for (const fest of this.festividades) {
      const fecha = new Date(fest.fecha);
      const monthIdx = fecha.getMonth();
      const monthName = this.monthNames[monthIdx] || 'Desconocido';
      const festItem = {
        ...fest,
        dia: fecha.getDate(),
        is_today: `${fecha.getMonth() + 1}-${fecha.getDate()}` === todayStr,
      };
      if (!groups[monthName]) groups[monthName] = [];
      groups[monthName].push(festItem);
    }

    this.festividadesByMonth = Object.entries(groups).map(([month, items]) => ({ month, items }));
  }

  enviarSaludoFestividad(): void {
    this.sendingFestividad = true;
    this.http.post<any>(`${this.apiUrl}/comunicaciones/festividad`, {}).subscribe({
      next: () => {
        this.sendingFestividad = false;
        this.showSuccess('Saludo de festividad enviado exitosamente');
      },
      error: (err) => {
        this.sendingFestividad = false;
        const detail = err?.error?.detail || '';
        if (detail.includes('No hay festividad')) {
          this.showSuccess('No hay festividad activa para hoy. Los saludos se envían en fechas de festividad.');
        } else {
          this.error = detail || 'Error al enviar saludo de festividad.';
        }
      },
    });
  }

  // ==================== HISTORIAL ====================

  loadHistorial(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/comunicaciones/historial`).subscribe({
      next: (data) => {
        this.historial = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.historial = [];
        this.error = 'Error al cargar historial.';
        this.loading = false;
        console.error('Historial error:', err);
      },
    });
  }

  // ==================== BIENVENIDA / CESADO ====================

  openBienvenidaModal(): void {
    this.selectorTitle = 'Enviar Bienvenida';
    this.selectorAction = 'bienvenida';
    this.selectedPostulanteId = '';
    this.selectorModalOpen = true;
    this.loadPostulantesForSelector();
  }

  openCesadoModal(): void {
    this.selectorTitle = 'Enviar Aviso de Cesado';
    this.selectorAction = 'cesado';
    this.selectedPostulanteId = '';
    this.selectorModalOpen = true;
    this.loadPostulantesForSelector();
  }

  private loadPostulantesForSelector(): void {
    this.selectorModalLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/postulantes/`).subscribe({
      next: (data) => {
        this.postulantesOptions = data ?? [];
        this.selectorModalLoading = false;
      },
      error: () => {
        this.postulantesOptions = [];
        this.selectorModalLoading = false;
      },
    });
  }

  sendSelectorAction(): void {
    if (!this.selectedPostulanteId) return;
    this.sendingAction = true;
    const url = `${this.apiUrl}/comunicaciones/${this.selectorAction}/${this.selectedPostulanteId}`;
    this.http.post<any>(url, {}).subscribe({
      next: () => {
        this.sendingAction = false;
        this.selectorModalOpen = false;
        this.showSuccess(this.selectorAction === 'bienvenida' ? 'Bienvenida enviada exitosamente' : 'Aviso de cesado enviado exitosamente');
      },
      error: (err) => {
        this.sendingAction = false;
        this.error = `Error al enviar ${this.selectorAction}.`;
        console.error(`Send ${this.selectorAction} error:`, err);
      },
    });
  }

  // ==================== UTILS ====================

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => (this.successMsg = ''), 3000);
  }
}
