import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

// promisify transforme exec (callback) en version Promise (async/await)
const execAsync = promisify(exec);

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// Les 3 niveaux de compression Ghostscript
// /screen   = qualité la plus basse, fichier le plus petit (72 dpi)
// /ebook    = qualité moyenne (150 dpi) — bon compromis
// /printer  = haute qualité (300 dpi) — compression légère
const NIVEAUX_COMPRESSION = {
  haute: '/screen',
  moyenne: '/ebook',
  basse: '/printer'
};

// ── Détection de l'exécutable Ghostscript ───────────────────
// Sur Windows, exec() peut ne pas trouver gswin64c si le PATH
// du processus Node.js ne contient pas le dossier Ghostscript.
// On utilise le chemin absolu pour éviter ce problème.
const getGhostscriptCmd = () => {
  if (os.platform() !== 'win32') {
    return 'gs'; // Linux / macOS
  }

  // Chercher Ghostscript dans Program Files
  const gsBase = 'C:\\Program Files\\gs';
  if (fs.existsSync(gsBase)) {
    const versions = fs.readdirSync(gsBase)
      .filter(d => d.startsWith('gs'))
      .sort()
      .reverse(); // version la plus récente en premier

    if (versions.length > 0) {
      const gsPath = path.join(gsBase, versions[0], 'bin', 'gswin64c.exe');
      if (fs.existsSync(gsPath)) {
        return `"${gsPath}"`;
      }
    }
  }

  // Fallback : espérer que gswin64c est dans le PATH
  return 'gswin64c';
};

const GS_CMD = getGhostscriptCmd();

// ── Compression PDF via Ghostscript CLI ─────────────────────
export const compressService = async (chemin, niveau = 'moyenne') => {

  if (!fs.existsSync(chemin)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  const gsParametre = NIVEAUX_COMPRESSION[niveau];
  if (!gsParametre) {
    throw new Error('NIVEAU_INVALIDE');
  }

  const tailleAvant = fs.statSync(chemin).size;

  const nomResultat = `${uuidv4()}.pdf`;
  const cheminResultat = path.join(OUTPUT_DIR, nomResultat);

  // Commande Ghostscript
  // -sDEVICE=pdfwrite : sortie en PDF
  // -dCompatibilityLevel=1.4 : compatible avec lecteurs PDF anciens
  // -dPDFSETTINGS : le niveau de compression choisi
  // -dNOPAUSE -dBATCH : exécution sans interaction
  // -dQUIET : moins de logs
  const commande = `${GS_CMD} -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 ` +
    `-dPDFSETTINGS=${gsParametre} -dNOPAUSE -dBATCH -dQUIET ` +
    `-sOutputFile="${cheminResultat}" "${chemin}"`;

  try {
    await execAsync(commande);
  } catch (error) {
    throw new Error(`COMPRESSION_ECHOUEE:${error.message}`);
  }

  // Vérifier que le fichier résultat existe bien
  if (!fs.existsSync(cheminResultat)) {
    throw new Error('FICHIER_RESULTAT_MANQUANT');
  }

  const tailleApres = fs.statSync(cheminResultat).size;
  const pourcentageReduction = ((tailleAvant - tailleApres) / tailleAvant * 100).toFixed(1);

  return {
    nomStockage: nomResultat,
    chemin: cheminResultat,
    tailleOctets: tailleApres,
    tailleAvant,
    tailleApres,
    pourcentageReduction: parseFloat(pourcentageReduction)
  };
};