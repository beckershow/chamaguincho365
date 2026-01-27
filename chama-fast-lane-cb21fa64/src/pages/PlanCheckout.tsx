import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CreditCard,
  Zap,
  Package,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { subscriptionService } from '@/services/subscriptionService';

const PLAN_INFO = {
  BASICO: {
    name: 'Plano Básico',
    price: 49.99,
    icon: <Package className="w-6 h-6" />,
    features: [
      '1 resgate grátis por mês',
      'Até 40 km de cobertura',
      'Veículo cadastrado',
      'Km excedente: R$ 4,00/km',
    ],
  },
  INTERMEDIARIO: {
    name: 'Plano Intermediário',
    price: 79.99,
    icon: <Zap className="w-6 h-6" />,
    features: [
      '2 resgates grátis por mês',
      'Até 40 km cada resgate',
      'Veículo próprio ou de familiar',
      'Km excedente: R$ 4,00/km',
    ],
  },
};

type BillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD';

export default function PlanCheckout() {
  const { planCode } = useParams<{ planCode: 'BASICO' | 'INTERMEDIARIO' }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [billingType, setBillingType] = useState<BillingType>('PIX');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!planCode || !PLAN_INFO[planCode]) {
      navigate('/');
    }
  }, [isAuthenticated, planCode, navigate]);

  const plan = planCode ? PLAN_INFO[planCode] : null;

  const handleCreateSubscription = async () => {
    if (!planCode) return;

    setIsLoading(true);
    try {
      // Criar assinatura
      const result = await subscriptionService.createSubscription({
        plan_code: planCode,
        billing_type: billingType,
        customer_info: {
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone_number || '',
          cpf: user?.cpf_cnpj || '',
        },
      });

      toast.success('Assinatura criada com sucesso! Aguardando confirmação de pagamento.');

      // Redirecionar para perfil
      setTimeout(() => {
        navigate('/perfil?tab=subscription');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  if (!plan) return null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Finalizar Assinatura</h1>
          <p className="text-muted-foreground mt-2">
            Complete os dados para ativar seu {plan.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Forma de Pagamento */}
            <Card>
                <CardHeader>
                  <CardTitle>Escolha a forma de pagamento</CardTitle>
                  <CardDescription>
                    Selecione como deseja pagar sua assinatura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={billingType} onValueChange={(v) => setBillingType(v as BillingType)}>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="PIX" id="pix" />
                      <Label htmlFor="pix" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">PIX</p>
                            <p className="text-xs text-muted-foreground">Aprovação instantânea</p>
                          </div>
                          <Badge variant="secondary">Recomendado</Badge>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="BOLETO" id="boleto" />
                      <Label htmlFor="boleto" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">Boleto Bancário</p>
                          <p className="text-xs text-muted-foreground">Aprovação em até 3 dias úteis</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="CREDIT_CARD" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">Cartão de Crédito</p>
                          <p className="text-xs text-muted-foreground">Aprovação em até 2 dias</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                  <Button onClick={handleCreateSubscription} disabled={isLoading} className="w-full">
                    {isLoading ? 'Processando...' : 'Finalizar Assinatura'}
                  </Button>
                </CardContent>
              </Card>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {plan.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-2xl font-bold mt-1">
                      R$ {plan.price.toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Benefícios inclusos:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>R$ {plan.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de adesão</span>
                    <span className="text-green-600 dark:text-green-400">Grátis</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {plan.price.toFixed(2)}</span>
                  </div>
                </div>

                {billingType && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm font-medium">Pagamento</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {billingType === 'PIX' && 'Pagamento via PIX - Aprovação instantânea'}
                      {billingType === 'BOLETO' && 'Boleto Bancário - Até 3 dias úteis'}
                      {billingType === 'CREDIT_CARD' && 'Cartão de Crédito - Até 2 dias'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
