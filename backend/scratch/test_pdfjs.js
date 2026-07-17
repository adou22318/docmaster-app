import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function extractImages(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const numPages = doc.numPages;
  
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const ops = await page.getOperatorList();
    
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      // pdfjsLib.OPS.paintImageXObject or paintJpegXObject
      if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintImageXObjectRepeat || fn === pdfjsLib.OPS.paintJpegXObject) {
        const arg = ops.argsArray[i][0];
        const img = await page.objs.get(arg);
        console.log(`Found image on page ${pageNum}:`, img.width, 'x', img.height);
        // We'd need to extract raw data here
      }
    }
  }
}

extractImages(process.argv[2]).catch(console.error);
