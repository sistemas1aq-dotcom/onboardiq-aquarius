import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-gray-200 rounded-full overflow-hidden" [style.height.px]="height">
      <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        [style.width.%]="clampedValue"
        [ngClass]="barColor"
      ></div>
    </div>
  `,
})
export class ProgressBarComponent {
  @Input() value: number = 0;
  @Input() height: number = 8;

  get clampedValue(): number {
    return Math.max(0, Math.min(100, this.value));
  }

  get barColor(): string {
    if (this.clampedValue >= 80) return 'bg-green-500';
    if (this.clampedValue >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }
}
