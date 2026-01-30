import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-12 md:py-16 lg:py-24 bg-foreground text-background">
      <div className="section-container px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-primary mb-6 md:mb-8 bg-secondary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs md:text-sm font-medium">Atendimento 24 horas</span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 md:mb-6 leading-tight">
            Precisa de guincho agora?<br />
            <span className="text-primary">Ou quer ganhar mais com seu guincho?</span>
          </h2>

          {/* Subheadline */}
          <p className="text-sm md:text-base lg:text-lg text-background/70 mb-6 md:mb-8 lg:mb-10 max-w-xl mx-auto">
            Estamos prontos para ajudar você, seja como cliente ou como parceiro. Comece agora mesmo!
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center">
            <Link to="/cadastro" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="w-full sm:w-auto gap-2 text-sm md:text-base">
                Cadastre-se agora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
