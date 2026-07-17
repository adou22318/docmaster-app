import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { parsePageSelection } from './parsePages.js';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// ── Supprimer des pages spécifiques ─────────────────────────
// chemin            : fichier source
// selectionPages    : chaîne de sélection des pages à supprimer
//                     (ex: "2, 5-8, 12") — même syntaxe que le split
//
// Accepte aussi un tableau de numéros 1-indexed pour rétrocompatibilité
export const removePageService = async (chemin, selectionPages) => {

  if (!fs.existsSync(chemin)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  const pdfBytes = fs.readFileSync(chemin);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const totalPages = pdfDoc.getPageCount();

  // Résoudre la sélection : chaîne ou tableau
  let pagesASupprimer;
  if (typeof selectionPages === 'string') {
    pagesASupprimer = parsePageSelection(selectionPages, totalPages);
  } else if (Array.isArray(selectionPages)) {
    pagesASupprimer = selectionPages;
  } else {
    throw new Error('SELECTION_INVALIDE');
  }

  // Vérifier qu'on ne supprime pas toutes les pages
  if (pagesASupprimer.length >= totalPages) {
    throw new Error('TOUTES_LES_PAGES_SUPPRIMEES');
  }

  // Convertir en 0-indexed et trier en ordre décroissant
  // ⚠️ Point technique important : on supprime du dernier index
  // vers le premier, sinon les indices se décalent après
  // chaque suppression et on supprime les mauvaises pages
  const indicesASupprimer = pagesASupprimer
    .map(p => p - 1)
    .sort((a, b) => b - a);

  for (const index of indicesASupprimer) {
    if (index < 0 || index >= totalPages) {
      throw new Error(`PAGE_INVALIDE:${index + 1}`);
    }
    pdfDoc.removePage(index);
  }

  if (pdfDoc.getPageCount() === 0) {
    throw new Error('TOUTES_LES_PAGES_SUPPRIMEES');
  }

  const bytesResultat = await pdfDoc.save();
  const nomResultat = `${uuidv4()}.pdf`;
  const cheminResultat = path.join(OUTPUT_DIR, nomResultat);

  fs.writeFileSync(cheminResultat, bytesResultat);

  return {
    nomStockage: nomResultat,
    chemin: cheminResultat,
    tailleOctets: bytesResultat.length,
    pagesRestantes: pdfDoc.getPageCount()
  };
};