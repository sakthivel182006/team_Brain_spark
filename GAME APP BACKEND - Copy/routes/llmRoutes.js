const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateResponse,
  getChatHistory,
  getChatById,
  deleteChat,
  clearAllChats
} = require('../controllers/llmController');

// All routes are protected - require authentication
router.post('/generate', protect, generateResponse);
router.get('/history', protect, getChatHistory);
router.get('/history/:id', protect, getChatById);
router.delete('/history/:id', protect, deleteChat);
router.delete('/history', protect, clearAllChats);

module.exports = router;