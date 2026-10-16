/**
 * ============================================================================
 * SOCCERNET PRO - CAPA DE SERVICIO API REST (SOCCERAPI)
 * ============================================================================
 * Esta capa gestiona la comunicación HTTP con los controladores de Spring Boot
 * (proyecto SOCCER). Incorpora tolerancia a fallos: si el backend no se encuentra
 * activo, recurre a un almacén local simulado sincronizado en tiempo real para
 * garantizar que la interfaz se mantenga 100% interactiva y funcional.
 */

import { apiClient } from './client';
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
import {
  INITIAL_CATEGORIES,
  INITIAL_ROLES,
  INITIAL_USERS,
  INITIAL_PLAYERS,
  INITIAL_GUARDIANS,
  INITIAL_PLAYER_GUARDIANS,
  INITIAL_PLAYER_POSITIONS,
  INITIAL_TOURNAMENTS,
  INITIAL_MATCHDAYS,
  INITIAL_PAYMENT_CONCEPTS,
  INITIAL_PAYMENTS,
  INITIAL_NEWS,
  INITIAL_STATS,
} from './mockFallbackData';

/**
 * Obtiene un elemento de localStorage con tipado genérico y valor de respaldo.
 */
const getStorageItem = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(`soccer_app_${key}`);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
};

/**
 * Persiste un elemento en localStorage protegiendo ante posibles excepciones de cuota.
 */
const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`soccer_app_${key}`, JSON.stringify(value));
  } catch {
    // Control silencioso de cuota de almacenamiento
  }
};

/** Indicador global del estado de comunicación en vivo con el backend */
let isBackendLive = false;

/**
 * Devuelve si la última petición fue atendida exitosamente por el backend Spring Boot.
 */
export const getBackendLiveStatus = () => isBackendLive;

/**
 * Servicio centralizado con métodos asíncronos para todas las operaciones CRUD.
 */
