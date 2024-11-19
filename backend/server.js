const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse: parseUrl } = require('url');
const { parse: parseQuery } = require('querystring');
const { connectDB } = require('./config/database');
const authMiddleware = require('./middlewares/auth');
const multerMiddleware = require('./middlewares/multer');

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

    const parsedUrl = parseUrl(req.url);
    const pathname = parsedUrl.pathname;
    
    try {
        // Rutas de autenticación
        if (pathname === '/register' && req.method === 'POST') {
            const body = await jsonBodyParser(req);
            // Manejar registro
        }
        else if (pathname === '/login' && req.method === 'POST') {
            const body = await jsonBodyParser(req);
            // Manejar login
        }
        
        // Rutas de posts
        else if (pathname === '/posts' && req.method === 'GET') {
            // Obtener posts
        }
        else if (pathname === '/posts' && req.method === 'POST') {
            // Crear post
        }
        else if (pathname.startsWith('/posts/') && req.method === 'PUT') {
            // Actualizar post
        }
        else if (pathname.startsWith('/posts/') && req.method === 'DELETE') {
            // Eliminar post
        }
        
        // Ruta para imágenes
        else if (pathname.startsWith('/uploads/') && req.method === 'GET') {
            const imagePath = path.join(__dirname, pathname);
            fs.readFile(imagePath, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Not found');
                    return;
                }
                const ext = path.extname(imagePath);
                const contentType = {
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.gif': 'image/gif'
                }[ext] || 'application/octet-stream';
                
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            });
        }
        
        else {
            res.writeHead(404);
            res.end('Not found');
        }
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