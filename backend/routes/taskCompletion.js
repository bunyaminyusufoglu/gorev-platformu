const express = require('express');
const router = express.Router();
const {
  completeTask,
  getMyCompletions,
  getAllCompletions,
  reviewCompletion
} = require('../controllers/taskCompletionController');
const { protect, admin } = require('../middleware/auth');

// Kullanıcı routes
router.post('/', protect, completeTask);
router.get('/my', protect, getMyCompletions);

// Admin routes
router.get('/admin/all', protect, admin, getAllCompletions);
router.put('/admin/review/:id', protect, admin, reviewCompletion);

module.exports = router;

