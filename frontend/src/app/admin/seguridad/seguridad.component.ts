import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-seguridad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Seguridad y Auditoria</h1>
        <div class="flex items-center gap-3">
          <!-- View Toggle -->
          <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              (click)="viewMode = 'admin'"
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              [ngClass]="viewMode === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >Admin</button>
            <button
              (click)="viewMode = 'auditor'"
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              [ngClass]="viewMode === 'auditor' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >Auditor</button>
          </div>
          <button
            (click)="exportar()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exportar
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              [(ngModel)]="filterDateFrom"
              (ngModelChange)="loadLogs()"
              class="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              [(ngModel)]="filterDateTo"
              (ngModelChange)="loadLogs()"
              class="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Usuario</label>
            <input
              type="text"
              [(ngModel)]="filterUser"
              (ngModelChange)="applyFilters()"
              placeholder="Filtrar por usuario..."
              class="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Tipo de Accion</label>
            <select
              [(ngModel)]="filterAction"
              (ngModelChange)="loadLogs()"
              class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Todas</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="crear">Crear</option>
              <option value="editar">Editar</option>
              <option value="eliminar">Eliminar</option>
              <option value="aprobar">Aprobar</option>
              <option value="rechazar">Rechazar</option>
              <option value="exportar">Exportar</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              (click)="clearFilters()"
              class="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 underline"
            >Limpiar filtros</button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-500">Cargando...</span>
        </div>
      </div>

      <!-- Admin View - Summary Cards -->
      <div *ngIf="!loading && viewMode === 'admin'" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p class="text-xs text-gray-400">Total Eventos</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ filteredLogs.length }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p class="text-xs text-gray-400">Logins Hoy</p>
          <p class="text-2xl font-bold text-blue-600 mt-1">{{ todayLogins }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p class="text-xs text-gray-400">Acciones Criticas</p>
          <p class="text-2xl font-bold text-red-600 mt-1">{{ criticalActions }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p class="text-xs text-gray-400">Usuarios Unicos</p>
          <p class="text-2xl font-bold text-green-600 mt-1">{{ uniqueUsers }}</p>
        </div>
      </div>

      <!-- Audit Log Table -->
      <div *ngIf="!loading" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usuario</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Accion</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Detalle</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">IP</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let log of paginatedLogs" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{{ log.fecha }}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ log.usuario_nombre || log.usuario_email || 'N/A' }}</td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-1 rounded-full font-medium"
                    [ngClass]="{
                      'bg-blue-50 text-blue-700': log.accion === 'login' || log.accion === 'logout',
                      'bg-green-50 text-green-700': log.accion === 'crear' || log.accion === 'aprobar',
                      'bg-yellow-50 text-yellow-700': log.accion === 'editar',
                      'bg-red-50 text-red-700': log.accion === 'eliminar' || log.accion === 'rechazar',
                      'bg-gray-50 text-gray-700': !['login','logout','crear','aprobar','editar','eliminar','rechazar'].includes(log.accion)
                    }">
                    {{ log.accion }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{{ log.detalle }}</td>
                <td class="px-4 py-3 text-sm text-gray-400 font-mono">{{ log.ip_address }}</td>
              </tr>
              <tr *ngIf="paginatedLogs.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">No hay registros</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between" *ngIf="totalPages > 1">
          <span class="text-xs text-gray-500">
            Pagina {{ currentPage }} de {{ totalPages }} ({{ filteredLogs.length }} registros)
          </span>
          <div class="flex items-center gap-1">
            <button
              class="px-3 py-1 text-xs rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              [disabled]="currentPage === 1"
              (click)="currentPage = currentPage - 1"
            >Anterior</button>
            <button
              class="px-3 py-1 text-xs rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              [disabled]="currentPage === totalPages"
              (click)="currentPage = currentPage + 1"
            >Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SeguridadComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  loading = true;
  viewMode: 'admin' | 'auditor' = 'admin';

  logs: any[] = [];
  filteredLogs: any[] = [];

  filterDateFrom = '';
  filterDateTo = '';
  filterUser = '';
  filterAction = '';

  currentPage = 1;
  pageSize = 8;

  get totalPages(): number {
    return Math.ceil(this.filteredLogs.length / this.pageSize);
  }

  get paginatedLogs(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLogs.slice(start, start + this.pageSize);
  }

  get todayLogins(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.filteredLogs.filter((l) =>
      (l.accion ?? '').includes('login') && (l.fecha ?? '').startsWith(today)
    ).length;
  }

  get criticalActions(): number {
    return this.filteredLogs.filter((l) =>
      ['eliminar', 'rechazar', 'desactivar'].some((a) => (l.accion ?? '').includes(a))
    ).length;
  }

  get uniqueUsers(): number {
    return new Set(this.filteredLogs.map((l) => l.usuario_nombre ?? l.usuario_email).filter(Boolean)).size;
  }

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    const params: any = { limit: 200 };
    if (this.filterDateFrom) params.fecha_desde = this.filterDateFrom;
    if (this.filterDateTo) params.fecha_hasta = this.filterDateTo;
    if (this.filterAction) params.accion = this.filterAction;
    if (this.filterUser) params.buscar = this.filterUser;

    this.http.get<any>(`${this.apiUrl}/seguridad/auditoria`, { params }).subscribe({
      next: (data) => {
        this.logs = data?.registros ?? [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.logs = [];
        this.filteredLogs = [];
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    // Filter client-side from the loaded data
    let result = [...this.logs];

    if (this.filterUser) {
      const term = this.filterUser.toLowerCase();
      result = result.filter((l) =>
        (l.usuario_nombre ?? '').toLowerCase().includes(term) ||
        (l.usuario_email ?? '').toLowerCase().includes(term)
      );
    }

    this.filteredLogs = result;
  }

  reloadWithFilters(): void {
    this.loadLogs();
  }

  clearFilters(): void {
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.filterUser = '';
    this.filterAction = '';
    this.loadLogs();
  }

  exportar(): void {
    if (this.filteredLogs.length === 0) {
      alert('No hay registros para exportar.');
      return;
    }
    const headers = ['Fecha', 'Usuario', 'Accion', 'Detalle', 'IP'];
    const rows = this.filteredLogs.map((l) => [
      l.fecha ?? '',
      l.usuario_nombre ?? l.usuario_email ?? '',
      l.accion ?? '',
      (l.detalle ?? '').replace(/"/g, '""'),
      l.ip_address ?? '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c: string) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
