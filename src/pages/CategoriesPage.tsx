/**
 * @file CategoriesPage.tsx
 * @description Módulo de división y categorías formativas del club de fútbol.
 * Permite:
 * - Clasificar futbolistas por rangos de edad y nivel (Sub-13, Sub-15, Sub-17, Sub-20, Primera División).
 * - Monitorear el censo de atletas matriculados por cada división.
 * - Navegación directa con filtro contextual hacia la lista de jugadores de cada categoría.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Users, Trash2, ArrowRight } from 'lucide-react';
import { soccerApi } from '../api/soccerApi';
import { Category } from '../types/soccer';
import { categorySchema, CategoryFormData } from '../schemas/soccerSchemas';
import { useToastStore } from '../store/useToastStore';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

/**
 * Vista de administración de divisiones deportivas y categorías formativas.
 */
export const CategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: soccerApi.getCategories,
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => soccerApi.getPlayers(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => soccerApi.createCategory(data),
    onSuccess: (newC) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      addToast({
        type: 'success',
        title: 'Categoría Registrada',
        message: `La categoría "${newC.name}" ha sido creada.`,
      });
      setIsCreateOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => soccerApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      addToast({ type: 'info', title: 'Categoría Eliminada' });
      setDeletingCategory(null);
    },
  });

  const getPlayerCount = (catId: number) => {
    return players.filter((p) => p.categoryId === catId).length;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-slide-down">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Estructura de Categorías Formativas
            <Badge variant="emerald" size="sm">
              {categories.length} Divisiones
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Distribución por edades, niveles formativos y equipos competitivos
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Categoría</span>
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {categories.map((c) => {
            const count = getPlayerCount(c.id);

            return (
              <div
                key={c.id}
                className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 backdrop-blur-sm transition-all duration-200 shadow-xs hover:shadow-md dark:shadow-none flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      División #{c.id}
                    </span>
                    <button
                      onClick={() => setDeletingCategory(c)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5 sm:mt-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    {c.name}
                  </h3>
                </div>

                <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-semibold">{count}</span>
                    <span className="text-slate-400 dark:text-slate-500">jugadores</span>
                  </div>

                  <button
                    onClick={() => navigate('/players')}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Ver plantel <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Crear Nueva Categoría"
        description="Añade una nueva división formativa (ej. SUB-15-B o ALTO-RENDIMIENTO)"
      >
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Nombre de la Categoría
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="Ej. SUB-13-A"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 uppercase"
            />
            {errors.name ? <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p> : null}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="px-5 py-2 text-sm font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {createMutation.isPending ? 'Guardando...' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE CATEGORY */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => {
          if (deletingCategory) deleteMutation.mutate(deletingCategory.id);
        }}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar la categoría "${deletingCategory?.name}"?`}
        confirmLabel="Eliminar Categoría"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
