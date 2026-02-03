import { Instagram, Phone, MessageCircle, MapPin } from 'lucide-react';

export default function Contact() {
  const whatsappLink = 'https://wa.me/5534999164897';

  return (
    <div className="bg-white text-ebenezer-black min-h-screen">
      <section className="bg-[#4e7330] text-white pt-16 pb-14">
        <div className="max-w-5xl mx-auto px-5 space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-white/80">Contato</p>
          <h1 className="text-3xl md:text-4xl font-bold">Fale conosco</h1>
          <p className="text-white/90 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            Estamos à disposição para tirar dúvidas e fornecer mais informações sobre nossos serviços. Entre em contato conosco e fale diretamente com nossa equipe.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-5 py-14 space-y-10">
        <div className="bg-white shadow-xl rounded-3xl border border-[#e8eddc] p-8 md:p-10 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#4e7330]/10 flex items-center justify-center text-[#4e7330]">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.14em] text-gray-500">WhatsApp</p>
                <p className="text-xl font-semibold text-ebenezer-green-forest">(34) 99916-4897</p>
              </div>
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#4e7330] text-white font-medium shadow-lg hover:shadow-xl transition"
            >
              Iniciar conversa
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#f7f9f1] border border-[#e8eddc]">
              <Phone className="w-6 h-6 text-[#4e7330] mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-ebenezer-green-forest">Telefone</p>
                <p className="text-gray-700">(34) 99916-4897</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#f7f9f1] border border-[#e8eddc]">
              <MapPin className="w-6 h-6 text-[#4e7330] mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-ebenezer-green-forest">Horário de atendimento</p>
                <p className="text-gray-700">Segunda à Sexta: 7h às 18h</p>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-[#4e7330] text-white rounded-3xl shadow-xl p-8 md:p-10 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">Siga-nos nas redes sociais</h2>
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
        </section>
      </main>
    </div>
  );
}
