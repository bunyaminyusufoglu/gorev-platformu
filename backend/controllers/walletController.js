const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Kullanıcının bakiyesini getir
exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('balance totalEarned');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        balance: user.balance,
        totalEarned: user.totalEarned
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bakiye getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcının işlem geçmişini getir
exports.getTransactions = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    const filter = { user: userId };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(filter)
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İşlem geçmişi getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tüm kullanıcıların işlem geçmişi (admin)
exports.getAllTransactions = async (req, res) => {
  try {
    const { type, status, userId, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (userId) filter.user = userId;

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(filter)
      .populate('user', 'name email')
      .populate('task', 'title reward')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    // Toplam istatistikler
    const stats = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      stats,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İşlem geçmişi getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Admin: Kullanıcıya manuel bakiye ekle/çıkar
exports.adjustBalance = async (req, res) => {
  try {
    const { userId, amount, type, description } = req.body;

    if (!userId || amount === undefined || !type) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID, miktar ve işlem tipi gereklidir'
      });
    }

    if (!['bonus', 'refund'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz işlem tipi. bonus veya refund olmalı'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    const balanceBefore = user.balance;
    const newBalance = balanceBefore + amount;

    if (newBalance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Bakiye negatif olamaz'
      });
    }

    // Bakiyeyi güncelle
    user.balance = newBalance;
    if (amount > 0) {
      user.totalEarned += amount;
    }
    await user.save();

    // İşlem kaydı oluştur
    const transaction = await Transaction.create({
      user: userId,
      type,
      amount,
      description: description || `Admin tarafından ${type === 'bonus' ? 'bonus' : 'iade'} eklendi`,
      status: 'completed',
      balanceBefore,
      balanceAfter: newBalance
    });

    res.status(200).json({
      success: true,
      message: 'Bakiye başarıyla güncellendi',
      data: {
        user: {
          id: user._id,
          name: user.name,
          balance: user.balance
        },
        transaction
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bakiye güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Para çekme talebi oluştur
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, iban, accountName } = req.body;
    const userId = req.user.userId;

    // Validasyonlar
    if (!amount || !iban || !accountName) {
      return res.status(400).json({
        success: false,
        message: 'Miktar, IBAN ve hesap sahibi adı gereklidir'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Çekilecek miktar 0\'dan büyük olmalıdır'
      });
    }

    // IBAN formatı kontrolü (TR + 24 rakam)
    const ibanRegex = /^TR\d{24}$/;
    if (!ibanRegex.test(iban.replace(/\s/g, '').toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz IBAN formatı. TR ile başlamalı ve 26 karakter olmalıdır'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Bakiye kontrolü
    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Yetersiz bakiye',
        data: {
          currentBalance: user.balance,
          requestedAmount: amount
        }
      });
    }

    // Bekleyen para çekme talebi kontrolü
    const pendingWithdrawal = await Transaction.findOne({
      user: userId,
      type: 'withdrawal',
      status: 'pending'
    });

    if (pendingWithdrawal) {
      return res.status(400).json({
        success: false,
        message: 'Zaten bekleyen bir para çekme talebiniz var. Önce mevcut talebin işlenmesini bekleyin.'
      });
    }

    // Bakiyeden düş (talep oluşturulduğunda)
    const balanceBefore = user.balance;
    user.balance -= amount;
    await user.save();

    // Para çekme talebi oluştur
    const transaction = await Transaction.create({
      user: userId,
      type: 'withdrawal',
      amount: -amount, // Negatif olarak kaydet (para çıkışı)
      description: 'Para çekme talebi',
      status: 'pending',
      balanceBefore,
      balanceAfter: user.balance,
      withdrawalDetails: {
        iban: iban.replace(/\s/g, '').toUpperCase(),
        accountName: accountName.trim()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Para çekme talebi başarıyla oluşturuldu',
      data: {
        transactionId: transaction._id,
        amount,
        iban: transaction.withdrawalDetails.iban,
        accountName: transaction.withdrawalDetails.accountName,
        status: transaction.status,
        newBalance: user.balance,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Para çekme talebi oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcının para çekme taleplerini getir
exports.getWithdrawalRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: userId, type: 'withdrawal' };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const withdrawals = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: withdrawals.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: withdrawals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Para çekme talepleri getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Admin: Tüm para çekme taleplerini getir
exports.getAllWithdrawalRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { type: 'withdrawal' };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const withdrawals = await Transaction.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    // İstatistikler
    const stats = await Transaction.aggregate([
      { $match: { type: 'withdrawal' } },
      {
        $group: {
          _id: '$status',
          total: { $sum: { $abs: '$amount' } },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: withdrawals.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      stats,
      data: withdrawals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Para çekme talepleri getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Admin: Para çekme talebini onayla
exports.approveWithdrawal = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const adminId = req.user.userId;

    const transaction = await Transaction.findById(transactionId).populate('user', 'name email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'İşlem bulunamadı'
      });
    }

    if (transaction.type !== 'withdrawal') {
      return res.status(400).json({
        success: false,
        message: 'Bu işlem para çekme talebi değil'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Bu talep zaten işlenmiş. Mevcut durum: ${transaction.status}`
      });
    }

    // Talebi onayla
    transaction.status = 'completed';
    transaction.withdrawalDetails.processedAt = new Date();
    transaction.withdrawalDetails.processedBy = adminId;
    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Para çekme talebi başarıyla onaylandı',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Para çekme talebi onaylanırken bir hata oluştu',
      error: error.message
    });
  }
};

// Admin: Para çekme talebini reddet
exports.rejectWithdrawal = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.userId;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'İşlem bulunamadı'
      });
    }

    if (transaction.type !== 'withdrawal') {
      return res.status(400).json({
        success: false,
        message: 'Bu işlem para çekme talebi değil'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Bu talep zaten işlenmiş. Mevcut durum: ${transaction.status}`
      });
    }

    // Kullanıcının bakiyesini geri yükle
    const user = await User.findById(transaction.user);
    if (user) {
      user.balance += Math.abs(transaction.amount);
      await user.save();
    }

    // Talebi reddet
    transaction.status = 'cancelled';
    transaction.withdrawalDetails.processedAt = new Date();
    transaction.withdrawalDetails.processedBy = adminId;
    transaction.withdrawalDetails.rejectionReason = reason || 'Belirtilmedi';
    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Para çekme talebi reddedildi ve bakiye iade edildi',
      data: {
        transaction,
        refundedAmount: Math.abs(transaction.amount),
        newBalance: user?.balance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Para çekme talebi reddedilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Cüzdan özeti (kullanıcı dashboard için)
exports.getWalletSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('balance totalEarned');

    // Son 30 günlük kazanç
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEarnings = await Transaction.aggregate([
      {
        $match: {
          user: user._id,
          type: 'earning',
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Bekleyen görevler (henüz onaylanmamış)
    const TaskCompletion = require('../models/TaskCompletion');
    const pendingCompletions = await TaskCompletion.countDocuments({
      user: userId,
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      data: {
        balance: user.balance,
        totalEarned: user.totalEarned,
        last30Days: {
          earnings: recentEarnings[0]?.total || 0,
          completedTasks: recentEarnings[0]?.count || 0
        },
        pendingTasks: pendingCompletions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Cüzdan özeti getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

