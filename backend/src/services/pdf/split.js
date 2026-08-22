import { PDFDocument } from 'pdf-lib';
import { loadPdf } from './loadPdf.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ZipArchive } from 'archiver';
import { parsePageSelection, parsePageGroups } from './parsePages.js';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// ── Extraire des pages d'un PDF dans un seul fichier résultat ─
// pages : tableau 1-indexed des pages à copier
async function extrairePagesEnPdf(pdfSource, pages) {
  const pdfResultat = await PDFDocument.create();

  // Conversion 1-indexed → 0-indexed pour pdf-lib
  const indices = pages.map(p => p - 1);

  const copiedPages = await pdfResultat.copyPages(pdfSource, indices);
  copiedPages.forEach((page) => pdfResultat.addPage(page));

  return pdfResultat.save();
}

// ── Créer une archive ZIP à partir de plusieurs buffers PDF ──
// fichiersPdf : [{ nom, bytes }]
function creerArchiveZip(fichiersPdf, cheminZip) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(cheminZip);
    const archive = new ZipArchive({ zlib: { level: 6 } });

    output.on('close', () => resolve(archive.pointer()));
    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    for (const fichier of fichiersPdf) {
      archive.append(Buffer.from(fichier.bytes), { name: fichier.nom });
    }

    archive.finalize();
  });
}

// ── Diviser un PDF selon une sélection avancée de pages ──────
// chemin    : fichier source
// selection : chaîne de sélection (ex: "1-3, 7, 12-15")
// mode      : 'single'   → toutes les pages dans un seul PDF
//             'separate' → un PDF par segment (chaque plage/page = 1 fichier)
//
// Exemples :
//   selection="1-3, 7, 12-15", mode="single"
//     → 1 PDF contenant les pages 1,2,3,7,12,13,14,15
//
//   selection="1-3, 7, 12-15", mode="separate"
//     → 3 PDF (pages 1-3, page 7, pages 12-15) compressés en ZIP
export const splitService = async (chemin, selection, mode = 'single', motDePasse = null) => {

  if (!fs.existsSync(chemin)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  const pdfBytes = fs.readFileSync(chemin);
  const pdfSource = await loadPdf(pdfBytes);
  const totalPages = pdfSource.getPageCount();

  // ── Mode "single" : toutes les pages sélectionnées dans 1 PDF ──
  if (mode === 'single') {

    const pages = parsePageSelection(selection, totalPages);

    const bytesResultat = await extrairePagesEnPdf(pdfSource, pages);
    const nomResultat = `${uuidv4()}.pdf`;
    const cheminResultat = path.join(OUTPUT_DIR, nomResultat);

    fs.writeFileSync(cheminResultat, bytesResultat);

    return {
      nomStockage: nomResultat,
      chemin: cheminResultat,
      tailleOctets: bytesResultat.length,
      pagesExtraites: pages.length,
      typeMime: 'application/pdf'
    };
  }

  // ── Mode "separate" : un PDF par segment ──────────────────────
  const groupes = parsePageGroups(selection, totalPages);

  // Cas dégénéré : un seul groupe → pas besoin de ZIP
  if (groupes.length === 1) {

    const bytesResultat = await extrairePagesEnPdf(pdfSource, groupes[0]);
    const nomResultat = `${uuidv4()}.pdf`;
    const cheminResultat = path.join(OUTPUT_DIR, nomResultat);

    fs.writeFileSync(cheminResultat, bytesResultat);

    return {
      nomStockage: nomResultat,
      chemin: cheminResultat,
      tailleOctets: bytesResultat.length,
      pagesExtraites: groupes[0].length,
      typeMime: 'application/pdf'
    };
  }

  // Plusieurs groupes → générer chaque PDF puis créer le ZIP
  const fichiersPdf = [];

  for (let i = 0; i < groupes.length; i++) {
    const groupe = groupes[i];
    const bytesGroupe = await extrairePagesEnPdf(pdfSource, groupe);

    // Nommer chaque fichier de manière descriptive
    // Ex: "pages_1-3.pdf", "page_7.pdf", "pages_12-15.pdf"
    const label = groupe.length === 1
      ? `page_${groupe[0]}`
      : `pages_${groupe[0]}-${groupe[groupe.length - 1]}`;

    fichiersPdf.push({
      nom: `${label}.pdf`,
      bytes: bytesGroupe
    });
  }

  // Créer l'archive ZIP
  const nomZip = `${uuidv4()}.zip`;
  const cheminZip = path.join(OUTPUT_DIR, nomZip);

  const tailleZip = await creerArchiveZip(fichiersPdf, cheminZip);

  return {
    nomStockage: nomZip,
    chemin: cheminZip,
    tailleOctets: tailleZip,
    pagesExtraites: groupes.reduce((acc, g) => acc + g.length, 0),
    typeMime: 'application/zip',
    fichiers: fichiersPdf.map(f => f.nom)
  };
};
