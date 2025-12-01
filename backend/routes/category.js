const express = require('express');
const router = express.Router();
const {
  getCategories,
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

// Public routes (herkes görebilir)
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin routes
router.get('/admin/all', protect, admin, getAllCategories);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;

