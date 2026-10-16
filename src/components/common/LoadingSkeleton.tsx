/**
 * @file LoadingSkeleton.tsx
 * @description Componentes de esqueleto animado (Skeleton Loaders) para retroalimentación
 * visual durante peticiones asíncronas hacia el backend.
 */

import React from 'react';

/**
 * Propiedades del esqueleto de carga.
 */
interface LoadingSkeletonProps {
  /** Variante estructural: tabla, tarjetas de jugador, métricas de dashboard o perfil */
  type?: 'table' | 'card' | 'stats' | 'profile';
  /** Cantidad de elementos repetidos a proyectar */
  count?: number;
}

/**
 * Proyecta contenedores con gradientes pulsantes para reducir el Cumulative Layout Shift (CLS).
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'table',
  count = 4,
}) => {
  // Variante para estadísticas de Dashboard
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-5" />
        ))}
      </div>
    );
  }

  // Variante para cuadrículas de tarjetas
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-slate-200 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-700/60" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-300 dark:bg-slate-700/60 rounded w-3/4" />
                <div className="h-3 bg-slate-300 dark:bg-slate-700/40 rounded w-1/2" />
              </div>
            </div>
            <div className="h-20 bg-slate-300/40 dark:bg-slate-700/20 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  // Variante estándar para tablas de datos
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-10 bg-slate-200 dark:bg-slate-800/70 rounded-xl w-full" />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/40 rounded-xl w-full border border-slate-200 dark:border-slate-800/50" />
      ))}
    </div>
  );
};
