/**
 * @file PitchGraphic.tsx
 * @description Representación gráfica interactiva y visual de una cancha de fútbol (cancha táctica).
 * Dibuja las líneas reglamentarias (área de meta, círculo central, penal) y resalta
 * las posiciones de juego activas o seleccionadas (Portero, Defensas, Mediocentros, Delanteros).
 */

import React from 'react';

/**
 * Propiedades del gráfico de cancha de fútbol.
 */
interface PitchGraphicProps {
  /** Posición individual a resaltar con halo dorado brillante */
  highlightPosition?: string;
  /** Lista opcional de posiciones activas simultáneamente */
  positions?: string[];
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente SVG y CSS simulando un campo de fútbol profesional en perspectiva táctica.
 */
export const PitchGraphic: React.FC<PitchGraphicProps> = ({
  highlightPosition,
  positions = [],
  className = '',
}) => {
  // Consolidar todas las posiciones a resaltar
  const activePositions = highlightPosition ? [highlightPosition, ...positions] : positions;

  /**
   * Determina si una posición dada se encuentra en la lista activa (insensible a mayúsculas)
   */
  const isPositionActive = (name: string) => {
    return activePositions.some((p) => p.toLowerCase().includes(name.toLowerCase()));
  };

  return (
    <div
      className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden soccer-pitch border-2 border-emerald-600/40 shadow-inner flex flex-col justify-between p-3 select-none ${className}`}
    >
      {/* Marcaciones perimetrales de la cancha */}
      <div className="absolute inset-2 border-2 border-white/30 rounded pointer-events-none" />

      {/* Línea media y círculo central */}
      <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-white/30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-white/30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/40 pointer-events-none" />

      {/* Área grande y chica superior (campo rival) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-14 border-b-2 border-x-2 border-white/30 pointer-events-none" />
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-6 border-b-2 border-x-2 border-white/30 pointer-events-none" />

      {/* Área grande y chica inferior (nuestro campo) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-14 border-t-2 border-x-2 border-white/30 pointer-events-none" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-6 border-t-2 border-x-2 border-white/30 pointer-events-none" />

      {/* Posiciones de Delanteros */}
      <div className="relative z-10 grid grid-cols-3 text-center pt-3">
        <div className="flex flex-col items-center">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              isPositionActive('Extremo Izquierdo')
                ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/40 scale-110'
                : 'bg-black/40 text-slate-300'
            }`}
          >
            EI
          </span>
          <span className="text-[9px] text-emerald-100/70 mt-0.5">Ext. Izq</span>
        </div>

        <div className="flex flex-col items-center">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              isPositionActive('Delantero Centro')
                ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/40 scale-110'
                : 'bg-black/40 text-slate-300'
            }`}
          >
            DC
          </span>
          <span className="text-[9px] text-emerald-100/70 mt-0.5">Delantero</span>
        </div>

        <div className="flex flex-col items-center">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              isPositionActive('Extremo Derecho')
                ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/40 scale-110'
                : 'bg-black/40 text-slate-300'
            }`}
          >
            ED
          </span>
          <span className="text-[9px] text-emerald-100/70 mt-0.5">Ext. Der</span>
        </div>
      </div>

      {/* Posiciones de Mediocampo */}
      <div className="relative z-10 grid grid-cols-3 text-center my-auto py-1">
        <div className="flex flex-col items-center">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              isPositionActive('Mediapunta')
                ? 'bg-emerald-400 text-slate-950 ring-4 ring-emerald-400/40 scale-110'
                : 'bg-black/40 text-slate-300'
            }`}
          >
            MP
          </span>
          <span className="text-[9px] text-emerald-100/70 mt-0.5">Mediapunta</span>
        </div>

        <div className="flex flex-col items-center">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              isPositionActive('Mediocentro') || isPositionActive('Pivote')
                ? 'bg-emerald-400 text-slate-950 ring-4 ring-emerald-400/40 scale-110'
                : 'bg-black/40 text-slate-300'
            }`}
          >
            MC
          </span>
          <span className="text-[9px] text-emerald-100/70 mt-0.5">Pivote / MC</span>
        </div>

        <div className="flex flex-col items-center">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              isPositionActive('Mediocentro')
                ? 'bg-emerald-400 text-slate-950 ring-4 ring-emerald-400/40 scale-110'
                : 'bg-black/40 text-slate-300'
            }`}
          >
            MC
          </span>
          <span className="text-[9px] text-emerald-100/70 mt-0.5">Interior</span>
        </div>
      </div>

      {/* Posiciones de Defensas y Arquero */}
      <div className="relative z-10 flex flex-col gap-2 pb-2">
        <div className="grid grid-cols-3 text-center">
          <div className="flex flex-col items-center">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                isPositionActive('Lateral Izquierdo')
                  ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/40 scale-110'
                  : 'bg-black/40 text-slate-300'
              }`}
            >
              LI
            </span>
            <span className="text-[9px] text-emerald-100/70 mt-0.5">Lat. Izq</span>
          </div>

          <div className="flex flex-col items-center">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                isPositionActive('Defensa Central')
                  ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/40 scale-110'
                  : 'bg-black/40 text-slate-300'
              }`}
            >
              DFC
            </span>
            <span className="text-[9px] text-emerald-100/70 mt-0.5">Central</span>
          </div>

          <div className="flex flex-col items-center">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                isPositionActive('Lateral Derecho')
                  ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/40 scale-110'
                : 'bg-black/40 text-slate-300'
              }`}
            >
              LD
            </span>
            <span className="text-[9px] text-emerald-100/70 mt-0.5">Lat. Der</span>
          </div>
        </div>

        {/* Guardameta */}
        <div className="flex flex-col items-center justify-center">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              isPositionActive('Portero')
                ? 'bg-rose-400 text-slate-950 ring-4 ring-rose-400/40 scale-110'
                : 'bg-black/40 text-slate-300'
            }`}
          >
            POR
          </span>
          <span className="text-[9px] text-emerald-100/70 mt-0.5">Portero</span>
        </div>
      </div>
    </div>
  );
};
