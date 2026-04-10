import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { AuthService } from '../../core/services/auth.service';

interface Derechohabiente {
  id?: number;
  trabajador_id?: number;
  nombre_completo: string;
  parentesco: string;
  dni: string;
  fecha_nacimiento: string;
  genero: string;
  telefono: string;
}

@Component({
  selector: 'app-derechohabientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Derechohabientes</h1>
          <p class="text-sm text-gray-500 mt-1">Registre a sus familiares directos</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Agregar Familiar
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <p class="text-red-700 text-sm">{{ error }}</p>
      </div>

      <!-- Success -->
      <div *ngIf="successMsg" class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
        {{ successMsg }}
      </div>

      <div *ngIf="!loading">
        <!-- Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Parentesco</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">DNI</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha Nac.</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Genero</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Telefono</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let dh of paginatedDerechohabientes" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-700 font-medium">{{ dh.nombre_completo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ dh.parentesco }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ dh.dni }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ dh.fecha_nacimiento }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ dh.genero }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ dh.telefono }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button (click)="editDH(dh)" class="text-blue-600 hover:text-blue-700 text-xs font-medium">Editar</button>
                      <button (click)="deleteDH(dh)" class="text-red-500 hover:text-red-700 text-xs font-medium">Eliminar</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="derechohabientes.length === 0">
                  <td colspan="7" class="px-4 py-8 text-center text-sm text-gray-400">
                    No se han registrado derechohabientes. Haga clic en "Agregar Familiar" para comenzar.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span class="text-xs text-gray-500">
              Mostrando {{ ((currentPage - 1) * pageSize) + 1 }} a {{ currentPage * pageSize > derechohabientes.length ? derechohabientes.length : currentPage * pageSize }} de {{ derechohabientes.length }} registros
            </span>
            <div class="flex items-center gap-2">
              <button (click)="currentPage = currentPage - 1" [disabled]="currentPage === 1" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Anterior</button>
              <span class="text-xs text-gray-600">Pagina {{ currentPage }} de {{ totalPages }}</span>
              <button (click)="currentPage = currentPage + 1" [disabled]="currentPage >= totalPages" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Siguiente</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <app-modal
        [isOpen]="modalOpen"
        [title]="editingDH ? 'Editar Derechohabiente' : 'Agregar Derechohabiente'"
        size="md"
        (close)="closeModal()"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Nombre Completo <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="form.nombre_completo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Parentesco <span class="text-red-500">*</span></label>
            <select [(ngModel)]="form.parentesco" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
              <option value="">Seleccionar...</option>
              <option *ngFor="let p of parentescos" [value]="p">{{ p }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">DNI <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="form.dni" maxlength="8" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Fecha de Nacimiento</label>
              <input type="date" [(ngModel)]="form.fecha_nacimiento" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Genero</label>
              <select [(ngModel)]="form.genero" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Telefono</label>
              <input type="text" [(ngModel)]="form.telefono" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button (click)="closeModal()" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button (click)="saveDH()" [disabled]="saving || !form.nombre_completo || !form.parentesco || !form.dni"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {{ saving ? 'Guardando...' : (editingDH ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </div>
      </app-modal>
    </div>
  `,
})
export class DerechohabientesComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  derechohabientes: Derechohabiente[] = [];
  loading = true;
  error = '';
  successMsg = '';
  saving = false;
  currentPage = 1;
  pageSize = 8;

  get totalPages(): number {
    return Math.ceil(this.derechohabientes.length / this.pageSize);
  }

  get paginatedDerechohabientes(): Derechohabiente[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.derechohabientes.slice(start, start + this.pageSize);
  }

  modalOpen = false;
  editingDH: Derechohabiente | null = null;
  form: Derechohabiente = this.emptyForm();

  parentescos = ['Conyuge', 'Hijo/a', 'Padre', 'Madre'];

  ngOnInit(): void {
    this.loadDerechohabientes();
  }

  loadDerechohabientes(): void {
    this.loading = true;
    this.error = '';
    this.http.get<Derechohabiente[]>(`${this.apiUrl}/portal/derechohabientes`).subscribe({
      next: (res) => {
        this.derechohabientes = res;
        this.loading = false;
      },
      error: (err: any) => {
        if (err.status === 404) {
          this.derechohabientes = [];
          this.loading = false;
        } else {
          this.error = 'Error al cargar los derechohabientes.';
          this.loading = false;
        }
      },
    });
  }

  openModal(): void {
    this.form = this.emptyForm();
    this.editingDH = null;
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingDH = null;
  }

  editDH(dh: Derechohabiente): void {
    this.editingDH = dh;
    this.form = { ...dh };
    this.modalOpen = true;
  }

  saveDH(): void {
    this.saving = true;
    this.error = '';

    const payload: any = { ...this.form };
    if (!this.editingDH) {
      const user = this.authService.getCurrentUser();
      if (user?.id) {
        payload.trabajador_id = user.id;
      }
    }

    const req$ = this.editingDH
      ? this.http.put(`${this.apiUrl}/portal/derechohabientes/${this.editingDH.id}`, payload)
      : this.http.post(`${this.apiUrl}/portal/derechohabientes`, payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = this.editingDH ? 'Derechohabiente actualizado.' : 'Derechohabiente registrado.';
        setTimeout(() => this.successMsg = '', 4000);
        this.closeModal();
        this.loadDerechohabientes();
      },
      error: () => {
        this.saving = false;
        this.error = 'Error al guardar el derechohabiente.';
        setTimeout(() => this.error = '', 4000);
      },
    });
  }

  deleteDH(dh: Derechohabiente): void {
    if (!confirm(`Eliminar a ${dh.nombre_completo}?`)) return;
    this.http.delete(`${this.apiUrl}/portal/derechohabientes/${dh.id}`).subscribe({
      next: () => {
        this.successMsg = 'Derechohabiente eliminado.';
        setTimeout(() => this.successMsg = '', 4000);
        this.loadDerechohabientes();
      },
      error: () => {
        this.error = 'Error al eliminar el derechohabiente.';
        setTimeout(() => this.error = '', 4000);
      },
    });
  }

  private emptyForm(): Derechohabiente {
    return { nombre_completo: '', parentesco: '', dni: '', fecha_nacimiento: '', genero: '', telefono: '' };
  }
}
