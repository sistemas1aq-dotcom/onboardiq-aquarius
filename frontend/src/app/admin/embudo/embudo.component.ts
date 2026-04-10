import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-embudo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Embudo de Seleccion</h1>
        <button
          (click)="loadData()"
          class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >Actualizar</button>
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

      <div *ngIf="!loading && !error">
        <!-- Funnel Visualization -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-6 text-center">Proceso de Seleccion</h3>
          <div class="max-w-2xl mx-auto space-y-3">
            <div *ngFor="let step of funnelSteps; let i = index" class="relative">
              <div
                class="rounded-lg px-4 md:px-6 py-4 flex items-center justify-between transition-all"
                [style.background-color]="step.color + '15'"
                [style.border-left]="'4px solid ' + step.color"
                [style.margin-left.px]="i * 20"
                [style.margin-right.px]="i * 20"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                    [style.background-color]="step.color">
                    {{ i + 1 }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ step.label }}</p>
                    <p class="text-xs text-gray-400 hidden sm:block">{{ step.description }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold" [style.color]="step.color">{{ step.count }}</p>
                  <p class="text-xs text-gray-400">{{ step.percentage }}%</p>
                </div>
              </div>

              <!-- Conversion arrow -->
              <div *ngIf="i < funnelSteps.length - 1" class="flex items-center justify-center py-1">
                <div class="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                  <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                  <span class="text-xs font-medium text-gray-500">{{ getConversionRate(i) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Rechazados -->
          <div *ngIf="rechazados > 0" class="mt-6 flex items-center justify-center">
            <div class="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
              <span class="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              <span class="text-sm font-medium text-red-700">{{ rechazados }} rechazados</span>
              <span class="text-xs text-red-400">({{ tasaRechazo }}% del total)</span>
            </div>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <!-- Conversion Summary -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Tasas del Proceso</h3>
            <div class="space-y-4">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-500">Tasa de Conversion</span>
                  <span class="text-xs font-semibold text-blue-600">{{ tasas.conversion }}%</span>
                </div>
                <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-blue-500 transition-all" [style.width.%]="tasas.conversion"></div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-500">Tasa de Rechazo</span>
                  <span class="text-xs font-semibold text-red-600">{{ tasas.rechazo }}%</span>
                </div>
                <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-red-500 transition-all" [style.width.%]="tasas.rechazo"></div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-500">Aprobacion Evaluaciones</span>
                  <span class="text-xs font-semibold text-green-600">{{ tasas.aprobacion_evaluaciones }}%</span>
                </div>
                <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-green-500 transition-all" [style.width.%]="tasas.aprobacion_evaluaciones"></div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-500">Completitud Documentos</span>
                  <span class="text-xs font-semibold text-yellow-600">{{ tasas.completitud_documentos }}%</span>
                </div>
                <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-yellow-500 transition-all" [style.width.%]="tasas.completitud_documentos"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Risk Breakdown -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Distribucion de Riesgo</h3>
            <div class="flex justify-center mb-4">
              <canvas #riskChartCanvas width="200" height="200"></canvas>
            </div>
            <div class="flex items-center justify-center gap-4">
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span class="text-xs text-gray-600">Bajo ({{ riesgos.bajo }})</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span class="text-xs text-gray-600">Medio ({{ riesgos.medio }})</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-red-500"></span>
                <span class="text-xs text-gray-600">Alto ({{ riesgos.alto }})</span>
              </div>
            </div>
          </div>

          <!-- Key Metrics -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Resumen General</h3>
            <div class="space-y-4">
              <div>
                <span class="text-xs text-gray-400">Total Postulantes</span>
                <p class="text-xl font-bold text-gray-900">{{ totalPostulantes }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">En Evaluacion</span>
                <p class="text-xl font-bold text-blue-600">{{ enEvaluacion }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">Trabajadores Activos</span>
                <p class="text-xl font-bold text-green-600">{{ trabajadores }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">Rechazados</span>
                <p class="text-xl font-bold text-red-600">{{ rechazados }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EmbudoComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  @ViewChild('riskChartCanvas') riskChartCanvas!: ElementRef<HTMLCanvasElement>;

  loading = true;
  error = '';
  private riskChart: Chart | null = null;

  funnelSteps: any[] = [];
  rechazados = 0;
  tasaRechazo = 0;
  tasas: any = { conversion: 0, rechazo: 0, aprobacion_evaluaciones: 0, completitud_documentos: 0 };
  riesgos: any = { bajo: 0, medio: 0, alto: 0 };
  totalPostulantes = 0;
  enEvaluacion = 0;
  trabajadores = 0;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any>(`${this.apiUrl}/embudo/stats`).subscribe({
      next: (data) => {
        this.processData(data);
        this.loading = false;
        setTimeout(() => this.initRiskChart(), 100);
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Error al cargar datos del embudo';
        this.loading = false;
      },
    });
  }

  private processData(data: any): void {
    // API devuelve: { embudo: [{etapa, cantidad, orden}], rechazados, tasas: {...}, riesgos: {...} }
    const embudo = data.embudo ?? [];
    const total = embudo.length > 0 ? embudo[0].cantidad || 1 : 1;

    const colors = ['#1a7ec5', '#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4'];
    const descriptions = [
      'Todos los postulantes registrados',
      'En proceso de evaluacion tecnica y psicologica',
      'Documentacion completa y verificada',
      'Entrevistas programadas y completadas',
      'Postulantes aprobados por el comite',
      'Incorporados como trabajadores',
    ];

    this.funnelSteps = embudo.map((step: any, i: number) => ({
      label: step.etapa,
      count: step.cantidad ?? 0,
      percentage: total > 0 ? Math.round(((step.cantidad ?? 0) / total) * 100) : 0,
      color: colors[i % colors.length],
      description: descriptions[i] ?? '',
    }));

    this.rechazados = data.rechazados ?? 0;
    this.tasaRechazo = Math.round((this.rechazados / Math.max(total, 1)) * 100);

    this.tasas = data.tasas ?? { conversion: 0, rechazo: 0, aprobacion_evaluaciones: 0, completitud_documentos: 0 };
    this.riesgos = data.riesgos ?? { bajo: 0, medio: 0, alto: 0 };

    // Calcular metricas del embudo
    this.totalPostulantes = total;
    const evalStep = embudo.find((s: any) => s.etapa === 'En Evaluacion');
    this.enEvaluacion = evalStep?.cantidad ?? 0;
    const contratadoStep = embudo.find((s: any) => s.etapa === 'Contratado' || s.etapa === 'Trabajador');
    this.trabajadores = contratadoStep?.cantidad ?? 0;
  }

  getConversionRate(index: number): number {
    if (index >= this.funnelSteps.length - 1) return 0;
    const from = this.funnelSteps[index].count;
    const to = this.funnelSteps[index + 1].count;
    return from > 0 ? Math.round((to / from) * 100) : 0;
  }

  private initRiskChart(): void {
    if (!this.riskChartCanvas?.nativeElement) return;
    if (this.riskChart) this.riskChart.destroy();

    const hasData = this.riesgos.bajo > 0 || this.riesgos.medio > 0 || this.riesgos.alto > 0;

    this.riskChart = new Chart(this.riskChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Bajo', 'Medio', 'Alto'],
        datasets: [{
          data: hasData ? [this.riesgos.bajo, this.riesgos.medio, this.riesgos.alto] : [1, 1, 1],
          backgroundColor: hasData ? ['#10b981', '#f59e0b', '#ef4444'] : ['#e5e7eb', '#e5e7eb', '#e5e7eb'],
          borderWidth: 0,
          spacing: 2,
        }],
      },
      options: {
        responsive: false,
        cutout: '60%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: hasData },
        },
      },
    });
  }
}
