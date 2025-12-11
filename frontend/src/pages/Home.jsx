import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Lock, Zap } from 'lucide-react';

const features = [
  {
    title: 'Catálogo inteligente',
    description: 'Filtros por veículo, fabricante e código para encontrar peças em segundos.',
    icon: ShoppingCart
  },
  {
    title: 'Segurança empresarial',
    description: 'Acesso controlado por login e autenticação JWT para cada parceiro.',
    icon: Lock
  },
  {
    title: 'Gestão integrada',
    description: 'Carrinho, pedidos e mensagens em tempo real para manter o fluxo ativo.',
    icon: Zap
  }
];

export default function Home() {
  const user = localStorage.getItem('user');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = useMemo(
    () => ['/images/slide1.jpg', '/images/slide2.jpg', '/images/slide3.jpg', '/images/slide4.jpg'],
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-ebenezer-green-dark to-gray-900 text-white">
      <section className="container max-w-6xl mx-auto px-4 py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-ebenezer-green mb-4">Ebenezer Connect</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Mais do que reciclar, cultivamos confiança entre pessoas e materiais.
            </h1>
            <p className="text-gray-200 mt-6 text-lg">
              Um catálogo profissional para parceiros confiáveis, com autenticação segura, gestão de pedidos e
              catálogo completo com busca avançada.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to={user ? '/catalogo' : '/login'}
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-ebenezer-green font-semibold shadow-lg hover:bg-gray-100 transition"
              >
                Acessar Catálogo
              </Link>
              <Link
                to="/contato"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-white hover:border-ebenezer-green"
              >
                Falar com o time
              </Link>
            </div>
          </div>
          <div className="relative h-80 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.5)] overflow-hidden">
            {images.map((img, index) => (
              <img
                key={img}
                src={img}
                alt={`Ebenezer slide ${index + 1}`}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            <div className="absolute bottom-6 left-6 bg-black/40 rounded-full px-4 py-2 text-xs tracking-wide">
              Atualizado para parceiros oficiais
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white text-ebenezer-black py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.5em] text-ebenezer-green">Recursos</p>
            <h2 className="text-3xl font-bold">Tudo o que você precisa para operar com confiança.</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-2xl border border-gray-200 p-6 shadow-sm bg-white">
                  <Icon className="w-10 h-10 text-ebenezer-green mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                  <span className="mt-4 inline-flex text-xs uppercase tracking-[0.4em] text-ebenezer-green">
                    Parceiros
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl mx-auto px-4 rounded-3xl bg-ebenezer-green-light/80 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Entre no ritmo da indústria</h2>
          <p className="text-white/90 leading-relaxed mb-8">
            Solicite acesso, atualize seu cadastro e agende uma demonstração para ver como o Ebenezer Connect pode
            acelerar seu processo de compras.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full bg-white px-10 py-3 font-semibold text-ebenezer-green transition hover:bg-gray-100"
          >
            Solicitar acesso
          </Link>
        </div>
      </section>
    </div>
  );
}
