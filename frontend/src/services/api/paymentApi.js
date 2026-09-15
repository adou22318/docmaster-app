import axiosClient from './axiosClient.js';

export const getStatutAbonnement = () =>
  axiosClient.get('/payments/status');

export const initierPaiement = () =>
  axiosClient.post('/payments/initiate');

/**
 * Confirmation directe après retour de PayDunya.
 * Le backend cherche le dernier paiement 'en_attente' par user_id
 * et confirme server-to-server avec PayDunya.
 */
export const confirmRetour = () =>
  axiosClient.post('/payments/confirm-return');
