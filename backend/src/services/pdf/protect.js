import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// ── Exécuter une commande QPDF avec gestion du code de sortie 3 ──
// QPDF retourne :
//   0 = succès
//   3 = EXIT_WARNING — succès avec avertissements (clés dupliquées, etc.)
//   Autre = erreur réelle
//
// promisify(exec) lève une exception dès que le code ≠ 0,
// donc on utilise exec brut avec un wrapper Promise.
function execQpdf(commande) {
  return new Promise((resolve, reject) => {
    exec(commande, { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {

      // Pas d'erreur du tout — succès propre
      if (!error) {
        return resolve({ code: 0, stdout, stderr });
      }

      // Code 3 = EXIT_WARNING — on le traite comme un succès
      // Le fichier de sortie est quand même créé correctement
      if (error.code === 3) {
        console.warn(`⚠️ QPDF EXIT_WARNING: ${stderr || error.message}`);
        return resolve({ code: 3, stdout, stderr });
      }

      // Tout autre code = erreur réelle
      reject(new Error(stderr || error.message));
    });
  });
}

// ── Pré-nettoyage du PDF source ──────────────────────────────
// Étape 1 : Tenter qpdf --linearize (répare la structure, clés dupliquées)
// Étape 2 : Si échec, fallback Ghostscript (ré-impression PDF)
// Étape 3 : Si les deux échouent, utiliser le fichier original tel quel
//
// Ghostscript (gs) reconstruit le PDF depuis zéro via son moteur
// d'interprétation PostScript. C'est plus lent mais corrige des
// corruptions que qpdf ne peut pas réparer (objets cassés, xref
// corrompus, streams incomplets). L'option -dSAFER désactive
// l'accès au système de fichiers depuis le contenu PDF pour
// des raisons de sécurité.
async function prenettoyer(cheminSource) {

  const nomTemp = `${uuidv4()}_clean.pdf`;
  const cheminTemp = path.join(OUTPUT_DIR, nomTemp);

  // Tentative 1 — qpdf --linearize
  // La linéarisation réorganise le PDF pour un chargement web progressif,
  // mais en bonus elle corrige les erreurs de structure mineures
  try {
    await execQpdf(`qpdf --linearize "${cheminSource}" "${cheminTemp}"`);

    if (fs.existsSync(cheminTemp)) {
      console.log('✅ Pré-nettoyage réussi via qpdf --linearize');
      return cheminTemp;
    }
  } catch (erreurQpdf) {
    console.warn('⚠️ qpdf --linearize échoué:', erreurQpdf.message);
  }

  // Tentative 2 — Fallback Ghostscript
  // gs -sDEVICE=pdfwrite : utilise le driver d'écriture PDF
  // -dNOPAUSE            : pas de pause entre les pages
  // -dBATCH              : quitter après traitement
  // -dSAFER              : mode sécurisé (pas d'accès disque depuis le PDF)
  // -dQUIET              : supprimer les messages de progression
  try {
    await new Promise((resolve, reject) => {
      exec(
        `gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER -dQUIET -sOutputFile="${cheminTemp}" "${cheminSource}"`,
        { maxBuffer: 50 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) return reject(new Error(stderr || error.message));
          resolve({ stdout, stderr });
        }
      );
    });

    if (fs.existsSync(cheminTemp)) {
      console.log('✅ Pré-nettoyage réussi via Ghostscript (fallback)');
      return cheminTemp;
    }
  } catch (erreurGs) {
    console.warn('⚠️ Ghostscript fallback échoué:', erreurGs.message);
  }

  // Les deux ont échoué — on utilise l'original tel quel
  // Le chiffrement pourrait quand même fonctionner si le PDF
  // n'est pas gravement corrompu
  console.warn('⚠️ Pré-nettoyage impossible — utilisation du fichier original');
  return cheminSource;
}

// ── Nettoyer un fichier temporaire de pré-nettoyage ──────────
function nettoyerTemp(cheminTemp, cheminOriginal) {
  // Ne supprimer que si c'est un fichier temporaire, pas l'original
  if (cheminTemp !== cheminOriginal && fs.existsSync(cheminTemp)) {
    try {
      fs.unlinkSync(cheminTemp);
    } catch {
      // Ignorer — le cron de nettoyage s'en occupera
    }
  }
}

// ── Ajouter une protection par mot de passe ─────────────────
export const protectService = async (chemin, motDePasse) => {

  if (!fs.existsSync(chemin)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  if (!motDePasse || motDePasse.length < 4) {
    throw new Error('MOT_DE_PASSE_TROP_COURT');
  }

  // Étape 1 — Pré-nettoyage pour corriger les erreurs de structure
  const cheminNettoye = await prenettoyer(chemin);

  const nomResultat = `${uuidv4()}.pdf`;
  const cheminResultat = path.join(OUTPUT_DIR, nomResultat);

  // --encrypt USER_PWD OWNER_PWD KEY_LENGTH
  // Ici on utilise le même mot de passe pour l'ouverture (user)
  // et les permissions (owner) — simplification pour la V1
  // 256 = chiffrement AES-256, conforme au CDC
  const commande = `qpdf --encrypt "${motDePasse}" "${motDePasse}" 256 ` +
    `-- "${cheminNettoye}" "${cheminResultat}"`;

  try {
    await execQpdf(commande);
  } catch (error) {
    nettoyerTemp(cheminNettoye, chemin);
    throw new Error(`PROTECTION_ECHOUEE:${error.message}`);
  }

  // Nettoyage du fichier temporaire de pré-nettoyage
  nettoyerTemp(cheminNettoye, chemin);

  if (!fs.existsSync(cheminResultat)) {
    throw new Error('FICHIER_RESULTAT_MANQUANT');
  }

  return {
    nomStockage: nomResultat,
    chemin: cheminResultat,
    tailleOctets: fs.statSync(cheminResultat).size
  };
};

// ── Retirer la protection (avec le mot de passe actuel) ─────
export const unprotectService = async (chemin, motDePasseActuel) => {

  if (!fs.existsSync(chemin)) {
    throw new Error('FICHIER_INTROUVABLE');
  }

  const nomResultat = `${uuidv4()}.pdf`;
  const cheminResultat = path.join(OUTPUT_DIR, nomResultat);

  // --decrypt retire le chiffrement, nécessite le mot de passe
  const commande = `qpdf --decrypt --password="${motDePasseActuel}" ` +
    `"${chemin}" "${cheminResultat}"`;

  try {
    await execQpdf(commande);
  } catch (error) {
    // qpdf retourne une erreur spécifique si le mot de passe est faux
    throw new Error('MOT_DE_PASSE_INCORRECT');
  }

  if (!fs.existsSync(cheminResultat)) {
    throw new Error('FICHIER_RESULTAT_MANQUANT');
  }

  return {
    nomStockage: nomResultat,
    chemin: cheminResultat,
    tailleOctets: fs.statSync(cheminResultat).size
  };
};