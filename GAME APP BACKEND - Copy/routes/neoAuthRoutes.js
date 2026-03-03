const express = require('express');
const router = express.Router();
const authController = require('../controllers/neoAuthController');
const authMiddleware = require('../middleware/neoAuth');

// Public routes
router.post('/auth', authController.login);
router.post('/register', authController.register);

// Protected route (needs token)
router.get('/account', authMiddleware.authenticateToken, authController.getAccount);

module.exports = router;