import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';

interface DocumentoAPI {
  id: number;
  tipo: string;
  nombre_archivo: string;
  estado: string;
  requerido: boolean;
  observacion: string | null;
}

interface Documento {
  id: number;
  tipo: string;
  nombre: string;
  obligatorio: boolean;
  estado: string;
  fecha_subida: string | null;
  observacion: string | null;
  archivo_url: string | null;
}

interface Firma {
  tipo_documento: string;
  fecha_firma: string;
  ip_address: string;
  hash: string;
}

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Mis Documentos</h1>
          <p class="text-sm text-gray-500 mt-1">Suba los documentos requeridos para su proceso</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <p class="text-red-700 text-sm">{{ error }}</p>
        <button (click)="loadDocumentos()" class="mt-2 text-sm text-red-600 underline">Reintentar</button>
      </div>

      <div *ngIf="!loading && !error">
        <!-- Overall progress -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Progreso General</span>
            <span class="text-sm font-bold text-gray-900">{{ docsSubidos }} de {{ docsTotal }} documentos</span>
          </div>
          <app-progress-bar [value]="progressPercent" [height]="8"></app-progress-bar>
        </div>

        <!-- Success message -->
        <div *ngIf="successMsg" class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {{ successMsg }}
        </div>

        <!-- Documents list -->
        <div class="space-y-3">
          <div *ngFor="let doc of documentos" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-start gap-4">
              <!-- Status semaphore -->
              <div class="flex-shrink-0 mt-1">
                <div class="w-4 h-4 rounded-full"
                  [ngClass]="{
                    'bg-green-500': doc.estado === 'aprobado',
                    'bg-yellow-500': doc.estado === 'pendiente',
                    'bg-red-500': doc.estado === 'rechazado',
                    'bg-gray-300': doc.estado === 'no_aplica' || doc.estado === 'sin_subir'
                  }">
                </div>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-semibold text-gray-900">{{ doc.nombre }}</h3>
                  <span *ngIf="doc.obligatorio" class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Obligatorio</span>
                  <span *ngIf="!doc.obligatorio" class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Opcional</span>
                </div>

                <div class="flex items-center gap-3 mt-1">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    [ngClass]="{
                      'bg-green-100 text-green-700': doc.estado === 'aprobado',
                      'bg-yellow-100 text-yellow-700': doc.estado === 'pendiente',
                      'bg-red-100 text-red-700': doc.estado === 'rechazado',
                      'bg-gray-100 text-gray-500': doc.estado === 'no_aplica' || doc.estado === 'sin_subir'
                    }">
                    {{ estadoLabel(doc.estado) }}
                  </span>
                  <span *ngIf="doc.fecha_subida" class="text-xs text-gray-400">
                    Subido el {{ doc.fecha_subida }}
                  </span>
                </div>

                <!-- Observation note -->
                <div *ngIf="doc.observacion" class="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                  <p class="text-xs text-yellow-700">
                    <span class="font-medium">Observacion:</span> {{ doc.observacion }}
                  </p>
                </div>
              </div>

              <!-- Upload area -->
              <div class="flex-shrink-0 flex items-center gap-2">
                <a *ngIf="doc.archivo_url" [href]="doc.archivo_url" target="_blank"
                  class="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Ver
                </a>
                <label
                  class="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  [class.opacity-50]="uploadingId === doc.id"
                >
                  {{ uploadingId === doc.id ? 'Subiendo...' : 'Subir Archivo' }}
                  <input
                    type="file"
                    class="hidden"
                    [disabled]="uploadingId === doc.id"
                    (change)="onFileSelect($event, doc)"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="documentos.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
          <p>No hay documentos configurados para su proceso</p>
        </div>

        <!-- Documentos Firmados Section -->
        <div class="mt-8">
          <h2 class="text-xl font-bold text-gray-900 mb-1">Documentos Firmados</h2>
          <p class="text-sm text-gray-500 mb-4">Documentos con firma digital verificada</p>

          <div *ngIf="loadingFirmas" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <div *ngIf="!loadingFirmas && firmas.length > 0" class="space-y-3">
            <div *ngFor="let firma of firmas" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 mt-1">
                  <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-gray-900">{{ firma.tipo_documento }}</h3>
                  <div class="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500">
                    <div class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span>{{ firma.fecha_firma }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>
                      </svg>
                      <span>IP: {{ firma.ip_address }}</span>
                    </div>
                    <div class="flex items-center gap-1 truncate">
                      <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                      <span class="truncate" [title]="firma.hash">Hash: {{ firma.hash }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="!loadingFirmas && firmas.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="text-sm">No tiene documentos firmados</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DocumentosComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  documentos: Documento[] = [];
  firmas: Firma[] = [];
  loading = true;
  loadingFirmas = true;
  error = '';
  successMsg = '';
  uploadingId: number | null = null;

  get docsSubidos(): number {
    return this.documentos.filter(d => d.estado === 'aprobado' || d.estado === 'pendiente').length;
  }

  get docsTotal(): number {
    return this.documentos.filter(d => d.obligatorio).length || this.documentos.length;
  }

  get progressPercent(): number {
    return this.docsTotal > 0 ? (this.docsSubidos / this.docsTotal) * 100 : 0;
  }

  ngOnInit(): void {
    this.loadDocumentos();
    this.loadFirmas();
  }

  loadDocumentos(): void {
    this.loading = true;
    this.error = '';
    this.http.get<DocumentoAPI[]>(`${this.apiUrl}/portal/mis-documentos`).subscribe({
      next: (res) => {
        this.documentos = (res || []).map(d => ({
          id: d.id,
          tipo: d.tipo || '',
          nombre: d.nombre_archivo || d.tipo || 'Documento',
          obligatorio: d.requerido ?? false,
          estado: d.estado || 'sin_subir',
          fecha_subida: null,
          observacion: d.observacion || null,
          archivo_url: null,
        }));
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.documentos = [];
          this.loading = false;
        } else {
          this.error = 'Error al cargar los documentos.';
          this.loading = false;
        }
      },
    });
  }

  loadFirmas(): void {
    this.loadingFirmas = true;
    this.http.get<Firma[]>(`${this.apiUrl}/portal/mis-firmas`).subscribe({
      next: (res) => {
        this.firmas = res || [];
        this.loadingFirmas = false;
      },
      error: () => {
        this.firmas = [];
        this.loadingFirmas = false;
      },
    });
  }

  onFileSelect(event: Event, doc: Documento): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingId = doc.id;
    this.successMsg = '';

    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('documento_id', String(doc.id));

    this.http.post(`${this.apiUrl}/documentos/upload`, formData).subscribe({
      next: () => {
        this.uploadingId = null;
        this.successMsg = `Documento "${doc.nombre}" subido exitosamente.`;
        setTimeout(() => this.successMsg = '', 4000);
        this.loadDocumentos();
      },
      error: () => {
        this.uploadingId = null;
        this.error = `Error al subir el documento "${doc.nombre}".`;
        setTimeout(() => this.error = '', 4000);
      },
    });

    input.value = '';
  }

  estadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      aprobado: 'Aprobado',
      pendiente: 'Pendiente de revision',
      rechazado: 'Rechazado',
      no_aplica: 'No aplica',
      sin_subir: 'Sin subir',
    };
    return labels[estado] ?? estado;
  }
}
