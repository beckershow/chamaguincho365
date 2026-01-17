import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import logoChama365 from '@/assets/logo-chama365.png';
import { Benefits } from '@/components/sections/Benefits';
import { Pricing } from '@/components/sections/Pricing';
import { Coverage } from '@/components/sections/Coverage';
import { Testimonials } from '@/components/sections/Testimonials';
import { FAQ } from '@/components/sections/FAQ';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { AppDownload } from '@/components/sections/AppDownload';
const Index = () => {
  return <div className="min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <main className="w-full overflow-x-hidden">
        <div className="flex justify-center pt-16 pb-1 bg-secondary-foreground">
          
        </div>
        <Hero />
        <HowItWorks />
        <Benefits />
        <Pricing />
        <Coverage />
        <Testimonials />
        <FAQ />
        <AppDownload />
        <FinalCTA />
      </main>
      <Footer />
    </div>;
};
export default Index;