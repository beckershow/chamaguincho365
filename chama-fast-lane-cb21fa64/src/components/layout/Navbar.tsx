import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from './UserMenu';

const navLinks = [{
  href: '#como-funciona',
  label: 'Como Funciona'
}, {
  href: '#planos',
  label: 'Planos'
}, {
  href: '#cobertura',
  label: 'Cobertura'
}, {
  href: '#contato',
  label: 'Contato'
}];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('#') && isHomePage) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
      <nav className="section-container">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              alt="Chama 365 Guinchos" 
              className="h-12 md:h-14 w-auto rounded-full object-fill" 
              src="/lovable-uploads/081437a2-8236-4062-abcf-8d16c805c42d.png" 
            />
          </Link>

          {/* Mobile Navigation - Scrollable */}
          {/* Mobile Navigation - Scrollable */}
          <div className="flex lg:hidden overflow-x-auto scrollbar-hide gap-0.5 ml-2 flex-1 items-center">
            {navLinks.map(link => (
              <a 
                key={link.href} 
                href={isHomePage ? link.href : `/${link.href}`} 
                onClick={e => {
                  if (isHomePage) {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }
                }} 
                className={`text-[10px] font-medium transition-colors whitespace-nowrap px-1 py-0.5 rounded-full ${isScrolled ? 'text-gray-800 hover:text-primary hover:bg-gray-100' : 'text-white hover:text-primary hover:bg-white/10'}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <a 
                key={link.href} 
                href={isHomePage ? link.href : `/${link.href}`} 
                onClick={e => {
                  if (isHomePage) {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }
                }} 
                className={`text-sm font-medium transition-colors ${isScrolled ? 'text-gray-800 hover:text-primary' : 'text-white hover:text-primary'}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs / User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link to="/login">
                  <Button variant="nav-outline" size="sm" className={isScrolled ? 'border-gray-800 text-gray-800 hover:bg-gray-100' : 'border-white text-white hover:bg-white/10'}>
                    Entrar
                  </Button>
                </Link>
                <Link to="/cadastro">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Cadastre-se
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile User Menu / Login Button */}
          <div className="lg:hidden flex items-center ml-2">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Link to="/login">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3">
                  Entrar
                </Button>
              </Link>
            )}
          </div>

        </div>
      </nav>
      
      {/* CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </header>
  );
}
