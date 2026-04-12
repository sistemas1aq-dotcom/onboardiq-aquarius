import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-eval-desempeno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Evaluaciones de Desempeno</h1>
        <button
          (click)="openNewModal()"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Nueva Evaluacion
        </button>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-4 mb-6">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Periodo</label>
          <select [(ngModel)]="filterPeriodo" (ngModelChange)="applyFilters()" class="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">Todos</option>
            <option *ngFor="let p of periodos" [value]="p">{{ p }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Estado</label>
          <select [(ngModel)]="filterEstado" (ngModelChange)="applyFilters()" class="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">Todos</option>
            <option value="Borrador">Borrador</option>
            <option value="Enviado">Enviado</option>
            <option value="Completado">Completado</option>
          </select>
        </div>
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

      <!-- Cards -->
      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let ev of filteredEvals"
          (click)="openEvalForm(ev)"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-sm font-semibold text-gray-900">{{ ev.trabajador_nombre }}</h3>
              <p class="text-xs text-gray-500">{{ ev.periodo }} - {{ ev.tipo }}</p>
            </div>
            <span
              class="px-2 py-0.5 text-xs font-medium rounded-full"
              [ngClass]="{
                'bg-yellow-100 text-yellow-700': ev.estado === 'Borrador',
                'bg-blue-100 text-blue-700': ev.estado === 'Enviado',
                'bg-green-100 text-green-700': ev.estado === 'Completado'
              }"
            >{{ ev.estado }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-3xl font-bold" [ngClass]="ev.puntaje_general >= 4 ? 'text-green-600' : ev.puntaje_general >= 3 ? 'text-blue-600' : 'text-orange-600'">
              {{ ev.puntaje_general?.toFixed(1) || '0.0' }}
            </span>
            <span class="text-xs text-gray-400">/ 5.0</span>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && filteredEvals.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
        No hay evaluaciones registradas
      </div>

      <!-- New Evaluation Modal -->
      <div *ngIf="newModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="newModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Nueva Evaluacion</h3>
            <button (click)="newModalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div *ngIf="newModalLoading" class="flex items-center justify-center py-8">
              <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div *ngIf="!newModalLoading">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Trabajador</label>
              <select [(ngModel)]="newEval.trabajador_id" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="">Seleccionar...</option>
                <option *ngFor="let t of trabajadores" [value]="t.id">{{ t.nombre }} {{ t.apellido_paterno || '' }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
              <input [(ngModel)]="newEval.periodo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Ej: 2026-S1">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select [(ngModel)]="newEval.tipo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="">Seleccionar...</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button (click)="newModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="createEvaluacion()" [disabled]="saving || !newEval.trabajador_id || !newEval.periodo || !newEval.tipo" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{ saving ? 'Creando...' : 'Crear' }}
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Evaluation Form Modal -->
      <div *ngIf="evalFormOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="evalFormOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Evaluacion: {{ selectedEval?.trabajador_nombre }}</h3>
              <p class="text-xs text-gray-500">{{ selectedEval?.periodo }} - {{ selectedEval?.tipo }}</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <span class="text-2xl font-bold" [ngClass]="calcPuntaje() >= 4 ? 'text-green-600' : calcPuntaje() >= 3 ? 'text-blue-600' : 'text-orange-600'">
                  {{ calcPuntaje().toFixed(1) }}
                </span>
                <span class="text-xs text-gray-400"> / 5.0</span>
              </div>
              <button (click)="evalFormOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div *ngIf="loadingCriterios" class="flex items-center justify-center py-8">
              <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>

            <div *ngFor="let criterio of criteriosForm; let i = index" class="bg-gray-50 rounded-xl p-4 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-semibold text-gray-900">{{ criterio.nombre }}</h4>
                  <span class="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">{{ criterio.categoria }}</span>
                </div>
                <span class="text-xs text-gray-400">Peso: {{ criterio.peso }}%</span>
              </div>

              <!-- Star Rating -->
              <div class="flex items-center gap-1">
                <button
                  *ngFor="let star of [1,2,3,4,5]"
                  (click)="criterio.puntaje = star"
                  class="focus:outline-none"
                >
                  <svg class="w-7 h-7 transition-colors" [ngClass]="star <= criterio.puntaje ? 'text-yellow-400' : 'text-gray-300'" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </button>
                <span class="ml-2 text-sm font-medium text-gray-600">{{ criterio.puntaje }}/5</span>
              </div>

              <textarea
                [(ngModel)]="criterio.comentario"
                rows="2"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                placeholder="Comentario sobre este criterio..."
              ></textarea>
            </div>

            <!-- Comentarios Generales -->
            <div class="pt-4 border-t border-gray-200">
              <label class="block text-sm font-medium text-gray-700 mb-2">Comentarios Generales</label>
              <textarea
                [(ngModel)]="comentariosGenerales"
                rows="3"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Comentarios generales sobre la evaluacion..."
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button (click)="evalFormOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button (click)="saveEval('Borrador')" [disabled]="saving" class="px-4 py-2 text-sm font-medium text-gray-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 disabled:opacity-50">
              {{ saving ? 'Guardando...' : 'Guardar Borrador' }}
            </button>
            <button (click)="saveEval('Enviado')" [disabled]="saving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {{ saving ? 'Enviando...' : 'Enviar' }}
            </button>
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
export class EvalDesempenoComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  evaluaciones: any[] = [];
  filteredEvals: any[] = [];
  periodos: string[] = [];
  loading = false;
  error = '';
  successMsg = '';
  saving = false;

  // Filters
  filterPeriodo = '';
  filterEstado = '';

  // New eval modal
  newModalOpen = false;
  newModalLoading = false;
  trabajadores: any[] = [];
  newEval = { trabajador_id: '', periodo: '', tipo: '' };

  // Eval form modal
  evalFormOpen = false;
  selectedEval: any = null;
  criteriosForm: any[] = [];
  comentariosGenerales = '';
  loadingCriterios = false;

  ngOnInit(): void {
    this.loadEvaluaciones();
  }

  loadEvaluaciones(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/evaluacion-desempeno/`).subscribe({
      next: (data) => {
        this.evaluaciones = data ?? [];
        this.periodos = [...new Set(this.evaluaciones.map((e: any) => e.periodo).filter(Boolean))];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.evaluaciones = [];
        this.filteredEvals = [];
        this.error = 'Error al cargar evaluaciones.';
        this.loading = false;
        console.error('Load error:', err);
      },
    });
  }

  applyFilters(): void {
    this.filteredEvals = this.evaluaciones.filter((e) => {
      if (this.filterPeriodo && e.periodo !== this.filterPeriodo) return false;
      if (this.filterEstado && e.estado !== this.filterEstado) return false;
      return true;
    });
  }

  openNewModal(): void {
    this.newEval = { trabajador_id: '', periodo: '', tipo: '' };
    this.newModalOpen = true;
    this.newModalLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/postulantes/?estado=Trabajador`).subscribe({
      next: (data) => { this.trabajadores = data ?? []; this.newModalLoading = false; },
      error: () => { this.trabajadores = []; this.newModalLoading = false; },
    });
  }

  createEvaluacion(): void {
    this.saving = true;
    const payload = {
      trabajador_id: Number(this.newEval.trabajador_id),
      periodo: this.newEval.periodo,
      tipo: this.newEval.tipo,
    };
    this.http.post(`${this.apiUrl}/evaluacion-desempeno/`, payload).subscribe({
      next: () => {
        this.saving = false;
        this.newModalOpen = false;
        this.showSuccess('Evaluacion creada');
        this.loadEvaluaciones();
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Error al crear evaluacion.';
        console.error('Create error:', err);
      },
    });
  }

  openEvalForm(ev: any): void {
    this.selectedEval = ev;
    this.comentariosGenerales = ev.comentarios_generales || '';
    this.criteriosForm = [];
    this.evalFormOpen = true;
    this.loadingCriterios = true;

    this.http.get<any[]>(`${this.apiUrl}/evaluacion-desempeno/criterios`).subscribe({
      next: (criterios) => {
        const existingPuntajes = ev.puntajes || [];
        this.criteriosForm = (criterios ?? []).map((c: any) => {
          const existing = existingPuntajes.find((p: any) => p.criterio_id === c.id);
          return {
            ...c,
            puntaje: existing?.puntaje ?? 0,
            comentario: existing?.comentario ?? '',
          };
        });
        this.loadingCriterios = false;
      },
      error: () => {
        this.criteriosForm = [];
        this.loadingCriterios = false;
      },
    });
  }

  calcPuntaje(): number {
    if (this.criteriosForm.length === 0) return 0;
    const totalPeso = this.criteriosForm.reduce((sum: number, c: any) => sum + (c.peso || 0), 0);
    if (totalPeso === 0) return 0;
    const weighted = this.criteriosForm.reduce((sum: number, c: any) => sum + (c.puntaje * (c.peso || 0)), 0);
    return weighted / totalPeso;
  }

  saveEval(estado: string): void {
    if (!this.selectedEval) return;
    this.saving = true;
    const payload = {
      estado,
      comentarios_generales: this.comentariosGenerales,
      puntaje_general: this.calcPuntaje(),
      puntajes: this.criteriosForm.map((c: any) => ({
        criterio_id: c.id,
        puntaje: c.puntaje,
        comentario: c.comentario,
      })),
    };
    this.http.put(`${this.apiUrl}/evaluacion-desempeno/${this.selectedEval.id}`, payload).subscribe({
      next: () => {
        this.saving = false;
        this.evalFormOpen = false;
        this.showSuccess(estado === 'Borrador' ? 'Borrador guardado' : 'Evaluacion enviada');
        this.loadEvaluaciones();
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Error al guardar evaluacion.';
        console.error('Save error:', err);
      },
    });
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => (this.successMsg = ''), 3000);
  }
}
