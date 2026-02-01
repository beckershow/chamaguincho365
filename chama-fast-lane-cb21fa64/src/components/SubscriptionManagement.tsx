import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Package,
  Receipt,
  AlertTriangle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  subscriptionService,
  ApiError,
  type LocalSubscription,
  type MySubscriptionResponse,
  type PlanCode,
} from '@/services/subscriptionService';
import { apiService } from '@/services/api';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PLAN_NAMES: Record<string, string> = {
  BASICO: 'Basico',
  PRO: 'Pro',
};

const PLAN_PRICES: Record<string, number> = {
  BASICO: 49.90,
  PRO: 99.90,
};

export function SubscriptionManagement() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<MySubscriptionResponse | null>(null);
  const [realPlanStatus, setRealPlanStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const handleChangePlan = async (targetPlan: PlanCode) => {
    const s = subscription?.local;
    if (!s) return;
    const isUpgrade = targetPlan === 'PRO';
    try {
      setIsChangingPlan(true);
      await subscriptionService.updateSubscription(s.asaas_subscription_id, {
        value: PLAN_PRICES[targetPlan],
        updatePendingPayments: false,
      });
      toast.success(
        isUpgrade
          ? 'Upgrade realizado! O novo valor sera cobrado no proximo ciclo.'
          : 'Downgrade realizado! O novo valor sera cobrado no proximo ciclo.'
      );
      loadSubscription();
    } catch (error: any) {
      if (error instanceof ApiError && error.isAuthError) {
        toast.error(error.message);
        navigate('/login');
        return;
      }
      toast.error(error.message || `Erro ao ${isUpgrade ? 'fazer upgrade' : 'fazer downgrade'}`);
    } finally {
      setIsChangingPlan(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      const [data, planRes] = await Promise.all([
        subscriptionService.getMySubscription(),
        apiService.fetchPlanStatus().catch(() => null),
      ]);
      setSubscription(data);
      const status = planRes?.plan_status ?? null;
      console.log('[SubscriptionManagement] plan-status endpoint:', planRes, '-> effectiveStatus:', status);
      setRealPlanStatus(status);
    } catch (error: any) {
      console.error('Erro ao carregar assinatura:', error);
      if (error instanceof ApiError && error.isAuthError) {
        toast.error(error.message);
        navigate('/login');
        return;
      }
      if (!error.message?.includes('não encontrada')) {
        toast.error(error.message || 'Erro ao carregar informações da assinatura');
      }
      setSubscription({ local: null, remote: null });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    const sub = subscription?.local;
    if (!sub) return;
    try {
      setIsCancelling(true);
      await subscriptionService.cancelSubscription(sub.asaas_subscription_id);
      toast.success('Assinatura cancelada com sucesso');
      loadSubscription();
    } catch (error: any) {
      if (error instanceof ApiError && error.isAuthError) {
        toast.error(error.message);
        navigate('/login');
        return;
      }
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
      EXPIRED: { label: 'Expirado', variant: 'outline' },
      INACTIVE: { label: 'Inativo', variant: 'outline' },
      COOLDOWN: { label: 'Processando', variant: 'secondary' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getPlanIcon = (planCode: string) => {
    return planCode === 'PRO' ? <Zap className="w-5 h-5" /> : <Package className="w-5 h-5" />;
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getBillingLabel = (type: string) => {
    const map: Record<string, string> = {
      PIX: 'PIX',
      CREDIT_CARD: 'Cartao de Credito',
      BOLETO: 'Boleto Bancário',
      BOLETO: 'Boleto',
    };
    return map[type] || type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  const sub = subscription?.local;

  // Sem assinatura: mostrar planos
  if (!sub) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Escolha seu Plano</CardTitle>
            <CardDescription>
              Assine um dos nossos planos para ter acesso aos servicos
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plano Basico */}
          <Card className="relative border-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Plano Basico</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">R$ 49,90</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Acesso a plataforma de guincho</p>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Suporte por chat</p>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Cobertura em todo o Brasil</p>
                </li>
              </ul>
              <Button onClick={() => navigate('/planos/checkout/BASICO')} className="w-full">
                Assinar Plano Basico
              </Button>
            </CardContent>
          </Card>

          {/* Plano Pro */}
          <Card className="relative border-2 border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Mais Popular</Badge>
            </div>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Plano Pro</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">R$ 99,90</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Tudo do Basico</p>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Prioridade no atendimento</p>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Suporte prioritario 24h</p>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Cobertura premium</p>
                </li>
              </ul>
              <Button onClick={() => navigate('/planos/checkout/PRO')} className="w-full bg-primary hover:bg-primary/90">
                Assinar Plano Pro
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Com assinatura: usar plan_status real do endpoint /api/users/plan-status
  const effectiveStatus = realPlanStatus ?? sub.status;
  // Se plano INACTIVE mas assinatura existe e não cancelada → pagamento pendente
  const hasPendingPayment = (effectiveStatus === 'INACTIVE' || effectiveStatus === 'PENDING') &&
    sub.status !== 'CANCELLED' && sub.status !== 'EXPIRED';
  const canCancel = effectiveStatus !== 'CANCELLED' && effectiveStatus !== 'EXPIRED';
  const isActive = effectiveStatus === 'ACTIVE';
  const isPending = hasPendingPayment;
  const isOverdue = effectiveStatus === 'OVERDUE';
  const isCancelled = effectiveStatus === 'CANCELLED';
  const isCooldown = effectiveStatus === 'COOLDOWN';
  const isExpired = (effectiveStatus === 'EXPIRED' || effectiveStatus === 'INACTIVE') && !hasPendingPayment;

  return (
    <div className="space-y-6">
      {/* Status banners */}
      {isPending && (
        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="flex items-center gap-3 py-4">
            <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Aguardando pagamento</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Sua assinatura sera ativada apos a confirmacao do pagamento.
              </p>
            </div>
            {subscription?.remote?.invoiceUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(subscription.remote.invoiceUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Pagar
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {isOverdue && (
        <Card className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-800 dark:text-red-200">Pagamento em atraso</p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Regularize seu pagamento para manter o acesso.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isCooldown && (
        <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="flex items-center gap-3 py-4">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Pagamento recebido</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Acesso sera liberado em breve.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isCancelled && sub.next_due_date && (
        <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-200">Assinatura cancelada</p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Acesso disponivel ate {formatDate(sub.next_due_date)}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
                  Plano {PLAN_NAMES[sub.plan_code] || sub.plan_code}
                  {getStatusBadge(hasPendingPayment ? 'PENDING' : effectiveStatus)}
                </CardTitle>
                <CardDescription>
                  {formatCurrency(sub.value)}/mes
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informacoes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sub.next_due_date && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Proximo vencimento</p>
                  <p className="text-sm font-medium">{formatDate(sub.next_due_date)}</p>
                </div>
              </div>
            )}
            {sub.started_at && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Inicio da assinatura</p>
                  <p className="text-sm font-medium">{formatDate(sub.started_at)}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Forma de pagamento */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{getBillingLabel(sub.billing_type)}</p>
                <p className="text-xs text-muted-foreground">Forma de pagamento atual</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Acoes */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/assinatura/cobrancas')}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Ver Cobrancas
            </Button>

            {isActive && sub.plan_code === 'BASICO' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Upgrade para Pro
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Upgrade para Plano Pro</AlertDialogTitle>
                    <AlertDialogDescription>
                      O valor do plano Pro ({formatCurrency(PLAN_PRICES.PRO)}/mes) sera aplicado a partir do proximo ciclo de cobranca. Ate la, voce continua pagando o valor atual.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleChangePlan('PRO')} disabled={isChangingPlan}>
                      {isChangingPlan ? 'Processando...' : 'Confirmar Upgrade'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {isActive && sub.plan_code === 'PRO' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Package className="w-4 h-4 mr-2" />
                    Downgrade para Basico
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Downgrade para Plano Basico</AlertDialogTitle>
                    <AlertDialogDescription>
                      O valor do plano Basico ({formatCurrency(PLAN_PRICES.BASICO)}/mes) sera aplicado a partir do proximo ciclo de cobranca. Ate la, voce continua com o plano Pro.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleChangePlan('BASICO')} disabled={isChangingPlan}>
                      {isChangingPlan ? 'Processando...' : 'Confirmar Downgrade'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {canCancel && (
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
                      Ao cancelar sua assinatura, voce perdera acesso aos beneficios do plano.
                      {sub.next_due_date && ` O acesso sera mantido ate ${formatDate(sub.next_due_date)}.`}
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
            )}

            {(isExpired || isCancelled) && (
              <Button onClick={() => navigate('/planos/checkout/BASICO')} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Renovar Plano
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
