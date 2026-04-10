import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-gray-300 mb-4">403</h1>
        <p class="text-xl text-gray-600 mb-6">Acceso no autorizado</p>
        <a routerLink="/" class="px-6 py-2.5 text-sm font-medium text-white bg-blue1 rounded-lg hover:bg-blue2 transition-colors">
          Volver al inicio
        </a>
      </div>
    </div>
  `,
})
export class UnauthorizedComponent {}
