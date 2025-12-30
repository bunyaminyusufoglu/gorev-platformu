const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT token doğrulama middleware
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Token'ı header'dan al
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bu işlem için giriş yapmanız gerekiyor'
      });
    }

    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Kullanıcıyı bul
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }

      // Ban kontrolü
      if (user.isBanned) {
        return res.status(403).json({
          success: false,
          message: 'Hesabınız yasaklanmıştır',
          banInfo: {
            reason: user.banReason || 'Belirtilmedi',
            bannedAt: user.bannedAt
          }
        });
      }

      // Ortak kullanım için kimlik bilgilerini ekle
      req.user = user;
      req.userId = user._id;
      req.user.userId = user._id;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bir hata oluştu',
      error: error.message
    });
  }
};

// Admin kontrolü middleware
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için admin yetkisi gereklidir'
    });
  }
};

