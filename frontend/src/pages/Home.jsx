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
    image: '/images/Reciclagem%20e%20reaproveitamento%20banner.jpg',
    imageDesktop: '/images/Green%20Minimalist%20Agriculture%20Presentation.jpg',
    title: 'Reciclagem e reaproveitamento',
    subtitle: 'Materiais preciosos com destino certo e sustentável.',
  },
  {
    image: '/images/gestão%20segura%20de%20placas.jpg',
    imageDesktop: '/images/Slide%202..jpg',
    title: 'Gestão segura de placas',
    subtitle: 'Controle rigoroso e logística eficiente em toda a operação.',
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
        <div className="relative w-full h-[460px] md:h-auto md:aspect-[3/1] bg-[#dbe7c8]">
          {/* Desktop usa os banners do ambiente 5000; mobile mantém os atuais */}
          <img
            src={heroSlides[currentSlide]?.imageDesktop || heroSlides[currentSlide]?.image || heroSlides[0].image}
            alt={heroSlides[currentSlide]?.title || 'Banner institucional'}
            className="hidden md:block absolute inset-0 w-full h-full object-contain object-center"
            loading="eager"
            fetchpriority="high"
          />
          <img
            src={heroSlides[currentSlide]?.image || heroSlides[0].image}
            alt={heroSlides[currentSlide]?.title || 'Banner institucional'}
            className="md:hidden absolute inset-0 w-full h-full object-cover object-center"
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

      {/* Bloco institucional abaixo do banner (Nossa História + chamada de Serviços) */}
      <section id="sobre" className="bg-white py-14 md:py-16">
        <div className="max-w-5xl mx-auto px-5 flex flex-col items-center">
          <div className="w-full max-w-xl h-4 bg-[#4e7330] rounded-md mb-8"></div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-ebenezer-green-forest text-center mb-6">Nossa História</h2>
          <div className="w-full max-w-3xl space-y-5 text-gray-800 leading-relaxed text-base md:text-lg">
            <p>
              A Recicla Ebenezer nasceu em março de 2022, a partir de um propósito que Deus colocou em nossas vidas. Nada por acaso, tudo no tempo certo. Carregamos em nosso nome a gratidão e a responsabilidade expressas em “Até aqui nos ajudou o Senhor”, princípio que guia nossa forma de trabalhar.
            </p>
            <p>
              Acreditamos em reaproveitar, restaurar e dar novo valor ao que muitos descartam, sempre com honestidade, transparência e respeito. Cada cliente é tratado com seriedade e cada negociação é feita com palavra, porque para nós princípios não se negociam.
            </p>
            <p>
              A Recicla Ebenezer é mais que uma empresa. É trabalho, fé e propósito caminhando juntos.
            </p>
          </div>
          <div className="mt-10 w-full max-w-sm">
            <div className="w-full h-14 bg-[#4e7330] rounded-md flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-semibold tracking-[0.12em]">SERVIÇOS</span>
            </div>
          </div>
        </div>
      </section>

        {/* Bloco de serviços com fundo verde e imagens 1 e 2 */}
          <section className="bg-[#4e7330] text-white py-14">
          <div className="w-full max-w-5xl mx-auto px-4 md:px-6 grid gap-8 md:gap-6 md:grid-cols-2 justify-items-center">
            {[{
              img: '/images/servi%C3%A7os%20catalisador.jpg',
              alt: 'Reciclagem de catalisadores',
              title: 'Reciclagem de Catalisadores, Baterias e Rodas de Alumínio',
              text: 'Realizamos a aquisição de catalisadores, baterias e rodas de alumínio, com foco em processos de reciclagem responsáveis e valorização de materiais recicláveis.',
            }, {
              img: '/images/Servi%C3%A7os%20placa%20eletronica.jpg',
              alt: 'Compra de placas eletrônicas',
              title: 'Compra de Placas Eletrônicas',
              text: 'Realizamos o reaproveitamento de componentes e materiais provenientes de placas eletrônicas usadas, assegurando a maximização de recursos com responsabilidade ambiental.',
            }].map((card, idx) => (
                <div
                  key={card.title}
                  className="bg-white text-ebenezer-black rounded-3xl shadow-2xl border border-white/30 overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300 w-full max-w-[320px] md:max-w-[360px]"
                >
                <div className="w-full bg-white overflow-hidden flex items-center justify-center min-h-[240px] md:min-h-[300px]">
                  <img
                    src={card.img}
                    alt={card.alt}
                    className="max-w-full max-h-[340px] w-auto h-auto object-contain"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                </div>
                <div className="px-6 pt-3 pb-6 space-y-3 -mt-16 md:-mt-24 bg-white/95 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.12)] rounded-t-3xl text-center">
                  <h3 className="text-lg font-semibold text-ebenezer-green-forest leading-snug">{card.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      {/* Seção final conforme referência da foto */}
      <section className="bg-white text-ebenezer-black">
        <div className="max-w-5xl mx-auto px-5 py-10 space-y-10">
          <div className="h-5 w-full max-w-sm bg-[#cddc9e] rounded-md"></div>
          <p className="text-gray-800 leading-relaxed text-base md:text-lg">
            Atuamos com processos de remanufatura e reaproveitamento, atendimento personalizado e foco em sustentabilidade. Entregamos resultados alinhados às exigências do mercado, oferecendo soluções eficazes e conduzindo cada relacionamento com respeito, ética e transparência.
          </p>
        </div>

        <div className="bg-[#4e7330] text-white">
          <div className="max-w-5xl mx-auto px-5 py-10 text-center space-y-6">
            <h3 className="text-3xl md:text-4xl font-extrabold">Siga-nos nas redes sociais</h3>
            <div className="flex items-center justify-center gap-6 text-white">
              <a
                href="https://www.instagram.com/reciclaebenezer?igsh=dGdwZHBsYWJmOHZi&utm_source=qr"
                className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-white/70 hover:bg-white/10 transition"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="w-9 h-9" />
              </a>
              <a
                href="https://www.facebook.com/share/17qnWMsfLc/?mibextid=wwXIfr"
                className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-white/70 bg-white hover:bg-white/90 transition"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                <img src="/images/facebook-logo.svg" alt="Facebook" className="w-8 h-8" loading="lazy" />
              </a>
            </div>
          </div>
        </div>

        <div className="bg-[#2e2e2e] text-white">
          <div className="max-w-5xl mx-auto px-5 py-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold">Horários de funcionamento</p>
              <p className="text-white/85">Segunda à Sexta: 7 às 18h</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Telefone</p>
              <p className="text-white/85">(34) 99916-4897</p>
            </div>
          </div>
        </div>

        <div className="bg-[#4e7330] text-white">
          <div className="max-w-5xl mx-auto px-5 py-6 text-center text-sm">
            © 2026 Recicla Ebenezer - Todos os direitos reservados
          </div>
        </div>
      </section>
    </div>
  );
}
