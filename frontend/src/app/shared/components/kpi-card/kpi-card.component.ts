import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm text-gray-500 font-medium">{{ title }}</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ value }}</p>
          <div class="flex items-center mt-2 gap-1" *ngIf="subtitle || trend !== null">
            <span
              *ngIf="trend !== null"
              class="flex items-center text-xs font-medium"
              [ngClass]="trend >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  [attr.d]="trend >= 0 ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'"
                />
              </svg>
              {{ trend > 0 ? '+' : '' }}{{ trend }}%
            </span>
            <span class="text-xs text-gray-400" *ngIf="subtitle">{{ subtitle }}</span>
          </div>
        </div>
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          [style.background-color]="color + '20'"
        >
          <svg class="w-6 h-6" [style.color]="color" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="icon"/>
          </svg>
        </div>
      </div>
    </div>
  `,
})
export class KpiCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() subtitle: string = '';
  @Input() icon: string = 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6';
  @Input() color: string = '#1a7ec5';
  @Input() trend: number | null = null;
}
