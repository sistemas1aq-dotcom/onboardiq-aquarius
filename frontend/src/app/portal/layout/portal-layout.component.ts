import { Component, inject, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-sidebar
        [rol]="userRole"
        [collapsed]="sidebarCollapsed"
        [mobileOpen]="mobileMenuOpen"
        (toggleCollapse)="sidebarCollapsed = !sidebarCollapsed"
        (mobileClose)="mobileMenuOpen = false"
      ></app-sidebar>

      <div
        class="transition-all duration-300 min-h-screen flex flex-col"
        [style.margin-left.px]="isMobile ? 0 : (sidebarCollapsed ? 72 : 250)"
      >
        <app-header
          [userName]="userName"
          [userRole]="userRole"
          (toggleSidebar)="onToggleSidebar()"
          (logout)="onLogout()"
        ></app-header>

        <main class="p-4 md:p-6 flex-1">
          <router-outlet></router-outlet>
        </main>

        <footer class="px-4 md:px-6 py-3 border-t border-gray-200 bg-white sticky bottom-0 z-10">
          <p class="text-center text-xs text-gray-400">OnboardIQ Aquarius — Recruit System &nbsp;|&nbsp; &copy; Powered by Aquarius Consulting 2026</p>
        </footer>
      </div>
    </div>
  `,
})
export class PortalLayoutComponent implements OnInit {
  private authService = inject(AuthService);

  sidebarCollapsed = false;
  isMobile = false;
  mobileMenuOpen = false;

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    if (wasMobile && !this.isMobile) {
      this.mobileMenuOpen = false;
    }
  }

  onToggleSidebar(): void {
    if (this.isMobile) {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  get userRole(): string {
    const role = this.authService.getUserRole();
    return role === 'trabajador' ? 'trabajador' : 'postulante';
  }

  get userName(): string {
    const user = this.authService.getCurrentUser();
    return user?.nombre ?? 'Usuario';
  }

  onLogout(): void {
    this.authService.logout();
  }
}
