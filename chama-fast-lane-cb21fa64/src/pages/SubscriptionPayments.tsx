import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, Receipt } from 'lucide-react';
import {
  subscriptionService,
  type Payment,
  type MySubscriptionResponse,
} from '@/services/subscriptionService';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  RECEIVED: { label: 'Pago', variant: 'default' },
  CONFIRMED: { label: 'Pago', variant: 'default' },
  PENDING: { label: 'Pendente', variant: 'secondary' },
  OVERDUE: { label: 'Vencido', variant: 'destructive' },
  REFUSED: { label: 'Recusado', variant: 'destructive' },
};

const BILLING_LABELS: Record<string, string> = {
  PIX: 'PIX',
  CREDIT_CARD: 'Cartao de Credito',
  BOLETO: 'Boleto Bancário',
  BOLETO: 'Boleto',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateString: string) {
  try {
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
}

export default function SubscriptionPayments() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadPayments();
  }, [isAuthenticated, navigate]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const sub: MySubscriptionResponse = await subscriptionService.getMySubscription();
      if (!sub.local?.asaas_subscription_id) {
        toast.info('Nenhuma assinatura encontrada.');
        navigate('/perfil?tab=subscription');
        return;
      }
      const result = await subscriptionService.getSubscriptionPayments(sub.local.asaas_subscription_id);
      setPayments(result.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao buscar cobrancas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/perfil?tab=subscription')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Assinatura
          </Button>
          <h1 className="text-3xl font-bold">Historico de Cobrancas</h1>
          <p className="text-muted-foreground mt-2">Acompanhe todas as cobrancas da sua assinatura</p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </CardContent>
          </Card>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhuma cobranca encontrada</p>
              <p className="text-sm text-muted-foreground mt-1">As cobrancas aparecerao aqui apos o primeiro ciclo.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Cobrancas ({payments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((payment) => {
                  const statusInfo = STATUS_MAP[payment.status] || { label: payment.status, variant: 'outline' as const };
                  return (
                    <div
                      key={payment.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(payment.value)}</span>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span>Vencimento: {formatDate(payment.dueDate)}</span>
                          {payment.paymentDate && (
                            <span>Pago em: {formatDate(payment.paymentDate)}</span>
                          )}
                          <span>{BILLING_LABELS[payment.billingType] || payment.billingType}</span>
                        </div>
                      </div>
                      {payment.invoiceUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(payment.invoiceUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Ver fatura
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
