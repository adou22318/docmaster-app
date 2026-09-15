import express from 'express';
import verifyToken from '../middlewares/verifyToken.js';
import { paymentLimiter } from '../middlewares/rateLimiter.js';
import { initiatePayment, handleWebhook, getStatus, getAdminLogs, confirmReturn } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/initiate', verifyToken, paymentLimiter, initiatePayment);
router.post('/confirm-return', verifyToken, confirmReturn);  // Confirmation directe après retour PayDunya
router.get('/status', verifyToken, getStatus);
router.post('/webhook', handleWebhook);
router.get('/admin/logs', getAdminLogs);

export default router;
