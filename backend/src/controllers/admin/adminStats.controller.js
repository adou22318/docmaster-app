import { getStats } from '../../services/admin.service.js';

export const getAdminStats = async (req, res) => {
  try {
    const stats = await getStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Erreur getAdminStats:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur interne." });
  }
};
