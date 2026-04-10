import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KpiCardComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          (click)="loadData()"
          class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <!-- Error -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <p class="text-sm text-red-600">{{ error }}</p>
        <button (click)="loadData()" class="mt-2 text-xs text-red-700 underline">Reintentar</button>
      </div>

      <div *ngIf="!loading">
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <app-kpi-card
            title="Total Postulantes"
            [value]="stats.total_postulantes"
            subtitle="este mes"
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            color="#1a7ec5"
            [trend]="stats.trend_total"
          ></app-kpi-card>
          <app-kpi-card
            title="Aprobados"
            [value]="stats.aprobados"
            subtitle="este mes"
            icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            color="#10b981"
            [trend]="stats.trend_aprobados"
          ></app-kpi-card>
          <app-kpi-card
            title="En Evaluacion"
            [value]="stats.en_evaluacion"
            subtitle="en proceso"
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            color="#f59e0b"
            [trend]="stats.trend_evaluacion"
          ></app-kpi-card>
          <app-kpi-card
            title="Rechazados"
            [value]="stats.rechazados"
            subtitle="este mes"
            icon="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            color="#ef4444"
            [trend]="stats.trend_rechazados"
          ></app-kpi-card>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Bar Chart -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Postulantes por Puesto</h3>
            <div class="relative h-64">
              <canvas #barChartCanvas></canvas>
            </div>
          </div>

          <!-- Pie Chart -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Distribucion por Estado</h3>
            <div class="relative h-64 flex items-center justify-center">
              <canvas #pieChartCanvas></canvas>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Actividad Reciente</h3>
          <div class="space-y-3" *ngIf="activities.length > 0">
            <div
              *ngFor="let activity of activities"
              class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                [ngClass]="{
                  'bg-green-100 text-green-600': activity.tipo === 'aprobado',
                  'bg-red-100 text-red-600': activity.tipo === 'rechazado',
                  'bg-blue-100 text-blue-600': activity.tipo === 'nuevo',
                  'bg-yellow-100 text-yellow-600': activity.tipo === 'evaluacion'
                }">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    [attr.d]="getActivityIcon(activity.tipo)"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ activity.descripcion }}</p>
                <p class="text-xs text-gray-400">{{ activity.usuario }} - {{ activity.fecha }}</p>
              </div>
              <span class="text-xs px-2 py-1 rounded-full"
                [ngClass]="{
                  'bg-green-50 text-green-700': activity.tipo === 'aprobado',
                  'bg-red-50 text-red-700': activity.tipo === 'rechazado',
                  'bg-blue-50 text-blue-700': activity.tipo === 'nuevo',
                  'bg-yellow-50 text-yellow-700': activity.tipo === 'evaluacion'
                }">
                {{ activity.tipo | titlecase }}
              </span>
            </div>
          </div>
          <div *ngIf="activities.length === 0" class="text-center py-8 text-sm text-gray-400">
            No hay actividad reciente
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;

  loading = true;
  error = '';
  dataLoaded = false;

  stats: any = {
    total_postulantes: 0,
    aprobados: 0,
    en_evaluacion: 0,
    rechazados: 0,
    trend_total: null,
    trend_aprobados: null,
    trend_evaluacion: null,
    trend_rechazados: null,
  };

  chartData: any = {
    monthly: { labels: [], data: [] },
    status_distribution: [],
  };

  activities: any[] = [];

  private barChart: Chart | null = null;
  private pieChart: Chart | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized once data is loaded
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    this.http.get<any>(`${this.apiUrl}/dashboard/stats`).subscribe({
      next: (data) => {
        this.stats = {
          total_postulantes: data.total_postulantes ?? 0,
          aprobados: data.aprobados ?? 0,
          en_evaluacion: data.en_evaluacion ?? 0,
          rechazados: data.rechazados ?? 0,
          trend_total: data.trend_total ?? null,
          trend_aprobados: data.trend_aprobados ?? null,
          trend_evaluacion: data.trend_evaluacion ?? null,
          trend_rechazados: data.trend_rechazados ?? null,
        };
        this.loadCharts();
        this.loadActivities();
      },
      error: (err) => {
        this.error = 'Error al cargar estadisticas del dashboard.';
        this.loading = false;
        console.error('Dashboard stats error:', err);
      },
    });
  }

  private loadActivities(): void {
    this.http.get<any>(`${this.apiUrl}/seguridad/auditoria`, { params: { skip: '0', limit: '8' } }).subscribe({
      next: (data) => {
        const registros = data.registros ?? data ?? [];
        this.activities = (Array.isArray(registros) ? registros : []).slice(0, 8).map((r: any) => ({
          descripcion: r.detalle || r.accion,
          usuario: r.usuario_nombre || 'Sistema',
          fecha: r.fecha ? new Date(r.fecha).toLocaleDateString('es-PE') : '',
          tipo: r.accion === 'login' ? 'nuevo' : r.accion?.includes('apro') ? 'aprobado' : r.accion?.includes('recha') ? 'rechazado' : 'evaluacion',
        }));
      },
      error: () => { this.activities = []; },
    });
  }

  private loadCharts(): void {
    this.http.get<any>(`${this.apiUrl}/dashboard/charts`).subscribe({
      next: (data) => {
        this.processChartData(data);
        this.loading = false;
        this.dataLoaded = true;
        setTimeout(() => this.initCharts(), 150);
      },
      error: () => {
        this.buildDefaultCharts();
        this.loading = false;
        this.dataLoaded = true;
        setTimeout(() => this.initCharts(), 150);
      },
    });
  }

  private processChartData(data: any): void {
    // API devuelve: postulantes_por_estado: [{estado, cantidad}], postulantes_por_puesto: [{puesto, cantidad}]
    const porEstado = data.postulantes_por_estado ?? [];
    const porPuesto = data.postulantes_por_puesto ?? [];

    const colorMap: Record<string, string> = {
      'En Evaluacion': '#f59e0b',
      'Aprobado': '#10b981',
      'Rechazado': '#ef4444',
      'Trabajador': '#1a7ec5',
    };

    this.chartData = {
      bar: {
        labels: porPuesto.map((p: any) => p.puesto),
        data: porPuesto.map((p: any) => p.cantidad),
      },
      pie: porEstado.map((e: any) => ({
        label: e.estado,
        value: e.cantidad,
        color: colorMap[e.estado] ?? '#94a3b8',
      })),
    };
  }

  private buildDefaultCharts(): void {
    this.chartData = {
      bar: { labels: [], data: [] },
      pie: [
        { label: 'Aprobados', value: this.stats.aprobados, color: '#10b981' },
        { label: 'En Evaluacion', value: this.stats.en_evaluacion, color: '#f59e0b' },
        { label: 'Rechazados', value: this.stats.rechazados, color: '#ef4444' },
      ],
    };
  }

  private initCharts(): void {
    this.initBarChart();
    this.initPieChart();
  }

  private initBarChart(): void {
    if (!this.barChartCanvas?.nativeElement) return;
    if (this.barChart) this.barChart.destroy();

    const bar = this.chartData.bar ?? { labels: [], data: [] };
    this.barChart = new Chart(this.barChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: bar.labels ?? [],
        datasets: [
          {
            label: 'Postulantes',
            data: bar.data ?? [],
            backgroundColor: ['#1a7ec5', '#3ec6e0', '#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#f97316'],
            borderRadius: 6,
            barThickness: 32,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f3f4f6' },
            ticks: { font: { size: 11 }, stepSize: 1 },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 }, maxRotation: 45 },
          },
        },
      },
    });
  }

  private initPieChart(): void {
    if (!this.pieChartCanvas?.nativeElement) return;
    if (this.pieChart) this.pieChart.destroy();

    const dist = this.chartData.pie ?? [];
    const hasData = dist.some((d: any) => d.value > 0);

    this.pieChart = new Chart(this.pieChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: hasData ? dist.map((d: any) => d.label) : ['Sin datos'],
        datasets: [
          {
            data: hasData ? dist.map((d: any) => d.value) : [1],
            backgroundColor: hasData ? dist.map((d: any) => d.color) : ['#e5e7eb'],
            borderWidth: 0,
            spacing: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } },
          },
          tooltip: { enabled: hasData },
        },
      },
    });
  }

  getActivityIcon(tipo: string): string {
    const icons: Record<string, string> = {
      aprobado: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      rechazado: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      nuevo: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
      evaluacion: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    };
    return icons[tipo] ?? 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  }
}
