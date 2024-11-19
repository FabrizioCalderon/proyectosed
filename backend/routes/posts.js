const Post = require('../models/Post');
const fileHandler = require('../middlewares/multer');

const postRoutes = {
    async handleGetAllPosts(req, res) {
        try {
            const posts = await Post.getAll();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(posts));
        } catch (error) {
            console.error('Error getting posts:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    },

    async handleCreatePost(req, res) {
        try {
            const { file, formData } = await fileHandler.processFileUpload(req);
            let coverImagePath = null;

            if (file && file.data.length > 0) {
                coverImagePath = await fileHandler.saveFile(file);
            }

            const postData = {
                title: formData.title,
                content: formData.content,
                summary: formData.summary,
                cover_image: coverImagePath,
                author_id: req.user.userId
            };

            const post = await Post.create(postData);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(post));
        } catch (error) {
            console.error('Error creating post:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    },

    async handleUpdatePost(req, res) {
        try {
            const postId = req.url.split('/')[2];
            const existingPost = await Post.getById(postId);

            if (!existingPost) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Post not found' }));
                return;
            }

            if (existingPost.author_id !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Unauthorized' }));
                return;
            }

            const { file, formData } = await fileHandler.processFileUpload(req);
            let coverImagePath = null;

            if (file && file.data.length > 0) {
                coverImagePath = await fileHandler.saveFile(file);
            }

            const postData = {
                title: formData.title,
                content: formData.content,
                summary: formData.summary,
                cover_image: coverImagePath
            };

            await Post.update(postId, postData);
            const updatedPost = await Post.getById(postId);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(updatedPost));
        } catch (error) {
            console.error('Error updating post:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    },

    async handleDeletePost(req, res) {
        try {
            const postId = req.url.split('/')[2];
            const existingPost = await Post.getById(postId);

            if (!existingPost) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Post not found' }));
                return;
            }

            if (existingPost.author_id !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Unauthorized' }));
                return;
            }

            await Post.delete(postId);
            res.writeHead(204);
            res.end();
        } catch (error) {
            console.error('Error deleting post:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    },

    async handleSearchPosts(req, res) {
        try {
            const query = new URL(req.url, `http://${req.headers.host}`).searchParams.get('q');
            if (!query) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Search query is required' }));
                return;
            }

            const posts = await Post.search(query);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(posts));
        } catch (error) {
            console.error('Error searching posts:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    }
};

module.exports = postRoutes;