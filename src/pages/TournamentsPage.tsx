/**
 * @file TournamentsPage.tsx
 * @description Módulo de campeonatos deportivos, calendarios y fechas de juego (Fixtures).
 * Capacidades:
 * - Registro y administración de Torneos de Fútbol (Nombre, edición, fechas de inicio/fin, estado).
 * - Creación de Jornadas / Fechas (Matchdays) asociadas a cada torneo.
 * - Registro de enfrentamientos con rivales, marcadores en vivo, sedes y horarios.
 * - Puntuación y estados de partidos (Pendiente, En Juego, Finalizado, Suspendido).
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Trophy,
  Plus,
  Calendar,
  MapPin,
  Clock,
  Trash2,
  Swords,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { soccerApi } from '../api/soccerApi';
import { Tournament, TournamentMatchday } from '../types/soccer';
import {
  tournamentSchema,
  TournamentFormData,
  tournamentMatchdaySchema,
  TournamentMatchdayFormData,
} from '../schemas/soccerSchemas';
import { useToastStore } from '../store/useToastStore';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

/**
 * Vista de administración de torneos y fixtures de partidos.
 */
export const TournamentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);

  // Modals
  const [isCreateTournamentOpen, setIsCreateTournamentOpen] = useState(false);
  const [isCreateMatchdayOpen, setIsCreateMatchdayOpen] = useState(false);
  const [deletingTournament, setDeletingTournament] = useState<Tournament | null>(null);
  const [deletingMatchday, setDeletingMatchday] = useState<TournamentMatchday | null>(null);

  // 1. Fetch tournaments
  const { data: tournaments = [], isLoading: isLoadingTournaments } = useQuery({
    queryKey: ['tournaments', statusFilter],
    queryFn: () => soccerApi.getTournaments(statusFilter === 'Todos' ? undefined : statusFilter),
  });

  // 2. Fetch matchdays (can filter by selected tournament)
  const { data: matchdays = [], isLoading: isLoadingMatchdays } = useQuery({
    queryKey: ['matchdays', selectedTournamentId],
    queryFn: () => soccerApi.getMatchdays(selectedTournamentId ?? undefined),
  });

  // Tournament Form
  const {
    register: registerTourn,
    handleSubmit: handleSubmitTourn,
    reset: resetTourn,
    formState: { errors: errorsTourn, isSubmitting: isSubmittingTourn },
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      tournamentName: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Activo',
    },
  });

  // Matchday Form
  const {
    register: registerMatch,
    handleSubmit: handleSubmitMatch,
    reset: resetMatch,
    setValue: setValueMatch,
    formState: { errors: errorsMatch, isSubmitting: isSubmittingMatch },
  } = useForm<TournamentMatchdayFormData>({
    resolver: zodResolver(tournamentMatchdaySchema),
    defaultValues: {
      tournamentId: tournaments[0]?.id || 1,
      homeTeam: 'Academia SoccerNet',
      awayTeam: '',
      matchDateTime: new Date().toISOString().slice(0, 16),
      location: 'Sede Cancha Principal - Campo #1',
    },
  });

  // Create Tournament Mutation
  const createTournamentMutation = useMutation({
    mutationFn: (data: TournamentFormData) => soccerApi.createTournament(data),
    onSuccess: (newT) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      addToast({
        type: 'success',
        title: 'Torneo Registrado',
        message: `El torneo "${newT.tournamentName}" ha sido añadido.`,
      });
      setIsCreateTournamentOpen(false);
      resetTourn();
    },
  });

  // Delete Tournament Mutation
  const deleteTournamentMutation = useMutation({
    mutationFn: (id: number) => soccerApi.deleteTournament(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      addToast({ type: 'success', title: 'Torneo Eliminado' });
      setDeletingTournament(null);
    },
  });

  // Create Matchday Mutation
  const createMatchdayMutation = useMutation({
    mutationFn: (data: TournamentMatchdayFormData) => soccerApi.createMatchday(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchdays'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      addToast({
        type: 'success',
        title: 'Partido Programado',
        message: 'El encuentro ha sido incorporado al calendario oficial.',
      });
      setIsCreateMatchdayOpen(false);
      resetMatch();
    },
  });

  // Delete Matchday Mutation
  const deleteMatchdayMutation = useMutation({
    mutationFn: (id: number) => soccerApi.deleteMatchday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchdays'] });
      addToast({ type: 'info', title: 'Partido Cancelado / Eliminado' });
      setDeletingMatchday(null);
    },
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-slide-down">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Torneos y Calendario de Jornadas
            <Badge variant="amber" size="sm">
              {tournaments.length} Competiciones
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestión de ligas, copas regionales, emparejamientos y canchas
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            onClick={() => {
              if (selectedTournamentId) {
                setValueMatch('tournamentId', selectedTournamentId);
              } else if (tournaments.length > 0) {
                setValueMatch('tournamentId', tournaments[0].id);
              }
              setIsCreateMatchdayOpen(true);
            }}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Swords className="w-4 h-4 text-amber-500" />
            <span>Programar Partido</span>
          </button>

          <button
            onClick={() => setIsCreateTournamentOpen(true)}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Torneo</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4 overflow-x-auto scrollbar-none">
        {['Todos', 'Activo', 'Planificado', 'Finalizado'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === st
                ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {st === 'Todos' ? 'Todos los Estados' : `Torneos ${st}s`}
          </button>
        ))}
      </div>

      {/* Tournaments Grid */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>Competiciones Disponibles</span>
        </h2>

        {isLoadingTournaments ? (
          <LoadingSkeleton type="card" count={3} />
        ) : tournaments.length === 0 ? (
          <EmptyState
            title="No se encontraron torneos"
            description="No hay torneos registrados para el filtro seleccionado."
            action={{
              label: 'Crear Nuevo Torneo',
              onClick: () => setIsCreateTournamentOpen(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {tournaments.map((t) => {
              const isSelected = selectedTournamentId === t.id;

              return (
                <div
                  key={t.id}
                  className={`group rounded-2xl p-4 sm:p-5 border transition-all backdrop-blur-sm flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-amber-500 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                            {t.tournamentName}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">ID #{t.id}</p>
                        </div>
                      </div>

                      <Badge
                        variant={
                          t.status === 'Activo'
                            ? 'success'
                            : t.status === 'Planificado'
                            ? 'info'
                            : 'neutral'
                        }
                        size="sm"
                        dot
                      >
                        {t.status}
                      </Badge>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          Inicio:
                        </span>
                        <span className="font-mono">{t.startDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          Fin:
                        </span>
                        <span className="font-mono">{t.endDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <button
                      onClick={() =>
                        setSelectedTournamentId(isSelected ? null : t.id)
                      }
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{isSelected ? 'Mostrando Partidos' : 'Ver Partidos'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingTournament(t)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Eliminar torneo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Matchdays Section */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-md space-y-5 sm:space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-emerald-500" />
              <span>
                {selectedTournamentId
                  ? `Jornadas del Torneo #${selectedTournamentId}`
                  : 'Todas las Jornadas y Encuentros'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Horarios, emparejamientos y campos de juego asignados
            </p>
          </div>

          {selectedTournamentId ? (
            <button
              onClick={() => setSelectedTournamentId(null)}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline self-start sm:self-auto cursor-pointer"
            >
              Mostrar partidos de todos los torneos
            </button>
          ) : null}
        </div>

        {isLoadingMatchdays ? (
          <LoadingSkeleton count={3} />
        ) : matchdays.length === 0 ? (
          <EmptyState
            title="Sin partidos programados"
            description="No hay partidos fijados para este torneo. Añade la primera jornada."
            action={{
              label: 'Programar Nuevo Partido',
              onClick: () => setIsCreateMatchdayOpen(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {matchdays.map((m) => (
              <div
                key={m.id}
                className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      {m.tournamentName || `Torneo #${m.tournamentId}`}
                    </span>
                    <button
                      onClick={() => setDeletingMatchday(m)}
                      className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      title="Cancelar partido"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Team vs Team Card */}
                  <div className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 min-w-0">
                      <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="truncate">{m.homeTeam}</span>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0 mx-2">
                      VS
                    </span>

                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 min-w-0">
                      <span className="truncate">{m.awayTeam}</span>
                      <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>
                      {new Date(m.matchDateTime).toLocaleString('es-ES', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="truncate max-w-[200px]">{m.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE TOURNAMENT MODAL */}
      <Modal
        isOpen={isCreateTournamentOpen}
        onClose={() => setIsCreateTournamentOpen(false)}
        title="Crear Nueva Competición"
        description="Registra un nuevo torneo oficial o liga para el club"
      >
        <form onSubmit={handleSubmitTourn((d) => createTournamentMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Nombre de la Competición
            </label>
            <input
              {...registerTourn('tournamentName')}
              type="text"
              placeholder="Ej. Copa Oro Apertura 2025"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
            {errorsTourn.tournamentName ? (
              <p className="text-xs text-rose-500 mt-1">{errorsTourn.tournamentName.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Fecha de Inicio
              </label>
              <input
                {...registerTourn('startDate')}
                type="date"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              {errorsTourn.startDate ? (
                <p className="text-xs text-rose-500 mt-1">{errorsTourn.startDate.message}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Fecha de Finalización
              </label>
              <input
                {...registerTourn('endDate')}
                type="date"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              {errorsTourn.endDate ? (
                <p className="text-xs text-rose-500 mt-1">{errorsTourn.endDate.message}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Estado</label>
            <select
              {...registerTourn('status')}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Activo">Activo</option>
              <option value="Planificado">Planificado</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateTournamentOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingTourn || createTournamentMutation.isPending}
              className="px-5 py-2 text-sm font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {createTournamentMutation.isPending ? 'Guardando...' : 'Crear Torneo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE MATCHDAY MODAL */}
      <Modal
        isOpen={isCreateMatchdayOpen}
        onClose={() => setIsCreateMatchdayOpen(false)}
        title="Fijar Encuentro de Competición"
        description="Programa un partido oficial con equipos, sede y horario"
      >
        <form onSubmit={handleSubmitMatch((d) => createMatchdayMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Torneo</label>
            <select
              {...registerMatch('tournamentId')}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tournamentName} ({t.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Equipo Local
              </label>
              <input
                {...registerMatch('homeTeam')}
                type="text"
                placeholder="Ej. Academia SoccerNet Sub-12"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              {errorsMatch.homeTeam ? (
                <p className="text-xs text-rose-500 mt-1">{errorsMatch.homeTeam.message}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Equipo Visitante
              </label>
              <input
                {...registerMatch('awayTeam')}
                type="text"
                placeholder="Ej. Real Balompié"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              {errorsMatch.awayTeam ? (
                <p className="text-xs text-rose-500 mt-1">{errorsMatch.awayTeam.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Fecha y Hora del Partido
              </label>
              <input
                {...registerMatch('matchDateTime')}
                type="datetime-local"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              {errorsMatch.matchDateTime ? (
                <p className="text-xs text-rose-500 mt-1">{errorsMatch.matchDateTime.message}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Sede / Cancha
              </label>
              <input
                {...registerMatch('location')}
                type="text"
                placeholder="Ej. Sede Cancha Principal - Campo #1"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              {errorsMatch.location ? (
                <p className="text-xs text-rose-500 mt-1">{errorsMatch.location.message}</p>
              ) : null}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateMatchdayOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingMatch || createMatchdayMutation.isPending}
              className="px-5 py-2 text-sm font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {createMatchdayMutation.isPending ? 'Guardando...' : 'Programar Partido'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOGS */}
      <ConfirmDialog
        isOpen={!!deletingTournament}
        onClose={() => setDeletingTournament(null)}
        onConfirm={() => {
          if (deletingTournament) deleteTournamentMutation.mutate(deletingTournament.id);
        }}
        title="Eliminar Torneo"
        message={`¿Estás seguro de que deseas eliminar permanentemente el torneo "${deletingTournament?.tournamentName}"?`}
        confirmLabel="Eliminar Torneo"
        isDangerous
        isLoading={deleteTournamentMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!deletingMatchday}
        onClose={() => setDeletingMatchday(null)}
        onConfirm={() => {
          if (deletingMatchday) deleteMatchdayMutation.mutate(deletingMatchday.id);
        }}
        title="Cancelar Partido"
        message={`¿Deseas remover el partido ${deletingMatchday?.homeTeam} vs ${deletingMatchday?.awayTeam}?`}
        confirmLabel="Remover Partido"
        isDangerous
        isLoading={deleteMatchdayMutation.isPending}
      />
    </div>
  );
};
