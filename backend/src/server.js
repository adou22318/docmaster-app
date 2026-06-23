import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import pool from "./config/db.js"
// import userRoutes from "./routes/userRoutes.js"
import errorHandler from "./middlewares/errorHandler.js"
import authRoutes from "./routes/auth.routes.js"
import passport from './config/passport.js';
import verifyToken from "./middlewares/verifyToken.js"

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

//Middlewares
app.use(express.json());
app.use(cors());

app.use(passport.initialize());

//Utilisation des Routes
// app.use("/api", userRoutes);
app.use("/api/auth", authRoutes);

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
