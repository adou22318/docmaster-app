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

const MIMES_PDF = ['application/pdf'];
const MIMES_IMAGES = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif', 'image/tiff'];
const MIMES_OFFICE = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

const fileFilter = (req, file, cb) => {
  // Détecter le vrai MIME type depuis l'extension du fichier
  // req.body N'EST PAS disponible ici (Multer n'a pas encore parsé le body).
  // On lit le toolId depuis les query params : POST /api/files/upload?tool=compress
  const extensionMime = mime.lookup(file.originalname);
  const mimeAVerifier = extensionMime || file.mimetype;
  const toolId = req.query.tool; // ex: 'compress', 'convert_to_pdf', 'convert_images_to_pdf'

  let isValid = false;

  if (toolId === 'convert_to_pdf') {
    isValid = MIMES_OFFICE.includes(mimeAVerifier);
  } else if (toolId === 'convert_images_to_pdf') {
    isValid = MIMES_IMAGES.includes(mimeAVerifier);
  } else if (toolId) {
    // Tous les autres outils : PDF uniquement
    isValid = MIMES_PDF.includes(mimeAVerifier);
  } else {
    // Pas de toolId : validation globale (dashboard, etc.)
    isValid = mimeAVerifier && MIME_TYPES_AUTORISES.includes(mimeAVerifier);
  }

  if (isValid) {
    file.mimetype = mimeAVerifier;
    cb(null, true);
  } else {
    // On encode le toolId dans l'erreur pour un message client plus précis
    cb(new Error(`FORMAT_NON_SUPPORTE:${mimeAVerifier}:${toolId || ''}`), false);
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