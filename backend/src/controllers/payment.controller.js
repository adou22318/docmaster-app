import pool from '../config/db.js';
import { initierPaiement, confirmerPaiement, getStatutAbonnement, loggerEvenement, dechiffrerToken } from '../services/payment.service.js';

export const initiatePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await initierPaiement(userId);

    return res.status(200).json({
      success: true,
      data: { paymentUrl: result.paymentUrl }
    });

  } catch (error) {
    if (error.message === 'ABONNEMENT_DEJA_ACTIF') {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà un abonnement actif.'
      });
    }
    console.error('Erreur initiatePayment:', error);
    return res.status(500).json({
      success: false,
      message: "Impossible d'initier le paiement. Réessayez."
    });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    // Vérification de la signature PayDunya
    const signatureRecue = req.headers['x-paydunya-signature'] || req.body?.hash;

    if (!signatureRecue) {
      await loggerEvenement('paiement_webhook_invalide', null, req.ip, 'Signature absente');
      return res.status(403).json({ error: 'Signature manquante' });
    }

    const crypto = await import('crypto');
    const hashAttendu = crypto.default
      .createHash('sha512')
      .update(process.env.PAYDUNYA_MASTER_KEY)
      .digest('hex');

    if (signatureRecue !== hashAttendu) {
      await loggerEvenement('paiement_webhook_invalide', null, req.ip, 'Signature incorrecte');
      return res.status(403).json({ error: 'Signature invalide' });
    }

    const paydunyaToken = req.body?.data?.invoice?.token || req.body?.token || req.body?.invoice?.token;

    if (!paydunyaToken) {
      return res.status(400).json({ error: 'Token manquant' });
    }

    const result = await confirmerPaiement(paydunyaToken);
    
    return res.status(200).json({ received: true, result });

  } catch (error) {
    console.error('Erreur webhook PayDunya:', error);
    // Toujours répondre 200 à PayDunya même en cas d'erreur
    return res.status(200).json({ received: true, error: error.message });
  }
};

export const getStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const abonnement = await getStatutAbonnement(userId);

    const userResult = await pool.query(
      'SELECT stockage_utilise, quota_stockage FROM users WHERE id_users = $1',
      [userId]
    );
    const user = userResult.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        ...abonnement,
        quota: {
          utilise: parseInt(user.stockage_utilise) || 0,
          total: parseInt(user.quota_stockage) || 524288000,
          pourcentage: user.quota_stockage > 0 
            ? Math.round((user.stockage_utilise / user.quota_stockage) * 100)
            : 0
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du statut.'
    });
  }
};

/**
 * Confirmation directe côté retour utilisateur.
 * Cherche le dernier paiement en_attente pour cet utilisateur et le confirme
 * via l'API PayDunya server-to-server (sans webhook, utile en dev local).
 */
export const confirmReturn = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer le dernier paiement en attente pour cet utilisateur
    const abResult = await pool.query(
      `SELECT * FROM abonnements
       WHERE user_id = $1 AND statut = 'en_attente'
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (abResult.rows.length === 0) {
      // Pas de paiement en attente → vérifier si déjà Pro
      const statut = await getStatutAbonnement(userId);
      if (statut.statut === 'actif') {
        return res.status(200).json({ success: true, data: { result: { deja_traite: true }, abonnement: statut } });
      }
      return res.status(404).json({ success: false, message: 'Aucun paiement en attente trouvé.' });
    }

    const abonnement = abResult.rows[0];

    // Déchiffrer le token PayDunya stocké
    let paydunyaToken;
    try {
      paydunyaToken = dechiffrerToken(abonnement.paydunya_token);
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Erreur de déchiffrement du token.' });
    }

    // Confirmer avec PayDunya server-to-server
    const result = await confirmerPaiement(paydunyaToken);

    // Récupérer le statut mis à jour
    const statutMaj = await getStatutAbonnement(userId);

    return res.status(200).json({
      success: true,
      data: { result, abonnement: statutMaj }
    });

  } catch (error) {
    console.error('Erreur confirmReturn:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la confirmation.' });
  }
};

export const getAdminLogs = async (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM logs_securite
       WHERE type LIKE 'paiement%'
       ORDER BY created_at DESC
       LIMIT 100`
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
