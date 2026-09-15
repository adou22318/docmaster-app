import rateLimit from 'express-rate-limit';

// Limite générale — toutes les routes
export const limiterGeneral = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 60,              // 60 requêtes par minute par IP
  message: {
    success: false,
    message: 'Trop de requêtes. Attendez 1 minute avant de réessayer.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limite stricte — routes upload et jobs
// Plus restrictif pour éviter les abus
export const limiterUpload = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Limite d'upload atteinte. Maximum 20 fichiers par minute."
  }
});

export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 tentatives de paiement / 15 min par IP
  message: {
    success: false,
    message: 'Trop de tentatives de paiement. Attendez 15 minutes.'
  }
});