import express from 'express';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

import { getAdminStats } from '../controllers/admin/adminStats.controller.js';
import { getAdminUsers, patchUserStatus } from '../controllers/admin/adminUsers.controller.js';
import { getAdminSubscriptions } from '../controllers/admin/adminSubscriptions.controller.js';
import { getAdminJobs, getAdminFailedJobs } from '../controllers/admin/adminJobs.controller.js';
import { getAuditLog } from '../controllers/admin/adminAuditLog.controller.js';

const router = express.Router();

// Protéger toutes les routes admin
router.use(verifyToken);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', getAdminStats);

// Gestion des utilisateurs
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', patchUserStatus);

// Abonnements
router.get('/subscriptions', getAdminSubscriptions);

// Jobs
router.get('/jobs', getAdminJobs);
router.get('/jobs/failed', getAdminFailedJobs);

// Audit log
router.get('/audit-log', getAuditLog);

export default router;
