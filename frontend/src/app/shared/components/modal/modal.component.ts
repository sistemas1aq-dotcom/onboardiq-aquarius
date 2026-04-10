import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
    >
      <!-- Overlay -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        (click)="close.emit()"
      ></div>

      <!-- Modal -->
      <div
        class="relative bg-white rounded-2xl shadow-xl w-full overflow-hidden animate-in zoom-in-95 mx-2 sm:mx-auto"
        [ngClass]="sizeClass"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900">{{ title }}</h3>
          <button
            class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            (click)="close.emit()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="px-4 sm:px-6 py-4 max-h-[80vh] sm:max-h-[70vh] overflow-y-auto">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() close = new EventEmitter<void>();

  get sizeClass(): string {
    const sizes = { sm: 'max-w-full sm:max-w-sm', md: 'max-w-full sm:max-w-lg', lg: 'max-w-full sm:max-w-3xl' };
    return sizes[this.size];
  }
}
