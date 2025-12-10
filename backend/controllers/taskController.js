const Task = require('../models/Task');

// Tüm aktif görevleri getir (herkes görebilir) - Arama ve Filtreleme destekli
exports.getTasks = async (req, res) => {
  try {
    const {
      search,           // Başlık veya açıklamada arama
      category,         // Kategori ID'sine göre filtrele
      minReward,        // Minimum ödül
      maxReward,        // Maksimum ödül
      sortBy,           // Sıralama alanı: reward, createdAt, title
      sortOrder,        // Sıralama yönü: asc, desc
      page = 1,
      limit = 20
    } = req.query;

    // Filtre objesi oluştur
    const filter = { isActive: true };

    // Metin araması (başlık veya açıklama)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Kategori filtresi
    if (category) {
      filter.category = category;
    }

    // Ödül aralığı filtresi
    if (minReward || maxReward) {
      filter.reward = {};
      if (minReward) filter.reward.$gte = parseFloat(minReward);
      if (maxReward) filter.reward.$lte = parseFloat(maxReward);
    }

    // Sıralama seçenekleri
    const sortOptions = {};
    const validSortFields = ['reward', 'createdAt', 'title', 'currentCompletions'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder === 'asc' ? 1 : -1;
    sortOptions[sortField] = order;

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(filter)
      .populate('category', 'name icon')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      },
      filters: {
        search: search || null,
        category: category || null,
        minReward: minReward || null,
        maxReward: maxReward || null,
        sortBy: sortField,
        sortOrder: order === 1 ? 'asc' : 'desc'
      },
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

// Tüm görevleri getir (admin için - aktif/pasif tümü) - Arama ve Filtreleme destekli
exports.getAllTasks = async (req, res) => {
  try {
    const {
      search,           // Başlık veya açıklamada arama
      category,         // Kategori ID'sine göre filtrele
      minReward,        // Minimum ödül
      maxReward,        // Maksimum ödül
      isActive,         // Aktif/Pasif filtresi (admin için)
      sortBy,           // Sıralama alanı
      sortOrder,        // Sıralama yönü
      page = 1,
      limit = 50
    } = req.query;

    // Filtre objesi oluştur
    const filter = {};

    // Metin araması
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Kategori filtresi
    if (category) {
      filter.category = category;
    }

    // Aktif/Pasif filtresi
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Ödül aralığı filtresi
    if (minReward || maxReward) {
      filter.reward = {};
      if (minReward) filter.reward.$gte = parseFloat(minReward);
      if (maxReward) filter.reward.$lte = parseFloat(maxReward);
    }

    // Sıralama
    const sortOptions = {};
    const validSortFields = ['reward', 'createdAt', 'title', 'currentCompletions', 'isActive'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder === 'asc' ? 1 : -1;
    sortOptions[sortField] = order;

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(filter)
      .populate('category', 'name icon')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    // İstatistikler
    const stats = await Task.aggregate([
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          activeTasks: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalRewards: { $sum: '$reward' },
          avgReward: { $avg: '$reward' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      },
      stats: stats[0] || {},
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

