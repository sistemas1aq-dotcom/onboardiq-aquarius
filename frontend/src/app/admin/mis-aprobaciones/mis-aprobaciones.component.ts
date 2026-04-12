import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mis-aprobaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Mis Aprobaciones</h1>
        <button
          (click)="loadPendientes()"
          class="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-500">Cargando...</span>
        </div>
      </div>

      <!-- Toast -->
      <div
        *ngIf="toast"
        class="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all"
        [ngClass]="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
      >
        {{ toast.message }}
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && pendientes.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-500">No tienes aprobaciones pendientes</h3>
        <p class="text-sm text-gray-400 mt-1">Cuando se te asigne una aprobacion, aparecera aqui.</p>
      </div>

      <!-- Cards -->
      <div *ngIf="!loading && pendientes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let p of pendientes"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-gray-900">{{ p.postulante_nombre || 'Sin nombre' }}</h3>
              <p class="text-xs text-gray-500 mt-0.5">{{ p.postulante_puesto || 'Sin puesto' }}</p>
            </div>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Orden #{{ p.orden }}
            </span>
          </div>

          <div class="flex items-center gap-2 mb-4">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Tu turno
            </span>
            <span *ngIf="p.postulante_estado" class="text-xs text-gray-400">
              Estado postulante: {{ p.postulante_estado }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="openAccionModal(p, 'aprobar')"
              class="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Aprobar
            </button>
            <button
              (click)="openAccionModal(p, 'rechazar')"
              class="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Rechazar
            </button>
          </div>
        </div>
      </div>

      <!-- Accion Modal -->
      <div *ngIf="accionModalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" (click)="accionModalOpen = false"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">
            {{ accionTipo === 'aprobar' ? 'Confirmar Aprobacion' : 'Confirmar Rechazo' }}
          </h3>
          <p class="text-sm text-gray-500 mb-4">
            {{ accionItem?.postulante_nombre }} - {{ accionItem?.postulante_puesto }}
          </p>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Comentario (opcional)</label>
            <textarea
              [(ngModel)]="comentario"
              rows="3"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              placeholder="Agregar un comentario..."
            ></textarea>
          </div>

          <div class="flex items-center gap-3">
            <button
              (click)="accionModalOpen = false"
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="confirmarAccion()"
              [disabled]="procesando"
              class="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
              [ngClass]="accionTipo === 'aprobar' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'"
            >
              {{ procesando ? 'Procesando...' : (accionTipo === 'aprobar' ? 'Aprobar' : 'Rechazar') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MisAprobacionesComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  loading = true;
  pendientes: any[] = [];
  accionModalOpen = false;
  accionTipo: 'aprobar' | 'rechazar' = 'aprobar';
  accionItem: any = null;
  comentario = '';
  procesando = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  ngOnInit(): void {
    this.loadPendientes();
  }

  loadPendientes(): void {
    this.loading = true;
    this.http.get<any[]>(`${this.apiUrl}/aprobadores/mis-pendientes`).subscribe({
      next: (data) => {
        this.pendientes = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando pendientes:', err);
        this.pendientes = [];
        this.loading = false;
      },
    });
  }

  openAccionModal(item: any, tipo: 'aprobar' | 'rechazar'): void {
    this.accionItem = item;
    this.accionTipo = tipo;
    this.comentario = '';
    this.accionModalOpen = true;
  }

  confirmarAccion(): void {
    if (!this.accionItem || this.procesando) return;
    this.procesando = true;

    const url = `${this.apiUrl}/aprobadores/${this.accionItem.id}/${this.accionTipo}`;
    const body = this.comentario ? { comentario: this.comentario } : {};

    this.http.post(url, body).subscribe({
      next: () => {
        this.showToast(
          this.accionTipo === 'aprobar' ? 'Aprobacion registrada exitosamente' : 'Rechazo registrado exitosamente',
          'success'
        );
        this.accionModalOpen = false;
        this.procesando = false;
        this.loadPendientes();
      },
      error: (err) => {
        console.error('Error procesando accion:', err);
        this.showToast(err.error?.detail || 'Error al procesar la accion', 'error');
        this.procesando = false;
      },
    });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3000);
  }
}
