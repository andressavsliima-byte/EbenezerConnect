import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Package, 
  LayoutDashboard,
  Bell,
  Heart
} from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { ShoppingCart as OrdersIcon } from 'lucide-react';
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
    // Segurança: remova apenas o token. Mantenha usuário e carrinho salvos.
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
            <a href="#home" className="flex items-center">
              <img src="/images/logo.png" alt="Recicla Ebenezer" className="h-36 w-auto drop-shadow" />
            </a>

            <div className="hidden md:flex items-center gap-10 text-base font-normal ml-auto mr-10">
              <a href="#home" className="text-white hover:text-white transition">Início</a>
              <Link to="/login" className="text-white hover:text-white transition">Catálogo</Link>
              <a href="#sobre" className="text-white hover:text-white transition">Clientes</a>
              <a href="#sobre" className="text-white hover:text-white transition">Quem Somos</a>
              <a href="#contato" className="text-white hover:text-white transition">Fale Conosco</a>
            </div>
          </div>
        ) : (
          <div className="flex items-center h-20 w-full">
            <div className="hidden md:flex items-center space-x-6 ml-auto">
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

              {isAdmin && (
                <>
                  <Link to="/admin/pedidos" className={`flex items-center ${isActive('/admin/pedidos')} transition-colors`}>
                    <img src="/images/recc.png" alt="" className="w-5 h-5 object-contain" />
                  </Link>
                  <Link to="/admin/promos" className={`${isActive('/admin/promos')} transition-colors`} title="Banners">
                    <Package className="w-5 h-5" />
                  </Link>
                  <Link to="/admin" className={`flex items-center ${isActive('/admin')} transition-colors`} title="Dashboard">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                  <Link to="/admin/mensagens" className="relative">
                    <Bell className={`w-6 h-6 ${isActive('/admin/mensagens')}`} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/admin/pedidos?trash=true" className="text-white/80 hover:text-white" title="Lixeira de pedidos">
                    <Trash2 className={`w-6 h-6 ${isActive('/admin/pedidos')}`} />
                  </Link>
                </>
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
          <div className="md:hidden pb-4 space-y-3">
            {/* removed Catálogo / Pedidos / Favoritos from mobile menu per request */}
            {!isAdmin && (
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
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin/pedidos"
                  className={`flex items-center space-x-2 ${isActive('/admin/pedidos')} transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <OrdersIcon className="w-5 h-5" />
                  <span>Pedidos</span>
                </Link>
                  <Link
                    to="/admin/promos"
                    className={`block ${isActive('/admin/promos')} transition-colors`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Banners
                  </Link>
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 ${isActive('/admin')} transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/admin/mensagens"
                  className={`flex items-center space-x-2 ${isActive('/admin/mensagens')} transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Bell className="w-5 h-5" />
                  <span>Mensagens</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/admin/pedidos?trash=true"
                  className={`flex items-center space-x-2 ${isActive('/admin/pedidos')} transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Lixeira</span>
                </Link>
              </>
            )}

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
        )}
      </div>
    </nav>
  );
}
