import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';

// ── Créer un fichier en BDD après upload ────────────────────
export const createFileService = async (fileData, userId) => {
  const {
    originalname,
    filename,
    path: filePath,
    size,
    mimetype
  } = fileData;

  // Plus de logique conditionnelle — toujours connecté
  // Fichier permanent, pas d'expiration automatique
  const result = await pool.query(
    `INSERT INTO files
      (owner_id, nom_original, nom_stockage, chemin,
       taille_octets, type_mime)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_files, nom_original, taille_octets, type_mime, created_at`,
    [userId, originalname, filename, filePath, size, mimetype]
  );

  await pool.query(
    `UPDATE users
     SET stockage_utilise = stockage_utilise + $1
     WHERE id_users = $2`,
    [size, userId]
  );

  return result.rows[0];
};

// ── Vérifier le quota de stockage ───────────────────────────
export const checkQuotaService = async (userId, fileSize) => {
  const result = await pool.query(
    'SELECT stockage_utilise, quota_stockage FROM users WHERE id_users = $1',
    [userId]
  );

  const user = result.rows[0];
  const apresUpload = Number(user.stockage_utilise) + fileSize;

  if (apresUpload > Number(user.quota_stockage)) {
    throw new Error('QUOTA_DEPASSE');
  }

  return true;
};

// ── Supprimer un fichier (disque + BDD) ─────────────────────
export const deleteFileService = async (fileId, userId) => {

  // Récupérer le chemin avant suppression
  const result = await pool.query(
    'SELECT chemin, taille_octets, owner_id FROM files WHERE id_files = $1',
    [fileId]
  );

  if (result.rows.length === 0) {
    throw new Error('FILE_NOT_FOUND');
  }

  const file = result.rows[0];

  // Vérifier que l'utilisateur est bien le propriétaire
  if (file.owner_id !== userId) {
    throw new Error('UNAUTHORIZED');
  }

  // Supprimer physiquement le fichier du disque
  if (fs.existsSync(file.chemin)) {
    fs.unlinkSync(file.chemin);
  }

  // Supprimer les références dans jobs_files (table de liaison)
  await pool.query('DELETE FROM jobs_files WHERE files_id = $1', [fileId]);

  // Supprimer de la BDD
  await pool.query('DELETE FROM files WHERE id_files = $1', [fileId]);

  // Mettre à jour le stockage utilisé
  if (userId) {
    await pool.query(
      `UPDATE users
       SET stockage_utilise = GREATEST(stockage_utilise - $1, 0)
       WHERE id_users = $2`,
      [file.taille_octets, userId]
    );
  }

  return true;
};