/**
 * @file ToastContainer.tsx
 * @description Contenedor flotante que renderiza las notificaciones activas del ToastStore.
 * Ubicado en la esquina superior derecha con animaciones suaves y soporte de interacción.
 */

import React from 'react';
import { useToastStore } from '../../store/useToastStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Componente fijado en pantalla (`fixed top-5 right-5`) para desplegar alertas toast.
 */
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  // Si no hay mensajes en la cola, no renderizamos el portal
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md animate-slide-down transition-all duration-200 ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/30'
                : isError
                ? 'bg-slate-900/95 border-rose-500/40 text-rose-100 shadow-rose-950/30'
                : isWarning
                ? 'bg-slate-900/95 border-amber-500/40 text-amber-100 shadow-amber-950/30'
                : 'bg-slate-900/95 border-cyan-500/40 text-cyan-100 shadow-cyan-950/30'
            }`}
          >
            {/* Ícono descriptivo según tipo */}
            <div className="mt-0.5 shrink-0">
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isError ? (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              ) : isWarning ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : (
                <Info className="w-5 h-5 text-cyan-400" />
              )}
            </div>

            {/* Texto y mensaje */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-tight">{toast.title}</h4>
              {toast.message ? (
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed break-words">{toast.message}</p>
              ) : null}
            </div>

            {/* Botón de descarte individual */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-1 -mr-1 rounded-md transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
