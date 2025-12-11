const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Görev başlığı gereklidir'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Görev açıklaması gereklidir'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Kategori gereklidir']
  },
  reward: {
    type: Number,
    required: [true, 'Ödül miktarı gereklidir'],
    min: [0, 'Ödül negatif olamaz']
  },
  requirements: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxCompletions: {
    type: Number,
    default: null // null ise sınırsız
  },
  currentCompletions: {
    type: Number,
    default: 0
  },
  // Öne çıkarma özellikleri
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: {
    type: Date,
    default: null
  },
  featuredOrder: {
    type: Number,
    default: 0 // Düşük sayı = daha önce gösterilir
  },
  featuredNote: {
    type: String,
    trim: true,
    default: null // "🔥 Popüler", "⭐ Önerilen" gibi etiket
  },
  featuredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  featuredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Öne çıkarma süresi dolmuş mu kontrol et
taskSchema.methods.isCurrentlyFeatured = function() {
  if (!this.isFeatured) return false;
  if (!this.featuredUntil) return true; // Süresiz öne çıkarılmış
  return new Date() < this.featuredUntil;
};

module.exports = mongoose.model('Task', taskSchema);

