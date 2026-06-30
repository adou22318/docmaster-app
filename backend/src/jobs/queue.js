import Bull from 'bull';

// Créer la queue principale de traitement PDF
// Le nom 'pdf-processing' est l'identifiant de la queue
// Tous les workers qui écoutent ce nom reçoivent les jobs
const pdfQueue = new Bull('pdf-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379
  },
  // Options par défaut pour tous les jobs
  defaultJobOptions: {
    // Nombre de tentatives si le job échoue
    attempts: 3,
    // Attendre 5 secondes entre chaque tentative
    backoff: {
      type: 'fixed',
      delay: 5000
    },
    // Supprimer le job de la queue après succès
    removeOnComplete: true,
    // Garder les 100 derniers jobs échoués pour debug
    removeOnFail: 100
  }
});

// Events de la queue — utiles pour le monitoring
pdfQueue.on('completed', (job) => {
  console.log(`✅ Job ${job.id} terminé (type: ${job.data.type_operation})`);
});

pdfQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} échoué:`, err.message);
});

pdfQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} bloqué — sera relancé`);
});

export default pdfQueue;