const Notification = require('../models/Notification');

// Kullanıcının bildirimlerini getir
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const filter = { user: userId };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('relatedTask', 'title reward')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bildirimler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Okunmamış bildirim sayısını getir
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bildirim sayısı getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tek bildirimi okundu olarak işaretle
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bildirim güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tüm bildirimleri okundu olarak işaretle
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bildirimler güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Bildirimi sil
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bildirim silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bildirim silinirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tüm bildirimleri sil
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await Notification.deleteMany({ user: userId });

    res.status(200).json({
      success: true,
      message: 'Tüm bildirimler silindi',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bildirimler silinirken bir hata oluştu',
      error: error.message
    });
  }
};

// Admin: Tüm kullanıcılara bildirim gönder
exports.sendBroadcastNotification = async (req, res) => {
  try {
    const { title, message, type = 'system' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Başlık ve mesaj gereklidir'
      });
    }

    // Tüm kullanıcıları getir
    const User = require('../models/User');
    const users = await User.find({ role: 'user' }).select('_id');
    const userIds = users.map(u => u._id);

    if (userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Gönderilecek kullanıcı bulunamadı'
      });
    }

    await Notification.createBulkNotifications(userIds, {
      title,
      message,
      type
    });

    res.status(201).json({
      success: true,
      message: `${userIds.length} kullanıcıya bildirim gönderildi`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bildirim gönderilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Admin: Belirli bir kullanıcıya bildirim gönder
exports.sendNotificationToUser = async (req, res) => {
  try {
    const { userId, title, message, type = 'info' } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID, başlık ve mesaj gereklidir'
      });
    }

    const notification = await Notification.createNotification({
      user: userId,
      title,
      message,
      type
    });

    res.status(201).json({
      success: true,
      message: 'Bildirim gönderildi',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bildirim gönderilirken bir hata oluştu',
      error: error.message
    });
  }
};

