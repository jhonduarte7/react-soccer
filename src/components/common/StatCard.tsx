/**
 * @file StatCard.tsx
 * @description Tarjeta visual de indicador clave (KPI Card) para el Dashboard y módulos.
 * Muestra valor, título, ícono temático, porcentaje o tendencia, y gradiente acentuado.
 */

import React from 'react';

/**
 * Propiedades del componente StatCard.
 */
interface StatCardProps {
  /** Título superior de la métrica (ej. 'TOTAL JUGADORES') */
  title: string;
  /** Valor numérico o formateado (ej. '124', '$ 15.2M') */
  value: string | number;
  /** Texto explicativo secundario */
  subtitle?: string;
  /** Elemento SVG o ícono de Lucide React */
  icon: React.ReactNode;
  /** Cadena que describe la tendencia (ej. '+12% vs mes anterior') */
  trend?: string;
  /** Sentido del indicador de tendencia para colorear verde, rojo o neutro */
  trendType?: 'positive' | 'negative' | 'neutral';
  /** Esquema de color del halo y borde */
  color?: 'emerald' | 'blue' | 'amber' | 'purple' | 'rose';
  /** Handler opcional para navegación o interacción al hacer clic */
  onClick?: () => void;
}

/**
 * Tarjeta de métrica con iluminación sutil y bordes reactivos al modo oscuro.
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'positive',
  color = 'emerald',
  onClick,
}) => {
  // Gradientes semánticos para el fondo
  const colorGradients = {
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    blue: 'from-blue-500/10 to-transparent border-blue-500/20 text-blue-600 dark:text-blue-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-600 dark:text-amber-400',
    purple: 'from-purple-500/10 to-transparent border-purple-500/20 text-purple-600 dark:text-purple-400',
    rose: 'from-rose-500/10 to-transparent border-rose-500/20 text-rose-600 dark:text-rose-400',
  }[color];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorGradients} bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 backdrop-blur-md shadow-xs dark:shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-emerald-500/50' : ''
      }`}
    >
      {/* Resplandor decorativo de fondo */}
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shrink-0">
          {icon}
        </div>
      </div>

      {/* Subtítulo y tendencia */}
      {(subtitle || trend) ? (
        <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800/60">
          {subtitle ? <span className="text-slate-500 dark:text-slate-400 font-medium truncate mr-2">{subtitle}</span> : <div />}
          {trend ? (
            <span
              className={`font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                trendType === 'positive'
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10'
                  : trendType === 'negative'
                  ? 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-500/10'
                  : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {trend}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
