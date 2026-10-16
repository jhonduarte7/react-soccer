/**
 * @file GuardiansPage.tsx
 * @description Módulo de tutores legales y acudientes de jugadores menores de edad.
 * Alineado con el modelo relacional del backend SOCCER (Cuarta Forma Normal / 4NF):
 * - Registro de apoderados con datos de contacto, parentesco (Padre, Madre, Tutor Legal).
 * - Teléfono de emergencia y correo electrónico para notificaciones.
 * - Enlace relacional hacia los futbolistas representados en la academia.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Phone,
  Mail,
  Search,
  UserCheck,
} from 'lucide-react';
import { soccerApi } from '../api/soccerApi';
import { guardianSchema, GuardianFormData } from '../schemas/soccerSchemas';
import { useToastStore } from '../store/useToastStore';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

/**
 * Vista de administración de tutores legales y apoderados.
 */
export const GuardiansPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: guardians = [], isLoading } = useQuery({
    queryKey: ['guardians'],
    queryFn: soccerApi.getGuardians,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuardianFormData>({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: GuardianFormData) => soccerApi.createGuardian(data),
    onSuccess: (newG) => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      addToast({
        type: 'success',
        title: 'Tutor Registrado',
        message: `${newG.fullName} ha sido registrado como contacto autorizado.`,
      });
      setIsCreateOpen(false);
      reset();
    },
  });

  const filteredGuardians = guardians.filter((g) => {
    const q = searchTerm.toLowerCase();
    return g.fullName.toLowerCase().includes(q) || g.email.toLowerCase().includes(q) || g.phone.includes(q);
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-slide-down">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Tutores Legales y Contactos de Emergencia
            <Badge variant="blue" size="sm">
              {guardians.length} Representantes
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestión de familiares directos y personas autorizadas para traslados y emergencias médicas
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Tutor</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, teléfono o email..."
            className="w-full pl-9 pr-4 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : filteredGuardians.length === 0 ? (
        <EmptyState
          title="No se encontraron tutores"
          description="No hay contactos que coincidan con la búsqueda."
          action={{
            label: 'Registrar Nuevo Tutor',
            onClick: () => setIsCreateOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredGuardians.map((g) => (
            <div
              key={g.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 backdrop-blur-sm transition-all duration-200 shadow-xs hover:shadow-md dark:shadow-none flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{g.fullName}</h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      ID Familiar #{g.id}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-mono">{g.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{g.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  Contacto Verificado
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Activo</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE GUARDIAN MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Registrar Tutor Legal"
        description="Ingresa la información de contacto del representante del futbolista"
      >
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Nombre Completo
            </label>
            <input
              {...register('fullName')}
              type="text"
              placeholder="Ej. Jorge Horacio Messi"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
            {errors.fullName ? (
              <p className="text-xs text-rose-500 mt-1">{errors.fullName.message}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Teléfono de Contacto
            </label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="+34 612 345 678"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            {errors.phone ? <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p> : null}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Correo Electrónico
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="tutor@familynetwork.org"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
            {errors.email ? <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p> : null}
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
              {createMutation.isPending ? 'Guardando...' : 'Registrar Tutor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
