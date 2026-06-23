import pool from "../config/db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

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

    const result = await pool.query(
        `INSERT INTO users (email, mot_de_passe, nom_complet)
         VALUES ($1, $2, $3) 
         RETURNING id_users, email, nom_complet, plan, created_at`,
         [email, mot_de_passe_hash, nom_complet]
    );
    return result.rows[0];
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
      plan: user.plan
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

  // Étape 4 — Générer un nouvel access token uniquement
  // On ne régénère PAS le refresh token — il reste valide
  // jusqu'à son expiration ou un logout
  const accessToken = jwt.sign(
    { id: user.id_users, email: user.email, plan: user.plan },
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

