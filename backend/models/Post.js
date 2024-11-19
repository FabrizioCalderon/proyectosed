const { getDB } = require('../config/database');

const Post = {
    async create(postData) {
        const db = getDB();
        const { title, content, summary, cover_image, author_id } = postData;
        
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO posts (title, content, summary, cover_image, author_id) 
                 VALUES (?, ?, ?, ?, ?)`,
                [title, content, summary, cover_image, author_id],
                function(err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({ id: this.lastID, ...postData });
                }
            );
        });
    },

    async getAll() {
        const db = getDB();
        
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT posts.*, users.username as author_name 
                 FROM posts 
                 JOIN users ON posts.author_id = users.id 
                 ORDER BY created_at DESC`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    async getById(id) {
        const db = getDB();
        
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT posts.*, users.username as author_name 
                 FROM posts 
                 JOIN users ON posts.author_id = users.id 
                 WHERE posts.id = ?`,
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },

    async update(id, postData) {
        const db = getDB();
        const { title, content, summary, cover_image } = postData;
        
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE posts 
                 SET title = ?, content = ?, summary = ?, 
                     cover_image = COALESCE(?, cover_image), 
                     updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [title, content, summary, cover_image, id],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes > 0);
                }
            );
        });
    },

    async delete(id) {
        const db = getDB();
        
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM posts WHERE id = ?',
                [id],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes > 0);
                }
            );
        });
    },

    async search(query) {
        const db = getDB();
        const searchTerm = `%${query}%`;
        
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT posts.*, users.username as author_name 
                 FROM posts 
                 JOIN users ON posts.author_id = users.id 
                 WHERE title LIKE ? OR content LIKE ? OR summary LIKE ?
                 ORDER BY created_at DESC`,
                [searchTerm, searchTerm, searchTerm],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    async getByAuthor(authorId) {
        const db = getDB();
        
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT posts.*, users.username as author_name 
                 FROM posts 
                 JOIN users ON posts.author_id = users.id 
                 WHERE author_id = ?
                 ORDER BY created_at DESC`,
                [authorId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
};

module.exports = Post;