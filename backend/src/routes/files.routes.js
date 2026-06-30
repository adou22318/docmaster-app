import express from 'express';
import upload from '../middlewares/uploads.js';
import verifyToken from '../middlewares/verifyToken.js';
import { uploadFile, downloadFile, deleteFile } from '../controllers/files.controller.js';

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

//Accessible aux visiteurs et aux connectés
router.post('/upload', verifyToken, handleUpload, uploadFile);

// Route protégée — utilisateur doit être connecté pour télécharger
router.get('/download/:id', verifyToken, downloadFile);
router.delete('/:id', verifyToken, deleteFile);

export default router;