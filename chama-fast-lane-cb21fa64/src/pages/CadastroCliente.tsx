import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function CadastroCliente() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    cidade: '',
    estado: '',
    tipoNecessidade: '',
    lgpdConsent: false,
  });

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.lgpdConsent) {
      toast({
        title: 'Atenção',
        description: 'Você precisa aceitar os termos para continuar.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // Simular envio (substituir por Supabase)
    setTimeout(() => {
      setIsLoading(false);
      navigate('/obrigado?tipo=cliente');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="section-container">
          <div className="max-w-xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o início
            </button>

            {/* Form Card */}
            <div className="hero-card">
              <div className="text-center mb-8">
                <div className="icon-container-lg mx-auto mb-4">
                  <Phone className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Solicitar Guincho
                </h1>
                <p className="text-muted-foreground">
                  Preencha seus dados para entrarmos em contato
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      whatsapp: formatWhatsApp(e.target.value) 
                    })}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                {/* Cidade e Estado */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      type="text"
                      placeholder="Sua cidade"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value) => setFormData({ ...formData, estado: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((uf) => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tipo de Necessidade */}
                <div className="space-y-2">
                  <Label htmlFor="tipoNecessidade">O que você precisa?</Label>
                  <Select
                    value={formData.tipoNecessidade}
                    onValueChange={(value) => setFormData({ ...formData, tipoNecessidade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preciso_agora">Preciso de guincho agora</SelectItem>
                      <SelectItem value="quero_cotacao">Quero uma cotação</SelectItem>
                      <SelectItem value="quero_conhecer">Quero conhecer os planos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* LGPD Consent */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="lgpd"
                    checked={formData.lgpdConsent}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, lgpdConsent: checked as boolean })
                    }
                  />
                  <Label htmlFor="lgpd" className="text-sm text-muted-foreground leading-relaxed">
                    Concordo com a{' '}
                    <a href="#" className="text-primary hover:underline">
                      Política de Privacidade
                    </a>{' '}
                    e autorizo o uso dos meus dados para contato.
                  </Label>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Enviando...'
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Enviar Solicitação
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
