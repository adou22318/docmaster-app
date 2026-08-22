import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Instance Axios centralisée
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ─── Référence paresseuse au store Zustand ─────────────────
// Évite la dépendance circulaire : axiosClient ← authApi ← useAuthStore ← authApi
// Le store s'enregistre lui-même via setAuthStore() dans son propre fichier.
let authStoreRef = null;

export const setAuthStore = (store) => {
  authStoreRef = store;
};

// ─── Verrou anti-doublon pour le refresh ───────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Intercepteur de requête ───────────────────────────────
// Injecte le accessToken dans chaque requête sortante
axiosClient.interceptors.request.use(
  (config) => {
    if (authStoreRef) {
      const accessToken = authStoreRef.getState().accessToken;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Intercepteur de réponse ───────────────────────────────
// Gère le refresh silencieux en cas de 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ne pas tenter de refresh si :
    // - Ce n'est pas un 401
    // - La requête est déjà un retry
    // - C'est la requête de refresh elle-même (évite la boucle infinie)
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    // Si un refresh est déjà en cours, mettre la requête en file d'attente
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('NO_REFRESH_TOKEN');
      }

      // Appel direct avec axios brut (pas axiosClient) pour éviter la boucle d'intercepteur
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
        headers: { Authorization: `Bearer ${refreshToken}` },
        withCredentials: true,
      });

      const newAccessToken = data.data.accessToken;

      // Mettre à jour le store avec le nouveau token
      if (authStoreRef) {
        authStoreRef.getState().setAccessToken(newAccessToken);
      }

      processQueue(null, newAccessToken);

      // Rejouer la requête originale avec le nouveau token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Le refresh a échoué → session expirée
      if (authStoreRef) {
        authStoreRef.getState().clearSession('Session expirée, veuillez vous reconnecter.');
      }

      // NE PAS rediriger si on est sur la page AuthCallback
      // Sinon on casse le flux OAuth Google
      if (!window.location.pathname.includes('/auth/callback')) {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;
