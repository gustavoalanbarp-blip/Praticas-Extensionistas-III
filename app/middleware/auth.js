module.exports = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Não autenticado. Faça login para continuar.' });
    }
    next();
};
