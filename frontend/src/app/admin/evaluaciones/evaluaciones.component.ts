import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-evaluaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Evaluaciones</h1>
      </div>

      <!-- Tabs -->
      <div class="flex items-center gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          (click)="activeTab = 'evaluaciones'"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          [ngClass]="activeTab === 'evaluaciones' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >Evaluaciones</button>
        <button
          (click)="activeTab = 'preguntas'; loadAllPreguntas()"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          [ngClass]="activeTab === 'preguntas' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >Preguntas</button>
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
        <button (click)="loadData()" class="mt-2 text-xs text-red-700 underline">Reintentar</button>
      </div>

      <!-- EVALUACIONES TAB -->
      <div *ngIf="!loading && activeTab === 'evaluaciones'">
        <div class="flex justify-end mb-4">
          <button
            (click)="openCreateEvalModal()"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nueva Evaluacion
          </button>
        </div>

        <div class="grid gap-4">
          <div
            *ngFor="let eval of evaluaciones"
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-gray-900">{{ eval.nombre }}</h3>
                <p class="text-xs text-gray-400 mt-1">{{ eval.descripcion }}</p>
                <div class="flex items-center gap-3 mt-3">
                  <span class="text-xs text-gray-500">
                    <svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ eval.preguntas_count ?? 0 }} preguntas
                  </span>
                  <span class="text-xs text-gray-500">{{ eval.tipo }}</span>
                  <span class="text-xs text-gray-500">{{ eval.duracion_minutos }} min</span>
                  <span class="text-xs text-gray-500">Min: {{ eval.puntaje_minimo }}%</span>
                  <app-status-badge [status]="eval.activa ? 'Activo' : 'Inactivo'"></app-status-badge>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  (click)="openAssignModal(eval)"
                  class="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >Asignar</button>
                <button
                  (click)="$event.stopPropagation(); openAprobadoresModal(eval)"
                  class="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >👥 Aprobadores</button>
                <button
                  (click)="openEditEvalModal(eval)"
                  class="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  (click)="deleteEvaluacion(eval)"
                  class="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div *ngIf="evaluaciones.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
            No hay evaluaciones creadas
          </div>
        </div>
      </div>

      <!-- PREGUNTAS TAB -->
      <div *ngIf="!loading && activeTab === 'preguntas'">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <select
              [(ngModel)]="preguntaFilterEval"
              (ngModelChange)="loadPreguntasForEval()"
              class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
            >
              <option value="">-- Seleccionar Evaluacion --</option>
              <option *ngFor="let e of evaluaciones" [value]="e.id">{{ e.nombre }}</option>
            </select>
          </div>
          <button
            (click)="openCreatePreguntaModal()"
            [disabled]="!preguntaFilterEval && evaluaciones.length === 0"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nueva Pregunta
          </button>
        </div>

        <!-- Loading preguntas -->
        <div *ngIf="loadingPreguntas" class="flex items-center justify-center py-10">
          <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        <div *ngIf="!loadingPreguntas" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Orden</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pregunta</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Puntaje</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Resp. Correcta</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let preg of paginatedPreguntas" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-400">{{ preg.orden }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{{ preg.pregunta }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ preg.puntaje }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ preg.respuesta_correcta }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button (click)="openEditPreguntaModal(preg)" class="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                      <button (click)="deletePregunta(preg)" class="text-red-600 hover:text-red-800 text-xs font-medium">Eliminar</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredPreguntas.length === 0">
                  <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">
                    {{ preguntaFilterEval ? 'No hay preguntas para esta evaluacion' : 'Seleccione una evaluacion para ver sus preguntas' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span class="text-xs text-gray-500">
              Mostrando {{ ((currentPage - 1) * pageSize) + 1 }} a {{ currentPage * pageSize > filteredPreguntas.length ? filteredPreguntas.length : currentPage * pageSize }} de {{ filteredPreguntas.length }} registros
            </span>
            <div class="flex items-center gap-2">
              <button (click)="currentPage = currentPage - 1" [disabled]="currentPage === 1" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Anterior</button>
              <span class="text-xs text-gray-600">Pagina {{ currentPage }} de {{ totalPages }}</span>
              <button (click)="currentPage = currentPage + 1" [disabled]="currentPage >= totalPages" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Siguiente</button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL: Crear/Editar Evaluacion -->
      <div *ngIf="evalModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="evalModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">{{ editingEval ? 'Editar Evaluacion' : 'Nueva Evaluacion' }}</h3>
            <button (click)="evalModalOpen = false" class="text-gray-400 hover:text-gray-600">&times;</button>
          </div>
          <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" [(ngModel)]="evalForm.nombre" placeholder="Nombre de la evaluacion" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select [(ngModel)]="evalForm.tipo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="">Seleccionar...</option>
                <option value="tecnica">Tecnica</option>
                <option value="psicologica">Psicologica</option>
                <option value="entrevista">Entrevista</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
              <textarea [(ngModel)]="evalForm.descripcion" rows="2" placeholder="Descripcion..." class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Duracion (min)</label>
                <input type="number" [(ngModel)]="evalForm.duracion_minutos" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Puntaje Minimo (%)</label>
                <input type="number" [(ngModel)]="evalForm.puntaje_minimo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button (click)="evalModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="saveEvaluacion()" [disabled]="saving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL: Asignar Evaluacion -->
      <div *ngIf="assignModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="assignModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Asignar Evaluacion</h3>
            <button (click)="assignModalOpen = false" class="text-gray-400 hover:text-gray-600">&times;</button>
          </div>
          <div class="px-6 py-4 space-y-4">
            <p class="text-sm text-gray-600">Asignar <strong>{{ assignEval?.nombre }}</strong> a un postulante:</p>
            <div *ngIf="assignLoading" class="flex items-center justify-center py-8">
              <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div *ngIf="!assignLoading">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Postulante</label>
              <select [(ngModel)]="assignPostulanteId" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="">Seleccionar...</option>
                <option *ngFor="let p of postulantesOptions" [value]="p.value">{{ p.label }}</option>
              </select>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button (click)="assignModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="assignEvaluacion()" [disabled]="saving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{ saving ? 'Asignando...' : 'Asignar' }}
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL: Crear/Editar Pregunta -->
      <div *ngIf="preguntaModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="preguntaModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">{{ editingPregunta ? 'Editar Pregunta' : 'Nueva Pregunta' }}</h3>
            <button (click)="preguntaModalOpen = false" class="text-gray-400 hover:text-gray-600">&times;</button>
          </div>
          <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Evaluacion *</label>
              <select [(ngModel)]="preguntaForm.evaluacion_id" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="">Seleccionar...</option>
                <option *ngFor="let e of evaluaciones" [value]="e.id">{{ e.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pregunta *</label>
              <textarea [(ngModel)]="preguntaForm.pregunta" rows="3" placeholder="Escriba la pregunta..." class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Opciones (JSON array)</label>
              <textarea [(ngModel)]="preguntaForm.opciones" rows="3" placeholder='["Opcion A", "Opcion B", "Opcion C", "Opcion D"]' class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"></textarea>
              <p class="text-xs text-gray-400 mt-1">Formato: ["Opcion A", "Opcion B", "Opcion C", "Opcion D"]</p>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Resp. Correcta</label>
                <input type="number" [(ngModel)]="preguntaForm.respuesta_correcta" placeholder="0" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
                <p class="text-xs text-gray-400 mt-0.5">Indice (0,1,2...)</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Puntaje</label>
                <input type="number" [(ngModel)]="preguntaForm.puntaje" placeholder="20" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                <input type="number" [(ngModel)]="preguntaForm.orden" placeholder="0" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"/>
              </div>
            </div>
            <p *ngIf="error" class="text-sm text-red-500">{{ error }}</p>
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button (click)="preguntaModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="savePregunta()" [disabled]="saving" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {{ saving ? 'Guardando...' : 'Guardar Pregunta' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Success/Error Toast -->
      <div *ngIf="successMsg" class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span class="text-sm font-medium">{{ successMsg }}</span>
      </div>

      <!-- MODAL: Aprobadores -->
      <div *ngIf="aprobadoresModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="aprobadoresModalOpen = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Configurar Aprobadores</h3>
            <button (click)="aprobadoresModalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <p class="text-sm text-gray-500 mb-4">Seleccione los aprobadores para la evaluación <strong>{{ aprobadoresEval?.nombre }}</strong>. El orden va de menor a mayor importancia.</p>

            <!-- Loading spinner -->
            <div *ngIf="aprobadoresLoading" class="flex items-center justify-center py-12">
              <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>

            <div *ngIf="!aprobadoresLoading">
            <!-- Usuarios disponibles -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Agregar Aprobador</label>
              <select (change)="addAprobador($event)" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                <option value="">Seleccionar usuario...</option>
                <option *ngFor="let u of availableAprobadores" [value]="u.id">{{ u.nombre }} ({{ u.area || u.rol }})</option>
              </select>
            </div>

            <!-- Cadena de aprobadores -->
            <div class="space-y-2 mb-4">
              <div *ngFor="let ap of selectedAprobadores; let i = index"
                class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{{ i + 1 }}</span>
                <div class="flex-1">
                  <span class="text-sm font-medium text-gray-900">{{ ap.nombre }}</span>
                  <span class="text-xs text-gray-400 ml-2">{{ ap.area || ap.rol }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <button *ngIf="i > 0" (click)="moveAprobador(i, -1)" class="p-1 text-gray-400 hover:text-blue-600" title="Subir">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                  </button>
                  <button *ngIf="i < selectedAprobadores.length - 1" (click)="moveAprobador(i, 1)" class="p-1 text-gray-400 hover:text-blue-600" title="Bajar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  <button (click)="removeAprobador(i)" class="p-1 text-gray-400 hover:text-red-600" title="Quitar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
              <div *ngIf="selectedAprobadores.length === 0" class="text-center py-6 text-sm text-gray-400">
                No hay aprobadores asignados. Seleccione usuarios arriba.
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button (click)="aprobadoresModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button (click)="guardarAprobadores()" [disabled]="saving || selectedAprobadores.length === 0" class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {{ saving ? 'Guardando...' : 'Guardar y Notificar' }}
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EvaluacionesComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  activeTab: 'evaluaciones' | 'preguntas' = 'evaluaciones';
  loading = true;
  loadingPreguntas = false;
  saving = false;
  error = '';
  currentPage = 1;
  pageSize = 8;

  evaluaciones: any[] = [];
  preguntas: any[] = [];
  filteredPreguntas: any[] = [];
  preguntaFilterEval = '';

  // Eval modal
  evalModalOpen = false;
  editingEval: any = null;
  evalForm: any = { nombre: '', tipo: '', descripcion: '', duracion_minutos: 60, puntaje_minimo: 60 };

  // Assign modal
  assignModalOpen = false;
  assignEval: any = null;
  assignPostulanteId = '';
  postulantesOptions: any[] = [];

  // Pregunta modal
  preguntaModalOpen = false;
  editingPregunta: any = null;
  preguntaForm: any = {
    evaluacion_id: '',
    pregunta: '',
    opciones: '["Opcion A", "Opcion B", "Opcion C", "Opcion D"]',
    respuesta_correcta: 0,
    puntaje: 20,
    orden: 0,
  };

  // Aprobadores
  aprobadoresModalOpen = false;
  aprobadoresLoading = false;
  aprobadoresEval: any = null;
  allUsers: any[] = [];
  selectedAprobadores: any[] = [];
  successMsg = '';

  // Assign
  assignLoading = false;

  get availableAprobadores(): any[] {
    const selectedIds = this.selectedAprobadores.map((a: any) => a.id);
    return this.allUsers.filter((u: any) => !selectedIds.includes(u.id));
  }

  tiposEvaluacion = [
    { value: 'tecnica', label: 'Tecnica' },
    { value: 'psicologica', label: 'Psicologica' },
    { value: 'entrevista', label: 'Entrevista' },
    { value: 'competencias', label: 'Competencias' },
  ];

  get evaluacionesOptions(): any[] {
    return this.evaluaciones.map((e) => ({ value: e.id, label: e.nombre }));
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPreguntas.length / this.pageSize);
  }

  get paginatedPreguntas(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPreguntas.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/evaluaciones/`).subscribe({
      next: (data) => {
        this.evaluaciones = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.evaluaciones = [];
        this.error = 'Error al cargar evaluaciones.';
        this.loading = false;
        console.error('Evaluaciones error:', err);
      },
    });
  }

  // Load preguntas for a specific evaluacion
  loadPreguntasForEval(): void {
    this.currentPage = 1;
    if (!this.preguntaFilterEval) {
      this.filteredPreguntas = [];
      return;
    }
    this.loadingPreguntas = true;
    this.http.get<any[]>(`${this.apiUrl}/evaluaciones/${this.preguntaFilterEval}/preguntas`).subscribe({
      next: (data) => {
        this.filteredPreguntas = data ?? [];
        this.loadingPreguntas = false;
      },
      error: () => {
        this.filteredPreguntas = [];
        this.loadingPreguntas = false;
      },
    });
  }

  // Load all preguntas across all evaluaciones (when switching to preguntas tab)
  loadAllPreguntas(): void {
    if (this.preguntaFilterEval) {
      this.loadPreguntasForEval();
    }
  }

  // Evaluacion CRUD
  openCreateEvalModal(): void {
    this.editingEval = null;
    this.evalForm = { nombre: '', tipo: '', descripcion: '', duracion_minutos: 60, puntaje_minimo: 60 };
    this.evalModalOpen = true;
  }

  openEditEvalModal(evalItem: any): void {
    this.editingEval = evalItem;
    this.evalForm = {
      nombre: evalItem.nombre,
      tipo: evalItem.tipo,
      descripcion: evalItem.descripcion,
      duracion_minutos: evalItem.duracion_minutos ?? 60,
      puntaje_minimo: evalItem.puntaje_minimo ?? 60,
    };
    this.evalModalOpen = true;
  }

  saveEvaluacion(): void {
    if (!this.evalForm.nombre || !this.evalForm.tipo) return;
    this.saving = true;
    this.error = '';

    const payload = {
      nombre: this.evalForm.nombre,
      tipo: this.evalForm.tipo,
      descripcion: this.evalForm.descripcion || null,
      duracion_minutos: this.evalForm.duracion_minutos ?? 60,
      puntaje_minimo: this.evalForm.puntaje_minimo ?? 60,
    };

    const url = this.editingEval
      ? `${this.apiUrl}/evaluaciones/${this.editingEval.id}`
      : `${this.apiUrl}/evaluaciones/`;
    const req = this.editingEval
      ? this.http.put<any>(url, payload)
      : this.http.post<any>(url, payload);

    req.subscribe({
      next: () => {
        this.evalModalOpen = false;
        this.saving = false;
        this.showSuccess(this.editingEval ? 'Evaluacion actualizada' : 'Evaluacion creada');
        this.loadData();
      },
      error: (err) => {
        this.error = 'Error al guardar evaluacion.';
        this.saving = false;
        console.error('Save eval error:', err);
      },
    });
  }

  deleteEvaluacion(evalItem: any): void {
    if (!confirm('Eliminar esta evaluacion y todas sus preguntas?')) return;
    this.http.delete(`${this.apiUrl}/evaluaciones/${evalItem.id}`).subscribe({
      next: () => {
        this.evaluaciones = this.evaluaciones.filter((e) => e.id !== evalItem.id);
      },
      error: (err) => console.error('Error eliminando evaluacion:', err),
    });
  }

  // Assign - uses POST /evaluaciones/asignar
  openAssignModal(evalItem: any): void {
    this.assignEval = evalItem;
    this.assignPostulanteId = '';
    this.assignModalOpen = true;
    this.assignLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/postulantes/`).subscribe({
      next: (data) => {
        this.postulantesOptions = (data ?? [])
          .filter((p: any) => p.estado === 'En Evaluacion' || p.estado === 'Nuevo')
          .map((p: any) => ({ value: p.id, label: `${p.nombre} - ${p.dni}` }));
        this.assignLoading = false;
      },
      error: () => { this.postulantesOptions = []; this.assignLoading = false; },
    });
  }

  assignEvaluacion(): void {
    if (!this.assignPostulanteId || !this.assignEval) return;
    this.saving = true;
    this.http.post(`${this.apiUrl}/evaluaciones/asignar`, {
      evaluacion_id: this.assignEval.id,
      postulante_id: Number(this.assignPostulanteId),
    }).subscribe({
      next: () => {
        this.assignModalOpen = false;
        this.saving = false;
        this.showSuccess('Evaluacion asignada exitosamente');
      },
      error: (err) => {
        this.saving = false;
        this.showError(err?.error?.detail || 'Error al asignar evaluacion');
      },
    });
  }

  // Pregunta CRUD
  openCreatePreguntaModal(): void {
    this.editingPregunta = null;
    const defaultEvalId = this.preguntaFilterEval || (this.evaluaciones.length > 0 ? this.evaluaciones[0].id : '');
    this.preguntaForm = {
      evaluacion_id: defaultEvalId,
      pregunta: '',
      opciones: '["Opcion A", "Opcion B", "Opcion C", "Opcion D"]',
      respuesta_correcta: 0,
      puntaje: 20,
      orden: 0,
    };
    this.preguntaModalOpen = true;
  }

  openEditPreguntaModal(preg: any): void {
    this.editingPregunta = preg;
    this.preguntaForm = {
      evaluacion_id: preg.evaluacion_id,
      pregunta: preg.pregunta,
      opciones: typeof preg.opciones === 'string' ? preg.opciones : JSON.stringify(preg.opciones),
      respuesta_correcta: preg.respuesta_correcta,
      puntaje: preg.puntaje,
      orden: preg.orden,
    };
    this.preguntaModalOpen = true;
  }

  savePregunta(): void {
    if (!this.preguntaForm.evaluacion_id) {
      this.error = 'Debe seleccionar una evaluacion para la pregunta';
      return;
    }
    if (!this.preguntaForm.pregunta) {
      this.error = 'El texto de la pregunta es obligatorio';
      return;
    }
    this.saving = true;
    this.error = '';

    const payload = {
      evaluacion_id: Number(this.preguntaForm.evaluacion_id),
      pregunta: this.preguntaForm.pregunta,
      opciones: this.preguntaForm.opciones,
      respuesta_correcta: Number(this.preguntaForm.respuesta_correcta) || 0,
      puntaje: Number(this.preguntaForm.puntaje) || 20,
      orden: Number(this.preguntaForm.orden) || 0,
    };

    const url = this.editingPregunta
      ? `${this.apiUrl}/evaluaciones/preguntas/${this.editingPregunta.id}`
      : `${this.apiUrl}/evaluaciones/preguntas`;
    const req = this.editingPregunta
      ? this.http.put<any>(url, payload)
      : this.http.post<any>(url, payload);

    req.subscribe({
      next: () => {
        this.preguntaModalOpen = false;
        this.saving = false;
        this.showSuccess(this.editingPregunta ? 'Pregunta actualizada' : 'Pregunta creada');
        this.loadPreguntasForEval();
        this.loadData();
      },
      error: (err) => {
        this.error = 'Error al guardar pregunta.';
        this.saving = false;
        console.error('Save pregunta error:', err);
      },
    });
  }

  deletePregunta(preg: any): void {
    if (!confirm('Eliminar esta pregunta?')) return;
    this.http.delete(`${this.apiUrl}/evaluaciones/preguntas/${preg.id}`).subscribe({
      next: () => {
        this.filteredPreguntas = this.filteredPreguntas.filter((p) => p.id !== preg.id);
      },
      error: (err) => console.error('Error eliminando pregunta:', err),
    });
  }

  // === APROBADORES ===

  openAprobadoresModal(eval_: any): void {
    this.aprobadoresEval = eval_;
    this.selectedAprobadores = [];
    this.aprobadoresModalOpen = true;
    this.aprobadoresLoading = true;
    this.error = '';
    this.successMsg = '';

    // Cargar usuarios (todos menos postulantes)
    this.http.get<any[]>(`${this.apiUrl}/usuarios/`).subscribe({
      next: (users) => {
        this.allUsers = (users || []).filter((u: any) => u.rol !== 'postulante' && u.activo);

        // Cargar aprobadores existentes de esta evaluación
        this.http.get<any[]>(`${this.apiUrl}/aprobadores/evaluacion/${eval_.id}`).subscribe({
          next: (aprobadores) => {
            this.selectedAprobadores = (aprobadores || []).map((ap: any) => ({
              id: ap.usuario_id,
              nombre: ap.nombre,
              area: ap.area,
              rol: ap.rol,
              orden: ap.orden,
            }));
            this.aprobadoresLoading = false;
          },
          error: () => { this.aprobadoresLoading = false; },
        });
      },
      error: () => { this.allUsers = []; this.aprobadoresLoading = false; },
    });
  }

  addAprobador(event: any): void {
    const userId = Number(event.target.value);
    if (!userId) return;
    const user = this.allUsers.find((u: any) => u.id === userId);
    if (user && !this.selectedAprobadores.find((a: any) => a.id === userId)) {
      this.selectedAprobadores.push({ ...user, orden: this.selectedAprobadores.length + 1 });
    }
    event.target.value = '';
  }

  removeAprobador(index: number): void {
    this.selectedAprobadores.splice(index, 1);
    this.selectedAprobadores.forEach((a: any, i: number) => a.orden = i + 1);
  }

  moveAprobador(index: number, direction: number): void {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.selectedAprobadores.length) return;
    const temp = this.selectedAprobadores[index];
    this.selectedAprobadores[index] = this.selectedAprobadores[newIndex];
    this.selectedAprobadores[newIndex] = temp;
    this.selectedAprobadores.forEach((a: any, i: number) => a.orden = i + 1);
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }

  private showError(msg: string): void {
    this.error = msg;
    setTimeout(() => this.error = '', 4000);
  }

  guardarAprobadores(): void {
    if (this.selectedAprobadores.length === 0) return;
    this.saving = true;
    this.error = '';

    const aprobadores = this.selectedAprobadores.map((a: any, i: number) => ({
      usuario_id: a.id,
      orden: i + 1,
    }));

    this.http.post<any>(`${this.apiUrl}/aprobadores/evaluacion/${this.aprobadoresEval.id}`, {
      aprobadores,
    }).subscribe({
      next: (res) => {
        this.aprobadoresModalOpen = false;
        this.saving = false;
        this.successMsg = `Aprobadores asignados y ${res.emails_enviados} correos enviados`;
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.detail || 'Error al guardar aprobadores';
      },
    });
  }
}
