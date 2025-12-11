import mongoose from 'mongoose';

const metalComponentSchema = new mongoose.Schema({
  metalName: { type: String, required: true },
  quantityKg: { type: Number, default: 0 },
  unitPriceValue: { type: Number, default: 0 },
  unitPriceCurrency: { type: String, enum: ['BRL', 'USD'], default: 'BRL' },
  useGlobalPrice: { type: Boolean, default: true },
  unitPriceBRL: { type: Number, default: 0 },
  totalValueBRL: { type: Number, default: 0 },
  priceSource: { type: String, enum: ['global', 'custom'], default: 'global' }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  brand: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: false,
    default: 0
  },
  category: {
    type: String,
    required: false,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  metalComposition: {
    type: [metalComponentSchema],
    default: []
  },
  metalSummary: {
    totalMetalValueBRL: { type: Number, default: 0 },
    totalWeightKg: { type: Number, default: 0 }
  },
  // Campo legado mantido para migração automática.
  metalContent: {
    totalWeight: { type: Number, default: 0 },
    platinum: { type: Number, default: 0 },
    palladium: { type: Number, default: 0 },
    rhodium: { type: Number, default: 0 }
  },
  purchasePanelStyle: {
    type: String,
    enum: ['highlight', 'plain'],
    default: 'highlight'
  },
  specifications: {
    type: Map,
    of: String
  },
  sku: {
    type: String,
    unique: true
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

export default mongoose.model('Product', productSchema);
