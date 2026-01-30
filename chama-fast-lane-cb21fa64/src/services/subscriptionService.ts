import { API_BASE_URL } from '@/config/api.config';

// Codes que indicam erro de autenticação
const AUTH_ERROR_CODES = ['AUTH_UNAUTHORIZED', 'AUTH_TOKEN_EXPIRED'];

// ===================== API ERROR =====================

export class ApiError extends Error {
  code: string;
  details: string | null;
  requestId?: string;

  constructor(code: string, message: string, details?: string | null, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details ?? null;
    this.requestId = requestId;
  }

  /** Verifica se é erro de autenticação */
  get isAuthError(): boolean {
    return AUTH_ERROR_CODES.includes(this.code);
  }
}

// ===================== TIPOS =====================

export type PlanCode = 'BASICO' | 'PRO';
export type BillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD';
export type SubscriptionStatus = 'ACTIVE' | 'PENDING' | 'OVERDUE' | 'CANCELLED' | 'EXPIRED' | 'INACTIVE' | 'COOLDOWN';
export type PaymentStatus = 'RECEIVED' | 'PENDING' | 'OVERDUE' | 'REFUSED' | 'CONFIRMED';

export interface CreditCardData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement?: string;
  phone?: string;
  mobilePhone?: string;
}

export interface CreateSubscriptionData {
  planCode: PlanCode;
  billingType: BillingType;
  creditCard?: CreditCardData;
  creditCardHolderInfo?: CreditCardHolderInfo;
  remoteIp?: string;
}

export interface UpdateSubscriptionData {
  billingType?: 'PIX' | 'CREDIT_CARD';
  value?: number;
  nextDueDate?: string;
  cycle?: 'MONTHLY';
  description?: string;
  updatePendingPayments?: boolean;
  creditCard?: CreditCardData;
  creditCardHolderInfo?: CreditCardHolderInfo;
  creditCardToken?: string;
}

export interface LocalSubscription {
  id: number;
  user_id: number;
  plan_code: PlanCode;
  asaas_subscription_id: string;
  billing_type: BillingType;
  value: number;
  cycle: string;
  status: SubscriptionStatus;
  next_due_date: string;
  started_at: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MySubscriptionResponse {
  local: LocalSubscription | null;
  remote: any | null;
}

export interface SubscriptionResponse {
  success: boolean;
  subscription: {
    id: string;
    status: string;
    billingType: string;
    value: number;
    nextDueDate: string;
    invoiceUrl?: string;
    [key: string]: any;
  };
}

export interface Payment {
  id: string;
  status: PaymentStatus;
  billingType: string;
  value: number;
  dueDate: string;
  paymentDate?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
}

export interface PaymentsResponse {
  success: boolean;
  object: string;
  hasMore: boolean;
  totalCount: number;
  data: Payment[];
}

// ===================== MAPA DE ERROS =====================

// Mensagens fallback por code (usadas quando error.details é null)
const FALLBACK_MESSAGES: Record<string, string> = {
  AUTH_UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  AUTH_TOKEN_EXPIRED: 'Sessão expirada. Faça login novamente.',
  SUBSCRIPTION_PLAN_INVALID: 'Plano inválido.',
  BILLING_TYPE_INVALID: 'Método de pagamento inválido.',
  CREDIT_CARD_DATA_REQUIRED: 'Dados do cartão são obrigatórios.',
  USER_NOT_FOUND: 'Usuário não encontrado.',
  SUBSCRIPTION_CREATE_FAILED: 'Erro ao criar assinatura.',
  SUBSCRIPTION_NOT_FOUND: 'Assinatura não encontrada.',
  SUBSCRIPTION_FETCH_FAILED: 'Erro ao buscar assinatura.',
  SUBSCRIPTION_UPDATE_FAILED: 'Erro ao atualizar assinatura.',
  SUBSCRIPTION_CANCEL_FAILED: 'Erro ao cancelar assinatura.',
  SUBSCRIPTION_PAYMENTS_FETCH_FAILED: 'Erro ao buscar cobranças.',
  ONE_TIME_PAYMENT_FAILED: 'Erro ao criar pagamento.',
};

// ===================== SERVICE =====================

class SubscriptionService {
  private getAuthToken(): string | null {
    return localStorage.getItem('access_token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const body = await response.json().catch(() => null);

      // Sem body parseavel
      if (!body) {
        if (response.status === 502) {
          throw new ApiError('GATEWAY_ERROR', 'Sistema de pagamento indisponível. Tente novamente em alguns minutos.');
        }
        throw new ApiError('UNKNOWN', `Erro no servidor (${response.status}). Tente novamente.`);
      }

      const error = body.error || {};
      const code: string = error.code || '';
      const details: string | null = error.details || null;

      // Regra: details existe → exibir details | senão → message ou fallback
      const displayMessage = details || error.message || FALLBACK_MESSAGES[code] || 'Erro inesperado. Tente novamente.';

      throw new ApiError(code, displayMessage, details, error.requestId);
    }

    return response.json();
  }

  /** POST /api/asaas/subscriptions */
  async createSubscription(data: CreateSubscriptionData): Promise<SubscriptionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/asaas/subscriptions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<SubscriptionResponse>(response);
  }

  /** GET /api/asaas/subscriptions/me */
  async getMySubscription(): Promise<MySubscriptionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/asaas/subscriptions/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<MySubscriptionResponse>(response);
  }

  /** GET /api/asaas/subscriptions/:id */
  async getSubscriptionById(id: string): Promise<SubscriptionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/asaas/subscriptions/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<SubscriptionResponse>(response);
  }

  /** PUT /api/asaas/subscriptions/:id */
  async updateSubscription(id: string, data: UpdateSubscriptionData): Promise<SubscriptionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/asaas/subscriptions/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<SubscriptionResponse>(response);
  }

  /** GET /api/asaas/subscriptions/:id/payments */
  async getSubscriptionPayments(id: string): Promise<PaymentsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/asaas/subscriptions/${id}/payments`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<PaymentsResponse>(response);
  }

  /** DELETE /api/asaas/subscriptions/:id */
  async cancelSubscription(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/asaas/subscriptions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ success: boolean }>(response);
  }
}

export const subscriptionService = new SubscriptionService();
