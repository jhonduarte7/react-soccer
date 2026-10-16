/**
 * @file MainLayout.tsx
 * @description Estructura de diseño raíz (App Shell) que orquesta la barra lateral de navegación,
 * la cabecera fija, el panel deslizable para pantallas táctiles/móviles y el área principal de vistas.
 */

import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/ToastContainer';
import { useAppStore } from '../../store/useAppStore';

/**
 * Layout principal responsivo para todas las rutas de la aplicación SoccerNet Pro.
 */
export const MainLayout: React.FC = () => {
  const { sidebarOpen, mobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const location = useLocation();

  // Cierra automáticamente el drawer móvil cuando el usuario navega a otra sección
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  // Cierra el drawer móvil al presionar la tecla Escape en cualquier momento
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Contenedor global de alertas Toast */}
      <ToastContainer />

      {/* Sidebar fijo para pantallas grandes (Desktop >= 1024px) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Drawer deslizante con backdrop oscuro para dispositivos móviles (< 1024px) */}
      {mobileMenuOpen ? (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de Navegación Móvil"
        >
          {/* Fondo semi-transparente oscurecido con cierre al hacer tap */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Panel lateral deslizante que contiene el Sidebar en modo móvil */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-950 shadow-2xl z-10 animate-slide-down">
            <Sidebar isMobile onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      ) : null}

      {/* Área de contenido central ajustada dinámicamente según el ancho del Sidebar */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 pl-0 ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        <Header />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Renderizado de la ruta activa hija mediante React Router */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
