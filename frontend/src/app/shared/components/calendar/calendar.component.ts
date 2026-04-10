import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CalendarEvent {
  fecha: string; // YYYY-MM-DD
  tipo: string;
  hora?: string;
  lugar?: string;
  evaluador?: string;
  titulo?: string;
}

const EVENT_COLORS: Record<string, string> = {
  entrevista: 'bg-blue1',
  evaluacion: 'bg-cyan',
  capacitacion: 'bg-green-500',
  vencimiento: 'bg-red-500',
  reunion: 'bg-yellow-500',
};

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button
          class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          (click)="prevMonth()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h3 class="text-sm font-semibold text-gray-900 capitalize">
          {{ monthName }} {{ currentYear }}
        </h3>
        <button
          class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          (click)="nextMonth()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- Day labels -->
      <div class="grid grid-cols-7 border-b border-gray-100">
        <div *ngFor="let day of dayLabels" class="py-2 text-center text-xs font-medium text-gray-400">
          {{ day }}
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7">
        <div
          *ngFor="let cell of calendarCells; trackBy: trackByIndex"
          class="min-h-[64px] p-1.5 border-b border-r border-gray-50 relative"
          [ngClass]="{'bg-gray-50': !cell.isCurrentMonth}"
        >
          <span
            class="text-xs font-medium block mb-0.5"
            [ngClass]="cell.isToday ? 'text-white bg-blue1 w-6 h-6 rounded-full flex items-center justify-center' : cell.isCurrentMonth ? 'text-gray-700' : 'text-gray-300'"
          >
            {{ cell.day }}
          </span>
          <div class="flex flex-wrap gap-0.5">
            <button
              *ngFor="let evt of cell.events"
              class="w-1.5 h-1.5 rounded-full cursor-pointer hover:scale-150 transition-transform"
              [ngClass]="getEventColor(evt.tipo)"
              [title]="evt.titulo || evt.tipo + (evt.hora ? ' - ' + evt.hora : '')"
              (click)="eventClick.emit(evt)"
            ></button>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-4">
        <div *ngFor="let type of eventTypes" class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full" [ngClass]="getEventColor(type)"></span>
          <span class="text-xs text-gray-500 capitalize">{{ type }}</span>
        </div>
      </div>
    </div>
  `,
})
export class CalendarComponent {
  @Input() events: CalendarEvent[] = [];
  @Output() eventClick = new EventEmitter<CalendarEvent>();

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();

  dayLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

  private monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  get monthName(): string {
    return this.monthNames[this.currentMonth];
  }

  get eventTypes(): string[] {
    return [...new Set(this.events.map(e => e.tipo))];
  }

  get calendarCells(): { day: number; isCurrentMonth: boolean; isToday: boolean; events: CalendarEvent[] }[] {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Monday=0
    const today = new Date();
    const cells: any[] = [];

    // Previous month days
    const prevLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      cells.push({ day: prevLastDay - i, isCurrentMonth: false, isToday: false, events: [] });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = today.getFullYear() === this.currentYear && today.getMonth() === this.currentMonth && today.getDate() === d;
      cells.push({
        day: d,
        isCurrentMonth: true,
        isToday,
        events: this.events.filter(e => e.fecha === dateStr),
      });
    }

    // Fill remaining cells
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, isCurrentMonth: false, isToday: false, events: [] });
    }

    return cells;
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  }

  getEventColor(tipo: string): string {
    return EVENT_COLORS[tipo] ?? 'bg-gray-400';
  }

  trackByIndex(index: number): number {
    return index;
  }
}
