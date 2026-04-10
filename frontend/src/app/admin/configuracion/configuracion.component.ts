import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ConfigItem {
  key: string;
  value: string;
  label: string;
  tipo: string;
  grupo: string;
  editing?: boolean;
  originalValue?: string;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Configuracion</h1>
        <button
          (click)="saveAll()"
          [disabled]="saving || !hasChanges"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg *ngIf="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>

      <!-- Success Message -->
      <div *ngIf="successMessage" class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-2">
        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="text-sm text-green-700">{{ successMessage }}</span>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-500">Cargando...</span>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <!-- Config Groups -->
      <div *ngIf="!loading" class="space-y-6">
        <div *ngFor="let group of configGroups" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- Group Header -->
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center"
              [ngClass]="{
                'bg-blue-100 text-blue-600': group.key === 'empresa',
                'bg-purple-100 text-purple-600': group.key === 'evaluaciones',
                'bg-yellow-100 text-yellow-600': group.key === 'notificaciones',
                'bg-green-100 text-green-600': group.key === 'ia'
              }">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getGroupIcon(group.key)"/>
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-700">{{ group.label }}</h3>
          </div>

          <!-- Config Items -->
          <div class="divide-y divide-gray-50">
            <div *ngFor="let item of group.items" class="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ item.label }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ item.key }}</p>
              </div>
              <div class="w-64 flex-shrink-0">
                <input
                  *ngIf="item.tipo !== 'boolean' && item.tipo !== 'select'"
                  [type]="item.tipo === 'number' ? 'number' : 'text'"
                  [(ngModel)]="item.value"
                  (ngModelChange)="markChanged(item)"
                  class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  [ngClass]="item.editing ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200'"
                />
                <div *ngIf="item.tipo === 'boolean'" class="flex items-center">
                  <button
                    (click)="toggleBool(item)"
                    class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
                    [ngClass]="item.value === 'true' ? 'bg-blue-600' : 'bg-gray-300'"
                  >
                    <span
                      class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                      [ngClass]="item.value === 'true' ? 'translate-x-5' : 'translate-x-0'"
                    ></span>
                  </button>
                  <span class="ml-2 text-sm text-gray-600">{{ item.value === 'true' ? 'Activado' : 'Desactivado' }}</span>
                </div>
                <select
                  *ngIf="item.tipo === 'select'"
                  [(ngModel)]="item.value"
                  (ngModelChange)="markChanged(item)"
                  class="w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  [ngClass]="item.editing ? 'border-blue-400' : 'border-gray-200'"
                >
                  <option *ngFor="let opt of getSelectOptions(item.key)" [value]="opt">{{ opt }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ConfiguracionComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  loading = true;
  saving = false;
  error = '';
  successMessage = '';
  hasChanges = false;

  configItems: ConfigItem[] = [];
  configGroups: { key: string; label: string; items: ConfigItem[] }[] = [];

  private selectOptionsMap: Record<string, string[]> = {
    'ia.modelo': ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-2'],
    'evaluaciones.scoring_method': ['promedio', 'ponderado', 'maximo'],
    'notificaciones.canal': ['email', 'sms', 'ambos'],
  };

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/configuracion/`).subscribe({
      next: (data) => {
        const rawItems = data ?? [];
        if (rawItems.length > 0) {
          // Map API fields (clave/valor) to internal fields (key/value)
          this.configItems = rawItems.map((item: any) => {
            const key = item.clave ?? item.key ?? '';
            const value = item.valor ?? item.value ?? '';
            const defaultItem = this.getDefaultConfig().find((d) => d.key === key);
            return {
              key,
              value,
              label: defaultItem?.label ?? item.descripcion ?? key,
              tipo: defaultItem?.tipo ?? 'text',
              grupo: defaultItem?.grupo ?? key.split('.')[0] ?? 'empresa',
              editing: false,
              originalValue: value,
            };
          });
        } else {
          this.configItems = this.getDefaultConfig();
        }
        this.buildGroups();
        this.loading = false;
      },
      error: () => {
        this.configItems = this.getDefaultConfig();
        this.buildGroups();
        this.loading = false;
      },
    });
  }

  private buildGroups(): void {
    const groupMap: Record<string, { label: string; items: ConfigItem[] }> = {
      empresa: { label: 'Empresa', items: [] },
      evaluaciones: { label: 'Evaluaciones', items: [] },
      notificaciones: { label: 'Notificaciones', items: [] },
      ia: { label: 'Inteligencia Artificial', items: [] },
    };

    for (const item of this.configItems) {
      const groupKey = item.grupo ?? item.key.split('.')[0] ?? 'empresa';
      if (!groupMap[groupKey]) {
        groupMap[groupKey] = { label: groupKey.charAt(0).toUpperCase() + groupKey.slice(1), items: [] };
      }
      groupMap[groupKey].items.push(item);
    }

    this.configGroups = Object.entries(groupMap)
      .filter(([, g]) => g.items.length > 0)
      .map(([key, g]) => ({ key, ...g }));
  }

  markChanged(item: ConfigItem): void {
    item.editing = item.value !== item.originalValue;
    this.hasChanges = this.configItems.some((i) => i.editing);
  }

  toggleBool(item: ConfigItem): void {
    item.value = item.value === 'true' ? 'false' : 'true';
    this.markChanged(item);
  }

  getSelectOptions(key: string): string[] {
    return this.selectOptionsMap[key] ?? ['opcion1', 'opcion2'];
  }

  getGroupIcon(groupKey: string): string {
    const icons: Record<string, string> = {
      empresa: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      evaluaciones: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      notificaciones: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      ia: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    };
    return icons[groupKey] ?? 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z';
  }

  saveAll(): void {
    const changed = this.configItems.filter((i) => i.editing);
    if (changed.length === 0) return;

    this.saving = true;
    this.successMessage = '';
    this.error = '';

    const payload = {
      items: changed.map((i) => ({ clave: i.key, valor: i.value })),
    };
    this.http.put<any>(`${this.apiUrl}/configuracion/`, payload).subscribe({
      next: () => {
        changed.forEach((i) => {
          i.originalValue = i.value;
          i.editing = false;
        });
        this.hasChanges = false;
        this.saving = false;
        this.successMessage = 'Configuracion guardada exitosamente.';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.error = 'Error al guardar la configuracion.';
        this.saving = false;
        console.error('Config save error:', err);
      },
    });
  }

  private getDefaultConfig(): ConfigItem[] {
    return [
      { key: 'empresa.nombre', value: '', label: 'Nombre de Empresa', tipo: 'text', grupo: 'empresa' },
      { key: 'empresa.ruc', value: '', label: 'RUC', tipo: 'text', grupo: 'empresa' },
      { key: 'empresa.direccion', value: '', label: 'Direccion', tipo: 'text', grupo: 'empresa' },
      { key: 'empresa.telefono', value: '', label: 'Telefono', tipo: 'text', grupo: 'empresa' },
      { key: 'evaluaciones.tiempo_limite', value: '60', label: 'Tiempo Limite (minutos)', tipo: 'number', grupo: 'evaluaciones' },
      { key: 'evaluaciones.puntaje_minimo', value: '60', label: 'Puntaje Minimo Aprobatorio', tipo: 'number', grupo: 'evaluaciones' },
      { key: 'evaluaciones.scoring_method', value: 'promedio', label: 'Metodo de Scoring', tipo: 'select', grupo: 'evaluaciones' },
      { key: 'notificaciones.email_activo', value: 'true', label: 'Notificaciones por Email', tipo: 'boolean', grupo: 'notificaciones' },
      { key: 'notificaciones.canal', value: 'email', label: 'Canal de Notificacion', tipo: 'select', grupo: 'notificaciones' },
      { key: 'notificaciones.email_remitente', value: '', label: 'Email Remitente', tipo: 'text', grupo: 'notificaciones' },
      { key: 'ia.modelo', value: 'gpt-4', label: 'Modelo de IA', tipo: 'select', grupo: 'ia' },
      { key: 'ia.activo', value: 'true', label: 'IA Activa', tipo: 'boolean', grupo: 'ia' },
      { key: 'ia.temperatura', value: '0.7', label: 'Temperatura', tipo: 'text', grupo: 'ia' },
    ].map((i) => ({ ...i, editing: false, originalValue: i.value }));
  }
}
