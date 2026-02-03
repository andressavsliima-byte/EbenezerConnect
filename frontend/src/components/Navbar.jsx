import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  LayoutDashboard,
  Package
} from 'lucide-react';
import { messagesAPI } from '../api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'admin';
  const avatarUrl = user?.avatarUrl || '';

  useEffect(() => {
    // Lock scroll when any mobile menu is open
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Atualizar contador do carrinho
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const total = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    };

    updateCartCount();
    
    // Listener para mudanças no carrinho
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  // Buscar mensagens não lidas (apenas admin)
  useEffect(() => {
    if (isAdmin && token) {
      const fetchUnreadCount = async () => {
        try {
          const response = await messagesAPI.getUnreadCount();
          setUnreadCount(response.data.unreadCount ?? 0);
        } catch (error) {
          console.error('Erro ao buscar mensagens não lidas:', error);
        }
      };

      fetchUnreadCount();
      
      // Atualizar a cada 30 segundos
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, token]);

  const handleLogout = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        localStorage.setItem('lastEmail', u?.email || '');
      } catch {}
    }
    localStorage.removeItem('token');
    navigate('/');
  };

  const isActive = (path) => {
    if (!token) {
      return location.pathname === path ? 'text-ebenezer-black' : 'text-ebenezer-black/70 hover:text-ebenezer-black';
    }
    return location.pathname === path ? 'text-white' : 'text-white/80 hover:text-white';
  };

  const isPublic = !token;
  const navBg = isPublic ? 'bg-[#4e7330] text-white shadow-md' : 'bg-[#4e7330] text-white shadow-lg';

  return (
    <nav className={`${navBg} sticky top-0 z-50`}>
      <div className="w-full px-6 lg:px-10">
        {!token ? (
          <div className="flex items-center h-24 w-full gap-6">
            <Link to="/" className="flex items-center -ml-2 md:-ml-3">
              <img src="/images/logo.png" alt="Recicla Ebenezer" className="h-44 w-auto drop-shadow" />
            </Link>

            <div className="hidden md:flex items-center gap-10 text-base font-normal ml-auto mr-10">
              <Link to="/" className="text-white hover:text-white transition">Início</Link>
              <Link to="/login" className="text-white hover:text-white transition">Catálogo</Link>
              <Link to="/quem-somos" className="text-white hover:text-white transition">Quem Somos</Link>
              <Link to="/contato" className="text-white hover:text-white transition">Fale Conosco</Link>
            </div>

            {/* Mobile burger for public landing */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white ml-auto flex items-center justify-center w-12 h-12 rounded-md border border-white/50 bg-white/10"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="flex items-center h-24 w-full">
            <Link to={isAdmin ? '/admin' : '/catalogo'} className="flex items-center -ml-2 md:-ml-3">
              <img src="/images/logo.png" alt="Recicla Ebenezer" className="h-32 w-auto" />
            </Link>

            <div className="hidden md:flex items-center space-x-6 ml-auto">
              {!isAdmin && (
                <>
                  <Link to="/favoritos" className="relative" id="favorites-icon" aria-label="Favoritos">
                    <img src="/images/recc.png" alt="" className={`w-6 h-6 object-contain ${isActive('/favoritos')}`} />
                  </Link>

                  <Link to="/carrinho" className="relative" id="cart-icon" aria-label="Carrinho">
                    <img src="/images/recc.png" alt="" className={`w-6 h-6 object-contain ${isActive('/carrinho')}`} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-ebenezer-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link to="/admin/mensagens" className="relative">
                  <Bell className={`w-6 h-6 ${isActive('/admin/mensagens')}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white ml-auto"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && token && (
          isAdmin ? (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/35" onClick={() => setIsMenuOpen(false)} aria-hidden></div>
              <div
                className="relative h-full w-[78vw] max-w-xs bg-[#4e7330] text-white flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center px-5 pt-5 pb-6">
                  <img src="/images/logo.png" alt="Recicla Ebenezer" className="h-14 w-auto" />
                </div>

                <nav className="flex-1 px-5 space-y-4 text-lg font-semibold">
                  <Link to="/admin" className="block" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/admin/usuarios" className="block" onClick={() => setIsMenuOpen(false)}>
                    Usuários
                  </Link>
                  <Link to="/admin/produtos" className="block" onClick={() => setIsMenuOpen(false)}>
                    Produtos
                  </Link>
                  <button
                    type="button"
                    className="block text-left w-full"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Sair
                  </button>
                </nav>
              </div>
            </div>
          ) : (
            <div className="md:hidden pb-4 space-y-3">
              <Link
                to="/carrinho"
                id="cart-icon"
                className={`flex items-center space-x-2 ${isActive('/carrinho')} transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Carrinho</span>
                {cartCount > 0 && (
                  <span className="bg-ebenezer-green text-white text-xs rounded-full px-2 py-1">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                to="/perfil"
                className={`flex items-center space-x-2 ${isActive('/perfil')} transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                <span>Perfil</span>
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          )
        )}

        {isMenuOpen && !token && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/35" onClick={() => setIsMenuOpen(false)} aria-hidden></div>
            <div className="relative h-full w-[78vw] max-w-xs bg-[#4e7330] text-white flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center px-5 pt-5 pb-6">
                <img src="/images/logo.png" alt="Recicla Ebenezer" className="h-14 w-auto" />
              </div>

              <nav className="flex-1 px-5 space-y-4 text-lg font-semibold">
                <Link to="/" className="block" onClick={() => setIsMenuOpen(false)}>
                  Início
                </Link>
                <Link to="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                  Catálogo
                </Link>
                <Link to="/quem-somos" className="block" onClick={() => setIsMenuOpen(false)}>
                  Quem somos
                </Link>
                <Link to="/contato" className="block" onClick={() => setIsMenuOpen(false)}>
                  Fale conosco
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
