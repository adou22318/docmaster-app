import { create } from 'zustand';

/**
 * Store Zustand pour les notifications.
 * Les notifications sont stockées en mémoire uniquement (pas de persistance BDD en V1).
 * Elles disparaissent au rechargement de la page — suffisant pour la soutenance.
 *
 * Structure d'une notification :
 * {
 *   id: string (uuid),
 *   type: 'success' | 'error' | 'info',
 *   titre: string,
 *   message: string,
 *   jobId: string | null,
 *   resultatUrl: string | null,
 *   lu: boolean,
 *   createdAt: number (timestamp ms)
 * }
 */
export const useNotificationStore = create((set, get) => ({
  notifications: [],

  /** Ajoute une notification en tête de liste (max 20). */
  ajouterNotification: (notification) => set((state) => ({
    notifications: [
      {
        id: crypto.randomUUID(),
        lu: false,
        createdAt: Date.now(),
        jobId: null,
        resultatUrl: null,
        ...notification,
      },
      ...state.notifications,
    ].slice(0, 20),
  })),

  /** Marque une notification comme lue. */
  marquerCommeLu: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, lu: true } : n),
  })),

  /** Marque toutes les notifications comme lues. */
  toutMarquerCommeLu: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, lu: true })),
  })),

  /** Supprime une notification de la liste. */
  supprimerNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
  })),

  /** Supprime toutes les notifications. */
  toutEffacer: () => set({ notifications: [] }),

  /** Retourne le nombre de notifications non lues. */
  getNonLues: () => get().notifications.filter(n => !n.lu).length,
}));
