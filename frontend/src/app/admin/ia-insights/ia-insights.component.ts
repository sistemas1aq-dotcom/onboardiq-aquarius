import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ia-insights',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">IA Insights</h1>

      <!-- Postulante Selector -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex-1 min-w-[250px]">
            <label class="block text-xs font-medium text-gray-500 mb-1">Seleccionar Postulante</label>
            <select
              [(ngModel)]="selectedPostulanteId"
              (ngModelChange)="onPostulanteChange()"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">-- Seleccionar --</option>
              <option *ngFor="let p of postulantes" [value]="p.id">{{ p.nombre }} - {{ p.dni }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2 pt-4">
            <button
              (click)="analizarCV()"
              [disabled]="!selectedPostulanteId || analyzingCV"
              class="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg *ngIf="analyzingCV" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Analizar CV
            </button>
            <button
              (click)="calcularScoring()"
              [disabled]="!selectedPostulanteId || calculatingScore"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg *ngIf="calculatingScore" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Calcular Scoring
            </button>
            <button
              (click)="verInsights()"
              [disabled]="!selectedPostulanteId || loadingInsights"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >Ver Insights</button>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMsg" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <div>
            <p class="text-sm font-medium text-red-700">{{ errorMsg }}</p>
            <p *ngIf="errorMsg.includes('API_KEY')" class="text-xs text-red-500 mt-1">Configure ANTHROPIC_API_KEY en el archivo api/.env y reinicie el backend.</p>
          </div>
          <button (click)="errorMsg = ''" class="ml-auto text-red-400 hover:text-red-600">&times;</button>
        </div>
      </div>

      <!-- Success Message -->
      <div *ngIf="successMsg" class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <p class="text-sm text-green-700">{{ successMsg }}</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loadingPostulantes" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-500">Cargando...</span>
        </div>
      </div>

      <div *ngIf="!loadingPostulantes" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- CV Analysis Results -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Analisis de CV
          </h3>
          <div *ngIf="cvAnalysis" class="space-y-4">
            <div *ngFor="let section of cvAnalysisSections" class="border border-gray-100 rounded-lg p-3">
              <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2">{{ section.title }}</h4>
              <div *ngIf="isArray(section.data)">
                <div *ngFor="let item of section.data" class="text-sm text-gray-700 py-0.5">
                  <span *ngIf="isString(item)">{{ item }}</span>
                  <div *ngIf="!isString(item)">
                    <span class="font-medium">{{ item.key ?? item.nombre ?? '' }}:</span>
                    <span class="text-gray-500 ml-1">{{ item.value ?? item.detalle ?? '' }}</span>
                  </div>
                </div>
              </div>
              <p *ngIf="!isArray(section.data)" class="text-sm text-gray-700">{{ section.data }}</p>
            </div>
          </div>
          <div *ngIf="!cvAnalysis" class="text-center py-12 text-sm text-gray-400">
            <svg class="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Seleccione un postulante y haga clic en "Analizar CV"
          </div>
        </div>

        <!-- Scoring Results -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Scoring de Compatibilidad
          </h3>
          <div *ngIf="scoringResult">
            <!-- Overall Score -->
            <div class="text-center mb-6">
              <div class="inline-flex items-center justify-center w-24 h-24 rounded-full border-4"
                [ngClass]="{
                  'border-green-400 text-green-600': scoringResult.score >= 70,
                  'border-yellow-400 text-yellow-600': scoringResult.score >= 40 && scoringResult.score < 70,
                  'border-red-400 text-red-600': scoringResult.score < 40
                }">
                <span class="text-2xl font-bold">{{ scoringResult.score }}</span>
              </div>
              <p class="text-sm text-gray-500 mt-2">Puntuacion General</p>
            </div>
            <!-- Breakdown -->
            <div class="space-y-3">
              <div *ngFor="let item of scoringResult.breakdown ?? []">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-600">{{ item.label }}</span>
                  <span class="text-xs font-medium text-gray-700">{{ item.score }}/100</span>
                </div>
                <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500"
                    [style.width.%]="item.score"
                    [ngClass]="{
                      'bg-green-500': item.score >= 70,
                      'bg-yellow-500': item.score >= 40 && item.score < 70,
                      'bg-red-500': item.score < 40
                    }"></div>
                </div>
              </div>
            </div>
            <!-- Recommendation -->
            <div *ngIf="scoringResult.recomendacion" class="mt-4 p-3 bg-blue-50 rounded-lg">
              <p class="text-xs font-medium text-blue-700">Recomendacion:</p>
              <p class="text-sm text-blue-600 mt-1">{{ scoringResult.recomendacion }}</p>
            </div>
          </div>
          <div *ngIf="!scoringResult" class="text-center py-12 text-sm text-gray-400">
            <svg class="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Seleccione un postulante y haga clic en "Calcular Scoring"
          </div>
        </div>

        <!-- Insights -->
        <div *ngIf="insights" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Insights IA
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let insight of insights" class="border border-gray-100 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="w-2 h-2 rounded-full"
                  [ngClass]="{
                    'bg-green-500': insight.tipo === 'positivo',
                    'bg-red-500': insight.tipo === 'negativo',
                    'bg-yellow-500': insight.tipo === 'neutral',
                    'bg-blue-500': !insight.tipo
                  }"></span>
                <span class="text-xs font-semibold text-gray-700 uppercase">{{ insight.categoria }}</span>
              </div>
              <p class="text-sm text-gray-600">{{ insight.mensaje }}</p>
            </div>
          </div>
        </div>

        <!-- Chatbot Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h3 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
            Chat con IA
          </h3>

          <!-- Messages -->
          <div class="border border-gray-100 rounded-lg p-4 mb-4 max-h-80 overflow-y-auto space-y-3 bg-gray-50" #chatContainer>
            <div *ngIf="chatMessages.length === 0" class="text-center py-8 text-sm text-gray-400">
              Haga una pregunta sobre el postulante seleccionado
            </div>
            <div *ngFor="let msg of chatMessages" class="flex" [ngClass]="msg.role === 'user' ? 'justify-end' : 'justify-start'">
              <div class="max-w-[80%] rounded-lg px-4 py-2 text-sm"
                [ngClass]="msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700'">
                <p class="whitespace-pre-wrap">{{ msg.content }}</p>
                <span class="text-[10px] mt-1 block" [ngClass]="msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'">{{ msg.time }}</span>
              </div>
            </div>
            <div *ngIf="sendingMessage" class="flex justify-start">
              <div class="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="flex items-center gap-3">
            <input
              type="text"
              [(ngModel)]="chatInput"
              (keydown.enter)="sendMessage()"
              placeholder="Escribe tu pregunta..."
              [disabled]="sendingMessage"
              class="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50"
            />
            <button
              (click)="sendMessage()"
              [disabled]="!chatInput.trim() || sendingMessage"
              class="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class IaInsightsComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  loadingPostulantes = true;
  analyzingCV = false;
  calculatingScore = false;
  loadingInsights = false;
  sendingMessage = false;
  errorMsg = '';
  successMsg = '';

  postulantes: any[] = [];
  selectedPostulanteId = '';
  selectedPostulante: any = null;

  cvAnalysis: any = null;
  cvAnalysisSections: any[] = [];
  scoringResult: any = null;
  insights: any[] | null = null;

  chatMessages: any[] = [];
  chatInput = '';

  ngOnInit(): void {
    this.loadPostulantes();
  }

  loadPostulantes(): void {
    this.loadingPostulantes = true;
    this.http.get<any[]>(`${this.apiUrl}/postulantes/`).subscribe({
      next: (data) => {
        this.postulantes = data ?? [];
        this.loadingPostulantes = false;
      },
      error: () => {
        this.postulantes = [];
        this.loadingPostulantes = false;
      },
    });
  }

  onPostulanteChange(): void {
    this.cvAnalysis = null;
    this.cvAnalysisSections = [];
    this.scoringResult = null;
    this.insights = null;
    this.chatMessages = [];
    this.errorMsg = '';
    this.successMsg = '';
    this.selectedPostulante = this.postulantes.find(p => p.id === Number(this.selectedPostulanteId)) || null;
  }

  private handleApiError(err: any, context: string): void {
    const detail = err?.error?.detail || err?.error?.message || err?.message || 'Error desconocido';
    if (detail.includes('API_KEY') || detail.includes('no esta configurada')) {
      this.errorMsg = `${context}: La ANTHROPIC_API_KEY no esta configurada en el servidor. Configure la clave en api/.env y reinicie el backend.`;
    } else {
      this.errorMsg = `${context}: ${detail}`;
    }
  }

  analizarCV(): void {
    if (!this.selectedPostulanteId) return;
    this.analyzingCV = true;
    this.errorMsg = '';
    this.successMsg = '';

    const puesto = this.selectedPostulante?.puesto || 'General';
    const cvText = `Candidato: ${this.selectedPostulante?.nombre || 'N/A'}. DNI: ${this.selectedPostulante?.dni || 'N/A'}. Puesto: ${puesto}. Email: ${this.selectedPostulante?.email || 'N/A'}.`;

    this.http.post<any>(`${this.apiUrl}/ia/analizar-cv`, {
      postulante_id: Number(this.selectedPostulanteId),
      cv_text: cvText,
      puesto: puesto,
    }).subscribe({
      next: (data) => {
        this.cvAnalysis = data?.resultado || data;
        this.cvAnalysisSections = this.parseCvSections(this.cvAnalysis);
        this.analyzingCV = false;
        this.successMsg = 'Analisis de CV completado';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.handleApiError(err, 'Analizar CV');
        this.analyzingCV = false;
      },
    });
  }

  calcularScoring(): void {
    if (!this.selectedPostulanteId) return;
    this.calculatingScore = true;
    this.errorMsg = '';
    this.successMsg = '';

    const puesto = this.selectedPostulante?.puesto || 'General';

    this.http.post<any>(`${this.apiUrl}/ia/scoring`, {
      postulante_id: Number(this.selectedPostulanteId),
      puesto: puesto,
    }).subscribe({
      next: (data) => {
        const resultado = data?.resultado || data;
        this.scoringResult = typeof resultado === 'string' ? JSON.parse(resultado) : resultado;
        if (!this.scoringResult.score && data?.score) {
          this.scoringResult.score = data.score;
        }
        this.calculatingScore = false;
        this.successMsg = 'Scoring calculado';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.handleApiError(err, 'Calcular Scoring');
        this.calculatingScore = false;
      },
    });
  }

  verInsights(): void {
    if (!this.selectedPostulanteId) return;
    this.loadingInsights = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.http.get<any>(`${this.apiUrl}/ia/insights/${this.selectedPostulanteId}`).subscribe({
      next: (data) => {
        const resultado = data?.resultado || data;
        this.insights = Array.isArray(resultado) ? resultado : (resultado ? [resultado] : []);
        this.loadingInsights = false;
        this.successMsg = 'Insights cargados';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.handleApiError(err, 'Ver Insights');
        this.loadingInsights = false;
      },
    });
  }

  sendMessage(): void {
    const text = this.chatInput.trim();
    if (!text) return;

    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    this.chatMessages.push({ role: 'user', content: text, time });
    this.chatInput = '';
    this.sendingMessage = true;
    this.errorMsg = '';

    this.http.post<any>(`${this.apiUrl}/ia/chat`, {
      message: text,
      context: this.selectedPostulante ? `Postulante: ${this.selectedPostulante.nombre}, Puesto: ${this.selectedPostulante.puesto}` : null,
    }).subscribe({
      next: (data) => {
        const respTime = new Date();
        this.chatMessages.push({
          role: 'assistant',
          content: data.response ?? data.respuesta ?? data.message ?? 'Sin respuesta',
          time: respTime.getHours().toString().padStart(2, '0') + ':' + respTime.getMinutes().toString().padStart(2, '0'),
        });
        this.sendingMessage = false;
      },
      error: (err) => {
        const detail = err?.error?.detail || 'Error al obtener respuesta';
        this.chatMessages.push({
          role: 'assistant',
          content: detail.includes('API_KEY') ? 'La API de IA no esta configurada. Configure ANTHROPIC_API_KEY en api/.env' : detail,
          time,
        });
        this.sendingMessage = false;
      },
    });
  }

  private parseCvSections(data: any): any[] {
    if (!data) return [];
    const sections: any[] = [];
    const sectionMap: Record<string, string> = {
      datos_personales: 'Datos Personales',
      educacion: 'Educacion',
      experiencia: 'Experiencia Laboral',
      habilidades: 'Habilidades',
      idiomas: 'Idiomas',
      certificaciones: 'Certificaciones',
      resumen: 'Resumen',
    };
    for (const [key, title] of Object.entries(sectionMap)) {
      if (data[key]) {
        sections.push({ title, data: data[key] });
      }
    }
    if (sections.length === 0 && typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'postulante_id' && key !== 'id') {
          sections.push({ title: key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()), data: value });
        }
      }
    }
    return sections;
  }

  isArray(val: any): boolean {
    return Array.isArray(val);
  }

  isString(val: any): boolean {
    return typeof val === 'string';
  }
}
