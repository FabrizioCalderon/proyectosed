const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Crear tablas
db.serialize(async () => {
    // Tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('super_admin', 'admin', 'user')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de posts
    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        cover_image TEXT,
        author_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id)
    )`);

    // Crear índices
    db.run('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    db.run('CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id)');

    // Crear super admin por defecto
    const hashedPassword = await bcrypt.hash('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password, role) 
            VALUES ('admin', ?, 'super_admin')`, 
            [hashedPassword]);

    console.log('Base de datos inicializada correctamente');
});

// Cerrar la conexión
db.close((err) => {
    if (err) {
        console.error('Error al cerrar la base de datos:', err);
    } else {
        console.log('Conexión a la base de datos cerrada');
    }
});