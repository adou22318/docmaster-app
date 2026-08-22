import { PDFDocument, degrees } from 'pdf-lib';
import { loadPdf } from './loadPdf.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// ── Rotation de pages ────────────────────────────────────────
// angle : 90, 180 ou 270 degrés
// pages : tableau optionnel de numéros de pages (1-indexed)
//         si vide ou non fourni, rotation de TOUTES les pages
export const rotateService = async (chemin, angle, pages = [], motDePasse = null) => {

  if (![90, 180, 270].includes(angle)) {
    throw new Error('ANGLE_INVALIDE');
  }

  if (!fs.existsSync(chemin)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  const pdfBytes = fs.readFileSync(chemin);
  const pdfDoc = await loadPdf(pdfBytes);

  const toutesLesPages = pdfDoc.getPages();
  const totalPages = toutesLesPages.length;

  // Si aucune page spécifiée, on tourne tout le document
  const pagesACibler = pages.length > 0
    ? pages.map(p => p - 1)  // conversion 1-indexed → 0-indexed
    : toutesLesPages.map((_, index) => index);

  // Validation des numéros de page fournis
  for (const index of pagesACibler) {
    if (index < 0 || index >= totalPages) {
      throw new Error(`PAGE_INVALIDE:${index + 1}`);
    }
  }

  // Appliquer la rotation sur chaque page ciblée
  pagesACibler.forEach((index) => {
    const page = toutesLesPages[index];
    // getRotation() récupère la rotation actuelle (souvent 0)
    // On additionne pour permettre des rotations cumulées
    const rotationActuelle = page.getRotation().angle;
    page.setRotation(degrees(rotationActuelle + angle));
  });

  const bytesResultat = await pdfDoc.save();
  const nomResultat = `${uuidv4()}.pdf`;
  const cheminResultat = path.join(OUTPUT_DIR, nomResultat);

  fs.writeFileSync(cheminResultat, bytesResultat);

  return {
    nomStockage: nomResultat,
    chemin: cheminResultat,
    tailleOctets: bytesResultat.length,
    pagesModifiees: pagesACibler.length
  };
};
