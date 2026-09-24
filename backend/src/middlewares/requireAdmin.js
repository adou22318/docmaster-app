const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux administrateurs.',
      code: 'ACCES_ADMIN_REQUIS'
    });
  }
  next();
};

export default requireAdmin;
