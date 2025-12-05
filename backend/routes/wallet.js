const express = require('express');
const router = express.Router();
const {
  getBalance,
  getTransactions,
  getAllTransactions,
  adjustBalance,
  getWalletSummary
} = require('../controllers/walletController');
const { protect, admin } = require('../middleware/auth');

// Kullanıcı routes (giriş gerektirir)
router.get('/balance', protect, getBalance);
router.get('/transactions', protect, getTransactions);
router.get('/summary', protect, getWalletSummary);

// Admin routes
router.get('/admin/transactions', protect, admin, getAllTransactions);
router.post('/admin/adjust', protect, admin, adjustBalance);

module.exports = router;

