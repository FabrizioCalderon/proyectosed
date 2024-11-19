const http = require('http');
const { parse: parseUrl } = require('url');
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const adminRoutes = require('./routes/admin');
const auth = require('./middlewares/auth');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 4000;

// Middleware para procesar JSON
const jsonBodyParser = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            if (body) {
                try {
                    resolve(JSON.parse(body));
                } catch (error) {
                    reject(error);
                }
            } else {
                resolve({});
            }
        });
    });
};

// Configuración CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:5500',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
};

const server = http.createServer(async (req, res) => {
    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }

    // Añadir headers CORS a todas las respuestas
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    const parsedUrl = parseUrl(req.url, true);
    const pathname = parsedUrl.pathname;

    try {
        // Rutas públicas
        if (pathname === '/register' && req.method === 'POST') {
            req.body = await jsonBodyParser(req);
            return authRoutes.handleRegister(req, res);
        }
        
        if (pathname === '/login' && req.method === 'POST') {
            req.body = await jsonBodyParser(req);
            return authRoutes.handleLogin(req, res);
        }

        // Ruta para búsqueda pública de posts
        if (pathname === '/posts/search' && req.method === 'GET') {
            return postRoutes.handleSearchPosts(req, res);
        }

        if (pathname === '/posts' && req.method === 'GET') {
            return postRoutes.handleGetAllPosts(req, res);
        }

        // Servir archivos estáticos de uploads
        if (pathname.startsWith('/uploads/') && req.method === 'GET') {
            const filePath = path.join(__dirname, pathname);
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('File not found');
                    return;
                }

                const ext = path.extname(filePath);
                const contentType = {
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.gif': 'image/gif'
                }[ext] || 'application/octet-stream';

                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            });
            return;
        }

        // Rutas protegidas - Verificar autenticación
        auth.authenticate(req, res, async () => {
            // Rutas de posts
            if (pathname === '/posts' && req.method === 'POST') {
                return postRoutes.handleCreatePost(req, res);
            }
            
            if (pathname.match(/^\/posts\/\d+$/) && req.method === 'PUT') {
                return postRoutes.handleUpdatePost(req, res);
            }
            
            if (pathname.match(/^\/posts\/\d+$/) && req.method === 'DELETE') {
                return postRoutes.handleDeletePost(req, res);
            }

            // Rutas de administración - Verificar rol de admin
            if (pathname.startsWith('/admin')) {
                auth.checkRole(['admin', 'super_admin'])(req, res, async () => {
                    if (pathname === '/admin/users' && req.method === 'GET') {
                        return adminRoutes.handleGetAllUsers(req, res);
                    }
                    
                    if (pathname.match(/^\/admin\/users\/\d+\/role$/) && req.method === 'PUT') {
                        req.body = await jsonBodyParser(req);
                        return adminRoutes.handleUpdateUserRole(req, res);
                    }
                    
                    if (pathname.match(/^\/admin\/users\/\d+$/) && req.method === 'DELETE') {
                        return adminRoutes.handleDeleteUser(req, res);
                    }

                    res.writeHead(404);
                    res.end('Not found');
                });
                return;
            }

            res.writeHead(404);
            res.end('Not found');
        });
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
});

// Conectar a la base de datos antes de iniciar el servidor
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
});

module.exports = server;