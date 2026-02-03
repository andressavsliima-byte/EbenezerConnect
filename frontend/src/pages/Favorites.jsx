import { useEffect, useState } from 'react';
import { Heart, Package } from 'lucide-react';
import { getPrimaryProductImage } from '../utils/productUtils';
import { getFavorites, toggleFavorite } from '../utils/favorites';
import { Link } from 'react-router-dom';
import TopSearchBar from '../components/TopSearchBar';
import MobileMenuDrawer from '../components/MobileMenuDrawer';

export default function Favorites() {
  const [favorites, setFavorites] = useState(getFavorites());
  const [searchText, setSearchText] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fav = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(fav);
    const onFavUpdate = () => setFavorites(getFavorites());
    window.addEventListener('favoritesUpdated', onFavUpdate);
    return () => window.removeEventListener('favoritesUpdated', onFavUpdate);
  }, []);

  return (
    <>
      <div className="relative">
        <TopSearchBar withLogo hideSearch value={searchText} onChange={setSearchText} onSubmit={() => {}} />
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-[60] w-12 h-12 rounded-md border border-white/50 flex flex-col items-center justify-center gap-1 bg-white/10"
          aria-label="Menu"
        >
          <span className="w-6 h-[2px] bg-white rounded-full"></span>
          <span className="w-6 h-[2px] bg-white rounded-full"></span>
          <span className="w-6 h-[2px] bg-white rounded-full"></span>
        </button>
      </div>
      <MobileMenuDrawer open={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="container-page">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <Heart className="w-8 h-8 text-rose-500" />
        Favoritos
      </h1>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum favorito ainda</h2>
          <p className="text-gray-600">Adicione produtos aos favoritos no catálogo.</p>
        </div>
      ) : (
        <div className="grid-products">
          {favorites.map((item, idx) => (
            <div key={idx} className="card-product relative">
              {/* Unfavorite button */}
              <button
                className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow"
                onClick={(e) => {
                  e.preventDefault();
                  const next = toggleFavorite(item);
                  setFavorites(next);
                }}
                title="Remover dos favoritos"
              >
                <Heart className="w-5 h-5 text-rose-500" />
              </button>

              <Link to={`/produto/${item._id}`} className="block">
                <div className="p-4">
                  <div className="w-full h-40 bg-white rounded mb-3 overflow-hidden">
                    <img
                      src={getPrimaryProductImage(item)}
                      alt={item.name}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.svg';
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-ebenezer-green transition-colors">{item.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold text-ebenezer-green">R$ {Number(item.price).toFixed(2)}</span>
                    <span className="text-xs text-gray-500">Ver produto</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
}
