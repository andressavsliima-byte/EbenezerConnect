import mongoose from 'mongoose';

const metalRateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unitPriceValue: { type: Number, required: true },
  unitPriceCurrency: { type: String, enum: ['BRL', 'USD'], default: 'BRL' },
  legacyKey: { type: String, default: null }
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'global' },
  metalRates: { type: [metalRateSchema], default: [] },
  currencyRates: {
    usdToBrl: { type: Number, default: 5.2 }
  },
  // Campo legado mantido para migração automática a partir das versões anteriores.
  metalPrices: {
    platinum: { type: Number, default: 0 },
    palladium: { type: Number, default: 0 },
    rhodium: { type: Number, default: 0 }
  },
  updatedAt: { type: Date, default: Date.now }
}, { minimize: false });

export default mongoose.model('Settings', settingsSchema);
