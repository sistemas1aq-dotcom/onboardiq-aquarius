import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-maestros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Maestros</h1>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          (click)="activeTab = 'areas'"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          [ngClass]="activeTab === 'areas' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
        >Areas</button>
        <button
          (click)="activeTab = 'cargos'; loadCargos()"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          [ngClass]="activeTab === 'cargos' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
        >Cargos</button>
      </div>

      <!-- ═══ AREAS TAB ═══ -->
      <div *ngIf="activeTab === 'areas'">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 border-b border-gray-100 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">{{ filteredAreas.length }} areas</span>
            <button (click)="openAreaModal()" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Nueva Area
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descripcion</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let a of paginatedAreas" class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ a.nombre }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ a.descripcion || '-' }}</td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-1 rounded-full font-medium" [ngClass]="a.activa ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
                      {{ a.activa ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button (click)="openAreaModal(a)" class="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                      <button (click)="deleteArea(a)" class="text-red-600 hover:text-red-800 text-xs font-medium">Eliminar</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredAreas.length === 0">
                  <td colspan="4" class="px-4 py-8 text-center text-sm text-gray-400">No hay areas registradas</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div *ngIf="areaTotalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span class="text-xs text-gray-500">Pagina {{ areaPage }} de {{ areaTotalPages }}</span>
            <div class="flex items-center gap-2">
              <button (click)="areaPage = areaPage - 1" [disabled]="areaPage === 1" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Anterior</button>
              <button (click)="areaPage = areaPage + 1" [disabled]="areaPage >= areaTotalPages" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Siguiente</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ CARGOS TAB ═══ -->
      <div *ngIf="activeTab === 'cargos'">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <select [(ngModel)]="cargoFilterAreaId" (ngModelChange)="cargoPage = 1" class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option [ngValue]="null">Todas las areas</option>
                <option *ngFor="let a of areas" [ngValue]="a.id">{{ a.nombre }}</option>
              </select>
              <span class="text-sm text-gray-500">{{ filteredCargos.length }} cargos</span>
            </div>
            <button (click)="openCargoModal()" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Nuevo Cargo
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Area</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descripcion</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let c of paginatedCargos" class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ c.nombre }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ c.area_nombre || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ c.descripcion || '-' }}</td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-1 rounded-full font-medium" [ngClass]="c.activo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
                      {{ c.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button (click)="openCargoModal(c)" class="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                      <button (click)="deleteCargo(c)" class="text-red-600 hover:text-red-800 text-xs font-medium">Eliminar</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredCargos.length === 0">
                  <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">No hay cargos registrados</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="cargoTotalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span class="text-xs text-gray-500">Pagina {{ cargoPage }} de {{ cargoTotalPages }}</span>
            <div class="flex items-center gap-2">
              <button (click)="cargoPage = cargoPage - 1" [disabled]="cargoPage === 1" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Anterior</button>
              <button (click)="cargoPage = cargoPage + 1" [disabled]="cargoPage >= cargoTotalPages" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Siguiente</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ AREA MODAL ═══ -->
      <div *ngIf="areaModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="areaModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">{{ editingArea ? 'Editar Area' : 'Nueva Area' }}</h3>
            <button (click)="areaModalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" [(ngModel)]="areaForm.nombre" placeholder="Nombre del area" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
              <input type="text" [(ngModel)]="areaForm.descripcion" placeholder="Descripcion (opcional)" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button (click)="areaModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="saveArea()" [disabled]="saving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{ saving ? 'Guardando...' : (editingArea ? 'Guardar' : 'Crear') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ CARGO MODAL ═══ -->
      <div *ngIf="cargoModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="cargoModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">{{ editingCargo ? 'Editar Cargo' : 'Nuevo Cargo' }}</h3>
            <button (click)="cargoModalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" [(ngModel)]="cargoForm.nombre" placeholder="Nombre del cargo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Area *</label>
              <select [(ngModel)]="cargoForm.area_id" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option [ngValue]="null">Seleccionar area...</option>
                <option *ngFor="let a of areas" [ngValue]="a.id">{{ a.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
              <input type="text" [(ngModel)]="cargoForm.descripcion" placeholder="Descripcion (opcional)" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button (click)="cargoModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="saveCargo()" [disabled]="saving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{ saving ? 'Guardando...' : (editingCargo ? 'Guardar' : 'Crear') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirm Delete Modal -->
      <div *ngIf="confirmDeleteOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="confirmDeleteOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
          <div class="px-6 py-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmar eliminacion</h3>
            <p class="text-sm text-gray-600">{{ confirmDeleteMsg }}</p>
          </div>
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button (click)="confirmDeleteOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button (click)="confirmDeleteAction()" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Eliminar</button>
          </div>
        </div>
      </div>

      <!-- Success Toast -->
      <div *ngIf="successMsg" class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in">
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
export class MaestrosComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  activeTab: 'areas' | 'cargos' = 'areas';
  saving = false;
  pageSize = 8;

  // Areas
  areas: any[] = [];
  areaPage = 1;
  areaModalOpen = false;
  editingArea: any = null;
  areaForm: any = { nombre: '', descripcion: '' };

  // Cargos
  cargos: any[] = [];
  cargoPage = 1;
  cargoFilterAreaId: number | null = null;
  cargoModalOpen = false;
  editingCargo: any = null;
  cargoForm: any = { nombre: '', area_id: null, descripcion: '' };

  // Delete confirm
  confirmDeleteOpen = false;
  confirmDeleteMsg = '';
  private pendingDeleteFn: (() => void) | null = null;

  // Toast
  successMsg = '';
  errorMsg = '';

  // ── Computed ──
  get filteredAreas(): any[] {
    return this.areas;
  }
  get areaTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAreas.length / this.pageSize));
  }
  get paginatedAreas(): any[] {
    const s = (this.areaPage - 1) * this.pageSize;
    return this.filteredAreas.slice(s, s + this.pageSize);
  }

  get filteredCargos(): any[] {
    if (!this.cargoFilterAreaId) return this.cargos;
    return this.cargos.filter((c) => c.area_id === this.cargoFilterAreaId);
  }
  get cargoTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCargos.length / this.pageSize));
  }
  get paginatedCargos(): any[] {
    const s = (this.cargoPage - 1) * this.pageSize;
    return this.filteredCargos.slice(s, s + this.pageSize);
  }

  ngOnInit(): void {
    this.loadAreas();
    this.loadCargos();
  }

  // ── Data loading ──
  loadAreas(): void {
    this.http.get<any[]>(`${this.apiUrl}/maestros/areas`).subscribe({
      next: (data) => (this.areas = data ?? []),
      error: () => this.showError('Error al cargar areas'),
    });
  }

  loadCargos(): void {
    this.http.get<any[]>(`${this.apiUrl}/maestros/cargos`).subscribe({
      next: (data) => (this.cargos = data ?? []),
      error: () => this.showError('Error al cargar cargos'),
    });
  }

  // ── Area CRUD ──
  openAreaModal(area?: any): void {
    this.editingArea = area || null;
    this.areaForm = area ? { nombre: area.nombre, descripcion: area.descripcion || '' } : { nombre: '', descripcion: '' };
    this.areaModalOpen = true;
  }

  saveArea(): void {
    if (!this.areaForm.nombre) { this.showError('El nombre es obligatorio'); return; }
    this.saving = true;
    const obs = this.editingArea
      ? this.http.put(`${this.apiUrl}/maestros/areas/${this.editingArea.id}`, this.areaForm)
      : this.http.post(`${this.apiUrl}/maestros/areas`, this.areaForm);
    obs.subscribe({
      next: () => {
        this.areaModalOpen = false;
        this.saving = false;
        this.showSuccess(this.editingArea ? 'Area actualizada' : 'Area creada');
        this.loadAreas();
      },
      error: (err: any) => {
        this.saving = false;
        this.showError(err?.error?.detail || 'Error al guardar area');
      },
    });
  }

  deleteArea(area: any): void {
    this.confirmDeleteMsg = `Se desactivara el area "${area.nombre}". Los cargos asociados no se eliminaran.`;
    this.pendingDeleteFn = () => {
      this.http.delete(`${this.apiUrl}/maestros/areas/${area.id}`).subscribe({
        next: () => { this.showSuccess('Area desactivada'); this.loadAreas(); },
        error: (err: any) => this.showError(err?.error?.detail || 'Error al eliminar area'),
      });
    };
    this.confirmDeleteOpen = true;
  }

  // ── Cargo CRUD ──
  openCargoModal(cargo?: any): void {
    this.editingCargo = cargo || null;
    this.cargoForm = cargo
      ? { nombre: cargo.nombre, area_id: cargo.area_id, descripcion: cargo.descripcion || '' }
      : { nombre: '', area_id: null, descripcion: '' };
    this.cargoModalOpen = true;
  }

  saveCargo(): void {
    if (!this.cargoForm.nombre || !this.cargoForm.area_id) { this.showError('Nombre y area son obligatorios'); return; }
    this.saving = true;
    const obs = this.editingCargo
      ? this.http.put(`${this.apiUrl}/maestros/cargos/${this.editingCargo.id}`, this.cargoForm)
      : this.http.post(`${this.apiUrl}/maestros/cargos`, this.cargoForm);
    obs.subscribe({
      next: () => {
        this.cargoModalOpen = false;
        this.saving = false;
        this.showSuccess(this.editingCargo ? 'Cargo actualizado' : 'Cargo creado');
        this.loadCargos();
      },
      error: (err: any) => {
        this.saving = false;
        this.showError(err?.error?.detail || 'Error al guardar cargo');
      },
    });
  }

  deleteCargo(cargo: any): void {
    this.confirmDeleteMsg = `Se desactivara el cargo "${cargo.nombre}".`;
    this.pendingDeleteFn = () => {
      this.http.delete(`${this.apiUrl}/maestros/cargos/${cargo.id}`).subscribe({
        next: () => { this.showSuccess('Cargo desactivado'); this.loadCargos(); },
        error: (err: any) => this.showError(err?.error?.detail || 'Error al eliminar cargo'),
      });
    };
    this.confirmDeleteOpen = true;
  }

  confirmDeleteAction(): void {
    this.confirmDeleteOpen = false;
    if (this.pendingDeleteFn) { this.pendingDeleteFn(); this.pendingDeleteFn = null; }
  }

  // ── Toast ──
  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => (this.successMsg = ''), 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg;
    setTimeout(() => (this.errorMsg = ''), 4000);
  }
}
