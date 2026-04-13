import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

interface Opcion {
  id: number;
  texto: string;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: Opcion[];
}

interface EvaluacionAPI {
  id: number;
  evaluacion_id: number;
  evaluacion_nombre: string;
  evaluacion_tipo: string;
  puntaje_obtenido: number | null;
  estado: string;
}

interface Evaluacion {
  id: number;
  evaluacion_id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  puntaje: number | null;
  aprobado: boolean | null;
  fecha_completado: string | null;
  preguntas?: Pregunta[];
  total_preguntas: number;
}

interface ResultadoEvaluacion {
  puntaje: number;
  aprobado: boolean;
  respuestas_correctas: number;
  total_preguntas: number;
}

@Component({
  selector: 'app-evaluaciones',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent, StatusBadgeComponent],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Mi Selección</h1>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <p class="text-red-700 text-sm">{{ error }}</p>
        <button (click)="loadEvaluaciones()" class="mt-2 text-sm text-red-600 underline">Reintentar</button>
      </div>

      <!-- Quiz Mode -->
      <div *ngIf="quizMode && currentEval && currentEval.preguntas" class="max-w-3xl mx-auto">
        <!-- Quiz Header -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">{{ currentEval.nombre }}</h2>
            <button (click)="cancelQuiz()" class="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">Pregunta {{ currentQuestionIndex + 1 }} de {{ currentEval.preguntas.length }}</span>
            <div class="flex-1">
              <app-progress-bar [value]="quizProgress" [height]="6"></app-progress-bar>
            </div>
          </div>
        </div>

        <!-- Question -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <p class="text-base font-medium text-gray-900 mb-6">
            {{ currentEval.preguntas[currentQuestionIndex].texto }}
          </p>
          <div class="space-y-3">
            <button
              *ngFor="let opt of currentEval.preguntas[currentQuestionIndex].opciones"
              (click)="selectOption(opt.id)"
              class="w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm"
              [ngClass]="selectedAnswers[currentQuestionIndex] === opt.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'"
            >
              <div class="flex items-center gap-3">
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  [ngClass]="selectedAnswers[currentQuestionIndex] === opt.id ? 'border-blue-500' : 'border-gray-300'">
                  <div *ngIf="selectedAnswers[currentQuestionIndex] === opt.id" class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                </div>
                {{ opt.texto }}
              </div>
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex items-center justify-between">
          <button
            (click)="prevQuestion()"
            [disabled]="currentQuestionIndex === 0"
            class="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <button
            *ngIf="currentQuestionIndex < currentEval.preguntas.length - 1"
            (click)="nextQuestion()"
            [disabled]="selectedAnswers[currentQuestionIndex] === undefined"
            class="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
          <button
            *ngIf="currentQuestionIndex === currentEval.preguntas.length - 1"
            (click)="submitQuiz()"
            [disabled]="!allAnswered || submitting"
            class="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {{ submitting ? 'Enviando...' : 'Enviar Evaluacion' }}
          </button>
        </div>
      </div>

      <!-- Results Mode -->
      <div *ngIf="showResults && resultado" class="max-w-lg mx-auto">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <!-- Animated Score -->
          <div class="mb-6">
            <div class="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-4xl font-bold"
              [ngClass]="resultado.aprobado ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
              {{ resultado.puntaje }}%
            </div>
          </div>
          <h2 class="text-xl font-bold mb-2"
            [ngClass]="resultado.aprobado ? 'text-green-700' : 'text-red-700'">
            {{ resultado.aprobado ? 'Aprobado' : 'No Aprobado' }}
          </h2>
          <p class="text-gray-500 text-sm mb-6">
            Respuestas correctas: {{ resultado.respuestas_correctas }} de {{ resultado.total_preguntas }}
          </p>
          <button (click)="backToList()" class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Volver a la Lista
          </button>
        </div>
      </div>

      <!-- List Mode -->
      <div *ngIf="!loading && !error && !quizMode && !showResults">
        <div *ngIf="evaluaciones.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p>No tiene evaluaciones asignadas</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div *ngFor="let eval of evaluaciones" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-sm font-semibold text-gray-900">{{ eval.nombre }}</h3>
              <app-status-badge [status]="eval.estado"></app-status-badge>
            </div>
            <p class="text-xs text-gray-500 mb-4">{{ eval.descripcion }}</p>

            <div *ngIf="eval.estado === 'Completado'" class="mb-3">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs text-gray-500">Puntaje:</span>
                <span class="text-sm font-bold" [ngClass]="eval.aprobado ? 'text-green-600' : 'text-red-600'">
                  {{ eval.puntaje }}%
                </span>
                <span class="text-xs px-2 py-0.5 rounded-full"
                  [ngClass]="eval.aprobado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ eval.aprobado ? 'Aprobado' : 'No Aprobado' }}
                </span>
              </div>
              <p class="text-xs text-gray-400">Completado el {{ eval.fecha_completado }}</p>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-400">{{ eval.total_preguntas }} preguntas</span>
              <button
                *ngIf="eval.estado === 'Pendiente'"
                (click)="iniciarEvaluacion(eval)"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Iniciar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EvaluacionesPortalComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  evaluaciones: Evaluacion[] = [];
  loading = true;
  error = '';

  // Quiz state
  quizMode = false;
  showResults = false;
  currentEval: Evaluacion | null = null;
  currentQuestionIndex = 0;
  selectedAnswers: Record<number, number> = {};
  submitting = false;
  resultado: ResultadoEvaluacion | null = null;

  get quizProgress(): number {
    if (!this.currentEval?.preguntas) return 0;
    return ((this.currentQuestionIndex + 1) / this.currentEval.preguntas.length) * 100;
  }

  get allAnswered(): boolean {
    if (!this.currentEval?.preguntas) return false;
    return this.currentEval.preguntas.every((_, i) => this.selectedAnswers[i] !== undefined);
  }

  ngOnInit(): void {
    this.loadEvaluaciones();
  }

  loadEvaluaciones(): void {
    this.loading = true;
    this.error = '';
    this.http.get<EvaluacionAPI[]>(`${this.apiUrl}/portal/mis-evaluaciones`).subscribe({
      next: (res) => {
        this.evaluaciones = (res || []).map(e => ({
          id: e.id,
          evaluacion_id: e.evaluacion_id,
          nombre: e.evaluacion_nombre || 'Evaluación',
          descripcion: e.evaluacion_tipo === 'tecnica' ? 'Evaluación Técnica' : e.evaluacion_tipo === 'psicologica' ? 'Evaluación Psicológica' : e.evaluacion_tipo === 'entrevista' ? 'Entrevista' : e.evaluacion_tipo || '',
          estado: e.estado === 'pendiente' ? 'Pendiente' : e.estado === 'calificada' || e.estado === 'completada' ? 'Completado' : e.estado === 'en_progreso' ? 'En Progreso' : e.estado || 'Pendiente',
          puntaje: e.puntaje_obtenido,
          aprobado: e.puntaje_obtenido != null ? e.puntaje_obtenido >= 60 : null,
          fecha_completado: null,
          total_preguntas: 0,
        }));
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.evaluaciones = [];
          this.loading = false;
        } else {
          this.error = 'Error al cargar las evaluaciones.';
          this.loading = false;
        }
      },
    });
  }

  iniciarEvaluacion(eval_: Evaluacion): void {
    this.http.get<any[]>(`${this.apiUrl}/evaluaciones/${eval_.evaluacion_id}/preguntas`).subscribe({
      next: (rawPreguntas) => {
        // Mapear preguntas del API: {id, pregunta, opciones (JSON string), respuesta_correcta}
        // a formato del quiz: {id, texto, opciones: [{id, texto}]}
        const preguntas: Pregunta[] = (rawPreguntas || []).map((p: any) => {
          let opciones: Opcion[] = [];
          try {
            const parsed = typeof p.opciones === 'string' ? JSON.parse(p.opciones) : p.opciones;
            if (Array.isArray(parsed)) {
              opciones = parsed.map((opt: any, idx: number) => ({
                id: idx,
                texto: typeof opt === 'string' ? opt : opt.texto || opt.label || String(opt),
              }));
            }
          } catch {
            opciones = [];
          }
          return { id: p.id, texto: p.pregunta || p.texto || '', opciones };
        });

        this.currentEval = {
          ...eval_,
          preguntas,
          total_preguntas: preguntas.length,
        };
        this.currentQuestionIndex = 0;
        this.selectedAnswers = {};
        this.quizMode = true;
        this.showResults = false;
      },
      error: () => {
        this.error = 'Error al cargar las preguntas de la evaluación.';
      },
    });
  }

  selectOption(optionId: number): void {
    this.selectedAnswers[this.currentQuestionIndex] = optionId;
  }

  nextQuestion(): void {
    if (this.currentEval?.preguntas && this.currentQuestionIndex < this.currentEval.preguntas.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  submitQuiz(): void {
    if (!this.currentEval?.preguntas) return;
    this.submitting = true;
    const respuestas = this.currentEval.preguntas.map((p, i) => ({
      pregunta_id: p.id,
      respuesta_seleccionada: this.selectedAnswers[i],
    }));

    this.http.post<any>(
      `${this.apiUrl}/evaluaciones/submit`,
      {
        evaluacion_postulante_id: this.currentEval.id,
        respuestas,
      }
    ).subscribe({
      next: (res) => {
        this.resultado = {
          puntaje: res.puntaje_obtenido ?? res.puntaje ?? 0,
          aprobado: res.aprobado ?? (res.puntaje_obtenido >= 60),
          respuestas_correctas: res.respuestas_correctas ?? Math.round((res.puntaje_obtenido ?? 0) * (res.total_preguntas ?? 0) / 100),
          total_preguntas: res.total_preguntas ?? this.currentEval!.preguntas!.length,
        };
        this.quizMode = false;
        this.showResults = true;
        this.submitting = false;
        this.loadEvaluaciones();
      },
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.detail || 'Error al enviar la evaluación.';
      },
    });
  }

  cancelQuiz(): void {
    this.quizMode = false;
    this.currentEval = null;
  }

  backToList(): void {
    this.showResults = false;
    this.resultado = null;
  }
}
