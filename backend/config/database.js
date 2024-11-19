const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
let db = null;

function connectDB() {
    return new Promise((resolve, reject) => {
        try {
            db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Conectado a la base de datos SQLite');
                    resolve(db);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

function getDB() {
    if (!db) {
        throw new Error('Base de datos no inicializada');
    }
    return db;
}

module.exports = {
    connectDB,
    getDB
};