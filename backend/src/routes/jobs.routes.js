import express from 'express';
import verifyToken from '../middlewares/verifyToken.js';
import checkSubscription from '../middlewares/checkSubscription.js';
import { createJob, getJobStatus, getUserJobs } from '../controllers/jobs.controller.js';

const router = express.Router();

// Toutes les routes jobs nécessitent d'être connecté
router.use(verifyToken);

router.post('/', checkSubscription, createJob);
router.get('/', getUserJobs);
router.get('/:id', getJobStatus);

export default router;