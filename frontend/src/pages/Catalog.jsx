import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../api';
import { Search, Filter, ShoppingCart, Package, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPrimaryProductImage } from '../utils/productUtils';
import { flyToCart } from '../utils/flyToCart';
import MobileCatalogHero from '../components/MobileCatalogHero';
import TopSearchBar from '../components/TopSearchBar';
import { promosAPI } from '../api';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Removido toast visual conforme solicitado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await promosAPI.getPublic();
        const list = Array.isArray(data) ? data.filter(p => p.active) : [];
        setPromos(list);
      } catch (e) {
        setPromos([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (promos.length <= 1) return;
    const id = setInterval(() => setBannerIndex((i) => (i + 1) % promos.length), 6000);
    return () => clearInterval(id);
  }, [promos.length]);

  const prevBanner = () => setBannerIndex((i) => (i - 1 + promos.length) % promos.length);
  const nextBanner = () => setBannerIndex((i) => (i + 1) % promos.length);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setIsAuthenticated(Boolean(storedToken));
  }, []);

  const currencyFormatter = useMemo(() => (
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
  ), []);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const response = await productsAPI.getAll(params);
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
    });
    setTimeout(fetchProducts, 100);
  };

  const addToCart = (product, evtTarget) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Disparar evento para atualizar navbar
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Animação de voo até o carrinho
    try {
      const card = evtTarget?.closest?.('.card-product');
      if (card) {
        const imgEl = card.querySelector('img');
        const src = imgEl?.src || getPrimaryProductImage(product);
        flyToCart(imgEl || card, src);
      }
    } catch {}

    // Toast removido: manter apenas animação e atualização de carrinho
  };

  return (
    <div className="container-page">
      {/* Barra superior de busca (estilo exemplo) */}
      <TopSearchBar
        value={filters.search}
        onChange={(val) => setFilters((f) => ({ ...f, search: val }))}
        onSubmit={fetchProducts}
      />
      {/* Mobile-only promo header before products */}
      <div className="md:hidden mb-4">
        <MobileCatalogHero />
      </div>
      {/* Desktop banner carousel */}
      {promos.length > 0 && (
        <div className="hidden md:block mb-6">
          {/* Desktop banner carousel */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl -mx-16">
            <a href={promos[bannerIndex]?.linkUrl || '#'} className="block">
              <img
                src={promos[bannerIndex]?.imageUrl}
                alt={promos[bannerIndex]?.title || 'Banner'}
                className="w-full h-[280px] object-cover"
                onError={(e) => { e.currentTarget.src = '/images/placeholder.jpg'; }}
              />
            </a>
            {promos.length > 1 && (
              <>
                <button onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow">
                  <ChevronLeft className="w-5 h-5 text-emerald-600" />
                </button>
                <button onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow">
                  <ChevronRight className="w-5 h-5 text-emerald-600" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {promos.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Ir para banner ${i+1}`}
                      onClick={() => setBannerIndex(i)}
                      className={`h-2.5 w-2.5 rounded-full ${i===bannerIndex ? 'bg-white' : 'bg-white/60'} shadow border border-white/40`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Hero de busca removido conforme solicitado */}

      {/* Mensagem de Erro */}
      {error && (
        <div className="alert alert-error mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="spinner w-16 h-16"></div>
        </div>
      )}

      {/* Lista de Produtos */}
      {!loading && products.length === 0 && (
        <div className="text-center py-20">
          <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            Tente ajustar os filtros ou fazer uma nova busca
          </p>
          <button onClick={clearFilters} className="btn-primary">
            Limpar Filtros
          </button>
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          <div className="mb-4 text-gray-600">
            Mostrando {products.length} produto{products.length !== 1 ? 's' : ''}
          </div>
          
          <div className="grid-products gap-4 sm:gap-6">
            {products.map((product) => {
              const imageUrl = getPrimaryProductImage(product);
              const priceValue = typeof product.price === 'number' ? product.price : 0;
              const formattedPrice = currencyFormatter.format(priceValue);
              const brandInitials = product?.brand
                ? product.brand
                    .split(' ')
                    .filter(Boolean)
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : '—';
              const topMetals = Array.isArray(product?.metalComposition)
                ? [...product.metalComposition]
                    .sort((a, b) => (b?.quantityKg || 0) - (a?.quantityKg || 0))
                    .slice(0, 2)
                : [];
              const skuLabel = product?.sku || product?._id?.slice(-6) || '—';
              return (
                <div key={product._id} className="card-product flex flex-col h-full rounded-2xl sm:rounded-3xl border border-gray-100">
                  <Link to={`/produto/${product._id}`} className="block px-3 pt-3 sm:px-6 sm:pt-6">
                    <div className="relative h-44 sm:h-56 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden shadow-inner">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder.svg';
                        }}
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-semibold tracking-wide">
                            SEM ESTOQUE
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 px-3 pb-3 sm:px-6 sm:pb-6 flex flex-col">
                    <Link to={`/produto/${product._id}`} className="mt-3">
                      <h3 className="text-base sm:text-xl font-semibold text-gray-900 leading-tight line-clamp-2 hover:text-ebenezer-green transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-[11px] sm:text-sm text-gray-500 mt-1 uppercase tracking-wide">
                      {product.brand}
                    </p>

                    {/* seção de conteúdo de metais removida conforme solicitado */}

                    <div className="mt-auto pt-3 sm:pt-6 border-t border-gray-100 flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-emerald-100 flex items-center justify-center bg-white shadow-sm">
                        <span className="text-[11px] sm:text-sm font-semibold text-emerald-600">{brandInitials}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] sm:text-sm text-gray-500 font-medium">{skuLabel}</p>
                        <p className="text-sm sm:text-base font-semibold text-ebenezer-green">
                          {isAuthenticated ? formattedPrice : 'Faça login para ver os preços'}
                        </p>
                      </div>
                      {/* Botão "Ver detalhes" removido: clique na imagem/título já abre detalhes */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
