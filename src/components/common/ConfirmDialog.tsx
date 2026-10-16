/**
 * @file ConfirmDialog.tsx
 * @description Modal de confirmación genérico para acciones críticas (eliminaciones,
 * cambios de estado irreversibles o confirmaciones de cobro/pago).
 */

import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

/**
 * Propiedades recibidas por el diálogo de confirmación.
 */
interface ConfirmDialogProps {
  /** Bandera booleana de visibilidad del modal */
  isOpen: boolean;
  /** Callback invocado al cancelar o cerrar el diálogo */
  onClose: () => void;
  /** Callback invocado cuando el usuario confirma la acción */
  onConfirm: () => void;
  /** Título de la alerta o pregunta */
  title: string;
  /** Explicación detallada de las consecuencias de la acción */
  message: string;
  /** Texto del botón de confirmación (default: 'Confirmar') */
  confirmLabel?: string;
  /** Texto del botón de cancelación (default: 'Cancelar') */
  cancelLabel?: string;
  /** Si es true, muestra botón rojo de peligro y advertencia visual */
  isDangerous?: boolean;
  /** Si es true, deshabilita botones y muestra spinner o texto de carga */
  isLoading?: boolean;
}

/**
 * Diálogo accesible de confirmación basado en el componente Modal principal.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDangerous = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Ícono de peligro condicional */}
        {isDangerous ? (
          <div className="p-2.5 sm:p-3 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 shrink-0 border border-rose-500/20">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        ) : null}
        <div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
        </div>
      </div>

      {/* Botones de acción inferior */}
      <div className="mt-5 sm:mt-6 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800/80 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
          }}
          disabled={isLoading}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 ${
            isDangerous
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/30'
          }`}
        >
          {isLoading ? 'Procesando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
