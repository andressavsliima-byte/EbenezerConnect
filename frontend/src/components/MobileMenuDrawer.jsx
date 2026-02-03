import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, ClipboardList, Heart, ShoppingCart, User, LogOut } from 'lucide-react';

export default function MobileMenuDrawer({ open, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

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
    onClose?.();
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
      ></div>
      <div className="fixed inset-y-0 left-0 z-50 w-[78vw] max-w-xs bg-[#e6ecc4] shadow-2xl flex flex-col">
        <div className="p-5 pb-2">
          <img src="/images/logo-branca.png" alt="Recicla Ebenezer" className="w-60 h-auto -ml-4" />
        </div>
        <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 text-[#405023] text-base font-medium">
          <Link to="/catalogo" className="flex items-center gap-3 py-3" onClick={onClose}>
            <LayoutGrid className="w-5 h-5" />
            <span>Catálogo</span>
          </Link>
          <Link to="/pedidos" className="flex items-center gap-3 py-3" onClick={onClose}>
            <ClipboardList className="w-5 h-5" />
            <span>Pedidos</span>
          </Link>
          <Link to="/favoritos" className="flex items-center gap-3 py-3" onClick={onClose}>
            <Heart className="w-5 h-5" />
            <span>Favoritos</span>
          </Link>
          <Link to="/carrinho" className="flex items-center gap-3 py-3" onClick={onClose}>
            <ShoppingCart className="w-5 h-5" />
            <span>Carrinho</span>
          </Link>
          <Link to="/perfil" className="flex items-center gap-3 py-3" onClick={onClose}>
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
  );
}
