const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  banUser,
  unbanUser,
  deleteUser,
  changeUserRole,
  getDashboardStats
} = require('../controllers/adminController');

// Tüm route'lar admin yetkisi gerektirir
router.use(protect, admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Kullanıcı yönetimi
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);
router.put('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;

