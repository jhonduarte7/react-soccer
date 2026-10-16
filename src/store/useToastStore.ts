/**
 * @file useToastStore.ts
 * @description Gestor de notificaciones tipo Toast con Zustand para SoccerNet Pro.
 * Permite emitir alertas visuales reactivas (éxito, error, informativo, advertencia)
 * con auto-cierre temporizado configurable.
 */

import { create } from 'zustand';

/**
 * Estructura de un elemento de notificación Toast.
 */
export interface ToastItem {
  /** Identificador único alfanumérico generado en la inserción */
  id: string;
  /** Tipo visual y semántico de la notificación */
  type: 'success' | 'error' | 'info' | 'warning';
  /** Título principal de la alerta */
  title: string;
  /** Descripción o mensaje detallado opcional */
  message?: string;
  /** Tiempo de vida en milisegundos antes de auto-descartarse (default: 4000ms) */
  duration?: number;
}

/**
 * Interfaz con las acciones y estado expuesto por el almacén de Toasts.
 */
interface ToastStore {
  /** Lista de notificaciones actualmente activas en pantalla */
  toasts: ToastItem[];
  /** Método para emitir una nueva notificación */
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  /** Método para descartar manualmente una notificación por su ID */
  removeToast: (id: string) => void;
}

/**
 * Hook global de Zustand para administrar el ciclo de vida de los mensajes Toast.
 * Proporciona soporte para auto-cierre mediante `setTimeout` y eliminación reactiva.
 */
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  /**
   * Agrega un nuevo Toast a la cola y programa su remoción automática según su duración.
   * @param toast Datos de la notificación sin el id generado.
   */
  addToast: (toast) => {
    // Generación de identificador único aleatorio
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...toast, id, duration: toast.duration ?? 4000 };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Si tiene duración mayor a cero, se programa el auto-cierre
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, newToast.duration);
    }
  },

  /**
   * Elimina un Toast inmediatamente de la lista activa.
   * @param id Identificador del toast a eliminar.
   */
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
