import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  email: string;
  nombre: string;
  dni: string;
  rol: string;
  telefono: string;
  activo: boolean;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  rol: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<User | null>(this.getSavedUser());
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());

  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response) => {
        localStorage.setItem('access_token', response.access_token);
        // Guardar rol y nombre del login response
        const userData = {
          nombre: response.nombre,
          rol: response.rol,
        };
        localStorage.setItem('current_user', JSON.stringify(userData));
        this.currentUserSubject.next(userData as any);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  /** Despues del login, cargar datos completos del usuario */
  loadFullUser(): void {
    this.http.get<User>(`${this.apiUrl}/auth/me`).subscribe({
      next: (user) => {
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      },
      error: () => {}
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private getSavedUser(): User | null {
    const userStr = localStorage.getItem('current_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  getUserRole(): string {
    // Primero intentar del usuario guardado
    const user = this.getSavedUser();
    if (user?.rol) return user.rol;

    // Fallback: leer del token JWT
    const token = this.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol ?? '';
    } catch {
      return '';
    }
  }

  getUserName(): string {
    const user = this.getSavedUser();
    return user?.nombre ?? '';
  }
}
