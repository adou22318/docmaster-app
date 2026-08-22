import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

/**
 * Exécute une commande qpdf et gère les codes de sortie spéciaux.
 * Code 3 = EXIT_WARNING (succès avec avertissements) → traité comme succès.
 */
function execQpdf(commande) {
  return new Promise((resolve, reject) => {
    exec(commande, { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (!error) return resolve({ code: 0, stdout, stderr });
      if (error.code === 3) {
        console.warn(`⚠️ QPDF EXIT_WARNING: ${stderr || error.message}`);
        return resolve({ code: 3, stdout, stderr });
      }
      reject(new Error(stderr || error.message));
    });
  });
}

/**
 * dechiffrerAvecQpdf — Déchiffre un PDF protégé par mot de passe via qpdf.
 *
 * Crée un fichier déchiffré temporaire que les services pdf-lib peuvent lire.
 * IMPORTANT : Le fichier temporaire doit être supprimé par l'appelant une fois
 * le traitement terminé (nettoyerFichierTemp).
 *
 * @param {string} cheminOriginal - Chemin du PDF chiffré sur le disque
 * @param {string} motDePasse - Mot de passe utilisateur pour déchiffrer
 * @returns {Promise<string>} - Chemin du fichier temporaire déchiffré
 * @throws {Error} MOT_DE_PASSE_INCORRECT si qpdf échoue (mauvais mot de passe)
 * @throws {Error} FICHIER_INTROUVABLE si le chemin n'existe pas
 */
export const dechiffrerAvecQpdf = async (cheminOriginal, motDePasse) => {
  if (!fs.existsSync(cheminOriginal)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  const nomTemp = `${uuidv4()}_decrypted.pdf`;
  const cheminTemp = path.join(OUTPUT_DIR, nomTemp);

  const commande = `qpdf --decrypt --password="${motDePasse}" "${cheminOriginal}" "${cheminTemp}"`;

  try {
    await execQpdf(commande);
  } catch (error) {
    // qpdf génère une erreur si le mot de passe est incorrect
    console.error(`[dechiffrerAvecQpdf] Échec qpdf:`, error.message);
    throw new Error('MOT_DE_PASSE_INCORRECT');
  }

  if (!fs.existsSync(cheminTemp)) {
    throw new Error('FICHIER_RESULTAT_MANQUANT');
  }

  console.log(`🔓 PDF déchiffré temporairement : ${nomTemp}`);
  return cheminTemp;
};

/**
 * nettoyerFichierTemp — Supprime un fichier temporaire de déchiffrement.
 * Appeler après traitement pour ne pas laisser de fichiers déchiffrés sur le disque.
 *
 * @param {string} cheminTemp - Chemin du fichier temporaire à supprimer
 * @param {string} cheminOriginal - Chemin original (pour vérifier qu'on ne supprime pas la source)
 */
export const nettoyerFichierTemp = (cheminTemp, cheminOriginal) => {
  if (cheminTemp && cheminTemp !== cheminOriginal && fs.existsSync(cheminTemp)) {
    try {
      fs.unlinkSync(cheminTemp);
      console.log(`🗑️ Fichier temporaire supprimé: ${path.basename(cheminTemp)}`);
    } catch (e) {
      console.warn(`⚠️ Impossible de supprimer le fichier temp: ${cheminTemp}`, e.message);
    }
  }
};
