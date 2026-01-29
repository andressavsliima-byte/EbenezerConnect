import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../api';
import { Search, Filter, ShoppingCart, Package, AlertCircle } from 'lucide-react';
import { getPrimaryProductImage } from '../utils/productUtils';
import { flyToCart } from '../utils/flyToCart';
import TopSearchBar from '../components/TopSearchBar';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Removido toast visual conforme solicitado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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

  // Banners removidos do catálogo

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
    <>
      {/* Barra preta em largura total com logo + busca (padronizada) */}
      <TopSearchBar
        withLogo
        value={filters.search}
        onChange={(val) => setFilters((f) => ({ ...f, search: val }))}
        onSubmit={fetchProducts}
      />
      <div className="container-page">
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
              const priceLabel = isAuthenticated ? formattedPrice : 'Faça login para ver os preços';
              return (
                <div key={product._id} className="card-product group relative flex flex-col h-full rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden">
                  <Link to={`/produto/${product._id}`} className="block px-3 pt-3 sm:px-6 sm:pt-6">
                    <div className="relative h-44 sm:h-56 bg-white rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
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

                    <div className="mt-auto -mx-3 sm:-mx-6">
                      <div className="px-3 sm:px-5 py-2 sm:py-3 bg-[#f5f6f8] flex items-center gap-3 sm:gap-3">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-emerald-100 flex items-center justify-center bg-white shadow-sm">
                          <span className="text-[10px] sm:text-xs font-semibold text-emerald-600">{brandInitials}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] sm:text-xs text-gray-500 font-medium">{skuLabel}</p>
                          <p className="text-[11px] sm:text-sm text-gray-500 font-medium uppercase tracking-wide">{product.brand}</p>
                        </div>
                      </div>
                      <div className="px-3 sm:px-5 py-3 sm:py-3 bg-white border-t border-gray-100">
                        <p className="text-xl sm:text-2xl font-extrabold text-[#6faf3a]">{priceLabel}</p>
                      </div>
                    </div>

                    {/* Overlay de destaque ao hover */}
                    <div className="pointer-events-none absolute inset-0 bg-[#8bcf59]/85 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-center px-6">
                      <Link
                        to={`/produto/${product._id}`}
                        className="pointer-events-auto inline-flex items-center justify-center px-6 py-3 rounded-md bg-[#7fbf3f] text-white font-semibold shadow uppercase tracking-wide"
                      >
                        Saiba Mais
                      </Link>
                      <p className="mt-4 text-white font-semibold text-base sm:text-lg leading-snug line-clamp-2 max-w-xs">
                        {product.name}
                      </p>
                      <p className="mt-4 text-white font-bold text-xl sm:text-2xl">
                        {priceLabel}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      </div>
    </>
  );
}
