import fs from 'fs';
import pool from '../config/db.js';

export const nettoyerFichiersExpires = async () => {
  console.log(`[${new Date().toISOString()}] 🧹 Nettoyage des fichiers expirés...`);

  try {
    // Récupérer tous les fichiers expirés
    const result = await pool.query(
      `SELECT id_files, chemin, taille_octets, owner_id
       FROM files
       WHERE expire_le IS NOT NULL
       AND expire_le < NOW()`
    );

    let nbSupprimes = 0;
    let octetsLiberes = 0;

    for (const file of result.rows) {

      // Supprimer physiquement le fichier
      if (fs.existsSync(file.chemin)) {
        fs.unlinkSync(file.chemin);
        octetsLiberes += Number(file.taille_octets);
      }

      // Supprimer de la BDD
      await pool.query(
        'DELETE FROM files WHERE id_files = $1',
        [file.id_files]
      );

      // Mettre à jour le stockage utilisé si fichier appartient à un user
      if (file.owner_id) {
        await pool.query(
          `UPDATE users
           SET stockage_utilise = stockage_utilise - $1
           WHERE id_users = $2`,
          [file.taille_octets, file.owner_id]
        );
      }

      nbSupprimes++;
    }

    console.log(`✅ Nettoyage terminé: ${nbSupprimes} fichiers supprimés, ${(octetsLiberes / 1024 / 1024).toFixed(2)} Mo libérés`);

  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
  }
};