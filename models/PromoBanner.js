import mongoose from 'mongoose';

const promoBannerSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  // Prefer explicit desktop/mobile images. Keep `imageUrl` as fallback for backwards compatibility.
  imageUrl: { type: String },
  imageDesktopUrl: { type: String },
  imageMobileUrl: { type: String },
  linkUrl: { type: String },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

promoBannerSchema.pre('save', function(next){
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('PromoBanner', promoBannerSchema);
