export const DEFAULT_CURRENCY_RATES = {
  usdToBrl: 5.2
};

const ROUNDING_FACTOR = 1_000_000; // keep metal values with precision up to 6 decimal places

export const parseNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') {
    return Number.isNaN(value) ? 0 : value;
  }

  const raw = String(value).trim();
  if (!raw) return 0;

  const sanitized = raw.replace(/\s+/g, '');
  const hasComma = sanitized.includes(',');
  const hasDot = sanitized.includes('.');

  if (hasComma && hasDot) {
    const normalized = sanitized.replace(/\./g, '').replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  const normalized = sanitized.replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const normalizeMetalValue = (value) => {
  const parsed = parseNumber(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * ROUNDING_FACTOR) / ROUNDING_FACTOR;
};

const roundMoney = (value) => {
  const numeric = Number.isFinite(value) ? value : 0;
  return Math.round((numeric + Number.EPSILON) * 100) / 100;
};

const sanitizeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

export const normalizeCurrencyCode = (value) => {
  const raw = sanitizeString(value).toUpperCase();
  return raw === 'USD' ? 'USD' : 'BRL';
};

export const toSpecMap = (specifications) => {
  if (!specifications) return new Map();
  if (specifications instanceof Map) {
    return new Map(specifications);
  }
  if (Array.isArray(specifications)) {
    return new Map(specifications);
  }
  if (typeof specifications === 'object') {
    return new Map(Object.entries(specifications));
  }
  return new Map();
};

export const specMapToObject = (specMap) => {
  const obj = {};
  if (!(specMap instanceof Map)) {
    return obj;
  }
  for (const [key, value] of specMap.entries()) {
    obj[key] = value;
  }
  return obj;
};

export const normalizeMetalKey = (value) => {
  const raw = sanitizeString(value);
  if (!raw) return '';
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

export const normalizeMetalRatesList = (rates = []) => {
  const normalized = new Map();

  const pushRate = (name, data = {}) => {
    const metalName = sanitizeString(name || data.name || data.metalName || data.label || data.key);
    if (!metalName) return;

    const normalizedKey = normalizeMetalKey(metalName);
    const legacyKey = sanitizeString(data.legacyKey);
    const aliases = new Set([normalizedKey]);
    if (legacyKey) {
      aliases.add(normalizeMetalKey(legacyKey));
    }
    if (Array.isArray(data.aliases)) {
      data.aliases.forEach((alias) => {
        const aliasKey = normalizeMetalKey(alias);
        if (aliasKey) aliases.add(aliasKey);
      });
    }

    const unitPriceValue = Math.max(0, normalizeMetalValue(data.unitPriceValue ?? data.value ?? 0));
    const unitPriceCurrency = normalizeCurrencyCode(data.unitPriceCurrency ?? data.currency ?? 'BRL');

    const payload = {
      metalName,
      normalizedKey,
      unitPriceValue,
      unitPriceCurrency,
      legacyKey: legacyKey ? legacyKey.toLowerCase() : null,
      aliases: Array.from(aliases)
    };

    normalized.set(normalizedKey, payload);
  };

  ensureArray(rates).forEach((rate) => {
    if (!rate) return;
    const candidateName = rate.name ?? rate.metalName ?? rate.label ?? rate.key;
    pushRate(candidateName, rate);
  });

  return Array.from(normalized.values());
};

export const buildMetalRateLookup = (rates = []) => {
  const map = new Map();
  ensureArray(rates).forEach((rate) => {
    if (!rate) return;
    const aliases = Array.isArray(rate.aliases) && rate.aliases.length > 0
      ? rate.aliases
      : [normalizeMetalKey(rate.metalName)];
    aliases.forEach((alias) => {
      if (!alias) return;
      map.set(alias, rate);
    });
  });
  return map;
};

export const convertToBRL = (value, currency, currencyRates = DEFAULT_CURRENCY_RATES) => {
  const numeric = normalizeMetalValue(value);
  if (numeric <= 0) return 0;
  const currencyCode = normalizeCurrencyCode(currency);
  if (currencyCode === 'USD') {
    const usdRate = normalizeMetalValue(currencyRates?.usdToBrl ?? DEFAULT_CURRENCY_RATES.usdToBrl);
    return normalizeMetalValue(numeric * usdRate);
  }
  return normalizeMetalValue(numeric);
};

export const normalizeCompositionPayload = (composition = [], options = {}) => {
  const {
    metalRatesMap = new Map(),
    currencyRates = DEFAULT_CURRENCY_RATES
  } = options;

  const sourceItems = ensureArray(composition);

  const items = [];
  let totalWeight = 0;
  let totalValue = 0;

  sourceItems.forEach((rawItem) => {
    if (!rawItem) return;
    const metalName = sanitizeString(rawItem.metalName ?? rawItem.name ?? rawItem.key);
    if (!metalName) return;

    const normalizedKey = normalizeMetalKey(metalName);
    const requestedUseGlobal = rawItem.useGlobalPrice !== false;

    let quantityKg = normalizeMetalValue(rawItem.quantityKg ?? rawItem.quantity ?? 0);
    if (!Number.isFinite(quantityKg) || quantityKg < 0) quantityKg = 0;

    let unitPriceValue = normalizeMetalValue(rawItem.unitPriceValue ?? rawItem.unitPrice ?? 0);
    let unitPriceCurrency = normalizeCurrencyCode(rawItem.unitPriceCurrency ?? rawItem.currency ?? 'BRL');
    let priceSource = 'custom';

    const globalRate = metalRatesMap.get(normalizedKey);

    if (globalRate) {
      if (requestedUseGlobal || unitPriceValue <= 0) {
        unitPriceValue = normalizeMetalValue(globalRate.unitPriceValue);
        unitPriceCurrency = normalizeCurrencyCode(globalRate.unitPriceCurrency);
        priceSource = 'global';
      }
    } else if (unitPriceValue <= 0) {
      priceSource = 'custom';
    }

    if (unitPriceValue <= 0 && globalRate) {
      unitPriceValue = normalizeMetalValue(globalRate.unitPriceValue);
      unitPriceCurrency = normalizeCurrencyCode(globalRate.unitPriceCurrency);
      priceSource = 'global';
    }

    const unitPriceBRL = convertToBRL(unitPriceValue, unitPriceCurrency, currencyRates);
    const totalValueBRL = roundMoney(unitPriceBRL * quantityKg);

    totalWeight += quantityKg;
    totalValue += totalValueBRL;

    items.push({
      metalName,
      quantityKg,
      unitPriceValue,
      unitPriceCurrency,
      useGlobalPrice: priceSource === 'global',
      priceSource,
      unitPriceBRL,
      totalValueBRL,
      normalizedKey
    });
  });

  const summary = {
    totalWeightKg: normalizeMetalValue(totalWeight),
    totalMetalValueBRL: roundMoney(totalValue)
  };

  return { items, summary };
};

export const normalizeSettings = (settings = {}) => {
  const currencyRates = {
    ...DEFAULT_CURRENCY_RATES,
    ...(settings?.currencyRates || {})
  };

  const normalizedCurrencyRates = {
    usdToBrl: normalizeMetalValue(currencyRates.usdToBrl ?? DEFAULT_CURRENCY_RATES.usdToBrl)
  };

  const metalRates = normalizeMetalRatesList(settings?.metalRates || [], settings?.metalPrices || {});
  const metalRatesMap = buildMetalRateLookup(metalRates);

  return {
    currencyRates: normalizedCurrencyRates,
    metalRates,
    metalRatesMap
  };
};

export const computeProductPricing = ({
  composition = [],
  settings = {}
} = {}) => {
  const normalizedSettings = settings && settings.metalRatesMap instanceof Map
    ? settings
    : normalizeSettings(settings);
  const { items, summary } = normalizeCompositionPayload(composition, {
    metalRatesMap: normalizedSettings.metalRatesMap,
    currencyRates: normalizedSettings.currencyRates
  });

  const compositionForStorage = items.map(({ normalizedKey, ...rest }) => rest);
  const price = roundMoney(summary.totalMetalValueBRL);

  return {
    composition: compositionForStorage,
    summary,
    price,
    currencyRates: normalizedSettings.currencyRates,
    metalRates: normalizedSettings.metalRates
  };
};

export const hasAnyMetalQuantity = (composition = []) => {
  if (Array.isArray(composition)) {
    const hasQuantity = composition.some((item) => normalizeMetalValue(item?.quantityKg ?? item?.quantity ?? 0) > 0);
    if (hasQuantity) return true;
  }

  return false;
};

export const buildMetalTechnicalSheet = (composition = []) => {
  return ensureArray(composition).map((item) => ({
    metalName: sanitizeString(item.metalName),
    quantityKg: normalizeMetalValue(item.quantityKg ?? 0),
    unitPriceValue: normalizeMetalValue(item.unitPriceValue ?? 0),
    unitPriceCurrency: normalizeCurrencyCode(item.unitPriceCurrency ?? 'BRL'),
    unitPriceBRL: roundMoney(item.unitPriceBRL ?? 0),
    totalValueBRL: roundMoney(item.totalValueBRL ?? 0),
    useGlobalPrice: item.useGlobalPrice !== false,
    priceSource: item.priceSource || (item.useGlobalPrice === false ? 'custom' : 'global')
  }));
};
