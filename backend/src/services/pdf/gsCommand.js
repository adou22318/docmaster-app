import fs from 'fs';
import path from 'path';
import os from 'os';

// ── Détection centralisée du binaire Ghostscript ────────────
// Priorité :
//   1. Variable d'environnement GS_COMMAND (Docker, CI, etc.)
//   2. Auto-detect Windows (Program Files\gs\...)
//   3. Fallback système (gs / gswin64c dans le PATH)
//
// Ce module est importé par compress.js, rasterize.js, et tout
// futur service qui utilise Ghostscript.

function detecterGhostscript() {

  // 1. Variable d'environnement explicite — priorité maximale
  if (process.env.GS_COMMAND) {
    return process.env.GS_COMMAND;
  }

  // 2. Auto-detect Windows
  if (os.platform() === 'win32') {
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

    // Fallback Windows — espérer que gswin64c est dans le PATH
    return 'gswin64c';
  }

  // 3. Linux / macOS — binaire standard
  return 'gs';
}

// Résolution unique au démarrage du processus
const GS_CMD = detecterGhostscript();

export default GS_CMD;
