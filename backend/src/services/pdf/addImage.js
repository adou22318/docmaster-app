import { PDFDocument } from 'pdf-lib';
import { loadPdf } from './loadPdf.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { parsePageSelection } from './parsePages.js';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// ── Positions prédéfinies (même logique que le filigrane) ────
const POSITIONS = {
  centre: (pw, ph, iw, ih) => ({
    x: pw / 2 - iw / 2,
    y: ph / 2 - ih / 2
  }),
  'haut-gauche': (_pw, ph, _iw, ih) => ({
    x: 30,
    y: ph - ih - 30
  }),
  'haut-droite': (pw, ph, iw, ih) => ({
    x: pw - iw - 30,
    y: ph - ih - 30
  }),
  'bas-gauche': (_pw, _ph, _iw, _ih) => ({
    x: 30,
    y: 30
  }),
  'bas-droite': (pw, _ph, iw, _ih) => ({
    x: pw - iw - 30,
    y: 30
  }),
  'haut-centre': (pw, ph, iw, ih) => ({
    x: pw / 2 - iw / 2,
    y: ph - ih - 30
  }),
  'bas-centre': (pw, _ph, iw, _ih) => ({
    x: pw / 2 - iw / 2,
    y: 30
  })
};

// ── Ajouter une image à un PDF ──────────────────────────────
// cheminPdf   : fichier source PDF
// cheminImage : fichier image (PNG ou JPG)
// options     :
//   pages     : sélection de pages (ex: "1-3, 5") — défaut = toutes
//   position  : "centre", "haut-gauche", etc. (défaut = "centre")
//   x, y      : coordonnées libres (écrasent la position prédéfinie)
//   largeur   : largeur souhaitée en points PDF
//   hauteur   : hauteur souhaitée en points PDF
export const addImageService = async (cheminPdf, cheminImage, options = {}, motDePasse = null) => {

  const {
    pages: selectionPages,
    position = 'centre',
    x,
    y,
    largeur,
    hauteur,
    placements,          // Nouveau : [{page, x, y, largeur, hauteur}, ...]
  } = options;

  if (!fs.existsSync(cheminPdf)) {
    throw new Error('FICHIER_PDF_INTROUVABLE');
  }

  if (!fs.existsSync(cheminImage)) {
    throw new Error('FICHIER_IMAGE_INTROUVABLE');
  }

  // 1. Charger le PDF
  const pdfBytes = fs.readFileSync(cheminPdf);
  const pdfDoc = await loadPdf(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  // 2. Déterminer les pages cibles
  let indicesCibles;
  if (selectionPages && typeof selectionPages === 'string') {
    const pagesParsees = parsePageSelection(selectionPages, totalPages);
    indicesCibles = pagesParsees.map(p => p - 1); // 1-indexed → 0-indexed
  } else {
    indicesCibles = pdfDoc.getPages().map((_, i) => i);
  }

  // 3. Charger et intégrer l'image
  const imageBytes = fs.readFileSync(cheminImage);
  let pdfImage;

  try {
    // Détection naïve basée sur la signature (magic bytes) ou l'extension
    // pdf-lib lèvera une erreur si le format est incorrect
    const header = imageBytes.subarray(0, 4).toString('hex');
    if (header === '89504e47') {
      pdfImage = await pdfDoc.embedPng(imageBytes);
    } else if (header.startsWith('ffd8')) {
      pdfImage = await pdfDoc.embedJpg(imageBytes);
    } else {
      throw new Error('FORMAT_IMAGE_NON_SUPPORTE');
    }
  } catch (err) {
    throw new Error(`INTEGRATION_IMAGE_ECHOUEE:${err.message}`);
  }

  // 4. Calculer les dimensions finales de l'image (mode classique)
  const origDims = pdfImage.scale(1);
  let finalWidth = origDims.width;
  let finalHeight = origDims.height;

  const wNum = parseFloat(largeur);
  const hNum = parseFloat(hauteur);

  if (!isNaN(wNum) && !isNaN(hNum)) {
    finalWidth = wNum;
    finalHeight = hNum;
  } else if (!isNaN(wNum)) {
    finalWidth = wNum;
    finalHeight = (wNum * origDims.height) / origDims.width;
  } else if (!isNaN(hNum)) {
    finalHeight = hNum;
    finalWidth = (hNum * origDims.width) / origDims.height;
  }

  // 5. Appliquer l'image
  const toutesLesPages = pdfDoc.getPages();

  // ── Mode placements (par page, coordonnées indépendantes) ──────────────────
  if (Array.isArray(placements) && placements.length > 0) {
    for (const placement of placements) {
      const pageIndex = (parseInt(placement.page, 10) || 1) - 1; // 1-indexed → 0-indexed
      if (pageIndex < 0 || pageIndex >= toutesLesPages.length) continue;

      const page = toutesLesPages[pageIndex];
      const pw = page.getSize().width;
      const ph = page.getSize().height;

      // Dimensions spécifiques au placement
      const pw_ = parseFloat(placement.largeur);
      const ph_ = parseFloat(placement.hauteur);
      let fw = !isNaN(pw_) ? pw_ : finalWidth;
      let fh = !isNaN(ph_) ? ph_ : finalHeight;

      // Coordonnées : x/y explicites ou position nommée
      let px, py;
      if (placement.x !== undefined && placement.y !== undefined) {
        px = parseFloat(placement.x);
        py = parseFloat(placement.y);
      } else {
        const calcPos = POSITIONS[placement.position || 'centre'] || POSITIONS['centre'];
        const computed = calcPos(pw, ph, fw, fh);
        px = computed.x;
        py = computed.y;
      }

      page.drawImage(pdfImage, { x: px, y: py, width: fw, height: fh });
    }

    const bytesResultat = await pdfDoc.save();
    const nomResultat = `${uuidv4()}.pdf`;
    const cheminResultat = path.join(OUTPUT_DIR, nomResultat);
    fs.writeFileSync(cheminResultat, bytesResultat);
    return {
      nomStockage: nomResultat,
      chemin: cheminResultat,
      tailleOctets: bytesResultat.length,
      pagesModifiees: placements.length,
    };
  }

  // ── Mode classique (x/y unique + sélection de pages) ──────────────────────
  const calculPosition = POSITIONS[position] || POSITIONS['centre'];

  for (const index of indicesCibles) {
    const page = toutesLesPages[index];
    const { width: pw, height: ph } = page.getSize();

    let finalX, finalY;
    if (x !== undefined && y !== undefined) {
      finalX = parseFloat(x);
      finalY = parseFloat(y);
    } else {
      const pos = calculPosition(pw, ph, finalWidth, finalHeight);
      finalX = pos.x;
      finalY = pos.y;
    }

    page.drawImage(pdfImage, {
      x: finalX,
      y: finalY,
      width: finalWidth,
      height: finalHeight
    });
  }

  // 6. Sauvegarder
  const bytesResultat = await pdfDoc.save();
  const nomResultat = `${uuidv4()}.pdf`;
  const cheminResultat = path.join(OUTPUT_DIR, nomResultat);

  fs.writeFileSync(cheminResultat, bytesResultat);

  return {
    nomStockage: nomResultat,
    chemin: cheminResultat,
    tailleOctets: bytesResultat.length,
    pagesModifiees: indicesCibles.length
  };
};

