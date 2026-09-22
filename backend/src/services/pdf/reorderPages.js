import { PDFDocument } from 'pdf-lib';
import { loadPdf } from './loadPdf.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// ── Réorganisation des pages d'un PDF ───────────────────────────
// nouvelOrdre : tableau 1-indexed de la nouvelle séquence des pages
//               ex: [3, 1, 4, 2] pour un PDF de 4 pages
// Toutes les pages doivent être présentes, sans doublon.
export const reorderPagesService = async (chemin, nouvelOrdre, motDePasse = null) => {

  if (!fs.existsSync(chemin)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  if (!Array.isArray(nouvelOrdre) || nouvelOrdre.length === 0) {
    throw new Error('ORDRE_INVALIDE');
  }

  const pdfBytes = fs.readFileSync(chemin);
  const pdfDoc = await loadPdf(pdfBytes, motDePasse);
  const totalPages = pdfDoc.getPageCount();

  // Vérification de la longueur
  if (nouvelOrdre.length !== totalPages) {
    throw new Error('ORDRE_INVALIDE');
  }

  // Vérification des valeurs (1-indexed, sans doublon)
  const vus = new Set();
  for (const num of nouvelOrdre) {
    if (!Number.isInteger(num) || num < 1 || num > totalPages) {
      throw new Error(PAGE_INVALIDE:);
    }
    if (vus.has(num)) {
      throw new Error('ORDRE_INVALIDE');
    }
    vus.add(num);
  }

  // Vérification : l'ordre est-il identique à l'original ?
  const ordreIdentique = nouvelOrdre.every((num, index) => num === index + 1);
  if (ordreIdentique) {
    throw new Error('ORDRE_IDENTIQUE');
  }

  // Reconstruction du PDF dans le nouvel ordre
  const newPdf = await PDFDocument.create();

  // Conversion vers 0-indexed pour pdf-lib
  const indices = nouvelOrdre.map(p => p - 1);
  const copiedPages = await newPdf.copyPages(pdfDoc, indices);
  copiedPages.forEach(page => newPdf.addPage(page));

  const bytesResultat = await newPdf.save();
  const nomResultat = ${uuidv4()}.pdf;
  const cheminResultat = path.join(OUTPUT_DIR, nomResultat);

  fs.writeFileSync(cheminResultat, bytesResultat);

  return {
    nomStockage: nomResultat,
    chemin: cheminResultat,
    tailleOctets: bytesResultat.length,
    typeMime: 'application/pdf',
    pagesReorganisees: totalPages
  };
};
