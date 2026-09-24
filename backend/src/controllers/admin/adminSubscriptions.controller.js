import { getSubscriptions } from '../../services/admin.service.js';

export const getAdminSubscriptions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const result = await getSubscriptions(limit, offset);
    return res.status(200).json({ success: true, data: result.subscriptions, total: result.total, page, limit });
  } catch (error) {
    console.error("Erreur getAdminSubscriptions:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur interne." });
  }
};
