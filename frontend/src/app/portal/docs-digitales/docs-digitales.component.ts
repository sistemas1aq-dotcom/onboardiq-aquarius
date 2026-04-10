import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface DocDigital {
  id: number;
  nombre: string;
  categoria: string;
  fecha_firma: string;
  firma_ip: string;
  firma_hash: string;
  archivo_url: string;
}

@Component({
  selector: 'app-docs-digitales',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Documentos Digitales</h1>
      <p class="text-sm text-gray-500 mb-6">Documentos firmados digitalmente disponibles para descarga</p>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <p class="text-red-700 text-sm">{{ error }}</p>
        <button (click)="loadDocs()" class="mt-2 text-sm text-red-600 underline">Reintentar</button>
      </div>

      <div *ngIf="!loading && !error">
        <!-- Category tabs -->
        <div class="flex gap-2 mb-6 overflow-x-auto">
          <button
            *ngFor="let cat of categorias"
            (click)="selectedCategoria = cat"
            class="px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors"
            [ngClass]="selectedCategoria === cat
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Documents grid -->
        <div *ngIf="filteredDocs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let doc of filteredDocs" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-start gap-3 mb-4">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-semibold text-gray-900 truncate">{{ doc.nombre }}</h3>
                <span class="text-xs text-gray-400">{{ doc.categoria }}</span>
              </div>
            </div>

            <!-- Signature info -->
            <div class="bg-gray-50 rounded-lg p-3 mb-4 space-y-1.5">
              <div class="flex items-center gap-2 text-xs">
                <svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-gray-500">Firmado:</span>
                <span class="text-gray-700 font-medium">{{ doc.fecha_firma }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                </svg>
                <span class="text-gray-500">IP:</span>
                <span class="text-gray-700">{{ doc.firma_ip }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <span class="text-gray-500">Hash:</span>
                <code class="text-gray-700 font-mono text-xs truncate max-w-[140px]" [title]="doc.firma_hash">{{ doc.firma_hash }}</code>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <a [href]="doc.archivo_url" target="_blank"
                class="flex-1 px-3 py-2 text-xs font-medium text-center text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Vista Previa
              </a>
              <a [href]="doc.archivo_url" download
                class="flex-1 px-3 py-2 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Descargar
              </a>
            </div>
          </div>
        </div>

        <div *ngIf="filteredDocs.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p>No hay documentos en esta categoria</p>
        </div>
      </div>
    </div>
  `,
})
export class DocsDigitalesComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  documentos: DocDigital[] = [];
  loading = true;
  error = '';
  selectedCategoria = 'Todos';

  get categorias(): string[] {
    const cats = [...new Set(this.documentos.map(d => d.categoria))];
    return ['Todos', ...cats];
  }

  get filteredDocs(): DocDigital[] {
    if (this.selectedCategoria === 'Todos') return this.documentos;
    return this.documentos.filter(d => d.categoria === this.selectedCategoria);
  }

  ngOnInit(): void {
    this.loadDocs();
  }

  loadDocs(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/portal/mis-firmas`).subscribe({
      next: (res) => {
        this.documentos = (res || []).map(d => ({
          id: d.id,
          nombre: d.tipo_documento || d.nombre || 'Documento',
          categoria: d.categoria || d.tipo_documento || 'General',
          fecha_firma: d.firma_fecha || d.created_at || '',
          firma_ip: d.ip_address || '',
          firma_hash: d.firma_hash || '',
          archivo_url: d.archivo_url || '',
        }));
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.documentos = [];
          this.loading = false;
        } else {
          this.error = 'Error al cargar los documentos digitales.';
          this.loading = false;
        }
      },
    });
  }
}
