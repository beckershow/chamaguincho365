"use client";

import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import { BackgroundGlow } from "@/components/ui/background-glow";
import logoLaranja from "@/assets/logo-laranja.png";
function HeroGeometric({
  badge = "Design Collective",
  title1 = "Elevate Your Digital Vision",
  title2 = "Crafting Exceptional Websites",
  children,
  rightContent,
  logo
}: {
  badge?: string;
  title1?: string;
  title2?: string;
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
  logo?: React.ReactNode;
}) {
  const fadeUpVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1] as const
      }
    })
  };
  return <BackgroundGlow className="flex items-center justify-center overflow-hidden">
      {/* Watermark logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 -mt-8 sm:-mt-12 md:-mt-16 lg:-mt-20" aria-hidden="true">
        <img 
          src={logoLaranja} 
          alt="" 
          className="w-[300px] sm:w-[400px] md:w-[600px] lg:w-[800px] xl:w-[1000px] opacity-[0.25] select-none"
          style={{ filter: 'sepia(0.6) saturate(1.2) brightness(0.7) hue-rotate(-5deg)' }}
        />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row items-start gap-4 sm:gap-8 lg:gap-12 -mt-8 sm:-mt-12 md:-mt-16 lg:-mt-20 pb-6 sm:pb-8 md:pb-12 lg:pb-16">
          {/* Left side - Text content */}
          <div className="flex-1 text-left w-full lg:max-w-xl">
            

            {logo}

            <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 tracking-tight">
                <span className="text-background">{title1}</span>
                <br />
                <span className="text-gradient bg-clip-text text-primary text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl">{title2}</span>
              </h1>
            </motion.div>

            <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
              {children}
            </motion.div>
          </div>

          {/* Right side - Visual content */}
          {rightContent && <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible" className="flex-1 flex justify-center sm:justify-end w-full">
              {rightContent}
            </motion.div>}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] sm:h-[50%] bg-gradient-to-t from-background via-background/40 via-40% to-transparent pointer-events-none" />
    </BackgroundGlow>;
}
export { HeroGeometric };