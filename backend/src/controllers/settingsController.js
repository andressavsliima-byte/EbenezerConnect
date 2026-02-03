import Settings from '../models/Settings.js';
import Product from '../models/Product.js';
import {
  computeProductPricing,
  hasAnyMetalQuantity,
  normalizeSettings,
  parseNumber,
  DEFAULT_CURRENCY_RATES
} from '../utils/metalPricing.js';

const sanitizeText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const sanitizeMetalRatesInput = (rates = []) => {
  const normalized = new Map();

  rates.forEach((rate) => {
    if (!rate) return;
    const name = sanitizeText(rate.name ?? rate.metalName ?? rate.label ?? rate.key);
    if (!name) return;

    const unitValue = Math.max(0, parseNumber(rate.unitPriceValue ?? rate.value ?? rate.price));
    const currencyRaw = sanitizeText(rate.unitPriceCurrency ?? rate.currency ?? 'BRL').toUpperCase();
    const currency = currencyRaw === 'USD' ? 'USD' : 'BRL';
    const legacyKey = sanitizeText(rate.legacyKey ?? rate.key ?? '').toLowerCase() || undefined;
    const aliases = Array.isArray(rate.aliases) ? rate.aliases.filter(Boolean).map((alias) => sanitizeText(alias)) : [];

    normalized.set(name.toLowerCase(), {
      name,
      unitPriceValue: unitValue,
      unitPriceCurrency: currency,
      legacyKey,
      aliases
    });
  });

  return Array.from(normalized.values());
};

const normalizeCurrencyRatesInput = (input = {}) => {
  const usdRates = [
    input.usdToBrl,
    input.usd_to_brl,
    input.usdToBRL,
    input.USD_TO_BRL,
    input.USD,
    input.usd
  ];

  const usdToBrlCandidate = usdRates.reduce((acc, value) => {
    if (acc > 0) return acc;
    const parsed = parseNumber(value);
    return parsed > 0 ? parsed : acc;
  }, 0);

  const usdToBrl = usdToBrlCandidate > 0 ? usdToBrlCandidate : DEFAULT_CURRENCY_RATES.usdToBrl;

  return { usdToBrl };
};

const formatSettingsResponse = (settingsDoc) => {
  const normalized = normalizeSettings(settingsDoc || {});
  return {
    metalRates: normalized.metalRates,
    currencyRates: normalized.currencyRates,
    updatedAt: settingsDoc?.updatedAt || null
  };
};

const recalculateProductsWithSettings = async (normalizedSettings) => {
  const products = await Product.find({ isActive: true });
  let updatedCount = 0;

  for (const product of products) {
    const pricing = computeProductPricing({
      composition: Array.isArray(product.metalComposition) ? product.metalComposition : [],
      settings: normalizedSettings
    });

    const hasMetals = hasAnyMetalQuantity(pricing.composition);
    product.metalComposition = pricing.composition;
    product.metalSummary = pricing.summary;
    if (hasMetals) {
      product.price = pricing.price;
    }
    product.updatedAt = new Date();
    await product.save();
    updatedCount += 1;
  }

  return updatedCount;
};

export const getMetalPricingConfig = async (req, res) => {
  try {
    const settingsDoc = await Settings.findOne({ key: 'global' }).lean();
    res.json(formatSettingsResponse(settingsDoc));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar configuração de metais', error: error.message });
  }
};

export const updateMetalPricingConfig = async (req, res) => {
  try {
    const {
      metalRates: incomingMetalRates = [],
      currencyRates: incomingCurrencyRates = {},
      recalculate = true
    } = req.body || {};

    const metalRates = sanitizeMetalRatesInput(incomingMetalRates);
    const currencyRates = normalizeCurrencyRatesInput(incomingCurrencyRates);

    const settingsDoc = await Settings.findOneAndUpdate(
      { key: 'global' },
      {
        metalRates,
        currencyRates,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    let updatedCount = 0;
    if (recalculate) {
      const normalizedSettings = normalizeSettings(settingsDoc);
      updatedCount = await recalculateProductsWithSettings(normalizedSettings);
    }

    res.json({
      message: 'Configuração de metais atualizada',
      ...formatSettingsResponse(settingsDoc),
      updatedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar configuração de metais', error: error.message });
  }
};
