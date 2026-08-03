//Gestion centralisée simple des erreurs
const errorHandler = (err, req, res, next) => {
    console.error("Erreur serveur non gérée :", err);
    res.status(500).json({
        status: 500,
        message: "Something went wrong",
        error: err.message
    });
}

export default errorHandler;