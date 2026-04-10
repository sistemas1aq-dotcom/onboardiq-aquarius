import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

interface RegimenData {
  primer_trabajo: boolean;
  tipo: string;
  entidad: string;
  cuspp: string;
}

interface InfoAFP {
  nombre: string;
  comision_flujo: string;
  comision_mixta: string;
  prima_seguro: string;
  descripcion: string;
}

@Component({
  selector: 'app-regimen-pensionario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Regimen Pensionario</h1>
      <p class="text-sm text-gray-500 mb-6">Seleccione su sistema de pensiones</p>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <p class="text-red-700 text-sm">{{ error }}</p>
      </div>

      <!-- Success -->
      <div *ngIf="successMsg" class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
        {{ successMsg }}
      </div>

      <div *ngIf="!loading" class="max-w-4xl">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <!-- First job question -->
          <div class="mb-6">
            <label class="text-sm font-semibold text-gray-900 mb-3 block">Es su primer trabajo formal?</label>
            <div class="flex items-center gap-4">
              <button
                (click)="datos.primer_trabajo = true; datos.tipo = ''; datos.entidad = ''; datos.cuspp = ''"
                class="px-6 py-2.5 rounded-lg text-sm font-medium border-2 transition-colors"
                [ngClass]="datos.primer_trabajo ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'"
              >
                Si, es mi primer trabajo
              </button>
              <button
                (click)="datos.primer_trabajo = false; datos.tipo = ''; datos.entidad = ''"
                class="px-6 py-2.5 rounded-lg text-sm font-medium border-2 transition-colors"
                [ngClass]="!datos.primer_trabajo ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'"
              >
                No, ya tengo sistema de pensiones
              </button>
            </div>
          </div>

          <!-- First job: choose AFP or ONP -->
          <div *ngIf="datos.primer_trabajo">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Elija su sistema de pensiones:</h3>
            <p class="text-xs text-gray-500 mb-4">Si no elige, sera afiliado automaticamente a una AFP tras 10 dias de iniciado su trabajo.</p>

            <!-- AFP cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div
                *ngFor="let afp of afps"
                (click)="datos.tipo = 'AFP'; datos.entidad = afp.nombre"
                class="border-2 rounded-xl p-4 cursor-pointer transition-colors"
                [ngClass]="datos.tipo === 'AFP' && datos.entidad === afp.nombre
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'"
              >
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-sm font-bold text-gray-900">AFP {{ afp.nombre }}</h4>
                  <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    [ngClass]="datos.tipo === 'AFP' && datos.entidad === afp.nombre ? 'border-blue-500' : 'border-gray-300'">
                    <div *ngIf="datos.tipo === 'AFP' && datos.entidad === afp.nombre" class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  </div>
                </div>
                <p class="text-xs text-gray-600 mb-2">{{ afp.descripcion }}</p>
                <div class="space-y-1">
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-500">Comision Flujo:</span>
                    <span class="font-medium text-gray-700">{{ afp.comision_flujo }}</span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-500">Comision Mixta:</span>
                    <span class="font-medium text-gray-700">{{ afp.comision_mixta }}</span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-500">Prima de Seguro:</span>
                    <span class="font-medium text-gray-700">{{ afp.prima_seguro }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ONP option -->
            <div
              (click)="datos.tipo = 'ONP'; datos.entidad = 'ONP'"
              class="border-2 rounded-xl p-4 cursor-pointer transition-colors"
              [ngClass]="datos.tipo === 'ONP' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-bold text-gray-900">ONP - Sistema Nacional de Pensiones</h4>
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  [ngClass]="datos.tipo === 'ONP' ? 'border-blue-500' : 'border-gray-300'">
                  <div *ngIf="datos.tipo === 'ONP'" class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                </div>
              </div>
              <p class="text-xs text-gray-600 mb-2">Sistema publico administrado por el Estado. Aporte fijo del 13% de la remuneracion. Pension minima y maxima establecida por ley. Requiere minimo 20 anios de aporte.</p>
              <div class="flex justify-between text-xs">
                <span class="text-gray-500">Aporte:</span>
                <span class="font-medium text-gray-700">13%</span>
              </div>
            </div>
          </div>

          <!-- Not first job: select existing system -->
          <div *ngIf="!datos.primer_trabajo">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Sistema <span class="text-red-500">*</span></label>
                <select [(ngModel)]="datos.tipo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                  <option value="">Seleccionar...</option>
                  <option value="AFP">AFP - Sistema Privado de Pensiones</option>
                  <option value="ONP">ONP - Sistema Nacional de Pensiones</option>
                </select>
              </div>
              <div *ngIf="datos.tipo === 'AFP'">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">AFP <span class="text-red-500">*</span></label>
                <select [(ngModel)]="datos.entidad" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                  <option value="">Seleccionar AFP...</option>
                  <option *ngFor="let afp of afps" [value]="afp.nombre">AFP {{ afp.nombre }}</option>
                </select>
              </div>
              <div *ngIf="datos.tipo === 'ONP'">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Entidad</label>
                <input type="text" value="ONP" disabled class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500"/>
              </div>
            </div>
            <div *ngIf="datos.tipo === 'AFP'" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">CUSPP (Codigo Unico del Sistema Privado de Pensiones) <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="datos.cuspp" maxlength="12" placeholder="Ej: 123456789012" class="w-full max-w-sm px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
              <p class="text-xs text-gray-400 mt-1">12 caracteres alfanumericos</p>
            </div>
          </div>

          <!-- Save button -->
          <div class="flex justify-end mt-6 pt-4 border-t border-gray-100">
            <button
              (click)="guardar()"
              [disabled]="saving || !datos.tipo"
              class="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>

        <!-- Info cards -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-amber-800">Informacion Importante</p>
              <p class="text-xs text-amber-700 mt-1">
                Si es la primera vez que trabaja formalmente y no elige un sistema de pensiones dentro de los primeros 10 dias,
                sera asignado automaticamente a la AFP con menor comision. La eleccion del sistema es permanente durante los primeros
                2 anios de afiliacion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegimenPensionarioComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  datos: RegimenData = {
    primer_trabajo: true,
    tipo: '',
    entidad: '',
    cuspp: '',
  };

  loading = true;
  saving = false;
  error = '';
  successMsg = '';
  isNewRecord = true;

  afps: InfoAFP[] = [
    {
      nombre: 'Integra',
      comision_flujo: '1.55%',
      comision_mixta: '0.82%',
      prima_seguro: '1.74%',
      descripcion: 'Una de las AFP mas grandes del Peru con amplia red de agencias y servicios digitales.',
    },
    {
      nombre: 'Prima',
      comision_flujo: '1.55%',
      comision_mixta: '0.82%',
      prima_seguro: '1.74%',
      descripcion: 'AFP del grupo Credicorp con solidos fondos de inversion y plataforma digital.',
    },
    {
      nombre: 'Habitat',
      comision_flujo: '1.35%',
      comision_mixta: '0.38%',
      prima_seguro: '1.74%',
      descripcion: 'AFP de origen chileno con las comisiones mas competitivas del mercado.',
    },
    {
      nombre: 'Profuturo',
      comision_flujo: '1.69%',
      comision_mixta: '0.92%',
      prima_seguro: '1.74%',
      descripcion: 'AFP del grupo Scotiabank con enfoque en rentabilidad de largo plazo.',
    },
  ];

  ngOnInit(): void {
    this.loadDatos();
  }

  loadDatos(): void {
    this.loading = true;
    this.http.get<RegimenData>(`${this.apiUrl}/portal/regimen-pensionario`).subscribe({
      next: (res) => {
        this.datos = { ...this.datos, ...res };
        this.isNewRecord = false;
        this.loading = false;
      },
      error: () => {
        // 404 means no data yet - OK for first-time users
        this.isNewRecord = true;
        this.loading = false;
      },
    });
  }

  guardar(): void {
    this.saving = true;
    this.error = '';
    this.successMsg = '';

    const user = this.authService.getCurrentUser();
    const payload: any = {
      tipo: this.datos.tipo.toLowerCase(),
      entidad: this.datos.tipo === 'ONP' ? 'ONP' : this.datos.entidad,
      cuspp: this.datos.cuspp,
      primer_trabajo: this.datos.primer_trabajo,
    };
    if (user?.id) {
      payload.trabajador_id = user.id;
    }

    const req$ = this.isNewRecord
      ? this.http.post(`${this.apiUrl}/portal/regimen-pensionario`, payload)
      : this.http.put(`${this.apiUrl}/portal/regimen-pensionario`, payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.isNewRecord = false;
        this.successMsg = 'Regimen pensionario guardado exitosamente.';
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: () => {
        this.saving = false;
        this.error = 'Error al guardar el regimen pensionario.';
        setTimeout(() => this.error = '', 4000);
      },
    });
  }
}
