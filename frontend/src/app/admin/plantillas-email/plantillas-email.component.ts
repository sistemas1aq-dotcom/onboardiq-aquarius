import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';

interface Plantilla {
  id: number;
  tipo: string;
  asunto: string;
  contenido: string;
  variables_disponibles: string | null;
  activa: boolean;
  fecha_actualizacion: string | null;
}

const TIPO_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  credenciales: { label: 'Credenciales', color: 'text-blue-700', bg: 'bg-blue-100' },
  bienvenida: { label: 'Bienvenida', color: 'text-green-700', bg: 'bg-green-100' },
  cesado: { label: 'Cesado', color: 'text-gray-700', bg: 'bg-gray-200' },
  cumpleanos: { label: 'Cumpleanos', color: 'text-purple-700', bg: 'bg-purple-100' },
  festividad: { label: 'Festividad', color: 'text-cyan-700', bg: 'bg-cyan-100' },
  anuncio: { label: 'Anuncio', color: 'text-orange-700', bg: 'bg-orange-100' },
};

@Component({
  selector: 'app-plantillas-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Plantillas de Email</h1>
      <p class="text-sm text-gray-500 mt-1">Personaliza las plantillas de correo electronico del sistema</p>
    </div>

    <!-- Loading -->
    <div *ngIf="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <!-- Cards Grid -->
    <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div
        *ngFor="let p of plantillas"
        class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        <!-- Card Header -->
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span
              class="text-xs font-semibold px-2.5 py-1 rounded-full"
              [ngClass]="[getTipoConfig(p.tipo).bg, getTipoConfig(p.tipo).color]"
            >
              {{ getTipoConfig(p.tipo).label }}
            </span>
            <span
              class="w-2 h-2 rounded-full"
              [ngClass]="p.activa ? 'bg-green-400' : 'bg-gray-300'"
              [title]="p.activa ? 'Activa' : 'Inactiva'"
            ></span>
          </div>
          <button
            (click)="abrirEditor(p)"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Editar
          </button>
        </div>

        <!-- Card Body -->
        <div class="px-5 py-4">
          <p class="text-sm font-medium text-gray-800 mb-2 truncate" [title]="p.asunto">{{ p.asunto }}</p>
          <div class="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 h-20 overflow-hidden font-mono leading-relaxed">
            {{ stripHtml(p.contenido).substring(0, 200) }}...
          </div>
        </div>

        <!-- Card Footer -->
        <div class="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <div class="flex flex-wrap gap-1.5">
            <span
              *ngFor="let v of getVariables(p.variables_disponibles)"
              class="text-[10px] font-mono bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded"
            >
              {{ v }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Modal -->
    <div
      *ngIf="editing"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      (click)="cerrarEditor()"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#0a1f3d] to-[#1a7ec5]">
          <div>
            <h2 class="text-lg font-bold text-white">Editar Plantilla</h2>
            <span class="text-xs text-cyan-200">{{ getTipoConfig(editData.tipo).label }}</span>
          </div>
          <button (click)="cerrarEditor()" class="text-white/70 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <!-- Asunto -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Asunto del email</label>
            <input
              type="text"
              [(ngModel)]="editData.asunto"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Asunto del email..."
            />
          </div>

          <!-- Variables Reference -->
          <div class="bg-blue-50 rounded-lg px-4 py-3">
            <p class="text-xs font-semibold text-blue-800 mb-1.5">Variables disponibles:</p>
            <div class="flex flex-wrap gap-2">
              <span
                *ngFor="let v of getVariables(editData.variables_disponibles)"
                class="text-xs font-mono bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded cursor-pointer hover:bg-blue-100 transition"
                (click)="insertVariable(v)"
                [title]="'Click para copiar'"
              >
                {{ v }}
              </span>
            </div>
          </div>

          <!-- HTML Content -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Contenido HTML</label>
            <textarea
              [(ngModel)]="editData.contenido"
              rows="14"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-xs font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
              placeholder="<div>...</div>"
              #contentArea
            ></textarea>
          </div>

          <!-- Activa toggle -->
          <div class="flex items-center gap-3">
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="editData.activa" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span class="text-sm text-gray-700">Plantilla activa</span>
          </div>

          <!-- Preview -->
          <div>
            <button
              (click)="togglePreview()"
              class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-3"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              {{ showPreview ? 'Ocultar Vista Previa' : 'Vista Previa' }}
            </button>
            <div
              *ngIf="showPreview"
              class="border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-auto max-h-96"
              [innerHTML]="previewHtml"
            ></div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <button
            (click)="cerrarEditor()"
            class="text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            (click)="guardar()"
            [disabled]="guardando"
            class="bg-gradient-to-r from-[#0a1f3d] to-[#1a7ec5] text-white font-semibold text-sm py-2.5 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      *ngIf="toast"
      class="fixed bottom-6 right-6 z-[60] bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium animate-fadeIn"
    >
      {{ toast }}
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.25s ease-out;
    }
  `],
})
export class PlantillasEmailComponent implements OnInit {
  private api = inject(ApiService);
  private sanitizer = inject(DomSanitizer);

  plantillas: Plantilla[] = [];
  loading = true;

  // Editor state
  editing = false;
  editData: Plantilla = {} as Plantilla;
  showPreview = false;
  guardando = false;
  toast = '';

  ngOnInit(): void {
    this.cargarPlantillas();
  }

  cargarPlantillas(): void {
    this.loading = true;
    this.api.get<Plantilla[]>('/comunicaciones/plantillas').subscribe({
      next: (data) => {
        this.plantillas = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getTipoConfig(tipo: string) {
    return TIPO_LABELS[tipo] || { label: tipo, color: 'text-gray-700', bg: 'bg-gray-100' };
  }

  getVariables(vars: string | null): string[] {
    if (!vars) return [];
    return vars.split(',').map((v) => v.trim()).filter((v) => v.length > 0);
  }

  stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  abrirEditor(p: Plantilla): void {
    this.editData = { ...p };
    this.showPreview = false;
    this.editing = true;
  }

  cerrarEditor(): void {
    this.editing = false;
  }

  insertVariable(v: string): void {
    // Copy variable to clipboard for easy pasting
    navigator.clipboard.writeText(v).catch(() => {});
    this.showToast(`"${v}" copiado al portapapeles`);
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  get previewHtml(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.editData.contenido || '');
  }

  guardar(): void {
    this.guardando = true;
    const body = {
      asunto: this.editData.asunto,
      contenido: this.editData.contenido,
      activa: this.editData.activa,
    };
    this.api.put<Plantilla>(`/comunicaciones/plantillas/${this.editData.tipo}`, body).subscribe({
      next: (updated) => {
        const idx = this.plantillas.findIndex((p) => p.tipo === updated.tipo);
        if (idx >= 0) {
          this.plantillas[idx] = updated;
        }
        this.guardando = false;
        this.editing = false;
        this.showToast('Plantilla actualizada correctamente');
      },
      error: () => {
        this.guardando = false;
      },
    });
  }

  private showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => (this.toast = ''), 3000);
  }
}
