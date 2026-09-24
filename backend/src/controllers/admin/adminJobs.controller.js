import { getJobs } from '../../services/admin.service.js';

export const getAdminJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const result = await getJobs(limit, offset, false);
    return res.status(200).json({ success: true, data: result.jobs, total: result.total, page, limit });
  } catch (error) {
    console.error("Erreur getAdminJobs:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur interne." });
  }
};

export const getAdminFailedJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const result = await getJobs(limit, offset, true);
    return res.status(200).json({ success: true, data: result.jobs, total: result.total, page, limit });
  } catch (error) {
    console.error("Erreur getAdminFailedJobs:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur interne." });
  }
};
