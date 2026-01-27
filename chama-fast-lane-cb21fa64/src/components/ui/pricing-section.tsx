"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  name: string;
  description: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: Feature[];
  highlight?: boolean;
  badge?: string;
  icon: React.ReactNode;
  href?: string;
  buttonText?: string;
  onClick?: () => void;
}

interface PricingSectionProps {
  tiers: PricingTier[];
  className?: string;
}

function PricingSection({
  tiers,
  className
}: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false);

  const buttonStyles = {
    default: cn("h-10 md:h-12 bg-card", "hover:bg-accent", "text-foreground", "border border-border", "hover:border-primary/50", "shadow-sm hover:shadow-md", "text-sm font-semibold"),
    highlight: cn("h-10 md:h-12 bg-primary", "hover:bg-primary/90", "text-primary-foreground", "shadow-[0_1px_15px_rgba(255,129,0,0.3)]", "hover:shadow-[0_1px_20px_rgba(255,129,0,0.4)]", "text-sm font-semibold")
  };

  const badgeStyles = cn("px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm font-medium", "bg-primary", "text-primary-foreground", "border-none shadow-lg");

  return (
    <section className={cn("py-12 md:py-16 lg:py-24 bg-background relative overflow-hidden", className)}>
      {/* Glow effects - Hidden on mobile for performance */}
      <div className="hidden md:block absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{
        background: "radial-gradient(circle, hsl(var(--primary) / 0.5) 0%, transparent 70%)"
      }} />
      <div className="hidden md:block absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-15 pointer-events-none" style={{
        background: "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)"
      }} />

      <div className="section-container relative px-4">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 md:gap-4 mb-8 md:mb-12 lg:mb-16">
          <span className="badge-neutral mb-1 md:mb-2 inline-flex bg-primary text-primary-foreground text-xs md:text-sm text-center px-3 py-1.5">
            Planos que se adaptam à sua necessidade
          </span>
          <h2 className="section-title text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Escolha seu Plano
          </h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto text-sm md:text-base lg:text-lg px-4">
            Escolha a opção ideal e utilize quando precisar. Transparência, controle e segurança para você não ficar na mão.
          </p>

          {/* Toggle */}
          <div className="flex items-center gap-1 p-1 md:p-1.5 bg-secondary rounded-full border border-border w-full sm:w-auto max-w-xs">
            {["Mensal", "Anual"].map(period => (
              <button 
                key={period} 
                onClick={() => setIsYearly(period === "Anual")} 
                className={cn(
                  "flex-1 sm:flex-initial px-4 sm:px-6 md:px-8 py-2 md:py-2.5 text-xs md:text-sm font-medium rounded-full transition-all duration-300", 
                  period === "Anual" === isYearly 
                    ? "bg-foreground text-background shadow-lg" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {period}
                {period === "Anual" && <span className="ml-1 md:ml-2 text-[10px] md:text-xs text-primary font-semibold">-20%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className={cn(
          "grid gap-4 md:gap-6 lg:gap-8 max-w-4xl mx-auto", 
          tiers.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl"
        )}>
          {tiers.map(tier => (
            <div 
              key={tier.name} 
              className={cn(
                "relative rounded-2xl md:rounded-3xl transition-all duration-300 flex flex-col", 
                tier.highlight 
                  ? "bg-foreground text-background z-10 shadow-2xl scale-100 sm:scale-[1.02]" 
                  : "bg-card border border-border shadow-lg hover:shadow-xl hover:-translate-y-1"
              )}
            >
              {tier.badge && tier.highlight && (
                <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 z-20">
                  <Badge className={badgeStyles}>
                    {tier.badge}
                  </Badge>
                </div>
              )}

              <div className="p-5 md:p-6 lg:p-8">
                {/* Icon & Name */}
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                  <div className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center", 
                    tier.highlight ? "bg-primary/20" : "bg-primary/10"
                  )}>
                    {tier.icon}
                  </div>
                  <span className={cn(
                    "text-base md:text-lg font-bold tracking-wide", 
                    tier.highlight ? "text-background" : "text-foreground"
                  )}>
                    {tier.name}
                  </span>
                </div>

                {/* Price */}
                <div className="mb-4 md:mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-base md:text-lg", tier.highlight ? "text-background/70" : "text-muted-foreground")}>
                      R$
                    </span>
                    <span className={cn("text-4xl md:text-5xl font-bold tabular-nums", tier.highlight ? "text-background" : "text-foreground")}>
                      {isYearly ? tier.price.yearly : tier.price.monthly}
                    </span>
                    <span className={cn("text-base md:text-lg", tier.highlight ? "text-background/70" : "text-muted-foreground")}>
                      /{isYearly ? "ano" : "mês"}
                    </span>
                  </div>
                  <p className={cn("text-xs md:text-sm mt-1 md:mt-2", tier.highlight ? "text-background/60" : "text-muted-foreground")}>
                    {tier.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  {tier.features.map(feature => (
                    <div key={feature.name} className="flex gap-3 md:gap-4">
                      <div className={cn(
                        "w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", 
                        feature.included 
                          ? tier.highlight 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-primary/10 text-primary" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        <Check className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      </div>
                      <div className="min-w-0">
                        <span className={cn(
                          "text-xs md:text-sm font-medium block break-words", 
                          feature.included 
                            ? tier.highlight 
                              ? "text-background" 
                              : "text-foreground" 
                            : "text-muted-foreground line-through"
                        )}>
                          {feature.name}
                        </span>
                        <span className={cn("text-[10px] md:text-xs break-words", tier.highlight ? "text-background/60" : "text-muted-foreground")}>
                          {feature.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className="px-5 md:px-6 lg:px-8 pb-5 md:pb-6 lg:pb-8 mt-auto pt-2 md:pt-4">
                {tier.onClick ? (
                  <Button
                    className={cn("w-full rounded-lg md:rounded-xl gap-2", tier.highlight ? buttonStyles.highlight : buttonStyles.default)}
                    onClick={tier.onClick}
                  >
                    {tier.highlight ? (
                      <>
                        {tier.buttonText || "Escolher Plano"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        {tier.buttonText || "Começar Agora"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    className={cn("w-full rounded-lg md:rounded-xl gap-2", tier.highlight ? buttonStyles.highlight : buttonStyles.default)}
                    asChild
                  >
                    <a href={tier.href || "/cadastro/cliente"}>
                      {tier.highlight ? (
                        <>
                          {tier.buttonText || "Escolher Plano"}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          {tier.buttonText || "Começar Agora"}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { PricingSection };
export type { PricingTier, Feature };
