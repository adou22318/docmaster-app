import { getUsers, updateUserStatus } from '../../services/admin.service.js';

export const getAdminUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const search = req.query.search || '';
    const result = await getUsers(limit, offset, search);
    return res.status(200).json({ success: true, data: result.users, total: result.total, page, limit });
  } catch (error) {
    console.error("Erreur getAdminUsers:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur interne." });
  }
};

export const patchUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { compte_actif } = req.body;

    if (typeof compte_actif !== 'boolean') {
      return res.status(400).json({ success: false, message: "Le champ compte_actif doit être un booléen." });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ success: false, error: 'AUTO_MODIFICATION_INTERDITE', message: "Vous ne pouvez pas désactiver votre propre compte administrateur." });
    }

    await updateUserStatus(req.user.id, userId, compte_actif);

    return res.status(200).json({ success: true, message: "Statut de l'utilisateur mis à jour." });
  } catch (error) {
    console.error("Erreur patchUserStatus:", error);
    
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }
    
    if (error.message === 'LAST_ADMIN') {
      return res.status(400).json({ success: false, error: 'DERNIER_ADMIN', message: "Impossible de désactiver le dernier administrateur actif." });
    }
    
    return res.status(500).json({ success: false, message: "Erreur serveur interne." });
  }
};
