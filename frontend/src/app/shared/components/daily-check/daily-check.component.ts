import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

interface CumpleanosItem {
  id: number;
  nombre: string;
  email: string;
}

interface FestividadItem {
  nombre: string;
  mensaje: string;
}

interface CheckHoyResponse {
  cumpleanos: CumpleanosItem[];
  festividad: FestividadItem | null;
  ya_enviado_cumpleanos: boolean;
  ya_enviado_festividad: boolean;
}

@Component({
  selector: 'app-daily-check',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal Overlay -->
    <div
      *ngIf="visible"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300"
      (click)="cerrar()"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-fadeIn"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-[#0a1f3d] to-[#1a7ec5] px-6 py-5 text-white">
          <p class="text-sm text-cyan-200 mb-1">{{ fechaHoy }}</p>
          <h2 class="text-xl font-bold">Buenos dias, {{ userName }}!</h2>
        </div>

        <div class="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">

          <!-- Cumpleanos Section -->
          <div *ngIf="data && data.cumpleanos.length > 0">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-2xl">&#127874;</span>
              <h3 class="text-base font-semibold text-gray-800">Hoy cumplen anos:</h3>
            </div>
            <ul class="space-y-2 mb-3">
              <li
                *ngFor="let c of data.cumpleanos"
                class="flex items-center gap-3 bg-purple-50 rounded-lg px-4 py-2.5"
              >
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {{ c.nombre.charAt(0) }}
                </div>
                <span class="text-sm text-gray-700 font-medium">{{ c.nombre }}</span>
              </li>
            </ul>

            <!-- Already sent or send button -->
            <div *ngIf="data.ya_enviado_cumpleanos || cumpleanosEnviado" class="flex items-center gap-2 text-green-600 text-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              Ya enviaste las felicitaciones hoy
            </div>
            <button
              *ngIf="!data.ya_enviado_cumpleanos && !cumpleanosEnviado"
              (click)="enviarCumpleanos()"
              [disabled]="enviandoCumpleanos"
              class="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50 text-sm"
            >
              {{ enviandoCumpleanos ? 'Enviando...' : 'Enviar Felicitaciones' }}
            </button>
          </div>

          <!-- Divider -->
          <hr *ngIf="data && data.cumpleanos.length > 0 && data.festividad" class="border-gray-200" />

          <!-- Festividad Section -->
          <div *ngIf="data && data.festividad">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-2xl">&#127881;</span>
              <h3 class="text-base font-semibold text-gray-800">Hoy es {{ data.festividad.nombre }}</h3>
            </div>
            <p *ngIf="data.festividad.mensaje" class="text-sm text-gray-600 bg-blue-50 rounded-lg px-4 py-3 mb-3">
              {{ data.festividad.mensaje }}
            </p>

            <div *ngIf="data.ya_enviado_festividad || festividadEnviada" class="flex items-center gap-2 text-green-600 text-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              Ya enviaste el saludo hoy
            </div>
            <button
              *ngIf="!data.ya_enviado_festividad && !festividadEnviada"
              (click)="enviarFestividad()"
              [disabled]="enviandoFestividad"
              class="w-full bg-gradient-to-r from-[#0a1f3d] to-[#1a7ec5] text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50 text-sm"
            >
              {{ enviandoFestividad ? 'Enviando...' : 'Enviar Saludo' }}
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            (click)="cerrar()"
            class="text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Despues
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `],
})
export class DailyCheckComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  visible = false;
  data: CheckHoyResponse | null = null;
  userName = '';
  fechaHoy = '';

  enviandoCumpleanos = false;
  cumpleanosEnviado = false;
  enviandoFestividad = false;
  festividadEnviada = false;

  ngOnInit(): void {
    // Only show once per session
    if (sessionStorage.getItem('daily_check_shown')) {
      return;
    }

    const role = this.auth.getUserRole();
    if (role !== 'admin' && role !== 'evaluador') {
      return;
    }

    this.userName = this.auth.getUserName() || 'Administrador';

    const hoy = new Date();
    this.fechaHoy = hoy.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    this.api.get<CheckHoyResponse>('/comunicaciones/check-hoy').subscribe({
      next: (res) => {
        if (res.cumpleanos.length > 0 || res.festividad) {
          this.data = res;
          this.visible = true;
          sessionStorage.setItem('daily_check_shown', '1');
        }
      },
      error: () => {
        // Silently fail - don't block the admin experience
      },
    });
  }

  cerrar(): void {
    this.visible = false;
  }

  enviarCumpleanos(): void {
    this.enviandoCumpleanos = true;
    this.api.post<any>('/comunicaciones/cumpleanos').subscribe({
      next: () => {
        this.cumpleanosEnviado = true;
        this.enviandoCumpleanos = false;
      },
      error: () => {
        this.enviandoCumpleanos = false;
      },
    });
  }

  enviarFestividad(): void {
    this.enviandoFestividad = true;
    this.api.post<any>('/comunicaciones/festividad').subscribe({
      next: () => {
        this.festividadEnviada = true;
        this.enviandoFestividad = false;
      },
      error: () => {
        this.enviandoFestividad = false;
      },
    });
  }
}
