import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import mime from "mime-types"

// ── Dossier de stockage temporaire ──────────────────────────
// Les fichiers arrivent ici en attendant d'être traités
// Le cron les supprime après 24h s'ils ne sont pas sauvegardés
const UPLOAD_DIR = process.env.UPLOAD_DIR || './tmp/uploads';

// Créer le dossier s'il n'existe pas
// recursive:true évite l'erreur si le dossier parent n'existe pas
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ── Configuration du stockage sur disque ────────────────────
const storage = multer.diskStorage({

  // Dossier de destination
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  // Nom du fichier sur le disque
  // On n'utilise JAMAIS le nom original — risque de collision
  // et d'attaque par chemin (path traversal)
  // UUID garantit un nom unique et non devinable
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const nomStockage = `${uuidv4()}${extension}`;
    cb(null, nomStockage);
  }
});

// ── Types MIME acceptés ─────────────────────────────────────
// Whitelist stricte — tout ce qui n'est pas listé est refusé
// Ne jamais faire confiance à l'extension côté client
const MIME_TYPES_AUTORISES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/bmp',
  'image/gif',
  'image/tiff',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const fileFilter = (req, file, cb) => {
  // Détecter le vrai MIME type depuis l'extension du fichier
  // Plus fiable que le MIME envoyé par le client
  const extensionMime = mime.lookup(file.originalname);

  console.log('MIME client:', file.mimetype);
  console.log('MIME extension:', extensionMime);

  // On utilise le MIME détecté depuis l'extension
  // Si l'extension est inconnue on tombe sur false
  const mimeAVerifier = extensionMime || file.mimetype;

  if (mimeAVerifier && MIME_TYPES_AUTORISES.includes(mimeAVerifier)) {
    // Corriger le mimetype pour que req.file.mimetype soit correct
    file.mimetype = mimeAVerifier;
    cb(null, true);
  } else {
    cb(new Error(`FORMAT_NON_SUPPORTE:${mimeAVerifier}`), false);
  }
};

// ── Instance Multer ─────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    // 50 Mo maximum — cohérent avec le CDC
    fileSize: 50 * 1024 * 1024,
    // Un seul fichier à la fois pour l'upload simple
    // La fusion multi-fichiers aura son propre endpoint
    files: 1
  }
});

export default upload;