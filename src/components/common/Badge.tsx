/**
 * @file Badge.tsx
 * @description Componente reutilizable para insignias de estado (Badges / Tags)
 * con soporte para temas Claro/Oscuro y puntos indicadores opcionales.
 */

import React from 'react';

/** Variantes cromáticas disponibles para el Badge */
type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'blue'
  | 'purple';

/**
 * Propiedades del componente Badge.
 */
interface BadgeProps {
  /** Contenido de texto o nodos hijos a desplegar */
  children: React.ReactNode;
  /** Esquema cromático semántico */
  variant?: BadgeVariant;
  /** Escala de tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  /** Si es true, añade un punto circular con color acentuado a la izquierda */
  dot?: boolean;
  /** Clases CSS adicionales de Tailwind */
  className?: string;
}

/**
 * Insignia visual polimórfica para estados (activo, suspendido, liquidado, etc.).
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  // Mapeo de estilos según la variante seleccionada, adaptado a Tailwind v4 y modo oscuro/claro
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    warning: 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    amber: 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    danger: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
    rose: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
    info: 'bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30',
    blue: 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    purple: 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60',
  };

  // Color del punto indicador
  const dotColors: Record<BadgeVariant, string> = {
    success: 'bg-emerald-500',
    emerald: 'bg-emerald-500',
    warning: 'bg-amber-500',
    amber: 'bg-amber-500',
    danger: 'bg-rose-500',
    rose: 'bg-rose-500',
    info: 'bg-sky-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    neutral: 'bg-slate-400',
  };

  // Clases de tipografía y espaciado según tamaño
  const sizeStyles = {
    sm: 'text-[10px] sm:text-[11px] px-2 py-0.5 font-medium',
    md: 'text-[11px] sm:text-xs px-2.5 py-1 font-semibold',
    lg: 'text-xs sm:text-sm px-3 py-1.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase ${variantStyles[variant]} ${sizeStyles} ${className}`}
    >
      {dot ? <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} /> : null}
      {children}
    </span>
  );
};
