import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI } from '../api';
import { 
  ShoppingCart, 
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

const flyImageToCart = (imageUrl, sourceElement) => {
  try {
    const cartIcon = document.getElementById('cart-icon');
    if (!cartIcon || !sourceElement) return;
    const iconRect = cartIcon.getBoundingClientRect();
    const srcRect = sourceElement.getBoundingClientRect();

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Produto';
    img.style.position = 'fixed';
    img.style.left = `${srcRect.left}px`;
    img.style.top = `${srcRect.top}px`;
    img.style.width = `${srcRect.width}px`;
    img.style.height = `${srcRect.height}px`;
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';
    img.style.zIndex = '9999';
    img.style.transition = 'all 700ms cubic-bezier(0.22, 1, 0.36, 1)';
    img.style.boxShadow = '0 12px 30px rgba(0,0,0,0.25)';
    img.style.filter = 'brightness(1.02) saturate(1.05)';

    document.body.appendChild(img);

    requestAnimationFrame(() => {
      img.style.left = `${iconRect.left + iconRect.width / 2 - srcRect.width * 0.15}px`;
      img.style.top = `${iconRect.top + iconRect.height / 2 - srcRect.height * 0.15}px`;
      img.style.width = `${srcRect.width * 0.3}px`;
      img.style.height = `${srcRect.height * 0.3}px`;
      img.style.opacity = '0.7';
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
  const [product, setProduct] = useState(null);
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

    // Animação visual: imagem voando para o carrinho
    try {
      const galleryImg = document.querySelector('.aspect-square img');
      const imageUrl = getPrimaryProductImage(product);
      flyImageToCart(imageUrl, galleryImg);
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
  // Ordem: Marca, Modelo, Código, Peso, Platina, Paládio, Ródio
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

  // Metais prioritários
  const priorityDefs = [
    { label: 'Peso', aliases: ['Peso', 'peso', 'Peso (kg)', 'peso (kg)'] },
    { label: 'Platina', aliases: ['Platina', 'platina', 'Platina (kg)', 'platina (kg)'] },
    { label: 'Paládio', aliases: ['Paládio', 'Paladio', 'paládio', 'paladio', 'Paládio (kg)', 'paladio (kg)'] },
    { label: 'Ródio', aliases: ['Ródio', 'Rodio', 'rodio', 'Ródio (kg)', 'rodio (kg)'] }
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
    <div className="container-page">
      {/* Toast removido conforme solicitação */}
      {/* Breadcrumb */}
      <div className="mb-6">
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
        <div className="space-y-6">
          <div>
            <span className="badge badge-info mb-2">{product.category}</span>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-lg text-gray-600">{product.brand}</p>
          </div>

          {/* Painel de Preço/Compra com estilo configurável */
          /* Inclui ficha técnica dentro do painel */}
          {(() => {
            const panelStyle = product.purchasePanelStyle || 'highlight';
            const panelClasses = panelStyle === 'plain'
              ? 'bg-white border border-gray-200 rounded-lg p-6'
              : 'bg-ebenezer-light rounded-lg p-6';
            return (
              <div className={panelClasses}>
                {specRows.length > 0 && (
                  <div className="mb-6">
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

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-ebenezer-green">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <span className="text-gray-600">/ unidade</span>
                </div>
                {/* Linha de disponibilidade removida conforme solicitação */}

                <div className="mt-6 space-y-4">
                    <div>
                      <label className="label">Quantidade</label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-ebenezer-green flex items-center justify-center font-bold text-xl"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="input text-center text-xl font-bold w-24"
                        />
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-ebenezer-green flex items-center justify-center font-bold text-xl"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={addToCart}
                      className="btn-primary w-full text-lg flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      Adicionar ao Carrinho
                    </button>
                  </div>
              </div>
            );
          })()}

          {/* Bloco SKU removido */}
        </div>
      </div>

      {/* Descrição */}
      <div className="mt-12">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Descrição do Produto
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}
