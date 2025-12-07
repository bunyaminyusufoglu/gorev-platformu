const express = require('express');
const router = express.Router();
const {
  getBalance,
  getTransactions,
  getAllTransactions,
  adjustBalance,
  getWalletSummary,
  requestWithdrawal,
  getWithdrawalRequests,
  getAllWithdrawalRequests,
  approveWithdrawal,
  rejectWithdrawal
} = require('../controllers/walletController');
const { protect, admin } = require('../middleware/auth');

// Kullanıcı routes (giriş gerektirir)
router.get('/balance', protect, getBalance);
router.get('/transactions', protect, getTransactions);
router.get('/summary', protect, getWalletSummary);

// Para çekme routes (kullanıcı)
router.post('/withdraw', protect, requestWithdrawal);
router.get('/withdrawals', protect, getWithdrawalRequests);

// Admin routes
router.get('/admin/transactions', protect, admin, getAllTransactions);
router.post('/admin/adjust', protect, admin, adjustBalance);
router.get('/admin/withdrawals', protect, admin, getAllWithdrawalRequests);
router.put('/admin/withdrawals/:transactionId/approve', protect, admin, approveWithdrawal);
router.put('/admin/withdrawals/:transactionId/reject', protect, admin, rejectWithdrawal);

module.exports = router;

