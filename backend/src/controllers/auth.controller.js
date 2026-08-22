import { registerService, loginService, refreshTokenService, logoutService } from "../services/auth.service.js";

export const register = async (req, res) => {
    try {
        let { email, mot_de_passe, nom_complet } = req.body;
        email = email?.trim().toLowerCase();

        //validation basique
        if(!email || !mot_de_passe || !nom_complet) {
            return res.status(400).json({
                success: false,
                message: "Email, mot de passe et nom complet sont requis."
            });
        }

        if(mot_de_passe.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Le mot de passe doit comporter au moins 8 caractères."
            });
        }

        const utilisateur = await registerService(email, mot_de_passe, nom_complet);

        return res.status(201).json({
            success: true,
            message: 'Compte créé avec succès.',
            data: utilisateur
        });

    } catch(error) {
        if(error.message === "Email_Already_Exists") {
            return res.status(409).json({
                success: false,
                message: "Cette adresse email est déjà utilisée."
            });
        }

        console.error("Erreur register: ", error);
        return res.status(500).json({
            success: false,
            message: "Une erreur interne est survenue."
        });
    }
}

export const login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    // Validation — les deux champs sont obligatoires
    if (!email || !mot_de_passe) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis.'
      });
    }

    const data = await loginService(email, mot_de_passe);

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      data
    });

  } catch (error) {
    // INVALID_CREDENTIALS couvre les deux cas :
    // email inconnu ET mauvais mot de passe
    // Volontairement vague pour ne pas aider les attaquants
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    if (error.message === 'OAUTH_ACCOUNT') {
        return res.status(400).json({
            success: false,
            message: 'Ce compte utilise la connexion Google. Utilisez le bouton "Connexion avec Google".'
        });
    }

    console.error('Erreur login:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur interne est survenue.'
    });
  }
};


export const refresh = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader?.split(' ')[1];

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token manquant.'
      });
    }

    const data = await refreshTokenService(refreshToken);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Erreur dans /refresh :', error.message);
    if (error.stack) {
        console.error(error.stack);
    }
    return res.status(401).json({
      success: false,
      message: 'Session expirée. Veuillez vous reconnecter.'
    });
  }
};

// Controller
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader?.split(' ')[1];

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token manquant.'
      });
    }

    await logoutService(refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Déconnexion réussie.'
    });

  } catch (error) {
    return res.status(200).json({
      success: true,
      message: 'Déconnexion réussie.'
      // On retourne 200 même si le token était inconnu
      // L'utilisateur est "déconnecté" de toute façon côté client
    });
  }
};
