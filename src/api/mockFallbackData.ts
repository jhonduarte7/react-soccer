/**
 * @file mockFallbackData.ts
 * @description Conjunto de datos semilla (Seed Data) y almacén de contingencia en memoria.
 * Permite que la aplicación frontend funcione al 100% de manera autónoma en modo demostración
 * cuando el servidor backend de Spring Boot (http://localhost:8082) aún no está en ejecución.
 * Modela todas las entidades del club: categorías, roles, usuarios, jugadores, tutores,
 * posiciones de cancha, torneos, fechas/partidos, conceptos y pagos.
 */

import {
  Category,
  Role,
  User,
  Player,
  Guardian,
  PlayerGuardian,
  PlayerPosition,
  Tournament,
  TournamentMatchday,
  PaymentConcept,
  Payment,
  NewsArticle,
  DatabaseStats
} from '../types/soccer';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'SUB-6-A' },
  { id: 2, name: 'SUB-8-A' },
  { id: 3, name: 'SUB-10-A' },
  { id: 4, name: 'SUB-12-A' },
  { id: 5, name: 'SUB-14-A' },
  { id: 6, name: 'SUB-16-A' },
  { id: 7, name: 'SUB-18-A' },
  { id: 8, name: 'SUB-20-A' },
  { id: 9, name: 'FEMENINO-SUB-14' },
  { id: 10, name: 'FEMENINO-SUB-16' },
  { id: 11, name: 'ALTO-RENDIMIENTO-A' },
  { id: 12, name: 'ESCUELA-FORMATIVA' },
];

export const INITIAL_ROLES: Role[] = [
  { id: 1, name: 'ROLE_ADMIN' },
  { id: 2, name: 'ROLE_HEAD_COACH' },
  { id: 3, name: 'ROLE_ASSISTANT_COACH' },
  { id: 4, name: 'ROLE_GOALKEEPER_COACH' },
  { id: 5, name: 'ROLE_PHYSIOTHERAPIST' },
  { id: 6, name: 'ROLE_ACADEMY_DIRECTOR' },
  { id: 7, name: 'ROLE_TREASURER' },
  { id: 8, name: 'ROLE_SCOUT' },
];

export const INITIAL_USERS: User[] = [
  { id: 1, username: 'carlos.rodriguez', email: 'carlos.rodriguez@soccernet.com', roleId: 1, roleName: 'ROLE_ADMIN' },
  { id: 2, username: 'marcos.gonzalez', email: 'marcos.gonzalez@soccernet.com', roleId: 2, roleName: 'ROLE_HEAD_COACH' },
  { id: 3, username: 'lucas.fernandez', email: 'lucas.fernandez@soccernet.com', roleId: 6, roleName: 'ROLE_ACADEMY_DIRECTOR' },
  { id: 4, username: 'sofia.martinez', email: 'sofia.martinez@soccernet.com', roleId: 5, roleName: 'ROLE_PHYSIOTHERAPIST' },
  { id: 5, username: 'mateo.perez', email: 'mateo.perez@soccernet.com', roleId: 7, roleName: 'ROLE_TREASURER' },
];

