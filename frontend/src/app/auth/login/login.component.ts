import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4"
         style="background: linear-gradient(135deg, #0a1f3d 0%, #0d4f8b 50%, #1a7ec5 100%)">

      <!-- Decorative circles -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full"></div>
        <div class="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/3 rounded-full"></div>
        <div class="absolute top-1/3 left-1/4 w-48 h-48 bg-cyan/5 rounded-full hidden sm:block"></div>
      </div>

      <div class="relative w-full max-w-md">
        <!-- Login Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <!-- Logo -->
          <div class="flex flex-col items-center mb-6 sm:mb-8">
            <svg width="56" height="56" viewBox="0 0 100 100" class="mb-3 w-12 h-12 sm:w-14 sm:h-14">
              <circle cx="50" cy="30" r="18" fill="#3ec6e0" opacity="0.9"/>
              <circle cx="30" cy="65" r="14" fill="#1a7ec5" opacity="0.8"/>
              <circle cx="70" cy="65" r="14" fill="#1a7ec5" opacity="0.8"/>
              <polygon points="50,18 35,55 65,55" fill="#0d4f8b" opacity="0.6"/>
            </svg>
            <h1 class="text-lg sm:text-xl font-bold text-gray-900">OnboardIQ Aquarius</h1>
            <p class="text-xs sm:text-sm text-gray-400 mt-1">Recruit System</p>
          </div>

          <!-- Mode tabs -->
          <div class="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              class="flex-1 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors"
              [ngClass]="mode === 'admin' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              (click)="mode = 'admin'"
            >Panel Trabajadores</button>
            <button
              class="flex-1 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors"
              [ngClass]="mode === 'portal' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              (click)="mode = 'portal'"
            >Portal Postulante</button>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onLogin()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                {{ mode === 'admin' ? 'Email' : 'DNI / Email' }}
              </label>
              <input
                type="text"
                [(ngModel)]="credentials.usuario"
                name="usuario"
                [placeholder]="mode === 'admin' ? 'admin@aquarius.pe' : 'Ingrese su DNI o email'"
                required
                class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue1/20 focus:border-blue1 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Contrasena</label>
              <input
                type="password"
                [(ngModel)]="credentials.password"
                name="password"
                placeholder="Ingrese su contrasena"
                required
                class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue1/20 focus:border-blue1 transition-colors"
              />
            </div>

            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 text-gray-600">
                <input type="checkbox" class="rounded border-gray-300 text-blue1 focus:ring-blue1/20"/>
                Recordarme
              </label>
              <a href="#" class="text-blue1 hover:text-blue2 font-medium text-xs sm:text-sm">Olvide mi contrasena</a>
            </div>

            <button
              type="submit"
              [disabled]="loading"
              class="w-full py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
              [style.background-color]="'#0d4f8b'"
              [class.hover:opacity-90]="!loading"
            >
              <span *ngIf="!loading">Iniciar Sesion</span>
              <span *ngIf="loading" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Ingresando...
              </span>
            </button>

            <p *ngIf="error" class="text-sm text-red-500 text-center mt-2">{{ error }}</p>
          </form>
        </div>

        <!-- Quick access -->
        <div class="flex gap-3 mt-4">
          <button
            class="flex-1 py-3 text-xs font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl backdrop-blur transition-colors text-center"
            (click)="mode = 'admin'"
          >
            <svg class="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            Panel Trabajadores
          </button>
          <button
            class="flex-1 py-3 text-xs font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl backdrop-blur transition-colors text-center"
            (click)="mode = 'portal'"
          >
            <svg class="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Portal Postulante
          </button>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mode: 'admin' | 'portal' = 'admin';
  credentials = { usuario: '', password: '' };
  loading = false;
  error = '';

  ngOnInit(): void {
    const modeParam = this.route.snapshot.queryParamMap.get('mode');
    if (modeParam === 'portal' || modeParam === 'admin') {
      this.mode = modeParam;
    }
  }

  onLogin(): void {
    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials.usuario, this.credentials.password).subscribe({
      next: () => {
        const role = this.authService.getUserRole();
        if (this.mode === 'admin' && (role === 'admin' || role === 'trabajador')) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/portal/inicio']);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Credenciales invalidas';
        this.loading = false;
      },
    });
  }
}
