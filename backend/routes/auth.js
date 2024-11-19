const User = require('../models/User');
const encryption = require('../utils/encryption');

const authRoutes = {
    async handleLogin(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Username and password are required' }));
                return;
            }

            const user = await User.findByUsername(username);
            if (!user) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid credentials' }));
                return;
            }

            const isValidPassword = await encryption.comparePasswords(password, user.password);
            if (!isValidPassword) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid credentials' }));
                return;
            }

            const token = encryption.generateToken(user);
            const userData = {
                id: user.id,
                username: user.username,
                role: user.role
            };

            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=86400`
            });
            res.end(JSON.stringify({ user: userData, token }));
        } catch (error) {
            console.error('Login error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    },

    async handleRegister(req, res) {
        try {
            const { username, password, userType, secretKey } = req.body;

            // Validaciones básicas
            if (!username || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Username and password are required' }));
                return;
            }

            // Validar contraseña
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Password does not meet requirements' }));
                return;
            }

            // Verificar si el usuario ya existe
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Username already exists' }));
                return;
            }

            // Verificar clave secreta para roles privilegiados
            if ((userType === 'admin' || userType === 'super_admin') && secretKey !== process.env.ADMIN_SECRET_KEY) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid secret key' }));
                return;
            }

            const user = await User.create({ username, password, role: userType });
            const token = encryption.generateToken(user);

            res.writeHead(201, { 
                'Content-Type': 'application/json',
                'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=86400`
            });
            res.end(JSON.stringify({ user, token }));
        } catch (error) {
            console.error('Registration error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    }
};

module.exports = authRoutes;