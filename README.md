# 🌐 Aquarius Consulting SAC — Sistema de Gestión RRHH

> Sistema integral de reclutamiento, evaluación y onboarding digital para empresas peruanas.

![Version](https://img.shields.io/badge/version-3.0-blue)
![React](https://img.shields.io/badge/React-18.3-61DAFB)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF)
![License](https://img.shields.io/badge/license-Private-red)

---

## 🚀 Demo en Vivo

Después de desplegar en Vercel, tu URL será:
```
https://aquarius-rrhh.vercel.app
```

---

## 👥 4 Perfiles de Usuario

| Perfil | Icono | Acceso | Módulos |
|--------|-------|--------|---------|
| **Administrador** | 🛡️ | Control total | Dashboard, Gestión Postulantes, Evaluaciones, Legajo, Embudo, IA, Usuarios, Seguridad, Config |
| **Evaluador** | 📋 | Evalúa y aprueba | Dashboard, Mis Postulantes, Evaluar, Legajo Trabajador |
| **Postulante** | 👤 | Proceso de ingreso | Mi Ficha, Evaluaciones, Documentos, Entrevistas |
| **Trabajador** | 👷 | Postulante aprobado | Todo + Firmas, Derechohabientes, Bancario, Pensionario, Docs Digitales, Capacitaciones |

---

## 📂 Estructura del Proyecto

```
aquarius-rrhh/
├── index.html              # Página de entrada
├── package.json            # Dependencias
├── vite.config.js          # Configuración de Vite
├── README.md               # Este archivo
├── .gitignore              # Archivos ignorados por Git
└── src/
    ├── main.jsx            # Landing page (Panel Admin / Portal)
    ├── AdminApp.jsx        # Sistema Admin + Evaluador (1287 líneas)
    └── PortalApp.jsx       # Portal Postulante + Trabajador (717 líneas)
```

---

## ⚡ Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/TU-USUARIO/aquarius-rrhh.git
cd aquarius-rrhh

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir http://localhost:5173 en el navegador.

---

## 🌍 Desplegar en Vercel

### Opción A: Desde GitHub (recomendado)
1. Hacer push de este repositorio a GitHub
2. Ir a [vercel.com](https://vercel.com) → Sign up con GitHub
3. "Add New Project" → Seleccionar `aquarius-rrhh`
4. Framework Preset: **Vite**
5. Click "Deploy" → URL pública en ~2 minutos

### Opción B: Desde terminal
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🔄 Flujo del Sistema

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  ADMIN crea │────▶│  POSTULANTE  │────▶│  EVALUADOR   │
│  acceso     │     │  completa:   │     │  califica:   │
│             │     │  • Ficha     │     │  • Técnica   │
│             │     │  • Docs      │     │  • Psicológ. │
│             │     │  • Evaluac.  │     │  • Entrevista│
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                                         ¿Aprueba?
                                          │      │
                                         SÍ     NO
                                          │      │
                                          ▼      ▼
                                   ┌──────────┐  Rechazado
                                   │TRABAJADOR│
                                   │ acceso a:│
                                   │ • Firmas │
                                   │ • Banco  │
                                   │ • AFP    │
                                   │ • Derech.│
                                   │ • Capac. │
                                   └──────────┘
```

---

## 🇵🇪 Contexto Perú

- **Bancos**: Todos los bancos, financieras y cajas vigentes SBS 2026
- **AFP**: Integra, Prima, Habitat, Profuturo + ONP
- **Legislación**: Ley 27269 (firma digital), D.L. 1310 (boletas electrónicas), D.L. 650 (CTS)
- **Documentación**: DNI, antecedentes, certificado médico ocupacional

---

## 🛠️ Tecnologías

- **Frontend**: React 18 + Vite 5
- **Gráficos**: Recharts
- **Firma Digital**: HTML5 Canvas
- **Estilos**: CSS-in-JS (inline styles)
- **Deploy**: Vercel

---

## 📋 Credenciales Demo

No se requieren credenciales reales. Seleccionar cualquier perfil y hacer clic en "Ingresar".

---

**Aquarius Consulting SAC** — Lima, Perú — 2026
