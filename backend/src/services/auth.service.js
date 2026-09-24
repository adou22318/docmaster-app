import pool from "../config/db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import fs from "fs"

export const getAllUsersService = async() => {
    const result = await pool.query(
        "SELECT * FROM users"
    );
    return result.rows;
};

export const getUserByIdService = async(id) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE id_users = $1",
        [id]
    );
    return result.rows[0];
}

export const updateUserService = async(id_users, email, mot_de_passe, nom_complet) => {
    const result = await pool.query(
        `UPDATE users SET email=$1, mot_de_passe=$2, nom_complet=$3
         WHERE id_users=$4 RETURNUNG *`,
         [email, mot_de_passe, nom_complet, id_users]
    );
    return result.rows[0];
}

export const deleteUserService = async(id_users) => {
    const result = await pool.query(
        `DELETE FROM users WHERE id_users=$1 RETURNING *`, [id_users]
    );
    return result.rows[0];
}


export const registerService = async(email, mot_de_passe, nom_complet) => {
    //Vérification de l'unicité de l'email
    const emailExists = await pool.query(
        "SELECT id_users FROM users WHERE email = $1",
        [email]
    );

    if(emailExists.rows.length > 0) {
        throw new Error("Email_Already_Exists");
    }

    //Hashage du mot de passe: facteur de coût à 12 (standard de sécurité apprecié en 2026)
    const SALT_ROUNDS = 12;
    const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);

    try {
        const result = await pool.query(
            `INSERT INTO users (email, mot_de_passe, nom_complet)
             VALUES ($1, $2, $3) 
             RETURNING id_users, email, nom_complet, plan, created_at`,
             [email, mot_de_passe_hash, nom_complet]
        );
        
        const user = result.rows[0];
        
        try {
            await pool.query(
                `INSERT INTO abonnements (user_id, statut, plan, date_debut_essai, date_fin_essai)
                 VALUES ($1, 'essai', 'free', NOW(), NOW() + INTERVAL '7 days')`,
                [user.id_users]
            );
        } catch (err) {
            console.error("Erreur lors de la création de l'abonnement d'essai :", err);
        }
        
        return user;
    } catch (err) {
        if (err.code === '23505') {
            throw new Error("Email_Already_Exists");
        }
        throw err;
    }
}

