const mongoose = require('mongoose');

const taskCompletionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Kullanıcı gereklidir']
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Görev gereklidir']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  proof: {
    type: String,
    trim: true
  },
  proofImages: [{
    type: String,
    trim: true
  }],
  adminNote: {
    type: String,
    trim: true
  },
  completedAt: {
    type: Date
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Aynı kullanıcı aynı görevi birden fazla kez tamamlayamaz (pending veya approved durumunda)
taskCompletionSchema.index({ user: 1, task: 1, status: 1 });

module.exports = mongoose.model('TaskCompletion', taskCompletionSchema);

