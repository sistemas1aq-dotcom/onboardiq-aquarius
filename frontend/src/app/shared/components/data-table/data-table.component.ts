import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'actions';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Search -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between gap-4" *ngIf="searchable">
        <div class="relative flex-1 max-w-sm">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearch()"
            placeholder="Buscar..."
            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue1/20 focus:border-blue1"
          />
        </div>
        <span class="text-xs text-gray-400">{{ filteredData.length }} registros</span>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50">
              <th
                *ngFor="let col of columns"
                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                (click)="onSort(col.key)"
              >
                <div class="flex items-center gap-1">
                  {{ col.label }}
                  <svg *ngIf="sortKey === col.key" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      [attr.d]="sortDir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'"
                    />
                  </svg>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              *ngFor="let row of paginatedData; trackBy: trackByIndex"
              class="hover:bg-gray-50 transition-colors cursor-pointer"
              (click)="rowClick.emit(row)"
            >
              <td *ngFor="let col of columns" class="px-4 py-3 text-sm text-gray-700">
                <ng-container [ngSwitch]="col.type">
                  <span *ngSwitchCase="'actions'">
                    <button
                      class="text-blue1 hover:text-blue2 text-xs font-medium mr-2"
                      (click)="$event.stopPropagation(); actionClick.emit({ action: 'view', row: row })"
                    >Ver</button>
                    <button
                      class="text-gray-400 hover:text-gray-600 text-xs font-medium"
                      (click)="$event.stopPropagation(); actionClick.emit({ action: 'edit', row: row })"
                    >Editar</button>
                  </span>
                  <span *ngSwitchDefault>{{ row[col.key] }}</span>
                </ng-container>
              </td>
            </tr>
            <tr *ngIf="paginatedData.length === 0">
              <td [attr.colspan]="columns.length" class="px-4 py-8 text-center text-sm text-gray-400">
                No se encontraron registros
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between" *ngIf="totalPages > 1">
        <span class="text-xs text-gray-500">
          Mostrando {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredData.length) }} de {{ filteredData.length }}
        </span>
        <div class="flex items-center gap-1">
          <button
            class="px-3 py-1 text-xs rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            [disabled]="currentPage === 1"
            (click)="goToPage(currentPage - 1)"
          >Anterior</button>
          <button
            *ngFor="let p of visiblePages"
            class="w-8 h-8 text-xs rounded-md border transition-colors"
            [ngClass]="p === currentPage ? 'bg-blue1 text-white border-blue1' : 'border-gray-200 hover:bg-gray-50'"
            (click)="goToPage(p)"
          >{{ p }}</button>
          <button
            class="px-3 py-1 text-xs rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            [disabled]="currentPage === totalPages"
            (click)="goToPage(currentPage + 1)"
          >Siguiente</button>
        </div>
      </div>
    </div>
  `,
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() searchable: boolean = true;
  @Input() pageSize: number = 10;
  @Output() rowClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();

  searchTerm = '';
  sortKey = '';
  sortDir: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  Math = Math;

  get filteredData(): any[] {
    let result = [...this.data];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(row =>
        this.columns.some(col =>
          String(row[col.key] ?? '').toLowerCase().includes(term)
        )
      );
    }
    if (this.sortKey) {
      result.sort((a, b) => {
        const aVal = a[this.sortKey] ?? '';
        const bVal = b[this.sortKey] ?? '';
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return this.sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  onSearch(): void {
    this.currentPage = 1;
  }

  onSort(key: string): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
