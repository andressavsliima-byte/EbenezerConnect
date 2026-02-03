import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import XLSX from 'xlsx';
import {
  buildMetalTechnicalSheet,
  computeProductPricing,
  hasAnyMetalQuantity,
  normalizeMetalValue,
  normalizeSettings,
  parseNumber
} from '../utils/metalPricing.js';

const sanitizeText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const roundCurrency = (value) => {
  const numeric = Number.isFinite(value) ? value : 0;
  return Math.round((numeric + Number.EPSILON) * 100) / 100;
};

const normalizeInternalMetalsInput = (raw) => {
  const source = raw?.internalMetals || raw || {};
  const parse = (value) => {
    const parsed = parseNumber(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  };

  const hasAny = ['platina', 'paladio', 'rodio'].some((key) => source[key] !== undefined);
  if (!hasAny) return { provided: false, values: null };

  return {
    provided: true,
    values: {
      platina: parse(source.platina),
      paladio: parse(source.paladio),
      rodio: parse(source.rodio)
    }
  };
};

const computePriceForUser = (basePrice, userContext) => {
  const sanitizedBase = Number.isFinite(basePrice) ? basePrice : 0;
  if (!userContext || userContext.role !== 'partner') {
    return {
      price: roundCurrency(sanitizedBase),
      basePrice: roundCurrency(sanitizedBase),
      levelPercentage: null,
      levelName: null
    };
  }

  const levelPct = userContext.partnerLevel?.percentage ?? userContext.partnerPercentage ?? 0;
  const pct = Number.isFinite(levelPct) ? Math.max(0, Math.min(500, levelPct)) : 0;
  const finalPrice = roundCurrency(sanitizedBase * (1 + pct / 100));

  return {
    price: finalPrice,
    basePrice: roundCurrency(sanitizedBase),
    levelPercentage: pct,
    levelName: userContext.partnerLevel?.name || null
  };
};

const normalizeImagesInput = (input, fallbackImage) => {
  const images = [];
  if (Array.isArray(input)) {
    input.forEach((item) => {
      const sanitized = sanitizeText(item);
      if (sanitized) images.push(sanitized);
    });
  } else {
    const sanitized = sanitizeText(input);
    if (sanitized) images.push(sanitized);
  }

  if (images.length === 0 && fallbackImage) {
    const sanitizedFallback = sanitizeText(fallbackImage);
    if (sanitizedFallback) images.push(sanitizedFallback);
  }

  return images;
};

const normalizeSpecificationsInput = (specifications, fallback = {}) => {
  // Normalize fallback first to avoid spreading a Map (which introduces mongoose internals)
  let fallbackObj = {};
  if (fallback instanceof Map) {
    fallbackObj = Object.fromEntries(fallback.entries());
  } else if (Array.isArray(fallback)) {
    // allow array of [key, value]
    fallbackObj = Object.fromEntries(
      fallback.filter((item) => Array.isArray(item) && item.length >= 2)
    );
  } else if (fallback && typeof fallback === 'object') {
    fallbackObj = { ...fallback };
  }

  if (!specifications) {
    return { ...fallbackObj };
  }

  let entries = [];
  if (specifications instanceof Map) {
    entries = Array.from(specifications.entries());
  } else if (Array.isArray(specifications)) {
    entries = specifications.filter((item) => Array.isArray(item) && item.length >= 2);
  } else if (typeof specifications === 'object') {
    entries = Object.entries(specifications);
  }

  if (!entries.length) {
    return { ...fallbackObj };
  }

  const normalized = { ...fallbackObj };
  entries.forEach(([rawKey, rawValue]) => {
    const key = sanitizeText(rawKey);
    if (!key || key === '__proto__' || key === 'constructor' || key === 'prototype') return;
    const value = rawValue === null || rawValue === undefined ? '' : sanitizeText(rawValue);
    normalized[key] = value;
  });

  return normalized;
};

const extractMetalCompositionInput = (body) => {
  if (!body) return [];
  if (Array.isArray(body.metalComposition)) return body.metalComposition;
  if (Array.isArray(body.metals)) return body.metals;
  if (Array.isArray(body.metalSheet)) return body.metalSheet;
  if (Array.isArray(body.metalTechnicalSheet)) return body.metalTechnicalSheet;
  return [];
};

const fetchNormalizedMetalPricingSettings = async () => {
  const settingsDoc = await Settings.findOne({ key: 'global' }).lean();
  return normalizeSettings(settingsDoc || {});
};

const buildPricingSnapshot = ({
  compositionInput,
  fallbackPrice,
  settings
}) => {
  const pricing = computeProductPricing({
    composition: compositionInput,
    settings
  });

  const hasMetals = hasAnyMetalQuantity(pricing.composition);
  const fallbackParsed = parseNumber(fallbackPrice);
  const fallbackRounded = fallbackParsed >= 0 ? roundCurrency(fallbackParsed) : 0;
  const finalPrice = hasMetals ? pricing.price : fallbackRounded;

  return {
    composition: pricing.composition,
    summary: pricing.summary,
    price: finalPrice,
    calculatedPrice: pricing.price,
    hasMetals
  };
};

const normalizeProductResponse = (doc, userContext = null) => {
  if (!doc) return doc;
  const product = doc.toObject ? doc.toObject() : doc;

  const rawImages = Array.isArray(product.images)
    ? product.images
    : product.image
      ? [product.image]
      : [];
  product.images = normalizeImagesInput(rawImages);

  if (product.specifications instanceof Map) {
    product.specifications = Object.fromEntries(product.specifications.entries());
  } else if (!product.specifications || typeof product.specifications !== 'object') {
    product.specifications = {};
  }

  const summary = product.metalSummary && typeof product.metalSummary === 'object'
    ? product.metalSummary
    : { totalMetalValueBRL: 0, totalWeightKg: 0 };

  product.metalSummary = {
    totalMetalValueBRL: roundCurrency(summary.totalMetalValueBRL ?? 0),
    totalWeightKg: normalizeMetalValue(summary.totalWeightKg ?? 0)
  };

  const composition = Array.isArray(product.metalComposition)
    ? product.metalComposition
    : [];
  product.metalComposition = buildMetalTechnicalSheet(composition);

  const pricingView = computePriceForUser(product.price, userContext);
  product.basePrice = pricingView.basePrice;
  product.price = pricingView.price;
  product.partnerPrice = pricingView.price;
  product.partnerLevelPercentage = pricingView.levelPercentage;
  product.partnerLevelName = pricingView.levelName;

  if (userContext?.role === 'admin') {
    const internal = product.internalMetals || {};
    product.internalMetals = {
      platina: normalizeMetalValue(internal.platina ?? 0),
      paladio: normalizeMetalValue(internal.paladio ?? 0),
      rodio: normalizeMetalValue(internal.rodio ?? 0)
    };
  } else {
    delete product.internalMetals;
  }
  return product;
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      price,
      category,
      images,
      specifications,
      sku,
      purchasePanelStyle
    } = req.body;

    const compositionInput = extractMetalCompositionInput(req.body);
    const settings = await fetchNormalizedMetalPricingSettings();
    const pricingSnapshot = buildPricingSnapshot({
      compositionInput,
      fallbackPrice: price,
      settings
    });

    const internalMetalsInput = normalizeInternalMetalsInput(req.body).values || { platina: 0, paladio: 0, rodio: 0 };

    const product = new Product({
      name,
      description,
      brand,
      price: pricingSnapshot.price,
      category,
      images: normalizeImagesInput(images),
      specifications: normalizeSpecificationsInput(specifications),
      sku: sanitizeText(sku),
      purchasePanelStyle: purchasePanelStyle || 'highlight',
      metalComposition: pricingSnapshot.composition,
      metalSummary: pricingSnapshot.summary,
      internalMetals: internalMetalsInput,
      updatedAt: new Date()
    });

    await product.save();
    res.status(201).json({ message: 'Produto criado com sucesso', product: normalizeProductResponse(product, req.user) });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar produto', error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products.map((p) => normalizeProductResponse(p, req.user)));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productDoc = await Product.findById(req.params.id);
    if (!productDoc) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(normalizeProductResponse(productDoc, req.user));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produto', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const {
      name,
      description,
      brand,
      price,
      category,
      images,
      specifications,
      purchasePanelStyle
    } = req.body;

    const compositionInput = extractMetalCompositionInput(req.body);
    const effectiveComposition = compositionInput.length > 0 ? compositionInput : product.metalComposition;
    const settings = await fetchNormalizedMetalPricingSettings();
    const pricingSnapshot = buildPricingSnapshot({
      compositionInput: effectiveComposition,
      fallbackPrice: price ?? product.price,
      settings
    });

    const internalMetalsInput = normalizeInternalMetalsInput(req.body);

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.brand = brand ?? product.brand;
    product.category = category ?? product.category;
    product.price = pricingSnapshot.price;
    product.sku = sanitizeText(req.body.sku ?? product.sku);
    product.purchasePanelStyle = purchasePanelStyle || product.purchasePanelStyle;

    if (images !== undefined) {
      product.images = normalizeImagesInput(images);
    }

    if (specifications !== undefined) {
      product.specifications = normalizeSpecificationsInput(specifications, product.specifications);
    }

    product.metalComposition = pricingSnapshot.composition;
    product.metalSummary = pricingSnapshot.summary;
    if (internalMetalsInput.provided) {
      product.internalMetals = internalMetalsInput.values;
    }
    product.updatedAt = new Date();

    await product.save();
    res.json({ message: 'Produto atualizado', product: normalizeProductResponse(product, req.user) });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar produto', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json({ message: 'Produto deletado', product: normalizeProductResponse(product, req.user) });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar produto', error: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar categorias', error: error.message });
  }
};

