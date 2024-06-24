// check if user is admin before being able to access certain routes
module.exports = function checkAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.idRole === 2) {
        return next();
    }
    res.status(403).send('Accès refusé. Vous n\'êtes pas autorisé à accéder à cette ressource.');
};

