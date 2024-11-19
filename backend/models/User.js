const { getDB } = require('../config/database');
const encryption = require('../utils/encryption');

const User = {
    async create(userData) {
        const db = getDB();
        const { username, password, role = 'user' } = userData;
        
        return new Promise(async (resolve, reject) => {
            try {
                const hashedPassword = await encryption.hashPassword(password);
                
                db.run(
                    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                    [username, hashedPassword, role],
                    function(err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve({ id: this.lastID, username, role });
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    },

    async findByUsername(username) {
        const db = getDB();
        
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE username = ?',
                [username],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },

    async findById(id) {
        const db = getDB();
        
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT id, username, role FROM users WHERE id = ?',
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },

    async getAllUsers() {
        const db = getDB();
        
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT id, username, role, created_at FROM users',
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    async deleteUser(id) {
        const db = getDB();
        
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM users WHERE id = ?',
                [id],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes > 0);
                }
            );
        });
    },

    async updateRole(id, newRole) {
        const db = getDB();
        
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET role = ? WHERE id = ?',
                [newRole, id],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes > 0);
                }
            );
        });
    }
};

module.exports = User;