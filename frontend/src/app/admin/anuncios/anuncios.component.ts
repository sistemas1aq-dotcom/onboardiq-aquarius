import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-anuncios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Gestion de Anuncios</h1>
        <button
          (click)="openCreateModal()"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Anuncio
        </button>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-3 mb-6">
        <select
          [(ngModel)]="filterTipo"
          (ngModelChange)="applyFilter()"
          class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">Todos los tipos</option>
          <option value="bienvenida">Bienvenida</option>
          <option value="cesado">Cesado</option>
          <option value="cumpleanos">Cumpleanos</option>
          <option value="festividad">Festividad</option>
          <option value="general">General</option>
        </select>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-500">Cargando anuncios...</span>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <p class="text-sm text-red-600">{{ error }}</p>
        <button (click)="loadAnuncios()" class="mt-2 text-xs text-red-700 underline">Reintentar</button>
      </div>

      <!-- Cards Grid -->
      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                (click)="sendEmail(anuncio)"
                [disabled]="sendingEmail === anuncio.id"
                class="px-2.5 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                {{ sendingEmail === anuncio.id ? 'Enviando...' : 'Enviar por Email' }}
              </button>
              <button
                (click)="openEditModal(anuncio)"
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
      <div *ngIf="!loading && filteredAnuncios.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
        No hay anuncios {{ filterTipo ? 'de tipo ' + filterTipo : '' }}
      </div>

      <!-- Pagination -->
      <div *ngIf="!loading && totalPages > 1" class="flex items-center justify-between">
        <span class="text-xs text-gray-500">
          Mostrando {{ ((currentPage - 1) * pageSize) + 1 }} a {{ currentPage * pageSize > filteredAnuncios.length ? filteredAnuncios.length : currentPage * pageSize }} de {{ filteredAnuncios.length }}
        </span>
        <div class="flex items-center gap-2">
          <button (click)="currentPage = currentPage - 1" [disabled]="currentPage === 1" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Anterior</button>
          <span class="text-xs text-gray-600">Pagina {{ currentPage }} de {{ totalPages }}</span>
          <button (click)="currentPage = currentPage + 1" [disabled]="currentPage >= totalPages" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Siguiente</button>
        </div>
      </div>

      <!-- Success message -->
      <div *ngIf="successMsg" class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50">
        {{ successMsg }}
      </div>

      <!-- MODAL: Crear/Editar Anuncio -->
      <div *ngIf="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="modalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">{{ editingAnuncio ? 'Editar Anuncio' : 'Nuevo Anuncio' }}</h3>
            <button (click)="modalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
              <input type="text" [(ngModel)]="form.titulo" placeholder="Titulo del anuncio" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contenido *</label>
              <textarea [(ngModel)]="form.contenido" rows="5" placeholder="Contenido del anuncio..." class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select [(ngModel)]="form.tipo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
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
                <select [(ngModel)]="form.destinatarios" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="all">Todos</option>
                  <option value="marketing">Marketing</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Publicacion</label>
              <input type="date" [(ngModel)]="form.fecha_publicacion" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button (click)="modalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="saveAnuncio()" [disabled]="saving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AnunciosComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  loading = true;
  saving = false;
  error = '';
  successMsg = '';
  sendingEmail: number | null = null;

  anuncios: any[] = [];
  filteredAnuncios: any[] = [];
  filterTipo = '';
  currentPage = 1;
  pageSize = 8;

  modalOpen = false;
  editingAnuncio: any = null;
  form: any = { titulo: '', contenido: '', tipo: '', destinatarios: 'all', fecha_publicacion: '' };

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

  loadAnuncios(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/anuncios/`).subscribe({
      next: (data) => {
        this.anuncios = data ?? [];
        this.applyFilter();
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

  applyFilter(): void {
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

  openCreateModal(): void {
    this.editingAnuncio = null;
    this.form = { titulo: '', contenido: '', tipo: '', destinatarios: 'all', fecha_publicacion: new Date().toISOString().split('T')[0] };
    this.modalOpen = true;
  }

  openEditModal(anuncio: any): void {
    this.editingAnuncio = anuncio;
    this.form = {
      titulo: anuncio.titulo,
      contenido: anuncio.contenido,
      tipo: anuncio.tipo,
      destinatarios: anuncio.destinatarios || 'all',
      fecha_publicacion: anuncio.fecha_publicacion?.split('T')[0] || '',
    };
    this.modalOpen = true;
  }

  saveAnuncio(): void {
    if (!this.form.titulo || !this.form.tipo) return;
    this.saving = true;
    this.error = '';

    const payload = {
      titulo: this.form.titulo,
      contenido: this.form.contenido,
      tipo: this.form.tipo,
      destinatarios: this.form.destinatarios,
      fecha_publicacion: this.form.fecha_publicacion || null,
    };

    const url = this.editingAnuncio
      ? `${this.apiUrl}/anuncios/${this.editingAnuncio.id}`
      : `${this.apiUrl}/anuncios/`;
    const req = this.editingAnuncio
      ? this.http.put<any>(url, payload)
      : this.http.post<any>(url, payload);

    req.subscribe({
      next: () => {
        this.modalOpen = false;
        this.saving = false;
        this.showSuccess(this.editingAnuncio ? 'Anuncio actualizado exitosamente' : 'Anuncio creado exitosamente');
        this.loadAnuncios();
      },
      error: (err) => {
        this.error = 'Error al guardar anuncio.';
        this.saving = false;
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

  sendEmail(anuncio: any): void {
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

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => (this.successMsg = ''), 3000);
  }
}
