import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-legajo',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, ProgressBarComponent],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Legajo del Trabajador</h1>

      <!-- Search -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div class="flex items-center gap-4">
          <div class="relative flex-1 max-w-md">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="searchWorkers()"
              placeholder="Buscar trabajador por nombre o DNI..."
              class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Search Results -->
        <div *ngIf="searchResults.length > 0 && !selectedWorker" class="mt-3 border border-gray-100 rounded-lg divide-y divide-gray-50">
          <div
            *ngFor="let w of searchResults"
            class="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors"
            (click)="selectWorker(w)"
          >
            <div>
              <span class="text-sm font-medium text-gray-900">{{ w.nombre }}</span>
              <span class="text-xs text-gray-400 ml-3">DNI: {{ w.dni }}</span>
              <span class="text-xs text-gray-400 ml-3">{{ w.puesto }}</span>
            </div>
            <app-status-badge [status]="w.estado"></app-status-badge>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loadingDetail" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-500">Cargando legajo...</span>
        </div>
      </div>

      <!-- Detail View -->
      <div *ngIf="selectedWorker && legajo && !loadingDetail">
        <!-- Worker Header -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
              {{ getInitials(selectedWorker) }}
            </div>
            <div class="flex-1">
              <h2 class="text-lg font-semibold text-gray-900">{{ legajo.usuario?.nombre || selectedWorker.nombre }}</h2>
              <p class="text-sm text-gray-500">DNI: {{ legajo.usuario?.dni || selectedWorker.dni }} | {{ legajo.postulante?.puesto || selectedWorker.puesto }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ legajo.usuario?.email }} | Tel: {{ legajo.usuario?.telefono || '-' }}</p>
            </div>
            <app-status-badge [status]="legajo.postulante?.estado || selectedWorker.estado"></app-status-badge>
            <button (click)="clearSelection()" class="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cambiar
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex items-center gap-1 mb-6 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          <button
            *ngFor="let tab of legajoTabs"
            (click)="activeTab = tab.key"
            class="px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap"
            [ngClass]="activeTab === tab.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >{{ tab.label }}</button>
        </div>

        <!-- Tab Content -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

          <!-- Datos Personales -->
          <div *ngIf="activeTab === 'datos'">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Datos Personales</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span class="text-xs text-gray-400">Nombre Completo</span>
                <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.usuario?.nombre || '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">DNI</span>
                <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.usuario?.dni || '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">Email</span>
                <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.usuario?.email || '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">Telefono</span>
                <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.usuario?.telefono || '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">Puesto</span>
                <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.postulante?.puesto || '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">Estado</span>
                <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.postulante?.estado || '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">Fecha de Registro</span>
                <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.postulante?.fecha_registro ? (legajo.postulante.fecha_registro | date:'dd/MM/yyyy') : '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">Avance</span>
                <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.postulante?.avance || 0 }}%</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">Riesgo</span>
                <p class="text-sm font-medium text-gray-900 mt-0.5 capitalize">{{ legajo.postulante?.riesgo || '-' }}</p>
              </div>
            </div>

            <!-- Ficha Personal si existe -->
            <div *ngIf="legajo.ficha_personal" class="mt-6 pt-6 border-t border-gray-100">
              <h4 class="text-sm font-semibold text-gray-700 mb-4">Ficha Personal</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div *ngIf="legajo.ficha_personal.nombres">
                  <span class="text-xs text-gray-400">Nombres</span>
                  <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.ficha_personal.nombres }} {{ legajo.ficha_personal.apellido_paterno }} {{ legajo.ficha_personal.apellido_materno }}</p>
                </div>
                <div *ngIf="legajo.ficha_personal.fecha_nacimiento">
                  <span class="text-xs text-gray-400">Fecha de Nacimiento</span>
                  <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.ficha_personal.fecha_nacimiento }}</p>
                </div>
                <div *ngIf="legajo.ficha_personal.estado_civil">
                  <span class="text-xs text-gray-400">Estado Civil</span>
                  <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.ficha_personal.estado_civil }}</p>
                </div>
                <div *ngIf="legajo.ficha_personal.genero">
                  <span class="text-xs text-gray-400">Genero</span>
                  <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.ficha_personal.genero }}</p>
                </div>
                <div *ngIf="legajo.ficha_personal.direccion">
                  <span class="text-xs text-gray-400">Direccion</span>
                  <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.ficha_personal.direccion }}</p>
                </div>
                <div *ngIf="legajo.ficha_personal.carrera">
                  <span class="text-xs text-gray-400">Carrera</span>
                  <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.ficha_personal.carrera }}</p>
                </div>
                <div *ngIf="legajo.ficha_personal.universidad">
                  <span class="text-xs text-gray-400">Universidad</span>
                  <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.ficha_personal.universidad }}</p>
                </div>
                <div *ngIf="legajo.ficha_personal.tipo_sangre">
                  <span class="text-xs text-gray-400">Tipo de Sangre</span>
                  <p class="text-sm font-medium text-gray-900 mt-0.5">{{ legajo.ficha_personal.tipo_sangre }}</p>
                </div>
              </div>
            </div>
            <div *ngIf="!legajo.ficha_personal" class="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p class="text-xs text-yellow-700">El trabajador aun no ha completado su ficha personal.</p>
            </div>
          </div>

          <!-- Evaluaciones -->
          <div *ngIf="activeTab === 'evaluaciones'">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Evaluaciones</h3>
            <div class="space-y-3">
              <div *ngFor="let ev of legajo.evaluaciones ?? []" class="border border-gray-100 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-900">{{ ev.evaluacion_nombre || ev.nombre || 'Evaluacion #' + ev.evaluacion_id }}</span>
                  <span class="text-xs px-2 py-1 rounded-full"
                    [ngClass]="{
                      'bg-green-50 text-green-700': ev.estado === 'calificada' || ev.estado === 'completada',
                      'bg-yellow-50 text-yellow-700': ev.estado === 'pendiente' || ev.estado === 'en_progreso'
                    }">
                    {{ ev.estado }}
                  </span>
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-500">
                  <span>Puntaje: <strong class="text-gray-700">{{ ev.puntaje_obtenido ?? '-' }}</strong></span>
                  <span>Tipo: {{ ev.evaluacion_tipo || ev.tipo || '-' }}</span>
                  <span *ngIf="ev.fecha_asignacion">Asignado: {{ ev.fecha_asignacion | date:'dd/MM/yyyy' }}</span>
                  <span *ngIf="ev.fecha_completado">Completado: {{ ev.fecha_completado | date:'dd/MM/yyyy' }}</span>
                </div>
                <div *ngIf="ev.comentario_evaluador" class="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  <strong>Comentario:</strong> {{ ev.comentario_evaluador }}
                </div>
              </div>
              <div *ngIf="(legajo.evaluaciones ?? []).length === 0" class="text-center py-8 text-sm text-gray-400">
                <svg class="w-10 h-10 mx-auto text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                Sin evaluaciones registradas
              </div>
            </div>
          </div>

          <!-- Documentos -->
          <div *ngIf="activeTab === 'documentos'">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Documentos</h3>
            <p class="text-xs text-gray-400 mb-4">{{ legajo.documentos_resumen?.aprobados || 0 }} aprobados de {{ legajo.documentos_resumen?.total || 0 }} total | {{ legajo.documentos_resumen?.pendientes || 0 }} pendientes</p>
            <div class="space-y-2">
              <div *ngFor="let doc of legajo.documentos ?? []" class="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                <div class="flex items-center gap-3">
                  <div class="w-2.5 h-2.5 rounded-full"
                    [ngClass]="{
                      'bg-green-500': doc.estado === 'ok',
                      'bg-yellow-500': doc.estado === 'pending',
                      'bg-gray-300': doc.estado === 'na',
                      'bg-red-500': doc.estado === 'rechazado'
                    }"></div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ doc.tipo }}</p>
                    <p class="text-xs text-gray-400">{{ doc.nombre_archivo || 'Sin archivo' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span *ngIf="doc.requerido" class="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded">Requerido</span>
                  <span class="text-xs px-2 py-1 rounded-full"
                    [ngClass]="{
                      'bg-green-50 text-green-700': doc.estado === 'ok',
                      'bg-yellow-50 text-yellow-700': doc.estado === 'pending',
                      'bg-gray-100 text-gray-500': doc.estado === 'na',
                      'bg-red-50 text-red-700': doc.estado === 'rechazado'
                    }">
                    {{ doc.estado === 'ok' ? 'Aprobado' : doc.estado === 'pending' ? 'Pendiente' : doc.estado === 'na' ? 'No aplica' : doc.estado }}
                  </span>
                </div>
              </div>
              <div *ngIf="(legajo.documentos ?? []).length === 0" class="text-center py-8 text-sm text-gray-400">Sin documentos cargados</div>
            </div>
          </div>

          <!-- Firmas -->
          <div *ngIf="activeTab === 'firmas'">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Firmas Digitales</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div *ngFor="let firma of legajo.firmas ?? []" class="border border-gray-100 rounded-lg p-4">
                <p class="text-sm font-medium text-gray-900 mb-2">{{ firma.tipo_documento }}</p>
                <div class="bg-gray-50 rounded-lg p-3 flex items-center justify-center min-h-[80px]">
                  <img *ngIf="firma.firma_data" [src]="firma.firma_data" alt="Firma" class="max-h-20" />
                  <span *ngIf="!firma.firma_data" class="text-xs text-gray-400">Sin imagen</span>
                </div>
                <div class="mt-2 text-xs text-gray-400 space-y-0.5">
                  <p *ngIf="firma.fecha_firma">Fecha: {{ firma.fecha_firma | date:'dd/MM/yyyy HH:mm' }}</p>
                  <p *ngIf="firma.ip_address">IP: {{ firma.ip_address }}</p>
                  <p *ngIf="firma.hash_documento">Hash: {{ firma.hash_documento }}</p>
                </div>
              </div>
            </div>
            <div *ngIf="(legajo.firmas ?? []).length === 0" class="text-center py-8 text-sm text-gray-400">Sin firmas digitales registradas</div>
          </div>

          <!-- Derechohabientes -->
          <div *ngIf="activeTab === 'derechohabientes'">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Derechohabientes</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">Nombre</th>
                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">Parentesco</th>
                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">DNI</th>
                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">Fecha Nacimiento</th>
                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500">Genero</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr *ngFor="let d of legajo.derechohabientes ?? []" class="hover:bg-gray-50">
                    <td class="px-4 py-2 text-sm text-gray-900">{{ d.nombre_completo || d.nombre }}</td>
                    <td class="px-4 py-2 text-sm text-gray-600">{{ d.parentesco }}</td>
                    <td class="px-4 py-2 text-sm text-gray-600">{{ d.dni || '-' }}</td>
                    <td class="px-4 py-2 text-sm text-gray-600">{{ d.fecha_nacimiento || '-' }}</td>
                    <td class="px-4 py-2 text-sm text-gray-600">{{ d.genero || '-' }}</td>
                  </tr>
                  <tr *ngIf="(legajo.derechohabientes ?? []).length === 0">
                    <td colspan="5" class="px-4 py-6 text-center text-sm text-gray-400">Sin derechohabientes registrados</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Bancario -->
          <div *ngIf="activeTab === 'bancario'">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Datos Bancarios</h3>
            <div *ngIf="legajo.datos_bancarios" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-400">Tiene Cuenta</span>
                <p class="text-sm font-medium text-gray-900">{{ legajo.datos_bancarios.tiene_cuenta ? 'Si' : 'No' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">Entidad Bancaria</span>
                <p class="text-sm font-medium text-gray-900">{{ legajo.datos_bancarios.entidad || '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">Tipo de Cuenta</span>
                <p class="text-sm font-medium text-gray-900">{{ legajo.datos_bancarios.tipo_cuenta || '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">Numero de Cuenta</span>
                <p class="text-sm font-medium text-gray-900">{{ legajo.datos_bancarios.numero_cuenta || '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">CCI</span>
                <p class="text-sm font-medium text-gray-900">{{ legajo.datos_bancarios.cci || '-' }}</p>
              </div>
            </div>
            <div *ngIf="!legajo.datos_bancarios" class="text-center py-8 text-sm text-gray-400">
              <p>No hay datos bancarios registrados</p>
            </div>
          </div>

          <!-- Pensionario -->
          <div *ngIf="activeTab === 'pensionario'">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Regimen Pensionario</h3>
            <div *ngIf="legajo.regimen_pensionario" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-400">Tipo</span>
                <p class="text-sm font-medium text-gray-900 uppercase">{{ legajo.regimen_pensionario.tipo || '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">Entidad</span>
                <p class="text-sm font-medium text-gray-900">{{ legajo.regimen_pensionario.entidad || '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">CUSPP</span>
                <p class="text-sm font-medium text-gray-900">{{ legajo.regimen_pensionario.cuspp || '-' }}</p>
              </div>
              <div>
                <span class="text-xs text-gray-400">Primer Trabajo</span>
                <p class="text-sm font-medium text-gray-900">{{ legajo.regimen_pensionario.primer_trabajo ? 'Si' : 'No' }}</p>
              </div>
            </div>
            <div *ngIf="!legajo.regimen_pensionario" class="text-center py-8 text-sm text-gray-400">
              <p>No hay datos pensionarios registrados</p>
            </div>
          </div>

          <!-- Capacitaciones -->
          <div *ngIf="activeTab === 'capacitaciones'">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Capacitaciones</h3>
            <div class="space-y-3">
              <div *ngFor="let cap of legajo.capacitaciones ?? []" class="border border-gray-100 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-900">{{ cap.nombre }}</span>
                  <span class="text-xs font-semibold"
                    [ngClass]="cap.cumplimiento >= 100 ? 'text-green-600' : 'text-yellow-600'">
                    {{ cap.cumplimiento }}%
                  </span>
                </div>
                <app-progress-bar [value]="cap.cumplimiento" [height]="6"></app-progress-bar>
              </div>
              <div *ngIf="(legajo.capacitaciones ?? []).length === 0" class="text-center py-8 text-sm text-gray-400">Sin capacitaciones asignadas</div>
            </div>
          </div>

        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!selectedWorker && !loadingDetail && searchResults.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="text-gray-400 text-sm">Busque un trabajador para ver su legajo completo</p>
      </div>
    </div>
  `,
})
export class LegajoComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  searchTerm = '';
  searchResults: any[] = [];
  selectedWorker: any = null;
  legajo: any = null;
  loadingDetail = false;
  activeTab = 'datos';

  legajoTabs = [
    { key: 'datos', label: 'Datos Personales' },
    { key: 'evaluaciones', label: 'Evaluaciones' },
    { key: 'documentos', label: 'Documentos' },
    { key: 'firmas', label: 'Firmas' },
    { key: 'derechohabientes', label: 'Derechohabientes' },
    { key: 'bancario', label: 'Bancario' },
    { key: 'pensionario', label: 'Pensionario' },
    { key: 'capacitaciones', label: 'Capacitaciones' },
  ];

  ngOnInit(): void {}

  searchWorkers(): void {
    if (!this.searchTerm || this.searchTerm.length < 2) {
      this.searchResults = [];
      return;
    }
    this.http.get<any[]>(`${this.apiUrl}/postulantes/`, {
      params: { buscar: this.searchTerm }
    }).subscribe({
      next: (data) => {
        // Mostrar todos para buscar, filtrar trabajadores primero
        this.searchResults = (data ?? []).filter(p =>
          p.estado === 'Trabajador' || p.estado === 'Aprobado'
        );
        // Si no hay trabajadores, mostrar todos
        if (this.searchResults.length === 0) {
          this.searchResults = data ?? [];
        }
      },
      error: () => (this.searchResults = []),
    });
  }

  selectWorker(worker: any): void {
    this.selectedWorker = worker;
    this.searchResults = [];
    this.loadLegajo(worker.id);
  }

  clearSelection(): void {
    this.selectedWorker = null;
    this.legajo = null;
    this.searchTerm = '';
    this.activeTab = 'datos';
  }

  private loadLegajo(id: any): void {
    this.loadingDetail = true;
    this.activeTab = 'datos';
    this.http.get<any>(`${this.apiUrl}/legajo/${id}`).subscribe({
      next: (data) => {
        // El API devuelve la estructura real directamente
        this.legajo = data;
        this.loadingDetail = false;
      },
      error: () => {
        this.legajo = {
          postulante: this.selectedWorker,
          usuario: this.selectedWorker,
          ficha_personal: null,
          evaluaciones: [],
          documentos: [],
          documentos_resumen: { total: 0, aprobados: 0, pendientes: 0 },
          firmas: [],
          derechohabientes: [],
          datos_bancarios: null,
          regimen_pensionario: null,
          capacitaciones: [],
        };
        this.loadingDetail = false;
      },
    });
  }

  getInitials(worker: any): string {
    const parts = (worker?.nombre ?? '').split(' ');
    const first = (parts[0] ?? '').charAt(0).toUpperCase();
    const second = (parts[1] ?? '').charAt(0).toUpperCase();
    return first + second;
  }
}
