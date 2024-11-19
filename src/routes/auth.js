// routes/auth.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

module.exports = (db) => {
    const authController = new AuthController(db);

    router.post('/register', authController.register);
    router.post('/login', authController.login);

    return router;
};