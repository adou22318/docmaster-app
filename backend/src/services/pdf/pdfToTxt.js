import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PDFParse } from 'pdf-parse';
import { PDFDocument } from 'pdf-lib';
import { parsePageSelection } from './parsePages.js';
import { loadPdf } from './loadPdf.js';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// ── Conversion de notre syntaxe vers les options pdf-parse v2 ──
// pdf-parse v2 comprend :
//   partial: [1, 3, 5]      → pages précises (liste)
//   first: N + last: N       → plage first..last
//   first: N seul            → N premières pages
//   last: N seul             → N dernières pages
function buildPdfParseFilter(pagesArray, totalPages) {
  if (!pagesArray || pagesArray.length === 0) return {};

  // Cas simple : plage continue (ex: 1-5)
  const min = pagesArray[0];
  const max = pagesArray[pagesArray.length - 1];
  const isContiguous = pagesArray.length === (max - min + 1);

  if (isContiguous) {
    if (min === 1 && max === totalPages) {
      return {}; // Toutes les pages → pas de filtre
    }
    if (min === 1) {
      return { first: max }; // N premières pages
    }
    if (max === totalPages) {
      return { last: totalPages - min + 1 }; // N dernières pages
    }
    return { first: max, last: totalPages - min + 1 }; // Plage first..last
  }

  // Cas général : liste de pages non contiguës
  return { partial: pagesArray };
}

// ── Extraction de texte d'un PDF ────────────────────────────
// chemin : fichier source PDF
// options :
//   pages : sélection de pages (ex: "1-3, 5") — optionnel
export const pdfToTxtService = async (chemin, options = {}, motDePasse = null) => {

  if (!fs.existsSync(chemin)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  const { pages: selectionPages } = options;

  const dataBuffer = fs.readFileSync(chemin);

  // Obtenir le nombre total de pages (via pdf-lib, rapide et synchrone)
  const pdfDoc = await loadPdf(dataBuffer);
  const totalPages = pdfDoc.getPageCount();

  // Construire le filtre de pages
  let parseFilter = {};
  if (selectionPages && typeof selectionPages === 'string') {
    const pagesArray = parsePageSelection(selectionPages, totalPages); // 1-indexed, trié
    parseFilter = buildPdfParseFilter(pagesArray, totalPages);
  }

  try {
    // Si le PDF était chiffré, on le déchiffre via pdf-lib en mémoire
    let bufferToParse = dataBuffer;
    if (motDePasse) {
      bufferToParse = await pdfDoc.save();
    }

    // pdf-parse v2 : constructeur reçoit { data: Uint8Array }
    // getText() reçoit les options de filtrage (partial / first / last)
    const parser = new PDFParse({ data: new Uint8Array(bufferToParse) });
    const result = await parser.getText(parseFilter);

    // result.pages = [{text: string, num: number}, ...]
    const texteBrut = result.pages
      .map(p => p.text.trim())
      .filter(t => t.length > 0)
      .join('\n\n');

    // Nettoyage : supprimer les sauts de ligne excessifs
    const texteNettoye = texteBrut.replace(/\n{3,}/g, '\n\n').trim();

    if (!texteNettoye) {
      throw new Error('AUCUN_TEXTE_EXTRAIT');
    }

    const nomResultat = `${uuidv4()}.txt`;
    const cheminResultat = path.join(OUTPUT_DIR, nomResultat);
    
    fs.writeFileSync(cheminResultat, texteNettoye, 'utf8');

    return {
      nomStockage: nomResultat,
      chemin: cheminResultat,
      tailleOctets: Buffer.byteLength(texteNettoye, 'utf8'),
      typeMime: 'text/plain',
      pagesSource: result.pages.length
    };

  } catch (error) {
    throw new Error(`ECHEC_EXTRACTION_TEXTE:${error.message}`);
  }
};

