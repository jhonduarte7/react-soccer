/**
 * ============================================================================
 * SOCCERNET PRO - CLIENTE HTTP AXIOS
 * ============================================================================
 * Instancia centralizada de Axios configurada con base URL (/api o variable de
 * entorno), cabeceras estándar e interceptores para detección automática del
 * estado de conectividad con el backend Spring Boot.
 */

import axios from 'axios';

/** URL base para las peticiones REST, redirigidas por Vite al backend en puerto 8082 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Cliente HTTP Axios configurado con tiempo límite de 4 segundos para evitar
 * bloqueos de interfaz si el backend no está activo.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de respuestas:
 * Captura fallos de conexión (ej. backend offline) para permitir que la capa de servicio
 * active de forma transparente el repositorio local con datos del DataLoader sin lanzar
 * errores no controlados.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.warn('[API Client] Backend Spring Boot inalcanzable en', API_BASE_URL, '- activando fallback simulado.');
    }
    return Promise.reject(error);
  }
);
