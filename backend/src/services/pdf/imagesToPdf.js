import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// Dimensions de page en points (1 pt = 1/72 pouce)
const PAGE_FORMATS = {
  a4:     { width: 595.28, height: 841.89 },
  letter: { width: 612,    height: 792    },
};

// Marges en points
const MARGINS = {
  none:  0,
  small: 18,  // ~6 mm
  large: 36,  // ~12 mm
};

/**
 * Assemble une liste d'images (JPEG / PNG) en un seul PDF.
 *
 * @param {string[]} cheminsFichiers - Chemins absolus/relatifs des images, dans l'ordre.
 * @param {object}  options
 * @param {string}  options.format      - 'a4' | 'letter'           (défaut : 'a4')
 * @param {string}  options.orientation - 'auto' | 'portrait' | 'landscape' (défaut : 'auto')
 * @param {string}  options.margin      - 'none' | 'small' | 'large' (défaut : 'none')
 * @returns {Promise<{ chemin, nomStockage, tailleOctets, typeMime }>}
 */
export const imagesToPdfService = async (cheminsFichiers, options = {}) => {
  const {
    format      = 'a4',
    orientation = 'auto',
    margin      = 'none',
  } = options;

  const pdfDoc  = await PDFDocument.create();
  const marge   = MARGINS[margin]   ?? 0;
  const baseFormat = PAGE_FORMATS[format] ?? PAGE_FORMATS.a4;

  for (const cheminImage of cheminsFichiers) {
    if (!fs.existsSync(cheminImage)) {
      throw new Error(`FICHIER_INTROUVABLE: ${cheminImage}`);
    }

    const imageBytes = fs.readFileSync(cheminImage);
    const ext = path.extname(cheminImage).toLowerCase();

    let embeddedImage;
    if (ext === '.png') {
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    } else {
      // JPEG par défaut (jpg, jpeg, bmp, gif, tiff via conversion implicite)
      try {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } catch {
        // Certains formats (bmp, gif, tiff) ne sont pas natifs dans pdf-lib.
        // On tente en PNG au cas où le fichier serait lisible quand même.
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      }
    }

    const imgW = embeddedImage.width;
    const imgH = embeddedImage.height;

    // Déterminer l'orientation de la page
    let pageW, pageH;
    if (orientation === 'landscape') {
      pageW = Math.max(baseFormat.width, baseFormat.height);
      pageH = Math.min(baseFormat.width, baseFormat.height);
    } else if (orientation === 'portrait') {
      pageW = Math.min(baseFormat.width, baseFormat.height);
      pageH = Math.max(baseFormat.width, baseFormat.height);
    } else {
      // auto : utiliser l'orientation naturelle de l'image
      if (imgW > imgH) {
        pageW = Math.max(baseFormat.width, baseFormat.height);
        pageH = Math.min(baseFormat.width, baseFormat.height);
      } else {
        pageW = Math.min(baseFormat.width, baseFormat.height);
        pageH = Math.max(baseFormat.width, baseFormat.height);
      }
    }

    const page = pdfDoc.addPage([pageW, pageH]);

    // Zone utile (après marges)
    const zoneW = pageW - 2 * marge;
    const zoneH = pageH - 2 * marge;

    // Mise à l'échelle en conservant le ratio, sans dépasser la zone utile
    const scale = Math.min(zoneW / imgW, zoneH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    // Centrage dans la zone utile
    const x = marge + (zoneW - drawW) / 2;
    const y = marge + (zoneH - drawH) / 2;

    page.drawImage(embeddedImage, { x, y, width: drawW, height: drawH });
  }

  const pdfBytes = await pdfDoc.save();

  const nomStockage = `${uuidv4()}.pdf`;
  const cheminSortie = path.join(UPLOAD_DIR, nomStockage);
  fs.writeFileSync(cheminSortie, pdfBytes);

  return {
    chemin:       cheminSortie,
    nomStockage,
    tailleOctets: pdfBytes.length,
    typeMime:     'application/pdf',
  };
};
