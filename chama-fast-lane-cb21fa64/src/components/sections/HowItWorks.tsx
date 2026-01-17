import { useState } from 'react';
import { Phone, MapPin, Truck, CheckCircle, UserPlus, Settings, Wallet } from 'lucide-react';
import appStep1 from '@/assets/app-step-1.jpeg';
import appStep2 from '@/assets/app-step-2.jpeg';
import appStep3 from '@/assets/app-step-3.jpeg';
const clienteSteps = [{
  icon: Phone,
  title: 'Solicite o Serviço',
  description: 'Ligue ou use nosso app para solicitar um guincho de forma rápida e fácil.',
  image: appStep1
}, {
  icon: MapPin,
  title: 'Envie sua Localização',
  description: 'Compartilhe sua localização e aguarde a confirmação do guincho mais próximo.',
  image: appStep2
}, {
  icon: Truck,
  title: 'Acompanhe em Tempo Real',
  description: 'Veja o guincho chegando até você no mapa, com tempo estimado de chegada.',
  image: appStep3
}, {
  icon: CheckCircle,
  title: 'Pronto!',
  description: 'Seu veículo será transportado com segurança ao destino escolhido.',
  image: appStep3
}];
const associadoSteps = [{
  icon: UserPlus,
  title: 'Cadastre-se',
  description: 'Faça seu cadastro e envie seus dados e documentos do veículo.'
}, {
  icon: Settings,
  title: 'Defina sua Área',
  description: 'Configure sua área de atuação e disponibilidade para receber chamados.'
}, {
  icon: Phone,
  title: 'Receba Chamados',
  description: 'Aceite os chamados que chegam na sua região diretamente pelo app.'
}, {
  icon: Wallet,
  title: 'Aumente seu Faturamento',
  description: 'Receba pagamentos semanais e acompanhe seus ganhos no painel.'
}];

// Phone mockup component
function PhoneMockup({
  image,
  alt
}: {
  image: string;
  alt: string;
}) {
  return <div className="relative mx-auto w-[180px] sm:w-[220px] md:w-[280px]">
      {/* Phone frame */}
      <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-foreground p-1.5 sm:p-2 shadow-2xl">
        {/* Inner bezel */}
        <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-black overflow-hidden">
          {/* Notch */}
          <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-4 sm:h-5 bg-foreground rounded-full z-10" />
          {/* Screen */}
          <img src={image} alt={alt} className="w-full aspect-[9/19] object-cover object-top" />
        </div>
      </div>
      {/* Reflection effect */}
      <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    </div>;
}
export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'cliente' | 'associado'>('cliente');
  const [activeStep, setActiveStep] = useState(0);
  const steps = activeTab === 'cliente' ? clienteSteps : associadoSteps;
  const handleTabChange = (tab: 'cliente' | 'associado') => {
    setActiveTab(tab);
    setActiveStep(0);
  };
  return <section id="como-funciona" className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-secondary/20 via-secondary/10 to-background">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16 -mt-4 md:-mt-8">
          <div className="flex flex-col items-center gap-2 mb-3 md:mb-4">
            <span className="badge-neutral inline-flex text-xs md:text-base font-sans text-primary-foreground px-3 py-1.5 md:px-4 md:py-2 text-center leading-snug rounded-full whitespace-nowrap bg-primary">
              Quando imprevistos acontecem, a solução precisa ser rápida.
            </span>
            <span className="badge-neutral inline-flex md:text-base font-sans px-3 py-1.5 md:px-4 md:py-2 text-center leading-snug rounded-full whitespace-nowrap bg-primary-foreground font-semibold text-sm text-sidebar-foreground">
              Chame um guincho ou faça parte da plataforma.
            </span>
          </div>
          <h2 className="section-title text-3xl md:text-4xl lg:text-5xl mb-3 md:mb-4 mt-8 md:mt-12">Como Funciona</h2>
          <p className="section-subtitle mx-auto font-semibold text-sidebar-foreground text-base md:text-lg px-4">Em 4 passos simples você tem um guincho 
a caminho do seu veículo</p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-8 md:mb-12 px-4">
          <div className="inline-flex items-center gap-1 p-1 sm:p-1.5 bg-secondary rounded-xl border border-border w-full sm:w-auto max-w-md">
            <button onClick={() => handleTabChange('cliente')} className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'cliente' ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
              Sou Cliente
            </button>
            <button onClick={() => handleTabChange('associado')} className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'associado' ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:text-foreground'}`}>
              Sou Guincheiro
            </button>
          </div>
        </div>

        {/* Content with Phone Mockup (only for cliente) */}
        {activeTab === 'cliente' ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Phone Mockup - Hidden on mobile, shown first on desktop */}
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="relative">
                <PhoneMockup image={clienteSteps[activeStep]?.image || appStep1} alt={`Passo ${activeStep + 1}: ${clienteSteps[activeStep]?.title}`} />
                {/* Glow effect behind phone */}
                <div className="absolute -inset-4 sm:-inset-8 -z-10 rounded-full blur-3xl opacity-30" style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.5) 0%, transparent 70%)"
            }} />
              </div>
            </div>

            {/* Steps List */}
            <div className="order-1 lg:order-2 space-y-3 md:space-y-4">
              {clienteSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            return <button key={index} onClick={() => setActiveStep(index)} className={`w-full text-left p-4 md:p-6 rounded-xl md:rounded-2xl border transition-all duration-300 ${isActive ? 'bg-primary/10 border-primary shadow-lg' : 'bg-card border-border hover:border-primary/50'}`}>
                    <div className="flex items-start gap-3 md:gap-4">
                      {/* Step Number */}
                      <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {index + 1}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                          <Icon className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          <h3 className={`font-bold text-sm md:text-base ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.title}
                          </h3>
                        </div>
                        <p className={`text-xs md:text-sm leading-relaxed ${isActive ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </button>;
          })}
            </div>
          </div> : (/* Associado Steps Grid */
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {associadoSteps.map((step, index) => {
          const Icon = step.icon;
          return <div key={index} className="step-card animate-scale-in p-4 md:p-6" style={{
            animationDelay: `${index * 100}ms`
          }}>
                  {/* Step Number */}
                  <span className="step-number">{index + 1}</span>

                  {/* Icon */}
                  <div className="icon-container mb-4 md:mb-6 w-12 h-12 md:w-14 md:h-14">
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>

                  {/* Content */}
                  <h3 className="text-base md:text-lg font-bold text-foreground mb-2 md:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>;
        })}
          </div>)}
      </div>
    </section>;
}