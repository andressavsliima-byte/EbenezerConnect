import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ebenezer-connect';

const migrate = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Conectado ao MongoDB para migração');

    const products = await Product.find({ $or: [ { images: { $exists: false } }, { images: { $size: 0 } }, { images: { $elemMatch: { $eq: null } } } ] });
    console.log(`Encontrados ${products.length} produtos a migrar`);

    let updated = 0;
    for (const p of products) {
      // Use toObject to access raw fields that may no longer be in schema
      const raw = p.toObject ? p.toObject() : p;
      const src = raw.image || raw.images?.[0];
      if (src) {
        p.images = [src];
        await p.save();
        updated++;
      }
    }

    console.log(`Migrados: ${updated}`);
    process.exit(0);
  } catch (err) {
    console.error('Erro na migração:', err.message);
    process.exit(1);
  }
};

migrate();