export const recalculateAllMetalPrices = async (req, res) => {
  try {
    const normalizedSettings = await fetchNormalizedMetalPricingSettings();
    const products = await Product.find({ isActive: true });
    let updatedCount = 0;

    for (const product of products) {
      const pricing = computeProductPricing({
        composition: Array.isArray(product.metalComposition) ? product.metalComposition : [],
        settings: normalizedSettings
      });

      const hasMetals = hasAnyMetalQuantity(pricing.composition);
      const nextPrice = hasMetals ? pricing.price : product.price;

      product.metalComposition = pricing.composition;
      product.metalSummary = pricing.summary;
      if (hasMetals) {
        product.price = nextPrice;
      }
      product.updatedAt = new Date();
      await product.save();
      updatedCount += 1;
    }

    res.json({ message: 'Preços recalculados com sucesso', updatedCount });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao recalcular preços', error: error.message });
  }
};

export const downloadPriceSheet = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .select('sku name category internalMetals')
      .sort({ createdAt: -1 });
    const rows = products.map((p) => ({
      SKU: sanitizeText(p.sku),
      'Nome do Produto': sanitizeText(p.name),
      Categoria: sanitizeText(p.category),
      Preço: '',
      Platina: p.internalMetals?.platina ?? '',
      Paladio: p.internalMetals?.paladio ?? '',
      Rodio: p.internalMetals?.rodio ?? ''
    }));

    const headers = ['SKU', 'Nome do Produto', 'Categoria', 'Preço', 'Platina', 'Paladio', 'Rodio'];
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="planilha-valor-dos-produtos.xlsx"');
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao gerar planilha de produtos', error: error.message });
  }
};

