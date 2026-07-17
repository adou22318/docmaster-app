import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ZipArchive } from 'archiver';
import { PDFDocument } from 'pdf-lib';
import GS_CMD from './gsCommand.js';
import { parsePageSelection } from './parsePages.js';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// ── Exécuter Ghostscript en mode rasterisation ───────────────
// Rasterise une seule page d'un PDF en image PNG/JPG.
// Ghostscript utilise -dFirstPage et -dLastPage pour cibler
// une page précise, évitant de rasteriser tout le document.
function rasteriserPage(cheminPdf, numeroPage, cheminSortie, dpi, format) {

  const device = format === 'jpg' ? 'jpeg' : 'png16m';

  // -r${dpi}       : résolution en DPI (points par pouce)
  // -dFirstPage    : page de début (1-indexed, natif Ghostscript)
  // -dLastPage     : page de fin (même valeur = 1 seule page)
  // -dTextAlphaBits=4 -dGraphicsAlphaBits=4 : anti-aliasing
  const commande = `${GS_CMD} -sDEVICE=${device} -r${dpi} ` +
    `-dFirstPage=${numeroPage} -dLastPage=${numeroPage} ` +
    `-dTextAlphaBits=4 -dGraphicsAlphaBits=4 ` +
    `-dNOPAUSE -dBATCH -dQUIET ` +
    `-sOutputFile="${cheminSortie}" "${cheminPdf}"`;

  return new Promise((resolve, reject) => {
    exec(commande, { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`ECHEC_RASTERISATION:page=${numeroPage},${stderr || error.message}`));
      }
      resolve(cheminSortie);
    });
  });
}

// ── Créer une archive ZIP à partir de fichiers sur disque ────
function creerArchiveZip(fichiers, cheminZip) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(cheminZip);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on('close', () => resolve(archive.pointer()));
    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    for (const fichier of fichiers) {
      archive.file(fichier.chemin, { name: fichier.nom });
    }

    archive.finalize();
  });
}

// ── Nettoyer les fichiers temporaires d'images ───────────────
function nettoyerFichiersTemp(chemins) {
  for (const chemin of chemins) {
    try {
      if (fs.existsSync(chemin)) fs.unlinkSync(chemin);
    } catch {
      // Ignorer — le cron de nettoyage s'en occupera
    }
  }
}

// ── Service de rasterisation de pages PDF en images ──────────
// Utilisé par les opérations 'extract_images' et 'pdf_to_images'
//
// chemin   : fichier source PDF
// options  :
//   dpi      : résolution (défaut: 150)
//   format   : 'png' ou 'jpg' (défaut: 'png')
//   pages    : sélection de pages (ex: "1, 3-5") — optionnel,
//              défaut = toutes les pages
export const rasterizeService = async (chemin, options = {}) => {

  const {
    dpi = 150,
    format = 'png',
    pages: selectionPages
  } = options;

  if (!fs.existsSync(chemin)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  // Valider le format de sortie
  const formatNormalise = String(format).toLowerCase();
  if (!['png', 'jpg'].includes(formatNormalise)) {
    throw new Error('FORMAT_IMAGE_INVALIDE');
  }

  // Valider le DPI
  const dpiValide = parseInt(dpi, 10);
  if (isNaN(dpiValide) || dpiValide < 72 || dpiValide > 600) {
    throw new Error('DPI_INVALIDE');
  }

  // Déterminer le nombre total de pages du PDF
  const pdfBytes = fs.readFileSync(chemin);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  // Résoudre les pages à rasteriser
  let pagesCibles;
  if (selectionPages && typeof selectionPages === 'string') {
    pagesCibles = parsePageSelection(selectionPages, totalPages);
  } else {
    // Toutes les pages (1-indexed)
    pagesCibles = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Rasteriser chaque page sélectionnée
  const fichiersGeneres = []; // { chemin, nom }
  const cheminsTemp = [];     // pour nettoyage en cas d'échec

  const extension = formatNormalise === 'jpg' ? 'jpg' : 'png';
  const mimeImage = formatNormalise === 'jpg' ? 'image/jpeg' : 'image/png';

  try {
    for (const pageNum of pagesCibles) {
      const nomImage = `${uuidv4()}.${extension}`;
      const cheminImage = path.join(OUTPUT_DIR, nomImage);

      await rasteriserPage(chemin, pageNum, cheminImage, dpiValide, formatNormalise);

      // Vérifier que l'image a bien été créée
      if (!fs.existsSync(cheminImage)) {
        throw new Error(`ECHEC_RASTERISATION:page=${pageNum}`);
      }

      cheminsTemp.push(cheminImage);
      fichiersGeneres.push({
        chemin: cheminImage,
        nom: `page_${pageNum}.${extension}`,
        nomStockage: nomImage
      });
    }
  } catch (error) {
    // Nettoyage des fichiers partiels si échec
    nettoyerFichiersTemp(cheminsTemp);
    throw error;
  }

  if (fichiersGeneres.length === 0) {
    throw new Error('AUCUNE_IMAGE_GENEREE');
  }

  // ── Cas 1 image → fichier simple ──────────────────────────
  if (fichiersGeneres.length === 1) {
    const fichier = fichiersGeneres[0];
    return {
      nomStockage: fichier.nomStockage,
      chemin: fichier.chemin,
      tailleOctets: fs.statSync(fichier.chemin).size,
      typeMime: mimeImage,
      imagesGenerees: 1
    };
  }

  // ── Cas N images → archive ZIP ────────────────────────────
  const nomZip = `${uuidv4()}.zip`;
  const cheminZip = path.join(OUTPUT_DIR, nomZip);

  try {
    const tailleZip = await creerArchiveZip(fichiersGeneres, cheminZip);

    // Nettoyer les images temporaires (elles sont dans le ZIP)
    nettoyerFichiersTemp(cheminsTemp);

    return {
      nomStockage: nomZip,
      chemin: cheminZip,
      tailleOctets: tailleZip,
      typeMime: 'application/zip',
      imagesGenerees: fichiersGeneres.length,
      fichiers: fichiersGeneres.map(f => f.nom)
    };
  } catch (error) {
    nettoyerFichiersTemp(cheminsTemp);
    if (fs.existsSync(cheminZip)) fs.unlinkSync(cheminZip);
    throw new Error(`ECHEC_ARCHIVAGE:${error.message}`);
  }
};
