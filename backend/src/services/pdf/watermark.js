import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { loadPdf } from './loadPdf.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { parsePageSelection } from './parsePages.js';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// ── Positions prédéfinies ────────────────────────────────────
// Chaque position retourne { x, y } en fonction des dimensions
// de la page et de la largeur du texte rendu
const POSITIONS = {
  centre: (w, h, tw, th) => ({
    x: w / 2 - tw / 2,
    y: h / 2
  }),
  'haut-gauche': (_w, h, _tw, th) => ({
    x: 30,
    y: h - th - 30
  }),
  'haut-droite': (w, h, tw, th) => ({
    x: w - tw - 30,
    y: h - th - 30
  }),
  'bas-gauche': (_w, _h, _tw, th) => ({
    x: 30,
    y: 30 + th
  }),
  'bas-droite': (w, _h, tw, th) => ({
    x: w - tw - 30,
    y: 30 + th
  }),
  'haut-centre': (w, h, tw, th) => ({
    x: w / 2 - tw / 2,
    y: h - th - 30
  }),
  'bas-centre': (w, _h, tw, th) => ({
    x: w / 2 - tw / 2,
    y: 30 + th
  })
};

// ── Convertir une couleur hex (#RRGGBB) en objet rgb() pdf-lib ──
// Accepte "#FF0000", "FF0000", ou un objet { r, g, b } (valeurs 0-1)
function parseCouleur(couleur) {
  if (!couleur) {
    return rgb(0.5, 0.5, 0.5); // Gris par défaut
  }

  // Objet { r, g, b } déjà normalisé (0-1)
  if (typeof couleur === 'object' && 'r' in couleur) {
    return rgb(couleur.r, couleur.g, couleur.b);
  }

  // Chaîne hexadécimale
  if (typeof couleur === 'string') {
    const hex = couleur.replace('#', '');
    if (hex.length !== 6) {
      return rgb(0.5, 0.5, 0.5); // Fallback gris si format invalide
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return rgb(r, g, b);
  }

  return rgb(0.5, 0.5, 0.5);
}

// ── Ajouter un filigrane texte ──────────────────────────────
// Options disponibles :
//   texte         : le texte du filigrane (défaut: "CONFIDENTIEL")
//   opacite       : opacité de 0 à 1 (défaut: 0.3)
//   rotation      : angle en degrés (défaut: 45)
//   taillePolice  : taille de la police (défaut: 50)
//   couleur       : "#RRGGBB" ou { r, g, b } en 0-1 (défaut: gris)
//   position      : "centre", "haut-gauche", "haut-droite",
//                   "bas-gauche", "bas-droite", "haut-centre",
//                   "bas-centre" (défaut: "centre")
//   pages         : sélection de pages (ex: "1-3, 5") — si absent,
//                   applique sur toutes les pages
export const watermarkService = async (chemin, options = {}, motDePasse = null) => {

  const {
    texte = 'CONFIDENTIEL',
    opacite = 0.3,
    rotation = 45,
    taillePolice = 50,
    couleur,
    position = 'centre',
    pages: selectionPages
  } = options;

  if (!fs.existsSync(chemin)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  const pdfBytes = fs.readFileSync(chemin);
  const pdfDoc = await loadPdf(pdfBytes);

  // Police standard intégrée — pas besoin de fichier de police externe
  const police = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const toutesLesPages = pdfDoc.getPages();
  const totalPages = toutesLesPages.length;

  // Déterminer les pages cibles
  // Si selectionPages est fourni, on utilise parsePageSelection
  // Sinon, on applique sur toutes les pages
  let indicesCibles;
  if (selectionPages && typeof selectionPages === 'string') {
    const pagesParsees = parsePageSelection(selectionPages, totalPages);
    indicesCibles = pagesParsees.map(p => p - 1); // 1-indexed → 0-indexed
  } else {
    indicesCibles = toutesLesPages.map((_, i) => i);
  }

  // Résoudre la couleur
  const couleurResolue = parseCouleur(couleur);

  // Résoudre la position (prédéfinie ou personnalisée)
  const calculPosition = POSITIONS[position] || POSITIONS['centre'];

  for (const index of indicesCibles) {
    const page = toutesLesPages[index];
    const { width, height } = page.getSize();

    // Calculer la largeur et hauteur du texte pour le positionnement
    const largeurTexte = police.widthOfTextAtSize(texte, taillePolice);
    const hauteurTexte = police.heightAtSize(taillePolice);

    const { x, y } = calculPosition(width, height, largeurTexte, hauteurTexte);

    page.drawText(texte, {
      x,
      y,
      size: taillePolice,
      font: police,
      color: couleurResolue,
      opacity: opacite,
      rotate: degrees(rotation)
    });
  }

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
