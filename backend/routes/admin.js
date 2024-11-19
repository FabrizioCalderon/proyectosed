const User = require('../models/User');
const Post = require('../models/Post');

const adminRoutes = {
    async handleGetAllUsers(req, res) {
        try {
            const users = await User.getAllUsers();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));
        } catch (error) {
            console.error('Error getting users:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    },

    async handleUpdateUserRole(req, res) {
        try {
            const userId = req.url.split('/')[3];
            const { role } = req.body;

            if (!['user', 'admin'].includes(role)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid role' }));
                return;
            }

            const success = await User.updateRole(userId, role);
            if (!success) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Role updated successfully' }));
        } catch (error) {
            console.error('Error updating user role:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    },

    async handleDeleteUser(req, res) {
        try {
            const userId = req.url.split('/')[3];
            const user = await User.findById(userId);

            if (!user) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
                return;
            }

            if (user.role === 'super_admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Cannot delete super admin' }));
                return;
            }

            const success = await User.deleteUser(userId);
            if (!success) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
                return;
            }

            res.writeHead(204);
            res.end();
        } catch (error) {
            console.error('Error deleting user:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    }
};

module.exports = adminRoutes;