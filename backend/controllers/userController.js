// controllers/adminController.js
class AdminController {
    constructor(db) {
        this.db = db;
    }

    async getAllUsers(req, res) {
        try {
            const users = await this.db.collection('users')
                .find({}, { projection: { password: 0 } })
                .toArray();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener usuarios' });
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            await this.db.collection('users').deleteOne({ _id: new ObjectId(id) });
            res.json({ message: 'Usuario eliminado' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar usuario' });
        }
    }

    async getStats(req, res) {
        try {
            const stats = {
                users: await this.db.collection('users').countDocuments(),
                posts: await this.db.collection('posts').countDocuments()
            };
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
    }
}

module.exports = AdminController;