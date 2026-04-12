import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

const MENU_CONFIG: Record<string, MenuItem[]> = {
  admin: [
    { label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4', route: '/admin/dashboard' },
    { label: 'Gestion Postulantes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', route: '/admin/postulantes' },
    { label: 'Evaluaciones', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', route: '/admin/evaluaciones' },
    { label: 'Legajo Trabajador', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', route: '/admin/legajo' },
    { label: 'Embudo', icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z', route: '/admin/embudo' },
    { label: 'IA Insights', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', route: '/admin/ia-insights' },
    { label: 'Admin Usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', route: '/admin/usuarios' },
    { label: 'Seguridad', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', route: '/admin/seguridad' },
    { label: 'Configuracion', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', route: '/admin/configuracion' },
    { label: 'Carga Masiva', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12', route: '/admin/carga-masiva' },
    { label: 'Anuncios', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', route: '/admin/anuncios' },
    { label: 'Comunicaciones', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', route: '/admin/comunicaciones' },
    { label: 'Capacitaciones', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', route: '/admin/capacitaciones' },
    { label: 'Eval. Desempeno', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', route: '/admin/eval-desempeno' },
    { label: 'Mis Aprobaciones', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', route: '/admin/mis-aprobaciones' },
    { label: 'Maestros', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4', route: '/admin/maestros' },
  ],
  evaluador: [
    { label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4', route: '/admin/dashboard' },
    { label: 'Mis Postulantes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', route: '/admin/postulantes' },
    { label: 'Evaluar', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', route: '/admin/evaluaciones' },
    { label: 'Legajo Trabajador', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', route: '/admin/legajo' },
    { label: 'Mis Aprobaciones', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', route: '/admin/mis-aprobaciones' },
  ],
  postulante: [
    { label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4', route: '/portal/inicio' },
    { label: 'Mi Ficha', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', route: '/portal/ficha' },
    { label: 'Evaluaciones', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', route: '/portal/evaluaciones' },
    { label: 'Documentos', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', route: '/portal/documentos' },
    { label: 'Entrevistas', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', route: '/portal/entrevistas' },
    { label: 'Anuncios', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', route: '/portal/anuncios' },
  ],
  trabajador: [
    { label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4', route: '/portal/inicio' },
    { label: 'Mi Ficha', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', route: '/portal/ficha' },
    { label: 'Evaluaciones', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', route: '/portal/evaluaciones' },
    { label: 'Documentos', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', route: '/portal/documentos' },
    { label: 'Entrevistas', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', route: '/portal/entrevistas' },
    { label: 'Eval. Desempeno', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', route: '/portal/eval-desempeno' },
    { label: 'Firma Digital', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z', route: '/portal/firma-digital' },
    { label: 'Derechohabientes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', route: '/portal/derechohabientes' },
    { label: 'Datos Bancarios', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', route: '/portal/datos-bancarios' },
    { label: 'Reg. Pensionario', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z', route: '/portal/regimen-pensionario' },
    { label: 'Docs. Digitales', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', route: '/portal/docs-digitales' },
    { label: 'Capacitaciones', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', route: '/portal/capacitaciones' },
    { label: 'Anuncios', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', route: '/portal/anuncios' },
  ],
};

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  admin: { bg: 'bg-red-900', text: 'text-red-300', label: 'Administrador' },
  evaluador: { bg: 'bg-yellow-900', text: 'text-yellow-300', label: 'Evaluador' },
  postulante: { bg: 'bg-cyan-900', text: 'text-cyan-300', label: 'Postulante' },
  trabajador: { bg: 'bg-green-900', text: 'text-green-300', label: 'Trabajador' },
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile Backdrop -->
    <div
      *ngIf="mobileOpen && isMobile"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      (click)="mobileClose.emit()"
    ></div>

    <!-- Sidebar -->
    <aside
      class="h-screen fixed left-0 top-0 z-50 flex flex-col overflow-hidden"
      [style.background-color]="'#0a1f3d'"
      [ngClass]="sidebarClasses"
      [ngStyle]="sidebarStyles"
    >
      <!-- Logo -->
      <div class="flex items-center px-4 py-5 border-b border-white/10">
        <svg width="36" height="36" viewBox="0 0 100 100" class="flex-shrink-0">
          <circle cx="50" cy="30" r="18" fill="#3ec6e0" opacity="0.9"/>
          <circle cx="30" cy="65" r="14" fill="#1a7ec5" opacity="0.8"/>
          <circle cx="70" cy="65" r="14" fill="#1a7ec5" opacity="0.8"/>
          <polygon points="50,18 35,55 65,55" fill="#0d4f8b" opacity="0.6"/>
        </svg>
        <div class="ml-3 overflow-hidden transition-all duration-300"
             [class.w-0]="!isMobile && collapsed"
             [class.w-40]="isMobile || !collapsed">
          <span class="text-white font-bold text-sm whitespace-nowrap leading-tight">OnboardIQ Aquarius</span>
          <span class="block text-cyan text-[10px] whitespace-nowrap">Recruit System</span>
        </div>
      </div>

      <!-- Role Badge -->
      <div class="px-4 py-3" *ngIf="showLabels && roleConfig">
        <span class="text-xs px-2 py-1 rounded-full" [ngClass]="[roleConfig.bg, roleConfig.text]">
          {{ roleConfig.label }}
        </span>
      </div>

      <!-- Menu Items -->
      <nav class="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        <a
          *ngFor="let item of menuItems"
          [routerLink]="item.route"
          routerLinkActive="bg-white/15 text-white"
          [routerLinkActiveOptions]="{ exact: false }"
          class="flex items-center px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors group"
          [title]="!showLabels ? item.label : ''"
          (click)="onNavItemClick(item.route)"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.icon"/>
          </svg>
          <span
            class="ml-3 text-sm whitespace-nowrap overflow-hidden transition-all duration-300"
            [class.w-0]="!showLabels"
            [class.opacity-0]="!showLabels"
          >
            {{ item.label }}
          </span>
        </a>
      </nav>

      <!-- Collapse Toggle (desktop only) -->
      <button
        *ngIf="!isMobile"
        class="flex items-center justify-center p-3 border-t border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        (click)="toggleCollapse.emit()"
      >
        <svg class="w-5 h-5 transition-transform duration-300" [class.rotate-180]="collapsed" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
        </svg>
      </button>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class SidebarComponent implements OnInit {
  @Input() rol: string = 'admin';
  @Input() collapsed: boolean = false;
  @Input() mobileOpen: boolean = false;
  @Output() navigate = new EventEmitter<string>();
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() mobileClose = new EventEmitter<void>();

  isMobile: boolean = false;

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
  }

  get showLabels(): boolean {
    if (this.isMobile) return true;
    return !this.collapsed;
  }

  get sidebarClasses(): Record<string, boolean> {
    return {
      'transition-transform duration-300 ease-in-out': this.isMobile,
      'transition-all duration-300': !this.isMobile,
    };
  }

  get sidebarStyles(): Record<string, string> {
    if (this.isMobile) {
      return {
        width: '280px',
        transform: this.mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
      };
    }
    return {
      width: this.collapsed ? '72px' : '250px',
      transform: 'translateX(0)',
    };
  }

  get menuItems(): MenuItem[] {
    return MENU_CONFIG[this.rol] ?? MENU_CONFIG['admin'];
  }

  get roleConfig() {
    return ROLE_COLORS[this.rol] ?? ROLE_COLORS['admin'];
  }

  onNavItemClick(route: string): void {
    this.navigate.emit(route);
    if (this.isMobile) {
      this.mobileClose.emit();
    }
  }
}
