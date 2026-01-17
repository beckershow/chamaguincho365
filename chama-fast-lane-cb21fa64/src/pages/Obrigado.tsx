import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageCircle, Download, ArrowRight, Home } from 'lucide-react';

export default function Obrigado() {
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get('tipo') || 'cliente';

  const isCliente = tipo === 'cliente';

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="section-container">
          <div className="max-w-xl mx-auto text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8 animate-scale-in">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-foreground mb-4 animate-fade-up">
              {isCliente
                ? 'Solicitação Enviada com Sucesso!'
                : 'Cadastro Recebido com Sucesso!'}
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-8 animate-fade-up delay-100">
              {isCliente
                ? 'Entraremos em contato em breve via WhatsApp para confirmar seu atendimento.'
                : 'Nossa equipe irá analisar seu cadastro e entrar em contato em até 24 horas.'}
            </p>

            {/* Next Steps Card */}
            <div className="hero-card text-left mb-8 animate-fade-up delay-200">
              <h3 className="font-bold text-foreground mb-4">Próximos passos:</h3>
              <ul className="space-y-3">
                {isCliente ? (
                  <>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        1
                      </span>
                      <span className="text-muted-foreground">
                        Aguarde nosso contato via WhatsApp
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        2
                      </span>
                      <span className="text-muted-foreground">
                        Confirme sua localização e necessidade
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        3
                      </span>
                      <span className="text-muted-foreground">
                        Acompanhe o guincho em tempo real pelo app
                      </span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        1
                      </span>
                      <span className="text-muted-foreground">
                        Nossa equipe irá validar seus dados
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        2
                      </span>
                      <span className="text-muted-foreground">
                        Você receberá acesso ao app de parceiros
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        3
                      </span>
                      <span className="text-muted-foreground">
                        Comece a receber chamados na sua região!
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
              {isCliente ? (
                <>
                  <a
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="hero" size="lg" className="w-full sm:w-auto gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Falar no WhatsApp
                    </Button>
                  </a>
                  <Button variant="hero-outline" size="lg" className="w-full sm:w-auto gap-2">
                    <Download className="w-5 h-5" />
                    Baixar o App
                  </Button>
                </>
              ) : (
                <>
                  <a
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="hero" size="lg" className="w-full sm:w-auto gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Falar com a Equipe
                    </Button>
                  </a>
                </>
              )}
            </div>

            {/* Back to Home */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mt-8 transition-colors"
            >
              <Home className="w-4 h-4" />
              Voltar para o início
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
