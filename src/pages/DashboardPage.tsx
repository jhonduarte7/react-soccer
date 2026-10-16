/**
 * @file DashboardPage.tsx
 * @description Vista principal y panel de control (Dashboard) de SoccerNet Pro.
 * Proporciona:
 * - Indicadores clave de rendimiento (KPIs) en tiempo real: jugadores, torneos, recaudación y cuerpo técnico.
 * - Widget visual de formación táctica sobre césped interactivo.
 * - Próximos partidos y fechas del calendario de torneos.
 * - Últimos comprobantes y pagos verificados.
 * - Boletín con las noticias y comunicados más recientes del club.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Trophy,
  CreditCard,
  ShieldCheck,
  Calendar,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { soccerApi } from '../api/soccerApi';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PitchGraphic } from '../components/common/PitchGraphic';

/**
 * Componente funcional que renderiza el panel de control ejecutivo del club de fútbol.
 */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['stats'],
    queryFn: soccerApi.getStats,
  });

  const { data: tournaments } = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => soccerApi.getTournaments(),
  });

  const { data: matchdays, isLoading: isLoadingMatches } = useQuery({
    queryKey: ['matchdays'],
    queryFn: () => soccerApi.getMatchdays(),
  });

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => soccerApi.getPayments(),
  });

  const { data: news } = useQuery({
    queryKey: ['news'],
    queryFn: () => soccerApi.getNews(),
  });

  const activeTournaments = (tournaments || []).filter((t) => t.status === 'Activo').length;
  const recentMatches = (matchdays || []).slice(0, 4);
  const recentPayments = (payments || []).slice(0, 5);
  const latestNews = (news || []).slice(0, 2);

  return (
    <div className="space-y-6 sm:space-y-8 animate-slide-down">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-950 border border-emerald-500/20 p-5 sm:p-8 shadow-xl text-white">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 sm:mb-4 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistema Integral de Gestión Deportiva</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Academia Formativa y Torneos de Fútbol
          </h1>
          <p className="mt-2.5 sm:mt-3 text-emerald-100/90 text-xs sm:text-sm lg:text-base leading-relaxed">
            Supervisa el plantel de jugadores, calendario de partidos de torneo, recaudación de cuotas
            y comunicados oficiales del club en tiempo real.
          </p>
          <div className="mt-5 sm:mt-6 flex flex-wrap gap-2.5 sm:gap-3">
            <button
              onClick={() => navigate('/players')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Ver Plantel de Jugadores</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/tournaments')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm border border-slate-700/80 transition-all cursor-pointer"
            >
              Ver Calendario
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/15 to-transparent pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      {isLoadingStats ? (
        <LoadingSkeleton type="stats" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Jugadores Registrados"
            value={stats?.jugadores ?? 55}
            subtitle="Categorías Sub-6 a Sub-20"
            icon={<Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />}
            trend="+12% este mes"
            trendType="positive"
            color="emerald"
            onClick={() => navigate('/players')}
          />
          <StatCard
            title="Torneos y Copas"
            value={stats?.torneos ?? 52}
            subtitle={`${activeTournaments} activos actualmente`}
            icon={<Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />}
            trend="Alta Competencia"
            trendType="positive"
            color="amber"
            onClick={() => navigate('/tournaments')}
          />
          <StatCard
            title="Ingresos y Pagos"
            value={stats?.pagos ?? 55}
            subtitle="Cuotas y equipaciones"
            icon={<CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />}
            trend="Control al día"
            trendType="neutral"
            color="blue"
            onClick={() => navigate('/finances')}
          />
          <StatCard
            title="Categorías Oficiales"
            value={stats?.categorias ?? 52}
            subtitle="Masculino y Femenino"
            icon={<ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />}
            trend="Estructura 4NF"
            trendType="positive"
            color="purple"
            onClick={() => navigate('/categories')}
          />
        </div>
      )}

      {/* Main Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Two Columns: Upcoming Fixtures & Recent Payments */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Upcoming Matches */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 backdrop-blur-md shadow-xs">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Próximos Partidos y Jornadas
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Encuentros confirmados de los torneos oficiales
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/tournaments')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 transition-colors cursor-pointer"
              >
                Ver todo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoadingMatches ? (
              <LoadingSkeleton count={3} />
            ) : recentMatches.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
                No hay partidos próximos programados.
              </p>
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                {recentMatches.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          {m.tournamentName || 'Torneo Oficial'}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          {new Date(m.matchDateTime).toLocaleString('es-ES', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                        <span className="text-emerald-600 dark:text-emerald-300">{m.homeTeam}</span>
                        <span className="text-xs text-slate-400 px-1 font-normal">VS</span>
                        <span className="text-slate-700 dark:text-slate-200">{m.awayTeam}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="truncate max-w-[200px]">{m.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Payments Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 backdrop-blur-md shadow-xs">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Últimos Movimientos Financieros
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Control de cuotas y recibos bancarios de familias
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/finances')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 transition-colors cursor-pointer"
              >
                Ver finanzas <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoadingPayments ? (
              <LoadingSkeleton count={3} />
            ) : recentPayments.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
                No hay registros de pago recientes.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[480px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      <th className="pb-3">Jugador</th>
                      <th className="pb-3">Concepto</th>
                      <th className="pb-3">Monto</th>
                      <th className="pb-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-medium text-slate-900 dark:text-slate-200">
                          {p.playerName || `Jugador #${p.playerId}`}
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 text-xs">
                          {p.paymentConceptName || 'Cuota'}
                        </td>
                        <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          €{Number(p.amountPaid).toFixed(2)}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={
                              p.paymentStatus === 'Aprobado'
                                ? 'success'
                                : p.paymentStatus === 'Pendiente'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                            dot
                          >
                            {p.paymentStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tactical Pitch Preview & Latest News */}
        <div className="space-y-6 sm:space-y-8">
          {/* Tactical Pitch Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 backdrop-blur-md shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Pizarra Táctica de la Academia
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Esquema habitual 4-3-3 y demarcaciones formativas
            </p>
            <PitchGraphic highlightPosition="Mediapunta" />
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={() => navigate('/players')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors cursor-pointer"
              >
                Ver posiciones asignadas en el plantel →
              </button>
            </div>
          </div>

          {/* Latest News Highlights */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 backdrop-blur-md shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Boletín Oficial</h3>
              <button
                onClick={() => navigate('/news')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Todas
              </button>
            </div>

            <div className="space-y-3.5 sm:space-y-4">
              {latestNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate('/news')}
                  className="group cursor-pointer rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all"
                >
                  {item.imageUrl ? (
                    <div className="h-28 w-full overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <div className="p-3.5 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {new Date(item.publicationDate).toLocaleDateString('es-ES')}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
