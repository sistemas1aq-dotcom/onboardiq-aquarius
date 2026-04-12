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
              <p class="text-sm text-gray-400">OnboardIQ Aquarius - Manual de Usuario v1.0</p>
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
        { type: 'paragraph', text: 'OnboardIQ Aquarius es una plataforma integral de gestion de Recursos Humanos disenada para optimizar los procesos de reclutamiento, seleccion, onboarding y administracion de personal. Permite gestionar postulantes, evaluaciones, legajos, capacitaciones, comunicaciones y mucho mas desde una unica interfaz web moderna y responsiva.' },
        { type: 'subtitle', text: 'Arquitectura del sistema' },
        { type: 'paragraph', text: 'El sistema esta compuesto por tres capas principales:' },
        { type: 'steps', items: [
          'Frontend: Aplicacion Angular 18 con TailwindCSS. Interfaz responsiva para escritorio y dispositivos moviles.',
          'Backend: API REST desarrollada en Node.js con Express. Maneja la logica de negocio, autenticacion JWT y envio de correos.',
          'Base de Datos: PostgreSQL para almacenamiento relacional de toda la informacion del sistema.'
        ]},
        { type: 'subtitle', text: 'Roles de usuario' },
        { type: 'paragraph', text: 'El sistema maneja cuatro roles con diferentes niveles de acceso:' },
        { type: 'steps', items: [
          'Administrador (admin): Acceso completo a todos los modulos. Puede gestionar usuarios, configuraciones, evaluaciones, postulantes y toda la operacion del sistema.',
          'Evaluador: Puede gestionar postulantes, crear y revisar evaluaciones, aprobar/rechazar candidatos y acceder a reportes.',
          'Postulante: Accede a su portal personal donde puede completar su ficha, responder evaluaciones, subir documentos y ver sus entrevistas programadas.',
          'Trabajador: Tiene acceso a todo lo del postulante mas funcionalidades adicionales como firma digital, datos bancarios, derechohabientes, regimen pensionario y capacitaciones.'
        ]},
        { type: 'tip', text: 'El rol determina automaticamente que menu lateral y que funcionalidades ve cada usuario al ingresar al sistema.' },
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
          'En la pantalla de inicio de sesion, ingrese su correo electronico en el campo "Email".',
          'Ingrese su contrasena en el campo "Contrasena".',
          'Haga clic en el boton "Iniciar Sesion".',
          'El sistema lo redirigira automaticamente al dashboard correspondiente a su rol.'
        ]},
        { type: 'screen', text: 'Pantalla de login con campos de email, contrasena y boton de inicio de sesion' },
        { type: 'subtitle', text: 'Recuperar contrasena' },
        { type: 'paragraph', text: 'Si olvido su contrasena, contacte al administrador del sistema para que le asigne una nueva desde el modulo de Usuarios. El administrador puede cambiar la contrasena de cualquier usuario desde la edicion de su perfil.' },
        { type: 'subtitle', text: 'Primer ingreso' },
        { type: 'paragraph', text: 'Si fue registrado por carga masiva, su contrasena por defecto es: Aquarius2025. Se recomienda solicitar al administrador que la cambie en su primer acceso.' },
        { type: 'warning', text: 'Por seguridad, cambie su contrasena por defecto lo antes posible. Contacte al administrador si necesita una nueva clave.' },
      ]
    },
    // ===== 3. DASHBOARD =====
    {
      id: 'dashboard',
      icon: '&#128202;',
      title: '3. Dashboard',
      content: [
        { type: 'paragraph', text: 'El Dashboard es la pantalla principal que se muestra al iniciar sesion como Administrador o Evaluador. Proporciona una vision general del estado del sistema de reclutamiento.' },
        { type: 'subtitle', text: 'KPIs y metricas' },
        { type: 'paragraph', text: 'En la parte superior se muestran tarjetas con indicadores clave (KPIs):' },
        { type: 'steps', items: [
          'Total de Postulantes: Numero total de postulantes registrados en el sistema.',
          'Evaluaciones Activas: Cantidad de evaluaciones que estan actualmente en curso.',
          'Tasa de Aprobacion: Porcentaje de postulantes que han sido aprobados.',
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
        { type: 'paragraph', text: 'Este modulo permite administrar todo el ciclo de vida de los postulantes, desde su registro hasta su aprobacion o rechazo.' },
        { type: 'subtitle', text: 'Crear nuevo postulante' },
        { type: 'steps', items: [
          'Navegue a "Postulantes" en el menu lateral.',
          'Haga clic en el boton "Nuevo Postulante".',
          'Complete el formulario con los datos requeridos: nombre, apellido, email, telefono, cargo al que postula.',
          'Haga clic en "Guardar" para registrar al postulante.',
          'El sistema creara automaticamente un usuario con rol "postulante" y enviara las credenciales por correo.'
        ]},
        { type: 'tip', text: 'Tambien puede registrar postulantes masivamente usando el modulo de Carga Masiva.' },
        { type: 'subtitle', text: 'Ver detalle del postulante' },
        { type: 'paragraph', text: 'Haga clic en el nombre de cualquier postulante en la tabla para abrir su ficha detallada. Aqui podra ver toda su informacion personal, documentos subidos, evaluaciones asignadas y estado actual.' },
        { type: 'subtitle', text: 'Aprobar o Rechazar postulante' },
        { type: 'steps', items: [
          'Acceda al detalle del postulante.',
          'Revise toda su informacion, documentos y resultados de evaluaciones.',
          'Haga clic en el boton "Aprobar" (verde) o "Rechazar" (rojo) segun corresponda.',
          'Confirme la accion en el dialogo de confirmacion.',
          'El estado del postulante se actualizara y se registrara en el log de auditoria.'
        ]},
        { type: 'subtitle', text: 'Ver legajo' },
        { type: 'paragraph', text: 'Desde el detalle del postulante puede acceder a su legajo completo haciendo clic en "Ver Legajo". Esto lo llevara al modulo de Legajo con todas las pestanas de informacion.' },
        { type: 'subtitle', text: 'Filtros y busqueda' },
        { type: 'paragraph', text: 'La tabla de postulantes incluye un campo de busqueda para filtrar por nombre o email, y filtros por estado (pendiente, aprobado, rechazado). Use estos filtros para encontrar rapidamente al postulante que busca.' },
        { type: 'screen', text: 'Tabla de postulantes con filtros de busqueda y estado, columnas de nombre, email, cargo, estado y acciones' },
      ]
    },
    // ===== 5. EVALUACIONES =====
    {
      id: 'evaluaciones',
      icon: '&#128221;',
      title: '5. Evaluaciones',
      content: [
        { type: 'paragraph', text: 'El modulo de Evaluaciones permite crear cuestionarios, asignarlos a postulantes y gestionar flujos de aprobacion multi-nivel.' },
        { type: 'subtitle', text: 'Crear evaluacion' },
        { type: 'steps', items: [
          'Navegue a "Evaluaciones" en el menu lateral.',
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
        { type: 'note', text: 'Los postulantes asignados veran la evaluacion disponible en su portal personal, seccion "Mis Evaluaciones".' },
        { type: 'subtitle', text: 'Configurar aprobadores' },
        { type: 'paragraph', text: 'Desde la seccion de Evaluaciones puede configurar un flujo de aprobacion multi-nivel. Haga clic en "Configurar Aprobadores" y defina los niveles de aprobacion (Nivel 1, Nivel 2, etc.). Asigne usuarios con rol evaluador o admin a cada nivel. Las aprobaciones se ejecutan en orden secuencial.' },
        { type: 'subtitle', text: 'Ver detalle con puntajes' },
        { type: 'paragraph', text: 'En el detalle de cada evaluacion puede ver la lista de postulantes asignados con su estado (pendiente, completada) y el puntaje obtenido. Puede hacer clic en cada postulante para ver sus respuestas individuales.' },
        { type: 'subtitle', text: 'Flujo de aprobacion' },
        { type: 'steps', items: [
          'Cuando un postulante completa la evaluacion, esta pasa al primer nivel de aprobacion.',
          'El aprobador de nivel 1 recibe notificacion y puede aprobar o rechazar.',
          'Si aprueba, pasa automaticamente al siguiente nivel (si existe).',
          'El proceso continua hasta completar todos los niveles.',
          'El aprobador puede filtrar por area para ver solo las evaluaciones de su competencia.'
        ]},
        { type: 'screen', text: 'Detalle de evaluacion mostrando preguntas, postulantes asignados con puntajes y panel de aprobadores' },
        { type: 'tip', text: 'Puede filtrar las evaluaciones pendientes de aprobacion por area usando los filtros de correo disponibles.' },
      ]
    },
    // ===== 6. LEGAJO =====
    {
      id: 'legajo',
      icon: '&#128451;',
      title: '6. Legajo del Trabajador',
      content: [
        { type: 'paragraph', text: 'El Legajo es el expediente digital completo de cada trabajador o postulante. Contiene toda la informacion organizada en pestanas.' },
        { type: 'subtitle', text: 'Buscar trabajador' },
        { type: 'steps', items: [
          'Navegue a "Legajo" en el menu lateral.',
          'Use el campo de busqueda para encontrar al trabajador por nombre, apellido o documento.',
          'Haga clic en el trabajador para abrir su legajo completo.'
        ]},
        { type: 'subtitle', text: 'Pestanas del legajo' },
        { type: 'paragraph', text: 'El legajo esta organizado en multiples pestanas:' },
        { type: 'steps', items: [
          'Datos Personales: Informacion basica del trabajador (nombre, documento, fecha de nacimiento, direccion, etc.).',
          'Evaluaciones: Historial de todas las evaluaciones realizadas con sus puntajes.',
          'Documentos: Archivos subidos por el trabajador o el administrador (CV, certificados, etc.).',
          'Firmas: Documentos que requieren firma digital del trabajador.',
          'Capacitaciones: Cursos asignados y su progreso.',
          'Datos Bancarios: Informacion bancaria para nomina (solo trabajadores).',
          'Derechohabientes: Familiares y dependientes registrados.',
          'Regimen Pensionario: Informacion del regimen de pensiones.'
        ]},
        { type: 'screen', text: 'Vista del legajo con pestanas superiores y datos del trabajador seleccionado' },
        { type: 'tip', text: 'Puede navegar entre pestanas sin perder la informacion. Los cambios se guardan individualmente en cada seccion.' },
      ]
    },
    // ===== 7. EMBUDO DE SELECCION =====
    {
      id: 'embudo',
      icon: '&#127987;',
      title: '7. Embudo de Seleccion',
      content: [
        { type: 'paragraph', text: 'El Embudo de Seleccion (funnel) proporciona una visualizacion grafica del proceso de reclutamiento, mostrando cuantos candidatos hay en cada etapa.' },
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
        { type: 'paragraph', text: 'Este modulo aprovecha la inteligencia artificial para analizar candidatos, calcular scoring automatico y proporcionar asistencia mediante chat con IA.' },
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
      title: '9. Administracion de Usuarios',
      content: [
        { type: 'paragraph', text: 'Este modulo permite gestionar los usuarios del sistema: crear, editar, asignar roles, areas, cargos y controlar el acceso.' },
        { type: 'subtitle', text: 'Crear usuario' },
        { type: 'steps', items: [
          'Navegue a "Usuarios" en el menu lateral.',
          'Haga clic en "Nuevo Usuario".',
          'Complete los campos: nombre, email, rol (admin, evaluador, postulante, trabajador).',
          'Asigne un area y un cargo al usuario.',
          'Defina una contrasena inicial.',
          'Haga clic en "Guardar" para crear el usuario.'
        ]},
        { type: 'subtitle', text: 'Editar usuario (incluye cambiar contrasena)' },
        { type: 'steps', items: [
          'En la lista de usuarios, haga clic en el boton de edicion del usuario deseado.',
          'Modifique los campos necesarios: nombre, email, rol, area, cargo.',
          'Para cambiar la contrasena, ingrese la nueva contrasena en el campo correspondiente.',
          'Haga clic en "Actualizar" para guardar los cambios.'
        ]},
        { type: 'warning', text: 'Al cambiar la contrasena de un usuario, este debera usar la nueva clave en su proximo inicio de sesion. Comunique el cambio al usuario.' },
        { type: 'subtitle', text: 'Asignar area y cargo' },
        { type: 'paragraph', text: 'Cada usuario puede tener asignada un area (departamento) y un cargo (puesto). Estos se seleccionan de los catalogos configurados en el modulo de Maestros. El area y cargo determinan ciertos filtros automaticos en el sistema, como las evaluaciones que puede ver un evaluador.' },
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
        { type: 'paragraph', text: 'El log registra: inicio de sesion de usuarios, creacion/edicion/eliminacion de registros, cambios de estado de postulantes, asignacion de evaluaciones, y cualquier otra operacion relevante. Cada registro incluye: fecha y hora, usuario que realizo la accion, tipo de accion, y detalle descriptivo.' },
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
        { type: 'paragraph', text: 'El modulo de Configuracion permite ajustar los parametros generales del sistema.' },
        { type: 'subtitle', text: 'Parametros del sistema' },
        { type: 'paragraph', text: 'Desde esta seccion puede configurar aspectos como: nombre de la empresa, logo, colores de la interfaz, parametros de correo electronico, limites de carga de archivos, y otros valores que afectan el comportamiento general de la plataforma.' },
        { type: 'steps', items: [
          'Navegue a "Configuracion" en el menu lateral.',
          'Modifique los parametros deseados en el formulario.',
          'Haga clic en "Guardar Cambios" para aplicar la nueva configuracion.',
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
        { type: 'paragraph', text: 'La Carga Masiva permite registrar multiples postulantes o trabajadores de una sola vez mediante un archivo Excel.' },
        { type: 'subtitle', text: 'Descargar plantilla Excel' },
        { type: 'steps', items: [
          'Navegue a "Carga Masiva" en el menu lateral.',
          'Haga clic en "Descargar Plantilla".',
          'Se descargara un archivo Excel (.xlsx) con las columnas requeridas: nombre, apellido, email, telefono, documento, etc.',
          'Complete la plantilla con los datos de los postulantes/trabajadores.'
        ]},
        { type: 'subtitle', text: 'Subir archivo' },
        { type: 'steps', items: [
          'Una vez completada la plantilla, haga clic en "Subir Archivo" o arrastre el archivo al area de carga.',
          'El sistema validara el formato y los datos del archivo.',
          'Se mostrara una vista previa con los registros a importar y cualquier error encontrado.',
          'Corrija los errores si los hay y vuelva a subir, o confirme la importacion.',
          'Los registros se crearan en el sistema y se generaran las cuentas de usuario correspondientes.'
        ]},
        { type: 'subtitle', text: 'Contrasena por defecto' },
        { type: 'paragraph', text: 'Los usuarios creados por carga masiva reciben la contrasena por defecto: Aquarius2025. Se recomienda que cada usuario la cambie en su primer ingreso.' },
        { type: 'warning', text: 'Asegurese de que los correos electronicos sean unicos y validos. El sistema rechazara registros con emails duplicados.' },
        { type: 'screen', text: 'Pantalla de carga masiva con area de drag & drop, boton de descarga de plantilla y tabla de vista previa' },
      ]
    },
    // ===== 13. ANUNCIOS =====
    {
      id: 'anuncios',
      icon: '&#128227;',
      title: '13. Anuncios',
      content: [
        { type: 'paragraph', text: 'El modulo de Anuncios permite crear y enviar comunicaciones importantes a los usuarios del sistema.' },
        { type: 'subtitle', text: 'Crear anuncio' },
        { type: 'steps', items: [
          'Navegue a "Anuncios" en el menu lateral.',
          'Haga clic en "Nuevo Anuncio".',
          'Ingrese el titulo, contenido del anuncio y seleccione el tipo (informativo, urgente, evento, etc.).',
          'Haga clic en "Guardar" para crear el anuncio.'
        ]},
        { type: 'subtitle', text: 'Enviar por email' },
        { type: 'paragraph', text: 'Los anuncios pueden enviarse por correo electronico a los usuarios. Al crear o editar un anuncio, active la opcion de envio por email y seleccione los destinatarios.' },
        { type: 'subtitle', text: 'Filtrar por tipo' },
        { type: 'paragraph', text: 'En la lista de anuncios puede filtrar por tipo para encontrar rapidamente anuncios especificos. Los tipos disponibles dependen de la configuracion del sistema.' },
        { type: 'screen', text: 'Lista de anuncios con filtros por tipo y botones de accion para editar, enviar y eliminar' },
      ]
    },
    // ===== 14. COMUNICACIONES =====
    {
      id: 'comunicaciones',
      icon: '&#128231;',
      title: '14. Comunicaciones',
      content: [
        { type: 'paragraph', text: 'Este modulo gestiona las comunicaciones automaticas y manuales del sistema, incluyendo correos por cumpleanos, festividades y otros eventos.' },
        { type: 'subtitle', text: 'Cumpleanos' },
        { type: 'paragraph', text: 'El sistema detecta automaticamente los cumpleanos de los trabajadores y puede enviar correos de felicitacion. Desde esta seccion puede ver los proximos cumpleanos y gestionar el envio de correos.' },
        { type: 'subtitle', text: 'Festividades' },
        { type: 'paragraph', text: 'Configure las festividades y fechas especiales que desea celebrar. El sistema puede enviar correos automaticos en estas fechas a todos los trabajadores o a grupos especificos.' },
        { type: 'subtitle', text: 'Historial de correos' },
        { type: 'paragraph', text: 'Consulte el historial completo de correos enviados por el sistema. Puede filtrar por fecha, tipo, destinatario y estado de envio (enviado, fallido).' },
        { type: 'screen', text: 'Pantalla de comunicaciones con pestanas de cumpleanos, festividades e historial de correos' },
        { type: 'tip', text: 'Asegurese de que los datos de nacimiento de los trabajadores esten completos para aprovechar la funcion de cumpleanos.' },
      ]
    },
    // ===== 15. CAPACITACIONES =====
    {
      id: 'capacitaciones',
      icon: '&#127891;',
      title: '15. Capacitaciones',
      content: [
        { type: 'paragraph', text: 'El modulo de Capacitaciones permite crear cursos, asignarlos a trabajadores y hacer seguimiento de su progreso.' },
        { type: 'subtitle', text: 'Crear capacitacion' },
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
          'Confirme la asignacion. Los trabajadores recibiran notificacion.',
        ]},
        { type: 'subtitle', text: 'Ver progreso' },
        { type: 'paragraph', text: 'En el listado de capacitaciones puede ver el porcentaje de avance general. Dentro del detalle, puede ver el estado individual de cada trabajador asignado: pendiente, en progreso o completada.' },
        { type: 'screen', text: 'Lista de capacitaciones con barra de progreso y detalle mostrando trabajadores asignados con su estado' },
      ]
    },
    // ===== 16. EVALUACION DE DESEMPENO =====
    {
      id: 'eval-desempeno',
      icon: '&#11088;',
      title: '16. Evaluacion de Desempeno',
      content: [
        { type: 'paragraph', text: 'Este modulo permite crear evaluaciones de desempeno para trabajadores activos, con criterios personalizados y calificacion por estrellas.' },
        { type: 'subtitle', text: 'Crear evaluacion de desempeno' },
        { type: 'steps', items: [
          'Navegue a "Evaluacion de Desempeno" en el menu lateral.',
          'Haga clic en "Nueva Evaluacion".',
          'Seleccione el trabajador a evaluar.',
          'Defina el periodo de evaluacion.',
          'Agregue los criterios de evaluacion.'
        ]},
        { type: 'subtitle', text: 'Criterios y puntajes (estrellas)' },
        { type: 'paragraph', text: 'Cada criterio se califica usando un sistema de estrellas (1 a 5). Puede agregar multiples criterios como: cumplimiento de objetivos, trabajo en equipo, comunicacion, liderazgo, puntualidad, etc. El sistema calcula automaticamente el promedio general.' },
        { type: 'subtitle', text: 'Estados de la evaluacion' },
        { type: 'steps', items: [
          'Borrador: La evaluacion esta en proceso de creacion. Puede editarse libremente.',
          'Enviada: La evaluacion ha sido enviada y esta pendiente de completar por el evaluador.',
          'Completada: La evaluacion ha sido finalizada. Los resultados son visibles en el legajo del trabajador.'
        ]},
        { type: 'screen', text: 'Formulario de evaluacion de desempeno con criterios y estrellas de calificacion' },
        { type: 'tip', text: 'Las evaluaciones de desempeno completadas se reflejan automaticamente en el legajo del trabajador.' },
      ]
    },
    // ===== 17. MAESTROS =====
    {
      id: 'maestros',
      icon: '&#128736;',
      title: '17. Maestros',
      content: [
        { type: 'paragraph', text: 'El modulo de Maestros permite administrar los catalogos base del sistema: Areas y Cargos. Estos catalogos se utilizan en todo el sistema para clasificar usuarios, postulantes y procesos.' },
        { type: 'subtitle', text: 'Areas' },
        { type: 'steps', items: [
          'Navegue a "Maestros" en el menu lateral y seleccione "Areas".',
          'Para crear un area nueva, haga clic en "Nueva Area" e ingrese el nombre.',
          'Para editar, haga clic en el icono de edicion junto al area deseada.',
          'Para eliminar, haga clic en el icono de eliminacion. Solo se puede eliminar si no tiene cargos ni usuarios asociados.'
        ]},
        { type: 'subtitle', text: 'Cargos' },
        { type: 'steps', items: [
          'Navegue a "Maestros" y seleccione "Cargos".',
          'Los cargos estan vinculados a un area. Al crear un cargo, debe seleccionar a que area pertenece.',
          'Para crear un cargo nuevo, haga clic en "Nuevo Cargo", seleccione el area y escriba el nombre del cargo.',
          'Para editar o eliminar, use los iconos de accion correspondientes.'
        ]},
        { type: 'note', text: 'Los cambios en Areas y Cargos se reflejan inmediatamente en los formularios de creacion de usuarios y postulantes.' },
        { type: 'screen', text: 'Tabla de areas con lista de cargos asociados a cada una y botones de CRUD' },
      ]
    },
    // ===== 18. CHAT INTERNO =====
    {
      id: 'chat',
      icon: '&#128172;',
      title: '18. Chat Interno',
      content: [
        { type: 'paragraph', text: 'El Chat Interno permite comunicacion en tiempo real entre los usuarios del sistema, accesible desde el icono de chat flotante en la esquina inferior de la pantalla.' },
        { type: 'subtitle', text: 'Iniciar conversacion' },
        { type: 'steps', items: [
          'Haga clic en el icono de chat flotante (burbuja azul) en la esquina inferior derecha.',
          'Se abrira el panel de chat. Haga clic en "Nueva Conversacion".',
          'Seleccione el usuario o usuarios con quienes desea conversar.',
          'Escriba su mensaje y presione Enter o haga clic en "Enviar".'
        ]},
        { type: 'subtitle', text: 'Enviar mensajes y archivos' },
        { type: 'paragraph', text: 'Puede enviar mensajes de texto y adjuntar archivos. Para adjuntar un archivo, haga clic en el icono de clip y seleccione el archivo desde su computadora.' },
        { type: 'subtitle', text: 'Conversaciones grupales' },
        { type: 'paragraph', text: 'Puede crear conversaciones con multiples participantes. Todos los miembros del grupo podran ver y responder los mensajes. Ideal para coordinacion de equipos de trabajo.' },
        { type: 'screen', text: 'Widget de chat abierto mostrando lista de conversaciones a la izquierda y mensajes a la derecha' },
        { type: 'tip', text: 'El chat permanece accesible desde cualquier seccion del sistema. Puede minimizarlo y seguir trabajando sin perder la conversacion.' },
      ]
    },
    // ===== 19. PORTAL DEL POSTULANTE =====
    {
      id: 'portal-postulante',
      icon: '&#128196;',
      title: '19. Portal del Postulante',
      content: [
        { type: 'paragraph', text: 'El Portal del Postulante es la interfaz exclusiva para usuarios con rol "postulante". Desde aqui pueden gestionar su informacion personal, responder evaluaciones y subir documentos.' },
        { type: 'subtitle', text: 'Mi Ficha' },
        { type: 'paragraph', text: 'La ficha personal del postulante esta organizada en 8 pestanas:' },
        { type: 'steps', items: [
          'Datos Personales: Nombre, apellido, documento de identidad, fecha de nacimiento, genero, estado civil, direccion, telefono, email.',
          'Formacion Academica: Nivel educativo, institucion, carrera, fecha de inicio y fin.',
          'Experiencia Laboral: Empresas anteriores, cargo, funciones, periodo de trabajo.',
          'Idiomas: Idiomas que maneja con su nivel de competencia.',
          'Habilidades: Habilidades tecnicas y blandas relevantes.',
          'Referencias: Personas de contacto que pueden dar referencias laborales.',
          'Datos Complementarios: Informacion adicional como disponibilidad, expectativa salarial, etc.',
          'Foto y CV: Subir foto de perfil y curriculum vitae en formato PDF.'
        ]},
        { type: 'note', text: 'Es importante completar todas las pestanas de la ficha para que el perfil sea considerado completo por los evaluadores.' },
        { type: 'subtitle', text: 'Mis Evaluaciones' },
        { type: 'steps', items: [
          'Navegue a "Mis Evaluaciones" en el menu lateral.',
          'Vera la lista de evaluaciones asignadas con su estado (pendiente, completada).',
          'Haga clic en una evaluacion pendiente para abrirla.',
          'Responda todas las preguntas del cuestionario.',
          'Haga clic en "Enviar Respuestas" para completar la evaluacion.',
        ]},
        { type: 'warning', text: 'Una vez enviadas las respuestas, no podra modificarlas. Revise bien antes de enviar.' },
        { type: 'subtitle', text: 'Mis Documentos' },
        { type: 'paragraph', text: 'Desde esta seccion puede subir documentos requeridos como copia de DNI, certificados, antecedentes, etc. Haga clic en "Subir Documento", seleccione el tipo de documento, elija el archivo y confirme la carga.' },
        { type: 'subtitle', text: 'Mis Entrevistas' },
        { type: 'paragraph', text: 'Aqui puede ver las entrevistas programadas con fecha, hora y lugar. Las entrevistas son agendadas por el evaluador o administrador y se muestran en orden cronologico.' },
        { type: 'screen', text: 'Portal del postulante mostrando la ficha personal con pestanas y barra de progreso de completitud' },
      ]
    },
    // ===== 20. PORTAL DEL TRABAJADOR =====
    {
      id: 'portal-trabajador',
      icon: '&#128188;',
      title: '20. Portal del Trabajador',
      content: [
        { type: 'paragraph', text: 'El Portal del Trabajador extiende las funcionalidades del Portal del Postulante con modulos adicionales exclusivos para empleados activos de la organizacion.' },
        { type: 'paragraph', text: 'El trabajador tiene acceso a todo lo mencionado en el Portal del Postulante (Mi Ficha, Mis Evaluaciones, Mis Documentos, Mis Entrevistas) mas las siguientes secciones adicionales:' },
        { type: 'subtitle', text: 'Firma Digital' },
        { type: 'steps', items: [
          'Navegue a "Firma Digital" en el menu lateral.',
          'Vera la lista de documentos pendientes de firma.',
          'Haga clic en un documento para visualizarlo.',
          'Use el pad de firma tactil/mouse para dibujar su firma.',
          'Confirme la firma. El documento quedara firmado digitalmente con marca de tiempo.'
        ]},
        { type: 'subtitle', text: 'Derechohabientes' },
        { type: 'paragraph', text: 'Registre sus familiares y dependientes. Puede agregar: nombre completo, parentesco, fecha de nacimiento, documento de identidad y si es beneficiario de seguro.' },
        { type: 'steps', items: [
          'Navegue a "Derechohabientes" en el menu lateral.',
          'Haga clic en "Agregar Derechohabiente".',
          'Complete los datos del familiar.',
          'Guarde el registro.'
        ]},
        { type: 'subtitle', text: 'Datos Bancarios' },
        { type: 'paragraph', text: 'Registre su informacion bancaria para el deposito de nomina. Incluye: banco, tipo de cuenta, numero de cuenta y codigo interbancario (CCI).' },
        { type: 'warning', text: 'Verifique que los datos bancarios sean correctos. Informacion erronea puede causar retrasos en el pago de nomina.' },
        { type: 'subtitle', text: 'Regimen Pensionario' },
        { type: 'paragraph', text: 'Seleccione y registre su regimen de pensiones (AFP, ONP u otro segun corresponda). Incluya el tipo de regimen, la entidad administradora y su numero de afiliacion.' },
        { type: 'subtitle', text: 'Documentos Digitales' },
        { type: 'paragraph', text: 'Acceda a documentos corporativos compartidos por la empresa: reglamentos, politicas, manuales de procedimientos, etc. Puede visualizarlos y descargarlos.' },
        { type: 'subtitle', text: 'Capacitaciones' },
        { type: 'steps', items: [
          'Navegue a "Capacitaciones" en el menu lateral.',
          'Vera la lista de capacitaciones asignadas con su estado (pendiente, en progreso, completada).',
          'Haga clic en una capacitacion para acceder al contenido.',
          'Complete las actividades requeridas.',
          'Al finalizar, la capacitacion se marcara como completada automaticamente.'
        ]},
        { type: 'screen', text: 'Portal del trabajador mostrando menu lateral con todas las opciones adicionales y contenido principal' },
        { type: 'tip', text: 'Mantenga actualizada toda su informacion personal, bancaria y de derechohabientes. Esto facilita los procesos administrativos de la empresa.' },
      ]
    },
  ];
}
