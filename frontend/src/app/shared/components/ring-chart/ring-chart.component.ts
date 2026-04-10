import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ring-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [attr.width]="size" [attr.height]="size" [attr.viewBox]="'0 0 ' + size + ' ' + size">
      <!-- Background ring -->
      <circle
        [attr.cx]="center"
        [attr.cy]="center"
        [attr.r]="radius"
        fill="none"
        stroke="#e5e7eb"
        [attr.stroke-width]="strokeWidth"
      />
      <!-- Value ring -->
      <circle
        [attr.cx]="center"
        [attr.cy]="center"
        [attr.r]="radius"
        fill="none"
        [attr.stroke]="color"
        [attr.stroke-width]="strokeWidth"
        stroke-linecap="round"
        [attr.stroke-dasharray]="circumference"
        [attr.stroke-dashoffset]="dashOffset"
        [style.transform]="'rotate(-90deg)'"
        [style.transform-origin]="'center'"
        class="transition-all duration-700 ease-out"
      />
      <!-- Center text -->
      <text
        [attr.x]="center"
        [attr.y]="center"
        text-anchor="middle"
        dominant-baseline="central"
        class="font-bold"
        [attr.font-size]="size * 0.22"
        fill="#1f2937"
      >
        {{ clampedValue }}%
      </text>
    </svg>
  `,
})
export class RingChartComponent {
  @Input() value: number = 0;
  @Input() size: number = 120;
  @Input() strokeWidth: number = 10;
  @Input() color: string = '#1a7ec5';

  get clampedValue(): number {
    return Math.max(0, Math.min(100, Math.round(this.value)));
  }

  get center(): number {
    return this.size / 2;
  }

  get radius(): number {
    return (this.size - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get dashOffset(): number {
    return this.circumference * (1 - this.clampedValue / 100);
  }
}
