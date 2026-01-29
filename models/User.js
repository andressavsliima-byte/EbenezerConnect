import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  company: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['partner', 'admin'],
    default: 'partner'
  },
  partnerPercentage: {
    type: Number,
    enum: [30, 35, 40],
    default: 35
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
