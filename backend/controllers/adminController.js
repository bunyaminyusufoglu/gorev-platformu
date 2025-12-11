const User = require('../models/User');
const Task = require('../models/Task');
const TaskCompletion = require('../models/TaskCompletion');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// ==================== KULLANICI YÖNETİMİ ====================

// Tüm kullanıcıları listele
exports.getAllUsers = async (req, res) => {
  try {
    const {
      search,
      role,
      isBanned,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Filtre oluştur
    const filter = {};

    // Arama (isim veya email)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Rol filtresi
    if (role) {
      filter.role = role;
    }

    // Ban durumu filtresi
    if (isBanned !== undefined) {
      filter.isBanned = isBanned === 'true';
    }

    // Sıralama
    const sortOptions = {};
    const validSortFields = ['createdAt', 'name', 'email', 'balance', 'totalEarned'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .populate('bannedBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    // İstatistikler
    const stats = {
      totalUsers: await User.countDocuments({ role: 'user' }),
      totalAdmins: await User.countDocuments({ role: 'admin' }),
      bannedUsers: await User.countDocuments({ isBanned: true }),
      activeUsers: await User.countDocuments({ role: 'user', isBanned: false })
    };

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      },
      stats,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tek kullanıcı detayları
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password')
      .populate('bannedBy', 'name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Kullanıcının istatistikleri
    const completedTasks = await TaskCompletion.countDocuments({ 
      user: id, 
      status: 'approved' 
    });

    const pendingTasks = await TaskCompletion.countDocuments({ 
      user: id, 
      status: 'pending' 
    });

    const rejectedTasks = await TaskCompletion.countDocuments({ 
      user: id, 
      status: 'rejected' 
    });

    const totalWithdrawals = await Transaction.aggregate([
      { 
        $match: { 
          user: user._id, 
          type: 'withdrawal', 
          status: 'completed' 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: { $abs: '$amount' } },
          count: { $sum: 1 }
        } 
      }
    ]);

    // Son işlemler
    const recentTransactions = await Transaction.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Son görev tamamlamaları
    const recentCompletions = await TaskCompletion.find({ user: id })
      .populate('task', 'title reward')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          completedTasks,
          pendingTasks,
          rejectedTasks,
          totalWithdrawals: totalWithdrawals[0]?.total || 0,
          withdrawalCount: totalWithdrawals[0]?.count || 0
        },
        recentTransactions,
        recentCompletions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcı yasakla
exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.userId;

    // Kendini yasaklayamaz
    if (id === adminId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Kendinizi yasaklayamazsınız'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Admin'i yasaklayamaz
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin kullanıcılar yasaklanamaz'
      });
    }

    if (user.isBanned) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcı zaten yasaklı'
      });
    }

    // Kullanıcıyı yasakla
    user.isBanned = true;
    user.banReason = reason || 'Belirtilmedi';
    user.bannedAt = new Date();
    user.bannedBy = adminId;
    await user.save();

    // Kullanıcıya bildirim gönder
    await Notification.createNotification({
      user: id,
      title: '⛔ Hesabınız Yasaklandı',
      message: `Hesabınız yasaklandı. Sebep: ${reason || 'Belirtilmedi'}`,
      type: 'system'
    });

    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla yasaklandı',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        isBanned: user.isBanned,
        banReason: user.banReason,
        bannedAt: user.bannedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı yasaklanırken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcı yasağını kaldır
exports.unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    if (!user.isBanned) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcı zaten yasaklı değil'
      });
    }

    // Yasağı kaldır
    user.isBanned = false;
    user.banReason = null;
    user.bannedAt = null;
    user.bannedBy = null;
    await user.save();

    // Kullanıcıya bildirim gönder
    await Notification.createNotification({
      user: id,
      title: '✅ Yasağınız Kaldırıldı',
      message: 'Hesabınızdaki yasak kaldırıldı. Artık platformu kullanabilirsiniz.',
      type: 'system'
    });

    res.status(200).json({
      success: true,
      message: 'Kullanıcı yasağı başarıyla kaldırıldı',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        isBanned: user.isBanned
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Yasak kaldırılırken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcı sil
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;

    // Kendini silemez
    if (id === adminId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Kendinizi silemezsiniz'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Admin silemez
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin kullanıcılar silinemez'
      });
    }

    // Kullanıcının verilerini sil
    await TaskCompletion.deleteMany({ user: id });
    await Transaction.deleteMany({ user: id });
    await Notification.deleteMany({ user: id });
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı ve tüm verileri başarıyla silindi',
      data: {
        deletedUser: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinirken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcı rolünü değiştir
exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user.userId;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir rol belirtiniz (admin veya user)'
      });
    }

    // Kendisinin rolünü değiştiremez
    if (id === adminId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Kendi rolünüzü değiştiremezsiniz'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Kullanıcı rolü ${oldRole} -> ${role} olarak değiştirildi`,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        oldRole,
        newRole: role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Rol değiştirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// ==================== DASHBOARD İSTATİSTİKLERİ ====================

// Genel platform istatistikleri
exports.getDashboardStats = async (req, res) => {
  try {
    // Genel sayılar
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalTasks = await Task.countDocuments();
    const activeTasks = await Task.countDocuments({ isActive: true });

    // Görev tamamlama istatistikleri
    const completionStats = await TaskCompletion.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const completions = {
      pending: 0,
      approved: 0,
      rejected: 0
    };
    completionStats.forEach(stat => {
      completions[stat._id] = stat.count;
    });

    // Toplam dağıtılan ödül
    const totalRewards = await Transaction.aggregate([
      { $match: { type: 'earning', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Toplam çekilen para
    const totalWithdrawals = await Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
    ]);

    // Bekleyen çekim talepleri
    const pendingWithdrawals = await Transaction.countDocuments({
      type: 'withdrawal',
      status: 'pending'
    });

    // Son 7 gün kayıt olan kullanıcılar
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: weekAgo }
    });

    // Son 30 gün istatistikleri
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const monthlyEarnings = await Transaction.aggregate([
      { 
        $match: { 
          type: 'earning', 
          status: 'completed',
          createdAt: { $gte: monthAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyCompletions = await TaskCompletion.countDocuments({
      status: 'approved',
      reviewedAt: { $gte: monthAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          banned: bannedUsers,
          newThisWeek: newUsersThisWeek
        },
        tasks: {
          total: totalTasks,
          active: activeTasks,
          inactive: totalTasks - activeTasks
        },
        completions: {
          pending: completions.pending,
          approved: completions.approved,
          rejected: completions.rejected,
          total: completions.pending + completions.approved + completions.rejected
        },
        financial: {
          totalRewardsDistributed: totalRewards[0]?.total || 0,
          totalWithdrawals: totalWithdrawals[0]?.total || 0,
          pendingWithdrawals
        },
        monthly: {
          earnings: monthlyEarnings[0]?.total || 0,
          completedTasks: monthlyCompletions
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İstatistikler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

