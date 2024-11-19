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

// Mapa de tipos MIME
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// Middleware para servir archivos estáticos
const serveStaticFile = (filePath, res) => {
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Internal server error');
            }
        } else {
            const ext = path.extname(filePath);
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
};

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
    'Access-Control-Allow-Origin': '*', // Cambiado para desarrollo
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
        // Servir archivo index.html en la ruta raíz
        if (pathname === '/' || pathname === '/index.html') {
            return serveStaticFile(path.join(__dirname, '../frontend/index.html'), res);
        }

        // Servir archivos estáticos
        if (pathname.match(/\.(html|css|js|png|jpg|gif|svg|ico)$/)) {
            const filePath = path.join(__dirname, '../frontend', pathname);
            return serveStaticFile(filePath, res);
        }

        // API Routes
        if (pathname.startsWith('/api/')) {
            const apiPath = pathname.replace('/api', '');

            // Rutas públicas
            if (apiPath === '/register' && req.method === 'POST') {
                req.body = await jsonBodyParser(req);
                return authRoutes.handleRegister(req, res);
            }
            
            if (apiPath === '/login' && req.method === 'POST') {
                req.body = await jsonBodyParser(req);
                return authRoutes.handleLogin(req, res);
            }

            if (apiPath === '/posts/search' && req.method === 'GET') {
                return postRoutes.handleSearchPosts(req, res);
            }

            if (apiPath === '/posts' && req.method === 'GET') {
                return postRoutes.handleGetAllPosts(req, res);
            }

            // Rutas protegidas
            auth.authenticate(req, res, async () => {
                if (apiPath === '/posts' && req.method === 'POST') {
                    return postRoutes.handleCreatePost(req, res);
                }
                
                if (apiPath.match(/^\/posts\/\d+$/) && req.method === 'PUT') {
                    return postRoutes.handleUpdatePost(req, res);
                }
                
                if (apiPath.match(/^\/posts\/\d+$/) && req.method === 'DELETE') {
                    return postRoutes.handleDeletePost(req, res);
                }

                // Rutas de administración
                if (apiPath.startsWith('/admin')) {
                    auth.checkRole(['admin', 'super_admin'])(req, res, async () => {
                        if (apiPath === '/admin/users' && req.method === 'GET') {
                            return adminRoutes.handleGetAllUsers(req, res);
                        }
                        
                        if (apiPath.match(/^\/admin\/users\/\d+\/role$/) && req.method === 'PUT') {
                            req.body = await jsonBodyParser(req);
                            return adminRoutes.handleUpdateUserRole(req, res);
                        }
                        
                        if (apiPath.match(/^\/admin\/users\/\d+$/) && req.method === 'DELETE') {
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
        }

        // Si no coincide con ninguna ruta anterior, servir index.html
        const filePath = path.join(__dirname, '../frontend/index.html');
        return serveStaticFile(filePath, res);

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