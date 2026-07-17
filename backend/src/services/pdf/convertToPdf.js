import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// ── Recherche de l'exécutable LibreOffice ──
function getSofficeCommand() {
  if (process.platform === 'win32') {
    const paths = [
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe'
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return `"${p}"`;
    }
  }
  return 'soffice'; // Fallback au PATH standard si introuvable
}

// ── Conversion de fichiers Office vers PDF via LibreOffice ──
// chemin : fichier source (DOCX, XLSX, PPTX)
export const convertToPdfService = async (chemin) => {

  if (!fs.existsSync(chemin)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  // On crée un dossier temporaire unique pour la sortie de LibreOffice
  // car --outdir est obligatoire pour rediriger la sortie,
  // et on ne veut pas risquer d'écraser d'autres fichiers
  const tempId = uuidv4();
  const outDir = path.join(OUTPUT_DIR, tempId);
  fs.mkdirSync(outDir, { recursive: true });

  const nomFichierOrigine = path.basename(chemin);
  // LibreOffice génère le nom en remplaçant l'extension par .pdf
  const nomAttendu = nomFichierOrigine.replace(/\.[^/.]+$/, "") + ".pdf";
  const cheminAttendu = path.join(outDir, nomAttendu);

  // Commande LibreOffice headless
  // --headless    : pas d'interface graphique
  // --convert-to  : format cible
  // --outdir      : dossier de destination
  const sofficeCmd = getSofficeCommand();
  const commande = `${sofficeCmd} --headless --convert-to pdf --outdir "${outDir}" "${chemin}"`;

  try {
    // Timeout spécifique de 120 secondes (2 minutes) pour la conversion Office
    // Les gros fichiers XLSX/PPTX peuvent prendre du temps
    await new Promise((resolve, reject) => {
      exec(commande, { timeout: 120000 }, (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            return reject(new Error('TIMEOUT_CONVERSION_OFFICE'));
          }
          return reject(new Error(`ECHEC_CONVERSION:${stderr || error.message}`));
        }
        resolve();
      });
    });

    // Vérifier que LibreOffice a bien créé le fichier
    if (!fs.existsSync(cheminAttendu)) {
      throw new Error('ECHEC_GENERATION_FICHIER');
    }

    // Déplacer le fichier de son dossier temporaire vers le dossier standard
    const nomResultat = `${uuidv4()}.pdf`;
    const cheminResultat = path.join(OUTPUT_DIR, nomResultat);
    
    fs.renameSync(cheminAttendu, cheminResultat);
    
    // Nettoyer le dossier temporaire
    fs.rmdirSync(outDir);

    return {
      nomStockage: nomResultat,
      chemin: cheminResultat,
      tailleOctets: fs.statSync(cheminResultat).size
    };

  } catch (error) {
    // Nettoyage en cas d'erreur
    if (fs.existsSync(outDir)) {
      try {
        fs.rmSync(outDir, { recursive: true, force: true });
      } catch (e) {
        // Ignorer
      }
    }
    throw error;
  }
};
