/**
 * @file useAppStore.ts
 * @description Almacén central de estado de la aplicación con Zustand.
 * Controla:
 * - Tema visual Claro / Oscuro (Dark/Light mode) con sincronización en `document.documentElement` y `localStorage`.
 * - Estado de expansión y colapso de la barra lateral (Sidebar) en pantallas de escritorio.
 * - Estado del Drawer o menú deslizante para dispositivos móviles.
 * - Filtros globales (categoría seleccionada, estado de torneo y búsqueda textual).
 */

import { create } from 'zustand';

/**
 * Contrato de estado global y métodos de mutación para la interfaz de SoccerNet Pro.
 */
interface AppState {
  /** Modo visual actual: 'dark' para fondos oscuros de alto contraste o 'light' para fondos claros */
  theme: 'dark' | 'light';
  /** Indicador de si el Sidebar de escritorio está expandido (true) o colapsado a íconos (false) */
  sidebarOpen: boolean;
  /** Indicador de visibilidad del Drawer móvil en pantallas pequeñas */
  mobileMenuOpen: boolean;
  /** ID de la categoría activa para filtrado contextual de jugadores y estadísticas */
  selectedCategoryId: number | null;
  /** Estado de torneo seleccionado para filtrar la lista de campeonatos ('Todos', 'EN_CURSO', etc.) */
  selectedTournamentStatus: string;
  /** Término de búsqueda global introducido en la barra de navegación */
  globalSearch: string;

  /** Alterna entre los modos 'dark' y 'light' de forma inmediata */
  toggleTheme: () => void;
  /** Establece directamente un tema específico ('dark' | 'light') */
  setTheme: (theme: 'dark' | 'light') => void;
  /** Alterna la visibilidad del Sidebar en escritorio */
  toggleSidebar: () => void;
  /** Modifica explícitamente el estado del Sidebar en escritorio */
  setSidebarOpen: (open: boolean) => void;
  /** Alterna la apertura o cierre del menú móvil */
  toggleMobileMenu: () => void;
  /** Modifica explícitamente el estado de apertura del menú móvil */
  setMobileMenuOpen: (open: boolean) => void;
  /** Establece el ID de categoría seleccionada */
  setSelectedCategoryId: (id: number | null) => void;
  /** Establece el estado de torneo seleccionado */
  setSelectedTournamentStatus: (status: string) => void;
  /** Establece el término de búsqueda global */
  setGlobalSearch: (query: string) => void;
}

/**
 * Lee la preferencia de tema guardada en `localStorage` o asigna 'dark' por defecto.
 * Aplica además las clases CSS correspondientes en el elemento raíz `<html>`.
 * @returns El tema inicial detectado ('dark' | 'light').
 */
const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem('soccer-app-theme');
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
      return saved;
    }
  } catch {
    // Si localStorage está bloqueado o da error de cuota, usamos fallback
  }
  applyTheme('dark');
  return 'dark';
};

/**
 * Aplica o remueve las clases CSS 'dark' y 'light' sobre `document.documentElement`
 * para garantizar la activación adecuada de las reglas de Tailwind CSS v4.
 * @param theme Tema a aplicar ('dark' | 'light').
 */
const applyTheme = (theme: 'dark' | 'light') => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
};

/**
 * Store global Zustand para gestión del UI Shell, temas y filtros reactivos.
 */
export const useAppStore = create<AppState>((set) => ({
  theme: getInitialTheme(),
  sidebarOpen: true,
  mobileMenuOpen: false,
  selectedCategoryId: null,
  selectedTournamentStatus: 'Todos',
  globalSearch: '',

  /**
   * Alterna entre modo oscuro y claro, persistiendo la selección en localStorage.
   */
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('soccer-app-theme', nextTheme);
      } catch {
        // Fallback en caso de restricciones de almacenamiento del navegador
      }
      applyTheme(nextTheme);
      return { theme: nextTheme };
    }),

  /**
   * Asigna un tema específico de forma explícita.
   */
  setTheme: (theme) => {
    try {
      localStorage.setItem('soccer-app-theme', theme);
    } catch {
      // Ignorar excepciones de cuota
    }
    applyTheme(theme);
    set({ theme });
  },

  /** Alterna la barra lateral para versión de escritorio */
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  /** Define el estado del Sidebar de escritorio */
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  /** Alterna la apertura del menú deslizante para dispositivos móviles */
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

  /** Define el estado de apertura del menú deslizante para móviles */
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  /** Actualiza la categoría deportiva seleccionada para filtros */
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),

  /** Actualiza el filtro por estado de torneo */
  setSelectedTournamentStatus: (status) => set({ selectedTournamentStatus: status }),

  /** Actualiza la consulta de búsqueda en tiempo real */
  setGlobalSearch: (query) => set({ globalSearch: query }),
}));
