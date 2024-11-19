const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'blogSED';

let db = null;

async function connectDB() {
    try {
        const client = await MongoClient.connect(url);
        db = client.db(dbName);
        console.log('Connected to MongoDB');
        
        // Crear índices necesarios
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
        await db.collection('posts').createIndex({ title: 'text', content: 'text' });
        
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
}

module.exports = {
    connectDB,
    getDB
};