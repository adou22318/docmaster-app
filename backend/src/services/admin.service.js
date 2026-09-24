import pool from '../config/db.js';

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
  const result = await pool.query(
    `SELECT a.id, a.action, a.cible_id, a.details, a.created_at, u.email as admin_email 
     FROM admin_audit_log a
     LEFT JOIN users u ON a.admin_id = u.id_users
     ORDER BY a.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  
  const countRes = await pool.query(`SELECT COUNT(*) FROM admin_audit_log`);
  return { logs: result.rows, total: parseInt(countRes.rows[0].count, 10) };
};

// ─── STATS ──────────────────────────────────────────────────
export const getStats = async () => {
  const usersCount = await pool.query(`SELECT COUNT(*) FROM users`);
  const activeSubs = await pool.query(`SELECT COUNT(*) FROM abonnements WHERE statut IN ('actif', 'essai')`);
  
  const jobsStats = await pool.query(`
    SELECT statut, COUNT(*) 
    FROM jobs 
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY statut
  `);
  
  const stats = {
    totalUsers: parseInt(usersCount.rows[0].count, 10),
    activeSubscriptions: parseInt(activeSubs.rows[0].count, 10),
    jobs24h: { pending: 0, processing: 0, done: 0, error: 0 }
  };
  
  for (const row of jobsStats.rows) {
    if (stats.jobs24h[row.statut] !== undefined) {
      stats.jobs24h[row.statut] = parseInt(row.count, 10);
    }
  }
  
  return stats;
};

// ─── USERS ──────────────────────────────────────────────────
export const getUsers = async (limit = 50, offset = 0) => {
  const result = await pool.query(
    `SELECT id_users, email, nom_complet, plan, role, compte_actif, created_at 
     FROM users 
     ORDER BY created_at DESC 
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  
  const countRes = await pool.query(`SELECT COUNT(*) FROM users`);
  return { users: result.rows, total: parseInt(countRes.rows[0].count, 10) };
};

export const updateUserStatus = async (adminId, userId, compteActif) => {
  const user = await pool.query(`SELECT role, compte_actif FROM users WHERE id_users = $1`, [userId]);
  if (user.rows.length === 0) throw new Error("USER_NOT_FOUND");
  
  // Garde-fou anti-verrouillage : vérifier le dernier admin si on désactive
  if (compteActif === false && user.rows[0].role === 'admin') {
    const adminCount = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'admin' AND compte_actif = true`);
    if (parseInt(adminCount.rows[0].count, 10) <= 1) {
      throw new Error("LAST_ADMIN");
    }
  }
  
  await pool.query(`UPDATE users SET compte_actif = $1 WHERE id_users = $2`, [compteActif, userId]);
  
  // Log l'action
  await logAdminAction(adminId, compteActif ? 'ACTIVATE_ACCOUNT' : 'DEACTIVATE_ACCOUNT', userId, {});
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

  const result = await pool.query(query, [limit, offset]);
  const countRes = await pool.query(countQuery);
  
  return { jobs: result.rows, total: parseInt(countRes.rows[0].count, 10) };
};
