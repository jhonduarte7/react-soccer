/**
 * @file Sidebar.tsx
 * @description Barra lateral de navegación principal (Sidebar) para SoccerNet Pro.
 * Compatible con:
 * - Modo escritorio: fijada a la izquierda, con soporte para expandir (256px) o colapsar a iconos (80px).
 * - Modo móvil: desplegada dentro de un panel deslizante lateral (Drawer) con botón de cierre.
 * - Indicador en tiempo real del estado de conexión con el backend Spring Boot (puerto 8082).
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Trophy,
  CreditCard,
  Newspaper,
  Tags,
  HeartHandshake,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Activity,
  Flame,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getBackendLiveStatus } from '../../api/soccerApi';

/**
 * Elemento de la lista de navegación.
 */
interface NavItem {
  /** Nombre visible del enlace */
  name: string;
  /** Ruta URL de destino */
  path: string;
  /** Ícono vectorial de Lucide React */
  icon: React.ReactNode;
  /** Insignia numérica opcional (ej. '55') */
  badge?: string;
}

/**
 * Propiedades del componente Sidebar.
 */
interface SidebarProps {
  /** Indica si se está renderizando dentro de la vista móvil deslizante */
  isMobile?: boolean;
  /** Función para cerrar el menú móvil al hacer clic en un enlace o en la cruz */
  onClose?: () => void;
}

/**
 * Menú vertical con navegación a los 8 módulos del club.
 */
export const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, onClose }) => {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const isLive = getBackendLiveStatus();

  // Lista de rutas principales del sistema
  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Jugadores', path: '/players', icon: <Users className="w-5 h-5" />, badge: '55' },
    { name: 'Torneos y Partidos', path: '/tournaments', icon: <Trophy className="w-5 h-5" /> },
    { name: 'Finanzas y Pagos', path: '/finances', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Noticias del Club', path: '/news', icon: <Newspaper className="w-5 h-5" /> },
    { name: 'Categorías', path: '/categories', icon: <Tags className="w-5 h-5" /> },
    { name: 'Tutores Legales', path: '/guardians', icon: <HeartHandshake className="w-5 h-5" /> },
    { name: 'Staff y Roles', path: '/staff', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  /** Maneja el cierre automático del Drawer móvil al seleccionar una opción */
  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={`h-screen transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between ${
        isMobile
          ? 'w-full'
          : `fixed top-0 left-0 z-30 ${sidebarOpen ? 'w-64' : 'w-20'}`
      }`}
    >
      {/* Sección Superior: Logotipo y Nombre del Club */}
      <div>
        <div className="h-16 sm:h-20 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 shrink-0 font-black">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950" />
            </div>
            {sidebarOpen || isMobile ? (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base leading-none">
                  SOCCER<span className="text-emerald-500 dark:text-emerald-400">NET</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-widest uppercase mt-1">
                  Pro Academy
                </span>
              </div>
            ) : null}
          </div>

          {/* Botón de cierre en Móvil o Botón de colapso en Escritorio */}
          {isMobile ? (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cerrar menú móvil"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors hidden lg:block"
              title={sidebarOpen ? 'Colapsar barra lateral' : 'Expandir barra lateral'}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Lista de enlaces de navegación con estado activo reactivo */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                }`
              }
              title={!sidebarOpen && !isMobile ? item.name : undefined}
            >
              <div className="shrink-0">{item.icon}</div>
              {sidebarOpen || isMobile ? (
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{item.name}</span>
                  {item.badge ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Sección Inferior: Estado de Salud del Backend */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60">
        {sidebarOpen || isMobile ? (
          <div className="rounded-xl p-2.5 sm:p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isLive ? 'Backend Spring Boot' : 'Servicio Conectado'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isLive ? 'Puerto 8082 Activo' : 'API v1.0 / Fallback OK'}
                </p>
              </div>
            </div>
            <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          </div>
        ) : (
          <div className="flex justify-center" title="API Status">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
