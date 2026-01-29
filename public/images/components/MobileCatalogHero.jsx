import { ChevronLeft, ChevronRight, Tag, Zap, Star, Package } from 'lucide-react';

export default function MobileCatalogHero({ promos = [], bannerIndex = 0, setBannerIndex = () => {} }) {
  // Mobile hero now receives `promos`, `bannerIndex` and `setBannerIndex` from parent
  const index = bannerIndex || 0;

  // Desabilitar autoplay no mobile: somente troca ao clicar nas setas
  const prev = () => {
    if (!promos || promos.length <= 1) return;
    setBannerIndex((i) => (i - 1 + promos.length) % promos.length);
  };
  const next = () => {
    if (!promos || promos.length <= 1) return;
    setBannerIndex((i) => (i + 1) % promos.length);
  };

  return (
    <div className="md:hidden space-y-3 relative">
      {/* localização/ofertas barra */}
      <div className="flex items-center gap-2 text-white bg-ebenezer-green rounded-xl px-3 py-2 mb-4">
        <span className="text-sm font-medium">Valorizamos seu catalisador com as melhores condições de compra</span>
      </div>

      {/* carrossel */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="w-full h-36 bg-white" onTouchMove={(e) => e.stopPropagation()}>
          {promos.length > 0 ? (
            <a href={promos[index]?.linkUrl || '#'} className="block w-full h-full">
              <img
                src={promos[index]?.imageMobileUrl || promos[index]?.imageUrl}
                alt={promos[index]?.title || 'Promoção'}
                loading="eager"
                fetchpriority="high"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/images/placeholder.jpg'; }}
                draggable={false}
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

        {/* Setas adicionais posicionadas para coincidir com o banner grande (lado esquerdo/direito) */}
        {/* removed extra absolute arrows that used fixed pixel offsets to avoid layout shifts on small screens */}
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
              src={promos[(index + 1) % promos.length]?.imageMobileUrl || promos[(index + 1) % promos.length]?.imageUrl}
              alt="Promo"
              loading="eager"
              fetchpriority="high"
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
    <a href={href} className="flex flex-col items-center justify-center bg-gray-800 rounded-xl p-3 border border-gray-700 shadow-sm text-white">
      <div className="text-ebenezer-green">{icon}</div>
      <span className="text-[11px] font-medium mt-1 text-white">{label}</span>
    </a>
  );
}
