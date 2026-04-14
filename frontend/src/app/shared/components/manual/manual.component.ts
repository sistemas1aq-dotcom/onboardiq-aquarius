import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ManualSection {
  id: string;
  icon: string;
  title: string;
  content: ContentBlock[];
}

interface ContentBlock {
  type: 'paragraph' | 'steps' | 'tip' | 'warning' | 'note' | 'subtitle' | 'screen';
  text?: string;
  items?: string[];
}

@Component({
  selector: 'app-manual',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Full-screen overlay -->
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-[60] bg-white flex flex-col"
    >
      <!-- Top bar -->
      <div class="h-14 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
        <div class="flex items-center gap-3">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          <h1 class="text-white font-semibold text-lg hidden sm:block">Manual de Usuario - OnboardIQ Aquarius</h1>
          <h1 class="text-white font-semibold text-base sm:hidden">Manual de Usuario</h1>
        </div>
        <button
          (click)="close.emit()"
          class="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar / TOC -->
        <aside
          class="w-72 border-r border-gray-200 bg-gray-50 flex-shrink-0 overflow-y-auto hidden md:flex flex-col"
        >
          <!-- Search -->
          <div class="p-3 border-b border-gray-200">
            <div class="relative">
              <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Buscar en el manual..."
                class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <!-- Nav items -->
          <nav class="flex-1 p-2 space-y-0.5">
            <button
              *ngFor="let section of filteredSections; let i = index"
              (click)="scrollToSection(section.id)"
              class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
              [ngClass]="activeSection === section.id ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
            >
              <span class="text-base flex-shrink-0" [innerHTML]="section.icon"></span>
              <span class="truncate">{{ section.title }}</span>
            </button>
          </nav>
        </aside>

        <!-- Mobile search bar -->
        <div class="md:hidden border-b border-gray-200 bg-white p-3 flex-shrink-0 absolute top-14 left-0 right-0 z-10">
          <div class="relative">
            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Buscar..."
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <!-- Content area -->
        <main class="flex-1 overflow-y-auto p-4 md:p-8 md:pt-8 pt-16" #contentArea>
          <div class="max-w-4xl mx-auto">
            <div *ngFor="let section of filteredSections" [id]="section.id" class="mb-12 scroll-mt-4">
              <!-- Section title -->
              <div class="flex items-center gap-3 mb-4 pb-3 border-b-2 border-blue-100">
                <span class="text-2xl" [innerHTML]="section.icon"></span>
                <h2 class="text-xl font-bold text-gray-800">{{ section.title }}</h2>
              </div>

              <!-- Content blocks -->
              <div *ngFor="let block of section.content" class="mb-3">
                <!-- Paragraph -->
                <p *ngIf="block.type === 'paragraph'" class="text-gray-600 leading-relaxed text-sm">{{ block.text }}</p>

                <!-- Subtitle -->
                <h3 *ngIf="block.type === 'subtitle'" class="text-base font-semibold text-gray-700 mt-5 mb-2 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  {{ block.text }}
                </h3>

                <!-- Steps -->
                <ol *ngIf="block.type === 'steps'" class="space-y-2 ml-1">
                  <li *ngFor="let item of block.items; let i = index" class="flex items-start gap-3 text-sm text-gray-600">
                    <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{{ i + 1 }}</span>
                    <span class="leading-relaxed">{{ item }}</span>
                  </li>
                </ol>

                <!-- Tip -->
                <div *ngIf="block.type === 'tip'" class="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                  <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                  <span class="text-green-800">{{ block.text }}</span>
                </div>

                <!-- Warning -->
                <div *ngIf="block.type === 'warning'" class="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <span class="text-amber-800">{{ block.text }}</span>
                </div>

                <!-- Note -->
                <div *ngIf="block.type === 'note'" class="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-blue-800">{{ block.text }}</span>
                </div>

                <!-- Screen placeholder -->
                <div *ngIf="block.type === 'screen'" class="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center my-3">
                  <svg class="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p class="text-xs text-gray-400 italic">{{ block.text }}</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="border-t border-gray-200 pt-6 pb-8 text-center">
              <p class="text-sm text-gray-400">OnboardIQ Aquarius - Manual de Usuario v2.0</p>
              <p class="text-xs text-gray-300 mt-1">Powered by Aquarius Consulting 2026</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class ManualComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  searchTerm = '';
  activeSection = 'introduccion';

  get filteredSections(): ManualSection[] {
    if (!this.searchTerm.trim()) return this.sections;
    const term = this.searchTerm.toLowerCase();
    return this.sections.filter(s =>
      s.title.toLowerCase().includes(term) ||
      s.content.some(b => b.text?.toLowerCase().includes(term) || b.items?.some(i => i.toLowerCase().includes(term)))
    );
  }

  scrollToSection(id: string): void {
    this.activeSection = id;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  sections: ManualSection[] = [
    // ===== 1. INTRODUCCION =====
    {
      id: 'introduccion',
      icon: '&#128218;',
      title: '1. Introduccion',
      content: [
        { type: 'subtitle', text: 'Que es OnboardIQ Aquarius' },
        { type: 'paragraph', text: 'OnboardIQ Aquarius es una plataforma integral de gestion de Recursos Humanos disenada para optimizar los procesos de reclutamiento, seleccion, onboarding y administracion de personal. Permite gestionar postulantes, evaluaciones de seleccion, legajos, capacitaciones, evaluaciones de desempeno, comunicaciones internas y mucho mas desde una unica interfaz web moderna y responsiva.' },
        { type: 'paragraph', text: 'La plataforma es una Progressive Web App (PWA), lo que significa que puede instalarse como aplicacion nativa en cualquier dispositivo desde el navegador. Ademas, cuenta con un diseno mobile-first con sidebar tipo drawer para una experiencia optima en dispositivos moviles.' },
        { type: 'subtitle', text: 'Arquitectura del sistema' },
        { type: 'paragraph', text: 'El sistema esta compuesto por tres capas principales:' },
        { type: 'steps', items: [
          'Frontend: Aplicacion Angular 18 con TailwindCSS. Interfaz responsiva para escritorio y dispositivos moviles. Desplegada en Vercel.',
          'Backend: API REST desarrollada en FastAPI (Python). Maneja la logica de negocio, autenticacion JWT, envio de correos via Brevo HTTP API e inteligencia artificial mediante Anthropic Claude API. Desplegada en Railway.',
          'Base de Datos: PostgreSQL alojada en Neon para almacenamiento relacional de toda la informacion del sistema.'
        ]},
        { type: 'subtitle', text: 'Roles de usuario' },
        { type: 'paragraph', text: 'El sistema maneja tres roles con diferentes niveles de acceso:' },
        { type: 'steps', items: [
          'Administrador (admin): Acceso completo a todos los modulos del panel administrativo y del portal. Puede gestionar usuarios, configuraciones, evaluaciones, postulantes, comunicaciones y toda la operacion del sistema.',
          'Trabajador: Accede al panel administrativo completo (dashboard, postulantes, seleccion, legajo, etc.) y tambien a las funcionalidades del portal (ficha personal, documentos, derechohabientes, capacitaciones, evaluaciones de desempeno y anuncios).',
          'Postulante: Accede unicamente al portal personal donde puede completar su ficha, responder evaluaciones de seleccion, subir documentos, ver entrevistas programadas y consultar anuncios.'
        ]},
        { type: 'tip', text: 'El rol determina automaticamente que menu lateral y que funcionalidades ve cada usuario al ingresar al sistema.' },
        { type: 'subtitle', text: 'Pagina de inicio' },
        { type: 'paragraph', text: 'Al acceder al sistema, la pagina de inicio (landing) presenta dos portales de acceso: "Portal Trabajadores" y "Portal Postulante". Cada uno lleva al login correspondiente con las funcionalidades apropiadas segun el perfil. En la parte superior se muestran dos badges de perfil: Trabajador y Postulante.' },
      ]
    },
    // ===== 2. INICIO DE SESION =====
    {
      id: 'login',
      icon: '&#128274;',
      title: '2. Inicio de Sesion',
      content: [
        { type: 'subtitle', text: 'Como ingresar al sistema' },
        { type: 'steps', items: [
          'Abra el navegador web y acceda a la URL del sistema proporcionada por su administrador.',
          'En la pagina de inicio, seleccione el portal correspondiente: "Portal Trabajadores" o "Portal Postulante".',
          'En la pantalla de inicio de sesion, ingrese su correo electronico en el campo "Email".',
          'Ingrese su contrasena en el campo "Contrasena".',
          'Haga clic en el boton "Iniciar Sesion".',
          'El sistema lo redirigira automaticamente al dashboard o portal correspondiente a su rol.'
        ]},
        { type: 'screen', text: 'Pagina de inicio con los dos portales y pantalla de login con campos de email y contrasena' },
        { type: 'subtitle', text: 'Verificacion de eventos al iniciar sesion' },
        { type: 'paragraph', text: 'Al iniciar sesion como administrador o trabajador, el sistema verifica automaticamente si hay cumpleanos de colaboradores o festividades programadas para el dia actual. Si los hay, se muestra un popup informativo con los datos relevantes antes de acceder al dashboard.' },
        { type: 'note', text: 'Esta verificacion asegura que no se pasen por alto fechas importantes como cumpleanos de equipo o festividades de la empresa.' },
        { type: 'subtitle', text: 'Recuperar contrasena' },
        { type: 'paragraph', text: 'Si olvido su contrasena, contacte al administrador del sistema para que le asigne una nueva desde el modulo de Admin Usuarios. El administrador puede cambiar la contrasena de cualquier usuario desde la edicion de su perfil.' },
        { type: 'subtitle', text: 'Primer ingreso' },
        { type: 'paragraph', text: 'Si fue registrado por carga masiva, su contrasena por defecto es: Aquarius2026. Se recomienda solicitar al administrador que la cambie en su primer acceso.' },
        { type: 'warning', text: 'Por seguridad, cambie su contrasena por defecto lo antes posible. Contacte al administrador si necesita una nueva clave.' },
        { type: 'subtitle', text: 'Instalar como aplicacion (PWA)' },
        { type: 'paragraph', text: 'OnboardIQ Aquarius es una Progressive Web App. Puede instalarla como aplicacion nativa desde su navegador: en Chrome, busque el icono de instalacion en la barra de direcciones o en el menu del navegador seleccione "Instalar aplicacion". La app se abrira en su propia ventana sin barra de navegador.' },
        { type: 'tip', text: 'Instalar la PWA le permite acceder mas rapido al sistema y recibir una experiencia similar a una aplicacion nativa en su escritorio o telefono.' },
      ]
    },
    // ===== 3. DASHBOARD =====
    {
      id: 'dashboard',
      icon: '&#128202;',
      title: '3. Dashboard',
      content: [
        { type: 'paragraph', text: 'El Dashboard es la pantalla principal que se muestra al iniciar sesion como Administrador o Trabajador. Proporciona una vision general del estado del sistema de reclutamiento y gestion de personal.' },
        { type: 'subtitle', text: 'KPIs y metricas' },
        { type: 'paragraph', text: 'En la parte superior se muestran tarjetas con indicadores clave (KPIs):' },
        { type: 'steps', items: [
          'Total de Postulantes: Numero total de postulantes registrados en el sistema.',
          'Evaluaciones Activas: Cantidad de evaluaciones de seleccion que estan actualmente en curso.',
          'Tasa de Aprobacion: Porcentaje de postulantes que han sido aprobados en el proceso.',
          'Postulantes Nuevos (mensual): Cantidad de postulantes registrados en el mes actual.'
        ]},
        { type: 'subtitle', text: 'Graficos' },
        { type: 'paragraph', text: 'El dashboard incluye visualizaciones graficas como graficos de anillo mostrando la distribucion de postulantes por estado (aprobado, pendiente, rechazado) y graficos de tendencia mensual.' },
        { type: 'screen', text: 'Dashboard con tarjetas KPI en la parte superior, graficos de anillo y barras en la zona central' },
        { type: 'subtitle', text: 'Actividad reciente' },
        { type: 'paragraph', text: 'En la parte inferior se muestra un listado con las ultimas acciones realizadas en el sistema: nuevos postulantes, evaluaciones completadas, aprobaciones, etc.' },
        { type: 'tip', text: 'Los KPIs se actualizan en tiempo real cada vez que ingresa al Dashboard.' },
      ]
    },
    // ===== 4. GESTION DE POSTULANTES =====
    {
      id: 'postulantes',
      icon: '&#128101;',
      title: '4. Gestion de Postulantes',
      content: [
        { type: 'paragraph', text: 'Este modulo permite administrar todo el ciclo de vida de los postulantes, desde su registro hasta su aprobacion o rechazo. Accesible desde "Gestion Postulantes" en el menu lateral.' },
        { type: 'subtitle', text: 'Crear nuevo postulante' },
        { type: 'steps', items: [
          'Navegue a "Gestion Postulantes" en el menu lateral.',
          'Haga clic en el boton "Nuevo Postulante".',
          'Complete el formulario con los datos requeridos: Nombres, Apellido Paterno, Apellido Materno, Email, DNI y Telefono.',
          'Seleccione el Area del combo desplegable (listado de areas configuradas en Maestros).',
          'Seleccione el Cargo del combo desplegable (filtrado automaticamente segun el area elegida). La combinacion de Area + Cargo define el puesto al que postula.',
          'Haga clic en "Guardar" para registrar al postulante.',
          'El sistema creara automaticamente un usuario con rol "postulante" y enviara las credenciales por correo electronico.'
        ]},
        { type: 'note', text: 'El campo de Cargo se filtra automaticamente segun el Area seleccionada. Solo se muestran los cargos vinculados a esa area.' },
        { type: 'tip', text: 'Tambien puede registrar postulantes masivamente usando el modulo de Carga Masiva (ver seccion 12).' },
        { type: 'subtitle', text: 'Ver detalle del postulante' },
        { type: 'paragraph', text: 'Haga clic en el nombre de cualquier postulante en la tabla para abrir su ficha detallada. Aqui podra ver toda su informacion personal, documentos subidos, evaluaciones asignadas y estado actual en el proceso.' },
        { type: 'subtitle', text: 'Aprobar o Rechazar postulante' },
        { type: 'steps', items: [
          'Acceda al detalle del postulante.',
          'Revise toda su informacion, documentos y resultados de evaluaciones.',
          'Haga clic en el boton "Aprobar" (verde) o "Rechazar" (rojo) segun corresponda.',
          'Confirme la accion en el dialogo de confirmacion.',
          'El estado del postulante se actualizara y se registrara en el log de auditoria.'
        ]},
        { type: 'subtitle', text: 'Ver legajo' },
        { type: 'paragraph', text: 'Desde el detalle del postulante puede acceder a su legajo completo haciendo clic en "Ver Legajo". Esto lo llevara al modulo de Legajo Trabajador con todas las pestanas de informacion.' },
        { type: 'subtitle', text: 'Filtros y busqueda' },
        { type: 'paragraph', text: 'La tabla de postulantes incluye un campo de busqueda para filtrar por nombre o email, y filtros por estado (pendiente, aprobado, rechazado). Use estos filtros para encontrar rapidamente al postulante que busca.' },
        { type: 'screen', text: 'Tabla de postulantes con filtros de busqueda y estado, columnas de nombre, email, cargo, estado y acciones' },
      ]
    },
    // ===== 5. SELECCION =====
    {
      id: 'seleccion',
      icon: '&#128221;',
      title: '5. Seleccion',
      content: [
        { type: 'paragraph', text: 'El modulo de Seleccion (anteriormente llamado Evaluaciones) permite crear cuestionarios de seleccion, asignarlos a postulantes, configurar cadenas de aprobadores y gestionar flujos de aprobacion.' },
        { type: 'subtitle', text: 'Crear evaluacion de seleccion' },
        { type: 'steps', items: [
          'Navegue a "Seleccion" en el menu lateral.',
          'Haga clic en "Nueva Evaluacion".',
          'Ingrese el titulo, descripcion y configure los parametros de la evaluacion.',
          'Guarde la evaluacion para comenzar a agregar preguntas.'
        ]},
        { type: 'subtitle', text: 'Agregar preguntas' },
        { type: 'steps', items: [
          'Dentro del detalle de la evaluacion, vaya a la seccion de preguntas.',
          'Haga clic en "Agregar Pregunta".',
          'Seleccione el tipo de pregunta: opcion multiple, verdadero/falso, respuesta abierta, etc.',
          'Ingrese el enunciado de la pregunta y las opciones de respuesta si aplica.',
          'Asigne un puntaje a cada opcion correcta.',
          'Repita para todas las preguntas necesarias.'
        ]},
        { type: 'subtitle', text: 'Asignar a postulantes' },
        { type: 'steps', items: [
          'En el detalle de la evaluacion, vaya a la seccion "Postulantes".',
          'Haga clic en "Asignar Postulantes".',
          'Seleccione los postulantes de la lista y confirme la asignacion.',
          'Los postulantes seleccionados recibiran una notificacion por correo electronico con instrucciones para responder la evaluacion.'
        ]},
        { type: 'note', text: 'Los postulantes asignados veran la evaluacion disponible en su portal personal, seccion "Seleccion".' },
        { type: 'subtitle', text: 'Configurar cadena de aprobadores' },
        { type: 'paragraph', text: 'Desde el detalle de la evaluacion puede configurar un flujo de aprobacion con multiples niveles. Haga clic en "Configurar Aprobadores" y defina los niveles de aprobacion (Nivel 1, Nivel 2, etc.). Asigne usuarios con rol admin o trabajador a cada nivel. Las aprobaciones se ejecutan en orden secuencial: el nivel 1 debe aprobar antes de que pase al nivel 2.' },
        { type: 'subtitle', text: 'Ver detalle con puntajes' },
        { type: 'paragraph', text: 'En el detalle de cada evaluacion puede ver la lista de postulantes asignados con su estado (pendiente, completada) y el puntaje obtenido. Puede hacer clic en cada postulante para ver sus respuestas individuales.' },
        { type: 'subtitle', text: 'Flujo de aprobacion' },
        { type: 'steps', items: [
          'Cuando un postulante completa la evaluacion, esta pasa al primer nivel de aprobacion configurado.',
          'El aprobador de nivel 1 recibe notificacion y puede aprobar o rechazar directamente dentro del detalle de la evaluacion.',
          'Si aprueba, la evaluacion pasa automaticamente al siguiente nivel (si existe).',
          'El proceso continua hasta completar todos los niveles de la cadena.',
          'Los aprobadores pueden acceder rapidamente a sus pendientes desde el modulo "Mis Aprobaciones" (ver seccion 15).'
        ]},
        { type: 'screen', text: 'Detalle de evaluacion mostrando preguntas, postulantes asignados con puntajes y panel de aprobadores' },
        { type: 'tip', text: 'Configure los aprobadores antes de asignar postulantes para asegurar que el flujo funcione correctamente desde el inicio.' },
      ]
    },
    // ===== 6. LEGAJO =====
    {
      id: 'legajo',
      icon: '&#128451;',
      title: '6. Legajo del Trabajador',
      content: [
        { type: 'paragraph', text: 'El Legajo es el expediente digital completo de cada trabajador o postulante. Contiene toda la informacion organizada en pestanas, accesible desde "Legajo Trabajador" en el menu lateral.' },
        { type: 'subtitle', text: 'Buscar trabajador' },
        { type: 'steps', items: [
          'Navegue a "Legajo Trabajador" en el menu lateral.',
          'Use el campo de busqueda para encontrar al trabajador por nombre, apellido o documento.',
          'Haga clic en el trabajador para abrir su legajo completo.'
        ]},
        { type: 'subtitle', text: 'Pestanas del legajo' },
        { type: 'paragraph', text: 'El legajo esta organizado en las siguientes pestanas (las mismas 8 de Mi Ficha):' },
        { type: 'steps', items: [
          'Datos Personales: Informacion basica del trabajador (nombres, apellido paterno, apellido materno, DNI, fecha de nacimiento, genero, estado civil, direccion, telefono, email).',
          'Formacion: Nivel educativo, institucion, carrera, fecha de inicio y fin.',
          'Experiencia Laboral: Empresas anteriores, cargo, funciones, periodo de trabajo.',
          'Idiomas y Habilidades: Idiomas que maneja con su nivel de competencia, y habilidades tecnicas y blandas.',
          'Referencias: Personas de contacto que pueden dar referencias laborales o personales.',
          'Expectativas: Disponibilidad, expectativa salarial, modalidad de trabajo preferida y otra informacion complementaria.',
          'Datos Bancarios: Informacion bancaria para nomina (entidad, numero de cuenta, CCI).',
          'Regimen Pensionario: Informacion del regimen de pensiones (ONP, AFP, etc.).'
        ]},
        { type: 'screen', text: 'Vista del legajo con pestanas superiores y datos del trabajador seleccionado' },
        { type: 'tip', text: 'Puede navegar entre pestanas sin perder la informacion. Los cambios se guardan individualmente en cada seccion al hacer clic en Guardar.' },
        { type: 'note', text: 'La pestana de Salud ha sido removida del sistema. Los datos de salud ya no se recopilan en la ficha.' },
      ]
    },
    // ===== 7. EMBUDO DE SELECCION =====
    {
      id: 'embudo',
      icon: '&#127987;',
      title: '7. Embudo de Seleccion',
      content: [
        { type: 'paragraph', text: 'El Embudo de Seleccion (funnel) proporciona una visualizacion grafica del proceso de reclutamiento, mostrando cuantos candidatos hay en cada etapa del proceso.' },
        { type: 'subtitle', text: 'Visualizacion del funnel' },
        { type: 'paragraph', text: 'El embudo muestra las etapas del proceso de seleccion de arriba a abajo: Postulantes totales, En evaluacion, Evaluados, Aprobados, Contratados. Cada nivel muestra la cantidad de candidatos y el porcentaje respecto al nivel anterior.' },
        { type: 'screen', text: 'Embudo de seleccion con 5 niveles de colores progresivos mostrando la cantidad de candidatos en cada etapa' },
        { type: 'subtitle', text: 'Tasas de conversion' },
        { type: 'paragraph', text: 'Junto al embudo se muestran las tasas de conversion entre cada etapa. Estas metricas ayudan a identificar cuellos de botella en el proceso de seleccion y optimizar las estrategias de reclutamiento.' },
        { type: 'tip', text: 'Si una tasa de conversion es muy baja entre dos etapas, revise los criterios de evaluacion o los requisitos del puesto para optimizar el proceso.' },
      ]
    },
    // ===== 8. IA INSIGHTS =====
    {
      id: 'ia-insights',
      icon: '&#129302;',
      title: '8. IA Insights',
      content: [
        { type: 'paragraph', text: 'Este modulo aprovecha la inteligencia artificial (Anthropic Claude API) para analizar candidatos, calcular scoring automatico y proporcionar asistencia mediante chat con IA.' },
        { type: 'subtitle', text: 'Analizar CV' },
        { type: 'steps', items: [
          'Navegue a "IA Insights" en el menu lateral.',
          'Seleccione la opcion "Analizar CV".',
          'Suba el archivo PDF del curriculum del candidato.',
          'La IA procesara el documento y extraera informacion relevante: experiencia, habilidades, educacion.',
          'Revise el resumen generado y las recomendaciones.'
        ]},
        { type: 'subtitle', text: 'Calcular Scoring' },
        { type: 'paragraph', text: 'El scoring automatico evalua a los candidatos basandose en multiples criterios como experiencia relevante, habilidades requeridas, formacion academica y resultados de evaluaciones. El sistema genera un puntaje de 0 a 100 para cada candidato.' },
        { type: 'subtitle', text: 'Chat con IA' },
        { type: 'steps', items: [
          'Acceda a la seccion de Chat con IA.',
          'Escriba su consulta en lenguaje natural. Por ejemplo: "Cual es el mejor candidato para el puesto de Desarrollador?".',
          'La IA analizara los datos disponibles y proporcionara una respuesta fundamentada.',
          'Puede hacer preguntas de seguimiento para profundizar en el analisis.'
        ]},
        { type: 'tip', text: 'La IA utiliza toda la informacion disponible en el sistema para generar sus analisis. Cuanto mas datos tenga cargados, mejores seran las recomendaciones.' },
        { type: 'screen', text: 'Interfaz de IA Insights con panel de analisis de CV a la izquierda y chat con IA a la derecha' },
      ]
    },
    // ===== 9. ADMINISTRACION DE USUARIOS =====
    {
      id: 'usuarios',
      icon: '&#128100;',
      title: '9. Admin Usuarios',
      content: [
        { type: 'paragraph', text: 'Este modulo permite gestionar los usuarios del sistema: crear, editar, asignar roles, areas, cargos y controlar el acceso. Accesible desde "Admin Usuarios" en el menu lateral.' },
        { type: 'subtitle', text: 'Crear usuario' },
        { type: 'steps', items: [
          'Navegue a "Admin Usuarios" en el menu lateral.',
          'Haga clic en "Nuevo Usuario".',
          'Complete los campos: Nombres, Apellido Paterno, Apellido Materno, Email, DNI, Telefono.',
          'Seleccione el rol: admin, trabajador o postulante.',
          'Seleccione un Area y un Cargo (el cargo se filtra por area seleccionada).',
          'Defina una contrasena inicial.',
          'Haga clic en "Guardar" para crear el usuario.'
        ]},
        { type: 'note', text: 'El sistema maneja tres roles: admin, trabajador y postulante. No existe el rol de evaluador.' },
        { type: 'subtitle', text: 'Editar usuario (incluye cambiar contrasena)' },
        { type: 'steps', items: [
          'En la lista de usuarios, haga clic en el boton de edicion del usuario deseado.',
          'Modifique los campos necesarios: nombre, email, rol, area, cargo.',
          'Para cambiar la contrasena, ingrese la nueva contrasena en el campo correspondiente.',
          'Haga clic en "Actualizar" para guardar los cambios.'
        ]},
        { type: 'warning', text: 'Al cambiar la contrasena de un usuario, este debera usar la nueva clave en su proximo inicio de sesion. Comunique el cambio al usuario.' },
        { type: 'subtitle', text: 'Asignar area y cargo' },
        { type: 'paragraph', text: 'Cada usuario puede tener asignada un area (departamento) y un cargo (puesto). Estos se seleccionan de los catalogos configurados en el modulo de Maestros. El area y cargo determinan ciertos filtros automaticos en el sistema.' },
        { type: 'subtitle', text: 'Activar/Desactivar usuario' },
        { type: 'paragraph', text: 'Para desactivar un usuario sin eliminarlo, use el boton de activar/desactivar en la lista de usuarios. Los usuarios desactivados no podran iniciar sesion pero se conserva toda su informacion.' },
        { type: 'screen', text: 'Tabla de usuarios con columnas: nombre, email, rol, area, cargo, estado y botones de accion' },
      ]
    },
    // ===== 10. SEGURIDAD Y AUDITORIA =====
    {
      id: 'seguridad',
      icon: '&#128737;',
      title: '10. Seguridad y Auditoria',
      content: [
        { type: 'paragraph', text: 'El modulo de Seguridad registra automaticamente todas las acciones realizadas en el sistema, proporcionando un log de auditoria completo para control y trazabilidad.' },
        { type: 'subtitle', text: 'Log de auditoria' },
        { type: 'paragraph', text: 'El log registra: inicio de sesion de usuarios, creacion/edicion/eliminacion de registros, cambios de estado de postulantes, asignacion de evaluaciones, aprobaciones/rechazos y cualquier otra operacion relevante. Cada registro incluye: fecha y hora, usuario que realizo la accion, tipo de accion, y detalle descriptivo.' },
        { type: 'subtitle', text: 'Filtros' },
        { type: 'steps', items: [
          'Navegue a "Seguridad" en el menu lateral.',
          'Use el campo de busqueda para filtrar por usuario o tipo de accion.',
          'Puede filtrar por rango de fechas para acotar los resultados.',
          'Los resultados se muestran en orden cronologico (mas recientes primero).'
        ]},
        { type: 'screen', text: 'Tabla de auditoria con columnas: fecha, usuario, accion, detalle y filtros superiores' },
        { type: 'note', text: 'El log de auditoria es de solo lectura. Los registros no pueden ser modificados ni eliminados para garantizar la integridad del historial.' },
      ]
    },
    // ===== 11. CONFIGURACION =====
    {
      id: 'configuracion',
      icon: '&#9881;',
      title: '11. Configuracion',
      content: [
        { type: 'paragraph', text: 'El modulo de Configuracion permite ajustar los parametros generales del sistema. Solo accesible para administradores.' },
        { type: 'subtitle', text: 'Parametros del sistema' },
        { type: 'paragraph', text: 'Desde esta seccion puede configurar aspectos como: nombre de la empresa, logo, parametros de correo electronico, limites de carga de archivos, y otros valores que afectan el comportamiento general de la plataforma.' },
        { type: 'steps', items: [
          'Navegue a "Configuracion" en el menu lateral.',
          'Modifique los parametros deseados en el formulario.',
          'Haga clic en "Guardar Cambios" para aplicar la nueva configuracion.'
        ]},
        { type: 'warning', text: 'Los cambios en la configuracion afectan a todos los usuarios del sistema. Realice modificaciones con precaucion.' },
      ]
    },
    // ===== 12. CARGA MASIVA =====
    {
      id: 'carga-masiva',
      icon: '&#128228;',
      title: '12. Carga Masiva',
      content: [
        { type: 'paragraph', text: 'La Carga Masiva permite registrar multiples postulantes de una sola vez mediante un archivo Excel (.xlsx).' },
        { type: 'subtitle', text: 'Formato del archivo Excel' },
        { type: 'paragraph', text: 'El archivo Excel debe contener las siguientes columnas obligatorias:' },
        { type: 'steps', items: [
          'nombre: Nombres del postulante.',
          'apellido_paterno: Apellido paterno del postulante.',
          'apellido_materno: Apellido materno del postulante.',
          'dni: Documento Nacional de Identidad.',
          'email: Correo electronico (debe ser unico en el sistema).',
          'area: Nombre del area (debe coincidir con un area existente en Maestros).',
          'cargo: Nombre del cargo (debe coincidir con un cargo existente vinculado al area).',
          'telefono: Numero de telefono de contacto.'
        ]},
        { type: 'subtitle', text: 'Descargar plantilla' },
        { type: 'steps', items: [
          'Navegue a "Carga Masiva" en el menu lateral.',
          'Haga clic en "Descargar Plantilla".',
          'Se descargara un archivo Excel (.xlsx) con las columnas correctas y formato esperado.',
          'Complete la plantilla con los datos de los postulantes.'
        ]},
        { type: 'subtitle', text: 'Subir archivo' },
        { type: 'steps', items: [
          'Una vez completada la plantilla, haga clic en "Subir Archivo" o arrastre el archivo al area de carga.',
          'El sistema validara el formato y los datos del archivo.',
          'Se mostrara una vista previa con los registros a importar y cualquier error encontrado.',
          'Corrija los errores si los hay y vuelva a subir, o confirme la importacion.',
          'Los registros se crearan en el sistema y se generaran las cuentas de usuario correspondientes con rol postulante.'
        ]},
        { type: 'subtitle', text: 'Contrasena por defecto' },
        { type: 'paragraph', text: 'Los usuarios creados por carga masiva reciben la contrasena por defecto: Aquarius2026. Se recomienda que el administrador comunique esto a los postulantes para que cambien su clave despues del primer ingreso.' },
        { type: 'warning', text: 'Asegurese de que los correos electronicos sean unicos y validos. El sistema rechazara registros con emails duplicados. Los nombres de area y cargo deben coincidir exactamente con los configurados en Maestros.' },
        { type: 'screen', text: 'Pantalla de carga masiva con area de drag & drop, boton de descarga de plantilla y tabla de vista previa' },
      ]
    },
    // ===== 13. COMUNICACIONES =====
    {
      id: 'comunicaciones',
      icon: '&#128231;',
      title: '13. Comunicaciones',
      content: [
        { type: 'paragraph', text: 'El modulo de Comunicaciones es un centro unificado que agrupa cuatro funcionalidades: Anuncios, Cumpleanos, Festividades e Historial de correos enviados. Se accede desde "Comunicaciones" en el menu lateral.' },
        { type: 'subtitle', text: 'Pestana: Anuncios' },
        { type: 'paragraph', text: 'Permite crear, editar y eliminar anuncios para comunicar informacion importante a los usuarios del sistema.' },
        { type: 'steps', items: [
          'Dentro de Comunicaciones, seleccione la pestana "Anuncios".',
          'Haga clic en "Nuevo Anuncio".',
          'Ingrese el titulo, contenido del anuncio y seleccione el tipo (informativo, urgente, evento, etc.).',
          'Haga clic en "Guardar" para crear el anuncio.',
          'Opcionalmente, puede enviar el anuncio por correo electronico haciendo clic en el boton de envio por email.'
        ]},
        { type: 'note', text: 'Los anuncios son visibles para los postulantes y trabajadores en la seccion "Anuncios" de sus respectivos portales.' },
        { type: 'subtitle', text: 'Pestana: Cumpleanos' },
        { type: 'paragraph', text: 'Muestra los cumpleanos de los colaboradores. El sistema detecta automaticamente los cumpleanos basandose en la fecha de nacimiento registrada en la ficha de cada usuario. Se puede enviar correos de felicitacion utilizando la plantilla de email de cumpleanos configurada.' },
        { type: 'subtitle', text: 'Pestana: Festividades' },
        { type: 'paragraph', text: 'Configure las festividades y fechas especiales que desea celebrar en la organizacion. El sistema puede enviar correos automaticos en estas fechas a los colaboradores utilizando la plantilla de email de festividad configurada.' },
        { type: 'subtitle', text: 'Pestana: Historial' },
        { type: 'paragraph', text: 'Consulte el historial completo de correos enviados por el sistema. Puede filtrar por fecha, tipo, destinatario y estado de envio (enviado, fallido). Esto incluye correos de credenciales, anuncios, cumpleanos, festividades, etc.' },
        { type: 'screen', text: 'Pantalla de Comunicaciones con las 4 pestanas: Anuncios, Cumpleanos, Festividades e Historial' },
        { type: 'tip', text: 'Asegurese de que los datos de nacimiento de los trabajadores esten completos en su ficha para aprovechar la funcion de cumpleanos automaticos.' },
      ]
    },
    // ===== 14. PLANTILLAS EMAIL =====
    {
      id: 'plantillas-email',
      icon: '&#128233;',
      title: '14. Plantillas Email',
      content: [
        { type: 'paragraph', text: 'El modulo de Plantillas Email permite personalizar las plantillas HTML que el sistema utiliza para enviar correos electronicos automaticos. Accesible desde "Plantillas Email" en el menu lateral.' },
        { type: 'subtitle', text: 'Tipos de plantillas disponibles' },
        { type: 'paragraph', text: 'El sistema incluye plantillas para los siguientes tipos de correo:' },
        { type: 'steps', items: [
          'Credenciales: Correo enviado cuando se crea un nuevo usuario con sus datos de acceso (email y contrasena).',
          'Bienvenida: Correo de bienvenida a la organizacion para nuevos trabajadores.',
          'Cesado: Correo enviado cuando un colaborador deja la organizacion.',
          'Cumpleanos: Felicitacion automatica por cumpleanos del colaborador.',
          'Festividad: Correo enviado en fechas festivas configuradas.',
          'Anuncio: Plantilla utilizada al enviar anuncios por email desde el modulo de Comunicaciones.'
        ]},
        { type: 'subtitle', text: 'Editar una plantilla' },
        { type: 'steps', items: [
          'Navegue a "Plantillas Email" en el menu lateral.',
          'Seleccione la plantilla que desea editar de la lista.',
          'Utilice el editor HTML integrado para modificar el contenido, estilos y estructura del correo.',
          'Puede usar variables dinamicas (como nombre del usuario, nombre de la empresa, etc.) que se reemplazaran automaticamente al enviar.',
          'Haga clic en "Guardar" para aplicar los cambios.'
        ]},
        { type: 'tip', text: 'Previsualice la plantilla antes de guardar para asegurarse de que el formato y contenido sean los deseados.' },
        { type: 'warning', text: 'Modifique las plantillas con cuidado. Un error en el HTML puede causar que los correos se muestren incorrectamente a los destinatarios.' },
        { type: 'screen', text: 'Editor de plantillas de email con lista de plantillas a la izquierda y editor HTML a la derecha' },
        { type: 'note', text: 'Los correos se envian a traves de Brevo HTTP API. Asegurese de que la configuracion de correo este activa.' },
      ]
    },
    // ===== 15. MIS APROBACIONES =====
    {
      id: 'mis-aprobaciones',
      icon: '&#9989;',
      title: '15. Mis Aprobaciones',
      content: [
        { type: 'paragraph', text: 'El modulo "Mis Aprobaciones" proporciona un acceso rapido y centralizado a todas las evaluaciones de seleccion que estan pendientes de aprobacion por el usuario actual.' },
        { type: 'subtitle', text: 'Como funciona' },
        { type: 'steps', items: [
          'Navegue a "Mis Aprobaciones" en el menu lateral.',
          'Vera una lista de todas las evaluaciones de seleccion donde usted es aprobador en algun nivel y hay respuestas pendientes de su revision.',
          'Haga clic en una evaluacion para acceder a su detalle.',
          'Dentro del detalle, revise las respuestas y puntajes de los postulantes.',
          'Apruebe o rechace segun corresponda. La evaluacion avanzara al siguiente nivel si es aprobada.'
        ]},
        { type: 'note', text: 'Solo aparecen las evaluaciones donde usted ha sido configurado como aprobador en la cadena de aprobacion del modulo de Seleccion.' },
        { type: 'tip', text: 'Revise frecuentemente este modulo para no retrasar los procesos de seleccion. Las evaluaciones pendientes esperan su accion para avanzar.' },
        { type: 'screen', text: 'Lista de evaluaciones pendientes de aprobacion con estado, fecha y boton de acceso al detalle' },
      ]
    },
    // ===== 16. CAPACITACIONES =====
    {
      id: 'capacitaciones',
      icon: '&#127891;',
      title: '16. Capacitaciones',
      content: [
        { type: 'paragraph', text: 'El modulo de Capacitaciones permite crear cursos, asignarlos a trabajadores y hacer seguimiento de su progreso. Accesible desde "Capacitaciones" en el menu lateral.' },
        { type: 'subtitle', text: 'Crear capacitacion (admin/trabajador panel)' },
        { type: 'steps', items: [
          'Navegue a "Capacitaciones" en el menu lateral.',
          'Haga clic en "Nueva Capacitacion".',
          'Complete los datos: titulo, descripcion, duracion, tipo y contenido.',
          'Agregue materiales de apoyo si es necesario (archivos, links).',
          'Guarde la capacitacion.'
        ]},
        { type: 'subtitle', text: 'Asignar a trabajadores' },
        { type: 'steps', items: [
          'En el detalle de la capacitacion, vaya a la seccion de asignacion.',
          'Seleccione los trabajadores que deben completar la capacitacion.',
          'Confirme la asignacion. Los trabajadores recibiran notificacion.'
        ]},
        { type: 'subtitle', text: 'Ver progreso' },
        { type: 'paragraph', text: 'En el listado de capacitaciones puede ver el porcentaje de avance general. Dentro del detalle, puede ver el estado individual de cada trabajador asignado: pendiente, en progreso o completada.' },
        { type: 'subtitle', text: 'Vista del portal del trabajador' },
        { type: 'paragraph', text: 'Los trabajadores ven sus capacitaciones desde el portal. Por defecto se muestran solo las capacitaciones pendientes. Un toggle permite alternar para ver tambien las completadas. Las capacitaciones se presentan en un formato simplificado de solo lectura.' },
        { type: 'screen', text: 'Lista de capacitaciones con barra de progreso y detalle mostrando trabajadores asignados con su estado' },
        { type: 'tip', text: 'Use las capacitaciones para el proceso de onboarding de nuevos trabajadores, asignando cursos de induccion de forma sistematica.' },
      ]
    },
    // ===== 17. EVALUACION DE DESEMPENO =====
    {
      id: 'eval-desempeno',
      icon: '&#11088;',
      title: '17. Evaluacion de Desempeno',
      content: [
        { type: 'paragraph', text: 'Este modulo permite crear evaluaciones de desempeno para trabajadores activos, con 7 criterios predefinidos y calificacion por estrellas. Accesible desde "Eval. Desempeno" en el menu lateral.' },
        { type: 'subtitle', text: 'Crear evaluacion de desempeno' },
        { type: 'steps', items: [
          'Navegue a "Eval. Desempeno" en el menu lateral.',
          'Haga clic en "Nueva Evaluacion".',
          'Seleccione el trabajador a evaluar.',
          'Defina el periodo de evaluacion.',
          'El sistema presentara los 7 criterios de evaluacion predefinidos.'
        ]},
        { type: 'subtitle', text: 'Criterios y puntajes (estrellas)' },
        { type: 'paragraph', text: 'Cada evaluacion incluye 7 criterios que se califican usando un sistema de estrellas de 1 a 5. El puntaje total se calcula automaticamente como el promedio de todos los criterios. Los criterios incluyen aspectos como cumplimiento de objetivos, trabajo en equipo, comunicacion, liderazgo, puntualidad, calidad del trabajo, entre otros.' },
        { type: 'subtitle', text: 'Puntaje auto-calculado' },
        { type: 'paragraph', text: 'A medida que califica cada criterio con estrellas, el sistema calcula automaticamente el puntaje total promedio. No necesita realizar calculos manuales.' },
        { type: 'subtitle', text: 'Estados de la evaluacion' },
        { type: 'steps', items: [
          'Borrador: La evaluacion esta en proceso de creacion. Puede editarse libremente.',
          'Enviada: La evaluacion ha sido enviada y esta pendiente de revision.',
          'Completada: La evaluacion ha sido finalizada. Los resultados son visibles en el legajo del trabajador.'
        ]},
        { type: 'subtitle', text: 'Vista del portal del trabajador' },
        { type: 'paragraph', text: 'Los trabajadores pueden ver sus evaluaciones de desempeno desde el portal en modo solo lectura. Pueden consultar los puntajes obtenidos en cada criterio y el promedio general, pero no pueden modificarlos.' },
        { type: 'screen', text: 'Formulario de evaluacion de desempeno con 7 criterios y estrellas de calificacion (1-5)' },
        { type: 'tip', text: 'Las evaluaciones de desempeno completadas se reflejan automaticamente en el legajo del trabajador y pueden consultarse en cualquier momento.' },
      ]
    },
    // ===== 18. MAESTROS =====
    {
      id: 'maestros',
      icon: '&#128736;',
      title: '18. Maestros (Areas y Cargos)',
      content: [
        { type: 'paragraph', text: 'El modulo de Maestros permite administrar los catalogos base del sistema: Areas y Cargos. Estos catalogos se utilizan en todo el sistema para clasificar usuarios, postulantes y procesos. Se accede desde "Maestros > Areas" y "Maestros > Cargos" en el menu lateral.' },
        { type: 'subtitle', text: 'Areas' },
        { type: 'paragraph', text: 'Las areas representan los departamentos de la organizacion. El sistema viene con 15 areas predeterminadas que pueden editarse o complementarse.' },
        { type: 'steps', items: [
          'Navegue a "Maestros > Areas" en el menu lateral.',
          'Para crear un area nueva, haga clic en "Nueva Area" e ingrese el nombre.',
          'Para editar, haga clic en el icono de edicion junto al area deseada.',
          'Para eliminar, haga clic en el icono de eliminacion. Solo se puede eliminar si no tiene cargos ni usuarios asociados.'
        ]},
        { type: 'subtitle', text: 'Cargos' },
        { type: 'paragraph', text: 'Los cargos representan los puestos de trabajo dentro de cada area. El sistema viene con 36 cargos predeterminados vinculados a las areas.' },
        { type: 'steps', items: [
          'Navegue a "Maestros > Cargos" en el menu lateral.',
          'Los cargos estan vinculados a un area. Al crear un cargo, debe seleccionar a que area pertenece.',
          'Para crear un cargo nuevo, haga clic en "Nuevo Cargo", seleccione el area y escriba el nombre del cargo.',
          'Para editar o eliminar, use los iconos de accion correspondientes.'
        ]},
        { type: 'note', text: 'Los cambios en Areas y Cargos se reflejan inmediatamente en los formularios de creacion de usuarios y postulantes. Los combos de cargo se filtran automaticamente segun el area seleccionada.' },
        { type: 'warning', text: 'No elimine areas o cargos que tengan usuarios o postulantes asociados. Reasigne primero a los usuarios antes de eliminar.' },
        { type: 'screen', text: 'Tabla de areas con lista de cargos asociados a cada una y botones de CRUD' },
      ]
    },
    // ===== 19. CHAT INTERNO =====
    {
      id: 'chat',
      icon: '&#128172;',
      title: '19. Chat Interno',
      content: [
        { type: 'paragraph', text: 'El Chat Interno permite comunicacion en tiempo real entre los usuarios del sistema. Se accede desde el boton flotante (burbuja) en la esquina inferior derecha de la pantalla, disponible en cualquier seccion del sistema.' },
        { type: 'subtitle', text: 'Iniciar conversacion' },
        { type: 'steps', items: [
          'Haga clic en el icono de chat flotante en la esquina inferior derecha.',
          'Se abrira el panel de chat. Haga clic en "Nueva Conversacion".',
          'Seleccione el usuario o usuarios con quienes desea conversar.',
          'Escriba su mensaje y presione Enter o haga clic en "Enviar".'
        ]},
        { type: 'subtitle', text: 'Tipos de mensaje' },
        { type: 'paragraph', text: 'El chat soporta multiples tipos de contenido:' },
        { type: 'steps', items: [
          'Mensajes de texto: Escriba y envie mensajes de texto normales.',
          'Archivos: Adjunte archivos haciendo clic en el icono de clip y seleccionando el archivo desde su computadora.',
          'Imagenes: Envie imagenes que se previsualizan directamente en la conversacion.'
        ]},
        { type: 'subtitle', text: 'Conversaciones grupales' },
        { type: 'paragraph', text: 'Puede crear conversaciones con multiples participantes. Todos los miembros del grupo podran ver y responder los mensajes. Ideal para coordinacion de equipos de trabajo.' },
        { type: 'subtitle', text: 'Conversaciones directas' },
        { type: 'paragraph', text: 'Las conversaciones directas son entre dos usuarios. Son privadas y solo los dos participantes pueden ver los mensajes.' },
        { type: 'screen', text: 'Widget de chat flotante abierto mostrando lista de conversaciones a la izquierda y mensajes a la derecha' },
        { type: 'tip', text: 'El chat permanece accesible desde cualquier seccion del sistema. Puede minimizarlo y seguir trabajando sin perder la conversacion.' },
      ]
    },
    // ===== 20. PORTAL DEL POSTULANTE =====
    {
      id: 'portal-postulante',
      icon: '&#128196;',
      title: '20. Portal del Postulante',
      content: [
        { type: 'paragraph', text: 'El Portal del Postulante es la interfaz exclusiva para usuarios con rol "postulante". Se accede desde "Portal Postulante" en la pagina de inicio. Desde aqui pueden gestionar su informacion personal, responder evaluaciones de seleccion, subir documentos, ver entrevistas y consultar anuncios.' },
        { type: 'subtitle', text: 'Menu lateral del postulante' },
        { type: 'paragraph', text: 'El portal del postulante incluye las siguientes secciones en su menu lateral:' },
        { type: 'steps', items: [
          'Inicio: Pagina principal del portal con resumen del estado del postulante.',
          'Mi Ficha: Formulario completo de datos personales organizado en 8 pestanas.',
          'Seleccion: Evaluaciones/cuestionarios asignados para responder.',
          'Documentos: Subir documentos requeridos y consultar documentos firmados.',
          'Entrevistas: Ver entrevistas programadas con fecha, hora y lugar.',
          'Anuncios: Consultar los anuncios publicados por la organizacion.'
        ]},
        { type: 'subtitle', text: 'Mi Ficha (8 pestanas)' },
        { type: 'paragraph', text: 'La ficha personal del postulante esta organizada en 8 pestanas:' },
        { type: 'steps', items: [
          'Datos Personales: Nombres, apellido paterno, apellido materno, DNI, fecha de nacimiento, genero, estado civil, direccion, telefono, email.',
          'Formacion: Nivel educativo, institucion, carrera, fecha de inicio y fin.',
          'Experiencia Laboral: Empresas anteriores, cargo, funciones, periodo de trabajo.',
          'Idiomas y Habilidades: Idiomas que maneja con su nivel de competencia, y habilidades tecnicas y blandas.',
          'Referencias: Personas de contacto que pueden dar referencias laborales o personales.',
          'Expectativas: Disponibilidad, expectativa salarial, modalidad de trabajo y otra informacion complementaria.',
          'Datos Bancarios: Informacion bancaria (entidad, numero de cuenta, CCI).',
          'Regimen Pensionario: Informacion del regimen de pensiones (ONP, AFP, etc.).'
        ]},
        { type: 'note', text: 'Es importante completar todas las pestanas de la ficha para que el perfil sea considerado completo. Los datos se pre-cargan con la informacion registrada al crear el postulante.' },
        { type: 'subtitle', text: 'Seleccion (responder evaluaciones)' },
        { type: 'steps', items: [
          'Navegue a "Seleccion" en el menu lateral del portal.',
          'Vera la lista de evaluaciones/cuestionarios asignados con su estado (pendiente, completada).',
          'Haga clic en una evaluacion pendiente para abrirla.',
          'Responda todas las preguntas del cuestionario.',
          'Haga clic en "Enviar Respuestas" para completar la evaluacion.'
        ]},
        { type: 'warning', text: 'Una vez enviadas las respuestas, no podra modificarlas. Revise bien antes de enviar.' },
        { type: 'subtitle', text: 'Documentos' },
        { type: 'paragraph', text: 'Desde esta seccion puede subir documentos requeridos como copia de DNI, certificados, antecedentes, etc. Tambien puede consultar documentos que hayan sido firmados. Haga clic en "Subir Documento", seleccione el tipo de documento, elija el archivo y confirme la carga.' },
        { type: 'subtitle', text: 'Entrevistas' },
        { type: 'paragraph', text: 'Aqui puede ver las entrevistas programadas con fecha, hora y lugar. Las entrevistas son agendadas por el administrador o trabajador y se muestran en orden cronologico.' },
        { type: 'subtitle', text: 'Anuncios' },
        { type: 'paragraph', text: 'Consulte los anuncios publicados por la organizacion. Los anuncios se muestran ordenados por fecha, del mas reciente al mas antiguo.' },
        { type: 'screen', text: 'Portal del postulante mostrando la ficha personal con 8 pestanas y menu lateral simplificado' },
      ]
    },
    // ===== 20. PORTAL DEL TRABAJADOR =====
    {
      id: 'portal-trabajador',
      icon: '&#128188;',
      title: '21. Portal del Trabajador',
      content: [
        { type: 'paragraph', text: 'El Portal del Trabajador es la interfaz para usuarios con rol "trabajador" cuando acceden desde el portal (no el panel administrativo). Se accede desde "Portal Trabajadores" en la pagina de inicio. Incluye funcionalidades especificas para empleados activos de la organizacion.' },
        { type: 'subtitle', text: 'Menu lateral del trabajador (portal)' },
        { type: 'paragraph', text: 'El portal del trabajador incluye las siguientes secciones en su menu lateral:' },
        { type: 'steps', items: [
          'Inicio: Pagina principal del portal con resumen y accesos directos.',
          'Mi Ficha: Formulario completo de datos personales con las mismas 8 pestanas que el postulante (Datos Personales, Formacion, Experiencia Laboral, Idiomas y Habilidades, Referencias, Expectativas, Datos Bancarios, Regimen Pensionario).',
          'Documentos: Subir y gestionar documentos personales y laborales.',
          'Derechohabientes: Registrar y gestionar familiares y dependientes (conyuges, hijos, padres).',
          'Eval. Desempeno: Consultar evaluaciones de desempeno en modo solo lectura (ver puntajes por criterio y promedio general).',
          'Capacitaciones: Ver capacitaciones asignadas. Por defecto muestra solo las pendientes; un toggle permite ver tambien las completadas.',
          'Anuncios: Consultar los anuncios publicados por la organizacion.'
        ]},
        { type: 'subtitle', text: 'Diferencia con el panel administrativo' },
        { type: 'paragraph', text: 'Los usuarios con rol "trabajador" tienen doble acceso: pueden ingresar al panel administrativo completo (dashboard, gestion de postulantes, seleccion, legajo, embudo, IA insights, admin usuarios, seguridad, configuracion, carga masiva, comunicaciones, plantillas email, capacitaciones, evaluacion de desempeno, mis aprobaciones y maestros) y tambien al portal con funcionalidades de autoservicio. El portal es una interfaz simplificada para gestionar su propia informacion.' },
        { type: 'subtitle', text: 'Derechohabientes' },
        { type: 'steps', items: [
          'Navegue a "Derechohabientes" en el menu lateral del portal.',
          'Haga clic en "Agregar Derechohabiente".',
          'Complete los datos del familiar: nombre, parentesco, fecha de nacimiento, DNI, etc.',
          'Guarde el registro. Puede agregar multiples derechohabientes.',
          'Puede editar o eliminar derechohabientes existentes usando los botones de accion.'
        ]},
        { type: 'subtitle', text: 'Evaluacion de Desempeno (vista portal)' },
        { type: 'paragraph', text: 'Desde el portal, el trabajador puede consultar las evaluaciones de desempeno que le han sido realizadas. La vista es de solo lectura: puede ver los 7 criterios evaluados con su calificacion en estrellas (1-5) y el puntaje promedio calculado automaticamente.' },
        { type: 'subtitle', text: 'Capacitaciones (vista portal)' },
        { type: 'paragraph', text: 'El trabajador ve sus capacitaciones asignadas. Por defecto se muestran las capacitaciones pendientes de completar. Un toggle permite alternar para ver tambien las capacitaciones ya completadas.' },
        { type: 'screen', text: 'Portal del trabajador mostrando el menu lateral con Derechohabientes, Eval. Desempeno y Capacitaciones' },
        { type: 'tip', text: 'Mantenga actualizada su informacion en Mi Ficha, especialmente los datos bancarios y regimen pensionario, ya que son utilizados para procesos de nomina.' },
      ]
    },
  ];
}
