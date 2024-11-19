// middleware/auth.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
}

function adminMiddleware(req, res, next) {
    if (req.user.userType !== 'Admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
}

module.exports = { authMiddleware, adminMiddleware };