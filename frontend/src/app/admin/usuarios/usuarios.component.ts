import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, ModalComponent, FormFieldComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Usuarios</h1>
        <button
          (click)="openCreateModal()"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Usuario
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

      <!-- Table -->
      <div *ngIf="!loading" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Search -->
        <div class="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div class="relative flex-1 max-w-sm">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="currentPage = 1"
              placeholder="Buscar usuarios..."
              class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <span class="text-xs text-gray-400">{{ filteredUsers.length }} usuarios</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">DNI</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rol</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Area</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cargo</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let user of paginatedUsers" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                      {{ (user.nombre ?? '').charAt(0).toUpperCase() }}
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ user.nombre }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ user.email }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ user.dni }}</td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-1 rounded-full font-medium"
                    [ngClass]="{
                      'bg-purple-50 text-purple-700': user.rol === 'admin',
                      'bg-blue-50 text-blue-700': user.rol === 'reclutador',
                      'bg-gray-50 text-gray-700': user.rol === 'auditor',
                      'bg-green-50 text-green-700': user.rol === 'evaluador'
                    }">
                    {{ user.rol | titlecase }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ user.area || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ user.cargo || '-' }}</td>
                <td class="px-4 py-3">
                  <app-status-badge [status]="user.activo ? 'Activo' : 'Inactivo'"></app-status-badge>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <button
                      (click)="openEditModal(user)"
                      class="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >Editar</button>
                    <button
                      (click)="toggleActive(user)"
                      class="text-xs font-medium"
                      [ngClass]="user.activo ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'"
                    >
                      {{ user.activo ? 'Desactivar' : 'Activar' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredUsers.length === 0">
                <td colspan="8" class="px-4 py-8 text-center text-sm text-gray-400">No se encontraron usuarios</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span class="text-xs text-gray-500">
            Mostrando {{ ((currentPage - 1) * pageSize) + 1 }} a {{ currentPage * pageSize > filteredUsers.length ? filteredUsers.length : currentPage * pageSize }} de {{ filteredUsers.length }} registros
          </span>
          <div class="flex items-center gap-2">
            <button (click)="currentPage = currentPage - 1" [disabled]="currentPage === 1" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Anterior</button>
            <span class="text-xs text-gray-600">Pagina {{ currentPage }} de {{ totalPages }}</span>
            <button (click)="currentPage = currentPage + 1" [disabled]="currentPage >= totalPages" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Siguiente</button>
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

      <!-- Create Modal -->
      <div *ngIf="createModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="createModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Nuevo Usuario</h3>
            <button (click)="createModalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
              <input type="text" [(ngModel)]="userForm.nombre" placeholder="Nombre completo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" [(ngModel)]="userForm.email" placeholder="correo&#64;empresa.com" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
                <input type="text" [(ngModel)]="userForm.dni" placeholder="12345678" maxlength="8" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select [(ngModel)]="userForm.rol" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">Seleccionar...</option>
                  <option value="admin">Administrador</option>
                  <option value="evaluador">Evaluador</option>
                  <option value="postulante">Postulante</option>
                  <option value="trabajador">Trabajador</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input type="text" [(ngModel)]="userForm.telefono" placeholder="999999999" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <select [(ngModel)]="userForm.area" (ngModelChange)="onAreaChange()" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">Seleccionar...</option>
                  <option *ngFor="let a of areas" [value]="a.nombre">{{ a.nombre }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
              <select [(ngModel)]="userForm.cargo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="">Seleccionar...</option>
                <option *ngFor="let c of cargosForArea" [value]="c.nombre">{{ c.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contrasena *</label>
              <input type="password" [(ngModel)]="userForm.password" placeholder="Minimo 6 caracteres" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button (click)="createModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="createUser()" [disabled]="saving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{ saving ? 'Creando...' : 'Crear Usuario' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div *ngIf="editModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="editModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Editar Usuario</h3>
            <button (click)="editModalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
              <input type="text" [(ngModel)]="userForm.nombre" placeholder="Nombre completo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" [(ngModel)]="userForm.email" placeholder="correo&#64;empresa.com" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                <input type="text" [(ngModel)]="userForm.dni" placeholder="12345678" maxlength="8" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select [(ngModel)]="userForm.rol" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="admin">Administrador</option>
                  <option value="evaluador">Evaluador</option>
                  <option value="postulante">Postulante</option>
                  <option value="trabajador">Trabajador</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input type="text" [(ngModel)]="userForm.telefono" placeholder="999999999" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <select [(ngModel)]="userForm.area" (ngModelChange)="onAreaChange()" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">Seleccionar...</option>
                  <option *ngFor="let a of areas" [value]="a.nombre">{{ a.nombre }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
              <select [(ngModel)]="userForm.cargo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="">Seleccionar...</option>
                <option *ngFor="let c of cargosForArea" [value]="c.nombre">{{ c.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nueva Contrasena</label>
              <input type="password" [(ngModel)]="userForm.password" placeholder="Dejar vacio para no cambiar" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button (click)="editModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="updateUser()" [disabled]="saving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UsuariosComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  loading = true;
  saving = false;
  error = '';
  searchTerm = '';
  currentPage = 1;
  pageSize = 8;

  successMsg = '';
  errorMsg = '';
  users: any[] = [];
  createModalOpen = false;
  editModalOpen = false;
  editingUser: any = null;

  userForm: any = { nombre: '', email: '', dni: '', rol: '', password: '', telefono: '', area: '', cargo: '' };

  areas: any[] = [];
  cargosForArea: any[] = [];

  roleOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'reclutador', label: 'Reclutador' },
    { value: 'evaluador', label: 'Evaluador' },
    { value: 'auditor', label: 'Auditor' },
  ];

  get filteredUsers(): any[] {
    if (!this.searchTerm) return this.users;
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(
      (u) =>
        (u.nombre ?? '').toLowerCase().includes(term) ||
        (u.email ?? '').toLowerCase().includes(term) ||
        (u.dni ?? '').toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  get paginatedUsers(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadAreas();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/usuarios/`).subscribe({
      next: (data) => {
        this.users = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar usuarios.';
        this.loading = false;
        console.error('Users error:', err);
      },
    });
  }

  loadAreas(): void {
    this.http.get<any[]>(`${this.apiUrl}/maestros/areas`).subscribe({
      next: (data) => (this.areas = data ?? []),
      error: () => {},
    });
  }

  onAreaChange(): void {
    this.userForm.cargo = '';
    this.cargosForArea = [];
    if (!this.userForm.area) return;
    const area = this.areas.find((a) => a.nombre === this.userForm.area);
    if (area) {
      this.http.get<any[]>(`${this.apiUrl}/maestros/cargos-por-area/${area.id}`).subscribe({
        next: (data) => (this.cargosForArea = data ?? []),
        error: () => {},
      });
    }
  }

  openCreateModal(): void {
    this.userForm = { nombre: '', email: '', dni: '', rol: '', password: '', telefono: '', area: '', cargo: '' };
    this.cargosForArea = [];
    this.createModalOpen = true;
  }

  openEditModal(user: any): void {
    this.editingUser = user;
    this.userForm = {
      nombre: user.nombre,
      email: user.email,
      dni: user.dni,
      rol: user.rol,
      telefono: user.telefono || '',
      area: user.area || '',
      cargo: user.cargo || '',
      password: '',
    };
    this.cargosForArea = [];
    if (user.area) {
      const area = this.areas.find((a) => a.nombre === user.area);
      if (area) {
        this.http.get<any[]>(`${this.apiUrl}/maestros/cargos-por-area/${area.id}`).subscribe({
          next: (data) => (this.cargosForArea = data ?? []),
          error: () => {},
        });
      }
    }
    this.editModalOpen = true;
  }

  createUser(): void {
    if (!this.userForm.nombre || !this.userForm.email || !this.userForm.password || !this.userForm.rol) {
      this.showError('Complete todos los campos obligatorios');
      return;
    }
    this.saving = true;
    const payload = {
      email: this.userForm.email,
      password: this.userForm.password,
      nombre: this.userForm.nombre,
      dni: this.userForm.dni,
      rol: this.userForm.rol,
      telefono: this.userForm.telefono,
      area: this.userForm.area || null,
      cargo: this.userForm.cargo || null,
    };
    this.http.post<any>(`${this.apiUrl}/usuarios/`, payload).subscribe({
      next: () => {
        this.createModalOpen = false;
        this.saving = false;
        this.showSuccess('Usuario creado exitosamente');
        this.loadUsers();
      },
      error: (err) => {
        this.saving = false;
        this.showError(err?.error?.detail || 'Error al crear usuario');
      },
    });
  }

  updateUser(): void {
    if (!this.editingUser || !this.userForm.nombre || !this.userForm.email) return;
    this.saving = true;
    const body: any = {
      nombre: this.userForm.nombre,
      email: this.userForm.email,
      dni: this.userForm.dni,
      rol: this.userForm.rol,
      telefono: this.userForm.telefono,
      area: this.userForm.area || null,
      cargo: this.userForm.cargo || null,
    };
    if (this.userForm.password) {
      body.password = this.userForm.password;
    }
    this.http.put<any>(`${this.apiUrl}/usuarios/${this.editingUser.id}`, body).subscribe({
      next: () => {
        this.editModalOpen = false;
        this.saving = false;
        this.showSuccess('Usuario actualizado exitosamente');
        this.loadUsers();
      },
      error: (err) => {
        this.saving = false;
        this.showError(err?.error?.detail || 'Error al actualizar usuario');
      },
    });
  }

  toggleActive(user: any): void {
    const newState = !user.activo;
    this.http.put<any>(`${this.apiUrl}/usuarios/${user.id}`, { activo: newState }).subscribe({
      next: () => {
        this.showSuccess(newState ? 'Usuario activado' : 'Usuario desactivado');
        this.loadUsers();
      },
      error: (err) => this.showError(err?.error?.detail || 'Error al cambiar estado'),
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
