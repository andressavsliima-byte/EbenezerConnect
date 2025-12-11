import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, ShoppingBag, ClipboardList, User } from 'lucide-react';

export default function MobileTabBar() {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (p) => path === p;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto max-w-7xl px-4 pb-2 pt-2">
        <div className="rounded-t-2xl border border-gray-200 bg-white/95 backdrop-blur-sm shadow-2xl">
          <div className="grid grid-cols-5 items-center text-center">
            <Link to="/catalogo" className="py-3">
              <div className={`flex flex-col items-center gap-1 ${isActive('/catalogo') ? 'text-ebenezer-green' : 'text-gray-500'}`}>
                <Home className="w-5 h-5" />
                <span className="text-[11px] font-medium">Início</span>
              </div>
            </Link>
            <Link to="/favoritos" className="py-3">
              <div className={`flex flex-col items-center gap-1 ${isActive('/favoritos') ? 'text-ebenezer-green' : 'text-gray-500'}`}>
                <Heart className="w-5 h-5" />
                <span className="text-[11px] font-medium">Favoritos</span>
              </div>
            </Link>
            <Link to="/carrinho" className="py-3">
              <div className={`flex flex-col items-center gap-1 ${isActive('/carrinho') ? 'text-ebenezer-green' : 'text-gray-500'}`}>
                <ShoppingBag className="w-5 h-5" />
                <span className="text-[11px] font-medium">Sacola</span>
              </div>
            </Link>
            <Link to="/pedidos" className="py-3">
              <div className={`flex flex-col items-center gap-1 ${isActive('/pedidos') ? 'text-ebenezer-green' : 'text-gray-500'}`}>
                <ClipboardList className="w-5 h-5" />
                <span className="text-[11px] font-medium">Pedidos</span>
              </div>
            </Link>
            <Link to="/perfil" className="py-3">
              <div className={`flex flex-col items-center gap-1 ${isActive('/perfil') ? 'text-ebenezer-green' : 'text-gray-500'}`}>
                <User className="w-5 h-5" />
                <span className="text-[11px] font-medium">Sua Conta</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      {/* Safe area spacing is handled in App via padding-bottom */}
    </div>
  );
}
