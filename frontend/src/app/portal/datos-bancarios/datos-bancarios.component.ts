import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

interface DatosBancarios {
  tiene_cuenta: boolean;
  entidad: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  cci: string;
  entidad_apertura: string;
}

interface EntidadFinanciera {
  nombre: string;
  tipo: string;
}

@Component({
  selector: 'app-datos-bancarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Datos Bancarios</h1>
      <p class="text-sm text-gray-500 mb-6">Configure su cuenta bancaria para el deposito de haberes</p>

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

      <div *ngIf="!loading" class="max-w-3xl">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <!-- Toggle question -->
          <div class="mb-6">
            <label class="text-sm font-semibold text-gray-900 mb-3 block">Tiene cuenta bancaria?</label>
            <div class="flex items-center gap-4">
              <button
                (click)="datos.tiene_cuenta = true"
                class="px-6 py-2.5 rounded-lg text-sm font-medium border-2 transition-colors"
                [ngClass]="datos.tiene_cuenta ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'"
              >
                Si, tengo cuenta
              </button>
              <button
                (click)="datos.tiene_cuenta = false"
                class="px-6 py-2.5 rounded-lg text-sm font-medium border-2 transition-colors"
                [ngClass]="!datos.tiene_cuenta ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'"
              >
                No, necesito abrir una
              </button>
            </div>
          </div>

          <!-- Has account: show form -->
          <div *ngIf="datos.tiene_cuenta">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Entidad Financiera <span class="text-red-500">*</span></label>
                <select [(ngModel)]="datos.entidad" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                  <option value="">Seleccionar entidad...</option>
                  <optgroup *ngFor="let group of entidadGroups" [label]="group.label">
                    <option *ngFor="let e of group.items" [value]="e.nombre">{{ e.nombre }}</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Cuenta <span class="text-red-500">*</span></label>
                <select [(ngModel)]="datos.tipo_cuenta" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                  <option value="">Seleccionar...</option>
                  <option value="Ahorros">Ahorros</option>
                  <option value="Corriente">Corriente</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Numero de Cuenta <span class="text-red-500">*</span></label>
                <input type="text" [(ngModel)]="datos.numero_cuenta" placeholder="Ingrese su numero de cuenta" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">CCI (Codigo de Cuenta Interbancario) <span class="text-red-500">*</span></label>
                <input type="text" [(ngModel)]="datos.cci" maxlength="20" placeholder="20 digitos" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
              </div>
            </div>
          </div>

          <!-- No account: choose entity to open -->
          <div *ngIf="!datos.tiene_cuenta">
            <p class="text-sm text-gray-600 mb-4">Seleccione la entidad donde desea aperturar su cuenta de haberes:</p>
            <div class="space-y-4">
              <div *ngFor="let group of entidadGroups">
                <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2">{{ group.label }}</h4>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  <button
                    *ngFor="let e of group.items"
                    (click)="datos.entidad_apertura = e.nombre"
                    class="px-3 py-2 text-sm rounded-lg border-2 transition-colors text-left"
                    [ngClass]="datos.entidad_apertura === e.nombre
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'"
                  >
                    {{ e.nombre }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Save button -->
          <div class="flex justify-end mt-6 pt-4 border-t border-gray-100">
            <button
              (click)="guardar()"
              [disabled]="saving"
              class="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DatosBancariosComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  datos: DatosBancarios = {
    tiene_cuenta: true,
    entidad: '',
    tipo_cuenta: '',
    numero_cuenta: '',
    cci: '',
    entidad_apertura: '',
  };

  loading = true;
  saving = false;
  error = '';
  successMsg = '';
  isNewRecord = true;

  entidades: EntidadFinanciera[] = [
    // Bancos
    { nombre: 'BCP - Banco de Credito del Peru', tipo: 'Banco' },
    { nombre: 'BBVA Peru', tipo: 'Banco' },
    { nombre: 'Interbank', tipo: 'Banco' },
    { nombre: 'Scotiabank Peru', tipo: 'Banco' },
    { nombre: 'Banco de la Nacion', tipo: 'Banco' },
    { nombre: 'Banco Pichincha', tipo: 'Banco' },
    { nombre: 'Banco Falabella', tipo: 'Banco' },
    { nombre: 'Banco Ripley', tipo: 'Banco' },
    { nombre: 'Banco GNB Peru', tipo: 'Banco' },
    { nombre: 'Banco Santander Peru', tipo: 'Banco' },
    { nombre: 'Banco de Comercio', tipo: 'Banco' },
    { nombre: 'Alfin Banco', tipo: 'Banco' },
    { nombre: 'BanBif', tipo: 'Banco' },
    { nombre: 'MiBanco', tipo: 'Banco' },
    { nombre: 'Banco Compartamos', tipo: 'Banco' },
    // Financieras
    { nombre: 'Financiera Oh!', tipo: 'Financiera' },
    { nombre: 'Financiera Proempresa', tipo: 'Financiera' },
    { nombre: 'Financiera Credinka', tipo: 'Financiera' },
    { nombre: 'Financiera Confianza', tipo: 'Financiera' },
    { nombre: 'Financiera Efectiva', tipo: 'Financiera' },
    { nombre: 'Financiera Qapaq', tipo: 'Financiera' },
    { nombre: 'Financiera Surgir', tipo: 'Financiera' },
    { nombre: 'Financiera Kori', tipo: 'Financiera' },
    // Cajas Municipales
    { nombre: 'Caja Arequipa', tipo: 'Caja Municipal' },
    { nombre: 'Caja Huancayo', tipo: 'Caja Municipal' },
    { nombre: 'Caja Cusco', tipo: 'Caja Municipal' },
    { nombre: 'Caja Piura', tipo: 'Caja Municipal' },
    { nombre: 'Caja Sullana', tipo: 'Caja Municipal' },
    { nombre: 'Caja Trujillo', tipo: 'Caja Municipal' },
    { nombre: 'Caja Tacna', tipo: 'Caja Municipal' },
  ];

  get entidadGroups(): { label: string; items: EntidadFinanciera[] }[] {
    const tipos = [...new Set(this.entidades.map(e => e.tipo))];
    return tipos.map(t => ({
      label: t === 'Banco' ? 'Bancos' : t === 'Financiera' ? 'Financieras' : 'Cajas Municipales',
      items: this.entidades.filter(e => e.tipo === t),
    }));
  }

  ngOnInit(): void {
    this.loadDatos();
  }

  loadDatos(): void {
    this.loading = true;
    this.http.get<DatosBancarios>(`${this.apiUrl}/portal/datos-bancarios`).subscribe({
      next: (res) => {
        this.datos = { ...this.datos, ...res };
        this.isNewRecord = false;
        this.loading = false;
      },
      error: (err) => {
        // 404 means no data yet - that's OK for first-time users
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
      tiene_cuenta: this.datos.tiene_cuenta,
      entidad: this.datos.tiene_cuenta ? this.datos.entidad : this.datos.entidad_apertura,
      tipo_cuenta: this.datos.tipo_cuenta,
      numero_cuenta: this.datos.numero_cuenta,
      cci: this.datos.cci,
    };
    if (user?.id) {
      payload.trabajador_id = user.id;
    }

    const req$ = this.isNewRecord
      ? this.http.post(`${this.apiUrl}/portal/datos-bancarios`, payload)
      : this.http.put(`${this.apiUrl}/portal/datos-bancarios`, payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.isNewRecord = false;
        this.successMsg = 'Datos bancarios guardados exitosamente.';
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: () => {
        this.saving = false;
        this.error = 'Error al guardar los datos bancarios.';
        setTimeout(() => this.error = '', 4000);
      },
    });
  }
}
