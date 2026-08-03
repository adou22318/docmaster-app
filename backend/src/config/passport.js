import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './db.js';
import { generateTokens } from '../services/auth.service.js';
import dotenv from "dotenv"

dotenv.config();

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const nom_complet = profile.displayName;
      const photo_url = profile.photos[0]?.value;

      // Chercher si l'utilisateur existe déjà
      let result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      let user;

      if (result.rows.length === 0) {
        // Nouvel utilisateur — créer le compte
        // mot_de_passe est NULL car connexion OAuth
        const insertResult = await pool.query(
          `INSERT INTO users
            (email, nom_complet, photo_url, oauth_provider)
           VALUES ($1, $2, $3, 'google')
           RETURNING *`,
          [email, nom_complet, photo_url]
        );
        user = insertResult.rows[0];
      } else {
        // Utilisateur existant — mettre à jour la photo et le nom complet
        // (au cas où le nom a changé sur Google)
        const updateResult = await pool.query(
          'UPDATE users SET photo_url = $1, nom_complet = $2 WHERE id_users = $3 RETURNING *',
          [photo_url, nom_complet, result.rows[0].id_users]
        );
        user = updateResult.rows[0];
      }

      // Générer les tokens DocMaster
      const tokens = generateTokens(user);

      // Stocker le refresh token
      await pool.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [user.id_users, tokens.refreshToken]
      );

      // Passer les tokens à la callback
      return done(null, { user, tokens });

    } catch (error) {
      return done(error, null);
    }
  }
));

export default passport;