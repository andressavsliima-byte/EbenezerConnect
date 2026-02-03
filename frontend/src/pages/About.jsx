import { Instagram, ShieldCheck, Star, HeartHandshake, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white text-ebenezer-black min-h-screen">
      <section className="pt-16 pb-6 px-5">
        <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.35fr_1fr] items-start">
          <div className="relative">
            <div className="bg-[#e8eddd] rounded-3xl shadow-[0_20px_60px_-35px_rgba(24,48,16,0.6)] p-8 md:p-10 text-lg leading-relaxed text-ebenezer-black/90 border border-[#d5e0c5] space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold text-ebenezer-black">Quem somos</h1>
              <p>
                Somos uma empresa especializada na aquisição de materiais recicláveis, com foco na extração e recuperação de metais
                preciosos, como ouro, prata e platina, presentes em diversos tipos de resíduos eletrônicos, industriais e domésticos.
                Após a extração, repassamos esses materiais refinados para indústrias que utilizam em processos de produção,
                garantindo a sustentabilidade e a economia circular. Nosso compromisso é oferecer soluções inovadoras que não apenas
                contribuem para a preservação do meio ambiente, mas também geram valor agregado para os nossos parceiros e clientes,
                promovendo um ciclo de reaproveitamento eficiente e ético.
              </p>
            </div>
            <div className="hidden md:block h-3 w-52 bg-[#4e7330] rounded-full absolute -bottom-5 left-1/2 -translate-x-1/2" />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#4e7330] mb-2">Nossa essência</p>
              <h2 className="text-xl md:text-2xl font-bold text-ebenezer-black">Aqui você encontra</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[{
                icon: <ShieldCheck className="w-6 h-6 text-[#4e7330]" />, title: 'Responsabilidade',
                text: 'Decisões tomadas com ética, rastreabilidade e respeito ao meio ambiente.'
              }, {
                icon: <Star className="w-6 h-6 text-[#4e7330]" />, title: 'Excelência',
                text: 'Processos consistentes e foco em qualidade em cada entrega.'
              }, {
                icon: <HeartHandshake className="w-6 h-6 text-[#4e7330]" />, title: 'Comprometimento',
                text: 'Parceria próxima com clientes e fornecedores para resultados duradouros.'
              }, {
                icon: <Zap className="w-6 h-6 text-[#4e7330]" />, title: 'Eficiência',
                text: 'Operações ágeis e inteligentes para reduzir desperdício e ganhar escala.'
              }].map((card) => (
                <div key={card.title} className="rounded-2xl border border-[#e0e8d3] bg-white shadow-sm p-5 flex flex-col gap-2">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#4e7330]/10">
                    {card.icon}
                  </div>
                  <p className="font-semibold text-ebenezer-black">{card.title}</p>
                  <p className="text-sm text-ebenezer-black/80 leading-relaxed">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#4e7330] text-white py-12">
        <div className="max-w-6xl mx-auto px-5 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">Siga-nos nas redes sociais</h2>
          <p className="text-white/85 max-w-2xl mx-auto">
            Acompanhe de perto nossos projetos, iniciativas ambientais e novidades sobre reciclagem de metais.
          </p>
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://www.instagram.com/reciclaebenezer?igsh=dGdwZHBsYWJmOHZi&utm_source=qr"
              className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-white/70 hover:bg-white/10 transition"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram className="w-7 h-7" />
            </a>
            <a
              href="https://www.facebook.com/share/17qnWMsfLc/?mibextid=wwXIfr"
              className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-white/70 bg-white hover:bg-white/90 transition"
              aria-label="Facebook"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/images/facebook-logo.svg" alt="Facebook" className="w-6 h-6" loading="lazy" />
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-[#2f2f2f] text-white py-6">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-white/80">
          <div className="space-y-1">
            <p className="font-semibold text-white">Horários de funcionamento</p>
            <p>Segunda à Sexta: 7 às 18h</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-white">Telefone</p>
            <p>(34) 99916-4897</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
