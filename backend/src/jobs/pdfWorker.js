import pdfQueue from './queue.js';
import pool from '../config/db.js';

// Le Worker écoute la queue et traite les jobs un par un
// process() est appelé automatiquement pour chaque nouveau job
pdfQueue.process(async (job) => {

  const { jobId, type_operation, fichiers } = job.data;

  console.log(`🔄 Traitement job ${jobId} — opération: ${type_operation}`);

  try {

    // Étape 1 — Mettre à jour le statut en BDD : processing
    await pool.query(
      `UPDATE jobs
       SET statut = 'processing',
           started_at = NOW(),
           progression = 10
       WHERE id_jobs = $1`,
      [jobId]
    );

    // Étape 2 — Mettre à jour la progression dans Bull
    await job.progress(10);

    // Étape 3 — Exécuter l'opération selon le type
    // Les vraies fonctions PDF seront ajoutées en S3
    // Pour l'instant on simule avec un délai
    let resultatUrl = null;

    switch (type_operation) {
      case 'compress':
        // sera remplacé par: resultatUrl = await compressService(fichiers)
        await simulerTraitement(job, jobId, 5000);
        resultatUrl = `/api/files/download/${jobId}-result`;
        break;

      case 'merge':
        await simulerTraitement(job, jobId, 4000);
        resultatUrl = `/api/files/download/${jobId}-result`;
        break;

      case 'split':
        await simulerTraitement(job, jobId, 3000);
        resultatUrl = `/api/files/download/${jobId}-result`;
        break;

      case 'protect':
        await simulerTraitement(job, jobId, 2000);
        resultatUrl = `/api/files/download/${jobId}-result`;
        break;

      case 'watermark':
        await simulerTraitement(job, jobId, 2000);
        resultatUrl = `/api/files/download/${jobId}-result`;
        break;

      case 'sign':
        await simulerTraitement(job, jobId, 2000);
        resultatUrl = `/api/files/download/${jobId}-result`;
        break;

      default:
        throw new Error(`TYPE_OPERATION_INCONNU:${type_operation}`);
    }

    // Étape 4 — Mettre à jour le statut : done
    await pool.query(
      `UPDATE jobs
       SET statut = 'done',
           progression = 100,
           resultat_url = $1,
           completed_at = NOW()
       WHERE id_jobs = $2`,
      [resultatUrl, jobId]
    );

    await job.progress(100);
    console.log(`✅ Job ${jobId} terminé avec succès`);

    return { success: true, resultatUrl };

  } catch (error) {

    // En cas d'erreur — mettre à jour le statut : error
    await pool.query(
      `UPDATE jobs
       SET statut = 'error',
           erreur_message = $1,
           completed_at = NOW()
       WHERE id_jobs = $2`,
      [error.message, jobId]
    );

    // Relancer l'erreur pour que Bull gère les tentatives
    throw error;
  }
});

// Simulation de traitement — sera supprimée en S3
const simulerTraitement = async (job, jobId, duree) => {
  const etapes = [25, 50, 75, 90];
  for (const progression of etapes) {
    await new Promise(resolve => setTimeout(resolve, duree / etapes.length));
    await job.progress(progression);
    await pool.query(
      'UPDATE jobs SET progression = $1 WHERE id_jobs = $2',
      [progression, jobId]
    );
  }
};

console.log('🚀 Bull Worker démarré — en attente de jobs...');

export default pdfQueue;