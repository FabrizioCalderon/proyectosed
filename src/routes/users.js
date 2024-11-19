// routes/admin.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

module.exports = (db) => {
    const adminController = new AdminController(db);

    router.use(authMiddleware, adminMiddleware);

    router.get('/users', adminController.getAllUsers);
    router.delete('/users/:id', adminController.deleteUser);
    router.get('/stats', adminController.getStats);

    return router;
};