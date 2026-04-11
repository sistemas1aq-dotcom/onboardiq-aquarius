import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-carga-masiva',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Carga Masiva de Postulantes</h1>
      </div>

      <!-- Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="text-sm text-blue-800 font-medium">Instrucciones</p>
            <p class="text-sm text-blue-700 mt-1">Descargue la plantilla Excel, complete los datos de los postulantes y suba el archivo. Se crearan las cuentas de usuario y se enviaran las credenciales por email.</p>
            <p class="text-sm text-blue-700 mt-2 font-semibold">La contrasena inicial para todos los postulantes es: Aquarius2026</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex items-center gap-4 flex-wrap">
          <button
            (click)="downloadTemplate()"
            [disabled]="downloadingTemplate"
            class="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            {{ downloadingTemplate ? 'Descargando...' : 'Descargar Plantilla' }}
          </button>

          <label class="px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            Seleccionar Archivo Excel
            <input type="file" accept=".xlsx,.xls" (change)="onFileSelected($event)" class="hidden"/>
          </label>

          <span *ngIf="selectedFile" class="text-sm text-gray-600">
            {{ selectedFile.name }} ({{ (selectedFile.size / 1024).toFixed(1) }} KB)
          </span>
        </div>
      </div>

      <!-- Preview Table -->
      <div *ngIf="previewRows.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900">Vista Previa ({{ previewRows.length }} filas)</h3>
          <button
            (click)="uploadFile()"
            [disabled]="uploading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg *ngIf="!uploading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            <div *ngIf="uploading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {{ uploading ? 'Procesando...' : 'Crear Usuarios y Enviar Credenciales' }}
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                <th *ngFor="let h of previewHeaders" class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{{ h }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let row of previewRows; let i = index" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-400">{{ i + 1 }}</td>
                <td *ngFor="let h of previewHeaders" class="px-4 py-3 text-sm text-gray-900">{{ row[h] ?? '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="uploading" class="flex items-center justify-center py-10">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-500">Creando usuarios y enviando credenciales...</span>
        </div>
      </div>

      <!-- Results -->
      <div *ngIf="uploadResult" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Resultados de la Carga</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-green-600">{{ uploadResult.creados ?? 0 }}</p>
            <p class="text-sm text-green-700">Creados Exitosamente</p>
          </div>
          <div class="bg-red-50 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-red-600">{{ uploadResult.fallidos ?? 0 }}</p>
            <p class="text-sm text-red-700">Fallidos</p>
          </div>
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-blue-600">{{ (uploadResult.creados ?? 0) + (uploadResult.fallidos ?? 0) }}</p>
            <p class="text-sm text-blue-700">Total Procesados</p>
          </div>
        </div>

        <div *ngIf="uploadResult.errores && uploadResult.errores.length > 0">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Detalle de Errores:</h4>
          <div class="bg-red-50 border border-red-200 rounded-lg p-3 max-h-60 overflow-y-auto">
            <ul class="space-y-1">
              <li *ngFor="let err of uploadResult.errores" class="text-sm text-red-700">
                <span class="font-medium">Fila {{ err.fila ?? '?' }}:</span> {{ err.error ?? err }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>
    </div>
  `,
})
export class CargaMasivaComponent {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  selectedFile: File | null = null;
  previewHeaders: string[] = [];
  previewRows: any[] = [];
  uploading = false;
  downloadingTemplate = false;
  uploadResult: any = null;
  error = '';

  downloadTemplate(): void {
    this.downloadingTemplate = true;
    this.error = '';
    this.http.get(`${this.apiUrl}/carga-masiva/plantilla`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_postulantes.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingTemplate = false;
      },
      error: (err) => {
        this.error = 'Error al descargar la plantilla.';
        this.downloadingTemplate = false;
        console.error('Download template error:', err);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.selectedFile = input.files[0];
    this.uploadResult = null;
    this.error = '';
    this.parsePreview(this.selectedFile);
  }

  private parsePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Simple CSV-like preview for display; actual parsing done server-side
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length > 0) {
          // Try to extract headers from first line
          this.previewHeaders = ['Archivo seleccionado'];
          this.previewRows = [{ 'Archivo seleccionado': file.name }];
        }
      } catch {
        // Binary file - just show file name
        this.previewHeaders = ['Archivo', 'Tamano'];
        this.previewRows = [{ 'Archivo': file.name, 'Tamano': `${(file.size / 1024).toFixed(1)} KB` }];
      }
    };
    reader.onerror = () => {
      this.previewHeaders = ['Archivo', 'Tamano'];
      this.previewRows = [{ 'Archivo': file.name, 'Tamano': `${(file.size / 1024).toFixed(1)} KB` }];
    };
    // Excel files are binary, so just show file info
    this.previewHeaders = ['Archivo', 'Tamano', 'Tipo'];
    this.previewRows = [{
      'Archivo': file.name,
      'Tamano': `${(file.size / 1024).toFixed(1)} KB`,
      'Tipo': file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }];
  }

  uploadFile(): void {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.error = '';
    this.uploadResult = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post<any>(`${this.apiUrl}/carga-masiva/upload`, formData).subscribe({
      next: (result) => {
        this.uploadResult = result;
        this.uploading = false;
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al procesar el archivo.';
        this.uploading = false;
        console.error('Upload error:', err);
      },
    });
  }
}
