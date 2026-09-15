import express from 'express';
import upload from '../middlewares/uploads.js';
import verifyToken from '../middlewares/verifyToken.js';
import checkSubscription from '../middlewares/checkSubscription.js';
import { uploadFile, uploadTempFile, downloadFile, streamFile, deleteFile, getUserFiles, deleteAllUserFiles } from '../controllers/files.controller.js';

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
        const parts = err.message.split(':');
        const toolId = parts[2] || '';
        let message = 'Ce format de fichier n\'est pas accepté par cet outil.\n\nSeuls les fichiers PDF sont acceptés ici.\n\nSi votre document est au format Word, Excel ou PowerPoint, convertissez-le d\'abord en PDF via l\'outil "Office vers PDF".';
        if (toolId === 'convert_to_pdf') {
          message = 'Ce type de fichier ne peut pas être converti en PDF.\n\nSeuls les formats Word (.docx), Excel (.xlsx) et PowerPoint (.pptx) sont acceptés.';
        } else if (toolId === 'convert_images_to_pdf') {
          message = 'Ce fichier n\'est pas une image.\n\nFormats acceptés : JPG, PNG, BMP, GIF, TIFF.';
        }
        return res.status(400).json({ success: false, message });
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
router.post('/upload', verifyToken, checkSubscription, handleUpload, uploadFile);

// Route pour upload temporaire (sans insertion DB, ne compte pas dans quota)
router.post('/upload-temp', verifyToken, checkSubscription, handleUpload, uploadTempFile);

// Route pour lister les fichiers récents
router.get('/', verifyToken, getUserFiles);

// Routes pour manipuler un fichier
router.get('/download/:id', verifyToken, downloadFile);
router.get('/stream/:id', verifyToken, streamFile);
router.delete('/all', verifyToken, deleteAllUserFiles);  // IMPORTANT: avant /:id pour éviter le conflit
router.delete('/:id', verifyToken, deleteFile);

export default router;