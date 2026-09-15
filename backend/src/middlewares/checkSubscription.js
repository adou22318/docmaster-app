import { getStatutAbonnement } from '../services/payment.service.js';

const checkSubscription = async (req, res, next) => {
  // Feature flag : si paiement désactivé → accès total
  if (process.env.PAYMENT_ENABLED !== 'true') {
    return next();
  }

  try {
    const userId = req.user.id;
    const abonnement = await getStatutAbonnement(userId);

    if (abonnement.actif) {
      // Attacher le plan à req pour usage dans les controllers
      req.userPlan = abonnement.plan;
      return next();
    }

    // Abonnement inactif → bloquer avec code 402
    const messages = {
      'expire': {
        code: 'ESSAI_EXPIRE',
        message: "Votre période d'essai de 7 jours est terminée. Choisissez un plan pour continuer.",
        redirectUrl: '/pricing'
      },
      'annule': {
        code: 'ABONNEMENT_REQUIS',
        message: 'Un abonnement est requis pour utiliser cette fonctionnalité.',
        redirectUrl: '/pricing'
      }
    };

    const reponse = messages[abonnement.statut] || {
      code: 'ABONNEMENT_REQUIS',
      message: 'Accès restreint. Veuillez souscrire à un abonnement.',
      redirectUrl: '/pricing'
    };

    return res.status(402).json({
      success: false,
      ...reponse
    });

  } catch (error) {
    console.error('Erreur checkSubscription:', error);
    // En cas d'erreur du service → ne pas bloquer l'utilisateur
    // (fail open : mieux de laisser passer que de bloquer injustement)
    return next();
  }
};

export default checkSubscription;
