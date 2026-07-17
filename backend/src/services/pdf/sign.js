import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { parsePageSelection } from './parsePages.js';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// ── Service de Signature Électronique (Non-eIDAS) ───────────
// cheminPdf       : fichier source PDF
// cheminSignature : fichier image de la signature (PNG/JPG)
// options         :
//   page      : page cible (ex: "1" ou 1, 1-indexed) — défaut: "1"
//   x, y      : coordonnées de la signature
//   largeur   : largeur souhaitée (défaut: 150)
//   hauteur   : hauteur souhaitée
export const signService = async (cheminPdf, cheminSignature, options = {}) => {

  if (!fs.existsSync(cheminPdf)) {
    throw new Error('FICHIER_PDF_INTROUVABLE');
  }

  if (!fs.existsSync(cheminSignature)) {
    throw new Error('FICHIER_SIGNATURE_INTROUVABLE');
  }

  const {
    page: selectionPage = "1",
    x = 50,
    y = 50,
    largeur = 150,
    hauteur
  } = options;

  // 1. Charger le PDF
  const pdfBytes = fs.readFileSync(cheminPdf);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  // 2. Déterminer la page cible
  const pagesParsees = parsePageSelection(String(selectionPage), totalPages);
  // On ne prend que la première page de la sélection pour la signature
  const indexCible = pagesParsees[0] - 1; // 1-indexed → 0-indexed
  
  const pageCible = pdfDoc.getPages()[indexCible];

  // 3. Intégrer l'image de signature
  const imageBytes = fs.readFileSync(cheminSignature);
  let pdfImage;

  try {
    const header = imageBytes.subarray(0, 4).toString('hex');
    if (header === '89504e47') {
      pdfImage = await pdfDoc.embedPng(imageBytes);
    } else if (header.startsWith('ffd8')) {
      pdfImage = await pdfDoc.embedJpg(imageBytes);
    } else {
      throw new Error('FORMAT_SIGNATURE_NON_SUPPORTE');
    }
  } catch (err) {
    throw new Error(`INTEGRATION_SIGNATURE_ECHOUEE:${err.message}`);
  }

  // Dimensionnement
  const origDims = pdfImage.scale(1);
  let finalWidth = parseFloat(largeur);
  let finalHeight = origDims.height * (finalWidth / origDims.width);
  
  if (hauteur !== undefined) {
    finalHeight = parseFloat(hauteur);
  }

  const finalX = parseFloat(x);
  const finalY = parseFloat(y);

  // 4. Dessiner la signature
  pageCible.drawImage(pdfImage, {
    x: finalX,
    y: finalY,
    width: finalWidth,
    height: finalHeight
  });

  // 5. Ajouter la date et heure automatiquement sous la signature
  const police = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const dateStr = `Signé le : ${new Date().toLocaleString('fr-FR')}`;
  
  pageCible.drawText(dateStr, {
    x: finalX,
    y: finalY - 12, // Légèrement en dessous de l'image
    size: 10,
    font: police,
    color: rgb(0, 0, 0)
  });

  // 6. Sauvegarder
  const bytesResultat = await pdfDoc.save();
  const nomResultat = `${uuidv4()}.pdf`;
  const cheminResultat = path.join(OUTPUT_DIR, nomResultat);

  fs.writeFileSync(cheminResultat, bytesResultat);

  return {
    nomStockage: nomResultat,
    chemin: cheminResultat,
    tailleOctets: bytesResultat.length,
    pageSignee: indexCible + 1,
    // Disclaimer technique à remonter au client (CDC)
    disclaimer: "Attention: Cette signature est une simple incrustation visuelle et n'a pas de valeur légale conforme au règlement européen eIDAS (pas de certificat cryptographique)."
  };
};
