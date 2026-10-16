/**
 * ============================================================================
 * SOCCERNET PRO - ESQUEMAS DE VALIDACIÓN ZOD (FORMULARIOS)
 * ============================================================================
 * En cumplimiento con la regla de arquitectura 'react-rules', este archivo
 * contiene la fuente única de verdad para la validación en tiempo de ejecución
 * y la inferencia de tipos estáticos para los formularios de la aplicación.
 */

import { z } from 'zod';

/**
 * Esquema de validación para la creación y edición de futbolistas.
 * Coincide con las restricciones de PlayerDto en Spring Boot.
 */
export const playerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  birthDate: z
    .string()
    .min(1, 'La fecha de nacimiento es requerida'),
  registrationDate: z
    .string()
    .min(1, 'La fecha de registro es requerida'),
  categoryId: z.coerce
    .number()
    .min(1, 'Debe seleccionar una categoría válida'),
});

export type PlayerFormData = z.infer<typeof playerSchema>;

/**
 * Esquema para dar de alta o modificar categorías formativas.
 */
export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre de la categoría es requerido')
    .max(80, 'Máximo 80 caracteres permitidos'),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

/**
 * Esquema para registrar datos de contacto de tutores legales.
 */
export const guardianSchema = z.object({
  fullName: z
    .string()
    .min(3, 'El nombre completo es requerido')
    .max(150, 'Máximo 150 caracteres'),
  phone: z
    .string()
    .min(6, 'Teléfono requerido')
    .max(30, 'Máximo 30 caracteres'),
  email: z
    .string()
    .email('Debe ser una dirección de correo electrónico válida')
    .max(120, 'Máximo 120 caracteres'),
});

export type GuardianFormData = z.infer<typeof guardianSchema>;

/**
 * Esquema para la creación y configuración de torneos o ligas.
 */
export const tournamentSchema = z.object({
  tournamentName: z
    .string()
    .min(3, 'El nombre del torneo es requerido')
    .max(120, 'Máximo 120 caracteres'),
  startDate: z
    .string()
    .min(1, 'Fecha de inicio requerida'),
  endDate: z
    .string()
    .min(1, 'Fecha de finalización requerida'),
  status: z
    .enum(['Activo', 'Planificado', 'Finalizado']),
});

export type TournamentFormData = z.infer<typeof tournamentSchema>;

/**
 * Esquema para fijar una jornada o encuentro oficial dentro de un torneo.
 */
export const tournamentMatchdaySchema = z.object({
  tournamentId: z.coerce
    .number()
    .min(1, 'Seleccione un torneo'),
  homeTeam: z
    .string()
    .min(2, 'Equipo local requerido')
    .max(100, 'Máximo 100 caracteres'),
  awayTeam: z
    .string()
    .min(2, 'Equipo visitante requerido')
    .max(100, 'Máximo 100 caracteres'),
  matchDateTime: z
    .string()
    .min(1, 'Fecha y hora requerida'),
  location: z
    .string()
    .min(3, 'Sede o cancha requerida')
    .max(150, 'Máximo 150 caracteres'),
});

export type TournamentMatchdayFormData = z.infer<typeof tournamentMatchdaySchema>;

/**
 * Esquema para registrar pagos, cuotas mensuales y comprobantes bancarios.
 */
export const paymentSchema = z.object({
  playerId: z.coerce
    .number()
    .min(1, 'Seleccione un jugador'),
  paymentConceptId: z.coerce
    .number()
    .min(1, 'Seleccione un concepto de pago'),
  reportDate: z
    .string()
    .min(1, 'Fecha del reporte requerida'),
  amountPaid: z.coerce
    .number()
    .positive('El monto debe ser mayor a 0'),
  bankReference: z
    .string()
    .min(3, 'Referencia bancaria requerida')
    .max(100, 'Máximo 100 caracteres'),
  paymentStatus: z
    .enum(['Aprobado', 'Pendiente', 'Rechazado']),
  validatorUserId: z.coerce
    .number()
    .optional()
    .nullable(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

/**
 * Esquema para definir un nuevo arancel o concepto recurrente de cobro.
 */
export const paymentConceptSchema = z.object({
  conceptName: z
    .string()
    .min(3, 'Nombre del concepto requerido')
    .max(120, 'Máximo 120 caracteres'),
  expectedAmount: z.coerce
    .number()
    .positive('El monto esperado debe ser mayor a 0'),
});

export type PaymentConceptFormData = z.infer<typeof paymentConceptSchema>;

/**
 * Esquema para redactar y publicar comunicados o crónicas oficiales del club.
 */
export const newsSchema = z.object({
  title: z
    .string()
    .min(5, 'Título requerido (mínimo 5 caracteres)')
    .max(200, 'Máximo 200 caracteres'),
  content: z
    .string()
    .min(10, 'Contenido requerido (mínimo 10 caracteres)'),
  imageUrl: z
    .string()
    .url('Debe ser una URL válida')
    .or(z.literal(''))
    .optional(),
  authorId: z.coerce
    .number()
    .min(1, 'Seleccione un autor'),
});

export type NewsFormData = z.infer<typeof newsSchema>;

/**
 * Esquema para dar de alta nuevo personal del cuerpo técnico, directiva o usuarios.
 */
export const userSchema = z.object({
  username: z
    .string()
    .min(3, 'Usuario mínimo 3 caracteres')
    .max(60, 'Máximo 60 caracteres'),
  email: z
    .string()
    .email('Correo electrónico inválido')
    .max(120, 'Máximo 120 caracteres'),
  password: z
    .string()
    .min(6, 'Contraseña mínima de 6 caracteres')
    .optional()
    .or(z.literal('')),
  roleId: z.coerce
    .number()
    .min(1, 'Seleccione un rol institucional'),
});

export type UserFormData = z.infer<typeof userSchema>;
