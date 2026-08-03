import express from 'express';
import passport from '../config/passport.js';
import { register, login, refresh, logout } from '../controllers/auth.controller.js';
//import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login); 
// router.get('/profile', verifyToken, getProfile);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Étape 1 — Rediriger vers Google
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

// Étape 2 — Google rappelle ici après autorisation
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/api/auth/google/failure'
  }),
  (req, res) => {
    const { tokens } = req.user;

    // Rediriger vers le frontend avec les tokens dans l'URL
    // Le frontend les récupère et les stocke en mémoire
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback` +
      `?access_token=${tokens.accessToken}` +
      `&refresh_token=${tokens.refreshToken}`
    );
    
    // return res.json({
    //   success: true,
    //   message: 'OAuth Google fonctionnel',
    //   data: tokens
    // });
  }
);

router.get('/google/failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Connexion Google échouée.'
  });
});

export default router;