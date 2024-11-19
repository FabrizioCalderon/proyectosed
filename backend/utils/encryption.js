const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro';
const SALT_ROUNDS = 10;

const encryption = {
    async hashPassword(password) {
        return await bcrypt.hash(password, SALT_ROUNDS);
    },

    async comparePasswords(password, hash) {
        return await bcrypt.compare(password, hash);
    },

    generateToken(user) {
        const payload = {
            userId: user.id,
            username: user.username,
            role: user.role
        };
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    },

    verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    }
};

module.exports = encryption;