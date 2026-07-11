import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// ── Ajouter un filigrane texte ──────────────────────────────
export const watermarkService = async (chemin, options = {}) => {

  const {
    texte = 'CONFIDENTIEL',
    opacite = 0.3,
    rotation = 45,
    taillePolice = 50
  } = options;

  if (!fs.existsSync(chemin)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  const pdfBytes = fs.readFileSync(chemin);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Police standard intégrée — pas besoin de fichier de police externe
  const police = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();

    // Calculer la largeur du texte pour le centrer
    const largeurTexte = police.widthOfTextAtSize(texte, taillePolice);

    page.drawText(texte, {
      x: width / 2 - largeurTexte / 2,
      y: height / 2,
      size: taillePolice,
      font: police,
      color: rgb(0.5, 0.5, 0.5),
      opacity: opacite,
      rotate: degrees(rotation)
    });
  });

  const bytesResultat = await pdfDoc.save();
  const nomResultat = `${uuidv4()}.pdf`;
  const cheminResultat = path.join(OUTPUT_DIR, nomResultat);

  fs.writeFileSync(cheminResultat, bytesResultat);

  return {
    nomStockage: nomResultat,
    chemin: cheminResultat,
    tailleOctets: bytesResultat.length
  };
};