// ─── Fonction utilitaire : générer les tokens ──────────────
// Séparée pour être réutilisée dans OAuth Google plus tard
export const generateTokens = (user) => {

  // Access token — courte durée (15 minutes)
  // Contient les infos nécessaires pour identifier l'utilisateur
  // Sans avoir à interroger la BDD à chaque requête
  const accessToken = jwt.sign(
    {
      id: user.id_users,
      email: user.email,
      nom_complet: user.nom_complet,
      plan: user.plan,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Refresh token — longue durée (7 jours)
  // Contient uniquement l'id — le minimum nécessaire
  // pour générer un nouvel access token
  const refreshToken = jwt.sign(
    { id: user.id_users },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// ─── Service Login ─────────────────────────────────────────
export const loginService = async (email, mot_de_passe) => {

  // Étape 1 — Chercher l'utilisateur par email
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  // Si aucun résultat — email inconnu
  // On ne dit pas "email inconnu" au client pour ne pas
  // aider un attaquant à deviner les emails existants
  if (result.rows.length === 0) {
    throw new Error('INVALID_CREDENTIALS');
  }


  const user = result.rows[0];

  // Si le compte est désactivé par un admin
  if (user.compte_actif === false) {
    throw new Error('COMPTE_INACTIF');
  }

  if (user.oauth_provider === 'google' && !user.mot_de_passe) {
     throw new Error('OAUTH_ACCOUNT');
  }

  // Étape 2 — Vérifier le mot de passe
  // bcrypt.compare compare le mot de passe en clair
  // avec le hash stocké en BDD
  // Retourne true si ça correspond, false sinon
  const motDePasseValide = await bcrypt.compare(
    mot_de_passe,
    user.mot_de_passe
  );

  if (!motDePasseValide) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Étape 3 — Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Étape 4 — Stocker le refresh token en BDD
  // Cela permet de le révoquer lors du logout
  // expires_at = maintenant + 7 jours
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [user.id_users, refreshToken]
  );

  // Étape 5 — Logger la connexion réussie
  // (sera branché sur logs_securite plus tard)

  // Étape 6 — Retourner les tokens + infos utilisateur
  // On ne retourne PAS mot_de_passe ni son hash
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id_users,
      email: user.email,
      nom_complet: user.nom_complet,
      plan: user.plan,
      role: user.role,
      photo_url: user.photo_url
    }
  };
};


export const refreshTokenService = async (refreshToken) => {

  // Étape 1 — Vérifier la signature du refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('REFRESH_TOKEN_INVALID');
  }

  // Étape 2 — Vérifier que le token existe en BDD
  // et qu'il n'a pas été révoqué (logout)
  const result = await pool.query(
    `SELECT * FROM refresh_tokens
     WHERE token = $1
     AND revoked = FALSE
     AND expires_at > NOW()`,
    [refreshToken]
  );

  if (result.rows.length === 0) {
    throw new Error('REFRESH_TOKEN_REVOKED');
  }

  // Étape 3 — Récupérer l'utilisateur
  const userResult = await pool.query(
    'SELECT * FROM users WHERE id_users = $1',
    [decoded.id]
  );

  if (userResult.rows.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  const user = userResult.rows[0];

  // Si le compte a été désactivé entre temps
  if (user.compte_actif === false) {
    throw new Error('COMPTE_INACTIF');
  }

  // Étape 4 — Générer un nouvel access token uniquement
  // On ne régénère PAS le refresh token — il reste valide
  // jusqu'à son expiration ou un logout
  const accessToken = jwt.sign(
    { id: user.id_users, email: user.email, nom_complet: user.nom_complet, plan: user.plan, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  return { accessToken };
};

// Service
export const logoutService = async (refreshToken) => {

  // Révoquer le refresh token en BDD
  // L'utilisateur devra se reconnecter pour obtenir un nouveau token
  const result = await pool.query(
    `UPDATE refresh_tokens
     SET revoked = TRUE
     WHERE token = $1
     RETURNING id_refresh_tokens`,
    [refreshToken]
  );

  // Si aucune ligne mise à jour — token inconnu ou déjà révoqué
  if (result.rowCount === 0) {
    throw new Error('TOKEN_NOT_FOUND');
  }

  return true;
};

// ─── Service Suppression de compte ──────────────────────────
export const deleteAccountService = async (userId) => {
  // 1. Récupérer tous les fichiers de l'utilisateur pour les supprimer du disque
  const userFiles = await pool.query(
    'SELECT chemin FROM files WHERE owner_id = $1',
    [userId]
  );

  for (const file of userFiles.rows) {
    if (fs.existsSync(file.chemin)) {
      fs.unlinkSync(file.chemin);
    }
  }

  // 2. Supprimer les fichiers de la base (cascades aux jobs_files)
  await pool.query('DELETE FROM files WHERE owner_id = $1', [userId]);

  // 3. Supprimer les jobs de l'utilisateur
  await pool.query('DELETE FROM jobs WHERE user_id = $1', [userId]);

  // 4. Supprimer les refresh tokens
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

  // 5. Supprimer l'utilisateur
  await pool.query('DELETE FROM users WHERE id_users = $1', [userId]);

  return true;
};

export const updateProfileService = async (id, nom_complet, email, newPassword = null) => {
    // Vérifier si l'email existe déjà pour un autre user
    const emailCheck = await pool.query("SELECT * FROM users WHERE email = $1 AND id_users != $2", [email, id]);
    if (emailCheck.rows.length > 0) {
        throw new Error("Cet email est déjà utilisé par un autre compte.");
    }
    
    if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await pool.query(
            "UPDATE users SET nom_complet = $1, email = $2, mot_de_passe = $3 WHERE id_users = $4 RETURNING id_users, email, nom_complet, plan, photo_url",
            [nom_complet, email, hashedPassword, id]
        );
        return result.rows[0];
    } else {
        const result = await pool.query(
            "UPDATE users SET nom_complet = $1, email = $2 WHERE id_users = $3 RETURNING id_users, email, nom_complet, plan, photo_url",
            [nom_complet, email, id]
        );
        return result.rows[0];
    }
};
