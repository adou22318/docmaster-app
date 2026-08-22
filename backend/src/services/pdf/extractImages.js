import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument, PDFName, PDFDict, PDFRawStream, PDFArray } from 'pdf-lib';
import sharp from 'sharp';
import { ZipArchive } from 'archiver';
import { parsePageSelection } from './parsePages.js';
import { loadPdf } from './loadPdf.js';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

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

// ── Extraire le nom du filtre d'un flux PDF ──────────────────
// Le filtre peut être un PDFName simple (/DCTDecode)
// ou un PDFArray de noms ([/FlateDecode, /DCTDecode])
function getFilterName(dict) {
  const filter = dict.get(PDFName.of('Filter'));
  if (!filter) return null;

  if (filter instanceof PDFName) return filter.decodeText();

  if (filter instanceof PDFArray) {
    // Prendre le premier filtre (le plus externe dans la chaîne)
    const first = filter.get(0);
    return first instanceof PDFName ? first.decodeText() : null;
  }

  return null;
}

// ── Déterminer le nombre de canaux depuis le ColorSpace ──────
function getChannels(dict, context) {
  const cs = dict.get(PDFName.of('ColorSpace'));
  if (!cs) return 3; // Défaut RGB

  if (cs instanceof PDFName) {
    const name = cs.decodeText();
    if (name === 'DeviceGray') return 1;
    if (name === 'DeviceCMYK') return 4;
    return 3; // DeviceRGB ou inconnu → 3
  }

  // ColorSpace peut être un tableau : [/ICCBased ref] ou [/Indexed /DeviceRGB ...]
  if (cs instanceof PDFArray && cs.size() > 0) {
    const csType = cs.get(0);
    if (csType instanceof PDFName) {
      const typeName = csType.decodeText();
      if (typeName === 'ICCBased' && cs.size() > 1) {
        // L'espace ICC contient un profil avec N composantes
        // On lit le dictionnaire du flux ICC pour obtenir /N
        const iccRef = cs.get(1);
        const iccStream = context.lookup(iccRef);
        if (iccStream && iccStream.dict) {
          const n = iccStream.dict.get(PDFName.of('N'));
          if (n) return n.numberValue ? n.numberValue : parseInt(n.toString(), 10);
        }
        return 3; // Fallback RGB
      }
      if (typeName === 'Indexed') return 1; // Palette-based → 1 canal d'index
      if (typeName === 'DeviceN') {
        // Nombre de canaux = longueur du tableau de noms (2ème élément)
        if (cs.size() > 1) {
          const names = cs.get(1);
          if (names instanceof PDFArray) return names.size();
        }
        return 3;
      }
    }
  }

  return 3; // Fallback
}

