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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);

