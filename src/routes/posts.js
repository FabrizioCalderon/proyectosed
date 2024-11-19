// routes/posts.js
const express = require('express');
const router = express.Router();
const PostController = require('../controllers/postController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

module.exports = (db) => {
    const postController = new PostController(db);

    router.get('/', postController.getAllPosts);
    router.get('/search', postController.searchPosts);
    router.post('/', authMiddleware, upload.single('file'), postController.createPost);
    router.delete('/:id', authMiddleware, postController.deletePost);

    return router;
};