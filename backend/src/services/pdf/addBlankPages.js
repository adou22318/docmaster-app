import { PDFDocument } from 'pdf-lib';
import { loadPdf } from './loadPdf.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// ── Formats de page prédéfinis (en points, 72 DPI) ──────────
// 1 point = 1/72 pouce
const FORMATS_PAGE = {
  a4:      [595.28, 841.89],   // 210 × 297 mm
  a3:      [841.89, 1190.55],  // 297 × 420 mm
  a5:      [419.53, 595.28],   // 148 × 210 mm
  letter:  [612, 792],         // 8.5 × 11 pouces (US)
  legal:   [612, 1008]         // 8.5 × 14 pouces (US)
};

// ── Ajouter des pages vierges à un PDF ──────────────────────
// chemin   : fichier source
// options  :
//   nombre   : nombre de pages à ajouter (défaut: 1)
//   position : "debut", "fin", ou un numéro de page 1-indexed
//              après laquelle insérer (défaut: "fin")
//   format   : "a4", "a3", "a5", "letter", "legal" (défaut: "a4")
export const addBlankPagesService = async (chemin, options = {}, motDePasse = null) => {

  const {
    nombre = 1,
    position = 'fin',
    format = 'a4'
  } = options;

  if (!fs.existsSync(chemin)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  // Validation du nombre de pages
  const nbPages = parseInt(nombre, 10);
  if (isNaN(nbPages) || nbPages < 1 || nbPages > 100) {
    throw new Error('NOMBRE_PAGES_INVALIDE');
  }

  // Résoudre le format de page
  const formatNormalise = String(format).toLowerCase();
  const dimensions = FORMATS_PAGE[formatNormalise];
  if (!dimensions) {
    throw new Error(`FORMAT_INVALIDE:${format}. Valeurs acceptées: ${Object.keys(FORMATS_PAGE).join(', ')}`);
  }

  const pdfBytes = fs.readFileSync(chemin);
  const pdfDoc = await loadPdf(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  // Résoudre la position d'insertion
  let indexInsertion;
  if (position === 'fin') {
    indexInsertion = totalPages; // Après la dernière page
  } else if (position === 'debut') {
    indexInsertion = 0; // Avant la première page
  } else {
    // Numéro de page 1-indexed : insérer après cette page
    const posNum = parseInt(position, 10);
    if (isNaN(posNum) || posNum < 0 || posNum > totalPages) {
      throw new Error(`POSITION_INVALIDE:${position}`);
    }
    indexInsertion = posNum;
  }

  // Insérer les pages vierges
  // On insère toujours à la même position (indexInsertion)
  // car chaque insertion décale les pages suivantes
  for (let i = 0; i < nbPages; i++) {
    pdfDoc.insertPage(indexInsertion + i, dimensions);
  }

  const bytesResultat = await pdfDoc.save();
  const nomResultat = `${uuidv4()}.pdf`;
  const cheminResultat = path.join(OUTPUT_DIR, nomResultat);

  fs.writeFileSync(cheminResultat, bytesResultat);

  return {
    nomStockage: nomResultat,
    chemin: cheminResultat,
    tailleOctets: bytesResultat.length,
    pagesAjoutees: nbPages,
    pagesTotal: pdfDoc.getPageCount()
  };
};

