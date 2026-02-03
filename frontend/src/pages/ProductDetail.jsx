import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI } from '../api';
import { 
  ShoppingCart, 
  ShoppingBag,
  ArrowLeft, 
  Package, 
  DollarSign, 
  Tag,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Heart } from 'lucide-react';
import { getPrimaryProductImage } from '../utils/productUtils';
import { getFavorites, toggleFavorite } from '../utils/favorites';

const flyImageToCart = (imageUrl, sourceElement, opts = {}) => {
  const {
    startScale = 0.1,
    endScale = 0.1,
    startOpacity = 0.35,
    endOpacity = 0.12,
    enforceCircle = true,
  } = opts;
  try {
    const cartIcon = document.getElementById('cart-icon');
    if (!cartIcon || !sourceElement) return;
    const iconRect = cartIcon.getBoundingClientRect();
    const srcRect = sourceElement.getBoundingClientRect();

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Produto';
    img.style.position = 'fixed';
    const baseSize = enforceCircle ? Math.min(srcRect.width, srcRect.height) : srcRect.width;
    const initialSize = baseSize * startScale;
    img.style.left = `${srcRect.left + (srcRect.width - initialSize) / 2}px`;
    img.style.top = `${srcRect.top + (srcRect.height - initialSize) / 2}px`;
    img.style.width = `${initialSize}px`;
    img.style.height = `${enforceCircle ? initialSize : srcRect.height * startScale}px`;
    img.style.borderRadius = '50%';
    img.style.border = '1.5px solid rgba(255,255,255,0.6)';
    img.style.background = 'rgba(255,255,255,0.1)';
    img.style.objectFit = 'cover';
    img.style.zIndex = '9999';
    img.style.transition = 'all 850ms cubic-bezier(0.22, 1, 0.36, 1)';
    img.style.boxShadow = '0 14px 34px rgba(0,0,0,0.30)';
    img.style.filter = 'brightness(1.02) saturate(1.05)';
    img.style.opacity = String(startOpacity);

    document.body.appendChild(img);

    requestAnimationFrame(() => {
      img.style.left = `${iconRect.left + iconRect.width / 2 - srcRect.width * 0.15}px`;
      img.style.top = `${iconRect.top + iconRect.height / 2 - srcRect.height * 0.15}px`;
      const finalSize = baseSize * endScale;
      img.style.width = `${finalSize}px`;
      img.style.height = `${enforceCircle ? finalSize : srcRect.height * endScale}px`;
      img.style.opacity = String(endOpacity);
      img.style.transform = 'rotate(-6deg)';
    });

    setTimeout(() => {
      img.remove();
      try {
        cartIcon.classList.add('cart-bump');
        cartIcon.classList.add('cart-pulse');
        setTimeout(() => cartIcon.classList.remove('cart-bump'), 350);
        setTimeout(() => cartIcon.classList.remove('cart-pulse'), 650);
      } catch {}
    }, 650);
  } catch {}
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCartBtnRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [cartCount, setCartCount] = useState(() => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    } catch {
      return 0;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [favorites, setFavorites] = useState(getFavorites());
  // Removido toast de confirmação ao adicionar ao carrinho

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      setError('Erro ao carregar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onFavUpdate = () => setFavorites(getFavorites());
    window.addEventListener('favoritesUpdated', onFavUpdate);
    return () => window.removeEventListener('favoritesUpdated', onFavUpdate);
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(total);
      } catch {}
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  const addToCart = () => {
    if (!product || quantity < 1) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const image = getPrimaryProductImage(product);
      cart.push({ ...product, image, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    try {
      setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 0), 0));
    } catch {}

    // Animação visual: imagem voando do botão para o carrinho
    try {
      const imageUrl = getPrimaryProductImage(product);
      const sourceEl = document.querySelector('.aspect-square img')
        || addToCartBtnRef.current
        || document.querySelector('.btn-primary');
      flyImageToCart(imageUrl, sourceEl, { startScale: 0.1, endScale: 0.1, startOpacity: 0.35, endOpacity: 0.12 });
    } catch {}

    // Feedback por animação (sem toast)
  };

  if (loading) {
    return (
      <div className="container-page">
        <div className="flex justify-center items-center py-20">
          <div className="spinner w-16 h-16"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-page">
        <div className="text-center py-20">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Produto não encontrado
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/catalogo" className="btn-primary">
            Voltar ao Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const productImages = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [getPrimaryProductImage(product)];
  
  const currentImage = productImages[selectedImageIndex] || productImages[0];

  const formatCurrency = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  // Monta linhas da ficha técnica seguindo ordem e renomeação solicitadas:
  // Ordem: Marca, Modelo, Código, Peso
  const specRows = [];
  if (product.brand) specRows.push(['Marca', product.brand]);

  const specsObj = (product.specifications && typeof product.specifications === 'object') ? product.specifications : {};
  const entries = Object.entries(specsObj);

  const stripKg = (label) => String(label || '').replace(/\s*\(kg\)\s*$/i, '').trim();
  const normalizeForComparison = (value) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const trySpecValue = (alias) => {
    if (!alias) return null;
    const trimmed = alias.trim();
    if (!trimmed) return null;
    const candidate = specsObj[trimmed];
    if (candidate !== undefined && candidate !== null) return String(candidate);
    const kgKey = `${trimmed} (kg)`;
    const candidateKg = specsObj[kgKey];
    if (candidateKg !== undefined && candidateKg !== null) return String(candidateKg);
    return null;
  };

  const getSpecValue = (...aliases) => {
    for (const alias of aliases) {
      const value = trySpecValue(alias);
      if (value !== null) return value;
    }
    return null;
  };

  // Modelo
  const modeloVal = getSpecValue('Modelo', 'modelo', 'Largura', 'largura');
  specRows.push(['Modelo', modeloVal ?? '—']);

  // Código
  const codigoVal = getSpecValue('Código', 'Codigo', 'codigo', 'Comprimento', 'comprimento');
  specRows.push(['Código', codigoVal ?? '—']);

  const priorityDefs = [
    { label: 'Peso', aliases: ['Peso', 'peso', 'Peso (kg)', 'peso (kg)'] }
  ];
  for (const { label, aliases } of priorityDefs) {
    const val = getSpecValue(...aliases);
    specRows.push([label, val ?? '—']);
  }

  // Restantes (exclui os já tratados)
  const excludedNormalized = new Set(['marca', 'modelo', 'codigo', 'peso', 'platina', 'paladio', 'rodio', 'largura', 'comprimento', 'torque', 'tipo']);
  for (const [k, v] of entries) {
    const mapped = k === 'Largura' ? 'Modelo' : k === 'Comprimento' ? 'Código' : k;
    const normalized = normalizeForComparison(stripKg(mapped));
    if (excludedNormalized.has(normalized)) continue;
    specRows.push([stripKg(mapped), String(v)]);
  }
  // Não incluir Valor aqui; preço já aparece em destaque no painel

  return (
    <>
      <div className="bg-[#4e7330] text-white shadow-md flex items-center justify-between px-4 sm:px-6 md:px-8 h-24 md:h-20 w-full">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="Recicla Ebenezer" className="h-36 w-auto object-contain drop-shadow" />
          <span className="sr-only">Recicla Ebenezer</span>
        </div>
        <Link
          to="/carrinho"
          id="cart-icon"
          className="relative flex items-center justify-center w-10 h-10 text-white hover:text-white/80 transition-colors"
          aria-label="Ir para o carrinho"
        >
          <ShoppingBag className="w-7 h-7" strokeWidth={2.1} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-white text-ebenezer-green text-xs font-semibold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-sm">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      <div className="container-page">
        {/* Toast removido conforme solicitação */}
        {/* Breadcrumb (esconde no mobile) */}
        <div className="mb-6 hidden md:block">
          <Link
            to="/catalogo"
            className="inline-flex items-center text-gray-600 hover:text-ebenezer-green transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Catálogo
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galeria de Imagens do Produto */}
        <div className="space-y-4">
          {/* Botão de voltar só no mobile */}
          <div className="flex justify-start mb-2 md:mb-3 md:hidden">
            <button
              className="bg-white/90 hover:bg-white rounded-full p-2 shadow"
              onClick={() => navigate(-1)}
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/images/placeholder.svg';
                }}
              />
              {/* Favorite toggle on detail gallery */}
              <button
                className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow"
                onClick={(e) => {
                  e.preventDefault();
                  const next = toggleFavorite(product);
                  setFavorites(next);
                }}
                title="Adicionar aos favoritos"
              >
                {favorites.find(f => f._id === product._id) ? (
                  <Heart className="w-6 h-6 text-rose-500" />
                ) : (
                  <Heart className="w-6 h-6 text-gray-400" />
                )}
              </button>
              {productImages.length > 1 && selectedImageIndex > 0 && (
                <button
                  type="button"
                  aria-label="Imagem anterior"
                  onClick={() => setSelectedImageIndex((i) => Math.max(0, i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow p-2"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {productImages.length > 1 && selectedImageIndex < productImages.length - 1 && (
                <button
                  type="button"
                  aria-label="Próxima imagem"
                  onClick={() => setSelectedImageIndex((i) => Math.min(productImages.length - 1, i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow p-2"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
          
          {/* Miniaturas */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index 
                      ? 'border-ebenezer-green shadow-lg scale-105' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.svg';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações do Produto */}
        <div className="space-y-4 flex flex-col h-full pr-1">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3 text-center md:text-left">
              {product.name}
            </h1>
          </div>

          {/* Preço em destaque para mobile */}
          <div className="block md:hidden">
            <div className="h-2 bg-ebenezer-green rounded-full mb-3"></div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-extrabold text-ebenezer-green">R$ {product.price.toFixed(2)}</span>
              <span className="text-gray-600">/ unidade</span>
            </div>
            <div className="h-2 bg-ebenezer-green rounded-full"></div>
          </div>

          {/* Painel de Preço/Compra com estilo configurável */
          /* Inclui ficha técnica dentro do painel */}
          {(() => {
            const panelStyle = product.purchasePanelStyle || 'highlight';
            const panelClasses = panelStyle === 'plain'
              ? 'bg-white border border-gray-200 rounded-lg p-6'
              : 'bg-ebenezer-light rounded-lg p-6';
            return (
              <div className={`${panelClasses} flex flex-col gap-3 md:mt-auto mt-2 p-4 md:p-5`}>
                {specRows.length > 0 && (
                  <div className="mb-4 md:mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Ficha Técnica</h3>
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                      {specRows.map(([label, value], idx) => (
                        <div
                          key={`${label}-${idx}`}
                          className={`grid grid-cols-2 md:grid-cols-[180px_1fr] ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        >
                          <div className="border-b-2 border-gray-200 p-3 font-semibold text-gray-800">
                            {String(label).replace(/\s*\(kg\)\s*$/i, '').trim()}
                          </div>
                          <div className="border-l-2 border-b-2 border-gray-200 p-3 text-gray-800">
                            {typeof value === 'string' 
                              ? value.replace(/\s*\(kg\)\s*$/i, '').trim() 
                              : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="hidden md:flex items-baseline gap-2 mb-1">
                  <span className="text-2xl md:text-3xl font-bold text-ebenezer-green leading-tight">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-600">/ unidade</span>
                </div>
                {/* Linha de disponibilidade removida conforme solicitação */}

                <div className="mt-4 space-y-3 hidden md:block">
                  <div>
                    <label className="label text-sm font-semibold text-gray-700">Quantidade</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 rounded-lg border-2 border-gray-300 hover:border-ebenezer-green flex items-center justify-center font-bold text-lg"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="input text-center text-lg font-bold w-20 h-11"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-9 h-9 rounded-lg border-2 border-gray-300 hover:border-ebenezer-green flex items-center justify-center font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    ref={addToCartBtnRef}
                    onClick={addToCart}
                    className="btn-primary w-full text-base md:text-lg flex items-center justify-center gap-2 py-3"
                  >
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                    Adicionar ao Carrinho
                  </button>
                </div>

                {/* Botão mobile dentro do painel, abaixo da ficha */}
                <div className="md:hidden mt-4">
                  <button
                    ref={addToCartBtnRef}
                    onClick={addToCart}
                    className="btn-primary w-full text-lg flex items-center justify-center gap-2 py-3"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Adicionar ao Carrinho
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Bloco SKU removido */}
        </div>
      </div>

      </div>

      {/* Descrição */}
      <div className="container-page mt-4 pb-0">
        <div className="card mb-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Descrição do Produto
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-1">
            {product.description}
          </p>
        </div>
      </div>

      {/* Final da página com cor de fundo para evitar área branca vazia no mobile */}
      <div className="h-3 md:h-5 w-full bg-ebenezer-green"></div>
    </>
  );
}
