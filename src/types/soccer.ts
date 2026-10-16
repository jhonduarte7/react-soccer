/**
 * ============================================================================
 * SOCCERNET PRO - MODELOS Y DEFINICIONES DE TIPOS (TYPESCRIPT)
 * ============================================================================
 * Este archivo define las entidades principales del dominio del sistema,
 * correspondientes a los DTOs expuestos por los controladores del backend
 * Spring Boot (proyecto SOCCER, puerto 8082).
 */

/**
 * Representa una categoría o división formativa por edades (ej. SUB-12-A, FEMENINO).
 */
export interface Category {
  /** Identificador único de la categoría */
  id: number;
  /** Nombre o código de la división */
  name: string;
}

/**
 * Rol o perfil de acceso asignable a un usuario del club (ej. ROLE_HEAD_COACH, ROLE_ADMIN).
 */
export interface Role {
  /** Identificador del rol */
  id: number;
  /** Nombre técnico del rol de seguridad */
  name: string;
}

/**
 * Usuario del sistema con credenciales de acceso y asignación de rol.
 */
export interface User {
  /** Identificador del usuario */
  id: number;
  /** Nombre de usuario para inicio de sesión */
  username: string;
  /** Correo electrónico institucional */
  email: string;
  /** ID del rol asignado */
  roleId: number;
  /** Nombre descriptivo del rol obtenido del backend */
  roleName?: string;
  /** Contraseña (solo para creación/actualización) */
  password?: string;
}

/**
 * Ficha deportiva del futbolista inscrito en la academia.
 */
export interface Player {
  /** Identificador del jugador */
  id: number;
  /** Nombre de pila */
  firstName: string;
  /** Apellidos */
  lastName: string;
  /** Fecha de nacimiento en formato ISO YYYY-MM-DD */
  birthDate: string;
  /** Fecha de registro o alta en el club (YYYY-MM-DD) */
  registrationDate: string;
  /** ID de la categoría a la que pertenece */
  categoryId: number;
  /** Nombre de la categoría (enriquecido por el DTO) */
  categoryName?: string;
}

/**
 * Tutor legal, padre, madre o contacto de emergencia autorizado.
 */
export interface Guardian {
  /** Identificador único del tutor */
  id: number;
  /** Nombre y apellidos completos */
  fullName: string;
  /** Número telefónico de contacto directo */
  phone: string;
  /** Correo electrónico para notificaciones */
  email: string;
}

/**
 * Relación asociativa (4NF) entre un futbolista y su tutor legal con parentesco.
 */
export interface PlayerGuardian {
  /** ID del jugador */
  playerId: number;
  /** Nombre del jugador */
  playerName?: string;
  /** ID del tutor legal */
  guardianId: number;
  /** Nombre del tutor legal */
  guardianName?: string;
  /** Parentesco (Padre, Madre, Tutor Legal, etc.) */
  relationship: string;
}

/**
 * Posición o demarcación táctica en el terreno de juego asignada al jugador.
 */
export interface PlayerPosition {
  /** ID del jugador */
  playerId: number;
  /** Nombre del jugador */
  playerName?: string;
  /** Nombre de la posición (ej. Portero, Mediapunta, Delantero Centro) */
  position: string;
}

/**
 * Torneo oficial, copa o liga en la que compiten los equipos del club.
 */
export interface Tournament {
  /** Identificador único del torneo */
  id: number;
  /** Nombre oficial de la competición */
  tournamentName: string;
  /** Fecha de inicio (YYYY-MM-DD) */
  startDate: string;
  /** Fecha de clausura (YYYY-MM-DD) */
  endDate: string;
  /** Estado actual de la competición */
  status: 'Activo' | 'Planificado' | 'Finalizado' | string;
}

/**
 * Encuentro o fixture programado dentro de un torneo oficial.
 */
export interface TournamentMatchday {
  /** Identificador del partido */
  id: number;
  /** ID del torneo al que pertenece la jornada */
  tournamentId: number;
  /** Nombre del torneo oficial */
  tournamentName?: string;
  /** Nombre del equipo local */
  homeTeam: string;
  /** Nombre del equipo visitante */
  awayTeam: string;
  /** Fecha y hora programada para el partido */
  matchDateTime: string;
  /** Sede, polideportivo o cancha asignada */
  location: string;
}

/**
 * Concepto de cobro o arancel institucional (mensualidad, matrícula, uniformes).
 */
export interface PaymentConcept {
  /** Identificador del concepto */
  id: number;
  /** Descripción del concepto arancelario */
  conceptName: string;
  /** Importe monetario esperado estándar */
  expectedAmount: number;
}

/**
 * Comprobante de pago o transacción financiera emitida por un jugador o tutor.
 */
export interface Payment {
  /** Identificador único del pago */
  id: number;
  /** ID del futbolista que efectúa el pago */
  playerId: number;
  /** Nombre del futbolista */
  playerName?: string;
  /** ID del concepto de pago aplicado */
  paymentConceptId: number;
  /** Nombre descriptivo del concepto */
  paymentConceptName?: string;
  /** Fecha y hora en la que se reporta el comprobante */
  reportDate: string;
  /** Monto monetario abonado */
  amountPaid: number;
  /** Código o número de referencia de la transferencia/banco */
  bankReference: string;
  /** Estado de validación del pago */
  paymentStatus: 'Aprobado' | 'Pendiente' | 'Rechazado' | string;
  /** ID del usuario administrativo que validó el pago */
  validatorUserId?: number | null;
  /** Nombre de usuario del validador */
  validatorUsername?: string | null;
}

/**
 * Noticia, boletín oficial o comunicado editorial del club.
 */
export interface NewsArticle {
  /** Identificador del artículo */
  id: number;
  /** Titular del comunicado */
  title: string;
  /** Cuerpo o contenido completo */
  content: string;
  /** URL de la imagen de portada */
  imageUrl?: string;
  /** Fecha y hora de publicación */
  publicationDate: string;
  /** ID del autor que redactó la noticia */
  authorId: number;
  /** Nombre del autor */
  authorUsername?: string;
}

/**
 * Estadísticas consolidadas de la base de datos reportadas por el backend (/api/stats).
 */
export interface DatabaseStats {
  /** Total de roles registrados */
  roles: number;
  /** Total de usuarios del sistema */
  usuarios: number;
  /** Total de categorías formativas */
  categorias: number;
  /** Total de futbolistas registrados */
  jugadores: number;
  /** Total de tutores y familiares */
  tutores: number;
  /** Asignaciones jugador-tutor en 4NF */
  jugadores_tutores: number;
  /** Asignaciones tácticas de posición */
  jugador_posiciones: number;
  /** Total de torneos y copas */
  torneos: number;
  /** Total de partidos y jornadas */
  torneo_jornadas: number;
  /** Catálogo de conceptos arancelarios */
  conceptos_pago: number;
  /** Total de recibos de pago registrados */
  pagos: number;
  /** Total de comunicados de prensa */
  noticias: number;
  /** Indicador de cumplimiento del objetivo de pruebas (mínimo 50 registros por tabla) */
  all_tables_meet_50_records_target?: boolean;
}
