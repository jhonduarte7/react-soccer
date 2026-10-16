/**
 * @file StaffPage.tsx
 * @description Módulo de administración del cuerpo técnico, directivos y roles de usuario.
 * Funciones clave:
 * - Altas y listado de miembros del staff deportivo (Entrenadores, Preparadores Físicos, Médicos, Analistas).
 * - Asignación y auditoría de perfiles y roles de acceso del sistema (ADMIN, ENTRENADOR, CONTADOR, MEDICO, SCOUT).
 * - Pestañas de gestión dual: Usuarios del Sistema y Catálogo de Roles con sus permisos y descripciones.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ShieldCheck,
  Plus,
  Mail,
  Search,
} from 'lucide-react';
import { soccerApi } from '../api/soccerApi';
import { userSchema, UserFormData } from '../schemas/soccerSchemas';
import { useToastStore } from '../store/useToastStore';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

/**
 * Vista de administración de usuarios del personal y roles de seguridad.
 */
export const StaffPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: soccerApi.getUsers,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: soccerApi.getRoles,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      roleId: roles[0]?.id || 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: UserFormData) =>
      soccerApi.createUser({
        username: data.username,
        email: data.email,
        roleId: data.roleId,
        password: data.password || 'Secret123!',
      }),
    onSuccess: (newU) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      addToast({
        type: 'success',
        title: 'Usuario Añadido',
        message: `El usuario ${newU.username} fue registrado con perfil de acceso.`,
      });
      setIsCreateOpen(false);
      reset();
    },
  });

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const uName = u.username.toLowerCase();
    const mail = u.email.toLowerCase();
    const rName = (u.roleName || '').toLowerCase();
    return uName.includes(q) || mail.includes(q) || rName.includes(q);
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-slide-down">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Cuerpo Técnico y Roles del Club
            <Badge variant="purple" size="sm">
              {users.length} Miembros
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Entrenadores, preparadores físicos, médicos, analistas tácticos y directores
          </p>
        </div>

        <button
          onClick={() => {
            if (roles.length > 0) reset({ roleId: roles[0].id, username: '', email: '', password: '' });
            setIsCreateOpen(true);
          }}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Personal</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-1 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Plantilla de Usuarios y Técnicos</span>
          {activeTab === 'users' ? (
            <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-emerald-500" />
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-2 px-1 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === 'roles'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Catálogo de Roles y Privilegios ({roles.length})</span>
          {activeTab === 'roles' ? (
            <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-emerald-500" />
          ) : null}
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-4">
          {/* Search */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar técnico por nombre, email o cargo..."
                className="w-full pl-9 pr-4 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {isLoadingUsers ? (
            <LoadingSkeleton type="table" count={5} />
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[560px]">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3.5 px-4">Miembro del Staff</th>
                      <th className="py-3.5 px-4">Email Oficial</th>
                      <th className="py-3.5 px-4">Rol / Responsabilidad</th>
                      <th className="py-3.5 px-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-600 dark:text-emerald-400">
                              {u.username.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">{u.username}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 font-mono flex items-center gap-1.5 mt-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{u.email}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="purple" size="sm">
                            {u.roleName || `Rol #${u.roleId}`}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Activo
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Roles Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {roles.map((r) => (
            <div
              key={r.id}
              className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{r.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">ID #{r.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE STAFF MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Registrar Miembro del Staff"
        description="Añade un entrenador, médico o directivo al sistema del club"
      >
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Nombre de Usuario
            </label>
            <input
              {...register('username')}
              type="text"
              placeholder="Ej. marcos.gonzalez"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 lowercase"
            />
            {errors.username ? (
              <p className="text-xs text-rose-500 mt-1">{errors.username.message}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Correo Electrónico Institucional
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="nombre@soccernet.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
            {errors.email ? <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p> : null}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Rol / Asignación
            </label>
            <select
              {...register('roleId')}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Contraseña Temporal
            </label>
            <input
              {...register('password')}
              type="password"
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
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
              {createMutation.isPending ? 'Guardando...' : 'Registrar Staff'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
