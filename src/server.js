// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongodb = require('mongodb');

// Configuración básica
const PORT = process.env.PORT || 4000;
const MONGO_URL = 'mongodb://localhost:27017/blogdb';

// Conexión MongoDB sin usar ODM
let db;
mongodb.MongoClient.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(client => {
    db = client.db();
    console.log('Conectado a MongoDB');
}).catch(err => {
    console.error('Error conectando a MongoDB:', err);
});

// Middleware CORS y manejo de cookies
const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
};

// Función para hash de contraseñas
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { salt, hash };
};

// Función para verificar contraseñas
const verifyPassword = (password, hash, salt) => {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
};

// Middleware de autenticación
const authenticateToken = (req) => {
    const token = req.headers.cookie?.split(';')
        .find(c => c.trim().startsWith('token='))?.split('=')[1];
    
    if (!token) return null;
    
    try {
        const decoded = crypto.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        return null;
    }
};

const server = http.createServer(async (req, res) => {
    // Manejo CORS
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    // Opciones preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Parse body
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    await new Promise((resolve) => {
        req.on('end', resolve);
    });

    try {
        if (body) {
            req.body = JSON.parse(body);
        }
    } catch (e) {
        req.body = {};
    }

    // Rutas principales
    const router = {
        // Autenticación
        'POST/register': async () => {
            const { username, password, userType, secretKey } = req.body;
            
            // Validación de datos
            if (!username || !password) {
                res.writeHead(400);
                return { error: 'Faltan campos requeridos' };
            }

            // Verificar clave secreta para admin
            if (userType === 'Admin' && secretKey !== process.env.ADMIN_SECRET) {
                res.writeHead(403);
                return { error: 'Clave secreta inválida' };
            }

            const { salt, hash } = hashPassword(password);
            
            try {
                await db.collection('users').insertOne({
                    username,
                    hash,
                    salt,
                    userType: userType || 'User'
                });
                
                res.writeHead(201);
                return { message: 'Usuario registrado exitosamente' };
            } catch (err) {
                res.writeHead(500);
                return { error: 'Error al registrar usuario' };
            }
        },

        'POST/login': async () => {
            const { username, password } = req.body;

            const user = await db.collection('users').findOne({ username });
            
            if (!user || !verifyPassword(password, user.hash, user.salt)) {
                res.writeHead(401);
                return { error: 'Credenciales inválidas' };
            }

            const token = crypto.sign(
                { userId: user._id, userType: user.userType },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/`);
            
            return {
                user: {
                    id: user._id,
                    username: user.username,
                    userType: user.userType
                }
            };
        }
    };

    const handler = router[`${req.method}${req.url}`];
    
    if (handler) {
        const result = await handler();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
    }
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});