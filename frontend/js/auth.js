// frontend/js/auth.js
const API_URL = 'http://localhost:4000';
const Auth = {
    async register(username, password, userType = 'User', secretKey = '') {
        try {
            const response = await fetch('http://localhost:4000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, userType, secretKey }),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error en el registro');
            }

            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    async login(username, password) {
        try {
            const response = await fetch('http://localhost:4000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en el login');
            }

            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/pages/login.html';
    },

    isAuthenticated() {
        return localStorage.getItem('user') !== null;
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken() {
        return localStorage.getItem('token');
    }
};

// Hacer Auth disponible globalmente
window.Auth = Auth;