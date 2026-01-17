import { Zap, PhoneOff, Eye, Headphones, CreditCard, TrendingUp, MapPin, Smartphone, Clock, Users } from 'lucide-react';
import { RoadmapCard, type RoadmapItem } from '@/components/ui/roadmap-card';
import logoLaranja from '@/assets/logo-laranja.png';

const clienteBenefits: RoadmapItem[] = [{
  quarter: '01',
  icon: Zap,
  title: 'Atendimento rápido e organizado',
  description: 'Solicitação simplificada para você não perder tempo.',
  status: 'done'
}, {
  quarter: '02',
  icon: PhoneOff,
  title: 'Sem ligações repetidas ou espera desnecessária',
  description: 'Tudo pelo app, sem ficar no telefone esperando.',
  status: 'done'
}, {
  quarter: '03',
  icon: Eye,
  title: 'Acompanhamento do serviço em tempo real',
  description: 'Veja onde está o guincho direto no seu celular.',
  status: 'done'
}, {
  quarter: '04',
  icon: Headphones,
  title: 'Atendimento humano quando você precisar',
  description: 'Suporte real para te ajudar em qualquer situação.',
  status: 'done'
}, {
  quarter: '05',
  icon: CreditCard,
  title: 'Pagamento claro e sem surpresas',
  description: 'Saiba o valor antes de confirmar o serviço.',
  status: 'done'
}];

const associadoBenefits: RoadmapItem[] = [{
  quarter: '01',
  icon: TrendingUp,
  title: 'Mais oportunidades de serviço',
  description: 'Aumente sua demanda com nossa plataforma.',
  status: 'done'
}, {
  quarter: '02',
  icon: MapPin,
  title: 'Chamados na sua região',
  description: 'Receba solicitações próximas de você.',
  status: 'done'
}, {
  quarter: '03',
  icon: Smartphone,
  title: 'Plataforma simples de usar',
  description: 'App intuitivo para gerenciar seus atendimentos.',
  status: 'done'
}, {
  quarter: '04',
  icon: Clock,
  title: 'Menos tempo parado, mais rendimento',
  description: 'Otimize seu tempo e aumente seus ganhos.',
  status: 'done'
}, {
  quarter: '05',
  icon: Users,
  title: 'Suporte para te acompanhar',
  description: 'Equipe dedicada para ajudar você sempre.',
  status: 'done'
}];

export function Benefits() {
  return (
    <section id="beneficios" className="py-12 md:py-16 lg:py-24 relative overflow-hidden bg-gradient-to-b from-secondary/20 via-secondary/10 to-background">
      {/* Watermark logo */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        aria-hidden="true"
      >
        <img 
          src={logoLaranja} 
          alt="" 
          className="w-[300px] sm:w-[400px] md:w-[600px] lg:w-[800px] xl:w-[1000px] opacity-[0.03] select-none"
        />
      </div>

      <div className="section-container relative z-10">
        {/* Section Title */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Benefícios para Todos
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma pensada tanto para quem precisa de guincho quanto para quem oferece o serviço.
          </p>
        </div>

        {/* Two columns layout - Stack on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 xl:gap-16">
          {/* Cliente column */}
          <RoadmapCard 
            title="Para Clientes" 
            description="Quem precisa de um guincho"
            items={clienteBenefits}
          />

          {/* Associado column */}
          <RoadmapCard 
            title="Para Associados" 
            description="Guincheiros e empresas parceiras"
            items={associadoBenefits}
          />
        </div>
      </div>
    </section>
  );
}
