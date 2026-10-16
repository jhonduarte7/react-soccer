/**
 * @file FinancesPage.tsx
 * @description Módulo de tesorería y gestión financiera del club de fútbol.
 * Incluye:
 * - Registro y verificación de comprobantes de pago de mensualidades, matrículas e indumentaria.
 * - Flujo de auditoría: Aprobar (Validado) o Rechazar (Rechazado) comprobantes con notas explicativas.
 * - Catálogo maestro de conceptos de cobro con montos base y periodicidad.
 * - Métricas de recaudación: total liquidado, fondos pendientes de verificación y tasa de morosidad.
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Trash2,
  Tag,
  Check,
  X,
} from 'lucide-react';
import { soccerApi } from '../api/soccerApi';
import { Payment } from '../types/soccer';
import {
  paymentSchema,
  PaymentFormData,
  paymentConceptSchema,
  PaymentConceptFormData,
} from '../schemas/soccerSchemas';
import { useToastStore } from '../store/useToastStore';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

/**
 * Vista de administración de pagos, validación de comprobantes y conceptos financieros.
 */
export const FinancesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'payments' | 'concepts'>('payments');

  // Modals
  const [isCreatePaymentOpen, setIsCreatePaymentOpen] = useState(false);
  const [isCreateConceptOpen, setIsCreateConceptOpen] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);

  // 1. Fetch payments
  const { data: payments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments', statusFilter],
    queryFn: () => soccerApi.getPayments(statusFilter === 'Todos' ? undefined : { status: statusFilter }),
  });

  // 2. Fetch payment concepts
  const { data: concepts = [] } = useQuery({
    queryKey: ['payment-concepts'],
    queryFn: soccerApi.getPaymentConcepts,
  });

  // 3. Fetch players for selection
  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => soccerApi.getPlayers(),
  });

  // React Hook Form for Payment
  const {
    register: registerPayment,
    handleSubmit: handleSubmitPayment,
    reset: resetPayment,
    setValue: setValuePayment,
    formState: { errors: errorsPayment, isSubmitting: isSubmittingPayment },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      playerId: players[0]?.id || 1,
      paymentConceptId: concepts[0]?.id || 1,
      reportDate: new Date().toISOString().slice(0, 16),
      amountPaid: 60.0,
      bankReference: 'REF-' + Math.floor(10000000 + Math.random() * 90000000),
      paymentStatus: 'Aprobado',
      validatorUserId: 1,
    },
  });

  // Concept Form
  const {
    register: registerConcept,
    handleSubmit: handleSubmitConcept,
    reset: resetConcept,
    formState: { errors: errorsConcept, isSubmitting: isSubmittingConcept },
  } = useForm<PaymentConceptFormData>({
    resolver: zodResolver(paymentConceptSchema),
    defaultValues: {
      conceptName: '',
      expectedAmount: 50.0,
    },
  });

  // Mutation: Create Payment
  const createPaymentMutation = useMutation({
    mutationFn: (data: PaymentFormData) => soccerApi.createPayment(data),
    onSuccess: (newP) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      addToast({
        type: 'success',
        title: 'Pago Registrado',
        message: `Comprobante por €${newP.amountPaid} procesado con éxito.`,
      });
      setIsCreatePaymentOpen(false);
      resetPayment();
    },
  });

  // Mutation: Quick status update (Approve / Reject)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'Aprobado' | 'Rechazado' }) =>
      soccerApi.updatePayment(id, { paymentStatus: status, validatorUserId: 1, validatorUsername: 'carlos.rodriguez' }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      addToast({
        type: vars.status === 'Aprobado' ? 'success' : 'warning',
        title: `Pago ${vars.status}`,
        message: `El comprobante ha cambiado a estado ${vars.status}.`,
      });
    },
  });

  // Mutation: Delete Payment
  const deletePaymentMutation = useMutation({
    mutationFn: (id: number) => soccerApi.deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      addToast({ type: 'info', title: 'Pago Eliminado' });
      setDeletingPayment(null);
    },
  });

  // Mutation: Create Concept
  const createConceptMutation = useMutation({
    mutationFn: (data: PaymentConceptFormData) => soccerApi.createPaymentConcept(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-concepts'] });
      addToast({ type: 'success', title: 'Concepto Creado', message: 'Nuevo arancel disponible.' });
      setIsCreateConceptOpen(false);
      resetConcept();
    },
  });

  // Update expected amount when concept changes in form
  const handleConceptChange = (conceptId: number) => {
    const concept = concepts.find((c) => c.id === conceptId);
    if (concept) {
      setValuePayment('amountPaid', concept.expectedAmount);
    }
  };

  // Financial calculations
  const totalApproved = useMemo(
    () => payments.filter((p) => p.paymentStatus === 'Aprobado').reduce((acc, p) => acc + Number(p.amountPaid), 0),
    [payments]
  );
  const totalPending = useMemo(
    () => payments.filter((p) => p.paymentStatus === 'Pendiente').reduce((acc, p) => acc + Number(p.amountPaid), 0),
    [payments]
  );
  const totalRejected = useMemo(
    () => payments.filter((p) => p.paymentStatus === 'Rechazado').reduce((acc, p) => acc + Number(p.amountPaid), 0),
    [payments]
  );

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchTerm.toLowerCase();
      const pName = (p.playerName || '').toLowerCase();
      const ref = (p.bankReference || '').toLowerCase();
      const cName = (p.paymentConceptName || '').toLowerCase();
      return pName.includes(q) || ref.includes(q) || cName.includes(q);
    });
  }, [payments, searchTerm]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-slide-down">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Gestión Financiera y Recaudación
            <Badge variant="blue" size="sm">
              {payments.length} Registros
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supervisión de cuotas mensuales, conceptos arancelarios y recibos bancarios
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            onClick={() => setIsCreateConceptOpen(true)}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Tag className="w-4 h-4 text-emerald-500" />
            <span>Nuevo Concepto</span>
          </button>

          <button
            onClick={() => {
              if (players.length > 0) setValuePayment('playerId', players[0].id);
              if (concepts.length > 0) {
                setValuePayment('paymentConceptId', concepts[0].id);
                setValuePayment('amountPaid', concepts[0].expectedAmount);
              }
              setIsCreatePaymentOpen(true);
            }}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Pago</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 bg-white dark:bg-slate-900/80 backdrop-blur-md shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total Recaudado</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            €{totalApproved.toFixed(2)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Comprobantes verificados y aprobados</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 bg-white dark:bg-slate-900/80 backdrop-blur-md shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Por Validar</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            €{totalPending.toFixed(2)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pendientes de confirmación bancaria</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 bg-white dark:bg-slate-900/80 backdrop-blur-md shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Rechazados</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            €{totalRejected.toFixed(2)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Inconsistencias en referencia o monto</p>
        </div>
      </div>

      {/* Main Tabs (Payments vs Concepts) */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-2 px-1 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === 'payments'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Libro de Comprobantes de Pago</span>
          {activeTab === 'payments' ? (
            <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-emerald-500" />
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab('concepts')}
          className={`pb-2 px-1 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === 'concepts'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Catálogo de Aranceles ({concepts.length})</span>
          {activeTab === 'concepts' ? (
            <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-emerald-500" />
          ) : null}
        </button>
      </div>

      {activeTab === 'payments' ? (
        /* Payments Table Tab */
        <div className="space-y-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por jugador, referencia o concepto..."
                className="w-full pl-9 pr-4 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto scrollbar-none">
              {['Todos', 'Aprobado', 'Pendiente', 'Rechazado'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {st === 'Todos' ? 'Todos' : st}
                </button>
              ))}
            </div>
          </div>

          {isLoadingPayments ? (
            <LoadingSkeleton type="table" count={5} />
          ) : filteredPayments.length === 0 ? (
            <EmptyState
              title="No hay pagos que mostrar"
              description="No hay transacciones registradas con los filtros actuales."
              action={{
                label: 'Registrar Nuevo Pago',
                onClick: () => setIsCreatePaymentOpen(true),
              }}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[650px]">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3.5 px-4">Jugador</th>
                      <th className="py-3.5 px-4">Concepto</th>
                      <th className="py-3.5 px-4">Ref. Bancaria</th>
                      <th className="py-3.5 px-4">Fecha Reporte</th>
                      <th className="py-3.5 px-4">Monto</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-4 text-right">Acciones Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {p.playerName || `Jugador #${p.playerId}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                          {p.paymentConceptName || `Concepto #${p.paymentConceptId}`}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                          {p.bankReference}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(p.reportDate).toLocaleDateString('es-ES')}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          €{Number(p.amountPaid).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
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
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {p.paymentStatus !== 'Aprobado' ? (
                              <button
                                onClick={() =>
                                  updateStatusMutation.mutate({ id: p.id, status: 'Aprobado' })
                                }
                                className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                title="Aprobar pago"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            ) : null}

                            {p.paymentStatus !== 'Rechazado' ? (
                              <button
                                onClick={() =>
                                  updateStatusMutation.mutate({ id: p.id, status: 'Rechazado' })
                                }
                                className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                                title="Rechazar pago"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            ) : null}

                            <button
                              onClick={() => setDeletingPayment(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Eliminar registro"
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
        </div>
      ) : (
        /* Concepts Tab */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {concepts.map((c) => (
              <div
                key={c.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/30 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    ID #{c.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{c.conceptName}</h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Arancel estándar:</span>
                  <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400">
                    €{Number(c.expectedAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE PAYMENT MODAL */}
      <Modal
        isOpen={isCreatePaymentOpen}
        onClose={() => setIsCreatePaymentOpen(false)}
        title="Registrar Comprobante de Pago"
        description="Ingresa el pago realizado por el futbolista o tutor legal"
      >
        <form onSubmit={handleSubmitPayment((d) => createPaymentMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Futbolista
            </label>
            <select
              {...registerPayment('playerId')}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.categoryName || 'Cantera'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Concepto Arancelario
            </label>
            <select
              {...registerPayment('paymentConceptId')}
              onChange={(e) => {
                const cid = Number(e.target.value);
                registerPayment('paymentConceptId').onChange(e);
                handleConceptChange(cid);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {concepts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.conceptName} — €{c.expectedAmount}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Monto Abonado (€)
              </label>
              <input
                {...registerPayment('amountPaid')}
                type="number"
                step="0.01"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              {errorsPayment.amountPaid ? (
                <p className="text-xs text-rose-500 mt-1">{errorsPayment.amountPaid.message}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Referencia Bancaria
              </label>
              <input
                {...registerPayment('bankReference')}
                type="text"
                placeholder="Ej. TRANSF-0912384"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              {errorsPayment.bankReference ? (
                <p className="text-xs text-rose-500 mt-1">{errorsPayment.bankReference.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Fecha del Pago
              </label>
              <input
                {...registerPayment('reportDate')}
                type="datetime-local"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Estado</label>
              <select
                {...registerPayment('paymentStatus')}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Aprobado">Aprobado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreatePaymentOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingPayment || createPaymentMutation.isPending}
              className="px-5 py-2 text-sm font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {createPaymentMutation.isPending ? 'Guardando...' : 'Guardar Comprobante'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE CONCEPT MODAL */}
      <Modal
        isOpen={isCreateConceptOpen}
        onClose={() => setIsCreateConceptOpen(false)}
        title="Crear Concepto Arancelario"
        description="Define una nueva cuota periódica, matrícula o equipamiento"
      >
        <form onSubmit={handleSubmitConcept((d) => createConceptMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Nombre del Concepto
            </label>
            <input
              {...registerConcept('conceptName')}
              type="text"
              placeholder="Ej. Pack Ropa de Invierno Oficial"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
            {errorsConcept.conceptName ? (
              <p className="text-xs text-rose-500 mt-1">{errorsConcept.conceptName.message}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Monto Estándar Esperado (€)
            </label>
            <input
              {...registerConcept('expectedAmount')}
              type="number"
              step="0.01"
              placeholder="Ej. 75.00"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            {errorsConcept.expectedAmount ? (
              <p className="text-xs text-rose-500 mt-1">{errorsConcept.expectedAmount.message}</p>
            ) : null}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateConceptOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingConcept || createConceptMutation.isPending}
              className="px-5 py-2 text-sm font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {createConceptMutation.isPending ? 'Guardando...' : 'Crear Concepto'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE PAYMENT */}
      <ConfirmDialog
        isOpen={!!deletingPayment}
        onClose={() => setDeletingPayment(null)}
        onConfirm={() => {
          if (deletingPayment) deletePaymentMutation.mutate(deletingPayment.id);
        }}
        title="Eliminar Registro de Pago"
        message={`¿Estás seguro de que deseas eliminar el registro de pago ${deletingPayment?.bankReference} por €${deletingPayment?.amountPaid}?`}
        confirmLabel="Eliminar Registro"
        isDangerous
        isLoading={deletePaymentMutation.isPending}
      />
    </div>
  );
};
