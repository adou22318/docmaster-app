import { createFileService, checkQuotaService, deleteFileService } from '../services/files.service.js';
import pool from '../config/db.js';
import fs from 'fs'

export const deleteAllUserFiles = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer tous les fichiers de l'utilisateur
    const result = await pool.query(
      'SELECT id_files, chemin, taille_octets FROM files WHERE owner_id = $1',
      [userId]
    );

    const files = result.rows;

    // Supprimer physiquement chaque fichier du disque
    for (const file of files) {
      if (file.chemin && fs.existsSync(file.chemin)) {
        fs.unlinkSync(file.chemin);
      }
    }

    // Supprimer toutes les références jobs_files
    if (files.length > 0) {
      const fileIds = files.map(f => f.id_files);
      await pool.query(
        'DELETE FROM jobs_files WHERE files_id = ANY($1::uuid[])',
        [fileIds]
      );
    }

    // Supprimer tous les fichiers en BDD
    await pool.query('DELETE FROM files WHERE owner_id = $1', [userId]);

    // Remettre le quota à 0
    await pool.query(
      'UPDATE users SET stockage_utilise = 0 WHERE id_users = $1',
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: `${files.length} fichier(s) supprimé(s) avec succès.`,
      data: { count: files.length }
    });

  } catch (error) {
    console.error('Erreur deleteAllUserFiles:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression des fichiers.'
    });
  }
};

export const uploadFile = async (req, res) => {
  try {
    // req.file est fourni par Multer si l'upload a réussi
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier reçu.'
      });
    }

    const userId = req.user.id;

    // Correction d'encodage Multer : les navigateurs envoient le nom en UTF-8
    // mais Multer le lit en latin1 par défaut → on re-encode correctement.
    if (req.file.originalname) {
      req.file.originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    }

    await checkQuotaService(userId, req.file.size);

    const file = await createFileService(req.file, userId);

    return res.status(201).json({
      success: true,
      message: 'Fichier uploadé avec succès.',
      data: file
    });

  } catch (error) {

    // Supprimer le fichier uploadé si une erreur survient
    // pour ne pas laisser des fichiers orphelins sur le disque
    if (req.file?.path) {
      import('fs').then(fs => {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      });
    }

    if (error.message === 'QUOTA_DEPASSE') {
      return res.status(400).json({
        success: false,
        message: 'Quota de stockage dépassé. Supprimez des fichiers ou passez au plan Pro.'
      });
    }

    console.error('Erreur upload:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload.'
    });
  }
};

export const uploadTempFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier reçu.'
      });
    }

    // Le fichier a été enregistré sur le disque par Multer.
    // On ne l'insère PAS en base de données et on ne vérifie PAS le quota
    // car il est destiné à être supprimé automatiquement après traitement.
    // Multer génère "uuid.ext" — on retire l'extension pour retourner un UUID pur
    const filenameWithoutExt = req.file.filename.replace(/\.[^.]+$/, '');

    return res.status(201).json({
      success: true,
      message: 'Fichier temporaire uploadé avec succès.',
      data: {
        id_files: filenameWithoutExt,
        nom_original: req.file.originalname
      }
    });

  } catch (error) {
    console.error('Erreur upload temporaire:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload temporaire.'
    });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Récupérer le fichier en BDD
    const result = await pool.query(
      'SELECT * FROM files WHERE id_files = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fichier introuvable.'
      });
    }

    const file = result.rows[0];

    // Vérifier les droits
    if (file.owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé.'
      });
    }

    // Vérifier que le fichier existe sur le disque
    if (!fs.existsSync(file.chemin)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier expiré ou supprimé.'
      });
    }

    // Envoyer le fichier avec le nom original
    res.download(file.chemin, file.nom_original);

  } catch (error) {
    console.error('Erreur download:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement.'
    });
  }
};

export const streamFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Récupérer le fichier en BDD
    const result = await pool.query('SELECT * FROM files WHERE id_files = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Fichier introuvable.' });

    const file = result.rows[0];
    if (file.owner_id !== userId) return res.status(403).json({ success: false, message: 'Accès refusé.' });
    if (!fs.existsSync(file.chemin)) return res.status(404).json({ success: false, message: 'Fichier expiré ou supprimé.' });

    // Stream en ligne pour react-pdf
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + encodeURIComponent(file.nom_original) + '"');
    // Important pour CORS et Range requests via react-pdf
    res.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Length, Content-Range');
    
    // sendFile gère nativement le Range Request
    res.sendFile(file.chemin, { root: '.' });

  } catch (error) {
    console.error('Erreur stream:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors du chargement.' });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Valider que l'ID est un UUID valide
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de fichier invalide.'
      });
    }

    await deleteFileService(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Fichier supprimé avec succès.'
    });

  } catch (error) {
    if (error.message === 'FILE_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Fichier introuvable.'
      });
    }

    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce fichier.'
      });
    }

    console.error('Erreur deleteFile:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du fichier.'
    });
  }
};

export const getUserFiles = async (req, res) => {
  try {
    const userId = req.user.id;

    const limit = parseInt(req.query.limit) || 100;
    
    const result = await pool.query(
      'SELECT id_files as id, nom_original, taille_octets, type_mime, created_at FROM files WHERE owner_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getUserFiles:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fichiers.'
    });
  }
};