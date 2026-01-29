#!/usr/bin/env node
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

// Config via env vars, with safe defaults
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ebenezer.com';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || `${ADMIN_EMAIL},admin123@gmail.com`)
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrador';
const ADMIN_COMPANY = process.env.ADMIN_COMPANY || 'Ebenezer';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
// Prefer MONGODB_URI (used by app), fallback to MONGO_URI, then local
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ebenezer';

async function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function connectWithRetry(uri, attempts = 10, delayMs = 2000) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      await mongoose.connect(uri);
      return true;
    } catch (err) {
      lastErr = err;
      if (i < attempts) {
        await wait(delayMs);
      }
    }
  }
  throw lastErr;
}

async function run() {
  try {
    await connectWithRetry(MONGO_URI);

    for (const email of ADMIN_EMAILS) {
      let user = await User.findOne({ email });
      if (!user) {
        const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
        user = await User.create({
          name: ADMIN_NAME,
          email,
          password: hashed,
          company: ADMIN_COMPANY,
          role: 'admin',
          isActive: true,
        });
        console.log(`✓ Admin criado: ${email}`);
      } else {
        const updates = {};
        if (user.role !== 'admin') updates.role = 'admin';
        if (!user.isActive) updates.isActive = true;
        if (Object.keys(updates).length) {
          await User.updateOne({ _id: user._id }, { $set: updates });
          console.log(`✓ Admin atualizado: ${email} -> ${JSON.stringify(updates)}`);
        } else {
          console.log(`✓ Admin já ativo: ${email}`);
        }
      }
    }
  } catch (err) {
    console.error('Erro ao garantir admin:', err);
    process.exitCode = 1;
  } finally {
    try { await mongoose.disconnect(); } catch {}
  }
}

run();
