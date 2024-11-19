const encryption = require('../utils/encryption');

const auth = {
    authenticate(req, res, next) {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No token provided' }));
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = encryption.verifyToken(token);

        if (!decoded) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid token' }));
            return;
        }

        req.user = decoded;
        next();
    },

    checkRole(roles) {
        return (req, res, next) => {
            if (!req.user) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No user found' }));
                return;
            }

            if (!roles.includes(req.user.role)) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Insufficient permissions' }));
                return;
            }

            next();
        };
    }
};

module.exports = auth;