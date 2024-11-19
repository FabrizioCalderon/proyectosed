// controllers/postController.js
const { ObjectId } = require('mongodb');
const path = require('path');

class PostController {
    constructor(db) {
        this.db = db;
    }

    async getAllPosts(req, res) {
        try {
            const posts = await this.db.collection('posts')
                .find()
                .sort({ createdAt: -1 })
                .toArray();

            res.json(posts);
        } catch (error) {
            console.error('Error al obtener posts:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async createPost(req, res) {
        try {
            const { title, content } = req.body;
            const file = req.file;
            const user = req.user;

            if (!file) {
                return res.status(400).json({ error: 'Se requiere una imagen' });
            }

            const post = await this.db.collection('posts').insertOne({
                title,
                content,
                cover: `/uploads/${file.filename}`,
                authorId: new ObjectId(user.userId),
                authorName: user.username,
                createdAt: new Date()
            });

            res.status(201).json({ 
                message: 'Post creado exitosamente',
                postId: post.insertedId 
            });
        } catch (error) {
            console.error('Error al crear post:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async deletePost(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;

            const post = await this.db.collection('posts').findOne({
                _id: new ObjectId(id)
            });

            if (!post) {
                return res.status(404).json({ error: 'Post no encontrado' });
            }

            if (post.authorId.toString() !== user.userId && user.userType !== 'Admin') {
                return res.status(403).json({ error: 'No autorizado' });
            }

            await this.db.collection('posts').deleteOne({
                _id: new ObjectId(id)
            });

            res.json({ message: 'Post eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar post:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async searchPosts(req, res) {
        try {
            const { q } = req.query;
            
            const posts = await this.db.collection('posts')
                .find({
                    $or: [
                        { title: { $regex: q, $options: 'i' } },
                        { content: { $regex: q, $options: 'i' } }
                    ]
                })
                .sort({ createdAt: -1 })
                .toArray();

            res.json(posts);
        } catch (error) {
            console.error('Error en búsqueda:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

module.exports = PostController;