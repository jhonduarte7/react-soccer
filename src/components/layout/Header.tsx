/**
 * @file Header.tsx
 * @description Barra superior de navegación (Top Navigation Bar) de SoccerNet Pro.
 * Incluye:
 * - Botón de hamburguesa para desplegar el menú en dispositivos móviles.
 * - Búsqueda global interactiva con limpiador rápido.
 * - Interruptor de tema Claro / Oscuro con etiquetas e iconos dinámicos.
 * - Notificaciones del sistema e indicador de temporada.
 * - Perfil del usuario activo (Director Deportivo).
 */

import React from 'react';
import { Search, Sun, Moon, Bell, Shield, Sparkles, Menu } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

/**
 * Encabezado responsivo fijo con efecto 'backdrop-blur'.
 */
export const Header: React.FC = () => {
  const { theme, toggleTheme, globalSearch, setGlobalSearch, toggleMobileMenu } = useAppStore();

  return (
    <header className="sticky top-0 z-20 h-16 sm:h-20 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-3 transition-colors duration-200">
      {/* Zona Izquierda: Disparador del Drawer móvil y caja de búsqueda */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {/* Botón de Menú Móvil (visible solo en pantallas menores a 'lg') */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors shrink-0"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Input de Búsqueda Global */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Buscar en el club..."
            className="w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          {globalSearch ? (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      {/* Zona Derecha: Temporada activa, Switch de Tema, Notificaciones y Perfil */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Etiqueta de Temporada Activa */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>2025/2026</span>
        </div>

        {/* Botón de alternancia de Tema Claro / Oscuro */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-500 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
          title={`Activar tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          aria-label="Cambiar tema de color"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
          <span className="text-[11px] font-bold uppercase hidden sm:inline-block">
            {theme === 'dark' ? 'Claro' : 'Oscuro'}
          </span>
        </button>

        {/* Campana de Notificaciones */}
        <button
          className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-all relative"
          title="Notificaciones"
          aria-label="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
        </button>

        {/* Información y Avatar del Usuario Activo */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm shadow-xs">
            CR
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
              Carlos Rodriguez
              <Shield className="w-3 h-3 text-emerald-500 fill-emerald-500/20" />
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Director Deportivo</p>
          </div>
        </div>
      </div>
    </header>
  );
};