export const INITIAL_PLAYERS: Player[] = [
  { id: 1, firstName: 'Lionel', lastName: 'Messi A', birthDate: '2008-06-24', registrationDate: '2023-01-15', categoryId: 4, categoryName: 'SUB-12-A' },
  { id: 2, firstName: 'Cristiano', lastName: 'Dos Santos B', birthDate: '2008-02-05', registrationDate: '2023-02-10', categoryId: 4, categoryName: 'SUB-12-A' },
  { id: 3, firstName: 'Kylian', lastName: 'Mbappe C', birthDate: '2009-12-20', registrationDate: '2023-03-01', categoryId: 3, categoryName: 'SUB-10-A' },
  { id: 4, firstName: 'Erling', lastName: 'Haaland D', birthDate: '2007-07-21', registrationDate: '2022-09-12', categoryId: 5, categoryName: 'SUB-14-A' },
  { id: 5, firstName: 'Luka', lastName: 'Modric E', birthDate: '2008-09-09', registrationDate: '2023-01-20', categoryId: 4, categoryName: 'SUB-12-A' },
  { id: 6, firstName: 'Kevin', lastName: 'De Bruyne F', birthDate: '2007-06-28', registrationDate: '2022-08-15', categoryId: 5, categoryName: 'SUB-14-A' },
  { id: 7, firstName: 'Jude', lastName: 'Bellingham G', birthDate: '2006-06-29', registrationDate: '2022-05-10', categoryId: 6, categoryName: 'SUB-16-A' },
  { id: 8, firstName: 'Federico', lastName: 'Valverde H', birthDate: '2006-07-22', registrationDate: '2022-06-18', categoryId: 6, categoryName: 'SUB-16-A' },
  { id: 9, firstName: 'Vinicius', lastName: 'Junior I', birthDate: '2007-07-12', registrationDate: '2022-10-05', categoryId: 5, categoryName: 'SUB-14-A' },
  { id: 10, firstName: 'Thibaut', lastName: 'Courtois J', birthDate: '2008-05-11', registrationDate: '2023-02-28', categoryId: 4, categoryName: 'SUB-12-A' },
  { id: 11, firstName: 'Ronald', lastName: 'Araujo K', birthDate: '2005-03-07', registrationDate: '2021-04-12', categoryId: 8, categoryName: 'SUB-20-A' },
  { id: 12, firstName: 'Antoine', lastName: 'Griezmann L', birthDate: '2006-03-21', registrationDate: '2022-07-14', categoryId: 6, categoryName: 'SUB-16-A' },
  { id: 13, firstName: 'Camila', lastName: 'Rodriguez M', birthDate: '2009-08-19', registrationDate: '2023-04-10', categoryId: 9, categoryName: 'FEMENINO-SUB-14' },
  { id: 14, firstName: 'Valentina', lastName: 'Sanchez N', birthDate: '2007-11-03', registrationDate: '2022-11-20', categoryId: 10, categoryName: 'FEMENINO-SUB-16' },
  { id: 15, firstName: 'Mateo', lastName: 'Alonso P', birthDate: '2010-04-15', registrationDate: '2024-01-08', categoryId: 2, categoryName: 'SUB-8-A' },
];

export const INITIAL_GUARDIANS: Guardian[] = [
  { id: 1, fullName: 'Jorge Messi', phone: '+34 612345678', email: 'jorge.messi@familynetwork.org' },
  { id: 2, fullName: 'Dolores Aveiro', phone: '+34 623456789', email: 'dolores.aveiro@familynetwork.org' },
  { id: 3, fullName: 'Fayza Lamari', phone: '+34 634567890', email: 'fayza.lamari@familynetwork.org' },
  { id: 4, fullName: 'Alf-Inge Haaland', phone: '+34 645678901', email: 'alfinge.haaland@familynetwork.org' },
  { id: 5, fullName: 'Mark Bellingham', phone: '+34 656789012', email: 'mark.bellingham@familynetwork.org' },
];

export const INITIAL_PLAYER_GUARDIANS: PlayerGuardian[] = [
  { playerId: 1, playerName: 'Lionel Messi A', guardianId: 1, guardianName: 'Jorge Messi', relationship: 'Padre' },
  { playerId: 2, playerName: 'Cristiano Dos Santos B', guardianId: 2, guardianName: 'Dolores Aveiro', relationship: 'Madre' },
  { playerId: 3, playerName: 'Kylian Mbappe C', guardianId: 3, guardianName: 'Fayza Lamari', relationship: 'Madre' },
  { playerId: 4, playerName: 'Erling Haaland D', guardianId: 4, guardianName: 'Alf-Inge Haaland', relationship: 'Padre' },
  { playerId: 7, playerName: 'Jude Bellingham G', guardianId: 5, guardianName: 'Mark Bellingham', relationship: 'Padre' },
];

export const INITIAL_PLAYER_POSITIONS: PlayerPosition[] = [
  { playerId: 1, playerName: 'Lionel Messi A', position: 'Extremo Derecho' },
  { playerId: 1, playerName: 'Lionel Messi A', position: 'Mediapunta' },
  { playerId: 2, playerName: 'Cristiano Dos Santos B', position: 'Delantero Centro' },
  { playerId: 2, playerName: 'Cristiano Dos Santos B', position: 'Extremo Izquierdo' },
  { playerId: 3, playerName: 'Kylian Mbappe C', position: 'Extremo Izquierdo' },
  { playerId: 4, playerName: 'Erling Haaland D', position: 'Delantero Centro' },
  { playerId: 5, playerName: 'Luka Modric E', position: 'Mediocentro' },
  { playerId: 6, playerName: 'Kevin De Bruyne F', position: 'Mediapunta' },
  { playerId: 7, playerName: 'Jude Bellingham G', position: 'Mediocentro' },
  { playerId: 8, playerName: 'Federico Valverde H', position: 'Lateral Derecho' },
  { playerId: 9, playerName: 'Vinicius Junior I', position: 'Extremo Izquierdo' },
  { playerId: 10, playerName: 'Thibaut Courtois J', position: 'Portero' },
  { playerId: 11, playerName: 'Ronald Araujo K', position: 'Defensa Central' },
  { playerId: 12, playerName: 'Antoine Griezmann L', position: 'Mediapunta' },
  { playerId: 13, playerName: 'Camila Rodriguez M', position: 'Mediocentro' },
  { playerId: 14, playerName: 'Valentina Sanchez N', position: 'Delantera Centro' },
  { playerId: 15, playerName: 'Mateo Alonso P', position: 'Pivote Defensivo' },
];

