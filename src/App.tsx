/**
 * @file App.tsx
 * @description Componente raíz de la aplicación SoccerNet Pro.
 * Configura:
 * - Proveedor de consultas asíncronas `@tanstack/react-query` (QueryClientProvider) con políticas de caché y reintentos.
 * - Enrutador principal `react-router-dom` (BrowserRouter, Routes, Route) con App Shell Layout anidado.
 * - Rutas maestras: Dashboard, Jugadores, Torneos, Finanzas, Noticias, Categorías, Tutores y Staff.
 * - Redirección de rutas desconocidas (404 fallback hacia '/').
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PlayersPage } from './pages/PlayersPage';
import { TournamentsPage } from './pages/TournamentsPage';
import { FinancesPage } from './pages/FinancesPage';
import { NewsPage } from './pages/NewsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { GuardiansPage } from './pages/GuardiansPage';
import { StaffPage } from './pages/StaffPage';

/**
 * Instancia global de QueryClient configurada para rendimiento óptimo
 * con tiempo de frescura de 3 minutos y desactivación de refetch al desenfocar ventana.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutos de retención
      retry: 1,                 // 1 reintento automático en caso de fallo de red
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Componente principal que envuelve el árbol de la aplicación con los contextos globales necesarios.
 */
export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/finances" element={<FinancesPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/guardians" element={<GuardiansPage />} />
            <Route path="/staff" element={<StaffPage />} />
            {/* Fallback de ruta para URLs inválidas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