// ── Service d'extraction des images embarquées (XObjects) ────
// Utilise pdf-lib pour accéder directement aux objets XObject du PDF.
// Contrairement à pdfjs-dist, pdf-lib charge tout le document en mémoire
// de façon synchrone : aucun problème de résolution asynchrone.
//
// chemin   : fichier source PDF
// options  :
//   pages  : sélection de pages (ex: "1-3, 5") — optionnel, défaut = toutes
export const extractImagesService = async (chemin, options = {}, motDePasse = null) => {
  if (!fs.existsSync(chemin)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  const { pages: selectionPages } = options;

  // Dossier temporaire pour stocker les images extraites
  const tempId = uuidv4();
  const tempDir = path.join(OUTPUT_DIR, tempId);
  fs.mkdirSync(tempDir, { recursive: true });

  const imagesExtraites = [];
  let indexImageGlobal = 1;

  try {
    const pdfBytes = fs.readFileSync(chemin);
    const pdfDoc = await loadPdf(pdfBytes);
    const allPages = pdfDoc.getPages();
    const totalPages = allPages.length;
    const context = pdfDoc.context;

    // Déterminer les pages cibles (1-indexed)
    let pagesCibles;
    if (selectionPages && typeof selectionPages === 'string') {
      pagesCibles = parsePageSelection(selectionPages, totalPages);
    } else {
      pagesCibles = Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Parcourir chaque page cible
    for (const pageNum of pagesCibles) {
      const page = allPages[pageNum - 1]; // 1-indexed → 0-indexed
      const node = page.node;

      // Accéder au dictionnaire Resources → XObject de la page
      const resourcesRef = node.get(PDFName.of('Resources'));
      if (!resourcesRef) continue;

      const resources = context.lookup(resourcesRef);
      if (!(resources instanceof PDFDict)) continue;

      const xObjectRef = resources.get(PDFName.of('XObject'));
      if (!xObjectRef) continue;

      const xObjectDict = context.lookup(xObjectRef);
      if (!(xObjectDict instanceof PDFDict)) continue;

      // Itérer sur chaque XObject de la page
      const entries = xObjectDict.entries();
      for (const [_name, ref] of entries) {
        const obj = context.lookup(ref);
        if (!obj) continue;

        // Seuls les PDFRawStream sont des flux binaires (images, etc.)
        if (!(obj instanceof PDFRawStream)) continue;

        const dict = obj.dict;
        const subtype = dict.get(PDFName.of('Subtype'));
        if (!subtype) continue;

        // Vérifier que c'est un XObject de type Image (pas Form, pas PS)
        const subtypeName = subtype.decodeText();
        if (subtypeName !== 'Image') continue;

        const width = dict.get(PDFName.of('Width'))?.numberValue;
        const height = dict.get(PDFName.of('Height'))?.numberValue;
        if (!width || !height) continue;

        // Ignorer les micro-images (spacers 1×1, masques, etc.)
        if (width < 10 || height < 10) continue;

        const filterName = getFilterName(dict);
        const rawData = obj.contents; // Uint8Array des données encodées

        let outputPath;
        let outputName;
        let saved = false;

        try {
          if (filterName === 'DCTDecode') {
            // ── JPEG : les données brutes SONT le fichier JPEG ────
            outputName = `page_${pageNum}_img_${indexImageGlobal}.jpg`;
            outputPath = path.join(tempDir, outputName);
            fs.writeFileSync(outputPath, rawData);
            saved = true;

          } else if (filterName === 'FlateDecode' || !filterName) {
            // ── Pixels bruts (possiblement compressés par zlib) ───
            outputName = `page_${pageNum}_img_${indexImageGlobal}.png`;
            outputPath = path.join(tempDir, outputName);

            let pixelData;
            if (filterName === 'FlateDecode') {
              pixelData = zlib.inflateSync(Buffer.from(rawData));
            } else {
              pixelData = Buffer.from(rawData);
            }

            const channels = getChannels(dict, context);

            // Vérification de cohérence : taille attendue vs taille réelle
            const expectedSize = width * height * channels;
            if (pixelData.length < expectedSize) {
              console.warn(`Image page ${pageNum}: taille pixels incohérente (${pixelData.length} vs ${expectedSize}), ignorée`);
              continue;
            }

            await sharp(pixelData, {
              raw: { width, height, channels }
            }).toFile(outputPath);
            saved = true;

          } else if (filterName === 'JPXDecode') {
            // ── JPEG 2000 : sauvegarder en brut ──────────────────
            outputName = `page_${pageNum}_img_${indexImageGlobal}.jp2`;
            outputPath = path.join(tempDir, outputName);
            fs.writeFileSync(outputPath, rawData);
            saved = true;

          } else {
            // Filtre non supporté (JBIG2, CCITTFax...) → ignorer
            console.warn(`Image page ${pageNum}: filtre ${filterName} non supporté, ignorée`);
            continue;
          }
        } catch (imgError) {
          // Erreur sur UNE image → on continue les autres
          console.warn(`Image page ${pageNum}: erreur extraction — ${imgError.message}`);
          continue;
        }

        if (saved && outputPath) {
          imagesExtraites.push({
            chemin: outputPath,
            nom: outputName
          });
          indexImageGlobal++;
        }
      }
    }

    if (imagesExtraites.length === 0) {
      throw new Error('AUCUNE_IMAGE_EMBARQUEE_TROUVEE');
    }

    // ── Cas 1 seule image extraite ─────────────────────────────
    if (imagesExtraites.length === 1) {
      const img = imagesExtraites[0];
      const ext = path.extname(img.nom).slice(1); // jpg, png, jp2
      const nomStockage = `${uuidv4()}.${ext}`;
      const cheminFinal = path.join(OUTPUT_DIR, nomStockage);

      fs.renameSync(img.chemin, cheminFinal);
      fs.rmSync(tempDir, { recursive: true, force: true });

      const mimeMap = { jpg: 'image/jpeg', png: 'image/png', jp2: 'image/jp2' };

      return {
        nomStockage,
        chemin: cheminFinal,
        tailleOctets: fs.statSync(cheminFinal).size,
        typeMime: mimeMap[ext] || 'image/png',
        imagesGenerees: 1
      };
    }

    // ── Cas N images extraites → ZIP ───────────────────────────
    const nomZip = `${uuidv4()}.zip`;
    const cheminZip = path.join(OUTPUT_DIR, nomZip);
    const tailleZip = await creerArchiveZip(imagesExtraites, cheminZip);

    // Nettoyer le dossier temporaire
    fs.rmSync(tempDir, { recursive: true, force: true });

    return {
      nomStockage: nomZip,
      chemin: cheminZip,
      tailleOctets: tailleZip,
      typeMime: 'application/zip',
      imagesGenerees: imagesExtraites.length,
      fichiers: imagesExtraites.map(f => f.nom)
    };

  } catch (error) {
    // Nettoyer en cas d'erreur
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {
        // Ignorer
      }
    }
    // Si l'erreur est déjà formatée, la propager telle quelle
    if (error.message.startsWith('AUCUNE_IMAGE') || error.message.startsWith('FICHIER_')) {
      throw error;
    }
    throw new Error(`ECHEC_EXTRACTION_IMAGES:${error.message}`);
  }
};

