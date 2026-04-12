import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Gestion de Areas</h1>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">{{ areas.length }} areas</span>
          <button (click)="openModal()" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Nueva Area
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descripcion</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let a of paginatedAreas; let i = index" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-sm text-gray-500">{{ (page - 1) * pageSize + i + 1 }}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ a.nombre }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ a.descripcion || '-' }}</td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-1 rounded-full font-medium" [ngClass]="a.activa ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
                    {{ a.activa ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <button (click)="openModal(a)" class="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                    <button (click)="deleteArea(a)" class="text-red-600 hover:text-red-800 text-xs font-medium">Eliminar</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="areas.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">No hay areas registradas</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span class="text-xs text-gray-500">Pagina {{ page }} de {{ totalPages }}</span>
          <div class="flex items-center gap-2">
            <button (click)="page = page - 1" [disabled]="page === 1" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Anterior</button>
            <button (click)="page = page + 1" [disabled]="page >= totalPages" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Siguiente</button>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="modalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">{{ editing ? 'Editar Area' : 'Nueva Area' }}</h3>
            <button (click)="modalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" [(ngModel)]="form.nombre" placeholder="Nombre del area" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
              <input type="text" [(ngModel)]="form.descripcion" placeholder="Descripcion (opcional)" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button (click)="modalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="save()" [disabled]="saving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{ saving ? 'Guardando...' : (editing ? 'Guardar' : 'Crear') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirm Delete -->
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
export class AreasComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  areas: any[] = [];
  page = 1;
  pageSize = 8;
  saving = false;

  modalOpen = false;
  editing: any = null;
  form: any = { nombre: '', descripcion: '' };

  confirmDeleteOpen = false;
  confirmDeleteMsg = '';
  private pendingDeleteFn: (() => void) | null = null;

  successMsg = '';
  errorMsg = '';

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.areas.length / this.pageSize));
  }

  get paginatedAreas(): any[] {
    const s = (this.page - 1) * this.pageSize;
    return this.areas.slice(s, s + this.pageSize);
  }

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas(): void {
    this.http.get<any[]>(`${this.apiUrl}/maestros/areas`).subscribe({
      next: (data) => (this.areas = data ?? []),
      error: () => this.showError('Error al cargar areas'),
    });
  }

  openModal(area?: any): void {
    this.editing = area || null;
    this.form = area ? { nombre: area.nombre, descripcion: area.descripcion || '' } : { nombre: '', descripcion: '' };
    this.modalOpen = true;
  }

  save(): void {
    if (!this.form.nombre) { this.showError('El nombre es obligatorio'); return; }
    this.saving = true;
    const obs = this.editing
      ? this.http.put(`${this.apiUrl}/maestros/areas/${this.editing.id}`, this.form)
      : this.http.post(`${this.apiUrl}/maestros/areas`, this.form);
    obs.subscribe({
      next: () => {
        this.modalOpen = false;
        this.saving = false;
        this.showSuccess(this.editing ? 'Area actualizada' : 'Area creada');
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

  confirmDeleteAction(): void {
    this.confirmDeleteOpen = false;
    if (this.pendingDeleteFn) { this.pendingDeleteFn(); this.pendingDeleteFn = null; }
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => (this.successMsg = ''), 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg;
    setTimeout(() => (this.errorMsg = ''), 4000);
  }
}
