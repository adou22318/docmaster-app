import pool from '../config/db.js';

// ─── Dictionnaire d'actions (traduction pour l'affichage) ────
export const ACTION_LABELS = {
  ACTIVATE_ACCOUNT:   'Compte activé',
  DEACTIVATE_ACCOUNT: 'Compte désactivé',
};

// ─── AUDIT ──────────────────────────────────────────────────
export const logAdminAction = async (adminId, action, cibleId = null, details = {}) => {
  try {
    await pool.query(
      `INSERT INTO admin_audit_log (admin_id, action, cible_id, details)
       VALUES ($1, $2, $3, $4)`,
      [adminId, action, cibleId, JSON.stringify(details)]
    );
  } catch (error) {
    console.error("Erreur lors de l'insertion dans admin_audit_log:", error);
  }
};

export const getAuditLogs = async (limit = 50, offset = 0) => {
  // Joint avec users pour récupérer l'email de la cible (pas seulement l'admin)
  const result = await pool.query(
    `SELECT 
       a.id, a.action, a.cible_id, a.details, a.created_at,
       u.email   AS admin_email,
       t.email   AS cible_email,
       t.nom_complet AS cible_nom
     FROM admin_audit_log a
     LEFT JOIN users u ON a.admin_id  = u.id_users
     LEFT JOIN users t ON a.cible_id  = t.id_users
     ORDER BY a.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countRes = await pool.query(`SELECT COUNT(*) FROM admin_audit_log`);
  return { logs: result.rows, total: parseInt(countRes.rows[0].count, 10) };
};

// ─── STATS ──────────────────────────────────────────────────
export const getStats = async () => {
  const [
    usersCount,
    newUsersWeek,
    activeSubs,
    jobsStats,
    topOps,
    recentAudit,
  ] = await Promise.all([
    // Total utilisateurs
    pool.query(`SELECT COUNT(*) FROM users`),
    // Nouveaux inscrits (7 derniers jours)
    pool.query(`SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'`),
    // Abonnements actifs ou en essai
    pool.query(`SELECT COUNT(*) FROM abonnements WHERE statut IN ('actif', 'essai')`),
    // Répartition des jobs (24h) par statut
    pool.query(`
      SELECT statut, COUNT(*) AS count
      FROM jobs
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY statut
    `),
    // Top 5 opérations les plus utilisées (7 derniers jours, jobs réussis)
    pool.query(`
      SELECT type_operation, COUNT(*) AS count
      FROM jobs
      WHERE created_at > NOW() - INTERVAL '7 days'
        AND statut = 'done'
      GROUP BY type_operation
      ORDER BY count DESC
      LIMIT 5
    `),
    // 5 dernières actions d'audit (pour le feed d'activité du dashboard)
    pool.query(`
      SELECT 
        a.action, a.created_at,
        u.email AS admin_email,
        t.email AS cible_email
      FROM admin_audit_log a
      LEFT JOIN users u ON a.admin_id = u.id_users
      LEFT JOIN users t ON a.cible_id = t.id_users
      ORDER BY a.created_at DESC
      LIMIT 5
    `),
  ]);

  const jobs24h = { pending: 0, processing: 0, done: 0, error: 0 };
  for (const row of jobsStats.rows) {
    if (jobs24h[row.statut] !== undefined) {
      jobs24h[row.statut] = parseInt(row.count, 10);
    }
  }

  const totalJobsDone7d = topOps.rows.reduce((sum, r) => sum + parseInt(r.count, 10), 0);

  return {
    totalUsers: parseInt(usersCount.rows[0].count, 10),
    newUsersWeek: parseInt(newUsersWeek.rows[0].count, 10),
    activeSubscriptions: parseInt(activeSubs.rows[0].count, 10),
    jobs24h,
    topOps: topOps.rows.map(r => ({
      operation: r.type_operation,
      count: parseInt(r.count, 10),
      pct: totalJobsDone7d > 0 ? Math.round((parseInt(r.count, 10) / totalJobsDone7d) * 100) : 0,
    })),
    recentAudit: recentAudit.rows,
  };
};

