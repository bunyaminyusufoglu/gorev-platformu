const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload klasörünü oluştur
const uploadDir = path.join(__dirname, '../uploads');
const proofsDir = path.join(uploadDir, 'proofs');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(proofsDir)) {
  fs.mkdirSync(proofsDir, { recursive: true });
}

// Kabul edilen tipler ve limitler
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];
const ALLOWED_EXTENSIONS = new Set(['.jpeg', '.jpg', '.png', '.gif', '.webp']);
const BLOCKED_EXTENSIONS = new Set(['.exe', '.bat', '.cmd', '.sh', '.js', '.msi', '.com', '.scr', '.cpl']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_FILE_COUNT = 5;

const hasDoubleExtension = (filename) => {
  const parts = filename.split('.');
  return parts.length > 2; // örn: file.jpg.exe
};

const isExtensionAllowed = (filename) => {
  const ext = path.extname(filename || '').toLowerCase();
  if (!ext) return false;
  if (BLOCKED_EXTENSIONS.has(ext)) return false;
  return ALLOWED_EXTENSIONS.has(ext);
};

// Storage ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, proofsDir);
  },
  filename: function (req, file, cb) {
    // Benzersiz dosya adı oluştur: timestamp-userId-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `proof-${uniqueSuffix}${ext}`);
  }
});

// Dosya filtresi - sadece resim dosyaları kabul et + uzantı kontrolü + basit kötüye kullanım önlemi
const fileFilter = (req, file, cb) => {
  if (!file || !file.originalname) {
    return cb(new Error('Geçersiz dosya'), false);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Sadece resim dosyaları yüklenebilir (jpeg, jpg, png, gif, webp)'), false);
  }

  if (!isExtensionAllowed(file.originalname)) {
    return cb(new Error('Desteklenmeyen dosya uzantısı'), false);
  }

  if (hasDoubleExtension(file.originalname)) {
    return cb(new Error('Çoklu uzantılı dosyalar kabul edilmez'), false);
  }

  // Not: Burada gerçek zamanlı antivirüs taraması yok.
  // İleride AV entegrasyonu için hook bırakıyoruz.
  return cb(null, true);
};

// Multer konfigürasyonu
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES, // 5MB maksimum dosya boyutu
    files: MAX_FILE_COUNT // Maksimum 5 dosya yüklenebilir
  }
});

// Tekli dosya yükleme
const uploadSingle = upload.single('proofImage');

// Çoklu dosya yükleme (maksimum 5 dosya)
const uploadMultiple = upload.array('proofImages', 5);

// Hata yakalama middleware'i
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Dosya boyutu 5MB\'dan büyük olamaz'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'En fazla 5 dosya yükleyebilirsiniz'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Beklenmeyen dosya alanı'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Dosya yükleme hatası',
      error: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

// Dosya silme yardımcı fonksiyonu
const deleteFile = (filePath) => {
  const fullPath = path.join(proofsDir, filePath);
  if (!fs.existsSync(fullPath)) return;
  fs.unlinkSync(fullPath);
};

// Birden fazla dosya silme
const deleteFiles = (filePaths) => {
  if (Array.isArray(filePaths)) {
    filePaths.forEach(filePath => {
      deleteFile(path.basename(filePath));
    });
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
  deleteFile,
  deleteFiles
};

