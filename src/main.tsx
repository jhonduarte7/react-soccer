/**
 * @file main.tsx
 * @description Punto de entrada principal (Entry Point) del cliente web Vite + React 19.
 * Monta el componente raíz `App` dentro del elemento `#root` del DOM bajo el modo estricto de React.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';

// Búsqueda del contenedor raíz en el documento HTML
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Error crítico: No se encontró el elemento raíz (#root) en index.html');
}

// Inicialización de la raíz de React 19 con renderizado en StrictMode
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
