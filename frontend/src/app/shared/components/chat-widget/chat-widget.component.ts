import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Button -->
    <button
      (click)="togglePanel()"
      class="fixed right-6 bottom-16 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl z-50 flex items-center justify-center transition-all hover:scale-110"
    >
      <svg *ngIf="!panelOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
      <svg *ngIf="panelOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
      <span
        *ngIf="unreadCount > 0 && !panelOpen"
        class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
      >{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>

    <!-- Chat Panel -->
    <div
      *ngIf="panelOpen"
      class="fixed right-6 bottom-32 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div class="px-4 py-3 flex items-center justify-between flex-shrink-0" style="background-color: #0a1f3d;">
        <div class="flex items-center gap-2">
          <button
            *ngIf="currentView === 'messages'"
            (click)="backToList()"
            class="text-white/70 hover:text-white"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h3 class="text-white font-semibold text-sm">
            {{ currentView === 'messages' ? activeConversation?.nombre : 'Chat Interno' }}
          </h3>
          <span *ngIf="currentView === 'messages' && activeConversation?.participantes_count" class="text-white/50 text-xs">
            {{ activeConversation.participantes_count }} participantes
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            *ngIf="currentView === 'list'"
            (click)="openNewConversation()"
            class="text-white/70 hover:text-white text-xs px-2 py-1 border border-white/20 rounded-lg"
          >Nueva</button>
          <button (click)="panelOpen = false" class="text-white/70 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Conversation List View -->
      <div *ngIf="currentView === 'list' && !showNewConversation" class="flex-1 flex flex-col overflow-hidden">
        <!-- Search -->
        <div class="px-3 py-2 border-b border-gray-100">
          <input
            [(ngModel)]="searchQuery"
            class="w-full px-3 py-2 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Buscar conversacion..."
          >
        </div>

        <!-- Loading -->
        <div *ngIf="loadingConversations" class="flex-1 flex items-center justify-center">
          <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        <!-- List -->
        <div *ngIf="!loadingConversations" class="flex-1 overflow-y-auto">
          <div
            *ngFor="let conv of filteredConversations"
            (click)="openConversation(conv)"
            class="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
          >
            <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
              [style.background-color]="getAvatarColor(conv.nombre)">
              {{ getInitials(conv.nombre) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900 truncate">{{ conv.nombre }}</span>
                <span class="text-xs text-gray-400 flex-shrink-0">{{ formatTime(conv.ultimo_mensaje_fecha) }}</span>
              </div>
              <p class="text-xs text-gray-500 truncate">{{ conv.ultimo_mensaje || 'Sin mensajes' }}</p>
            </div>
            <span
              *ngIf="conv.no_leidos > 0"
              class="w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0"
            >{{ conv.no_leidos }}</span>
          </div>
          <div *ngIf="filteredConversations.length === 0" class="flex-1 flex items-center justify-center p-6 text-sm text-gray-400">
            No hay conversaciones
          </div>
        </div>
      </div>

      <!-- New Conversation View -->
      <div *ngIf="currentView === 'list' && showNewConversation" class="flex-1 flex flex-col overflow-hidden">
        <div class="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
          <button (click)="showNewConversation = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <input
            [(ngModel)]="userSearchQuery"
            class="flex-1 px-3 py-2 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Buscar usuario..."
          >
        </div>
        <div *ngIf="loadingUsers" class="flex-1 flex items-center justify-center">
          <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <div *ngIf="!loadingUsers" class="flex-1 overflow-y-auto">
          <div
            *ngFor="let user of filteredUsers"
            (click)="startConversation(user)"
            class="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
          >
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              [style.background-color]="getAvatarColor(user.nombre)">
              {{ getInitials(user.nombre) }}
            </div>
            <div class="flex-1">
              <span class="text-sm font-medium text-gray-900">{{ user.nombre }}</span>
              <p class="text-xs text-gray-500">{{ user.rol || user.email }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages View -->
      <div *ngIf="currentView === 'messages'" class="flex-1 flex flex-col overflow-hidden">
        <!-- Messages -->
        <div #messagesContainer class="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          <div *ngIf="loadingMessages" class="flex items-center justify-center py-8">
            <div class="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <div *ngFor="let msg of messages">
            <!-- Own message -->
            <div *ngIf="isOwnMessage(msg)" class="flex justify-end">
              <div class="max-w-[75%]">
                <div class="bg-blue-600 text-white px-3 py-2 rounded-2xl rounded-br-md">
                  <!-- Image attachment -->
                  <img *ngIf="msg.archivo_url && isImage(msg.archivo_url)"
                    [src]="msg.archivo_url" (click)="openImage(msg.archivo_url)"
                    class="max-w-48 rounded-lg mb-1 cursor-pointer">
                  <!-- Document attachment -->
                  <a *ngIf="msg.archivo_url && !isImage(msg.archivo_url)"
                    [href]="msg.archivo_url" target="_blank"
                    class="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 mb-1 hover:bg-white/20">
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                    <div class="min-w-0">
                      <p class="text-xs font-medium truncate">{{ msg.archivo_nombre || 'Archivo' }}</p>
                      <p *ngIf="msg.archivo_size" class="text-xs opacity-70">{{ formatFileSize(msg.archivo_size) }}</p>
                    </div>
                  </a>
                  <p *ngIf="msg.contenido" class="text-sm">{{ msg.contenido }}</p>
                </div>
                <p class="text-xs text-gray-400 text-right mt-0.5">{{ formatMsgTime(msg.fecha_envio) }}</p>
              </div>
            </div>
            <!-- Other's message -->
            <div *ngIf="!isOwnMessage(msg)" class="flex justify-start">
              <div class="max-w-[75%]">
                <p class="text-xs text-gray-500 mb-0.5">{{ msg.usuario_nombre }}</p>
                <div class="bg-gray-100 text-gray-900 px-3 py-2 rounded-2xl rounded-bl-md">
                  <img *ngIf="msg.archivo_url && isImage(msg.archivo_url)"
                    [src]="msg.archivo_url" (click)="openImage(msg.archivo_url)"
                    class="max-w-48 rounded-lg mb-1 cursor-pointer">
                  <a *ngIf="msg.archivo_url && !isImage(msg.archivo_url)"
                    [href]="msg.archivo_url" target="_blank"
                    class="flex items-center gap-2 bg-black/5 rounded-lg px-3 py-2 mb-1 hover:bg-black/10">
                    <svg class="w-5 h-5 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                    <div class="min-w-0">
                      <p class="text-xs font-medium truncate">{{ msg.archivo_nombre || 'Archivo' }}</p>
                      <p *ngIf="msg.archivo_size" class="text-xs text-gray-400">{{ formatFileSize(msg.archivo_size) }}</p>
                    </div>
                  </a>
                  <p *ngIf="msg.contenido" class="text-sm">{{ msg.contenido }}</p>
                </div>
                <p class="text-xs text-gray-400 mt-0.5">{{ formatMsgTime(msg.fecha_envio) }}</p>
              </div>
            </div>
          </div>
          <div *ngIf="!loadingMessages && messages.length === 0" class="flex items-center justify-center py-8 text-sm text-gray-400">
            No hay mensajes aun
          </div>
        </div>

        <!-- Input Area -->
        <div class="px-3 py-2 border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
          <button (click)="fileInput.click()" class="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
          </button>
          <input
            #fileInput
            type="file"
            class="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            (change)="onFileSelected($event)"
          >
          <input
            [(ngModel)]="messageText"
            (keydown.enter)="sendMessage()"
            class="flex-1 px-3 py-2 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Escribe un mensaje..."
          >
          <button
            (click)="sendMessage()"
            [disabled]="!messageText.trim() && !selectedFile"
            class="text-blue-600 hover:text-blue-700 disabled:text-gray-300 flex-shrink-0"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Image Viewer -->
    <div *ngIf="viewingImage" (click)="viewingImage = ''" class="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center cursor-pointer">
      <img [src]="viewingImage" class="max-w-[90vw] max-h-[90vh] rounded-lg">
    </div>
  `,
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  panelOpen = false;
  currentView: 'list' | 'messages' = 'list';
  unreadCount = 0;

  // Conversations
  conversations: any[] = [];
  loadingConversations = false;
  searchQuery = '';

  // New conversation
  showNewConversation = false;
  users: any[] = [];
  loadingUsers = false;
  userSearchQuery = '';

  // Messages
  activeConversation: any = null;
  messages: any[] = [];
  loadingMessages = false;
  messageText = '';
  selectedFile: File | null = null;

  // Image viewer
  viewingImage = '';

  private currentUserId: number = 0;
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.id ?? 0;

    this.subscriptions.push(
      this.chatService.conversations$.subscribe((convs) => {
        this.conversations = convs;
        this.loadingConversations = false;
      }),
      this.chatService.messages$.subscribe((msgs) => {
        const hadMessages = this.messages.length > 0;
        this.messages = msgs;
        this.loadingMessages = false;
        if (hadMessages || msgs.length > 0) {
          this.scrollToBottom();
        }
      }),
      this.chatService.unreadCount$.subscribe((count) => {
        this.unreadCount = count;
      }),
      this.chatService.activeConversation$.subscribe((conv) => {
        this.activeConversation = conv;
      })
    );

    this.chatService.loadConversations();
    this.chatService.loadUnreadCount();
    this.chatService.startPolling();
  }

  ngOnDestroy(): void {
    this.chatService.stopPolling();
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
    if (this.panelOpen) {
      this.currentView = 'list';
      this.showNewConversation = false;
      this.loadingConversations = true;
      this.chatService.loadConversations();
    }
  }

  // --- Conversations ---

  get filteredConversations(): any[] {
    if (!this.searchQuery.trim()) return this.conversations;
    const q = this.searchQuery.toLowerCase();
    return this.conversations.filter((c: any) =>
      c.nombre?.toLowerCase().includes(q) || c.ultimo_mensaje?.toLowerCase().includes(q)
    );
  }

  openConversation(conv: any): void {
    this.chatService.setActiveConversation(conv);
    this.currentView = 'messages';
    this.messages = [];
    this.loadingMessages = true;
    this.chatService.loadMessages(conv.id);
  }

  backToList(): void {
    this.currentView = 'list';
    this.chatService.setActiveConversation(null);
    this.chatService.loadConversations();
  }

  // --- New Conversation ---

  openNewConversation(): void {
    this.showNewConversation = true;
    this.userSearchQuery = '';
    this.loadingUsers = true;
    this.chatService.loadUsers().subscribe({
      next: (data) => {
        this.users = data ?? [];
        this.loadingUsers = false;
      },
      error: () => {
        this.users = [];
        this.loadingUsers = false;
      },
    });
  }

  get filteredUsers(): any[] {
    if (!this.userSearchQuery.trim()) return this.users;
    const q = this.userSearchQuery.toLowerCase();
    return this.users.filter((u: any) => u.nombre?.toLowerCase().includes(q));
  }

  startConversation(user: any): void {
    this.chatService.createConversation([user.id]).subscribe({
      next: (conv) => {
        this.showNewConversation = false;
        this.chatService.loadConversations();
        this.openConversation(conv);
      },
      error: (err) => {
        if (err.status === 400 || err.status === 409) {
          this.chatService.loadConversations();
          setTimeout(() => {
            const existing = this.conversations.find((c: any) =>
              c.nombre === user.nombre
            );
            if (existing) {
              this.showNewConversation = false;
              this.openConversation(existing);
            }
          }, 500);
        }
      },
    });
  }

  // --- Messages ---

  sendMessage(): void {
    if (!this.messageText.trim() && !this.selectedFile) return;
    if (!this.activeConversation) return;

    if (this.selectedFile) {
      this.uploadFile();
      return;
    }

    const text = this.messageText.trim();
    this.messageText = '';
    this.chatService.sendMessage(this.activeConversation.id, text).subscribe({
      error: () => {},
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.uploadFile();
      input.value = '';
    }
  }

  private uploadFile(): void {
    if (!this.selectedFile || !this.activeConversation) return;
    const file = this.selectedFile;
    const text = this.messageText.trim() || undefined;
    this.messageText = '';
    this.selectedFile = null;
    this.chatService.uploadFile(this.activeConversation.id, file, text).subscribe({
      error: () => {},
    });
  }

  isOwnMessage(msg: any): boolean {
    return msg.usuario_id === this.currentUserId;
  }

  isImage(url: string): boolean {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
  }

  openImage(url: string): void {
    this.viewingImage = url;
  }

  // --- Helpers ---

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('es', { day: '2-digit', month: '2-digit' });
  }

  formatMsgTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