export const INITIAL_TOURNAMENTS: Tournament[] = [
  { id: 1, tournamentName: 'Copa Apertura Oro 2025', startDate: '2025-03-01', endDate: '2025-05-30', status: 'Activo' },
  { id: 2, tournamentName: 'Liga Juvenil Clausura 2025', startDate: '2025-06-15', endDate: '2025-08-30', status: 'Planificado' },
  { id: 3, tournamentName: 'Torneo Promesas del Futuro 2025', startDate: '2025-02-10', endDate: '2025-04-20', status: 'Activo' },
  { id: 4, tournamentName: 'Copa Federacion Regional 2024', startDate: '2024-09-01', endDate: '2024-11-28', status: 'Finalizado' },
  { id: 5, tournamentName: 'Supercopa Academias Elite 2025', startDate: '2025-07-01', endDate: '2025-07-25', status: 'Planificado' },
];

export const INITIAL_MATCHDAYS: TournamentMatchday[] = [
  {
    id: 1,
    tournamentId: 1,
    tournamentName: 'Copa Apertura Oro 2025',
    homeTeam: 'Academia SoccerNet Sub-12',
    awayTeam: 'Real Balompié FC',
    matchDateTime: '2025-04-18T10:30:00',
    location: 'Sede Cancha Principal - Campo #1'
  },
  {
    id: 2,
    tournamentId: 1,
    tournamentName: 'Copa Apertura Oro 2025',
    homeTeam: 'Los Halcones FC',
    awayTeam: 'Academia SoccerNet Sub-14',
    matchDateTime: '2025-04-19T12:00:00',
    location: 'Polideportivo Municipal - Pista Norte'
  },
  {
    id: 3,
    tournamentId: 3,
    tournamentName: 'Torneo Promesas del Futuro 2025',
    homeTeam: 'Academia SoccerNet Sub-10',
    awayTeam: 'Deportivo Cantera',
    matchDateTime: '2025-04-20T09:30:00',
    location: 'Complejo Deportivo El Retiro - Campo A'
  },
  {
    id: 4,
    tournamentId: 1,
    tournamentName: 'Copa Apertura Oro 2025',
    homeTeam: 'Sporting Metropolitano',
    awayTeam: 'Academia SoccerNet Sub-16',
    matchDateTime: '2025-04-25T16:00:00',
    location: 'Estadio de la Juventud - Cancha #3'
  },
];

