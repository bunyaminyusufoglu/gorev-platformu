const express = require('express');
const router = express.Router();
const {
  getTasks,
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  featureTask,
  unfeatureTask,
  updateFeature,
  getFeaturedTasks
} = require('../controllers/taskController');
const { protect, admin } = require('../middleware/auth');

// Public routes (herkes görebilir)
router.get('/', getTasks);
router.get('/:id', getTask);

// Admin routes
router.get('/admin/all', protect, admin, getAllTasks);
router.post('/', protect, admin, createTask);
router.put('/:id', protect, admin, updateTask);
router.delete('/:id', protect, admin, deleteTask);

// Öne çıkarma routes (admin)
router.get('/admin/featured', protect, admin, getFeaturedTasks);
router.put('/:id/feature', protect, admin, featureTask);
router.put('/:id/unfeature', protect, admin, unfeatureTask);
router.put('/:id/feature/update', protect, admin, updateFeature);

module.exports = router;

