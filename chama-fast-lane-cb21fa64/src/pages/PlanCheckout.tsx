import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Loader2,
  QrCode,
  Landmark,
} from 'lucide-react';
import {
  subscriptionService,
  ApiError,
  type BillingType,
  type PlanCode,
  type CreditCardData,
  type CreditCardHolderInfo,
} from '@/services/subscriptionService';

// ===================== PLAN INFO =====================

const PLAN_INFO: Record<PlanCode, { name: string; price: number; icon: JSX.Element; features: string[] }> = {
  BASICO: {
    name: 'Plano Basico',
    price: 49.90,
    icon: <Package className="w-6 h-6" />,
    features: [
      'Acesso a plataforma de guincho',
      'Suporte por chat',
      'Cobertura em todo o Brasil',
      'Pagamento mensal',
    ],
  },
  PRO: {
    name: 'Plano Pro',
    price: 99.90,
    icon: <Zap className="w-6 h-6" />,
    features: [
      'Tudo do Basico',
      'Prioridade no atendimento',
      'Suporte prioritario 24h',
      'Relatorios avancados',
      'Cobertura premium',
    ],
  },
};

// ===================== VALIDACOES =====================

function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === parseInt(digits[10]);
}

// ===================== COMPONENT =====================

export default function PlanCheckout() {
  const { planCode } = useParams<{ planCode: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [billingType, setBillingType] = useState<BillingType>('PIX');
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingStartRef = useRef<number>(0);

  // Credit card fields (never persisted)
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardMonth, setCardMonth] = useState('');
  const [cardYear, setCardYear] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Holder info fields
  const [holderName, setHolderName] = useState('');
  const [holderEmail, setHolderEmail] = useState('');
  const [holderCpf, setHolderCpf] = useState('');
  const [holderCep, setHolderCep] = useState('');
  const [holderAddressNumber, setHolderAddressNumber] = useState('');
  const [holderComplement, setHolderComplement] = useState('');
  const [holderPhone, setHolderPhone] = useState('');

  const validPlanCode = (planCode === 'BASICO' || planCode === 'PRO') ? planCode as PlanCode : null;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!validPlanCode) {
      navigate('/');
    }
  }, [isAuthenticated, validPlanCode, navigate]);

  // Pre-fill holder info from user
  useEffect(() => {
    if (user) {
      setHolderName(user.name || '');
      setHolderEmail(user.email || '');
      setHolderCpf(user.cpf_cnpj || '');
    }
  }, [user]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const plan = validPlanCode ? PLAN_INFO[validPlanCode] : null;

  const startPolling = useCallback(() => {
    setIsPolling(true);
    pollingStartRef.current = Date.now();
    pollingRef.current = setInterval(async () => {
      // Stop after 10 minutes
      if (Date.now() - pollingStartRef.current > 10 * 60 * 1000) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setIsPolling(false);
        return;
      }
      try {
        const sub = await subscriptionService.getMySubscription();
        if (sub.local && sub.local.status !== 'PENDING') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setIsPolling(false);
          if (sub.local.status === 'ACTIVE') {
            toast.success('Pagamento confirmado! Assinatura ativada.');
          }
          navigate('/perfil?tab=subscription');
        }
      } catch {
        // ignore polling errors
      }
    }, 30000);
  }, [navigate]);

  const handleCheckStatus = async () => {
    try {
      const sub = await subscriptionService.getMySubscription();
      if (sub.local && sub.local.status === 'ACTIVE') {
        toast.success('Pagamento confirmado! Assinatura ativada.');
        navigate('/perfil?tab=subscription');
      } else {
        toast.info('Pagamento ainda nao confirmado. Aguarde alguns instantes.');
      }
    } catch {
      toast.error('Erro ao verificar status.');
    }
  };

  const validateCreditCardForm = (): string | null => {
    const num = cardNumber.replace(/\D/g, '');
    if (num.length < 13 || num.length > 19) return 'Numero do cartao invalido.';
    if (!luhnCheck(num)) return 'Numero do cartao invalido.';
    if (cardHolder.trim().length < 3) return 'Nome do titular obrigatorio (min 3 caracteres).';
    const month = parseInt(cardMonth);
    if (isNaN(month) || month < 1 || month > 12) return 'Mes de expiracao invalido.';
    const year = parseInt(cardYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < currentYear) return 'Ano de expiracao invalido.';
    const cvv = cardCvv.replace(/\D/g, '');
    if (cvv.length < 3 || cvv.length > 4) return 'CVV invalido.';
    const cpf = holderCpf.replace(/\D/g, '');
    if (cpf.length === 11 && !validateCPF(cpf)) return 'CPF invalido.';
    if (cpf.length !== 11 && cpf.length !== 14) return 'CPF/CNPJ invalido.';
    const cep = holderCep.replace(/\D/g, '');
    if (cep.length !== 8) return 'CEP invalido (8 digitos).';
    if (!holderAddressNumber.trim()) return 'Numero do endereco obrigatorio.';
    if (!holderName.trim()) return 'Nome completo obrigatorio.';
    if (!holderEmail.trim()) return 'Email obrigatorio.';
    return null;
  };

  const handleCreateSubscription = async () => {
    if (!validPlanCode) return;

    if (billingType === 'CREDIT_CARD') {
      const error = validateCreditCardForm();
      if (error) {
        toast.error(error);
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload: any = {
        planCode: validPlanCode,
        billingType,
      };

      if (billingType === 'CREDIT_CARD') {
        payload.creditCard = {
          holderName: cardHolder.trim(),
          number: cardNumber.replace(/\D/g, ''),
          expiryMonth: cardMonth.padStart(2, '0'),
          expiryYear: cardYear,
          ccv: cardCvv.replace(/\D/g, ''),
        } as CreditCardData;

        payload.creditCardHolderInfo = {
          name: holderName.trim(),
          email: holderEmail.trim(),
          cpfCnpj: holderCpf.replace(/\D/g, ''),
          postalCode: holderCep.replace(/\D/g, ''),
          addressNumber: holderAddressNumber.trim(),
          addressComplement: holderComplement.trim() || undefined,
          mobilePhone: holderPhone.replace(/\D/g, '') || undefined,
        } as CreditCardHolderInfo;
      }

      const result = await subscriptionService.createSubscription(payload);

      // PIX or DEBIT_CARD: redirect to invoiceUrl
      if (billingType !== 'CREDIT_CARD' && result.subscription?.invoiceUrl) {
        toast.success('Assinatura criada! Redirecionando para pagamento...');
        window.open(result.subscription.invoiceUrl, '_blank');
        startPolling();
        return;
      }

      toast.success('Assinatura criada com sucesso!');
      setTimeout(() => navigate('/perfil?tab=subscription'), 1500);
    } catch (error: any) {
      if (error instanceof ApiError) {
        // Redirecionar para login se erro de autenticação
        if (error.isAuthError) {
          toast.error(error.message);
          navigate('/login');
          return;
        }
        toast.error(error.message);
      } else {
        toast.error(error?.message || 'Erro ao criar assinatura. Tente novamente.');
      }
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
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Finalizar Assinatura</h1>
          <p className="text-muted-foreground mt-2">
            Complete os dados para ativar seu {plan.name}
          </p>
        </div>

        {/* Polling banner */}
        {isPolling && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Aguardando confirmacao de pagamento...</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Verificando automaticamente a cada 30 segundos</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleCheckStatus}>
                Ja paguei, verificar
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario */}
          <div className="lg:col-span-2 space-y-6">
            {/* Forma de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Escolha a forma de pagamento</CardTitle>
                <CardDescription>Selecione como deseja pagar sua assinatura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={billingType} onValueChange={(v) => setBillingType(v as BillingType)}>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="PIX" id="pix" />
                    <Label htmlFor="pix" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4" />
                          <div>
                            <p className="font-medium">PIX</p>
                            <p className="text-xs text-muted-foreground">Aprovacao instantanea</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Recomendado</Badge>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="BOLETO" id="boleto" />
                    <Label htmlFor="boleto" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4" />
                        <div>
                          <p className="font-medium">Boleto Bancário</p>
                          <p className="text-xs text-muted-foreground">Aprovação em até 3 dias úteis</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="CREDIT_CARD" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <div>
                          <p className="font-medium">Cartao de Credito</p>
                          <p className="text-xs text-muted-foreground">Pagamento recorrente automatico</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Formulario de Cartao de Credito */}
            {billingType === 'CREDIT_CARD' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Dados do Cartao</CardTitle>
                    <CardDescription>Informe os dados do seu cartao de credito</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Numero do Cartao</Label>
                      <Input
                        id="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                        autoComplete="cc-number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardHolder">Nome do Titular (como no cartao)</Label>
                      <Input
                        id="cardHolder"
                        placeholder="NOME COMPLETO"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        autoComplete="cc-name"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardMonth">Mes</Label>
                        <Input
                          id="cardMonth"
                          placeholder="MM"
                          value={cardMonth}
                          onChange={(e) => setCardMonth(e.target.value)}
                          maxLength={2}
                          autoComplete="cc-exp-month"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardYear">Ano</Label>
                        <Input
                          id="cardYear"
                          placeholder="AAAA"
                          value={cardYear}
                          onChange={(e) => setCardYear(e.target.value)}
                          maxLength={4}
                          autoComplete="cc-exp-year"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input
                          id="cardCvv"
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          maxLength={4}
                          type="password"
                          autoComplete="cc-csc"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dados do Titular</CardTitle>
                    <CardDescription>Informacoes de cobranca</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="holderName">Nome Completo</Label>
                        <Input
                          id="holderName"
                          value={holderName}
                          onChange={(e) => setHolderName(e.target.value)}
                          placeholder="Nome completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="holderEmail">Email</Label>
                        <Input
                          id="holderEmail"
                          type="email"
                          value={holderEmail}
                          onChange={(e) => setHolderEmail(e.target.value)}
                          placeholder="email@email.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="holderCpf">CPF/CNPJ</Label>
                        <Input
                          id="holderCpf"
                          value={holderCpf}
                          onChange={(e) => setHolderCpf(e.target.value)}
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="holderCep">CEP</Label>
                        <Input
                          id="holderCep"
                          value={holderCep}
                          onChange={(e) => setHolderCep(e.target.value)}
                          placeholder="00000-000"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="holderAddressNumber">Numero</Label>
                        <Input
                          id="holderAddressNumber"
                          value={holderAddressNumber}
                          onChange={(e) => setHolderAddressNumber(e.target.value)}
                          placeholder="123"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="holderComplement">Complemento</Label>
                        <Input
                          id="holderComplement"
                          value={holderComplement}
                          onChange={(e) => setHolderComplement(e.target.value)}
                          placeholder="Apto 1 (opcional)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="holderPhone">Celular</Label>
                        <Input
                          id="holderPhone"
                          value={holderPhone}
                          onChange={(e) => setHolderPhone(e.target.value)}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Botao Finalizar */}
            <Button
              onClick={handleCreateSubscription}
              disabled={isLoading || isPolling}
              className="w-full h-12 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Finalizar Assinatura'
              )}
            </Button>
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
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                      <span className="text-sm font-normal text-muted-foreground">/mes</span>
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Beneficios inclusos:</p>
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
                    <span>R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de adesao</span>
                    <span className="text-green-600 dark:text-green-400">Gratis</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {billingType === 'PIX' && <QrCode className="w-4 h-4" />}
                    {billingType === 'BOLETO' && <Landmark className="w-4 h-4" />}
                    {billingType === 'CREDIT_CARD' && <CreditCard className="w-4 h-4" />}
                    <span className="text-sm font-medium">Pagamento</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {billingType === 'PIX' && 'Pagamento via PIX - Aprovacao instantanea'}
                    {billingType === 'BOLETO' && 'Boleto Bancário - Aprovação em até 3 dias úteis'}
                    {billingType === 'CREDIT_CARD' && 'Cartao de Credito - Cobranca recorrente'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
