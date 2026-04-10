import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

const STATUS_MAP: Record<string, { dot: string; bg: string; text: string }> = {
  'Trabajador':     { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  'Aprobado':       { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  'Activo':         { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  'Completado':     { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  'Rechazado':      { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  'Inactivo':       { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  'En Evaluacion':  { dot: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  'Pendiente':      { dot: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  'En Proceso':     { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  'Nuevo':          { dot: 'bg-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-700' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      [ngClass]="[config.bg, config.text]"
    >
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="config.dot"></span>
      {{ status }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  get config() {
    return STATUS_MAP[this.status] ?? { dot: 'bg-gray-400', bg: 'bg-gray-50', text: 'text-gray-600' };
  }
}
