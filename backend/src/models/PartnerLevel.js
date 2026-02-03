import mongoose from 'mongoose';

const partnerLevelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  percentage: { type: Number, required: true, min: 0, max: 500 },
  description: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

partnerLevelSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('PartnerLevel', partnerLevelSchema);
