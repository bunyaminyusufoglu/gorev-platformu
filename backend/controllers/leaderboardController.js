const User = require('../models/User');
const TaskCompletion = require('../models/TaskCompletion');

// Genel liderlik tablosu (toplam kazanç)
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const leaderboard = await User.find({ role: 'user' })
      .select('name totalEarned createdAt')
      .sort({ totalEarned: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({ role: 'user' });

    // Sıralama numarası ekle
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: skip + index + 1,
      _id: user._id,
      name: user.name,
      totalEarned: user.totalEarned,
      memberSince: user.createdAt
    }));

    res.status(200).json({
      success: true,
      data: rankedLeaderboard,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Liderlik tablosu getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Haftalık liderlik tablosu
exports.getWeeklyLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Son 7 günün başlangıcı
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const weeklyLeaders = await TaskCompletion.aggregate([
      {
        $match: {
          status: 'approved',
          reviewedAt: { $gte: weekAgo }
        }
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'task',
          foreignField: '_id',
          as: 'taskDetails'
        }
      },
      { $unwind: '$taskDetails' },
      {
        $group: {
          _id: '$user',
          weeklyEarnings: { $sum: '$taskDetails.reward' },
          completedTasks: { $sum: 1 }
        }
      },
      { $sort: { weeklyEarnings: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          name: '$userDetails.name',
          weeklyEarnings: 1,
          completedTasks: 1
        }
      }
    ]);

    // Sıralama numarası ekle
    const rankedLeaderboard = weeklyLeaders.map((user, index) => ({
      rank: index + 1,
      ...user
    }));

    res.status(200).json({
      success: true,
      period: 'weekly',
      startDate: weekAgo,
      data: rankedLeaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Haftalık liderlik tablosu getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Aylık liderlik tablosu
exports.getMonthlyLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Bu ayın başlangıcı
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyLeaders = await TaskCompletion.aggregate([
      {
        $match: {
          status: 'approved',
          reviewedAt: { $gte: monthStart }
        }
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'task',
          foreignField: '_id',
          as: 'taskDetails'
        }
      },
      { $unwind: '$taskDetails' },
      {
        $group: {
          _id: '$user',
          monthlyEarnings: { $sum: '$taskDetails.reward' },
          completedTasks: { $sum: 1 }
        }
      },
      { $sort: { monthlyEarnings: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          name: '$userDetails.name',
          monthlyEarnings: 1,
          completedTasks: 1
        }
      }
    ]);

    // Sıralama numarası ekle
    const rankedLeaderboard = monthlyLeaders.map((user, index) => ({
      rank: index + 1,
      ...user
    }));

    res.status(200).json({
      success: true,
      period: 'monthly',
      startDate: monthStart,
      data: rankedLeaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Aylık liderlik tablosu getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcının kendi sıralamasını getir
exports.getMyRank = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('name totalEarned');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Kullanıcıdan daha fazla kazanmış kişi sayısı
    const higherRankedCount = await User.countDocuments({
      role: 'user',
      totalEarned: { $gt: user.totalEarned }
    });

    const rank = higherRankedCount + 1;
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Haftalık kazanç
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyStats = await TaskCompletion.aggregate([
      {
        $match: {
          user: user._id,
          status: 'approved',
          reviewedAt: { $gte: weekAgo }
        }
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'task',
          foreignField: '_id',
          as: 'taskDetails'
        }
      },
      { $unwind: '$taskDetails' },
      {
        $group: {
          _id: null,
          weeklyEarnings: { $sum: '$taskDetails.reward' },
          completedTasks: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        rank,
        totalUsers,
        percentile: Math.round((1 - (rank - 1) / totalUsers) * 100),
        name: user.name,
        totalEarned: user.totalEarned,
        weeklyStats: weeklyStats[0] || { weeklyEarnings: 0, completedTasks: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sıralama bilgisi getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

