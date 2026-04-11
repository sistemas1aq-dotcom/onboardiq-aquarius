import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <!-- Left: Toggle + Breadcrumb -->
      <div class="flex items-center gap-3 md:gap-4">
        <button
          class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          (click)="toggleSidebar.emit()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <nav class="text-sm text-gray-500 hidden sm:block">
          <span class="text-gray-400">OnboardIQ</span>
          <span class="mx-2 text-gray-300">/</span>
          <span class="text-gray-700 font-medium">{{ breadcrumb }}</span>
        </nav>
        <span class="text-sm font-medium text-gray-700 sm:hidden">{{ breadcrumb }}</span>
      </div>

      <!-- Right: User -->
      <div class="flex items-center gap-2 md:gap-4">
        <!-- Notifications -->
        <div class="relative">
          <button
            class="p-2 rounded-lg hover:bg-gray-100 text-gray-400 relative transition-colors"
            (click)="toggleNotifications()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span *ngIf="unreadCount > 0" class="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <!-- Notifications Panel -->
          <div *ngIf="showNotifications"
            class="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h4 class="text-sm font-semibold text-gray-700">Notificaciones</h4>
              <button *ngIf="notifications.length > 0" (click)="markAllRead()" class="text-xs text-blue-600 hover:text-blue-800 font-medium">
                Marcar todo leido
              </button>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <div *ngIf="loadingNotifications" class="flex items-center justify-center py-8">
                <div class="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <div *ngIf="!loadingNotifications && notifications.length === 0" class="py-8 text-center">
                <svg class="w-10 h-10 mx-auto text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                <p class="text-xs text-gray-400">No hay notificaciones</p>
              </div>
              <div *ngFor="let n of notifications; let i = index"
                class="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                [ngClass]="{'bg-blue-50': !n.read}"
                (click)="n.read = true; unreadCount = unreadCount > 0 ? unreadCount - 1 : 0">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    [ngClass]="{
                      'bg-blue-100 text-blue-600': n.tipo === 'login',
                      'bg-green-100 text-green-600': n.tipo === 'aprobado' || n.tipo === 'creacion',
                      'bg-red-100 text-red-600': n.tipo === 'rechazado' || n.tipo === 'eliminacion',
                      'bg-yellow-100 text-yellow-600': n.tipo === 'evaluacion' || n.tipo === 'cambio',
                      'bg-gray-100 text-gray-600': !n.tipo
                    }">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-gray-900 leading-snug">{{ n.accion }}</p>
                    <p class="text-[11px] text-gray-500 mt-0.5 truncate">{{ n.detalle }}</p>
                    <p class="text-[10px] text-gray-400 mt-1">{{ n.usuario }} &middot; {{ n.fecha_display }}</p>
                  </div>
                  <span *ngIf="!n.read" class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Info -->
        <div class="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-200">
          <div class="w-8 h-8 rounded-full bg-blue1 flex items-center justify-center text-white text-sm font-medium">
            {{ initials }}
          </div>
          <div class="hidden md:block">
            <p class="text-sm font-medium text-gray-700 leading-tight">{{ userName }}</p>
            <p class="text-xs text-gray-400 capitalize">{{ userRole }}</p>
          </div>
          <button
            class="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors ml-1"
            (click)="logout.emit()"
            title="Cerrar sesion"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Backdrop to close notifications -->
    <div *ngIf="showNotifications" class="fixed inset-0 z-20" (click)="showNotifications = false"></div>
  `,
})
export class HeaderComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  @Input() userName: string = '';
  @Input() userRole: string = '';
  @Input() breadcrumb: string = 'Dashboard';
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  showNotifications = false;
  loadingNotifications = false;
  notifications: any[] = [];
  unreadCount = 0;

  ngOnInit(): void {
    // Solo cargar notificaciones para admin/evaluador
    if (this.userRole === 'admin' || this.userRole === 'evaluador') {
      this.loadNotificationCount();
    }
  }

  get initials(): string {
    return this.userName
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications && this.notifications.length === 0) {
      this.loadNotifications();
    }
  }

  private loadNotificationCount(): void {
    this.http.get<any>(`${this.apiUrl}/seguridad/auditoria`, { params: { limit: '1' } }).subscribe({
      next: (data) => {
        const total = data.total ?? 0;
        this.unreadCount = Math.min(total, 5);
      },
      error: () => { this.unreadCount = 0; },
    });
  }

  loadNotifications(): void {
    this.loadingNotifications = true;
    this.http.get<any>(`${this.apiUrl}/seguridad/auditoria`, { params: { limit: '15' } }).subscribe({
      next: (data) => {
        const registros = data.registros ?? data ?? [];
        this.notifications = (Array.isArray(registros) ? registros : []).slice(0, 15).map((r: any) => {
          const fecha = r.fecha ? new Date(r.fecha) : new Date();
          const now = new Date();
          const diffMs = now.getTime() - fecha.getTime();
          const diffMin = Math.floor(diffMs / 60000);
          const diffHrs = Math.floor(diffMin / 60);
          const diffDays = Math.floor(diffHrs / 24);

          let fechaDisplay = '';
          if (diffMin < 1) fechaDisplay = 'Justo ahora';
          else if (diffMin < 60) fechaDisplay = `Hace ${diffMin} min`;
          else if (diffHrs < 24) fechaDisplay = `Hace ${diffHrs}h`;
          else fechaDisplay = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });

          return {
            accion: r.accion,
            detalle: r.detalle || '',
            usuario: r.usuario_nombre || 'Sistema',
            fecha_display: fechaDisplay,
            tipo: r.accion?.includes('login') ? 'login' : r.accion?.includes('crea') ? 'creacion' : r.accion?.includes('elimi') ? 'eliminacion' : 'cambio',
            read: false,
          };
        });
        this.loadingNotifications = false;
      },
      error: () => {
        this.notifications = [];
        this.loadingNotifications = false;
      },
    });
  }

  markAllRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
  }
}
