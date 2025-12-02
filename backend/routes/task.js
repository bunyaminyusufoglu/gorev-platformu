const express = require('express');
const router = express.Router();
const {
  getTasks,
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
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

module.exports = router;

