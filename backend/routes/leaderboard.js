const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getLeaderboard,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
  getMyRank
} = require('../controllers/leaderboardController');

// Public routes - Herkes görebilir
router.get('/', getLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);
router.get('/monthly', getMonthlyLeaderboard);

// Protected route - Kendi sıralamasını görmek için giriş gerekli
router.get('/my-rank', protect, getMyRank);

module.exports = router;

