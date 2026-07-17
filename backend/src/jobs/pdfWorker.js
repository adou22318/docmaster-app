import pdfQueue from './queue.js';
import pool from '../config/db.js';
import { mergeService } from '../services/pdf/merge.js';
import { splitService } from '../services/pdf/split.js';
import { rotateService } from '../services/pdf/rotate.js';
import { compressService } from '../services/pdf/compress.js';
import { protectService } from '../services/pdf/protect.js';
import { watermarkService } from '../services/pdf/watermark.js';
import { removePageService } from '../services/pdf/removePage.js';
import { addBlankPagesService } from '../services/pdf/addBlankPages.js';
import { rasterizeService } from '../services/pdf/rasterize.js';
import { extractImagesService } from '../services/pdf/extractImages.js';
import { addImageService } from '../services/pdf/addImage.js';
import { convertToPdfService } from '../services/pdf/convertToPdf.js';
import { pdfToTxtService } from '../services/pdf/pdfToTxt.js';
import { signService } from '../services/pdf/sign.js';

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

      case 'remove_pages':
        resultat = await removePageService(
          cheminsFichiers[0],
          options.selection
        );
        break;

      case 'add_blank_pages':
        resultat = await addBlankPagesService(
          cheminsFichiers[0],
          options
        );
        break;

      case 'extract_images':
        resultat = await extractImagesService(
          cheminsFichiers[0],
          options
        );
        break;

      case 'pdf_to_images':
        resultat = await rasterizeService(
          cheminsFichiers[0],
          options
        );
        break;

      case 'add_image':
        resultat = await addImageService(
          cheminsFichiers[0], // PDF cible
          cheminsFichiers[1], // Image à incrustrer
          options
        );
        break;

      case 'convert_to_pdf':
        resultat = await convertToPdfService(
          cheminsFichiers[0]
        );
        break;

      case 'pdf_to_txt':
        resultat = await pdfToTxtService(
          cheminsFichiers[0],
          options
        );
        break;

      case 'sign':
        resultat = await signService(
          cheminsFichiers[0], // PDF cible
          cheminsFichiers[1], // Image de signature
          options
        );
        break;

      default:
        throw new Error(`TYPE_OPERATION_INCONNU:${type_operation}`);
    }

    await job.progress(80);

    // Déterminer le type MIME et l'extension du résultat
    const typeMime = resultat.typeMime || 'application/pdf';
    let extension = 'pdf';
    
    if (typeMime === 'application/zip') extension = 'zip';
    else if (typeMime === 'image/png') extension = 'png';
    else if (typeMime === 'image/jpeg') extension = 'jpg';
    else if (typeMime === 'text/plain') extension = 'txt';

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
    
    // Ajout du disclaimer de signature dans le résultat renvoyé à l'API si présent
    const resultPayload = { success: true, resultatUrl };
    if (resultat.disclaimer) {
      resultPayload.disclaimer = resultat.disclaimer;
    }

    await pool.query(
      `UPDATE jobs SET statut = 'done', progression = 100, resultat_url = $1, completed_at = NOW()
       WHERE id_jobs = $2`,
      [resultatUrl, jobId]
    );

    await job.progress(100);
    console.log(`✅ Job ${jobId} terminé avec succès`);

    return resultPayload;

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