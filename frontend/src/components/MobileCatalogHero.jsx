import { useEffect, useState } from 'react';
import { promosAPI } from '../api';
import { ChevronLeft, ChevronRight, Tag, Zap, Star, Package, MapPin } from 'lucide-react';

export default function MobileCatalogHero() {
  const [promos, setPromos] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await promosAPI.getPublic();
        setPromos(Array.isArray(data) ? data : []);
      } catch (e) {
        setPromos([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (promos.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % promos.length), 5000);
    return () => clearInterval(id);
  }, [promos.length]);

  const prev = () => setIndex((i) => (i - 1 + promos.length) % promos.length);
  const next = () => setIndex((i) => (i + 1) % promos.length);

  return (
    <div className="md:hidden space-y-3">
      {/* localização/ofertas barra */}
      <div className="flex items-center gap-2 text-white bg-red-500 rounded-xl px-3 py-2">
        <MapPin className="w-4 h-4" />
        <span className="text-sm font-medium">Ver ofertas para minha região</span>
      </div>

      {/* carrossel */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="w-full h-36 bg-gray-100">
          {promos.length > 0 ? (
            <a href={promos[index]?.linkUrl || '#'} className="block w-full h-full">
              <img
                src={promos[index]?.imageUrl}
                alt={promos[index]?.title || 'Promoção'}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/images/placeholder.jpg'; }}
              />
            </a>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
          )}
        </div>
        {promos.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* ações rápidas */}
      <div className="grid grid-cols-4 gap-2">
        <QuickAction icon={<Package className="w-5 h-5" />} label="Categorias" href="#categorias" />
        <QuickAction icon={<Tag className="w-5 h-5" />} label="Cupons" href="#" />
        <QuickAction icon={<Zap className="w-5 h-5" />} label="Relâmpago" href="#" />
        <QuickAction icon={<Star className="w-5 h-5" />} label="Aproveite" href="#" />
      </div>

      {/* banner secundário */}
      {promos.length > 1 && (
        <div className="overflow-hidden rounded-2xl">
          <a href={promos[(index + 1) % promos.length]?.linkUrl || '#'}>
            <img
              src={promos[(index + 1) % promos.length]?.imageUrl}
              alt="Promo"
              className="w-full h-28 object-cover"
              onError={(e) => { e.currentTarget.src = '/images/placeholder.jpg'; }}
            />
          </a>
        </div>
      )}
    </div>
  );
}

function QuickAction({ icon, label, href }) {
  return (
    <a href={href} className="flex flex-col items-center justify-center bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
      <div className="text-ebenezer-green">{icon}</div>
      <span className="text-[11px] font-medium mt-1">{label}</span>
    </a>
  );
}
