import pool from '../config/db.js';
import pdfQueue from '../jobs/queue.js';

// ── Créer un job ────────────────────────────────────────────
export const createJobService = async (userId, typeOperation, fichiers) => {

  // Étape 1 — Vérifier que les fichiers appartiennent à l'utilisateur
  for (const fileId of fichiers) {
    const result = await pool.query(
      'SELECT owner_id FROM files WHERE id_files = $1',
      [fileId]
    );

    if (result.rows.length === 0) {
      throw new Error('FILE_NOT_FOUND');
    }

    if (result.rows[0].owner_id !== userId) {
      throw new Error('UNAUTHORIZED');
    }
  }

  // Étape 2 — Créer le job en BDD avec statut pending
  const jobResult = await pool.query(
    `INSERT INTO jobs (user_id, type_operation, statut, progression)
     VALUES ($1, $2, 'pending', 0)
     RETURNING id_jobs, type_operation, statut, progression, created_at`,
    [userId, typeOperation]
  );

  const job = jobResult.rows[0];

  // Étape 3 — Lier les fichiers au job dans jobs_files
  for (const fileId of fichiers) {
    await pool.query(
      `INSERT INTO jobs_files (jobs_id, files_id, role)
       VALUES ($1, $2, 'input')`,
      [job.id_jobs, fileId]
    );
  }

  // Étape 4 — Ajouter dans Bull Queue
  // On passe les données nécessaires au Worker
  await pdfQueue.add({
    jobId: job.id_jobs,
    type_operation: typeOperation,
    fichiers,
    userId
  });

  return job;
};

// ── Récupérer le statut d'un job ────────────────────────────
export const getJobStatusService = async (jobId, userId) => {

  const result = await pool.query(
    `SELECT id_jobs, type_operation, statut, progression,
            resultat_url, erreur_message, created_at,
            started_at, completed_at
     FROM jobs
     WHERE id_jobs = $1 AND user_id = $2`,
    [jobId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('JOB_NOT_FOUND');
  }

  return result.rows[0];
};

// ── Récupérer tous les jobs d'un utilisateur ────────────────
export const getUserJobsService = async (userId) => {
  const result = await pool.query(
    `SELECT id_jobs, type_operation, statut, progression,
            resultat_url, created_at, completed_at
     FROM jobs
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId]
  );

  return result.rows;
};