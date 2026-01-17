import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Truck, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const tiposGuincho = [
  { value: 'plataforma', label: 'Plataforma' },
  { value: 'reboque_leve', label: 'Reboque Leve' },
  { value: 'munck', label: 'Munck' },
  { value: 'pesado', label: 'Pesado (caminhões)' },
];

export default function CadastroAssociado() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [areaAtuacao, setAreaAtuacao] = useState([50]);
  const [tiposGuinchoSelecionados, setTiposGuinchoSelecionados] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    cidade: '',
    estado: '',
    possuiCaminhao: '',
    disponibilidade: '',
    observacoes: '',
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

  const toggleTipoGuincho = (tipo: string) => {
    setTiposGuinchoSelecionados((prev) =>
      prev.includes(tipo)
        ? prev.filter((t) => t !== tipo)
        : [...prev, tipo]
    );
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
      navigate('/obrigado?tipo=associado');
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
                  <Truck className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Seja um Associado
                </h1>
                <p className="text-muted-foreground">
                  Aumente sua renda recebendo chamados na sua região
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

                {/* Possui Caminhão Plataforma */}
                <div className="space-y-2">
                  <Label>Possui caminhão plataforma?</Label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, possuiCaminhao: 'sim' })}
                      className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                        formData.possuiCaminhao === 'sim'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, possuiCaminhao: 'nao' })}
                      className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                        formData.possuiCaminhao === 'nao'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>

                {/* Tipo de Guincho */}
                <div className="space-y-2">
                  <Label>Tipo de guincho (selecione todos que possui)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {tiposGuincho.map((tipo) => (
                      <button
                        key={tipo.value}
                        type="button"
                        onClick={() => toggleTipoGuincho(tipo.value)}
                        className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          tiposGuinchoSelecionados.includes(tipo.value)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {tipo.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Disponibilidade */}
                <div className="space-y-2">
                  <Label>Disponibilidade</Label>
                  <Select
                    value={formData.disponibilidade}
                    onValueChange={(value) => setFormData({ ...formData, disponibilidade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua disponibilidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 horas</SelectItem>
                      <SelectItem value="comercial">Horário comercial (8h às 18h)</SelectItem>
                      <SelectItem value="noturno">Noturno (18h às 6h)</SelectItem>
                      <SelectItem value="fins_semana">Fins de semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Área de Atuação */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Área de atuação</Label>
                    <span className="text-sm font-semibold text-primary">
                      {areaAtuacao[0]} km
                    </span>
                  </div>
                  <Slider
                    value={areaAtuacao}
                    onValueChange={setAreaAtuacao}
                    min={10}
                    max={300}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10 km</span>
                    <span>300 km</span>
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações (opcional)</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informações adicionais sobre seu serviço..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={3}
                  />
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
                      Enviar Cadastro
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
