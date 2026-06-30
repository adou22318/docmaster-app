import {
  createJobService,
  getJobStatusService,
  getUserJobsService
} from '../services/jobs.service.js';

const OPERATIONS_VALIDES = [
  'compress', 'merge', 'split', 'rotate',
  'protect', 'watermark', 'sign',
  'convert_to_pdf', 'pdf_to_images', 'pdf_to_txt'
];

export const createJob = async (req, res) => {
  try {
    const { type_operation, fichiers } = req.body;
    const userId = req.user.id;

    if (!type_operation || !fichiers || !Array.isArray(fichiers)) {
      return res.status(400).json({
        success: false,
        message: 'type_operation et fichiers (tableau) sont requis.'
      });
    }

    if (!OPERATIONS_VALIDES.includes(type_operation)) {
      return res.status(400).json({
        success: false,
        message: `Opération invalide. Valeurs acceptées : ${OPERATIONS_VALIDES.join(', ')}`
      });
    }

    if (fichiers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Au moins un fichier est requis.'
      });
    }

    const job = await createJobService(userId, type_operation, fichiers);

    return res.status(201).json({
      success: true,
      message: 'Job créé. Traitement en cours...',
      data: job
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
        message: 'Vous n\'êtes pas autorisé à utiliser ce fichier.'
      });
    }

    console.error('Erreur createJob:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du job.'
    });
  }
};

export const getJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const job = await getJobStatusService(id, userId);

    return res.status(200).json({
      success: true,
      data: job
    });

  } catch (error) {
    if (error.message === 'JOB_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Job introuvable.'
      });
    }

    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à accéder à ce job.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du job.'
    });
  }
};

export const getUserJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobs = await getUserJobsService(userId);

    return res.status(200).json({
      success: true,
      data: jobs
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des jobs.'
    });
  }
};