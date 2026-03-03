const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const neoUserSchema = new mongoose.Schema({
  neoUsername: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  neoPassword: {
    type: String,
    required: true
  },
  neoEmail: {
    type: String,
    required: true,
    unique: true
  },
  neoIsPro: {
    type: Boolean,
    default: false
  },
  neoSubscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    default: 'free'
  },
  neoSubscriptionStatus: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  neoSubscriptionExpiry: {
    type: Date
  },
  neoTokensUsed: {
    type: Number,
    default: 0
  },
  neoTokenLimit: {
    type: Number,
    default: 100
  },
  neoCreatedAt: {
    type: Date,
    default: Date.now
  },
  neoLastLogin: {
    type: Date
  }
});

// Hash neoPassword before saving
neoUserSchema.pre('save', async function(next) {
  if (!this.isModified('neoPassword')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.neoPassword = await bcrypt.hash(this.neoPassword, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare neoPassword
neoUserSchema.methods.compareNeoPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.neoPassword);
};

module.exports = mongoose.model('NeoUser', neoUserSchema);