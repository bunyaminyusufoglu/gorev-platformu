const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendBroadcastNotification,
  sendNotificationToUser
} = require('../controllers/notificationController');

// Kullanıcı route'ları (giriş yapmış kullanıcı)
router.get('/', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/mark-all-read', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);
router.delete('/', protect, deleteAllNotifications);

// Admin route'ları
router.post('/broadcast', protect, admin, sendBroadcastNotification);
router.post('/send', protect, admin, sendNotificationToUser);

module.exports = router;

