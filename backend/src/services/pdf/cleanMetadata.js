import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const OUTPUT_DIR = process.env.UPLOAD_DIR || './tmp/uploads';
export const cleanMetadataService = async (inputPath) => {
  const fileBuffer = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(fileBuffer);

  // Supprimer les métadonnées de base
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');
  pdfDoc.setCreationDate(new Date(0));
  pdfDoc.setModificationDate(new Date(0));

  const pdfBytes = await pdfDoc.save();

  const id = uuidv4();
  const outputPath = path.join(OUTPUT_DIR, `${id}.pdf`);
  fs.writeFileSync(outputPath, pdfBytes);

  const stats = fs.statSync(outputPath);

  return {
    chemin: outputPath,
    nomStockage: `${id}.pdf`,
    tailleOctets: stats.size,
    typeMime: 'application/pdf',
  };
};
