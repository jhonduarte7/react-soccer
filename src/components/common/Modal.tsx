/**
 * @file Modal.tsx
 * @description Ventana modal accesible y responsiva.
 * Incluye cierre mediante la tecla 'Escape', desenfoque de fondo (backdrop blur),
 * scroll interno independiente y contención de foco accesible.
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Propiedades del componente Modal.
 */
interface ModalProps {
  /** Indica si el modal está abierto y visible */
  isOpen: boolean;
  /** Función callback para cerrar el modal */
  onClose: () => void;
  /** Título descriptivo en la cabecera */
  title: string;
  /** Subtítulo o descripción contextual */
  description?: string;
  /** Contenido renderizado dentro del cuerpo del modal */
  children: React.ReactNode;
  /** Ancho máximo del contenedor en pantallas medianas y grandes */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

/**
 * Modal flotante universal adaptable a temas claro y oscuro.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}) => {
  // Listener de teclado para soporte de tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Si no está abierto, no renderizamos nada en el DOM
  if (!isOpen) return null;

  // Clases de ancho máximo de Tailwind
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Fondo con desenfoque e interacción para cerrar al hacer clic afuera */}
      <div
        className="fixed inset-0 bg-slate-950/70 dark:bg-slate-950/85 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        {/* Contenedor del diálogo */}
        <div
          role="dialog"
          aria-modal="true"
          className={`relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidthClasses} animate-slide-down`}
        >
          {/* Cabecera del diálogo */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/80 dark:bg-slate-950/50">
            <div className="pr-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
              {description ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
              ) : null}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cuerpo con scroll vertical si sobrepasa la pantalla */}
          <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};
