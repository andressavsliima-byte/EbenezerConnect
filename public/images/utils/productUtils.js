const CATEGORY_FALLBACKS = {
  'Motores': '/images/slide1.jpg',
  'Correntes': '/images/slide2.jpg',
  'Rolamentos': '/images/slide3.jpg',
  'Polias': '/images/slide4.jpg',
  'Correias': '/images/slide2.jpg',
  'Acoplamentos': '/images/slide1.jpg'
};

export const getPrimaryProductImage = (product, fallback = '/images/placeholder.jpg') => {
  if (!product) return fallback;
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  if (product.image) {
    return product.image;
  }
  const cat = (product.category || '').trim();
  if (cat && CATEGORY_FALLBACKS[cat]) {
    return CATEGORY_FALLBACKS[cat];
  }
  return fallback;
};
