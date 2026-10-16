# ⚽ SoccerNet Pro - Frontend de Gestión Integral de Club y Academia de Fútbol

![SoccerNet Pro](https://img.shields.io/badge/SoccerNet-Pro%20Academy-10b981?style=for-the-badge&logo=shield)
![React 19](https://img.shields.io/badge/React-19.0.0-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss)
![Vite 6](https://img.shields.io/badge/Vite-6.4-646cff?style=for-the-badge&logo=vite)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6db33f?style=for-the-badge&logo=springboot)

SoccerNet Pro es una plataforma web moderna, interactiva y responsiva de alto rendimiento diseñada para la administración y operación de academias de fútbol formativo, planteles deportivos, gestión de torneos y control de finanzas. 

Este proyecto corresponde a la capa frontend cliente construida con **React 19**, **TypeScript**, **Tailwind CSS v4** y **Zustand**, diseñada específicamente para integrarse y consumir las APIs RESTful del backend **SOCCER** desarrollado en **Spring Boot** (puerto `8082`).

---

## 📋 Tabla de Contenidos
1. [Contexto y Arquitectura del Proyecto](#-contexto-y-arquitectura-del-proyecto)
2. [Características Principales](#-características-principales)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Requisitos Previos](#-requisitos-previos)
5. [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
6. [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno)
7. [Modo Autónomo de Contingencia (Fallback Mode)](#-modo-autónomo-de-contingencia-fallback-mode)
8. [Diseño Responsivo y Temas (Claro / Oscuro)](#-diseño-responsivo-y-temas-claro--oscuro)
9. [Scripts Disponibles](#-scripts-disponibles)
10. [Integración con el Backend Spring Boot](#-integración-con-el-backend-spring-boot)

---

## 🏟️ Contexto y Arquitectura del Proyecto

El sistema está concebido para resolver las necesidades operativas de clubes deportivos modernos:
- **Gestión de Futbolistas y Canteras**: Ficha integral de cada jugador, control de edad, categoría deportiva, dorsal y múltiples posiciones tácticas representadas en una cancha virtual interactiva.
- **Modelo Relacional en Cuarta Forma Normal (4NF)**: Asociación flexible y desacoplada entre jugadores menores de edad y sus tutores legales o apoderados (`PlayerGuardian`), garantizando integridad referencial.
- **Torneos, Fixtures y Partidos**: Creación de campeonatos, programación de jornadas (`Matchdays`), registro de enfrentamientos locales vs visitantes, marcadores en vivo, fechas y sedes.
- **Tesorería y Auditoría Financiera**: Registro de pagos y comprobantes bancarios de aranceles (matrículas, mensualidades, uniformes), con flujo de aprobación o rechazo en tiempo real.
- **Prensa y Revista Digital**: Módulo de noticias oficiales, comunicados institucionales y galería editorial.
- **Cuerpo Técnico y Seguridad**: Directorio de directores técnicos, preparadores físicos, médicos y control de roles RBAC (`ROLE_ADMIN`, `ROLE_HEAD_COACH`, etc.).

### Stack Tecnológico
| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework UI** | React 19 (Strict Mode) | Biblioteca declarativa de interfaces de usuario |
| **Lenguaje** | TypeScript 5.7+ | Tipado estático robusto y autocompletado |
| **Bundler & Dev Server** | Vite 6 | Compilación ultra rápida mediante ESM nativo |
| **Motor de Estilos** | Tailwind CSS v4 + `@tailwindcss/vite` | Utility-first CSS moderno con soporte para variantes de tema |
| **Estado del Servidor** | TanStack Query v5 (React Query) | Caché inteligente, invalidación de consultas y sincronización en segundo plano |
| **Estado del Cliente** | Zustand | Gestión liviana de temas visuales, drawer móvil y notificaciones toast |
| **Formularios & Validación** | React Hook Form + Zod | Formularios tipados con validación declarativa de esquemas |
| **Iconografía** | Lucide React | Paquete vectorial moderno y estilizado |
| **Enrutamiento** | React Router v7 | Enrutamiento SPA con layout jerárquico |
| **Cliente HTTP** | Axios | Cliente HTTP con interceptores y proxy inverso hacia Spring Boot |

---

## ✨ Características Principales

### 1. Panel de Control & KPIs (Dashboard)
- Resumen ejecutivo con 4 tarjetas de métricas en vivo: Total Atletas, Torneos Vigentes, Recaudación Total y Personal Técnico.
- Pizarra de Formación Táctica (`PitchGraphic`) con renderizado de demarcaciones de campo y jugadores posicionados.
- Próximas fechas de partidos con información de sede, fecha y rival.
- Comprobantes de pago recientes y estado de conciliación.
- Novedades y comunicados de prensa recientes.

### 2. Plantel de Jugadores (`/players`)
- Vistas alternables: **Cuadrícula Táctica** con tarjetas de perfil o **Tabla Compacta**.
- Búsqueda en tiempo real por nombre, apodo o número de dorsal.
- Filtro por categorías formativas (SUB-6 a SUB-20, Femenino, Alto Rendimiento).
- Ficha detallada con:
  - Cálculo automático de edad según fecha de nacimiento.
  - Asignación interactiva de posiciones sobre la cancha (Portero, Defensa, Pivote, Mediapunta, Extremo, Delantero).
  - Datos de contacto y tutores asignados.
- Alta federativa y edición validada en tiempo real mediante esquemas Zod.

### 3. Torneos y Calendario de Jornadas (`/tournaments`)
- Clasificación de torneos por estado: *En Curso*, *Planificado*, *Finalizado*.
- Selector de jornadas por campeonato con marcadores de juego, sedes y horarios.
- Modales para dar de alta torneos y agregar jornadas/partidos con validación.

### 4. Finanzas y Recaudación (`/finances`)
- Indicadores de tesorería: Total Recaudado (Validado), En Verificación (Pendiente) y Rechazados.
- Libro diario de comprobantes de pago con búsqueda por referencia bancaria o atleta.
- Acciones de auditoría rápida: Aprobar o Rechazar comprobante en un solo clic con notas explicativas.
- Catálogo de conceptos arancelarios (cuotas mensuales, inscripciones, indumentaria deportiva).

### 5. Boletín Informativo & Prensa (`/news`)
- Formato magazine con nota destacada y carrusel de noticias.
- Lector modal a pantalla completa para lectura cómoda de crónicas y comunicados.
- Publicación de nuevas noticias con autor del staff y fotografía de portada.

### 6. Estructura de Categorías (`/categories`)
- Visualización de divisiones formativas con censo de futbolistas registrados por categoría.
- Creación rápida de nuevas categorías deportivas.

### 7. Tutores Legales (`/guardians`)
- Gestión de apoderados y acudientes autorizados (padre, madre o tutor legal).
- Directorio de teléfonos de emergencia y correos electrónicos.

### 8. Staff y Cuerpo Técnico (`/staff`)
- Directorio de entrenadores, preparadores físicos, médicos, utileros y directores deportivos.
- Catálogo de roles de acceso del sistema con descripciones operativas.

---

## 📂 Estructura del Proyecto

```text
react-soccer/
├── public/                 # Archivos estáticos y favicon
├── src/
│   ├── api/
│   │   ├── client.ts            # Instancia Axios con baseURL y headers configurados
│   │   ├── soccerApi.ts         # Métodos de API REST tipados para todos los módulos
│   │   └── mockFallbackData.ts  # Datos semilla en memoria para modo autónomo/demostración
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.tsx           # Insignias semánticas con puntos de estado
│   │   │   ├── ConfirmDialog.tsx   # Diálogo de confirmación accesible para acciones críticas
│   │   │   ├── EmptyState.tsx      # Vista visual para listas sin datos
│   │   │   ├── LoadingSkeleton.tsx # Esqueletos pulsantes (Skeleton Loaders) anti-CLS
│   │   │   ├── Modal.tsx           # Ventana modal accesible con tecla ESC y backdrop blur
│   │   │   ├── PitchGraphic.tsx    # Gráfico interactivo de cancha de fútbol
│   │   │   ├── StatCard.tsx        # Tarjetas de indicadores clave (KPI Cards)
│   │   │   └── ToastContainer.tsx  # Contenedor de notificaciones emergentes
│   │   └── layout/
│   │       ├── Header.tsx          # Barra superior con búsqueda, tema y perfil
│   │       ├── MainLayout.tsx      # App Shell principal responsivo con Drawer móvil
│   │       └── Sidebar.tsx         # Barra de navegación lateral fija y colapsable
│   ├── pages/
│   │   ├── CategoriesPage.tsx   # Vista de categorías formativas
│   │   ├── DashboardPage.tsx    # Panel ejecutivo principal
│   │   ├── FinancesPage.tsx     # Finanzas, pagos y aranceles
│   │   ├── GuardiansPage.tsx    # Tutores legales y acudientes (4NF)
│   │   ├── NewsPage.tsx         # Revista digital de noticias
│   │   ├── PlayersPage.tsx      # Gestión de jugadores y alineación
│   │   ├── StaffPage.tsx        # Cuerpo técnico y roles
│   │   └── TournamentsPage.tsx  # Torneos y fixtures de partidos
│   ├── schemas/
│   │   └── soccerSchemas.ts     # Esquemas de validación Zod para todos los formularios
│   ├── store/
│   │   ├── useAppStore.ts       # Estado de UI: Tema Dark/Light, Sidebar y Drawer móvil
│   │   └── useToastStore.ts     # Notificaciones Toast con auto-cierre
│   ├── types/
│   │   └── soccer.ts            # Definiciones de tipos TypeScript de todo el dominio
│   ├── App.tsx                  # Configuración de React Router y TanStack Query
│   ├── index.css                # Estilos globales y configuración Tailwind CSS v4
│   └── main.tsx                 # Entrada de la aplicación React 19
├── .gitignore               # Exclusiones de Git (node_modules, dist, logs, caches)
├── index.html               # Plantilla HTML base
├── package.json             # Dependencias y scripts de ejecución
├── tsconfig.json            # Configuración de compilador TypeScript
└── vite.config.ts           # Configuración del empaquetador Vite y proxy de API
```

---

## ⚙️ Requisitos Previos

Para ejecutar la aplicación en un entorno local, se requiere:
- **Node.js**: Versión `18.0.0` o superior (se recomienda Node 20 LTS o 22 LTS).
- **npm** (v9+), **pnpm** (v8+) o **yarn** (v1.22+).
- **Git**: Para clonar y versionar el proyecto.
- *(Opcional)* **Java 17+** y **Maven**: Para iniciar el backend `SOCCER` en el puerto `8082`.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el Repositorio
```bash
git clone https://github.com/jhonduarte7/react-soccer.git
cd react-soccer
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

La consola mostrará la URL de acceso:
```
  VITE v6.4.4  ready in 250 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

Abre tu navegador en `http://localhost:5174` (o `http://localhost:5173`).

---

## 🔧 Configuración de Variables de Entorno

Puedes crear un archivo `.env` en la raíz del proyecto para ajustar la dirección del backend:

```env
# URL base de los endpoints REST del backend Spring Boot
VITE_API_URL=http://localhost:8082/api
```

> **Nota sobre el Proxy de Desarrollo**: El archivo `vite.config.ts` incluye un proxy automático configurado hacia `http://localhost:8082`, lo que previene problemas de CORS durante el desarrollo local sin necesidad de configuraciones adicionales.

---

## 🛡️ Modo Autónomo de Contingencia (Fallback Mode)

SoccerNet Pro incluye un sistema de **resiliencia de datos**:
- Al iniciar, el frontend intenta conectarse con el servidor Spring Boot en `http://localhost:8082`.
- Si el backend no se encuentra activo o responde con error de red, la aplicación **conmuta automáticamente al modo de contingencia en memoria** sin interrumpir la experiencia de usuario.
- Esto permite realizar pruebas completas de interfaz, demostraciones ejecutivas y revisión de flujos (crear jugadores, validar pagos, programar partidos) de forma 100% autónoma.
- El estado de la conexión se puede auditar visualmente en la parte inferior de la barra lateral (`Backend Spring Boot - Puerto 8082 Activo` o `API v1.0 / Fallback OK`).

---

## 🌓 Diseño Responsivo y Temas (Claro / Oscuro)

### Modo Claro y Modo Oscuro Dinámico
- Conmutador accesible en la cabecera superior con iconos interactivos (`Sun` y `Moon`).
- La preferencia del usuario se almacena inmediatamente en `localStorage` bajo la clave `soccer-app-theme`.
- Sincronización automática de clases `dark` y `light` sobre el elemento raíz `<html>` compatible con la directiva `@custom-variant dark (&:where(.dark, .dark *));` de **Tailwind CSS v4**.

### Adaptación Móvil Integral (100% Mobile First)
- **Drawer Lateral Deslizable**: En pantallas pequeñas (`< 1024px`), el Sidebar se transforma en un menú deslizante suave con fondo atenuado y soporte para cierre con la tecla `Escape` o clic exterior.
- **Tablas con Desplazamiento Horizontal Seguro**: Las tablas de jugadores, pagos y fixtures están contenidas en contenedores fluidos `overflow-x-auto` para evitar desbordamientos visuales.
- **Cuadrículas Adaptativas**: De 1 columna en smartphones a 4 columnas en monitores panorámicos.
- **Modales Optimizados**: Ajuste automático del tamaño de modales (`max-w-lg`, `max-w-2xl`) con scroll independiente para formularios extensos en pantallas reducidas.

---

## 📜 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo Vite con Hot Module Replacement (HMR). |
| `npm run build` | Compila TypeScript y genera el empaquetado optimizado para producción en `/dist`. |
| `npm run preview` | Previsualiza localmente la compilación de producción generada en `/dist`. |
| `npm run lint` | Ejecuta ESLint para analizar el código fuente en busca de problemas de estilo y calidad. |

---

## 🔗 Integración con el Backend Spring Boot

El frontend se conecta con los siguientes controladores REST del backend:

| Módulo | Endpoint Base | Operaciones |
| :--- | :--- | :--- |
| **Estadísticas** | `/api/stats` | `GET`: KPIs de jugadores, torneos, pagos y categorías |
| **Jugadores** | `/api/players` | `GET`, `POST`, `PUT`, `DELETE`: Gestión de futbolistas |
| **Categorías** | `/api/categories` | `GET`, `POST`: Divisiones formativas por edad |
| **Torneos** | `/api/tournaments` | `GET`, `POST`, `PUT`: Campeonatos deportivos |
| **Jornadas/Fixtures** | `/api/tournaments/matchdays` | `GET`, `POST`, `PUT`: Fechas, partidos y resultados |
| **Pagos & Finanzas** | `/api/payments` | `GET`, `POST`, `PUT`: Comprobantes y auditoría de recaudación |
| **Aranceles** | `/api/payments/concepts` | `GET`, `POST`: Catálogo maestro de cobros |
| **Noticias** | `/api/news` | `GET`, `POST`, `DELETE`: Artículos y comunicados |
| **Tutores (4NF)** | `/api/guardians` | `GET`, `POST`: Representantes legales de futbolistas |
| **Staff & Roles** | `/api/users`, `/api/roles` | `GET`, `POST`: Personal técnico y perfiles de seguridad |

---

## 👨‍💻 Autor y Licencia

Desarrollado para el ecosistema **SoccerNet Pro** como cliente frontend del proyecto **SOCCER**.

Repositorio oficial: [https://github.com/jhonduarte7/react-soccer](https://github.com/jhonduarte7/react-soccer)
