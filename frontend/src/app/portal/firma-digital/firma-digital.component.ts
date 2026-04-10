import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SignaturePadComponent } from '../../shared/components/signature-pad/signature-pad.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';

interface DocumentoFirma {
  id: number;
  nombre: string;
  descripcion: string;
  contenido_url: string;
  firmado: boolean;
  firma_fecha: string | null;
  firma_ip: string | null;
  firma_hash: string | null;
}

@Component({
  selector: 'app-firma-digital',
  standalone: true,
  imports: [CommonModule, SignaturePadComponent, ProgressBarComponent],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Firma Digital de Documentos</h1>
      <p class="text-sm text-gray-500 mb-6">Firme digitalmente los documentos requeridos para completar su incorporacion</p>

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
        <!-- Progress tracker -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Progreso de Firmas</span>
            <span class="text-sm font-bold text-gray-900">{{ firmados }} de {{ documentos.length }} documentos firmados</span>
          </div>
          <app-progress-bar [value]="progressPercent" [height]="8"></app-progress-bar>
        </div>

        <!-- Success message -->
        <div *ngIf="successMsg" class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {{ successMsg }}
        </div>

        <!-- Legal notice -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-blue-800">Aviso Legal - Ley 27269</p>
              <p class="text-xs text-blue-700 mt-1">
                De conformidad con la Ley N. 27269, Ley de Firmas y Certificados Digitales del Peru, y su Reglamento
                aprobado por D.S. N. 052-2008-PCM, la firma digital que usted registre en este sistema tiene la misma
                validez y eficacia juridica que una firma manuscrita. Al firmar digitalmente, usted declara haber leido
                y comprendido el contenido del documento y acepta las obligaciones derivadas del mismo.
              </p>
            </div>
          </div>
        </div>

        <!-- Documents list -->
        <div class="space-y-4">
          <div *ngFor="let doc of documentos; let i = index"
            class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <!-- Document header -->
            <div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              (click)="toggleDocument(i)">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                  [ngClass]="doc.firmado ? 'bg-green-100' : 'bg-gray-100'">
                  <svg *ngIf="doc.firmado" class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <svg *ngIf="!doc.firmado" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-gray-900">{{ doc.nombre }}</h3>
                  <p class="text-xs text-gray-500">{{ doc.descripcion }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span *ngIf="doc.firmado" class="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">Firmado</span>
                <span *ngIf="!doc.firmado" class="text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">Pendiente</span>
                <svg class="w-5 h-5 text-gray-400 transition-transform" [class.rotate-180]="expandedIndex === i" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>

            <!-- Expanded content -->
            <div *ngIf="expandedIndex === i" class="border-t border-gray-100">
              <!-- Document preview link -->
              <div class="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <a [href]="doc.contenido_url" target="_blank" class="text-sm text-blue-600 hover:text-blue-700 underline flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  Ver documento completo
                </a>
              </div>

              <div class="p-5">
                <!-- Already signed info -->
                <div *ngIf="doc.firmado" class="bg-green-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-green-800 mb-2">Documento Firmado</h4>
                  <div class="space-y-1.5">
                    <div class="flex items-center gap-2 text-xs text-green-700">
                      <span class="font-medium">Fecha:</span> {{ doc.firma_fecha }}
                    </div>
                    <div class="flex items-center gap-2 text-xs text-green-700">
                      <span class="font-medium">IP:</span> {{ doc.firma_ip }}
                    </div>
                    <div class="flex items-center gap-2 text-xs text-green-700">
                      <span class="font-medium">Hash:</span>
                      <code class="bg-green-100 px-2 py-0.5 rounded text-xs font-mono">{{ doc.firma_hash }}</code>
                    </div>
                  </div>
                </div>

                <!-- Signature pad for unsigned docs -->
                <div *ngIf="!doc.firmado">
                  <app-signature-pad
                    (signatureSave)="onSignatureSubmit(doc, $event)"
                  ></app-signature-pad>
                  <div *ngIf="signingId === doc.id" class="flex items-center justify-center gap-2 mt-3 text-sm text-blue-600">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Procesando firma...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FirmaDigitalComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  documentos: DocumentoFirma[] = [];
  loading = true;
  error = '';
  successMsg = '';
  expandedIndex: number | null = null;
  signingId: number | null = null;

  get firmados(): number {
    return this.documentos.filter(d => d.firmado).length;
  }

  get progressPercent(): number {
    return this.documentos.length > 0 ? (this.firmados / this.documentos.length) * 100 : 0;
  }

  ngOnInit(): void {
    this.loadDocumentos();
  }

  loadDocumentos(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/portal/mis-firmas`).subscribe({
      next: (res) => {
        this.documentos = (res || []).map(d => ({
          id: d.id,
          nombre: d.tipo_documento || d.nombre || 'Documento',
          descripcion: d.descripcion || '',
          contenido_url: d.contenido_url || d.archivo_url || '',
          firmado: !!d.firma_data || !!d.firma_fecha,
          firma_fecha: d.firma_fecha || d.created_at || null,
          firma_ip: d.ip_address || null,
          firma_hash: d.firma_hash || null,
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

  toggleDocument(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  onSignatureSubmit(doc: DocumentoFirma, signatureDataUrl: string): void {
    this.signingId = doc.id;
    this.successMsg = '';

    // Get client IP (best effort, fallback to empty)
    this.getClientIp().then(ip => {
      this.http.post(`${this.apiUrl}/portal/firma`, {
        tipo_documento: doc.nombre,
        firma_data: signatureDataUrl,
        ip_address: ip,
      }).subscribe({
        next: () => {
          this.signingId = null;
          this.successMsg = `Documento "${doc.nombre}" firmado exitosamente.`;
          setTimeout(() => this.successMsg = '', 4000);
          this.loadDocumentos();
        },
        error: () => {
          this.signingId = null;
          this.error = `Error al firmar el documento "${doc.nombre}".`;
          setTimeout(() => this.error = '', 4000);
        },
      });
    });
  }

  private async getClientIp(): Promise<string> {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip || '';
    } catch {
      return '';
    }
  }
}
