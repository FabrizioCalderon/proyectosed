// js/posts.js
class Posts {
    static async getAllPosts() {
        try {
            const response = await fetch(`${API_URL}/posts`);
            const posts = await response.json();

            if (!response.ok) {
                throw new Error('Error al obtener posts');
            }

            return posts;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    static async createPost(formData) {
        try {
            const token = Auth.getToken();
            
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error al crear post');
            }

            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    static async searchPosts(query) {
        try {
            const response = await fetch(`${API_URL}/posts/search?q=${encodeURIComponent(query)}`);
            const posts = await response.json();

            if (!response.ok) {
                throw new Error('Error en la búsqueda');
            }

            return posts;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    static async deletePost(postId) {
        try {
            const token = Auth.getToken();
            
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar post');
            }

            return true;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    static async editPost(postId, formData) {
        try {
            const token = Auth.getToken();
            
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error al editar post');
            }

            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    static renderPosts(posts, container) {
        container.innerHTML = posts.map(post => `
            <article class="post-card">
                <img src="${API_URL}${post.cover}" alt="${post.title}" class="post-image">
                <div class="post-content">
                    <h2 class="post-title">${post.title}</h2>
                    <p class="post-author">Por: @${post.authorName}</p>
                    <p class="post-date">${new Date(post.createdAt).toLocaleDateString()}</p>
                    <div class="post-actions">
                        <button onclick="viewPost('${post._id}')" class="btn btn-primary">Ver</button>
                        ${post.authorId === Auth.getUser()?.userId ? `
                            <button onclick="editPost('${post._id}')" class="btn btn-secondary">Editar</button>
                            <button onclick="deletePost('${post._id}')" class="btn btn-danger">Eliminar</button>
                        ` : ''}
                    </div>
                </div>
            </article>
        `).join('');
    }
}