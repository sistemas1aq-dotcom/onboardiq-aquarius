# 🚀 AQUARIUS RRHH v2.0 — Subir Demo en Línea

## MÉTODO RÁPIDO: VERCEL (5 minutos, gratis)

### Paso 1: Cuentas necesarias (gratis)
- **GitHub**: https://github.com → registrarse
- **Vercel**: https://vercel.com → registrarse con GitHub

### Paso 2: Subir a GitHub
1. En GitHub clic "+" → "New repository"
2. Nombre: `aquarius-rrhh`
3. Público → Create
4. Subir TODOS los archivos de esta carpeta `aquarius-demo/`
   - Puede arrastrar los archivos directamente en la web de GitHub
   - O usar Git desde terminal

### Paso 3: Desplegar en Vercel
1. En Vercel → "Add New Project"
2. Importar repositorio `aquarius-rrhh`
3. Framework Preset: **Vite**
4. Clic "Deploy"
5. En ~2 minutos tendrá URL: `https://aquarius-rrhh.vercel.app`

### Paso 4: Dominio personalizado (opcional)
- Vercel → Settings → Domains → Agregar `demo.aquariusconsulting.pe`

---

## MÉTODO SIN GITHUB (Drag & Drop)

1. Instalar Node.js desde https://nodejs.org (LTS)
2. Abrir terminal en la carpeta del proyecto:
```bash
cd aquarius-demo
npm install
npm run build
```
3. Arrastrar la carpeta `dist/` a https://vercel.com
4. Listo — recibe URL pública

---

## ESTRUCTURA DEL PROYECTO

```
aquarius-demo/
├── index.html              ← Página de entrada
├── package.json            ← Dependencias (React + Recharts)
├── vite.config.js          ← Config Vite
├── DEPLOY.md               ← Este archivo
└── src/
    ├── main.jsx            ← Landing (elige Admin o Portal)
    ├── AdminApp.jsx        ← Panel Admin completo (1305 líneas)
    │   ├── Dashboard con KPIs y gráficos
    │   ├── Gestión Postulantes (aprobar/rechazar)
    │   ├── Evaluaciones (crear pruebas, ver resultados)
    │   ├── Legajo del Trabajador (búsqueda de aprobados)
    │   ├── Embudo de Reclutamiento
    │   ├── IA Insights (búsqueda web de referencias)
    │   ├── Admin Usuarios
    │   ├── Seguridad/Auditoría (toggle admin/auditor)
    │   └── Configuración
    └── PortalApp.jsx       ← Portal Postulante completo (717 líneas)
        ├── Inicio (dashboard personal)
        ├── Mi Ficha (8 pestañas)
        ├── Evaluaciones (opción múltiple)
        ├── Documentos (upload con semáforo)
        ├── Entrevistas (calendario interactivo)
        ├── [Post-aprobación] Firma Digital
        ├── [Post-aprobación] Derechohabientes
        ├── [Post-aprobación] Datos Bancarios (CORREGIDO)
        ├── [Post-aprobación] Régimen Pensionario (CORREGIDO)
        ├── [Post-aprobación] Docs. Digitales
        └── [Post-aprobación] Capacitaciones
```

## DEMO — Credenciales

No se requieren credenciales reales. Solo hacer clic en "Ingresar".

**Admin**: Elegir rol (Administrador/Evaluador) → Ingresar
**Portal**: Ingresar con DNI demo → Usar "Demo: Simular aprobado"

## CAMBIOS v2.0

- ✅ Datos Bancarios: campos cuenta/CCI al elegir "Sí tengo" + entidades al elegir "No"
- ✅ Pensionario: selector AFP para primer trabajo Y ya afiliado
- ✅ IA mejorada: búsqueda web LinkedIn, noticias, score de confianza
- ✅ Legajo Trabajador: búsqueda de aprobados con info completa
- ✅ Paquete regenerado con todas las correcciones
