/**
 * @file PlayersPage.tsx
 * @description Módulo de gestión integral del plantel de futbolistas (Roster de Jugadores).
 * Características:
 * - Operaciones CRUD completas (Crear, Listar, Actualizar, Eliminar).
 * - Modos de visualización dual: Cuadrícula de tarjetas tácticas o Tabla tabular responsiva.
 * - Filtro dinámico por categoría formativa y búsqueda en tiempo real por nombre, apodo o dorsal.
 * - Modal detallado del perfil del jugador con gráfico de cancha (PitchGraphic) y asignación de múltiples posiciones.
 * - Validación robusta mediante React Hook Form + esquemas Zod.
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserPlus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Mail,
  Plus,
  LayoutGrid,
  List,
} from 'lucide-react';
import { soccerApi } from '../api/soccerApi';
import { Player } from '../types/soccer';
import { playerSchema, PlayerFormData } from '../schemas/soccerSchemas';
import { useToastStore } from '../store/useToastStore';
import { useAppStore } from '../store/useAppStore';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { PitchGraphic } from '../components/common/PitchGraphic';

/**
 * Vista de administración de jugadores, perfiles y posiciones tácticas.
 */
export const PlayersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const { globalSearch } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);
  const [selectedPlayerForDetail, setSelectedPlayerForDetail] = useState<Player | null>(null);

  // Position addition inside detail modal
  const [newPositionName, setNewPositionName] = useState('');

  // 1. Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: soccerApi.getCategories,
  });

  // 2. Fetch players
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['players', selectedCategory],
    queryFn: () => soccerApi.getPlayers(selectedCategory ?? undefined),
  });

  // 3. Fetch detail positions & guardians when a player is selected
  const { data: playerPositions = [], refetch: refetchPositions } = useQuery({
    queryKey: ['player-positions', selectedPlayerForDetail?.id],
    queryFn: () =>
      selectedPlayerForDetail ? soccerApi.getPlayerPositions(selectedPlayerForDetail.id) : Promise.resolve([]),
    enabled: !!selectedPlayerForDetail,
  });

  const { data: playerGuardians = [] } = useQuery({
    queryKey: ['player-guardians', selectedPlayerForDetail?.id],
    queryFn: () =>
      selectedPlayerForDetail ? soccerApi.getPlayerGuardians(selectedPlayerForDetail.id) : Promise.resolve([]),
    enabled: !!selectedPlayerForDetail,
  });

  // React Hook Form for Create/Edit
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '2010-01-01',
      registrationDate: new Date().toISOString().split('T')[0],
      categoryId: 1,
    },
  });

  // Mutation: Create Player
  const createMutation = useMutation({
    mutationFn: (data: PlayerFormData) => soccerApi.createPlayer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      addToast({
        type: 'success',
        title: 'Jugador Creado',
        message: 'El nuevo talento ha sido registrado en el plantel.',
      });
      setIsCreateOpen(false);
      reset();
    },
    onError: (err: any) => {
      addToast({
        type: 'error',
        title: 'Error al registrar',
        message: err.message || 'No se pudo registrar el jugador.',
      });
    },
  });

  // Mutation: Update Player
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PlayerFormData }) =>
      soccerApi.updatePlayer(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      addToast({
        type: 'success',
        title: 'Jugador Actualizado',
        message: `Ficha de ${updated.firstName} ${updated.lastName} actualizada.`,
      });
      setEditingPlayer(null);
      if (selectedPlayerForDetail?.id === updated.id) {
        setSelectedPlayerForDetail(updated);
      }
    },
    onError: (err: any) => {
      addToast({
        type: 'error',
        title: 'Error de actualización',
        message: err.message || 'No se pudo actualizar la ficha del jugador.',
      });
    },
  });

  // Mutation: Delete Player
  const deleteMutation = useMutation({
    mutationFn: (id: number) => soccerApi.deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      addToast({
        type: 'success',
        title: 'Jugador Eliminado',
        message: 'El registro ha sido removido del sistema.',
      });
      setDeletingPlayer(null);
      if (selectedPlayerForDetail?.id === deletingPlayer?.id) {
        setSelectedPlayerForDetail(null);
      }
    },
    onError: (err: any) => {
      addToast({
        type: 'error',
        title: 'Error al eliminar',
        message: err.message || 'No se pudo eliminar el jugador.',
      });
    },
  });

  // Mutation: Add Position
  const addPositionMutation = useMutation({
    mutationFn: (positionName: string) => {
      if (!selectedPlayerForDetail) throw new Error('Jugador no seleccionado');
      return soccerApi.addPlayerPosition({
        playerId: selectedPlayerForDetail.id,
        position: positionName,
      });
    },
    onSuccess: () => {
      refetchPositions();
      setNewPositionName('');
      addToast({ type: 'success', title: 'Posición Agregada' });
    },
  });

  // Mutation: Remove Position
  const removePositionMutation = useMutation({
    mutationFn: (pos: string) => {
      if (!selectedPlayerForDetail) throw new Error('Jugador no seleccionado');
      return soccerApi.deletePlayerPosition(selectedPlayerForDetail.id, pos);
    },
    onSuccess: () => {
      refetchPositions();
      addToast({ type: 'info', title: 'Posición Eliminada' });
    },
  });

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    setValue('firstName', player.firstName);
    setValue('lastName', player.lastName);
    setValue('birthDate', player.birthDate);
    setValue('registrationDate', player.registrationDate);
    setValue('categoryId', player.categoryId);
  };

  const handleFormSubmit = (data: PlayerFormData) => {
    if (editingPlayer) {
      updateMutation.mutate({ id: editingPlayer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter players by local search and global search
  const effectiveSearch = searchTerm || globalSearch;
  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const catName = (p.categoryName || '').toLowerCase();
      const q = effectiveSearch.toLowerCase();
      return fullName.includes(q) || catName.includes(q);
    });
  }, [players, effectiveSearch]);

  const calculateAge = (birthDateString: string) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6 animate-slide-down">
      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Plantel de Jugadores
            <Badge variant="emerald" size="sm">
              {filteredPlayers.length} Futbolistas
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fichas federativas, demografía por categorías, posiciones tácticas y tutores
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View mode toggle */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
              title="Vista en cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
              title="Vista en tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              reset({
                firstName: '',
                lastName: '',
                birthDate: '2010-05-15',
                registrationDate: new Date().toISOString().split('T')[0],
                categoryId: categories[0]?.id || 1,
              });
              setIsCreateOpen(true);
            }}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Inscribir Jugador</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nombre o apellido..."
              className="w-full pl-9 pr-4 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Chips Scroller */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === null
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              Todas las Categorías
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Players Content Area */}
      {isLoadingPlayers ? (
        <LoadingSkeleton type={viewMode === 'grid' ? 'card' : 'table'} count={6} />
      ) : filteredPlayers.length === 0 ? (
        <EmptyState
          title="No se encontraron jugadores"
          description={
            effectiveSearch
              ? `No hay jugadores que coincidan con "${effectiveSearch}".`
              : 'No hay jugadores registrados en esta categoría.'
          }
          action={{
            label: 'Inscribir Nuevo Jugador',
            onClick: () => setIsCreateOpen(true),
          }}
        />
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredPlayers.map((player) => {
            const age = calculateAge(player.birthDate);
            const initials = `${player.firstName[0] || ''}${player.lastName[0] || ''}`;

            return (
              <div
                key={player.id}
                className="group relative rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 p-4 sm:p-5 backdrop-blur-sm transition-all duration-200 shadow-xs hover:shadow-md dark:shadow-none flex flex-col justify-between"
              >
                <div>
                  {/* Top card info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-slate-100 dark:from-emerald-500/20 dark:to-slate-800 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center font-black text-emerald-700 dark:text-emerald-400 text-sm sm:text-base shadow-inner">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                          {player.firstName} {player.lastName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {age} años • Nac. {player.birthDate}
                        </p>
                      </div>
                    </div>

                    <Badge variant="emerald" size="sm">
                      {player.categoryName || 'Cantera'}
                    </Badge>
                  </div>

                  {/* Player Stats preview */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Registro</span>
                      <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-500" />
                        {player.registrationDate}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">ID Ficha</span>
                      <p className="font-mono font-medium text-slate-700 dark:text-slate-300 mt-0.5">#{player.id}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedPlayerForDetail(player)}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Ficha Completa</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(player)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Editar datos"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingPlayer(player)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Eliminar jugador"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[620px]">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Jugador</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Fecha Nacimiento</th>
                  <th className="py-3.5 px-4">Edad</th>
                  <th className="py-3.5 px-4">Fecha Registro</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-600 dark:text-emerald-400">
                          {player.firstName[0]}
                          {player.lastName[0]}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {player.firstName} {player.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="emerald" size="sm">
                        {player.categoryName || 'Sub-12'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{player.birthDate}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{calculateAge(player.birthDate)} años</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{player.registrationDate}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelectedPlayerForDetail(player)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(player)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingPlayer(player)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PLAYER MODAL */}
      <Modal
        isOpen={isCreateOpen || !!editingPlayer}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingPlayer(null);
        }}
        title={editingPlayer ? 'Editar Ficha de Jugador' : 'Inscribir Nuevo Jugador'}
        description="Completa los datos del futbolista para la base de datos de la cantera"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Nombre</label>
              <input
                {...register('firstName')}
                type="text"
                placeholder="Ej. Lionel"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              {errors.firstName ? (
                <p className="text-xs text-rose-500 mt-1">{errors.firstName.message}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Apellido</label>
              <input
                {...register('lastName')}
                type="text"
                placeholder="Ej. Messi"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              {errors.lastName ? (
                <p className="text-xs text-rose-500 mt-1">{errors.lastName.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                {...register('birthDate')}
                type="date"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              {errors.birthDate ? (
                <p className="text-xs text-rose-500 mt-1">{errors.birthDate.message}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Fecha de Registro
              </label>
              <input
                {...register('registrationDate')}
                type="date"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              {errors.registrationDate ? (
                <p className="text-xs text-rose-500 mt-1">{errors.registrationDate.message}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Categoría</label>
            <select
              {...register('categoryId')}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId ? (
              <p className="text-xs text-rose-500 mt-1">{errors.categoryId.message}</p>
            ) : null}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingPlayer(null);
              }}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2 text-sm font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Guardando...' : editingPlayer ? 'Guardar Cambios' : 'Registrar Jugador'}
            </button>
          </div>
        </form>
      </Modal>

      {/* PLAYER DETAIL MODAL */}
      <Modal
        isOpen={!!selectedPlayerForDetail}
        onClose={() => setSelectedPlayerForDetail(null)}
        title="Ficha Integral del Futbolista"
        maxWidth="2xl"
      >
        {selectedPlayerForDetail ? (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-slate-950 text-xl sm:text-2xl shadow-md shrink-0">
                {selectedPlayerForDetail.firstName[0]}
                {selectedPlayerForDetail.lastName[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {selectedPlayerForDetail.firstName} {selectedPlayerForDetail.lastName}
                  </h3>
                  <Badge variant="emerald">{selectedPlayerForDetail.categoryName || 'Sub-12'}</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Edad: {calculateAge(selectedPlayerForDetail.birthDate)} años • Fecha de Nacimiento:{' '}
                  {selectedPlayerForDetail.birthDate} • Inscripción:{' '}
                  {selectedPlayerForDetail.registrationDate}
                </p>
              </div>
            </div>

            {/* Tactical Positions & Graphic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">
                    Posiciones Tácticas Asignadas
                  </h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {playerPositions.length} asignadas
                  </span>
                </div>

                {playerPositions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    No tiene demarcaciones registradas en el sistema.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {playerPositions.map((pos) => (
                      <span
                        key={pos.position}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
                      >
                        {pos.position}
                        <button
                          onClick={() => removePositionMutation.mutate(pos.position)}
                          className="hover:text-rose-500 text-slate-400 ml-1 cursor-pointer"
                          title="Quitar posición"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add Position input */}
                <div className="flex gap-2 pt-2">
                  <select
                    value={newPositionName}
                    onChange={(e) => setNewPositionName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Seleccionar Posición --</option>
                    <option value="Portero">Portero</option>
                    <option value="Defensa Central">Defensa Central</option>
                    <option value="Lateral Derecho">Lateral Derecho</option>
                    <option value="Lateral Izquierdo">Lateral Izquierdo</option>
                    <option value="Pivote Defensivo">Pivote Defensivo</option>
                    <option value="Mediocentro">Mediocentro</option>
                    <option value="Mediapunta">Mediapunta</option>
                    <option value="Extremo Derecho">Extremo Derecho</option>
                    <option value="Extremo Izquierdo">Extremo Izquierdo</option>
                    <option value="Delantero Centro">Delantero Centro</option>
                  </select>
                  <button
                    onClick={() => {
                      if (newPositionName) addPositionMutation.mutate(newPositionName);
                    }}
                    disabled={!newPositionName || addPositionMutation.isPending}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>

              {/* Pitch Visualizer */}
              <div>
                <PitchGraphic positions={playerPositions.map((p) => p.position)} />
              </div>
            </div>

            {/* Legal Guardians / Emergency contacts */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">
                Tutores Legales y Contacto de Emergencia
              </h4>

              {playerGuardians.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
                  No hay tutores vinculados a este jugador en el registro 4NF.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {playerGuardians.map((g, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          {g.guardianName || `Tutor #${g.guardianId}`}
                        </span>
                        <Badge variant="blue" size="sm">
                          {g.relationship}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-emerald-500" /> +34 612 345 678
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-emerald-500" /> tutor@familynetwork.org
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedPlayerForDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deletingPlayer}
        onClose={() => setDeletingPlayer(null)}
        onConfirm={() => {
          if (deletingPlayer) deleteMutation.mutate(deletingPlayer.id);
        }}
        title="Eliminar Jugador"
        message={`¿Estás seguro de que deseas eliminar permanentemente a ${deletingPlayer?.firstName} ${deletingPlayer?.lastName} de la cantera? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar Registro"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
