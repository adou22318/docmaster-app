import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {

  // Récupérer le token dans le header Authorization
  // Format attendu : "Bearer eyJhbGci..."
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Accès refusé. Token manquant.'
    });
  }

  // Extraire le token — on enlève "Bearer "
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Format de token invalide. Utilisez: Bearer <token>'
    });
  }

  try {
    // Vérifier la signature et l'expiration du token
    // jwt.verify lance une erreur si le token est invalide
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attacher les infos de l'utilisateur à la requête
    // Disponible dans tous les controllers via req.user
    req.user = decoded;

    // Passer à la suite (controller)
    next();

  } catch (error) {

    // TokenExpiredError : token valide mais expiré
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré. Veuillez vous reconnecter.',
        code: 'TOKEN_EXPIRED'
      });
    }

    // JsonWebTokenError : token falsifié ou malformé
    return res.status(401).json({
      success: false,
      message: 'Token invalide.',
      code: 'TOKEN_INVALID'
    });
  }
};

export default verifyToken;