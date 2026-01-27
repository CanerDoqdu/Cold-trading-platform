const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  coinId: {
    type: String,
    required: true
  },
  coinSymbol: {
    type: String,
    required: true
  },
  coinName: {
    type: String,
    required: true
  },
  coinImage: {
    type: String,
    default: null
  },
  targetPrice: {
    type: Number,
    required: true
  },
  condition: {
    type: String,
    enum: ['above', 'below'],
    required: true
  },
  priceAtCreation: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isTriggered: {
    type: Boolean,
    default: false
  },
  triggeredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for checking alerts
priceAlertSchema.index({ isActive: 1, coinId: 1 });

module.exports = mongoose.models.PriceAlert || mongoose.model('PriceAlert', priceAlertSchema);
