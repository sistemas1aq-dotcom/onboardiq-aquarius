import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // BehaviorSubjects
  private conversationsSubject = new BehaviorSubject<any[]>([]);
  private activeConversationSubject = new BehaviorSubject<any | null>(null);
  private messagesSubject = new BehaviorSubject<any[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  // Public observables
  conversations$ = this.conversationsSubject.asObservable();
  activeConversation$ = this.activeConversationSubject.asObservable();
  messages$ = this.messagesSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  private pollInterval: any = null;

  loadConversations(): void {
    this.http.get<any[]>(`${this.apiUrl}/chat/conversaciones`).subscribe({
      next: (data) => {
        const conversations = data ?? [];
        this.conversationsSubject.next(conversations);
        const unread = conversations.reduce((sum: number, c: any) => sum + (c.no_leidos || 0), 0);
        this.unreadCountSubject.next(unread);
      },
      error: () => {
        this.conversationsSubject.next([]);
      },
    });
  }

  loadMessages(convId: number): void {
    this.http.get<any[]>(`${this.apiUrl}/chat/conversaciones/${convId}/mensajes`).subscribe({
      next: (data) => {
        this.messagesSubject.next(data ?? []);
      },
      error: () => {
        // keep existing messages on error
      },
    });
  }

  loadUnreadCount(): void {
    this.http.get<any[]>(`${this.apiUrl}/chat/conversaciones`).subscribe({
      next: (data) => {
        const unread = (data ?? []).reduce((sum: number, c: any) => sum + (c.no_leidos || 0), 0);
        this.unreadCountSubject.next(unread);
      },
      error: () => {},
    });
  }

  sendMessage(convId: number, contenido: string): Observable<any> {
    // Optimistic update: show message immediately
    const tempMsg = {
      id: Date.now(),
      conversacion_id: convId,
      usuario_id: this.currentUserId,
      contenido,
      tipo_mensaje: 'texto',
      fecha_envio: new Date().toISOString(),
      leido: true,
      usuario_nombre: 'Yo',
    };
    const currentMsgs = this.messagesSubject.value;
    this.messagesSubject.next([...currentMsgs, tempMsg]);

    return this.http.post<any>(`${this.apiUrl}/chat/conversaciones/${convId}/mensajes`, { contenido }).pipe(
      tap(() => this.loadMessages(convId))
    );
  }

  private currentUserId = 0;
  setCurrentUserId(id: number): void { this.currentUserId = id; }

  uploadFile(convId: number, file: File, contenido?: string): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', file);
    if (contenido) {
      formData.append('contenido', contenido);
    }
    return this.http.post<any>(`${this.apiUrl}/chat/conversaciones/${convId}/archivo`, formData).pipe(
      tap(() => this.loadMessages(convId))
    );
  }

  createConversation(participanteIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chat/conversaciones`, {
      participante_ids: participanteIds,
      tipo: 'directo',
    });
  }

  setActiveConversation(conv: any): void {
    this.activeConversationSubject.next(conv);
  }

  startPolling(): void {
    this.stopPolling();
    this.pollInterval = setInterval(() => {
      const active = this.activeConversationSubject.getValue();
      if (active) {
        this.loadMessages(active.id);
      }
      this.loadUnreadCount();
    }, 3000);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  loadUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/chat/usuarios`);
  }
}
