import { createFileService, checkQuotaService, deleteFileService } from '../services/files.service.js';
import pool from '../config/db.js';
import fs from 'fs'

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