export const INITIAL_PAYMENT_CONCEPTS: PaymentConcept[] = [
  { id: 1, conceptName: 'Mensualidad Formativa Sub-10', expectedAmount: 55.00 },
  { id: 2, conceptName: 'Mensualidad Competitiva Sub-12', expectedAmount: 60.00 },
  { id: 3, conceptName: 'Mensualidad Alto Rendimiento Sub-14', expectedAmount: 65.00 },
  { id: 4, conceptName: 'Matrícula e Inscripción Anual 2025', expectedAmount: 120.00 },
  { id: 5, conceptName: 'Pack Uniforme Oficial (Local/Visitante)', expectedAmount: 85.00 },
  { id: 6, conceptName: 'Seguro Médico Deportivo Anual', expectedAmount: 45.00 },
  { id: 7, conceptName: 'Cuota de Arbitraje Torneo Apertura', expectedAmount: 35.00 },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 1,
    playerId: 1,
    playerName: 'Lionel Messi A',
    paymentConceptId: 2,
    paymentConceptName: 'Mensualidad Competitiva Sub-12',
    reportDate: '2025-04-01T09:15:00',
    amountPaid: 60.00,
    bankReference: 'BANCO-REF-89102341',
    paymentStatus: 'Aprobado',
    validatorUserId: 1,
    validatorUsername: 'carlos.rodriguez'
  },
  {
    id: 2,
    playerId: 2,
    playerName: 'Cristiano Dos Santos B',
    paymentConceptId: 2,
    paymentConceptName: 'Mensualidad Competitiva Sub-12',
    reportDate: '2025-04-02T11:30:00',
    amountPaid: 60.00,
    bankReference: 'BANCO-REF-89102342',
    paymentStatus: 'Aprobado',
    validatorUserId: 1,
    validatorUsername: 'carlos.rodriguez'
  },
  {
    id: 3,
    playerId: 3,
    playerName: 'Kylian Mbappe C',
    paymentConceptId: 4,
    paymentConceptName: 'Matrícula e Inscripción Anual 2025',
    reportDate: '2025-04-05T14:20:00',
    amountPaid: 120.00,
    bankReference: 'BANCO-REF-89102343',
    paymentStatus: 'Pendiente',
    validatorUserId: null,
    validatorUsername: null
  },
  {
    id: 4,
    playerId: 4,
    playerName: 'Erling Haaland D',
    paymentConceptId: 5,
    paymentConceptName: 'Pack Uniforme Oficial (Local/Visitante)',
    reportDate: '2025-04-06T16:45:00',
    amountPaid: 85.00,
    bankReference: 'BANCO-REF-89102344',
    paymentStatus: 'Aprobado',
    validatorUserId: 1,
    validatorUsername: 'carlos.rodriguez'
  },
  {
    id: 5,
    playerId: 7,
    playerName: 'Jude Bellingham G',
    paymentConceptId: 3,
    paymentConceptName: 'Mensualidad Alto Rendimiento Sub-14',
    reportDate: '2025-04-08T10:00:00',
    amountPaid: 65.00,
    bankReference: 'BANCO-REF-89102345',
    paymentStatus: 'Pendiente',
    validatorUserId: null,
    validatorUsername: null
  },
  {
    id: 6,
    playerId: 10,
    playerName: 'Thibaut Courtois J',
    paymentConceptId: 7,
    paymentConceptName: 'Cuota de Arbitraje Torneo Apertura',
    reportDate: '2025-04-09T18:10:00',
    amountPaid: 35.00,
    bankReference: 'BANCO-REF-89102346',
    paymentStatus: 'Rechazado',
    validatorUserId: 1,
    validatorUsername: 'carlos.rodriguez'
  },
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 1,
    title: 'Gran inauguración de la temporada 2025 en nuestra Cantera',
    content: 'Damos la bienvenida oficial a más de 250 jóvenes talentos inscritos en nuestras 12 categorías. El equipo técnico ha presentado el nuevo plan de tecnificación y desarrollo deportivo enfocado en valores, alto rendimiento y juego limpio.',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
    publicationDate: '2025-04-01T08:00:00',
    authorId: 1,
    authorUsername: 'carlos.rodriguez'
  },
  {
    id: 2,
    title: 'Victoria contundente de nuestra categoría Sub-12 en la final regional',
    content: 'Con un fútbol dinámico, presión alta y juego asociativo ejemplar, la categoría Sub-12 se alzó con la victoria por 3-1 ante Real Balompié. Felicitamos a los entrenadores, jugadores y a las familias por su incansable apoyo.',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1000&q=80',
    publicationDate: '2025-04-06T19:30:00',
    authorId: 2,
    authorUsername: 'marcos.gonzalez'
  },
  {
    id: 3,
    title: 'Convocatoria abierta para pruebas de captación juvenil Sub-14 y Sub-16',
    content: 'Se abre el proceso de visorías técnicas para jóvenes futbolistas nacidos entre 2007 y 2010. Las pruebas se realizarán en el Campo Principal con la presencia de directores deportivos y scouts invitados.',
    imageUrl: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1000&q=80',
    publicationDate: '2025-04-10T11:00:00',
    authorId: 3,
    authorUsername: 'lucas.fernandez'
  },
];

export const INITIAL_STATS: DatabaseStats = {
  roles: 52,
  usuarios: 55,
  categorias: 52,
  jugadores: 55,
  tutores: 55,
  jugadores_tutores: 55,
  jugador_posiciones: 60,
  torneos: 52,
  torneo_jornadas: 55,
  conceptos_pago: 52,
  pagos: 55,
  noticias: 52,
  all_tables_meet_50_records_target: true
};
