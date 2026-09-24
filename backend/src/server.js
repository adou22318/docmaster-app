import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./config/db.js";
// import userRoutes from "./routes/userRoutes.js"
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import passport from './config/passport.js';
import verifyToken from "./middlewares/verifyToken.js";
import filesRoutes from './routes/files.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import { nettoyerFichiersExpires } from './jobs/cronCleanup.js';
import { limiterGeneral, limiterUpload } from './middlewares/rateLimiter.js';
import paymentRoutes from './routes/payment.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Lancer le nettoyage toutes les heures
// 3600000 ms = 1 heure
setInterval(nettoyerFichiersExpires, 3600000);

// Lancer une première fois au démarrage
nettoyerFichiersExpires();

const app = express();
const port = process.env.PORT || 3001;

//Middlewares
app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);

    // En développement : localhost toujours autorisé
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // En production : lire la liste depuis ALLOWED_ORIGINS
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`Origine non autorisée par CORS : ${origin}`));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(passport.initialize());

//Utilisation des Routes
app.use("/api/auth", authRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.use(limiterGeneral);
app.use('/api/files', limiterUpload);
app.use('/api/jobs', limiterUpload);

//Middleware pour la gestion d'erreurs
app.use(errorHandler);


//Test de connexion postgres
app.get("/", async(req, res) => {
    const result = await pool.query("SELECT current_database()");
    res.send(`The database name is: ${result.rows[0].current_database}`);
});

// Route de santé — teste que le serveur répond
// et que le middleware verifyToken fonctionne
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Route de santé protégée — pour tester verifyToken
app.get('/api/health/protected', verifyToken, (req, res) => {
  res.json({ 
    status: 'ok',
    user: req.user,
    message: 'Token valide — vous êtes authentifié'
  });
});


app.listen(port, () => {
    console.log(`Server running on http:localhost:${port}`); 
});
