import { create } from 'zustand';
import { loginApi, registerApi, logoutApi, refreshApi } from '../services/api/authApi';
import { setAuthStore } from '../services/api/axiosClient';

/**
 * Store d'authentification Zustand.
 *
 * Stratégie de stockage des tokens :
 * - accessToken  → mémoire uniquement (this.accessToken) — jamais persisté
 * - refreshToken → localStorage — permet de survivre à un rechargement de page
 *
 * Au démarrage de l'app, initializeAuth() tente un refresh silencieux.
 * Si le refreshToken du localStorage est encore valide, la session est restaurée.
 * Sinon, l'utilisateur reste simplement déconnecté (pas de redirection).
 */
export const useAuthStore = create((set, get) => ({
  // ─── État ────────────────────────────────────────────────
  user: null,
  accessToken: null,
  isLoading: true,  // true jusqu'à la fin de initializeAuth()
  error: null,

  // ─── Actions ─────────────────────────────────────────────

  /**
   * Appelé au montage de <App/>.
   * Tente un refresh silencieux pour restaurer la session.
   */
  initializeAuth: async () => {
    // Si on est sur la page de callback OAuth, ne pas tenter de refresh.
    // Les tokens arrivent via l'URL et seront traités par AuthCallback.
    if (window.location.pathname.includes('/auth/callback')) {
      set({ isLoading: false });
      return;
    }

    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data } = await refreshApi(refreshToken);
      const newAccessToken = data.data.accessToken;

      // Le refresh ne renvoie que le accessToken, pas les infos user.
      // On décode le JWT pour extraire les infos de base.
      const base64Url = newAccessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      set({
        accessToken: newAccessToken,
        user: {
          id: payload.id,
          email: payload.email,
          plan: payload.plan,
          // nom_complet et photo_url sont maintenant dans le token
          nom_complet: payload.nom_complet || payload.email, 
        },
        isLoading: false,
        error: null,
      });
    } catch {
      // Le refresh a échoué (token expiré ou révoqué)
      localStorage.removeItem('refreshToken');
      set({
        user: null,
        accessToken: null,
        isLoading: false,
      });
    }
  },

  /**
   * Connexion classique (email + mot de passe).
   */
  loginUser: async (email, mot_de_passe) => {
    set({ error: null });

    try {
      const { data } = await loginApi(email, mot_de_passe);
      const { accessToken, refreshToken, user } = data.data;

      localStorage.setItem('refreshToken', refreshToken);

      set({
        accessToken,
        user,
        error: null,
      });

      return { success: true };
    } catch (err) {
      const status = err.response?.status;
      let message = 'Une erreur est survenue. Vérifiez votre connexion et réessayez.';
      
      if (status === 401) {
        message = 'Email ou mot de passe incorrect.';
      } else if (status === 400) {
        message = 'Veuillez remplir tous les champs correctement.';
      } else if (status === 429) {
        message = 'Trop de tentatives. Attendez quelques minutes avant de réessayer.';
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      
      set({ error: message });
      return { success: false, message };
    }
  },

  /**
   * Inscription puis connexion automatique.
   */
  registerUser: async (email, mot_de_passe, nom_complet) => {
    set({ error: null });

    try {
      // Étape 1 — Créer le compte
      await registerApi(email, mot_de_passe, nom_complet);

      // Étape 2 — Connexion automatique
      const result = await get().loginUser(email, mot_de_passe);
      return result;
    } catch (err) {
      const status = err.response?.status;
      let message = 'Une erreur est survenue lors de l\'inscription.';
      
      if (status === 409) {
        message = 'Cette adresse email est déjà associée à un compte. Connectez-vous ou utilisez une autre adresse.';
      } else if (status === 400) {
        message = 'Données invalides. Vérifiez les informations saisies.';
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      
      set({ error: message });
      return { success: false, message };
    }
  },

  /**
   * Injection des tokens après un retour OAuth Google.
   */
  setTokensFromOAuth: (accessToken, refreshToken) => {
    localStorage.setItem('refreshToken', refreshToken);

    try {
      // Décodage robuste du JWT (Base64Url -> Base64 -> URI Component -> JSON)
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);

      set({
        accessToken,
        user: {
          id: payload.id,
          email: payload.email,
          plan: payload.plan,
          nom_complet: payload.nom_complet || payload.email,
        },
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Erreur lors du décodage du token Google OAuth', err);
      // Fallback si le décodage échoue
      set({
        accessToken,
        user: { id: 'oauth', email: 'Utilisateur', nom_complet: 'Utilisateur Google' },
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * Déconnexion.
   */
  logoutUser: async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch {
      // Ignorer les erreurs — l'utilisateur est déconnecté côté client de toute façon
    } finally {
      localStorage.removeItem('refreshToken');
      set({
        user: null,
        accessToken: null,
        error: null,
      });
    }
  },

  /**
   * Met à jour les informations de l'utilisateur connecté dans le store.
   * Utilisé après une modification de profil (nom, email).
   * Ne touche pas aux tokens.
   */
  setUser: (userData) => {
    set((state) => ({
      user: { ...state.user, ...userData },
    }));
  },

  /**
   * Utilisé par l'intercepteur Axios lorsque le refresh échoue.
   */
  setAccessToken: (accessToken) => {
    set({ accessToken });
  },

  /**
   * Utilisé par l'intercepteur Axios lorsque le refresh échoue.
   * Nettoie la session et stocke un message d'erreur.
   */
  clearSession: (message) => {
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      accessToken: null,
      error: message || null,
    });
  },

  /**
   * Réinitialise le message d'erreur (ex: quand l'utilisateur tape dans un champ).
   */
  clearError: () => {
    set({ error: null });
  },
}));

// Enregistre le store auprès de l'instance axiosClient
// (évite la dépendance circulaire)
setAuthStore(useAuthStore);
