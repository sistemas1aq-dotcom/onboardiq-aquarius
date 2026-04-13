import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-capacitaciones-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Gestion de Capacitaciones</h1>
        <button
          (click)="openCreateModal()"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Nueva Capacitacion
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
      </div>

      <!-- Cards Grid -->
      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <div
          *ngFor="let cap of paginatedItems"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between">
            <h3 class="text-sm font-semibold text-gray-900 line-clamp-2">{{ cap.nombre }}</h3>
            <span
              *ngIf="cap.obligatoria"
              class="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full flex-shrink-0 ml-2"
            >Obligatoria</span>
          </div>
          <p class="text-xs text-gray-500 line-clamp-2 flex-1">{{ cap.descripcion || 'Sin descripcion' }}</p>
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span>Limite: {{ cap.fecha_limite | date:'dd/MM/yyyy' }}</span>
            <span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{{ cap.asignados_count ?? 0 }} asignados</span>
          </div>
          <div class="flex items-center gap-1 pt-2 border-t border-gray-100">
            <button (click)="openEditModal(cap)" class="flex-1 px-2 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">Editar</button>
            <button (click)="openAsignarModal(cap)" class="flex-1 px-2 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">Asignar</button>
            <button (click)="openProgresoModal(cap)" class="flex-1 px-2 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">Progreso</button>
            <button (click)="confirmDelete(cap)" class="px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && capacitaciones.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
        No hay capacitaciones registradas
      </div>

      <!-- Pagination -->
      <div *ngIf="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
        <button
          (click)="currentPage = currentPage - 1"
          [disabled]="currentPage === 1"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >Anterior</button>
        <span class="text-sm text-gray-600">Pagina {{ currentPage }} de {{ totalPages }}</span>
        <button
          (click)="currentPage = currentPage + 1"
          [disabled]="currentPage === totalPages"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >Siguiente</button>
      </div>

      <!-- Create/Edit Modal -->
      <div *ngIf="formModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="formModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">{{ editingCap ? 'Editar' : 'Nueva' }} Capacitacion</h3>
            <button (click)="formModalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input [(ngModel)]="formData.nombre" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Nombre de la capacitacion">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
              <textarea [(ngModel)]="formData.descripcion" rows="3" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Descripcion"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Limite</label>
              <input [(ngModel)]="formData.fecha_limite" type="date" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            </div>
            <div class="flex items-center gap-2">
              <input [(ngModel)]="formData.obligatoria" type="checkbox" id="obligatoria" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
              <label for="obligatoria" class="text-sm font-medium text-gray-700">Obligatoria</label>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button (click)="formModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="saveCapacitacion()" [disabled]="saving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Asignar Modal -->
      <div *ngIf="asignarModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="asignarModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Asignar Personal</h3>
            <button (click)="asignarModalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="px-6 py-4">
            <p class="text-sm text-gray-500 mb-4">Capacitacion: <strong>{{ selectedCap?.nombre }}</strong></p>
            <div *ngIf="loadingTrabajadores" class="flex items-center justify-center py-8">
              <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div *ngIf="!loadingTrabajadores" class="max-h-64 overflow-y-auto space-y-2">
              <label
                *ngFor="let t of trabajadores"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  [checked]="selectedTrabajadorIds.has(t.id)"
                  (change)="toggleTrabajador(t.id)"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                >
                <span class="text-sm text-gray-700">{{ t.nombre }} {{ t.apellido_paterno || '' }}</span>
              </label>
              <div *ngIf="trabajadores.length === 0" class="text-sm text-gray-400 text-center py-4">No hay trabajadores disponibles</div>
            </div>
            <div class="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
              <button (click)="asignarModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="saveAsignacion()" [disabled]="saving" class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {{ saving ? 'Guardando...' : 'Guardar Asignacion' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Progreso Modal -->
      <div *ngIf="progresoModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="progresoModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Progreso de Capacitacion</h3>
            <button (click)="progresoModalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="px-6 py-4">
            <p class="text-sm text-gray-500 mb-4">{{ selectedCap?.nombre }}</p>
            <div *ngIf="loadingProgreso" class="flex items-center justify-center py-8">
              <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div *ngIf="!loadingProgreso" class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trabajador</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cumplimiento</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-48">Progreso</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr *ngFor="let p of progresoData" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ p.trabajador_nombre }}</td>
                    <td class="px-4 py-3 text-sm font-semibold" [ngClass]="p.cumplimiento >= 100 ? 'text-green-600' : 'text-blue-600'">{{ p.cumplimiento }}%</td>
                    <td class="px-4 py-3">
                      <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          class="h-2.5 rounded-full transition-all"
                          [ngClass]="p.cumplimiento >= 100 ? 'bg-green-500' : 'bg-blue-500'"
                          [style.width.%]="p.cumplimiento"
                        ></div>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="progresoData.length === 0">
                    <td colspan="3" class="px-4 py-8 text-center text-sm text-gray-400">No hay datos de progreso</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirm Modal -->
      <div *ngIf="deleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="deleteModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
          <div class="px-6 py-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmar Eliminacion</h3>
            <p class="text-sm text-gray-500">Esta seguro que desea eliminar la capacitacion <strong>{{ deletingCap?.nombre }}</strong>?</p>
            <div class="flex justify-end gap-3 pt-4 mt-4">
              <button (click)="deleteModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="deleteCapacitacion()" [disabled]="saving" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                {{ saving ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Success -->
      <div *ngIf="successMsg" class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50">
        {{ successMsg }}
      </div>
    </div>
  `,
})
export class CapacitacionesAdminComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  capacitaciones: any[] = [];
  loading = false;
  error = '';
  successMsg = '';
  saving = false;

  // Pagination
  currentPage = 1;
  pageSize = 8;

  // Form modal
  formModalOpen = false;
  editingCap: any = null;
  formData = { nombre: '', descripcion: '', fecha_limite: '', obligatoria: false };

  // Asignar modal
  asignarModalOpen = false;
  selectedCap: any = null;
  trabajadores: any[] = [];
  selectedTrabajadorIds = new Set<number>();
  loadingTrabajadores = false;

  // Progreso modal
  progresoModalOpen = false;
  progresoData: any[] = [];
  loadingProgreso = false;

  // Delete modal
  deleteModalOpen = false;
  deletingCap: any = null;

  ngOnInit(): void {
    this.loadCapacitaciones();
  }

  get totalPages(): number {
    return Math.ceil(this.capacitaciones.length / this.pageSize);
  }

  get paginatedItems(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.capacitaciones.slice(start, start + this.pageSize);
  }

  loadCapacitaciones(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/capacitaciones/`).subscribe({
      next: (data) => {
        this.capacitaciones = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.capacitaciones = [];
        this.error = 'Error al cargar capacitaciones.';
        this.loading = false;
        console.error('Capacitaciones load error:', err);
      },
    });
  }

  openCreateModal(): void {
    this.editingCap = null;
    this.formData = { nombre: '', descripcion: '', fecha_limite: '', obligatoria: false };
    this.formModalOpen = true;
  }

  openEditModal(cap: any): void {
    this.editingCap = cap;
    this.formData = {
      nombre: cap.nombre || '',
      descripcion: cap.descripcion || '',
      fecha_limite: cap.fecha_limite ? cap.fecha_limite.substring(0, 10) : '',
      obligatoria: cap.obligatoria || false,
    };
    this.formModalOpen = true;
  }

  saveCapacitacion(): void {
    if (!this.formData.nombre) return;
    this.saving = true;

    const payload = { ...this.formData };
    const req = this.editingCap
      ? this.http.put(`${this.apiUrl}/capacitaciones/${this.editingCap.id}`, payload)
      : this.http.post(`${this.apiUrl}/capacitaciones/`, payload);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.formModalOpen = false;
        this.showSuccess(this.editingCap ? 'Capacitacion actualizada' : 'Capacitacion creada');
        this.loadCapacitaciones();
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Error al guardar capacitacion.';
        console.error('Save error:', err);
      },
    });
  }

  confirmDelete(cap: any): void {
    this.deletingCap = cap;
    this.deleteModalOpen = true;
  }

  deleteCapacitacion(): void {
    if (!this.deletingCap) return;
    this.saving = true;
    this.http.delete(`${this.apiUrl}/capacitaciones/${this.deletingCap.id}`).subscribe({
      next: () => {
        this.saving = false;
        this.deleteModalOpen = false;
        this.showSuccess('Capacitacion eliminada');
        this.loadCapacitaciones();
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Error al eliminar capacitacion.';
        console.error('Delete error:', err);
      },
    });
  }

  openAsignarModal(cap: any): void {
    this.selectedCap = cap;
    this.selectedTrabajadorIds = new Set<number>();
    this.asignarModalOpen = true;
    this.loadTrabajadores(cap);
  }

  private loadTrabajadores(cap: any): void {
    this.loadingTrabajadores = true;
    // Cargar todos los usuarios activos excepto postulantes
    this.http.get<any[]>(`${this.apiUrl}/usuarios/`).subscribe({
      next: (data) => {
        this.trabajadores = (data ?? [])
          .filter((u: any) => u.activo && u.rol !== 'postulante')
          .map((u: any) => ({ id: u.id, nombre: u.nombre, puesto: u.cargo || u.area || u.rol, dni: u.dni }));
        // Pre-select already assigned
        if (cap.asignados && Array.isArray(cap.asignados)) {
          cap.asignados.forEach((id: number) => this.selectedTrabajadorIds.add(id));
        }
        this.loadingTrabajadores = false;
      },
      error: () => {
        this.trabajadores = [];
        this.loadingTrabajadores = false;
      },
    });
  }

  toggleTrabajador(id: number): void {
    if (this.selectedTrabajadorIds.has(id)) {
      this.selectedTrabajadorIds.delete(id);
    } else {
      this.selectedTrabajadorIds.add(id);
    }
  }

  saveAsignacion(): void {
    if (!this.selectedCap) return;
    this.saving = true;
    const payload = { trabajador_ids: Array.from(this.selectedTrabajadorIds) };
    this.http.post(`${this.apiUrl}/capacitaciones/${this.selectedCap.id}/asignar`, payload).subscribe({
      next: () => {
        this.saving = false;
        this.asignarModalOpen = false;
        this.showSuccess('Asignacion guardada');
        this.loadCapacitaciones();
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Error al guardar asignacion.';
        console.error('Asignar error:', err);
      },
    });
  }

  openProgresoModal(cap: any): void {
    this.selectedCap = cap;
    this.progresoData = [];
    this.progresoModalOpen = true;
    this.loadingProgreso = true;
    this.http.get<any[]>(`${this.apiUrl}/capacitaciones/${cap.id}/progreso`).subscribe({
      next: (data) => {
        this.progresoData = data ?? [];
        this.loadingProgreso = false;
      },
      error: () => {
        this.progresoData = [];
        this.loadingProgreso = false;
      },
    });
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => (this.successMsg = ''), 3000);
  }
}
