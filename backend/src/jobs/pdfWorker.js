import pdfQueue from './queue.js';
import pool from '../config/db.js';
import { mergeService } from '../services/pdf/merge.js';
import { splitService } from '../services/pdf/split.js';
import { rotateService } from '../services/pdf/rotate.js';
import { compressService } from '../services/pdf/compress.js';
import { protectService } from '../services/pdf/protect.js';
import { watermarkService } from '../services/pdf/watermark.js';

pdfQueue.process(async (job) => {

  const { jobId, type_operation, fichiers, options } = job.data;

  console.log(`🔄 Traitement job ${jobId} — opération: ${type_operation}`);

  try {
    await pool.query(
      `UPDATE jobs SET statut = 'processing', started_at = NOW(), progression = 10
       WHERE id_jobs = $1`,
      [jobId]
    );
    await job.progress(10);

    // Récupérer les chemins des fichiers depuis la BDD
    const filesResult = await pool.query(
      `SELECT chemin FROM files WHERE id_files = ANY($1::uuid[])`,
      [fichiers]
    );
    const cheminsFichiers = filesResult.rows.map(r => r.chemin);

    let resultat;

    await job.progress(30);

    switch (type_operation) {
      case 'merge':
        resultat = await mergeService(cheminsFichiers);
        break;

      case 'split':
        resultat = await splitService(
          cheminsFichiers[0],
          options.selection,
          options.mode || 'single'
        );
        break;

      case 'rotate':
        resultat = await rotateService(
          cheminsFichiers[0],
          options.angle,
          options.pages
        );
        break;

      case 'compress':
        resultat = await compressService(
          cheminsFichiers[0],
          options.niveau
        );
        break;

      case 'protect':
        resultat = await protectService(
          cheminsFichiers[0],
          options.motDePasse
        );
        break;

      case 'watermark':
        resultat = await watermarkService(
          cheminsFichiers[0],
          options
        );
        break;

      default:
        throw new Error(`TYPE_OPERATION_INCONNU:${type_operation}`);
    }

    await job.progress(80);

    // Déterminer le type MIME et l'extension du résultat
    // Le split en mode 'separate' peut produire un ZIP au lieu d'un PDF
    const typeMime = resultat.typeMime || 'application/pdf';
    const extension = typeMime === 'application/zip' ? 'zip' : 'pdf';

    // Enregistrer le fichier résultat dans la table files
    const fileResult = await pool.query(
      `INSERT INTO files (owner_id, nom_original, nom_stockage, chemin, taille_octets, type_mime)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_files`,
      [job.data.userId, `resultat_${type_operation}.${extension}`, resultat.nomStockage, resultat.chemin, resultat.tailleOctets, typeMime]
    );

    const resultFileId = fileResult.rows[0].id_files;

    // Lier le fichier résultat au job
    await pool.query(
      `INSERT INTO jobs_files (jobs_id, files_id, role) VALUES ($1, $2, 'output')`,
      [jobId, resultFileId]
    );

    const resultatUrl = `/api/files/download/${resultFileId}`;

    await pool.query(
      `UPDATE jobs SET statut = 'done', progression = 100, resultat_url = $1, completed_at = NOW()
       WHERE id_jobs = $2`,
      [resultatUrl, jobId]
    );

    await job.progress(100);
    console.log(`✅ Job ${jobId} terminé avec succès`);

    return { success: true, resultatUrl };

  } catch (error) {
    await pool.query(
      `UPDATE jobs SET statut = 'error', erreur_message = $1, completed_at = NOW()
       WHERE id_jobs = $2`,
      [error.message, jobId]
    );
    throw error;
  }
});

console.log('🚀 Bull Worker démarré — modules PDF actifs');

export default pdfQueue;