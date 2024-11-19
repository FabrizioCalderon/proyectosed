// admin.js
async function getAllUser() {
    try {
        const response = await fetch(`http://${config.API_URL}/getAllUser`, {
            method: "GET",
            credentials: 'include'
        });
        const data = await response.json();
        renderUsers(data.data);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
    }
}

async function getAllPost() {
    try {
        const response = await fetch(`http://${config.API_URL}/getAllPosts`, {
            method: "GET",
            credentials: 'include'
        });
        const data = await response.json();
        if (Array.isArray(data)) {
            renderPosts(data);
        } else {
            console.error("La respuesta del servidor no es la esperada.");
        }
    } catch (error) {
        console.error("Error al obtener los posts:", error);
    }
}

async function deleteUser(id, username) {
    if (confirm(`¿Estás seguro de querer eliminar al usuario ${username}?`)) {
        try {
            const response = await fetch(`http://${config.API_URL}/deleteUser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify({ userid: id })
            });
            const data = await response.json();
            alert(data.data);
            getAllUser();
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
        }
    }
}

async function deletePost(id) {
    if (confirm("¿Estás seguro de eliminar este post?")) {
        try {
            const response = await fetch(`http://${config.API_URL}/deletePost`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify({ postid: id })
            });
            const data = await response.json();
            alert(data.data);
            getAllPost();
        } catch (error) {
            console.error("Error al eliminar post:", error);
        }
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.userType}</td>
            <td>${user._id}</td>
            <td>
                <i class="fas fa-trash" 
                   onclick="deleteUser('${user._id}', '${user.username}')"
                   style="cursor: pointer;"></i>
            </td>
        </tr>
    `).join('');
}

function renderPosts(posts) {
    const tbody = document.getElementById('postsTableBody');
    tbody.innerHTML = posts.map(post => `
        <tr>
            <td>${post._id}</td>
            <td>${post.authorName}</td>
            <td>${new Date(post.createdAt).toLocaleDateString()}</td>
            <td>${post.title}</td>
            <td>
                <i class="fas fa-trash" 
                   onclick="deletePost('${post._id}')"
                   style="cursor: pointer;"></i>
            </td>
        </tr>
    `).join('');
}