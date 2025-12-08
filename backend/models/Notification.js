const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Bildirim başlığı gereklidir'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Bildirim mesajı gereklidir'],
    trim: true
  },
  type: {
    type: String,
    enum: ['task_approved', 'task_rejected', 'new_task', 'earning', 'withdrawal', 'system', 'info'],
    default: 'info'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  relatedCompletion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskCompletion',
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index'ler - performans için
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

// Statik metod: Kullanıcıya bildirim gönder
notificationSchema.statics.createNotification = async function(data) {
  return await this.create(data);
};

// Statik metod: Tüm kullanıcılara bildirim gönder (yeni görev vb. için)
notificationSchema.statics.createBulkNotifications = async function(userIds, notificationData) {
  const notifications = userIds.map(userId => ({
    ...notificationData,
    user: userId
  }));
  return await this.insertMany(notifications);
};

module.exports = mongoose.model('Notification', notificationSchema);

