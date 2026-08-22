import express from 'express';
import upload from '../middlewares/uploads.js';
import verifyToken from '../middlewares/verifyToken.js';
import { uploadFile, uploadTempFile, downloadFile, streamFile, deleteFile, getUserFiles } from '../controllers/files.controller.js';

const router = express.Router();
// Gestion des erreurs Multer — doit être faite ici
// car Multer passe ses erreurs différemment d'Express
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {

      // Fichier trop lourd
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Fichier trop lourd. Maximum 50 Mo.'
        });
      }

      // Format non supporté
      if (err.message?.startsWith('FORMAT_NON_SUPPORTE')) {
        return res.status(400).json({
          success: false,
          message: 'Format non supporté. Formats acceptés : PDF, JPG, PNG, DOCX, XLSX, PPTX.'
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Erreur lors de l\'upload.'
      });
    }
    next();
  });
};

// Route pour l'upload (Accessible aux connectés)
router.post('/upload', verifyToken, handleUpload, uploadFile);

// Route pour upload temporaire (sans insertion DB, ne compte pas dans quota)
router.post('/upload-temp', verifyToken, handleUpload, uploadTempFile);

// Route pour lister les fichiers récents
router.get('/', verifyToken, getUserFiles);

// Routes pour manipuler un fichier
router.get('/download/:id', verifyToken, downloadFile);
router.get('/stream/:id', verifyToken, streamFile);
router.delete('/:id', verifyToken, deleteFile);

export default router;