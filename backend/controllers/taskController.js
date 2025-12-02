const Task = require('../models/Task');

// Tüm aktif görevleri getir (herkes görebilir)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ isActive: true })
      .populate('category', 'name icon')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Görevler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tüm görevleri getir (admin için - aktif/pasif tümü)
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('category', 'name icon')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Görevler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tek görev getir
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('category', 'name icon description');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Görev bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Görev getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Görev oluştur (admin)
exports.createTask = async (req, res) => {
  try {
    const { title, description, category, reward, requirements, link, maxCompletions } = req.body;

    if (!title || !description || !category || !reward) {
      return res.status(400).json({
        success: false,
        message: 'Başlık, açıklama, kategori ve ödül gereklidir'
      });
    }

    const task = await Task.create({
      title,
      description,
      category,
      reward,
      requirements,
      link,
      maxCompletions: maxCompletions || null
    });

    await task.populate('category', 'name icon');

    res.status(201).json({
      success: true,
      message: 'Görev başarıyla oluşturuldu',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Görev oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

// Görev güncelle (admin)
exports.updateTask = async (req, res) => {
  try {
    const { title, description, category, reward, requirements, link, isActive, maxCompletions } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Görev bulunamadı'
      });
    }

    // Güncelleme
    if (title) task.title = title;
    if (description) task.description = description;
    if (category) task.category = category;
    if (reward !== undefined) task.reward = reward;
    if (requirements !== undefined) task.requirements = requirements;
    if (link !== undefined) task.link = link;
    if (isActive !== undefined) task.isActive = isActive;
    if (maxCompletions !== undefined) task.maxCompletions = maxCompletions;

    await task.save();
    await task.populate('category', 'name icon');

    res.status(200).json({
      success: true,
      message: 'Görev başarıyla güncellendi',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Görev güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Görev sil (admin)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Görev bulunamadı'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Görev başarıyla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Görev silinirken bir hata oluştu',
      error: error.message
    });
  }
};

