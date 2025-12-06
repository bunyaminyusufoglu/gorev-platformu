const express = require('express');
const router = express.Router();
const {
  completeTask,
  getMyCompletions,
  getAllCompletions,
  reviewCompletion
} = require('../controllers/taskCompletionController');
const { protect, admin } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');

// Kullanıcı routes
// POST / - Görev tamamlama (resim kanıtı ile birlikte)
// Form-data olarak gönderilmeli:
// - taskId: Görev ID
// - proof: Metin açıklaması (opsiyonel)
// - proofImages: Resim dosyaları (maksimum 5 adet, her biri maksimum 5MB)
router.post('/', protect, uploadMultiple, handleUploadError, completeTask);
router.get('/my', protect, getMyCompletions);

// Admin routes
router.get('/admin/all', protect, admin, getAllCompletions);
router.put('/admin/review/:id', protect, admin, reviewCompletion);

module.exports = router;

