import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Instagram } from 'lucide-react';

const services = [
  {
    title: 'Reciclagem de Catalisadores, Baterias e Rodas de Alumínio',
    text: 'Adquirimos catalisadores, baterias e rodas de alumínio para reciclagem, garantindo reaproveitamento eficiente de materiais valiosos.',
    image: '/images/catalisador.png',
  },
  {
    title: 'Aquisição de Peças da Linha Pesada',
    text: 'Compramos peças da linha pesada para revenda, com avaliação rigorosa que assegura qualidade e segurança ao mercado.',
    image: '/images/Roda.png',
  },
  {
    title: 'Compra de Placas Eletrônicas',
    text: 'Reaproveitamos componentes e materiais de placas eletrônicas usadas, maximizando recursos com responsabilidade.',
    image: '/images/placa%20eletronica.png',
  },
];

const heroSlides = [
  {
    image: '/images/Green%20Minimalist%20Agriculture%20Presentation.jpg',
    title: 'Comprometimento e eficiência',
    subtitle: 'Materiais reciclados com logística segura e foco em sustentabilidade.',
  },
  {
    image: '/images/Slide%202..jpg',
    title: 'Logística segura e sustentável',
    subtitle: 'Operação eficiente para receber, avaliar e direcionar materiais com agilidade.',
  },
];

export default function Home() {
  const catalogHref = '/login';
  const [currentSlide, setCurrentSlide] = useState(0);

  const goPrev = () => setCurrentSlide((index) => (index - 1 + heroSlides.length) % heroSlides.length);
  const goNext = () => setCurrentSlide((index) => (index + 1) % heroSlides.length);

  return (
    <div className="bg-white text-ebenezer-black">
      {/* Hero */}
      <section id="home" className="relative overflow-hidden text-white">
        <div className="relative w-full aspect-[1272/425] min-h-[260px] md:min-h-[360px] bg-ebenezer-green-dark">
          <img
            src={heroSlides[currentSlide]?.image || heroSlides[0].image}
            alt={heroSlides[currentSlide]?.title || 'Banner institucional'}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchpriority="high"
          />

          {heroSlides.length > 1 && (
            <>
              <button
                aria-label="Anterior"
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:scale-105 transition-transform drop-shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                aria-label="Próximo"
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:scale-105 transition-transform drop-shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </section>

      {/* História */}
      <section id="sobre" className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl border-8 border-ebenezer-green/70 overflow-hidden shadow-lg">
            <img
              src="/images/empresa%20fachada.png"
              alt="Fachada da empresa"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-ebenezer-black mb-4">Nossa História</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Fundada para transformar resíduos em recursos valiosos, respeitando o meio ambiente e contribuindo para um futuro mais sustentável. Buscamos soluções que geram valor real com transparência e responsabilidade.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Carregamos o compromisso de seriedade e dedicação, guiando nossa atuação com ética e foco no resultado.
            </p>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-16 bg-ebenezer-green-dark text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">Serviços</p>
            <h3 className="text-3xl font-bold">Operamos com excelência e responsabilidade</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {services.map((item) => (
              <div key={item.title} className="bg-white text-ebenezer-black rounded-3xl overflow-hidden shadow-lg border border-emerald-50 flex flex-col">
                <img src={item.image} alt={item.title} className="h-40 w-full object-cover" loading="lazy" />
                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="text-lg font-semibold mb-2 text-ebenezer-green-forest">{item.title}</h4>
                  <p className="text-gray-700 text-sm leading-relaxed flex-1">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destaque logística */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <img
              src="/images/slide1.jpg"
              alt="Logística e sustentabilidade"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-4">Parceiro confiável do início ao fim</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Processos de remanufatura e reaproveitamento, atendimento personalizado e foco em sustentabilidade. Entregamos resultados alinhados às mais altas expectativas do mercado.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Nosso objetivo é oferecer soluções eficazes, tratando cada cliente com respeito e transparência.
            </p>
          </div>
        </div>
      </section>

      {/* Contato/CTA */}
      <section id="contato" className="py-14 bg-ebenezer-green-light/70 text-ebenezer-black">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h4 className="text-2xl font-bold mb-3">Pronto para acessar o catálogo?</h4>
            <p className="text-gray-800 leading-relaxed">
              Clique em Catálogo para ir à área de login e visualizar preços, estoque e detalhes completos. Se já for parceiro, entre com suas credenciais.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to={catalogHref}
              className="px-6 py-3 rounded-full bg-ebenezer-green text-white font-semibold shadow-md hover:bg-ebenezer-green/90 transition"
            >
              Ir para login
            </Link>
            <a
              href="mailto:contato@reciclaebenezer.com"
              className="px-6 py-3 rounded-full border border-ebenezer-green text-ebenezer-green font-semibold hover:bg-ebenezer-green/10 transition"
            >
              Falar com o time
            </a>
          </div>
        </div>
      </section>

      {/* Bloco institucional inspirado no rodapé de referência */}
      <section className="bg-[#4e7330] text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <h3 className="text-3xl font-bold mb-4">Siga-nos nas redes sociais:</h3>
          <div className="flex items-center justify-center gap-4 text-lg">
            <a
              href="https://www.instagram.com/reciclaebenezer?igsh=dGdwZHBsYWJmOHZi&utm_source=qr"
              className="flex items-center hover:text-white/80 transition"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram className="w-14 h-14" />
            </a>
            <span className="text-white/50">•</span>
            <a
              href="https://www.facebook.com/share/17qnWMsfLc/?mibextid=wwXIfr"
              className="flex items-center hover:text-white/80 transition"
              aria-label="Facebook"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/images/facebook-logo.svg"
                alt="Facebook"
                className="w-14 h-14"
                loading="lazy"
              />
              <span className="sr-only">Facebook</span>
            </a>
          </div>
        </div>
        <div className="bg-[#3a3a3a] text-white py-12">
          <div className="max-w-6xl mx-auto px-4 grid gap-10 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="text-xl font-semibold">Onde Estamos</h4>
              <p className="leading-relaxed text-white/90">
                Av. Juscelino Kubitscheck de Oliveira, 3405<br />
                Residencial Gramado<br />
                Patos de Minas - MG<br />
                CEP 38706-215
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-semibold">Nossos Horários</h4>
              <p className="leading-relaxed text-white/90">
                Segunda-feira: 7 às 18h<br />
                Terça a quinta-feira: 8 às 18h<br />
                Sexta-feira: 8 às 17h<br />
                Sábados: 8 às 12h
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-semibold">Nossos Telefones</h4>
              <p className="leading-relaxed text-white/90">
                0800 945 0304<br />
                (34) 3822-0302<br />
                (34) 3822-0304<br />
                (34) 9 9714-4474
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#4e7330] text-white">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
            <p className="text-white/90">© 2026 Recicla Ebenezer - Todos os direitos reservados</p>
            <p className="text-white/80">Desenvolvido por Recicla Ebenezer</p>
          </div>
        </div>
      </section>
    </div>
  );
}
