import { Sparkles, Zap, Shield, Check, Star, MapPin, Smartphone } from 'lucide-react';
import { PricingSection, type PricingTier } from '@/components/ui/pricing-section';

const pricingTiers: PricingTier[] = [{
  name: "BÁSICO",
  price: {
    monthly: 49.99,
    yearly: 39.99
  },
  description: "Ideal para quem busca proteção em situações pontuais.",
  href: "/cadastro/cliente",
  buttonText: "Escolher Plano Básico",
  icon: <div className="relative">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>,
  features: [{
    name: "1 resgate grátis por mês",
    description: "Até 40 km de cobertura",
    included: true
  }, {
    name: "Veículo cadastrado",
    description: "Válido somente para o veículo cadastrado",
    included: true
  }, {
    name: "Ativação em até 48h",
    description: "Após confirmação do pagamento",
    included: true
  }, {
    name: "Km excedente: R$ 4,00/km",
    description: "Carros e motos após 40 km",
    included: true
  }]
}, {
  name: "INTERMEDIÁRIO",
  price: {
    monthly: 79.99,
    yearly: 63.99
  },
  description: "Para quem quer mais flexibilidade e tranquilidade no dia a dia.",
  highlight: true,
  badge: "Mais Popular",
  href: "/cadastro/cliente",
  buttonText: "Escolher Plano Intermediário",
  icon: <div className="relative">
        <Zap className="w-6 h-6 text-primary" />
      </div>,
  features: [{
    name: "2 resgates grátis por mês",
    description: "Até 40 km cada resgate",
    included: true
  }, {
    name: "Veículo próprio ou de familiar",
    description: "Pode cadastrar veículo de familiar/amigo",
    included: true
  }, {
    name: "Ativação em até 48h",
    description: "Após confirmação do pagamento",
    included: true
  }, {
    name: "Km excedente: R$ 4,00/km",
    description: "Carros e motos após 40 km",
    included: true
  }]
}];

export function Pricing() {
  return (
    <section id="planos">
      <PricingSection tiers={pricingTiers} />
      
      {/* Regras Gerais - Layout Compacto */}
      <div className="bg-background pb-6 md:pb-8">
        <div className="section-container px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 p-4 md:p-6 rounded-xl md:rounded-2xl bg-card/50 shadow-xl shadow-black/10 border border-border/50 backdrop-blur-sm">
              {/* Regras */}
              <div className="border rounded-xl p-4 md:p-5 border-muted-foreground bg-secondary">
                <h4 className="text-sm font-semibold text-foreground mb-2 md:mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                  Regras
                </h4>
                <ul className="space-y-1.5 md:space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong className="text-foreground">1 veículo por CPF</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    <span>Bloqueio automático ao vencer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    <span>Renovação antes: ativação imediata</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    <span>Renovação após: até 48h</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    <span>Aviso 3 dias antes do vencimento</span>
                  </li>
                </ul>
              </div>

              {/* Km Excedente */}
              <div className="border rounded-xl p-4 md:p-5 border-muted-foreground bg-secondary">
                <h4 className="text-sm font-semibold text-foreground mb-2 md:mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  Km Excedente
                </h4>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Carros/Motos</span>
                    <span className="font-semibold text-foreground">R$ 4,00/km</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Utilitários/Vans</span>
                    <span className="font-semibold text-foreground">R$ 4,25/km</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border">
                  Após os 40 km inclusos no plano
                </p>
              </div>

              {/* Pagamento */}
              <div className="border rounded-xl p-4 md:p-5 bg-muted border-muted-foreground sm:col-span-2 md:col-span-1">
                <h4 className="text-sm font-semibold text-foreground mb-2 md:mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary flex-shrink-0" />
                  Pagamento
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted-foreground text-primary-foreground">Pix</span>
                  <span className="px-3 py-1.5 text-xs font-medium rounded-full text-primary-foreground bg-muted-foreground">Débito</span>
                  <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted-foreground text-primary-foreground">TED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-background pb-12 md:pb-16">
        <div className="section-container px-4">
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 pt-6 md:pt-8 border-t border-border">
            <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-muted-foreground">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
              Suporte humanizado
            </div>
            <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-muted-foreground">
              <Check className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
              Sistemas 100% sincronizados
            </div>
            <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-muted-foreground">
              <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
              Válido no app e no site
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
