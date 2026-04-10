import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
         style="background: linear-gradient(135deg, #0a1f3d 0%, #0d4f8b 40%, #1a7ec5 100%)">

      <!-- Decorative circles -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full hidden sm:block"></div>
        <div class="absolute -bottom-20 -left-20 w-96 h-96 bg-white/3 rounded-full"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan/5 rounded-full"></div>
        <div class="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full hidden sm:block"></div>
        <div class="absolute bottom-20 right-1/4 w-48 h-48 bg-blue2/10 rounded-full hidden sm:block"></div>
      </div>

      <div class="relative z-10 text-center max-w-2xl mx-auto w-full">
        <!-- Logo -->
        <div class="flex justify-center mb-6">
          <svg width="80" height="80" viewBox="0 0 100 100" class="w-16 h-16 sm:w-20 sm:h-20">
            <circle cx="50" cy="30" r="18" fill="#3ec6e0" opacity="0.9"/>
            <circle cx="30" cy="65" r="14" fill="#1a7ec5" opacity="0.8"/>
            <circle cx="70" cy="65" r="14" fill="#1a7ec5" opacity="0.8"/>
            <polygon points="50,18 35,55 65,55" fill="#0d4f8b" opacity="0.6"/>
          </svg>
        </div>

        <!-- Title -->
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
          OnboardIQ Aquarius
        </h1>
        <div class="flex items-center justify-center gap-3 mb-4">
          <div class="h-px w-8 sm:w-12 bg-cyan/50"></div>
          <h2 class="text-xs sm:text-sm md:text-base font-semibold text-cyan tracking-widest uppercase">
            Recruit System
          </h2>
          <div class="h-px w-8 sm:w-12 bg-cyan/50"></div>
        </div>

        <!-- Version / Info -->
        <p class="text-white/50 text-xs sm:text-sm mb-8">Version 1.0.0 &mdash; Plataforma integral de gestion de recursos humanos</p>

        <!-- Profiles -->
        <div class="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
          <span *ngFor="let profile of profiles"
            class="px-3 py-1.5 text-xs font-medium rounded-full border border-white/15 text-white/70 bg-white/5">
            {{ profile }}
          </span>
        </div>

        <!-- Cards -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center px-2 sm:px-0">
          <a
            routerLink="/login"
            [queryParams]="{ mode: 'admin' }"
            class="group flex-1 sm:max-w-xs bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div class="w-14 h-14 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg class="w-7 h-7 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 class="text-white font-semibold text-lg mb-1">Panel Administrativo</h3>
            <p class="text-white/50 text-sm">Administradores y Evaluadores</p>
          </a>

          <a
            routerLink="/login"
            [queryParams]="{ mode: 'portal' }"
            class="group flex-1 sm:max-w-xs bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div class="w-14 h-14 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg class="w-7 h-7 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h3 class="text-white font-semibold text-lg mb-1">Portal Postulante</h3>
            <p class="text-white/50 text-sm">Postulantes y Trabajadores</p>
          </a>
        </div>

        <!-- Footer -->
        <p class="text-white/30 text-xs mt-8 sm:mt-12">
          OnboardIQ Aquarius &mdash; Recruit System &nbsp;|&nbsp; &copy; Powered by Aquarius Consulting 2026
        </p>
      </div>
    </div>
  `,
})
export class LandingComponent {
  profiles = ['Administrador', 'Evaluador', 'Postulante', 'Trabajador'];
}