// ─── USERS ──────────────────────────────────────────────────
export const getUsers = async (limit = 50, offset = 0, search = '') => {
  const params = search
    ? [`%${search}%`, `%${search}%`, limit, offset]
    : [limit, offset];

  const query = search
    ? `SELECT id_users, email, nom_complet, plan, role, compte_actif, created_at 
       FROM users 
       WHERE email ILIKE $1 OR nom_complet ILIKE $2
       ORDER BY created_at DESC 
       LIMIT $3 OFFSET $4`
    : `SELECT id_users, email, nom_complet, plan, role, compte_actif, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`;

  const countQuery = search
    ? `SELECT COUNT(*) FROM users WHERE email ILIKE $1 OR nom_complet ILIKE $2`
    : `SELECT COUNT(*) FROM users`;

  const countParams = search ? [`%${search}%`, `%${search}%`] : [];

  const result = await pool.query(query, params);
  const countRes = await pool.query(countQuery, countParams);
  return { users: result.rows, total: parseInt(countRes.rows[0].count, 10) };
};

export const updateUserStatus = async (adminId, userId, compteActif) => {
  const user = await pool.query(
    `SELECT role, compte_actif, email FROM users WHERE id_users = $1`,
    [userId]
  );
  if (user.rows.length === 0) throw new Error('USER_NOT_FOUND');

  // Garde-fou : dernier admin
  if (compteActif === false && user.rows[0].role === 'admin') {
    const adminCount = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'admin' AND compte_actif = true`
    );
    if (parseInt(adminCount.rows[0].count, 10) <= 1) throw new Error('LAST_ADMIN');
  }

  await pool.query(`UPDATE users SET compte_actif = $1 WHERE id_users = $2`, [compteActif, userId]);

  await logAdminAction(
    adminId,
    compteActif ? 'ACTIVATE_ACCOUNT' : 'DEACTIVATE_ACCOUNT',
    userId,
    { cible_email: user.rows[0].email }
  );
  return true;
};

// ─── SUBSCRIPTIONS ──────────────────────────────────────────
export const getSubscriptions = async (limit = 50, offset = 0) => {
  const result = await pool.query(
    `SELECT a.id_abonnements, a.statut, a.plan, a.date_debut_essai, a.date_fin_essai, a.date_renouvellement, u.email 
     FROM abonnements a
     JOIN users u ON a.user_id = u.id_users
     ORDER BY a.date_renouvellement DESC NULLS LAST
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countRes = await pool.query(`SELECT COUNT(*) FROM abonnements`);
  return { subscriptions: result.rows, total: parseInt(countRes.rows[0].count, 10) };
};

// ─── JOBS ───────────────────────────────────────────────────
export const getJobs = async (limit = 50, offset = 0, failedOnly = false) => {
  const query = failedOnly
    ? `SELECT j.id_jobs, j.type_operation, j.statut, j.erreur_message, j.created_at, j.updated_at, u.email 
       FROM jobs j 
       LEFT JOIN users u ON j.user_id = u.id_users 
       WHERE j.statut = 'error' 
       ORDER BY j.created_at DESC LIMIT $1 OFFSET $2`
    : `SELECT j.id_jobs, j.type_operation, j.statut, j.erreur_message, j.created_at, j.updated_at, u.email 
       FROM jobs j 
       LEFT JOIN users u ON j.user_id = u.id_users 
       ORDER BY j.created_at DESC LIMIT $1 OFFSET $2`;

  const countQuery = failedOnly
    ? `SELECT COUNT(*) FROM jobs WHERE statut = 'error'`
    : `SELECT COUNT(*) FROM jobs`;

  const result   = await pool.query(query, [limit, offset]);
  const countRes = await pool.query(countQuery);

  return { jobs: result.rows, total: parseInt(countRes.rows[0].count, 10) };
};
