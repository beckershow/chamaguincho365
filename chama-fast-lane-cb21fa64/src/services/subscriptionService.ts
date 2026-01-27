import { API_BASE_URL } from '@/config/api.config';

// Tipos baseados na documentação da API
export interface Plan {
  code: 'BASICO' | 'INTERMEDIARIO';
  name: string;
  price: number;
  rescue_limit: number;
  free_km_per_rescue: number;
  pricing: {
    CAR_MOTO: {
      per_km: number;
      driver_per_km: number;
      app_per_km: number;
    };
    UTIL_VAN: {
      per_km: number;
      driver_per_km: number;
      app_per_km: number;
    };
  };
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_code: string;
  asaas_subscription_id: string;
  billing_type: 'BOLETO' | 'PIX' | 'CREDIT_CARD' | 'MONEY';
  value: string;
  cycle: 'MONTHLY';
  status: 'ACTIVE' | 'PENDING' | 'OVERDUE' | 'INACTIVE' | 'CANCELLED' | 'COOLDOWN';
  next_due_date: string;
}

export interface PlanInfo {
  code: string;
  status: string;
  rescue_limit: number;
  rescue_used: number;
  rescue_remaining: number;
  next_due_date: string;
}

export interface Vehicle {
  id: number;
  vehicle_plate: string;
  vehicle_type: 'CAR_MOTO' | 'UTIL_VAN';
  vehicle_model?: string;
  vehicle_brand?: string;
  vehicle_year?: number;
  is_owner: boolean;
  owner_name?: string;
  owner_relationship?: string;
}

export interface MonthlyStats {
  total_rescues: number;
  free_rescues: number;
  paid_rescues: number;
  total_km: string;
  total_exceeded_cost: string;
}

export interface SubscriptionDetails {
  subscription: Subscription;
  plan_info: PlanInfo;
  vehicle?: Vehicle;
  monthly_stats: MonthlyStats;
}

export interface CreateSubscriptionData {
  plan_code: 'BASICO' | 'INTERMEDIARIO';
  billing_type?: 'BOLETO' | 'PIX' | 'CREDIT_CARD';
  customer_info?: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
}

export interface VehicleData {
  vehicle_plate: string;
  vehicle_type: 'CAR_MOTO' | 'UTIL_VAN';
  vehicle_model?: string;
  vehicle_brand?: string;
  vehicle_year?: number;
  is_owner?: boolean;
  owner_name?: string;
  owner_relationship?: string;
}

export interface RescuesAvailable {
  available: boolean;
  remaining?: number;
  used?: number;
  limit?: number;
  plan_code?: string;
  can_use_paid: boolean;
  monthly_stats?: MonthlyStats;
  reason?: string;
  plan_status?: string;
}

export interface PricePreview {
  has_active_plan: boolean;
  plan_code?: string;
  plan_status?: string;
  rescues_available?: number;
  rescues_used?: number;
  distance_km: number;
  vehicle_type: 'CAR_MOTO' | 'UTIL_VAN';
  free_km?: number;
  exceeded_km?: number;
  per_km_price?: number;
  exceeded_cost: number;
  is_free_rescue: boolean;
  payment_summary: {
    user_pays: number;
    driver_receives: number;
    app_fee: number;
  };
}

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
    // Status 304 (Not Modified) ou 404 significa que não tem assinatura
    if (response.status === 304 || response.status === 404) {
      throw new Error('Assinatura não encontrada');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: { message: 'Erro na requisição' }
      }));
      throw new Error(error.error?.message || error.message || 'Erro desconhecido');
    }

    const data = await response.json();
    return data.data || data;
  }

  /**
   * Lista todos os planos disponíveis
   */
  async getPlans(): Promise<Plan[]> {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/plans`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Plan[]>(response);
  }

  /**
   * Verifica a assinatura atual do usuário
   */
  async getMySubscription(): Promise<SubscriptionDetails> {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<SubscriptionDetails>(response);
  }

  /**
   * Cria uma nova assinatura
   */
  async createSubscription(data: CreateSubscriptionData): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  /**
   * Cria assinatura com pagamento em dinheiro (apenas testes)
   */
  async createMoneySubscription(plan_code: 'BASICO' | 'INTERMEDIARIO'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/money`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ plan_code }),
    });
    return this.handleResponse(response);
  }

  /**
   * Cancela a assinatura atual
   */
  async cancelSubscription(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/cancel`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  /**
   * Cadastra ou atualiza o veículo do plano
   */
  async saveVehicle(data: VehicleData): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/vehicle`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Vehicle>(response);
  }

  /**
   * Verifica resgates disponíveis no mês
   */
  async getRescuesAvailable(): Promise<RescuesAvailable> {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/rescues/available`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<RescuesAvailable>(response);
  }

  /**
   * Calcula preview de preço de uma corrida
   */
  async getPricePreview(distance_km: number, vehicle_type: 'CAR_MOTO' | 'UTIL_VAN'): Promise<PricePreview> {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/price-preview`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ distance_km, vehicle_type }),
    });
    return this.handleResponse<PricePreview>(response);
  }
}

export const subscriptionService = new SubscriptionService();
