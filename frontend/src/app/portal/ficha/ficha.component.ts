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
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Genero</label>
                  <select [(ngModel)]="ficha.genero" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Seleccionar...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Telefono</label>
                  <input type="text" [(ngModel)]="ficha.telefono" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Direccion</label>
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
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Telefono de Emergencia</label>
                  <input type="text" [(ngModel)]="ficha.telefono_emergencia" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
              </div>
            </div>

            <!-- Tab 1: Formacion -->
            <div *ngIf="activeTab === 1">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Formacion Academica</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Grado de Instruccion</label>
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
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Anio de Egreso</label>
                  <input type="number" [(ngModel)]="ficha.anio_egreso" min="1950" max="2030" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Colegiatura (N. de colegiado si aplica)</label>
                  <input type="text" [(ngModel)]="ficha.colegiatura" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
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

            <!-- Tab 3: Idiomas -->
            <div *ngIf="activeTab === 3">
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

            <!-- Tab 4: Habilidades -->
            <div *ngIf="activeTab === 4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Habilidades Informaticas</h3>
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

            <!-- Tab 5: Referencias -->
            <div *ngIf="activeTab === 5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Referencias Personales</h3>
                <button (click)="addReferencia()" class="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                  + Agregar
                </button>
              </div>
              <div *ngFor="let ref of ficha.referencias; let i = index" class="border border-gray-200 rounded-lg p-4 mb-4">
                <div class="flex justify-between items-center mb-3">
                  <span class="text-sm font-medium text-gray-600">Referencia {{ i + 1 }}</span>
                  <button (click)="removeReferencia(i)" class="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
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
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Telefono</label>
                    <input type="text" [(ngModel)]="ref.telefono" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">Relacion</label>
                    <select [(ngModel)]="ref.relacion" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                      <option value="">Seleccionar...</option>
                      <option *ngFor="let r of relaciones" [value]="r">{{ r }}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div *ngIf="ficha.referencias.length === 0" class="text-center py-8 text-gray-400 text-sm">
                No se han registrado referencias.
              </div>
            </div>

            <!-- Tab 6: Expectativas -->
            <div *ngIf="activeTab === 6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Expectativas Laborales</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Pretension Salarial (S/.)</label>
                  <input type="number" [(ngModel)]="ficha.pretension_salarial" min="0" step="100" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Disponibilidad</label>
                  <select [(ngModel)]="ficha.disponibilidad" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Seleccionar...</option>
                    <option value="Inmediata">Inmediata</option>
                    <option value="1 semana">1 semana</option>
                    <option value="2 semanas">2 semanas</option>
                    <option value="1 mes">1 mes</option>
                    <option value="Mas de 1 mes">Mas de 1 mes</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Modalidad Preferida</label>
                  <select [(ngModel)]="ficha.modalidad_preferida" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Seleccionar...</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Remoto">Remoto</option>
                    <option value="Hibrido">Hibrido</option>
                    <option value="Indiferente">Indiferente</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Tab 7: Salud -->
            <div *ngIf="activeTab === 7">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Informacion de Salud</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Sangre</label>
                  <select [(ngModel)]="ficha.tipo_sangre" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Seleccionar...</option>
                    <option *ngFor="let ts of tiposSangre" [value]="ts">{{ ts }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Discapacidad</label>
                  <select [(ngModel)]="ficha.discapacidad" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">Seleccionar...</option>
                    <option value="Ninguna">Ninguna</option>
                    <option value="Fisica">Fisica</option>
                    <option value="Sensorial">Sensorial</option>
                    <option value="Intelectual">Intelectual</option>
                    <option value="Mental">Mental</option>
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Alergias</label>
                  <textarea [(ngModel)]="ficha.alergias" rows="2" placeholder="Describa sus alergias si las tiene" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"></textarea>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">Condiciones Medicas</label>
                  <textarea [(ngModel)]="ficha.condiciones_medicas" rows="2" placeholder="Describa condiciones medicas relevantes" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"></textarea>
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

  tabs = ['Datos Personales', 'Formacion', 'Experiencia Laboral', 'Idiomas', 'Habilidades', 'Referencias', 'Expectativas', 'Salud'];
  estadosCiviles = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Conviviente'];
  gradosInstruccion = ['Secundaria Completa', 'Tecnico', 'Universitario Incompleto', 'Bachiller', 'Titulado', 'Maestria', 'Doctorado'];
  niveles = ['Basico', 'Intermedio', 'Avanzado', 'Nativo'];
  relaciones = ['Jefe Directo', 'Colega', 'Cliente', 'Amigo', 'Familiar', 'Profesor'];
  tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  ngOnInit(): void {
    this.loadFicha();
  }

  loadFicha(): void {
    this.loading = true;
    this.http.get<FichaData>(`${this.apiUrl}/portal/mi-ficha`).subscribe({
      next: (res) => {
        this.ficha = {
          ...res,
          experiencia_laboral: this.parseJson(res.experiencia_laboral),
          idiomas: this.parseJson(res.idiomas),
          habilidades: this.parseJson(res.habilidades),
          referencias: this.parseJson(res.referencias),
        };
        this.loading = false;
      },
      error: () => {
        this.ficha = this.emptyFicha();
        this.loading = false;
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

  guardar(): void {
    if (!this.ficha) return;
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';
    const payload = {
      ...this.ficha,
      experiencia_laboral: JSON.stringify(this.ficha.experiencia_laboral ?? []),
      idiomas: JSON.stringify(this.ficha.idiomas ?? []),
      habilidades: JSON.stringify(this.ficha.habilidades ?? []),
      referencias: JSON.stringify(this.ficha.referencias ?? []),
    };
    this.http.put(`${this.apiUrl}/portal/mi-ficha`, payload).subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = 'Ficha guardada exitosamente.';
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'Error al guardar la ficha. Intente nuevamente.';
        setTimeout(() => this.errorMsg = '', 4000);
      },
    });
  }

  addExperiencia(): void {
    this.ficha?.experiencia_laboral.push({ empresa: '', cargo: '', desde: '', hasta: '', funciones: '' });
  }
  removeExperiencia(i: number): void {
    this.ficha?.experiencia_laboral.splice(i, 1);
  }

  addIdioma(): void {
    this.ficha?.idiomas.push({ idioma: '', nivel: 'Basico' });
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

  private emptyFicha(): FichaData {
    return {
      nombres: '', apellidos: '', dni: '', fecha_nacimiento: '', lugar_nacimiento: '',
      estado_civil: '', genero: '', direccion: '', distrito: '', provincia: '', departamento: '',
      telefono: '', telefono_emergencia: '',
      grado_instruccion: '', carrera: '', universidad: '', anio_egreso: null, colegiatura: '',
      experiencia_laboral: [], idiomas: [], habilidades: [], referencias: [],
      pretension_salarial: null, disponibilidad: '', modalidad_preferida: '',
      tipo_sangre: '', alergias: '', condiciones_medicas: '', discapacidad: '',
    };
  }
}
