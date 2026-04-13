import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ExperienciaLaboral {
  empresa: string;
  cargo: string;
  desde: string;
  hasta: string;
  funciones: string;
}

interface Idioma {
  idioma: string;
  nivel: string;
}

interface Habilidad {
  nombre: string;
  nivel: number;
}

interface Referencia {
  nombre: string;
  empresa: string;
  cargo: string;
  telefono: string;
  relacion: string;
}

interface EstudioAdicional {
  tipo: string;
  nombre: string;
  institucion: string;
  anio: number | null;
}

interface FichaData {
  // Datos Personales
  nombres: string;
  apellidos: string;
  dni: string;
  fecha_nacimiento: string;
  lugar_nacimiento: string;
  estado_civil: string;
  genero: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  telefono: string;
  telefono_emergencia: string;
  // Formacion
  grado_instruccion: string;
  carrera: string;
  universidad: string;
  anio_egreso: number | null;
  colegiatura: string;
  estudios_adicionales: EstudioAdicional[];
  // Experiencia
  experiencia_laboral: ExperienciaLaboral[];
  // Idiomas
  idiomas: Idioma[];
  // Habilidades
  habilidades: Habilidad[];
  // Referencias
  referencias: Referencia[];
  // Expectativas
  pretension_salarial: number | null;
  disponibilidad: string;
  modalidad_preferida: string;
  // Salud
  tipo_sangre: string;
  alergias: string;
  condiciones_medicas: string;
  discapacidad: string;
}

