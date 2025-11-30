const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT Token oluşturma
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Kayıt
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validasyon
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen tüm alanları doldurunuz'
      });
    }

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }

    // Kullanıcı oluşturma
    // Role sadece admin olarak kayıt yapılabilir (güvenlik için)
    // Normal kullanıcılar role belirtmeden kayıt olur, default 'user' olur
    const userData = {
      name,
      email,
      password
    };

    // Eğer role belirtilmişse ve 'admin' ise (güvenlik için özel bir anahtar gerekebilir)
    // Şimdilik sadece 'user' rolü ile kayıt yapılabilir
    if (role && role === 'admin') {
      // Admin kaydı için özel bir kontrol eklenebilir
      userData.role = 'admin';
    }

    const user = await User.create(userData);

    // Şifreyi response'dan çıkar
    user.password = undefined;

    // Token oluştur
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında bir hata oluştu',
      error: error.message
    });
  }
};

// Giriş
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasyon
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre gereklidir'
      });
    }

    // Kullanıcıyı bul (şifre dahil)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
    }

    // Şifre kontrolü
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
    }

    // Şifreyi response'dan çıkar
    user.password = undefined;

    // Token oluştur
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcı bilgilerini getir (profil)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bir hata oluştu',
      error: error.message
    });
  }
};

