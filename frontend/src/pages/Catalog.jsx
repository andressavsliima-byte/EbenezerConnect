import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../api';
import { Search, AlertCircle, Package, LayoutGrid, ClipboardList, Heart, ShoppingCart, User, LogOut } from 'lucide-react';
import TopSearchBar from '../components/TopSearchBar';
import { getPrimaryProductImage } from '../utils/productUtils';

export default function Catalog() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Removido toast visual conforme solicitado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

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

  const emptyTitle = filters.search ? 'Produto não encontrado' : 'Nenhum produto encontrado';
  const emptyDescription = filters.search
    ? 'Confirme o SKU digitado ou tente outro termo.'
    : 'Tente ajustar os filtros ou fazer uma nova busca';

  const handleLogout = () => {
    try {
      const uStr = localStorage.getItem('user');
      if (uStr) {
        const u = JSON.parse(uStr);
        localStorage.setItem('lastEmail', u?.email || '');
      }
    } catch {}
    localStorage.removeItem('token');
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop header com logo e busca */}
      <div className="hidden md:block sticky top-0 z-[90] bg-[#4e7330]">
        <TopSearchBar
          withLogo
          sticky
          value={filters.search}
          onChange={(val) => setFilters((f) => ({ ...f, search: val }))}
          onSubmit={fetchProducts}
        />
      </div>

      {/* Mobile header verde com busca compacta */}
      <div className="md:hidden w-full bg-[#4e7330] text-white py-6 px-4 flex items-center gap-3">
        <div className="flex-1 max-w-[78%]">
          <form onSubmit={(e) => { e.preventDefault(); fetchProducts(); }}>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar no catálogo"
                className="w-full bg-white text-gray-800 placeholder-gray-400 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white shadow-md"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow"
                aria-label="Buscar"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-12 h-12 ml-[1.85rem] rounded-md border border-white/50 flex flex-col items-center justify-center gap-1 bg-white/10"
          aria-label="Menu"
        >
          <span className="w-6 h-[2px] bg-white rounded-full"></span>
          <span className="w-6 h-[2px] bg-white rounded-full"></span>
          <span className="w-6 h-[2px] bg-white rounded-full"></span>
        </button>
      </div>

      {/* Mobile side menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden
          ></div>
          <div className="fixed inset-y-0 left-0 z-50 w-[78vw] max-w-xs bg-[#e6ecc4] shadow-2xl flex flex-col">
            <div className="p-5 pb-2">
              <img src="/images/logo-branca.png" alt="Recicla Ebenezer" className="w-60 h-auto -ml-4" />
            </div>
            <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 text-[#405023] text-base font-medium">
              <Link to="/catalogo" className="flex items-center gap-3 py-3" onClick={() => setIsMobileMenuOpen(false)}>
                <LayoutGrid className="w-5 h-5" />
                <span>Catálogo</span>
              </Link>
              <Link to="/pedidos" className="flex items-center gap-3 py-3" onClick={() => setIsMobileMenuOpen(false)}>
                <ClipboardList className="w-5 h-5" />
                <span>Pedidos</span>
              </Link>
              <Link to="/favoritos" className="flex items-center gap-3 py-3" onClick={() => setIsMobileMenuOpen(false)}>
                <Heart className="w-5 h-5" />
                <span>Favoritos</span>
              </Link>
              <Link to="/carrinho" className="flex items-center gap-3 py-3" onClick={() => setIsMobileMenuOpen(false)}>
                <ShoppingCart className="w-5 h-5" />
                <span>Carrinho</span>
              </Link>
              <Link to="/perfil" className="flex items-center gap-3 py-3" onClick={() => setIsMobileMenuOpen(false)}>
                <User className="w-5 h-5" />
                <span>Perfil</span>
              </Link>
              <button type="button" className="flex items-center gap-3 py-3 text-left w-full" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </nav>
          </div>
        </>
      )}

      <div className="px-3 md:px-6 lg:px-10 py-4 md:py-8 max-w-7xl mx-auto">

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
            {emptyTitle}
          </h3>
          <p className="text-gray-600 mb-6">
            {emptyDescription}
          </p>
          <button onClick={clearFilters} className="btn-primary">
            Limpar Filtros
          </button>
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
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
              const skuLabel = product?.sku || product?._id?.slice(-6) || '—';
              const priceLabel = isAuthenticated ? formattedPrice : 'Faça login para ver os preços';
              return (
                <Link
                  key={product._id}
                  to={`/produto/${product._id}`}
                  className="block bg-white rounded-xl shadow-md md:shadow border border-gray-100 overflow-hidden"
                >
                  <div className="h-40 bg-white flex items-center justify-center p-3 md:p-4">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="px-3 md:px-4 pt-2 pb-1">
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-[12px] text-gray-500 uppercase mt-1">{product.brand}</p>
                  </div>
                  <div className="px-3 md:px-4 pb-3 md:pb-4">
                    <div className="flex items-center gap-2 text-[11px] text-gray-600">
                      <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-semibold text-ebenezer-green">
                        {brandInitials}
                      </span>
                      <span className="text-[11px] text-gray-500">{skuLabel}</span>
                    </div>
                    <p className="text-lg md:text-xl font-extrabold text-[#6faf3a] mt-2">{priceLabel}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
      </div>
    </>
  );
}
