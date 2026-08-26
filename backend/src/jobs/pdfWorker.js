import pdfQueue from './queue.js';
import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { mergeService } from '../services/pdf/merge.js';
import { splitService } from '../services/pdf/split.js';
import { rotateService } from '../services/pdf/rotate.js';
import { compressService } from '../services/pdf/compress.js';
import { protectService, unprotectService } from '../services/pdf/protect.js';
import { watermarkService } from '../services/pdf/watermark.js';
import { removePageService } from '../services/pdf/removePage.js';
import { addBlankPagesService } from '../services/pdf/addBlankPages.js';
import { rasterizeService } from '../services/pdf/rasterize.js';
import { extractImagesService } from '../services/pdf/extractImages.js';
import { addImageService } from '../services/pdf/addImage.js';
import { convertToPdfService } from '../services/pdf/convertToPdf.js';
import { pdfToTxtService } from '../services/pdf/pdfToTxt.js';
import { signService } from '../services/pdf/sign.js';
import { cleanMetadataService } from '../services/pdf/cleanMetadata.js';
import { dechiffrerAvecQpdf, nettoyerFichierTemp } from '../services/pdf/dechiffrer.js';

pdfQueue.process(async (job) => {

  const { jobId, type_operation, fichiers, options } = job.data;

  console.log(`🔄 Traitement job ${jobId} — opération: ${type_operation}`);

  // Fichiers temporaires créés par déchiffrement — à nettoyer après traitement
  const fichiersTempANettoyer = [];

  try {
    await pool.query(
      `UPDATE jobs SET statut = 'processing', started_at = NOW(), progression = 10
       WHERE id_jobs = $1`,
      [jobId]
    );
    await job.progress(10);

    // Récupérer les chemins des fichiers depuis la BDD
    const filesResult = await pool.query(
      `SELECT id_files, chemin FROM files WHERE id_files = ANY($1::uuid[])`,
      [fichiers]
    );

    // Préserver l'ordre original du tableau fichiers et supporter les fichiers temporaires
    const mapChemins = new Map();
    filesResult.rows.forEach(r => mapChemins.set(r.id_files, r.chemin));

    const cheminsFichiers = fichiers.map(id => {
      if (mapChemins.has(id)) return mapChemins.get(id);
      // Si l'id n'est pas dans la BDD, c'est un fichier temporaire (upload-temp)
      // Le fichier sur disque a une extension (ex: uuid.png), on cherche par préfixe
      const uploadDir = process.env.UPLOAD_DIR || './tmp/uploads';
      const tempPathExact = path.join(uploadDir, id);
      if (fs.existsSync(tempPathExact)) return tempPathExact;
      // Chercher avec n'importe quelle extension
      const candidates = fs.readdirSync(uploadDir).filter(f => f.startsWith(id));
      if (candidates.length > 0) return path.join(uploadDir, candidates[0]);
      throw new Error('FICHIER_INTROUVABLE');
    });

    const motDePassePdf = options?.motDePassePdf || null;

    if (motDePassePdf) {
      console.log(`🔑 motDePassePdf reçu pour job ${jobId} [${type_operation}] — longueur: ${motDePassePdf.length}`);
    }

    await job.progress(20);

    // ─────────────────────────────────────────────────────────────────────
    // DÉCHIFFREMENT PRÉALABLE avec qpdf
    // ─────────────────────────────────────────────────────────────────────
    // pdf-lib ne supporte pas le déchiffrement AES-256 en lecture.
    // Si un mot de passe est fourni, on utilise qpdf pour créer un fichier
    // temporaire déchiffré que pdf-lib peut ouvrir normalement.
    // Les services unprotect et protect gèrent eux-mêmes qpdf — on les exclut.
    // ─────────────────────────────────────────────────────────────────────
    const operationsQpdfNatif = ['unprotect', 'protect'];
    const needsQpdfDecrypt = motDePassePdf && 
      !operationsQpdfNatif.includes(type_operation);

    if (needsQpdfDecrypt && cheminsFichiers[0]) {
      console.log(`🔓 Déchiffrement préalable du PDF source via qpdf...`);
      const cheminDechiffre = await dechiffrerAvecQpdf(cheminsFichiers[0], motDePassePdf);
      fichiersTempANettoyer.push({ temp: cheminDechiffre, original: cheminsFichiers[0] });
      // Remplacer le chemin du PDF principal par la version déchiffrée
      cheminsFichiers[0] = cheminDechiffre;
      console.log(`✅ PDF déchiffré — traitement avec la version déchiffrée`);
    }

    await job.progress(30);

    let resultat;

    switch (type_operation) {
      case 'merge':
        // Pour la fusion, tous les fichiers peuvent être chiffrés
        // Déchiffrer chaque fichier supplémentaire si nécessaire
        if (motDePassePdf) {
          for (let i = 1; i < cheminsFichiers.length; i++) {
            try {
              const dec = await dechiffrerAvecQpdf(cheminsFichiers[i], motDePassePdf);
              fichiersTempANettoyer.push({ temp: dec, original: cheminsFichiers[i] });
              cheminsFichiers[i] = dec;
            } catch (e) {
              // Ignorer les fichiers non-chiffrés ou avec un mot de passe différent
            }
          }
        }
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
        // Ghostscript gère le déchiffrement via -sPDFPassword directement
        resultat = await compressService(
          cheminsFichiers[0],
          options.niveau,
          motDePassePdf
        );
        break;

      case 'protect':
        resultat = await protectService(
          cheminsFichiers[0],
          options.motDePasse
        );
        break;

      case 'unprotect':
        resultat = await unprotectService(
          cheminsFichiers[0],
          options.motDePasseActuel
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
        // Ghostscript gère le déchiffrement via -sPDFPassword directement
        resultat = await rasterizeService(
          cheminsFichiers[0],
          options,
          motDePassePdf
        );
        break;

      case 'add_image':
        resultat = await addImageService(
          cheminsFichiers[0], // PDF cible (déjà déchiffré si nécessaire)
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
          cheminsFichiers[0], // PDF cible (déjà déchiffré si nécessaire)
          cheminsFichiers[1], // Image de signature
          options
        );
        break;

      case 'clean_metadata':
        resultat = await cleanMetadataService(
          cheminsFichiers[0]
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
      `INSERT INTO files (owner_id, nom_original, nom_stockage, chemin, taille_octets, type_mime, expire_le)
       VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '24 hours')
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
  } finally {
    // Nettoyage des fichiers temporaires de déchiffrement
    for (const { temp, original } of fichiersTempANettoyer) {
      nettoyerFichierTemp(temp, original);
    }
  }
});

console.log('🚀 Bull Worker démarré — modules PDF actifs');

export default pdfQueue;