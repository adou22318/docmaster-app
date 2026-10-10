import pool from '../config/db.js';
import crypto from 'crypto';

const loggerEvenement = async (type, userId, ip, details = '') => {
  try {
    await pool.query(
      `INSERT INTO logs_securite (type, user_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [type, userId || null, ip || '0.0.0.0', details]
    );
  } catch (err) {
    console.error('Erreur loggerEvenement:', err);
  }
};

export const getStatutAbonnement = async (userId) => {
  // Le calcul de joursRestants est fait dans PostgreSQL (via son propre NOW())
  // pour éviter tout décalage d'horloge entre le conteneur Docker et Node.js Windows.
  // L'admin panel fait la même chose — les deux vues sont ainsi cohérentes.
  const result = await pool.query(
    `SELECT *,
       NOW() AS pg_now,
       CASE
         WHEN statut = 'essai' THEN
           GREATEST(0, CEIL(EXTRACT(EPOCH FROM (date_fin_essai - NOW())) / 86400))::int
         WHEN statut = 'actif' THEN
           GREATEST(0, CEIL(EXTRACT(EPOCH FROM (date_fin_plan - NOW())) / 86400))::int
         ELSE NULL
       END AS jours_restants_calc
     FROM abonnements
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  let abonnement = result.rows[0];

  // 2. Si aucun résultat (utilisateur créé avant l'implémentation PayDunya)
  if (!abonnement) {
    const insertResult = await pool.query(
      `INSERT INTO abonnements (user_id, statut, plan, date_debut_essai, date_fin_essai)
       VALUES ($1, 'essai', 'free', NOW(), NOW() + INTERVAL '7 days')
       RETURNING *,
         NOW() AS pg_now,
         CEIL(EXTRACT(EPOCH FROM (date_fin_essai - NOW())) / 86400)::int AS jours_restants_calc`,
      [userId]
    );
    abonnement = insertResult.rows[0];
  }

  // Comparaisons basées sur l'horloge PostgreSQL (cohérence avec jours_restants_calc)
  const now = new Date(abonnement.pg_now);

  // 3. Si statut = 'essai' ET date_fin_essai > NOW()
  if (abonnement.statut === 'essai' && new Date(abonnement.date_fin_essai) > now) {
    const joursRestants = abonnement.jours_restants_calc ?? 0;
    return { statut: 'essai', plan: 'free', joursRestants, actif: true };
  }

  // 4. Si statut = 'essai' ET date_fin_essai <= NOW()
  if (abonnement.statut === 'essai' && new Date(abonnement.date_fin_essai) <= now) {
    await pool.query(
      `UPDATE abonnements SET statut = 'expire' WHERE id_abonnements = $1`,
      [abonnement.id_abonnements]
    );
    return { statut: 'expire', plan: 'free', actif: false };
  }

  // 5. Si statut = 'actif' ET date_fin_plan > NOW()
  if (abonnement.statut === 'actif' && new Date(abonnement.date_fin_plan) > now) {
    const joursRestants = abonnement.jours_restants_calc ?? 0;
    return { statut: 'actif', plan: 'pro', joursRestants, actif: true, dateExpiration: abonnement.date_fin_plan };
  }

  // 6. Si statut = 'actif' ET date_fin_plan <= NOW()
  if (abonnement.statut === 'actif' && new Date(abonnement.date_fin_plan) <= now) {
    await pool.query(
      `UPDATE abonnements SET statut = 'expire' WHERE id_abonnements = $1`,
      [abonnement.id_abonnements]
    );
    await pool.query(
      `UPDATE users SET plan = 'free', quota_stockage = 524288000 WHERE id_users = $1`,
      [userId]
    );
    return { statut: 'expire', plan: 'free', actif: false };
  }

  // 7. Sinon (expire, annule, en_attente)
  return { statut: abonnement.statut, plan: abonnement.plan, actif: false };
};

export const initierPaiement = async (userId) => {
  // 1. Vérifier qu'il n'y a pas d'abonnement 'actif' existant
  const statusAb = await getStatutAbonnement(userId);
  if (statusAb.statut === 'actif') {
    throw new Error('ABONNEMENT_DEJA_ACTIF');
  }

  // 2. Générer la clé d'idempotence
  const idempotencyKey = `pay_${userId}_${Date.now()}`;

  // 3. Vérifier l'idempotence en BDD (très peu probable que ça existe déjà vu le Date.now, mais sécurité)
  const existing = await pool.query(
    `SELECT id_abonnements FROM abonnements WHERE idempotency_key = $1`,
    [idempotencyKey]
  );
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // 4. Appeler l'API PayDunya
  const url = process.env.PAYDUNYA_MODE === 'test'
    ? 'https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create'
    : 'https://app.paydunya.com/api/v1/checkout-invoice/create';

  const payload = {
    invoice: {
      total_amount: parseInt(process.env.MONTANT_PRO_XOF) || 5000,
      description: "Abonnement DocMaster Pro - 1 mois"
    },
    store: {
      name: "PDF DocMaster",
      postal_address: "Bamako, Mali",
      phone: "",
      logo_url: "",
      website_url: process.env.FRONTEND_URL
    },
    actions: {
      cancel_url: `${process.env.FRONTEND_URL}/pricing?status=cancel`,
      return_url: `${process.env.FRONTEND_URL}/pricing?status=success`,
      callback_url: `${process.env.BACKEND_URL}/api/payments/webhook`
    },
    custom_data: {
      user_id: userId,
      idempotency_key: idempotencyKey
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
      'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
      'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
      'PAYDUNYA-PUBLIC-KEY': process.env.PAYDUNYA_PUBLIC_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (data.response_code === "00") {
    const paydunyaToken = data.token;
    
    // Hash pour la recherche
    const tokenHash = crypto.createHash('sha256').update(paydunyaToken).digest('hex');

    // Chiffrement pour le stockage sécurisé
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
      iv
    );
    let tokenChiffre = cipher.update(paydunyaToken, 'utf8', 'hex');
    tokenChiffre += cipher.final('hex');
    const fullTokenChiffre = iv.toString('hex') + ':' + tokenChiffre;

    await pool.query(
      `INSERT INTO abonnements (
         user_id, statut, montant, devise,
         paydunya_token, idempotency_key, paydunya_token_hash
       ) VALUES ($1, 'en_attente', $2, 'XOF', $3, $4, $5)`,
      [userId, parseInt(process.env.MONTANT_PRO_XOF) || 5000, fullTokenChiffre, idempotencyKey, tokenHash]
    );

    await loggerEvenement('paiement_initie', userId, null, `Montant: ${payload.invoice.total_amount}`);

    return { paymentUrl: data.response_text, token: paydunyaToken };
  } else {
    throw new Error('PAYDUNYA_ERREUR: ' + data.response_text);
  }
};

export const confirmerPaiement = async (paydunyaToken) => {
  const url = process.env.PAYDUNYA_MODE === 'test'
    ? `https://app.paydunya.com/sandbox-api/v1/checkout-invoice/confirm/${paydunyaToken}`
    : `https://app.paydunya.com/api/v1/checkout-invoice/confirm/${paydunyaToken}`;

  const response = await fetch(url, {
    headers: {
      'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
      'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
      'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
      'PAYDUNYA-PUBLIC-KEY': process.env.PAYDUNYA_PUBLIC_KEY
    }
  });

  const data = await response.json();
  const tokenHash = crypto.createHash('sha256').update(paydunyaToken).digest('hex');

  // Log complet pour debug — CRITIQUE pour comprendre le comportement PayDunya sandbox
  console.log('[PayDunya] Confirmation response:', JSON.stringify(data, null, 2));

  // PayDunya peut renvoyer 'completed', 'paid', 'success' selon la version
  const isCompleted = data.status === 'completed' || data.status === 'paid' || data.response_code === '00';

  if (isCompleted) {
    const abResult = await pool.query(
      `SELECT * FROM abonnements WHERE paydunya_token_hash = $1`,
      [tokenHash]
    );

    if (abResult.rows.length === 0) {
      throw new Error("Abonnement non trouvé pour ce token");
    }

    const abonnement = abResult.rows[0];

    if (abonnement.statut === 'actif') {
      return { deja_traite: true };
    }

    await pool.query(
      `UPDATE abonnements SET
        statut = 'actif',
        plan = 'pro',
        date_debut_plan = NOW(),
        date_fin_plan = NOW() + INTERVAL '30 days',
        updated_at = NOW()
      WHERE id_abonnements = $1`,
      [abonnement.id_abonnements]
    );

    await pool.query(
      `UPDATE users SET
        plan = 'pro',
        quota_stockage = 5368709120
      WHERE id_users = $1`,
      [abonnement.user_id]
    );

    await loggerEvenement('paiement_reussi', abonnement.user_id, null, `Montant: 5000`);
    return { succes: true };
  } else {
    await pool.query(
      `UPDATE abonnements SET statut = 'annule' WHERE paydunya_token_hash = $1`,
      [tokenHash]
    );
    await loggerEvenement('paiement_echoue', null, null, `Statut PayDunya: ${data.status}`);
    return { succes: false, raison: data.status };
  }
};

export const dechiffrerToken = (tokenChiffre) => {
  const [ivHex, encrypted] = tokenChiffre.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
    iv
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export { loggerEvenement };
