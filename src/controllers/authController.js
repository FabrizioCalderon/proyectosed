// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {
    constructor(db) {
        this.db = db;
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
    }

    async register(req, res) {
        try {
            const { username, password, userType, secretKey } = req.body;

            // Validaciones
            if (!username || username.length < 3 || username.length > 10) {
                return res.status(400).json({ error: 'Username inválido' });
            }

            if (userType === 'Admin' && secretKey !== process.env.ADMIN_SECRET_KEY) {
                return res.status(403).json({ error: 'Clave secreta incorrecta' });
            }

            // Verificar usuario existente
            const existingUser = await this.db.collection('users').findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: 'Usuario ya existe' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Crear usuario
            await this.db.collection('users').insertOne({
                username,
                password: hashedPassword,
                userType: userType || 'User',
                createdAt: new Date()
            });

            res.status(201).json({ message: 'Usuario registrado exitosamente' });
        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;

            const user = await this.db.collection('users').findOne({ username });
            if (!user) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const token = jwt.sign(
                { userId: user._id, username: user.username, userType: user.userType },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 24 horas
            });

            res.json({
                user: {
                    username: user.username,
                    userType: user.userType
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = AuthController;