export const soccerApi = {
  // ==========================================================================
  // ESTADÍSTICAS GLOBALES (/api/stats)
  // ==========================================================================
  /**
   * Obtiene el conteo total de registros de cada entidad de la base de datos.
   */
  getStats: async (): Promise<DatabaseStats> => {
    try {
      const res = await apiClient.get<DatabaseStats>('/stats');
      isBackendLive = true;
      return res.data;
    } catch {
      isBackendLive = false;
      const players = getStorageItem<Player[]>('players', INITIAL_PLAYERS);
      const tournaments = getStorageItem<Tournament[]>('tournaments', INITIAL_TOURNAMENTS);
      const payments = getStorageItem<Payment[]>('payments', INITIAL_PAYMENTS);
      const news = getStorageItem<NewsArticle[]>('news', INITIAL_NEWS);
      return {
        ...INITIAL_STATS,
        jugadores: Math.max(players.length, INITIAL_STATS.jugadores),
        torneos: Math.max(tournaments.length, INITIAL_STATS.torneos),
        pagos: Math.max(payments.length, INITIAL_STATS.pagos),
        noticias: Math.max(news.length, INITIAL_STATS.noticias),
      };
    }
  },

  // ==========================================================================
  // JUGADORES / PLANTEL (/api/players)
  // ==========================================================================
  /**
   * Lista todos los futbolistas o filtra opcionalmente por categoría formativa.
   */
  getPlayers: async (categoryId?: number): Promise<Player[]> => {
    try {
      const params = categoryId ? { categoryId } : undefined;
      const res = await apiClient.get<Player[]>('/players', { params });
      isBackendLive = true;
      return res.data;
    } catch {
      isBackendLive = false;
      const all = getStorageItem<Player[]>('players', INITIAL_PLAYERS);
      if (categoryId) {
        return all.filter((p) => p.categoryId === categoryId);
      }
      return all;
    }
  },

  /**
   * Obtiene la ficha de un jugador por su identificador único.
   */
  getPlayerById: async (id: number): Promise<Player> => {
    try {
      const res = await apiClient.get<Player>(`/players/${id}`);
      isBackendLive = true;
      return res.data;
    } catch {
      const all = getStorageItem<Player[]>('players', INITIAL_PLAYERS);
      const found = all.find((p) => p.id === id);
      if (!found) throw new Error('Jugador no encontrado');
      return found;
    }
  },

  /**
   * Da de alta un nuevo futbolista en el plantel de la academia.
   */
  createPlayer: async (player: Omit<Player, 'id'>): Promise<Player> => {
    try {
      const res = await apiClient.post<Player>('/players', player);
      isBackendLive = true;
      return res.data;
    } catch {
      const all = getStorageItem<Player[]>('players', INITIAL_PLAYERS);
      const categories = getStorageItem<Category[]>('categories', INITIAL_CATEGORIES);
      const category = categories.find((c) => c.id === player.categoryId);
      const newPlayer: Player = {
        ...player,
        id: Date.now(),
        categoryName: category?.name || 'SUB-12-A',
      };
      const updated = [newPlayer, ...all];
      setStorageItem('players', updated);
      return newPlayer;
    }
  },

  /**
   * Actualiza la información deportiva o federativa de un futbolista.
   */
  updatePlayer: async (id: number, player: Partial<Player>): Promise<Player> => {
    try {
      const res = await apiClient.put<Player>(`/players/${id}`, player);
      isBackendLive = true;
      return res.data;
    } catch {
      const all = getStorageItem<Player[]>('players', INITIAL_PLAYERS);
      const categories = getStorageItem<Category[]>('categories', INITIAL_CATEGORIES);
      const updated = all.map((p) => {
        if (p.id === id) {
          const cat = player.categoryId ? categories.find((c) => c.id === player.categoryId) : undefined;
          return {
            ...p,
            ...player,
            categoryName: cat ? cat.name : p.categoryName,
          };
        }
        return p;
      });
      setStorageItem('players', updated);
      const found = updated.find((p) => p.id === id);
      if (!found) throw new Error('Jugador no encontrado');
      return found;
    }
  },

  /**
   * Elimina permanentemente a un jugador del registro institucional.
   */
  deletePlayer: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/players/${id}`);
      isBackendLive = true;
    } catch {
      const all = getStorageItem<Player[]>('players', INITIAL_PLAYERS);
      setStorageItem('players', all.filter((p) => p.id !== id));
    }
  },

  // ==========================================================================
  // DEMARCACIONES TÁCTICAS (/api/player-positions)
  // ==========================================================================
  /**
   * Obtiene las posiciones en el campo asignadas a un futbolista específico.
   */
  getPlayerPositions: async (playerId: number): Promise<PlayerPosition[]> => {
    try {
      const res = await apiClient.get<PlayerPosition[]>(`/player-positions/player/${playerId}`);
      return res.data;
    } catch {
      const all = getStorageItem<PlayerPosition[]>('player_positions', INITIAL_PLAYER_POSITIONS);
      return all.filter((pp) => pp.playerId === playerId);
    }
  },

  /**
   * Asigna una nueva posición táctica en el terreno de juego al futbolista.
   */
  addPlayerPosition: async (pos: PlayerPosition): Promise<PlayerPosition> => {
    try {
      const res = await apiClient.post<PlayerPosition>('/player-positions', pos);
      return res.data;
    } catch {
      const all = getStorageItem<PlayerPosition[]>('player_positions', INITIAL_PLAYER_POSITIONS);
      const updated = [...all, pos];
      setStorageItem('player_positions', updated);
      return pos;
    }
  },

  /**
   * Remueve una posición táctica del perfil del jugador.
   */
  deletePlayerPosition: async (playerId: number, position: string): Promise<void> => {
    try {
      await apiClient.delete(`/player-positions/${playerId}/${encodeURIComponent(position)}`);
    } catch {
      const all = getStorageItem<PlayerPosition[]>('player_positions', INITIAL_PLAYER_POSITIONS);
      const updated = all.filter((p) => !(p.playerId === playerId && p.position === position));
      setStorageItem('player_positions', updated);
    }
  },

  // ==========================================================================
  // TUTORES DEL JUGADOR (/api/player-guardians)
  // ==========================================================================
  /**
   * Obtiene la relación de tutores legales vinculados con un jugador en 4NF.
   */
  getPlayerGuardians: async (playerId: number): Promise<PlayerGuardian[]> => {
    try {
      const res = await apiClient.get<PlayerGuardian[]>(`/player-guardians/player/${playerId}`);
      return res.data;
    } catch {
      const all = getStorageItem<PlayerGuardian[]>('player_guardians', INITIAL_PLAYER_GUARDIANS);
      return all.filter((pg) => pg.playerId === playerId);
    }
  },

  // ==========================================================================
  // CATEGORÍAS FORMATIVAS (/api/categories)
  // ==========================================================================
  /**
   * Obtiene la lista completa de divisiones formativas por edad.
   */
  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await apiClient.get<Category[]>('/categories');
      isBackendLive = true;
      return res.data;
    } catch {
      return getStorageItem<Category[]>('categories', INITIAL_CATEGORIES);
    }
  },

  /**
   * Registra una nueva categoría en la academia.
   */
  createCategory: async (category: Omit<Category, 'id'>): Promise<Category> => {
    try {
      const res = await apiClient.post<Category>('/categories', category);
      return res.data;
    } catch {
      const all = getStorageItem<Category[]>('categories', INITIAL_CATEGORIES);
      const newCat: Category = { ...category, id: Date.now() };
      setStorageItem('categories', [...all, newCat]);
      return newCat;
    }
  },

  /**
   * Elimina una categoría formativa.
   */
  deleteCategory: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/categories/${id}`);
    } catch {
      const all = getStorageItem<Category[]>('categories', INITIAL_CATEGORIES);
      setStorageItem('categories', all.filter((c) => c.id !== id));
    }
  },

  // ==========================================================================
  // TORNEOS Y COMPETICIONES (/api/tournaments)
  // ==========================================================================
  /**
   * Obtiene la lista de torneos, filtrando opcionalmente por estado.
   */
  getTournaments: async (status?: string): Promise<Tournament[]> => {
    try {
      const params = status ? { status } : undefined;
      const res = await apiClient.get<Tournament[]>('/tournaments', { params });
      isBackendLive = true;
      return res.data;
    } catch {
      const all = getStorageItem<Tournament[]>('tournaments', INITIAL_TOURNAMENTS);
      if (status) {
        return all.filter((t) => t.status === status);
      }
      return all;
    }
  },

  /**
   * Registra una nueva competición o torneo oficial.
   */
  createTournament: async (tournament: Omit<Tournament, 'id'>): Promise<Tournament> => {
    try {
      const res = await apiClient.post<Tournament>('/tournaments', tournament);
      return res.data;
    } catch {
      const all = getStorageItem<Tournament[]>('tournaments', INITIAL_TOURNAMENTS);
      const newTourn: Tournament = { ...tournament, id: Date.now() };
      setStorageItem('tournaments', [newTourn, ...all]);
      return newTourn;
    }
  },

  /**
   * Actualiza las fechas o el estado de una competición.
   */
  updateTournament: async (id: number, tournament: Partial<Tournament>): Promise<Tournament> => {
    try {
      const res = await apiClient.put<Tournament>(`/tournaments/${id}`, tournament);
      return res.data;
    } catch {
      const all = getStorageItem<Tournament[]>('tournaments', INITIAL_TOURNAMENTS);
      const updated = all.map((t) => (t.id === id ? { ...t, ...tournament } : t));
      setStorageItem('tournaments', updated);
      const found = updated.find((t) => t.id === id);
      if (!found) throw new Error('Torneo no encontrado');
      return found;
    }
  },

  /**
   * Elimina un torneo del calendario oficial.
   */
  deleteTournament: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/tournaments/${id}`);
    } catch {
      const all = getStorageItem<Tournament[]>('tournaments', INITIAL_TOURNAMENTS);
      setStorageItem('tournaments', all.filter((t) => t.id !== id));
    }
  },

  // ==========================================================================
  // JORNADAS Y ENCUENTROS (/api/tournament-matchdays)
  // ==========================================================================
  /**
   * Obtiene los partidos programados, con filtro opcional por torneo.
   */
  getMatchdays: async (tournamentId?: number): Promise<TournamentMatchday[]> => {
    try {
      const params = tournamentId ? { tournamentId } : undefined;
      const res = await apiClient.get<TournamentMatchday[]>('/tournament-matchdays', { params });
      return res.data;
    } catch {
      const all = getStorageItem<TournamentMatchday[]>('matchdays', INITIAL_MATCHDAYS);
      if (tournamentId) {
        return all.filter((m) => m.tournamentId === tournamentId);
      }
      return all;
    }
  },

  /**
   * Fija un nuevo partido con equipos local/visitante, sede y fecha/hora.
   */
  createMatchday: async (matchday: Omit<TournamentMatchday, 'id'>): Promise<TournamentMatchday> => {
    try {
      const res = await apiClient.post<TournamentMatchday>('/tournament-matchdays', matchday);
      return res.data;
    } catch {
      const all = getStorageItem<TournamentMatchday[]>('matchdays', INITIAL_MATCHDAYS);
      const tournaments = getStorageItem<Tournament[]>('tournaments', INITIAL_TOURNAMENTS);
      const t = tournaments.find((item) => item.id === matchday.tournamentId);
      const newMatch: TournamentMatchday = {
        ...matchday,
        id: Date.now(),
        tournamentName: t?.tournamentName || 'Torneo Actual',
      };
      setStorageItem('matchdays', [newMatch, ...all]);
      return newMatch;
    }
  },

  /**
   * Cancela o elimina un partido del fixture.
   */
  deleteMatchday: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/tournament-matchdays/${id}`);
    } catch {
      const all = getStorageItem<TournamentMatchday[]>('matchdays', INITIAL_MATCHDAYS);
      setStorageItem('matchdays', all.filter((m) => m.id !== id));
    }
  },

  // ==========================================================================
  // FINANZAS Y PAGOS (/api/payments)
  // ==========================================================================
  /**
   * Obtiene los comprobantes de pago con filtros opcionales por jugador o estado.
   */
  getPayments: async (params?: { playerId?: number; status?: string }): Promise<Payment[]> => {
    try {
      const res = await apiClient.get<Payment[]>('/payments', { params });
      isBackendLive = true;
      return res.data;
    } catch {
      let all = getStorageItem<Payment[]>('payments', INITIAL_PAYMENTS);
      if (params?.playerId) {
        all = all.filter((p) => p.playerId === params.playerId);
      }
      if (params?.status) {
        all = all.filter((p) => p.paymentStatus === params.status);
      }
      return all;
    }
  },

  /**
   * Registra un nuevo comprobante o recibo bancario emitido.
   */
  createPayment: async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
    try {
      const res = await apiClient.post<Payment>('/payments', payment);
      return res.data;
    } catch {
      const all = getStorageItem<Payment[]>('payments', INITIAL_PAYMENTS);
      const players = getStorageItem<Player[]>('players', INITIAL_PLAYERS);
      const concepts = getStorageItem<PaymentConcept[]>('concepts', INITIAL_PAYMENT_CONCEPTS);
      const p = players.find((pl) => pl.id === payment.playerId);
      const c = concepts.find((cp) => cp.id === payment.paymentConceptId);
      const newPayment: Payment = {
        ...payment,
        id: Date.now(),
        playerName: p ? `${p.firstName} ${p.lastName}` : 'Jugador Registrado',
        paymentConceptName: c ? c.conceptName : 'Cuota Ordinaria',
      };
      setStorageItem('payments', [newPayment, ...all]);
      return newPayment;
    }
  },

  /**
   * Actualiza el estado (Aprobado/Rechazado) o la información de un pago.
   */
  updatePayment: async (id: number, payment: Partial<Payment>): Promise<Payment> => {
    try {
      const res = await apiClient.put<Payment>(`/payments/${id}`, payment);
      return res.data;
    } catch {
      const all = getStorageItem<Payment[]>('payments', INITIAL_PAYMENTS);
      const updated = all.map((p) => (p.id === id ? { ...p, ...payment } : p));
      setStorageItem('payments', updated);
      const found = updated.find((p) => p.id === id);
      if (!found) throw new Error('Pago no encontrado');
      return found;
    }
  },

  /**
   * Elimina un registro de pago.
   */
  deletePayment: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/payments/${id}`);
    } catch {
      const all = getStorageItem<Payment[]>('payments', INITIAL_PAYMENTS);
      setStorageItem('payments', all.filter((p) => p.id !== id));
    }
  },

  // ==========================================================================
  // CONCEPTOS DE PAGO (/api/payment-concepts)
  // ==========================================================================
  /**
   * Lista todos los aranceles o conceptos de pago disponibles.
   */
  getPaymentConcepts: async (): Promise<PaymentConcept[]> => {
    try {
      const res = await apiClient.get<PaymentConcept[]>('/payment-concepts');
      return res.data;
    } catch {
      return getStorageItem<PaymentConcept[]>('concepts', INITIAL_PAYMENT_CONCEPTS);
    }
  },

  /**
   * Registra un nuevo concepto de cobro con su importe estándar.
   */
  createPaymentConcept: async (concept: Omit<PaymentConcept, 'id'>): Promise<PaymentConcept> => {
    try {
      const res = await apiClient.post<PaymentConcept>('/payment-concepts', concept);
      return res.data;
    } catch {
      const all = getStorageItem<PaymentConcept[]>('concepts', INITIAL_PAYMENT_CONCEPTS);
      const newConcept: PaymentConcept = { ...concept, id: Date.now() };
      setStorageItem('concepts', [...all, newConcept]);
      return newConcept;
    }
  },

  // ==========================================================================
  // NOTICIAS Y BOLETINES (/api/news)
  // ==========================================================================
  /**
   * Lista las noticias oficiales publicadas, con filtro opcional por autor.
   */
  getNews: async (authorId?: number): Promise<NewsArticle[]> => {
    try {
      const params = authorId ? { authorId } : undefined;
      const res = await apiClient.get<NewsArticle[]>('/news', { params });
      return res.data;
    } catch {
      const all = getStorageItem<NewsArticle[]>('news', INITIAL_NEWS);
      if (authorId) {
        return all.filter((n) => n.authorId === authorId);
      }
      return all;
    }
  },

  /**
   * Publica un nuevo comunicado o noticia en el portal oficial del club.
   */
  createNews: async (article: Omit<NewsArticle, 'id'>): Promise<NewsArticle> => {
    try {
      const res = await apiClient.post<NewsArticle>('/news', article);
      return res.data;
    } catch {
      const all = getStorageItem<NewsArticle[]>('news', INITIAL_NEWS);
      const users = getStorageItem<User[]>('users', INITIAL_USERS);
      const author = users.find((u) => u.id === article.authorId);
      const newArticle: NewsArticle = {
        ...article,
        id: Date.now(),
        authorUsername: author?.username || 'redaccion.club',
      };
      setStorageItem('news', [newArticle, ...all]);
      return newArticle;
    }
  },

  /**
   * Elimina un artículo del boletín de noticias.
   */
  deleteNews: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/news/${id}`);
    } catch {
      const all = getStorageItem<NewsArticle[]>('news', INITIAL_NEWS);
      setStorageItem('news', all.filter((n) => n.id !== id));
    }
  },

  // ==========================================================================
  // TUTORES LEGALES (/api/guardians)
  // ==========================================================================
  /**
   * Lista el directorio de tutores legales y contactos de emergencia.
   */
  getGuardians: async (): Promise<Guardian[]> => {
    try {
      const res = await apiClient.get<Guardian[]>('/guardians');
      return res.data;
    } catch {
      return getStorageItem<Guardian[]>('guardians', INITIAL_GUARDIANS);
    }
  },

  /**
   * Da de alta a un nuevo tutor legal con información de contacto verificada.
   */
  createGuardian: async (guardian: Omit<Guardian, 'id'>): Promise<Guardian> => {
    try {
      const res = await apiClient.post<Guardian>('/guardians', guardian);
      return res.data;
    } catch {
      const all = getStorageItem<Guardian[]>('guardians', INITIAL_GUARDIANS);
      const newG: Guardian = { ...guardian, id: Date.now() };
      setStorageItem('guardians', [...all, newG]);
      return newG;
    }
  },

  // ==========================================================================
  // USUARIOS Y STAFF (/api/users)
  // ==========================================================================
  /**
   * Lista los usuarios del sistema y miembros del cuerpo técnico/directiva.
   */
  getUsers: async (): Promise<User[]> => {
    try {
      const res = await apiClient.get<User[]>('/users');
      return res.data;
    } catch {
      return getStorageItem<User[]>('users', INITIAL_USERS);
    }
  },

  /**
   * Registra a un nuevo usuario o miembro técnico asignándole un rol oficial.
   */
  createUser: async (user: Omit<User, 'id'>): Promise<User> => {
    try {
      const res = await apiClient.post<User>('/users', user);
      return res.data;
    } catch {
      const all = getStorageItem<User[]>('users', INITIAL_USERS);
      const roles = getStorageItem<Role[]>('roles', INITIAL_ROLES);
      const r = roles.find((role) => role.id === user.roleId);
      const newUser: User = {
        ...user,
        id: Date.now(),
        roleName: r?.name || 'ROLE_USER',
      };
      setStorageItem('users', [...all, newUser]);
      return newUser;
    }
  },

  // ==========================================================================
  // ROLES INSTITUCIONALES (/api/roles)
  // ==========================================================================
  /**
   * Obtiene el catálogo de roles y perfiles técnicos disponibles en la plataforma.
   */
  getRoles: async (): Promise<Role[]> => {
    try {
      const res = await apiClient.get<Role[]>('/roles');
      return res.data;
    } catch {
      return getStorageItem<Role[]>('roles', INITIAL_ROLES);
    }
  },
};
