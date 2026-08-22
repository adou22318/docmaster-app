import { PDFDocument } from 'pdf-lib';
import { loadPdf } from './loadPdf.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// ── Fusionner plusieurs PDF en un seul ──────────────────────
// cheminsFichiers : tableau de chemins absolus des PDF à fusionner
// L'ordre du tableau détermine l'ordre dans le résultat final
export const mergeService = async (cheminsFichiers, motDePasse = null) => {

  // Créer un nouveau document PDF vide
  // C'est dans celui-ci qu'on va copier toutes les pages
  const pdfFusionne = await PDFDocument.create();

  for (const chemin of cheminsFichiers) {

    // Vérifier que le fichier existe avant de tenter de le lire
    if (!fs.existsSync(chemin)) {
      throw new Error(`FICHIER_INTROUVABLE:${chemin}`);
    }

    // Charger le PDF source
    const pdfBytes = fs.readFileSync(chemin);
    const pdfSource = await loadPdf(pdfBytes);

    // copyPages copie TOUTES les pages du document source
    // pdfSource.getPageIndices() retourne [0, 1, 2, ...] 
    // pour toutes les pages du document
    const pages = await pdfFusionne.copyPages(
      pdfSource,
      pdfSource.getPageIndices()
    );

    // Ajouter chaque page copiée au document final
    pages.forEach((page) => pdfFusionne.addPage(page));
  }

  // Vérifier qu'au moins une page a été ajoutée
  if (pdfFusionne.getPageCount() === 0) {
    throw new Error('AUCUNE_PAGE_FUSIONNEE');
  }

  // Sauvegarder le résultat sur disque
  const bytesResultat = await pdfFusionne.save();
  const nomResultat = `${uuidv4()}.pdf`;
  const cheminResultat = path.join(OUTPUT_DIR, nomResultat);

  fs.writeFileSync(cheminResultat, bytesResultat);

  return {
    nomStockage: nomResultat,
    chemin: cheminResultat,
    tailleOctets: bytesResultat.length
  };
};
