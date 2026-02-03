import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';

export default function TopSearchBar({ value, onChange, onSubmit, withLogo = false, hideSearch = false, sticky = false }) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };

  const wrapperClasses = `relative w-full bg-[#4e7330] text-white h-24 md:h-24 mb-2 md:mb-0 md:-ml-60 md:w-[calc(100%+15rem)] ${sticky ? 'sticky top-0 z-[70] shadow-md' : 'z-50'}`;

  return (
    <div className={wrapperClasses}>
        <div className="px-0">
          <div className="flex items-center justify-center h-full">
            <form onSubmit={handleSubmit} className="w-full h-full flex items-center">
              <div className={`relative w-full max-w-none flex items-center ${withLogo ? 'gap-4' : ''}`}>
                {withLogo && (
                  <div className="-ml-4 pl-4 md:pl-6 z-50">
                    <img
                      src="/images/logo.png"
                      alt="Recicla Ebenezer"
                      className="h-36 md:h-36 object-contain -translate-y-6"
                      loading="eager"
                      fetchpriority="high"
                      decoding="sync"
                    />
                  </div>
                )}

                {!hideSearch && (
                  <div className="absolute left-1/2 md:left-[calc(50%+7.5rem)] top-0 -translate-x-1/2 translate-y-6 md:translate-y-6 w-full max-w-[1100px] px-4">
                    <div className="flex items-center justify-center gap-3 w-full">
                      <div className="relative w-full">
                        <input
                          type="text"
                          placeholder=""
                          aria-label="Campo de busca"
                          className="w-full bg-white text-gray-800 placeholder-gray-400 rounded-full pl-4 pr-20 py-2 md:py-2.5 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
                          value={value}
                          onChange={(e) => onChange?.(e.target.value)}
                        />

                        <button
                          type="submit"
                          aria-label="Buscar"
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl"
                        >
                          <Search className="w-3 h-3" />
                        </button>
                      </div>

                      <Link
                        to="/carrinho"
                        className="relative inline-flex items-center justify-center w-12 h-12 ml-9 text-white"
                        aria-label="Ir para o carrinho"
                      >
                        <ShoppingBag className="w-7 h-7" />
                        {cartCount > 0 && (
                          <span className="absolute -top-1 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-[#75b528] text-white text-xs font-semibold flex items-center justify-center shadow-md">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
    </div>
  );
}
