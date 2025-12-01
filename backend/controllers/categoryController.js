const Category = require('../models/Category');

// Tüm kategorileri getir (herkes görebilir, aktif olanlar)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategoriler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tüm kategorileri getir (admin için - aktif/pasif tümü)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategoriler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Tek kategori getir
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategori getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Kategori oluştur (admin)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon, order } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Kategori adı gereklidir'
      });
    }

    // Aynı isimde kategori var mı kontrol et
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Bu isimde bir kategori zaten mevcut'
      });
    }

    const category = await Category.create({
      name,
      description,
      icon,
      order: order || 0
    });

    res.status(201).json({
      success: true,
      message: 'Kategori başarıyla oluşturuldu',
      data: category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu isimde bir kategori zaten mevcut'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Kategori oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

// Kategori güncelle (admin)
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, icon, isActive, order } = req.body;

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    // İsim değiştiriliyorsa, başka bir kategoriyle çakışma var mı kontrol et
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Bu isimde bir kategori zaten mevcut'
        });
      }
    }

    // Güncelleme
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (isActive !== undefined) category.isActive = isActive;
    if (order !== undefined) category.order = order;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Kategori başarıyla güncellendi',
      data: category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu isimde bir kategori zaten mevcut'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Kategori güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Kategori sil (admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Kategori başarıyla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategori silinirken bir hata oluştu',
      error: error.message
    });
  }
};

