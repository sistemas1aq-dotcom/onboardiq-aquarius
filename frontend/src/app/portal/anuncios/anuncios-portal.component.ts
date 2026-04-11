import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-anuncios-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Anuncios</h1>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-3 mb-6">
        <select
          [(ngModel)]="filterTipo"
          (ngModelChange)="applyFilter()"
          class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">Todos los tipos</option>
          <option value="bienvenida">Bienvenida</option>
          <option value="cesado">Cesado</option>
          <option value="cumpleanos">Cumpleanos</option>
          <option value="festividad">Festividad</option>
          <option value="general">General</option>
        </select>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span class="text-sm text-gray-500">Cargando anuncios...</span>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <p class="text-sm text-red-600">{{ error }}</p>
        <button (click)="loadAnuncios()" class="mt-2 text-xs text-red-700 underline">Reintentar</button>
      </div>

      <!-- Cards -->
      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          *ngFor="let anuncio of filteredAnuncios"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-900 flex-1">{{ anuncio.titulo }}</h3>
            <span
              class="ml-2 px-2 py-0.5 text-xs font-medium rounded-full"
              [ngClass]="tipoBadgeClass(anuncio.tipo)"
            >{{ anuncio.tipo }}</span>
          </div>
          <p class="text-sm text-gray-600 mb-3 whitespace-pre-line">{{ anuncio.contenido }}</p>
          <div class="flex items-center justify-between pt-3 border-t border-gray-100">
            <span class="text-xs text-gray-400">{{ anuncio.fecha_publicacion | date:'dd/MM/yyyy' }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredAnuncios.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
        </svg>
        <p class="text-sm text-gray-400">No hay anuncios publicados</p>
      </div>
    </div>
  `,
})
export class AnunciosPortalComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  loading = true;
  error = '';
  anuncios: any[] = [];
  filteredAnuncios: any[] = [];
  filterTipo = '';

  ngOnInit(): void {
    this.loadAnuncios();
  }

  loadAnuncios(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any[]>(`${this.apiUrl}/anuncios/publicos`).subscribe({
      next: (data) => {
        this.anuncios = data ?? [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.anuncios = [];
        this.filteredAnuncios = [];
        this.error = 'Error al cargar anuncios.';
        this.loading = false;
        console.error('Anuncios portal error:', err);
      },
    });
  }

  applyFilter(): void {
    this.filteredAnuncios = this.filterTipo
      ? this.anuncios.filter(a => a.tipo === this.filterTipo)
      : [...this.anuncios];
  }

  tipoBadgeClass(tipo: string): Record<string, boolean> {
    return {
      'bg-green-100 text-green-700': tipo === 'bienvenida',
      'bg-red-100 text-red-700': tipo === 'cesado',
      'bg-pink-100 text-pink-700': tipo === 'cumpleanos',
      'bg-purple-100 text-purple-700': tipo === 'festividad',
      'bg-gray-100 text-gray-700': tipo === 'general',
    };
  }
}