@Component({
  selector: 'app-ficha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Mi Ficha Personal</h1>
        <button
          (click)="guardar()"
          [disabled]="saving"
          class="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <svg *ngIf="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>

      <!-- Success/Error messages -->
      <div *ngIf="successMsg" class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
        {{ successMsg }}
      </div>
      <div *ngIf="errorMsg" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {{ errorMsg }}
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="!loading && ficha">
        <!-- Tab Navigation -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div class="flex overflow-x-auto border-b border-gray-100">
            <button
              *ngFor="let tab of tabs; let i = index"
              (click)="activeTab = i"
              class="px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px"
              [ngClass]="activeTab === i
                ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'"
            >
              {{ tab }}
            </button>
          </div>

          <div class="p-6">
            <!-- Tab 0: Datos Personales -->
            <div *ngIf="activeTab === 0">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Datos Personales</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Nombres <span class="text-red-500">*</span></label>
                  <input type="text" [(ngModel)]="ficha.nombres" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Apellidos <span class="text-red-500">*</span></label>
                  <input type="text" [(ngModel)]="ficha.apellidos" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">DNI <span class="text-red-500">*</span></label>
                  <input type="text" [(ngModel)]="ficha.dni" maxlength="8" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Fecha de Nacimiento</label>
                  <input type="date" [(ngModel)]="ficha.fecha_nacimiento" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Lugar de Nacimiento</label>
                  <input type="text" [(ngModel)]="ficha.lugar_nacimiento" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Estado Civil</label>
                  <select [(ngModel)]="ficha.estado_civil" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Seleccionar...</option>
                    <option *ngFor="let ec of estadosCiviles" [value]="ec">{{ ec }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Género</label>
                  <select [(ngModel)]="ficha.genero" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Seleccionar...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                  <input type="text" [(ngModel)]="ficha.telefono" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
                  <input type="text" [(ngModel)]="ficha.direccion" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Distrito</label>
                  <input type="text" [(ngModel)]="ficha.distrito" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Provincia</label>
                  <input type="text" [(ngModel)]="ficha.provincia" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Departamento</label>
                  <input type="text" [(ngModel)]="ficha.departamento" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Teléfono de Emergencia</label>
                  <input type="text" [(ngModel)]="ficha.telefono_emergencia" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
              </div>
            </div>

            <!-- Tab 1: Formación -->
            <div *ngIf="activeTab === 1">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Formación Académica</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Grado de Instrucción</label>
                  <select [(ngModel)]="ficha.grado_instruccion" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Seleccionar...</option>
                    <option *ngFor="let g of gradosInstruccion" [value]="g">{{ g }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Carrera / Especialidad</label>
                  <input type="text" [(ngModel)]="ficha.carrera" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Universidad / Instituto</label>
                  <input type="text" [(ngModel)]="ficha.universidad" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Año de Egreso</label>
                  <input type="number" [(ngModel)]="ficha.anio_egreso" min="1950" max="2030" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Colegiatura (N. de colegiado si aplica)</label>
                  <input type="text" [(ngModel)]="ficha.colegiatura" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
              </div>

              <!-- Estudios Adicionales -->
              <div class="mt-8">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">Estudios Adicionales</h3>
                  <button (click)="addEstudio()" class="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                    + Agregar
                  </button>
                </div>
                <div *ngFor="let est of ficha.estudios_adicionales; let i = index" class="border border-gray-200 rounded-lg p-4 mb-4">
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-sm font-medium text-gray-600">Estudio {{ i + 1 }}</span>
                    <button (click)="removeEstudio(i)" class="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
                      <select [(ngModel)]="est.tipo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                        <option value="">Seleccionar...</option>
                        <option *ngFor="let t of tiposEstudio" [value]="t">{{ t }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
                      <input type="text" [(ngModel)]="est.nombre" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Institución</label>
                      <input type="text" [(ngModel)]="est.institucion" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Año</label>
                      <input type="number" [(ngModel)]="est.anio" min="1950" max="2030" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                    </div>
                  </div>
                </div>
                <div *ngIf="ficha.estudios_adicionales.length === 0" class="text-center py-8 text-gray-400 text-sm">
                  No se han registrado estudios adicionales. Haga clic en "+ Agregar" para comenzar.
                </div>
              </div>
            </div>

            <!-- Tab 2: Experiencia Laboral -->
            <div *ngIf="activeTab === 2">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Experiencia Laboral</h3>
                <button (click)="addExperiencia()" class="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                  + Agregar
                </button>
              </div>
              <div *ngFor="let exp of ficha.experiencia_laboral; let i = index" class="border border-gray-200 rounded-lg p-4 mb-4">
                <div class="flex justify-between items-center mb-3">
                  <span class="text-sm font-medium text-gray-600">Experiencia {{ i + 1 }}</span>
                  <button (click)="removeExperiencia(i)" class="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Empresa</label>
                    <input type="text" [(ngModel)]="exp.empresa" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Cargo</label>
                    <input type="text" [(ngModel)]="exp.cargo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Desde</label>
                    <input type="date" [(ngModel)]="exp.desde" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Hasta</label>
                    <input type="date" [(ngModel)]="exp.hasta" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Funciones</label>
                    <textarea [(ngModel)]="exp.funciones" rows="2" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"></textarea>
                  </div>
                </div>
              </div>
              <div *ngIf="ficha.experiencia_laboral.length === 0" class="text-center py-8 text-gray-400 text-sm">
                No se ha registrado experiencia laboral. Haga clic en "+ Agregar" para comenzar.
              </div>
            </div>

            <!-- Tab 3: Idiomas y Habilidades -->
            <div *ngIf="activeTab === 3">
              <!-- Idiomas Section -->
              <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">Idiomas</h3>
                  <button (click)="addIdioma()" class="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                    + Agregar
                  </button>
                </div>
                <div *ngFor="let idioma of ficha.idiomas; let i = index" class="border border-gray-200 rounded-lg p-4 mb-4">
                  <div class="flex justify-between items-center mb-3">
                    <span class="text-sm font-medium text-gray-600">Idioma {{ i + 1 }}</span>
                    <button (click)="removeIdioma(i)" class="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Idioma</label>
                      <input type="text" [(ngModel)]="idioma.idioma" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Nivel</label>
                      <select [(ngModel)]="idioma.nivel" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                        <option *ngFor="let n of niveles" [value]="n">{{ n }}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div *ngIf="ficha.idiomas.length === 0" class="text-center py-8 text-gray-400 text-sm">
                  No se han registrado idiomas.
                </div>
              </div>

              <!-- Habilidades Section -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">Habilidades Informáticas</h3>
                  <button (click)="addHabilidad()" class="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                    + Agregar
                  </button>
                </div>
                <div *ngFor="let hab of ficha.habilidades; let i = index" class="flex items-center gap-4 mb-4 bg-gray-50 rounded-lg p-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Herramienta / Software</label>
                    <input type="text" [(ngModel)]="hab.nombre" placeholder="Ej: Excel, Word, SAP" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                  </div>
                  <div class="w-40">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nivel ({{ hab.nivel }}%)</label>
                    <input type="range" [(ngModel)]="hab.nivel" min="0" max="100" step="5" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                  </div>
                  <button (click)="removeHabilidad(i)" class="text-red-500 hover:text-red-700 text-sm mt-5">Eliminar</button>
                </div>
                <div *ngIf="ficha.habilidades.length === 0" class="text-center py-8 text-gray-400 text-sm">
                  No se han registrado habilidades.
                </div>
              </div>
            </div>

            <!-- Tab 4: Referencias -->
            <div *ngIf="activeTab === 4">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Referencias Personales</h3>
                  <p class="text-sm text-gray-500 mt-1">Mínimo 2 referencias requeridas</p>
                </div>
                <button (click)="addReferencia()" class="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                  + Agregar
                </button>
              </div>
              <div *ngFor="let ref of ficha.referencias; let i = index" class="border border-gray-200 rounded-lg p-4 mb-4">
                <div class="flex justify-between items-center mb-3">
                  <span class="text-sm font-medium text-gray-600">Referencia {{ i + 1 }}</span>
                  <button *ngIf="i >= 2" (click)="removeReferencia(i)" class="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Nombre Completo</label>
                    <input type="text" [(ngModel)]="ref.nombre" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Empresa</label>
                    <input type="text" [(ngModel)]="ref.empresa" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Cargo</label>
                    <input type="text" [(ngModel)]="ref.cargo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                    <input type="text" [(ngModel)]="ref.telefono" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Relación</label>
                    <select [(ngModel)]="ref.relacion" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                      <option value="">Seleccionar...</option>
                      <option *ngFor="let r of relaciones" [value]="r">{{ r }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 5: Expectativas -->
            <div *ngIf="activeTab === 5">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Expectativas Laborales</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Pretensión Salarial Bruta (S/. Soles)</label>
                  <input type="number" [(ngModel)]="ficha.pretension_salarial" min="0" step="100" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                  <p class="text-xs text-gray-500 mt-1">Indique el monto mensual bruto (antes de descuentos)</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Disponibilidad</label>
                  <select [(ngModel)]="ficha.disponibilidad" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Seleccionar...</option>
                    <option value="Inmediata">Inmediata</option>
                    <option value="1 semana">1 semana</option>
                    <option value="2 semanas">2 semanas</option>
                    <option value="1 mes">1 mes</option>
                    <option value="Mas de 1 mes">Más de 1 mes</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Modalidad Preferida</label>
                  <select [(ngModel)]="ficha.modalidad_preferida" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Seleccionar...</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Remoto">Remoto</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Indiferente">Indiferente</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Tab 6: Datos Bancarios -->
            <div *ngIf="activeTab === 6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Datos Bancarios</h3>
              <div *ngIf="!bancarioLoaded" class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <div *ngIf="bancarioLoaded">
                <div class="mb-6">
                  <label class="flex items-center gap-3 cursor-pointer select-none">
                    <span class="text-sm font-medium text-gray-700">Tiene cuenta bancaria?</span>
                    <div class="relative">
                      <input type="checkbox" [(ngModel)]="bancarioData.tiene_cuenta" class="sr-only peer"/>
                      <div class="w-9 h-5 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors"></div>
                      <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <span class="text-sm text-gray-500">{{ bancarioData.tiene_cuenta ? 'Si' : 'No' }}</span>
                  </label>
                </div>

                <div *ngIf="bancarioData.tiene_cuenta" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Entidad Bancaria</label>
                    <select [(ngModel)]="bancarioData.entidad" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                      <option value="">Seleccionar...</option>
                      <option *ngFor="let b of bancos" [value]="b">{{ b }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Cuenta</label>
                    <select [(ngModel)]="bancarioData.tipo_cuenta" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                      <option value="">Seleccionar...</option>
                      <option value="Ahorros">Ahorros</option>
                      <option value="Corriente">Corriente</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Número de Cuenta</label>
                    <input type="text" [(ngModel)]="bancarioData.numero_cuenta" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">CCI (Código de Cuenta Interbancario)</label>
                    <input type="text" [(ngModel)]="bancarioData.cci" maxlength="20" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                  </div>
                </div>

                <div *ngIf="!bancarioData.tiene_cuenta" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p class="text-sm text-yellow-700">Seleccione una entidad donde desea aperturar su cuenta:</p>
                  <select [(ngModel)]="bancarioData.entidad" class="mt-2 w-full max-w-sm px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Seleccionar...</option>
                    <option *ngFor="let b of bancos" [value]="b">{{ b }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Tab 8: Régimen Pensionario -->
            <div *ngIf="activeTab === 7">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Régimen Pensionario</h3>
              <div *ngIf="!pensionarioLoaded" class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <div *ngIf="pensionarioLoaded">
                <div class="mb-6">
                  <label class="flex items-center gap-3 cursor-pointer select-none">
                    <span class="text-sm font-medium text-gray-700">Es su primer trabajo?</span>
                    <div class="relative">
                      <input type="checkbox" [(ngModel)]="pensionarioData.primer_trabajo" class="sr-only peer"/>
                      <div class="w-9 h-5 bg-gray-300 peer-checked:bg-blue-600 rounded-full transition-colors"></div>
                      <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <span class="text-sm text-gray-500">{{ pensionarioData.primer_trabajo ? 'Si' : 'No' }}</span>
                  </label>
                </div>

                <!-- Primer trabajo: elegir AFP u ONP -->
                <div *ngIf="pensionarioData.primer_trabajo" class="space-y-4">
                  <p class="text-sm text-gray-600 mb-3">Seleccione el régimen pensionario al que desea afiliarse:</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
                      <select [(ngModel)]="pensionarioData.tipo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                        <option value="afp">AFP</option>
                        <option value="onp">ONP</option>
                      </select>
                    </div>
                    <div *ngIf="pensionarioData.tipo === 'afp'">
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Entidad AFP</label>
                      <select [(ngModel)]="pensionarioData.entidad" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                        <option value="">Seleccionar...</option>
                        <option *ngFor="let a of afps" [value]="a">{{ a }}</option>
                      </select>
                    </div>
                    <div *ngIf="pensionarioData.tipo === 'onp'">
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Entidad</label>
                      <input type="text" value="ONP" disabled class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500"/>
                    </div>
                  </div>
                </div>

                <!-- No es primer trabajo: datos existentes -->
                <div *ngIf="!pensionarioData.primer_trabajo" class="space-y-4">
                  <p class="text-sm text-gray-600 mb-3">Ingrese los datos de su régimen pensionario actual:</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
                      <select [(ngModel)]="pensionarioData.tipo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                        <option value="afp">AFP</option>
                        <option value="onp">ONP</option>
                      </select>
                    </div>
                    <div *ngIf="pensionarioData.tipo === 'afp'">
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Entidad AFP</label>
                      <select [(ngModel)]="pensionarioData.entidad" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                        <option value="">Seleccionar...</option>
                        <option *ngFor="let a of afps" [value]="a">{{ a }}</option>
                      </select>
                    </div>
                    <div *ngIf="pensionarioData.tipo === 'onp'">
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">Entidad</label>
                      <input type="text" value="ONP" disabled class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500"/>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1.5">CUSPP</label>
                      <input type="text" [(ngModel)]="pensionarioData.cuspp" placeholder="Código Único de SPP" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                      <p class="text-xs text-gray-500 mt-1">Código Único del Sistema Privado de Pensiones</p>
                    </div>
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
export class FichaComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  ficha: FichaData | null = null;
  loading = true;
  saving = false;
  successMsg = '';
  errorMsg = '';
  activeTab = 0;

  tabs = ['Datos Personales', 'Formación', 'Experiencia Laboral', 'Idiomas y Habilidades', 'Referencias', 'Expectativas', 'Datos Bancarios', 'Régimen Pensionario'];
  estadosCiviles = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Conviviente'];
  gradosInstruccion = ['Secundaria Completa', 'Técnico', 'Universitario Incompleto', 'Bachiller', 'Titulado', 'Maestría', 'Doctorado'];
  niveles = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];
  relaciones = ['Jefe Directo', 'Colega', 'Cliente', 'Amigo', 'Familiar', 'Profesor'];
  tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  tiposEstudio = ['Diplomado', 'Maestría', 'Doctorado', 'Certificación', 'Curso', 'Segunda Carrera'];
  bancos = ['Banco de Crédito del Perú (BCP)', 'BBVA Perú', 'Interbank', 'Scotiabank Perú', 'Banco de la Nación', 'Banco Pichincha', 'Banco Falabella', 'Banco Ripley', 'BanBif', 'MiBanco'];
  afps = ['AFP Integra', 'AFP Prima', 'AFP Habitat', 'AFP Profuturo'];

  bancarioData: any = { tiene_cuenta: false, entidad: '', tipo_cuenta: '', numero_cuenta: '', cci: '' };
  pensionarioData: any = { tipo: 'afp', entidad: '', cuspp: '', primer_trabajo: false };
  bancarioLoaded = false;
  pensionarioLoaded = false;

  ngOnInit(): void {
    this.loadFicha();
    this.loadBancario();
    this.loadPensionario();
  }

  loadFicha(): void {
    this.loading = true;
    this.http.get<FichaData>(`${this.apiUrl}/portal/mi-ficha`).subscribe({
      next: (res) => {
        // Convertir discapacidad boolean a string para el select
        let discVal: any = (res as any).discapacidad;
        if (discVal === true || discVal === 'true') discVal = (res as any).detalle_discapacidad || 'Física';
        else if (!discVal || discVal === false || discVal === 'false') discVal = 'Ninguna';

        this.ficha = {
          ...res,
          discapacidad: discVal as any,
          experiencia_laboral: this.parseJson(res.experiencia_laboral),
          idiomas: this.parseJson(res.idiomas),
          habilidades: this.parseJson(res.habilidades),
          referencias: this.parseJson(res.referencias),
          estudios_adicionales: this.parseJson(res.estudios_adicionales),
        };
        this.prepopulateDefaults();
        this.padReferencias();
        this.loading = false;
      },
      error: () => {
        // Primera vez: cargar datos básicos del usuario
        this.ficha = this.emptyFicha();
        this.http.get<any>(`${this.apiUrl}/auth/me`).subscribe({
          next: (user) => {
            if (user) {
              const parts = (user.nombre || '').split(' ');
              this.ficha!.nombres = parts[0] || '';
              this.ficha!.apellidos = parts.slice(1).join(' ') || '';
              this.ficha!.dni = user.dni || '';
              this.ficha!.telefono = user.telefono || '';
            }
            this.prepopulateDefaults();
            this.padReferencias();
            this.loading = false;
          },
          error: () => {
            this.prepopulateDefaults();
            this.padReferencias();
            this.loading = false;
          },
        });
      },
    });
  }

  private parseJson(val: any): any[] {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
      try { return JSON.parse(val); } catch { return []; }
    }
    return [];
  }

  private prepopulateDefaults(): void {
    if (!this.ficha) return;
    if (this.ficha.idiomas.length === 0) {
      this.ficha.idiomas = [{ idioma: 'Inglés', nivel: 'Básico' }];
    }
    if (this.ficha.habilidades.length === 0) {
      this.ficha.habilidades = [
        { nombre: 'Excel', nivel: 50 },
        { nombre: 'Power BI', nivel: 30 },
        { nombre: 'Word', nivel: 50 },
      ];
    }
  }

  private padReferencias(): void {
    if (!this.ficha) return;
    while (this.ficha.referencias.length < 2) {
      this.ficha.referencias.push({ nombre: '', empresa: '', cargo: '', telefono: '', relacion: '' });
    }
  }

  loadBancario(): void {
    this.http.get<any>(`${this.apiUrl}/portal/datos-bancarios`).subscribe({
      next: (res) => {
        this.bancarioData = { tiene_cuenta: res.tiene_cuenta ?? false, entidad: res.entidad ?? '', tipo_cuenta: res.tipo_cuenta ?? '', numero_cuenta: res.numero_cuenta ?? '', cci: res.cci ?? '' };
        this.bancarioLoaded = true;
      },
      error: () => {
        this.bancarioData = { tiene_cuenta: false, entidad: '', tipo_cuenta: '', numero_cuenta: '', cci: '' };
        this.bancarioLoaded = true;
      },
    });
  }

  loadPensionario(): void {
    this.http.get<any>(`${this.apiUrl}/portal/regimen-pensionario`).subscribe({
      next: (res) => {
        this.pensionarioData = { tipo: res.tipo ?? 'afp', entidad: res.entidad ?? '', cuspp: res.cuspp ?? '', primer_trabajo: res.primer_trabajo ?? false };
        this.pensionarioLoaded = true;
      },
      error: () => {
        this.pensionarioData = { tipo: 'afp', entidad: '', cuspp: '', primer_trabajo: false };
        this.pensionarioLoaded = true;
      },
    });
  }

  private saveBancario(): Promise<void> {
    return new Promise((resolve, reject) => {
      const method = this.bancarioLoaded ? 'put' : 'post';
      this.http.request(method, `${this.apiUrl}/portal/datos-bancarios`, { body: this.bancarioData }).subscribe({
        next: () => resolve(),
        error: (err) => {
          if (err.status === 405 || err.status === 404) {
            const fallback = method === 'put' ? 'post' : 'put';
            this.http.request(fallback, `${this.apiUrl}/portal/datos-bancarios`, { body: this.bancarioData }).subscribe({
              next: () => resolve(),
              error: () => reject(),
            });
          } else {
            reject();
          }
        },
      });
    });
  }

  private savePensionario(): Promise<void> {
    return new Promise((resolve, reject) => {
      const method = this.pensionarioLoaded ? 'put' : 'post';
      this.http.request(method, `${this.apiUrl}/portal/regimen-pensionario`, { body: this.pensionarioData }).subscribe({
        next: () => resolve(),
        error: (err) => {
          if (err.status === 405 || err.status === 404) {
            const fallback = method === 'put' ? 'post' : 'put';
            this.http.request(fallback, `${this.apiUrl}/portal/regimen-pensionario`, { body: this.pensionarioData }).subscribe({
              next: () => resolve(),
              error: () => reject(),
            });
          } else {
            reject();
          }
        },
      });
    });
  }

  guardar(): void {
    if (!this.ficha) return;
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';
    // Convertir discapacidad de string a boolean para el backend
    const discapacidadBool = this.ficha.discapacidad && this.ficha.discapacidad !== 'Ninguna' && this.ficha.discapacidad !== '' && this.ficha.discapacidad !== 'false';
    const payload = {
      ...this.ficha,
      discapacidad: discapacidadBool,
      detalle_discapacidad: discapacidadBool ? this.ficha.discapacidad : null,
      experiencia_laboral: JSON.stringify(this.ficha.experiencia_laboral ?? []),
      idiomas: JSON.stringify(this.ficha.idiomas ?? []),
      habilidades: JSON.stringify(this.ficha.habilidades ?? []),
      referencias: JSON.stringify(this.ficha.referencias ?? []),
      estudios_adicionales: JSON.stringify(this.ficha.estudios_adicionales ?? []),
    };

    // Save ficha + bancario + pensionario all at once
    const fichaPromise = new Promise<void>((resolve, reject) => {
      this.http.put(`${this.apiUrl}/portal/mi-ficha`, payload).subscribe({
        next: () => resolve(),
        error: () => reject(),
      });
    });

    // Guardar ficha primero, bancario y pensionario son opcionales
    fichaPromise
      .then(() => {
        // Intentar guardar bancario y pensionario sin que falle todo
        Promise.allSettled([this.saveBancario(), this.savePensionario()]).then(() => {
          this.saving = false;
          this.successMsg = 'Ficha guardada exitosamente.';
          setTimeout(() => this.successMsg = '', 4000);
        });
      })
      .catch(() => {
        this.saving = false;
        this.errorMsg = 'Error al guardar la ficha. Intente nuevamente.';
        setTimeout(() => this.errorMsg = '', 4000);
      });
  }

  addExperiencia(): void {
    this.ficha?.experiencia_laboral.push({ empresa: '', cargo: '', desde: '', hasta: '', funciones: '' });
  }
  removeExperiencia(i: number): void {
    this.ficha?.experiencia_laboral.splice(i, 1);
  }

  addIdioma(): void {
    this.ficha?.idiomas.push({ idioma: '', nivel: 'Básico' });
  }
  removeIdioma(i: number): void {
    this.ficha?.idiomas.splice(i, 1);
  }

  addHabilidad(): void {
    this.ficha?.habilidades.push({ nombre: '', nivel: 50 });
  }
  removeHabilidad(i: number): void {
    this.ficha?.habilidades.splice(i, 1);
  }

  addReferencia(): void {
    this.ficha?.referencias.push({ nombre: '', empresa: '', cargo: '', telefono: '', relacion: '' });
  }
  removeReferencia(i: number): void {
    this.ficha?.referencias.splice(i, 1);
  }

  addEstudio(): void {
    this.ficha?.estudios_adicionales.push({ tipo: '', nombre: '', institucion: '', anio: null });
  }
  removeEstudio(i: number): void {
    this.ficha?.estudios_adicionales.splice(i, 1);
  }

  private emptyFicha(): FichaData {
    return {
      nombres: '', apellidos: '', dni: '', fecha_nacimiento: '', lugar_nacimiento: '',
      estado_civil: '', genero: '', direccion: '', distrito: '', provincia: '', departamento: '',
      telefono: '', telefono_emergencia: '',
      grado_instruccion: '', carrera: '', universidad: '', anio_egreso: null, colegiatura: '',
      estudios_adicionales: [],
      experiencia_laboral: [], idiomas: [], habilidades: [], referencias: [],
      pretension_salarial: null, disponibilidad: '', modalidad_preferida: '',
      tipo_sangre: '', alergias: '', condiciones_medicas: '', discapacidad: '',
    };
  }
}
