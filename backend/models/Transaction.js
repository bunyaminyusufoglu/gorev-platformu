const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Kullanıcı gereklidir']
  },
  type: {
    type: String,
    enum: ['earning', 'withdrawal', 'bonus', 'refund'],
    required: [true, 'İşlem tipi gereklidir']
  },
  amount: {
    type: Number,
    required: [true, 'Miktar gereklidir']
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed', 'cancelled'],
    default: 'completed'
  },
  // İlgili görev tamamlama kaydı (earning için)
  taskCompletion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskCompletion'
  },
  // İlgili görev (earning için)
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  // Önceki ve sonraki bakiye (izleme için)
  balanceBefore: {
    type: Number
  },
  balanceAfter: {
    type: Number
  },
  // Para çekme bilgileri (withdrawal için)
  withdrawalDetails: {
    iban: {
      type: String,
      trim: true
    },
    accountName: {
      type: String,
      trim: true
    },
    processedAt: {
      type: Date
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// İndeksler
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);

