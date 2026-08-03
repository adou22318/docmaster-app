import axiosClient from './axiosClient';

/**
 * Inscription d'un nouvel utilisateur.
 * POST /api/auth/register
 * Body: { email, mot_de_passe, nom_complet }
 * Réponse succès: { success: true, data: { id_users, email, nom_complet, plan, created_at } }
 */
export const registerApi = (email, mot_de_passe, nom_complet) => {
  return axiosClient.post('/auth/register', { email, mot_de_passe, nom_complet });
};

/**
 * Connexion d'un utilisateur existant.
 * POST /api/auth/login
 * Body: { email, mot_de_passe }
 * Réponse succès: { success: true, data: { accessToken, refreshToken, user: { id, email, nom_complet, plan, photo_url } } }
 */
export const loginApi = (email, mot_de_passe) => {
  return axiosClient.post('/auth/login', { email, mot_de_passe });
};

/**
 * Renouvellement du access token via le refresh token.
 * POST /api/auth/refresh
 * Header: Authorization: Bearer <refreshToken>
 * Réponse succès: { success: true, data: { accessToken } }
 */
export const refreshApi = (refreshToken) => {
  return axiosClient.post('/auth/refresh', {}, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
};

/**
 * Déconnexion — révoque le refresh token côté serveur.
 * POST /api/auth/logout
 * Header: Authorization: Bearer <refreshToken>
 * Réponse succès: { success: true, message: 'Déconnexion réussie.' }
 */
export const logoutApi = (refreshToken) => {
  return axiosClient.post('/auth/logout', {}, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
};
