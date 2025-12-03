const TaskCompletion = require('../models/TaskCompletion');
const Task = require('../models/Task');

// Kullanıcı görev tamamlama (kullanıcı)
exports.completeTask = async (req, res) => {
  try {
    const { taskId, proof } = req.body;
    const userId = req.user.userId;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: 'Görev ID gereklidir'
      });
    }

    // Görevin var olup olmadığını ve aktif olup olmadığını kontrol et
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Görev bulunamadı'
      });
    }

    if (!task.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Bu görev aktif değil'
      });
    }

    // Maksimum tamamlanma kontrolü
    if (task.maxCompletions && task.currentCompletions >= task.maxCompletions) {
      return res.status(400).json({
        success: false,
        message: 'Bu görev için maksimum tamamlanma sayısına ulaşıldı'
      });
    }

    // Kullanıcı bu görevi daha önce tamamlamış mı kontrol et (pending veya approved)
    const existingCompletion = await TaskCompletion.findOne({
      user: userId,
      task: taskId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingCompletion) {
      return res.status(400).json({
        success: false,
        message: 'Bu görevi zaten tamamladınız veya bekleyen bir tamamlamanız var'
      });
    }

    // Görev tamamlama kaydı oluştur
    const completion = await TaskCompletion.create({
      user: userId,
      task: taskId,
      proof: proof || '',
      status: 'pending',
      completedAt: new Date()
    });

    await completion.populate('task', 'title reward');

    res.status(201).json({
      success: true,
      message: 'Görev tamamlama talebi gönderildi, admin onayı bekleniyor',
      data: completion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Görev tamamlanırken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcının tamamladığı görevleri getir
exports.getMyCompletions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const completions = await TaskCompletion.find({ user: userId })
      .populate('task', 'title description reward category')
      .populate('task.category', 'name icon')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: completions.length,
      data: completions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Tamamlamalar getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tüm tamamlamaları getir (admin)
exports.getAllCompletions = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const completions = await TaskCompletion.find(filter)
      .populate('user', 'name email')
      .populate('task', 'title reward')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: completions.length,
      data: completions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Tamamlamalar getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Görev tamamlamayı onayla/reddet (admin)
exports.reviewCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir durum belirtiniz (approved veya rejected)'
      });
    }

    const completion = await TaskCompletion.findById(id)
      .populate('task');

    if (!completion) {
      return res.status(404).json({
        success: false,
        message: 'Tamamlama kaydı bulunamadı'
      });
    }

    if (completion.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Bu tamamlama zaten incelenmiş'
      });
    }

    // Durumu güncelle
    completion.status = status;
    completion.adminNote = adminNote || '';
    completion.reviewedAt = new Date();
    completion.reviewedBy = req.user.userId;

    await completion.save();

    // Eğer onaylandıysa, görevin tamamlanma sayısını artır
    if (status === 'approved') {
      await Task.findByIdAndUpdate(completion.task._id, {
        $inc: { currentCompletions: 1 }
      });
    }

    await completion.populate('user', 'name email');
    await completion.populate('task', 'title reward');
    await completion.populate('reviewedBy', 'name');

    res.status(200).json({
      success: true,
      message: `Görev tamamlama ${status === 'approved' ? 'onaylandı' : 'reddedildi'}`,
      data: completion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Tamamlama incelenirken bir hata oluştu',
      error: error.message
    });
  }
};

