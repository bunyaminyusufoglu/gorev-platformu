const Task = require('../models/Task');

// Tüm aktif görevleri getir (herkes görebilir) - Arama ve Filtreleme destekli
exports.getTasks = async (req, res) => {
  try {
    const {
      search,           // Başlık veya açıklamada arama
      category,         // Kategori ID'sine göre filtrele
      minReward,        // Minimum ödül
      maxReward,        // Maksimum ödül
      featuredOnly,     // Sadece öne çıkan görevler
      sortBy,           // Sıralama alanı: reward, createdAt, title
      sortOrder,        // Sıralama yönü: asc, desc
      page = 1,
      limit = 20
    } = req.query;

    const now = new Date();

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

    // Sadece öne çıkan görevler filtresi
    if (featuredOnly === 'true') {
      filter.isFeatured = true;
      filter.$or = [
        { featuredUntil: null },
        { featuredUntil: { $gt: now } }
      ];
    }

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Öne çıkan görevler önce, sonra diğerleri
    // featuredOrder (düşük önce), sonra seçilen sıralama
    const validSortFields = ['reward', 'createdAt', 'title', 'currentCompletions'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder === 'asc' ? 1 : -1;

    const tasks = await Task.aggregate([
      { $match: filter },
      {
        $addFields: {
          // Aktif öne çıkarma durumu hesapla
          isCurrentlyFeatured: {
            $and: [
              { $eq: ['$isFeatured', true] },
              {
                $or: [
                  { $eq: ['$featuredUntil', null] },
                  { $gt: ['$featuredUntil', now] }
                ]
              }
            ]
          }
        }
      },
      {
        $sort: {
          isCurrentlyFeatured: -1, // Öne çıkanlar önce
          featuredOrder: 1,         // Düşük order önce
          [sortField]: order        // Sonra normal sıralama
        }
      },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          description: 1,
          category: { _id: 1, name: 1, icon: 1 },
          reward: 1,
          requirements: 1,
          link: 1,
          isActive: 1,
          maxCompletions: 1,
          currentCompletions: 1,
          isFeatured: 1,
          featuredUntil: 1,
          featuredNote: 1,
          isCurrentlyFeatured: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    const total = await Task.countDocuments(filter);
    const featuredCount = await Task.countDocuments({
      isActive: true,
      isFeatured: true,
      $or: [
        { featuredUntil: null },
        { featuredUntil: { $gt: now } }
      ]
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      featuredCount,
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
        featuredOnly: featuredOnly === 'true',
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

// ==================== ÖNE ÇIKARMA İŞLEMLERİ (ADMIN) ====================

// Görevi öne çıkar
exports.featureTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      duration,      // Gün cinsinden süre (null = süresiz)
      order,         // Sıralama önceliği (düşük = önce)
      note           // Öne çıkarma etiketi ("🔥 Popüler", "⭐ Önerilen" vb.)
    } = req.body;
    const adminId = req.user.userId;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Görev bulunamadı'
      });
    }

    if (!task.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Pasif görevler öne çıkarılamaz'
      });
    }

    // Öne çıkarma süresi hesapla
    let featuredUntil = null;
    if (duration && duration > 0) {
      featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + parseInt(duration));
    }

    // Görevi öne çıkar
    task.isFeatured = true;
    task.featuredUntil = featuredUntil;
    task.featuredOrder = order || 0;
    task.featuredNote = note || null;
    task.featuredBy = adminId;
    task.featuredAt = new Date();

    await task.save();
    await task.populate('category', 'name icon');
    await task.populate('featuredBy', 'name');

    res.status(200).json({
      success: true,
      message: `Görev başarıyla öne çıkarıldı${featuredUntil ? ` (${duration} gün süreyle)` : ' (süresiz)'}`,
      data: {
        task,
        featuredInfo: {
          isFeatured: task.isFeatured,
          featuredUntil: task.featuredUntil,
          featuredOrder: task.featuredOrder,
          featuredNote: task.featuredNote,
          featuredAt: task.featuredAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Görev öne çıkarılırken bir hata oluştu',
      error: error.message
    });
  }
};

// Öne çıkarmayı kaldır
exports.unfeatureTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Görev bulunamadı'
      });
    }

    if (!task.isFeatured) {
      return res.status(400).json({
        success: false,
        message: 'Bu görev zaten öne çıkarılmış değil'
      });
    }

    // Öne çıkarmayı kaldır
    task.isFeatured = false;
    task.featuredUntil = null;
    task.featuredOrder = 0;
    task.featuredNote = null;
    task.featuredBy = null;
    task.featuredAt = null;

    await task.save();
    await task.populate('category', 'name icon');

    res.status(200).json({
      success: true,
      message: 'Görev öne çıkarması kaldırıldı',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Öne çıkarma kaldırılırken bir hata oluştu',
      error: error.message
    });
  }
};

// Öne çıkarma ayarlarını güncelle
exports.updateFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration, order, note } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Görev bulunamadı'
      });
    }

    if (!task.isFeatured) {
      return res.status(400).json({
        success: false,
        message: 'Bu görev öne çıkarılmamış. Önce öne çıkarın.'
      });
    }

    // Süre güncelle
    if (duration !== undefined) {
      if (duration === null || duration === 0) {
        task.featuredUntil = null; // Süresiz
      } else {
        const newUntil = new Date();
        newUntil.setDate(newUntil.getDate() + parseInt(duration));
        task.featuredUntil = newUntil;
      }
    }

    // Sıralama güncelle
    if (order !== undefined) {
      task.featuredOrder = order;
    }

    // Etiket güncelle
    if (note !== undefined) {
      task.featuredNote = note;
    }

    await task.save();
    await task.populate('category', 'name icon');

    res.status(200).json({
      success: true,
      message: 'Öne çıkarma ayarları güncellendi',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Öne çıkarma güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tüm öne çıkarılmış görevleri getir (admin)
exports.getFeaturedTasks = async (req, res) => {
  try {
    const now = new Date();

    // Aktif öne çıkarılmış görevler
    const activeFeatured = await Task.find({
      isFeatured: true,
      $or: [
        { featuredUntil: null },
        { featuredUntil: { $gt: now } }
      ]
    })
      .populate('category', 'name icon')
      .populate('featuredBy', 'name')
      .sort({ featuredOrder: 1, featuredAt: -1 });

    // Süresi dolmuş öne çıkarmalar
    const expiredFeatured = await Task.find({
      isFeatured: true,
      featuredUntil: { $lte: now }
    })
      .populate('category', 'name icon')
      .sort({ featuredUntil: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        active: {
          count: activeFeatured.length,
          tasks: activeFeatured
        },
        expired: {
          count: expiredFeatured.length,
          tasks: expiredFeatured
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Öne çıkarılmış görevler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

