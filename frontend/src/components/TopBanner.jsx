import { useState, useEffect } from 'react';
import { promosAPI } from '../api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TopBanner() {
  const [promos, setPromos] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('promos') || 'null');
      if (Array.isArray(cached) && cached.length > 0) return cached;
    } catch {}
    return [];
  });
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {

    (async () => {
      try {
        const { data } = await promosAPI.getPublic();
        const list = Array.isArray(data) ? data.filter(p => p.active) : [];
        const normalized = list.map(p => ({
          ...p,
          imageDesktopUrl: p.imageDesktopUrl || p.imageUrl || '',
          imageMobileUrl: p.imageMobileUrl || p.imageUrl || '',
        }));
        const finalPromos = normalized.length === 1
          ? [
              normalized[0],
              {
                imageDesktopUrl: '/images/slide2.jpg',
                imageMobileUrl: '/images/slide2-mobile.jpg',
                linkUrl: '#',
                title: 'Banner de teste',
                active: true,
              },
            ]
          : normalized;
        setPromos(finalPromos);
        try { localStorage.setItem('promos', JSON.stringify(finalPromos)); } catch {}
      } catch (e) {
        // keep cached promos if fetch fails
      }
    })();
  }, []);

  useEffect(() => {
    if (!promos || promos.length === 0) return;
    const imgs = [];
    promos.forEach((p) => {
      const d = p.imageDesktopUrl || p.imageUrl;
      const m = p.imageMobileUrl || p.imageUrl;
      if (d) { const img = new Image(); img.src = d; imgs.push(img); }
      if (m) { const img2 = new Image(); img2.src = m; imgs.push(img2); }
    });
    return () => { imgs.forEach(i => { try { i.src = ''; } catch {} }); };
  }, [promos]);

  const prevBanner = () => setBannerIndex((i) => (i - 1 + promos.length) % promos.length);
  const nextBanner = () => setBannerIndex((i) => (i + 1) % promos.length);

  if (!promos || promos.length === 0) return null;

  const item = promos[bannerIndex] || {};
  const src = item.imageDesktopUrl || item.imageUrl || '';

  return (
    <div className="hidden md:block mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        {src ? (
          <a href={item.linkUrl || '#'} className="block">
            <img
              src={src}
              alt={item.title || 'Banner'}
              loading="eager"
              fetchpriority="high"
              className="w-full h-[200px] object-cover"
              onError={(e) => { e.currentTarget.src = '/images/placeholder.jpg'; }}
            />
          </a>
        ) : (
          <a href={item.linkUrl || '#'} className="block">
            <div className="w-full h-[200px] flex items-center justify-center bg-gray-50">
              <img src="/images/logo.png" alt="Banner" className="h-32 opacity-60" />
            </div>
          </a>
        )}

        {promos.length > 1 && (
          <>
            <button aria-label="Anterior" onClick={prevBanner} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-md p-3 shadow">
              <ChevronLeft className="w-5 h-5 text-emerald-600" />
            </button>
            <button aria-label="Próximo" onClick={nextBanner} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-md p-3 shadow">
              <ChevronRight className="w-5 h-5 text-emerald-600" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {promos.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Ir para banner ${i+1}`}
                  onClick={() => setBannerIndex(i)}
                  className={`h-2.5 w-2.5 rounded-full ${i===bannerIndex ? 'bg-white' : 'bg-white/60'} shadow border border-white/40`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
