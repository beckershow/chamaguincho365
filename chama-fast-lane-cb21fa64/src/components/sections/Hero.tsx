import { Clock, MapPin, Users, Truck } from 'lucide-react';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';
import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import heroVideo from '@/assets/hero-video.mp4';

export function Hero() {
  return (
    <>
      <HeroGeometric 
        badge="Atendimento 24 horas" 
        title1="O jeito inteligente" 
        title2="de chamar um guincho" 
        rightContent={<PhoneMockup />}
      >
      {/* Subheadline */}
      <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-6 md:mb-8 max-w-lg text-background/80 text-left -mt-3 md:-mt-5">
        Uma plataforma simples que conecta <br />motoristas e guincheiros <br />em poucos minutos.
      </p>

      {/* Badges Row - Responsivo */}
      <div className="flex flex-wrap items-center gap-2 mb-6 md:mb-8">
        
        <span className="inline-flex items-center gap-1.5 px-2 py-1 md:px-2.5 rounded-full bg-background/10 text-background border border-background/20 text-xs">
          <MapPin className="w-3 h-3 text-primary" />
          <span className="hidden xs:inline">Cobertura</span> ​Cobertura Nacional 
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-1 md:px-2.5 rounded-full bg-background/10 text-background border border-background/20 text-xs">
          <Users className="w-3 h-3 text-primary" />
          <span className="hidden xs:inline">Suporte</span> ​Suporte Humanizado 
        </span>
      </div>

    </HeroGeometric>
    
    {/* App Download Buttons - Acima da linha preta */}
    <div className="relative -mt-32 md:-mt-40 z-20 flex justify-center w-full mb-4">
      <div className="flex flex-row gap-2">
        {/* App Store Button */}
        <a 
          href="#" 
          className="inline-flex items-center gap-2 bg-black text-white px-5 py-1.5 rounded-lg hover:bg-black/90 transition-colors border border-gray-600 min-w-[140px]"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          <div className="text-left">
            <p className="text-[8px] leading-tight opacity-80">Download on the</p>
            <p className="text-xs font-semibold leading-tight">App Store</p>
          </div>
        </a>

        {/* Google Play Button */}
        <a 
          href="#" 
          className="inline-flex items-center gap-2 bg-black text-white px-5 py-1.5 rounded-lg hover:bg-black/90 transition-colors border border-gray-600 min-w-[140px]"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
            <path fill="#EA4335" d="M3.609 1.814L13.445 12 3.61 22.186a2.002 2.002 0 01-.609-1.452V3.266c0-.573.231-1.085.608-1.452z" />
            <path fill="#FBBC04" d="M16.28 15.176L13.445 12l2.835-3.176 3.88 2.086c.63.345 1.005.936 1.005 1.59s-.376 1.245-1.005 1.59l-3.88 2.086z" />
            <path fill="#4285F4" d="M3.609 22.186L13.445 12l2.835 3.176-10.56 5.668a1.763 1.763 0 01-2.111-1.658z" />
            <path fill="#34A853" d="M16.28 8.824L3.609 1.814A1.763 1.763 0 015.72.156l10.56 5.668L13.445 12l2.835-3.176z" />
          </svg>
          <div className="text-left">
            <p className="text-[8px] leading-tight opacity-80 uppercase tracking-wide">Get it on</p>
            <p className="text-xs font-semibold leading-tight">Google Play</p>
          </div>
        </a>
      </div>
    </div>
    
    {/* Metrics - Centralizados com a marca d'água */}
    <div className="relative z-20 flex justify-center w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 1.2, duration: 0.8 }} 
        className="grid grid-cols-3 gap-3 md:flex md:items-center md:justify-center md:gap-6 pt-6 md:pt-8 border-t border-secondary-foreground justify-items-center max-w-md md:max-w-none"
      >
        <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-sidebar-primary border border-solid border-secondary-foreground">
            <Truck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div className="text-center md:text-left">
            <p className="font-bold text-sm md:text-lg text-secondary-foreground">+10.000</p>
            <p className="text-xs md:text-sm text-secondary-foreground">Atendimentos</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-sidebar-primary border border-solid border-secondary-foreground">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div className="text-center md:text-left">
            <p className="font-bold text-sm md:text-lg text-secondary-foreground">+500</p>
            <p className="text-xs md:text-sm text-secondary-foreground">Parceiros</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-sidebar-primary border-secondary-foreground border border-solid">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div className="text-center md:text-left">
            <p className="font-bold text-sm md:text-lg text-secondary-foreground whitespace-nowrap">até 30min</p>
            <p className="text-xs md:text-sm text-secondary-foreground">Chegada</p>
          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
}

function PhoneMockup() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isVisible]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-[160px] sm:max-w-[200px] md:max-w-[260px] lg:max-w-[300px]"
    >
      {/* Phone frame */}
      <div className="relative bg-foreground rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] p-1.5 sm:p-2 shadow-2xl z-10">
        {/* Inner screen area */}
        <div 
          className="relative rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden"
          style={{ aspectRatio: '9/19' }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 md:w-24 h-4 sm:h-5 md:h-6 bg-foreground rounded-b-xl md:rounded-b-2xl z-20" />
          
          {/* Video */}
          {isVisible && (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover object-center"
              src={heroVideo}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster=""
            />
          )}
          
          {/* Fallback/Loading state */}
          {!isVisible && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-sidebar-primary/40" />
          )}
        </div>
      </div>

      {/* Decorative elements - Hidden on mobile */}
      <div className="hidden sm:block absolute -top-4 -right-4 w-20 h-20 bg-primary/30 rounded-full blur-xl z-0" />
      <div className="hidden sm:block absolute -bottom-8 -left-8 w-32 h-32 bg-sidebar-primary/20 rounded-full blur-2xl z-0" />
    </div>
  );
}