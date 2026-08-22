/**
 * Détecte si un fichier PDF est protégé par mot de passe
 * côté client, SANS upload, SANS dépendance PDF.js.
 *
 * Méthode : inspection binaire du trailer PDF.
 * Tout PDF chiffré contient obligatoirement "/Encrypt" dans son trailer.
 * On lit uniquement les 4Ko de début + 4Ko de fin → instantané.
 *
 * @param {File} file
 * @returns {Promise<{ estProtege: boolean, erreur: string|null }>}
 */
export async function detecterProtectionPdf(file) {
  try {
    // Lire début + fin du fichier (le trailer est toujours à la fin)
    const HEAD_SIZE = 4096;
    const TAIL_SIZE = 4096;

    const headBlob = file.slice(0, HEAD_SIZE);
    const tailBlob = file.slice(Math.max(0, file.size - TAIL_SIZE), file.size);

    const [headBuffer, tailBuffer] = await Promise.all([
      headBlob.arrayBuffer(),
      tailBlob.arrayBuffer(),
    ]);

    // Convertir en string Latin-1 (safe pour l'inspection binaire PDF)
    const toStr = (buf) => {
      const bytes = new Uint8Array(buf);
      let s = '';
      for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
      return s;
    };

    const combined = toStr(headBuffer) + toStr(tailBuffer);

    // Un PDF chiffré contient toujours /Encrypt dans son dictionnaire trailer
    const estProtege = combined.includes('/Encrypt');

    return { estProtege, erreur: null };
  } catch (err) {
    // Non bloquant : en cas d'erreur on laisse passer le fichier
    console.warn('[detecterProtectionPdf] Erreur:', err.message);
    return { estProtege: false, erreur: err.message };
  }
}
