import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import logo from '@/assets/logo-dark.png';

export function Footer() {
  return (
    <footer id="contato" className="bg-foreground text-background">
      <div className="section-container py-10 md:py-12 lg:py-16 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <img src={logo} alt="Chama 365 Guinchos" className="h-20 md:h-24 lg:h-32 w-auto mb-4 md:mb-6" />
                <p className="text-background/70 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 max-w-xs">
                  O jeito mais rápido e seguro de solicitar guincho. 
                  Atendimento 24 horas em todo o Brasil.
                </p>
              </div>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors flex-shrink-0"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 md:w-6 md:h-6 fill-white"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4 md:mb-6 text-sm md:text-base">Links Rápidos</h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <a href="#como-funciona" className="text-background/70 hover:text-primary transition-colors text-xs md:text-sm">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="#planos" className="text-background/70 hover:text-primary transition-colors text-xs md:text-sm">
                  Planos
                </a>
              </li>
              <li>
                <a href="#cobertura" className="text-background/70 hover:text-primary transition-colors text-xs md:text-sm">
                  Cobertura
                </a>
              </li>
              <li>
                <a href="#faq" className="text-background/70 hover:text-primary transition-colors text-xs md:text-sm">
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </div>

          {/* Para Você */}
          <div>
            <h4 className="font-bold mb-4 md:mb-6 text-sm md:text-base">Para Você</h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link to="/cadastro/cliente" className="text-background/70 hover:text-primary transition-colors text-xs md:text-sm">
                  Solicitar Guincho
                </Link>
              </li>
              <li>
                <Link to="/cadastro/associado" className="text-background/70 hover:text-primary transition-colors text-xs md:text-sm">
                  Seja um Associado
                </Link>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-primary transition-colors text-xs md:text-sm">
                  Baixar o App
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-bold mb-4 md:mb-6 text-sm md:text-base">Contato</h4>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-start gap-2 md:gap-3">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs md:text-sm text-background/70">Atendimento 24h</p>
                  <a href="tel:0800000000" className="font-semibold hover:text-primary transition-colors text-sm md:text-base">
                    0800 000 0000
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                <a href="mailto:contato@chama365.com.br" className="text-xs md:text-sm text-background/70 hover:text-primary transition-colors break-all">
                  contato@chama365.com.br
                </a>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm text-background/70">
                  Atendimento em todo o Brasil
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 md:mt-12 lg:mt-16 pt-6 md:pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs md:text-sm text-background/50 text-center sm:text-left">
            © 2024 Chama 365 Guinchos. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-background/50">
            <a href="#" className="hover:text-primary transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
