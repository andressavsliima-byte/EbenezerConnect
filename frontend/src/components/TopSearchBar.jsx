import { MapPin, Search, Heart, ShoppingCart, User } from 'lucide-react';

export default function TopSearchBar({ value, onChange, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };
  return (
    <div className="w-full bg-[#0d6efd] text-white py-3 md:py-4 md:rounded-none mb-4 md:mb-6">
      <div className="px-3 md:px-6">
        <div className="flex items-center justify-between gap-3 mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            {/* Substituir texto por logo */}
            <img src="/images/logo.png" alt="Recicla Ebenezer" className="h-8 md:h-10 w-auto object-contain" />
            <MapPin className="w-4 h-4 opacity-90" />
            <span className="text-xs md:text-sm opacity-90">Informe seu CEP</span>
          </div>
          <div className="hidden md:flex items-center gap-4 opacity-90">
            <Heart className="w-5 h-5" />
            <ShoppingCart className="w-5 h-5" />
            <User className="w-5 h-5" />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar no catálogo"
                className="w-full bg-white text-gray-800 rounded-full pl-10 pr-4 py-2.5 shadow-sm focus:outline-none"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
              />
            </div>
          </div>
        </form>
        <div className="hidden md:flex items-center gap-4 mt-3 text-sm">
          <a href="#" className="hover:underline">Cupons</a>
          <a href="#" className="hover:underline">Celulares</a>
          <a href="#" className="hover:underline">Eletrodomésticos</a>
          <a href="#" className="hover:underline">Informática</a>
          <a href="#" className="hover:underline">Móveis</a>
          <a href="#" className="hover:underline">Saldão</a>
        </div>
      </div>
    </div>
  );
}