export const importPriceSheet = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames?.[0];
    if (!firstSheetName) {
      return res.status(400).json({ message: 'Planilha vazia ou inválida' });
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    let updatedCount = 0;
    const notFound = [];
    const skipped = [];

    for (const row of rows) {
      const sku = sanitizeText(row.SKU ?? row.sku ?? row.Sku ?? row.sKu ?? row['Sku'] ?? row['sku'] ?? '');
      if (!sku) continue;

      const rawPrice = row.Preço ?? row['Preco'] ?? row['PREÇO'] ?? row['preco'] ?? row['Preço'] ?? row['Preço '] ?? row['preço'] ?? row['Preço (R$)'];
      const rawPriceText = sanitizeText(rawPrice);

      // Skip lines with empty price to avoid overwriting existing values with zero
      if (!rawPriceText) {
        skipped.push(sku);
        continue;
      }

      // Allow values like "R$ 1.234,56" by stripping currency symbols/non-breaking spaces
      const cleanedPrice = rawPriceText.replace(/[R$\s\u00A0]/gi, '');
      const parsedPrice = parseNumber(cleanedPrice);
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        skipped.push(sku);
        continue;
      }

      const product = await Product.findOne({ sku });
      if (!product) {
        notFound.push(sku);
        continue;
      }

      product.price = roundCurrency(parsedPrice);
      product.updatedAt = new Date();
      await product.save();
      updatedCount += 1;
    }

    return res.json({
      message: 'Importação concluída',
      updatedCount,
      notFound,
      skipped
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao importar preços', error: error.message });
  }
};

export const getProductBySku = async (req, res) => {
  try {
    const sku = sanitizeText(req.params.sku);
    if (!sku) {
      return res.status(400).json({ message: 'SKU não informado' });
    }

    const productDoc = await Product.findOne({ sku });
    if (!productDoc) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const normalized = normalizeProductResponse(productDoc, req.user);
    return res.json({
      sku: normalized.sku,
      name: normalized.name,
      category: normalized.category,
      price: normalized.price,
      product: normalized
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar produto por SKU', error: error.message });
  }
};
