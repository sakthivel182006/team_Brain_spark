const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const neoUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  isPro: {
    type: Boolean,
    default: false
  },
  subscriptionPlan: {
    type: String,
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    default: 'pending'
  },
  tokensUsed: {
    type: Number,
    default: 0
  },
  tokenLimit: {
    type: Number,
    default: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

neoUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

neoUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('NeoUser', neoUserSchema);