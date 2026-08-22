import { PDFDocument } from 'pdf-lib';

/**
 * loadPdf — Charge un PDF depuis un buffer avec gestion de l'erreur de chiffrement.
 *
 * IMPORTANT : pdf-lib ne supporte PAS le déchiffrement AES-256. L'option `password`
 * dans PDFDocument.load() est ignorée pour les PDFs chiffrés AES.
 *
 * Si vous devez traiter un PDF chiffré, utilisez dechiffrerAvecQpdf() AVANT
 * d'appeler loadPdf() pour créer un fichier temporaire déchiffré.
 *
 * @param {Buffer|Uint8Array} pdfBytes - Le contenu du fichier PDF
 * @param {object} [opts] - Options supplémentaires pour PDFDocument.load
 * @returns {Promise<PDFDocument>}
 * @throws {Error} 'PDF_CHIFFRE' si le PDF est protégé par mot de passe
 */
export const loadPdf = async (pdfBytes, opts = {}) => {
  try {
    return await PDFDocument.load(pdfBytes, opts);
  } catch (error) {
    if (error.message && error.message.includes('encrypted')) {
      throw new Error('PDF_CHIFFRE');
    }
    throw error;
  }
};
