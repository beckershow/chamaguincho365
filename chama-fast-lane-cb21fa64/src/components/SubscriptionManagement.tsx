import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  CreditCard,
  Calendar,
  Check,
  X,
  TrendingUp,
  Zap,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { subscriptionService, type SubscriptionDetails } from '@/services/subscriptionService';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SubscriptionManagement() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      const data = await subscriptionService.getMySubscription();

      // Se não tem subscription ou status é INACTIVE, trata como sem assinatura
      if (!data.subscription || data.plan_info?.status === 'INACTIVE') {
        setSubscription(null);
      } else {
        setSubscription(data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar assinatura:', error);
      // Não mostra erro se não tiver assinatura
      if (!error.message?.includes('não encontrada')) {
        toast.error('Erro ao carregar informações da assinatura');
      }
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      await subscriptionService.cancelSubscription();
      toast.success('Assinatura cancelada com sucesso');
      loadSubscription();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar assinatura');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      ACTIVE: { label: 'Ativo', variant: 'default' },
      PENDING: { label: 'Pendente', variant: 'secondary' },
      OVERDUE: { label: 'Vencido', variant: 'destructive' },
      CANCELLED: { label: 'Cancelado', variant: 'outline' },
      INACTIVE: { label: 'Inativo', variant: 'outline' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getPlanIcon = (planCode: string) => {
    return planCode === 'BASICO' ? <Package className="w-5 h-5" /> : <Zap className="w-5 h-5" />;
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Escolha seu Plano</CardTitle>
            <CardDescription>
              Assine um dos nossos planos para ter acesso aos serviços de guincho com benefícios exclusivos
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plano Básico */}
          <Card className="relative border-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Plano Básico</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">R$ 49,99</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">1 resgate grátis por mês</p>
                    <p className="text-xs text-muted-foreground">Até 40 km de cobertura</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Km excedente: R$ 4,00/km</p>
                    <p className="text-xs text-muted-foreground">Para carros e motos após 40 km</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Ativação em até 48h</p>
                    <p className="text-xs text-muted-foreground">Após confirmação do pagamento</p>
                  </div>
                </li>
              </ul>
              <Button
                onClick={() => navigate('/planos/checkout/BASICO')}
                className="w-full"
              >
                Assinar Plano Básico
              </Button>
            </CardContent>
          </Card>

          {/* Plano Intermediário */}
          <Card className="relative border-2 border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Mais Popular</Badge>
            </div>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Plano Intermediário</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">R$ 79,99</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">2 resgates grátis por mês</p>
                    <p className="text-xs text-muted-foreground">Até 40 km cada resgate</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Veículo próprio ou de familiar</p>
                    <p className="text-xs text-muted-foreground">Mais flexibilidade</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Km excedente: R$ 4,00/km</p>
                    <p className="text-xs text-muted-foreground">Para carros e motos após 40 km</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Ativação em até 48h</p>
                    <p className="text-xs text-muted-foreground">Após confirmação do pagamento</p>
                  </div>
                </li>
              </ul>
              <Button
                onClick={() => navigate('/planos/checkout/INTERMEDIARIO')}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Assinar Plano Intermediário
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { subscription: sub, plan_info, monthly_stats } = subscription;
  const rescuePercentage = plan_info.rescue_limit > 0
    ? (plan_info.rescue_used / plan_info.rescue_limit) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Card Principal do Plano */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                {getPlanIcon(sub.plan_code)}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Plano {sub.plan_code === 'BASICO' ? 'Básico' : 'Intermediário'}
                  {getStatusBadge(sub.status)}
                </CardTitle>
                <CardDescription>
                  {formatCurrency(sub.value)}/mês
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Próximo Vencimento */}
          {sub.next_due_date && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Próximo vencimento</span>
              </div>
              <span className="text-sm font-bold">
                {formatDate(sub.next_due_date)}
              </span>
            </div>
          )}

          {/* Resgates Disponíveis */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Resgates este mês</span>
              <span className="text-sm font-bold">
                {plan_info.rescue_remaining} de {plan_info.rescue_limit} disponíveis
              </span>
            </div>
            <Progress value={rescuePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Você já utilizou {plan_info.rescue_used} {plan_info.rescue_used === 1 ? 'resgate' : 'resgates'} neste mês
            </p>
          </div>

          <Separator />

          {/* Estatísticas do Mês */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Estatísticas do Mês
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total de Resgates</p>
                <p className="text-lg font-bold">{monthly_stats.total_rescues}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Km Percorridos</p>
                <p className="text-lg font-bold">{monthly_stats.total_km} km</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Resgates Grátis</p>
                <p className="text-lg font-bold">{monthly_stats.free_rescues}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Km Excedente Pago</p>
                <p className="text-lg font-bold">{formatCurrency(monthly_stats.total_exceeded_cost)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3">
            {sub.status === 'ACTIVE' && (
              <>
                {sub.plan_code === 'BASICO' && (
                  <Button
                    onClick={() => navigate('/planos/checkout/INTERMEDIARIO')}
                    variant="outline"
                    className="flex-1"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Fazer Upgrade
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      Cancelar Assinatura
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ao cancelar sua assinatura, você perderá acesso aos resgates gratuitos e benefícios do plano.
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Voltar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isCancelling ? 'Cancelando...' : 'Sim, cancelar'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            {(sub.status === 'OVERDUE' || sub.status === 'CANCELLED' || sub.status === 'INACTIVE') && (
              <Button
                onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    const element = document.getElementById('planos');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Renovar Plano
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Forma de Pagamento</CardTitle>
          <CardDescription>Gerencie suas formas de pagamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {sub.billing_type === 'PIX' ? 'PIX' :
                   sub.billing_type === 'BOLETO' ? 'Boleto' :
                   sub.billing_type === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'Dinheiro'}
                </p>
                <p className="text-xs text-muted-foreground">Forma de pagamento atual</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
