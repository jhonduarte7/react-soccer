/**
 * @file EmptyState.tsx
 * @description Componente para mostrar cuando una lista o sección no posee datos registrados.
 * Ofrece un ícono representativo, título, explicación y botón de llamada a la acción opcional.
 */

import React from 'react';
import { FolderSearch } from 'lucide-react';

/**
 * Propiedades del componente EmptyState.
 */
interface EmptyStateProps {
  /** Título principal que resume la falta de elementos */
  title: string;
  /** Explicación de apoyo o sugerencia sobre qué hacer */
  description?: string;
  /** Nodo de ícono personalizado; por defecto muestra FolderSearch */
  icon?: React.ReactNode;
  /** Acción principal opcional con etiqueta y handler */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Vista de estado vacío responsiva y adaptable a modo claro/oscuro.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-xs">
      {/* Contenedor circular del ícono */}
      <div className="p-3.5 sm:p-4 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 mb-3 sm:mb-4">
        {icon || <FolderSearch className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500 dark:text-emerald-400" />}
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-200">{title}</h3>
      {description ? (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4 sm:mb-5">
          {description}
        </p>
      ) : null}
      {/* Botón de acción */}
      {action ? (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
};
