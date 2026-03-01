import { API_BASE_URL, DEBUG_MODE } from '@/config/api.config';

/**
 * Extrai a mensagem de erro mais específica de uma resposta de API.
 * Hierarquia: details.errors[] → details.message → error.message → fallback
 */
export function extractApiError(data: any, fallback = 'Erro inesperado. Tente novamente.'): string {
  if (!data) return fallback;
  const err = data.error ?? data;
  // Erros de campo (ex: VALIDATION_ERROR com details.errors[])
  const fieldErrors: any[] = err?.details?.errors ?? [];
  if (fieldErrors.length > 0) {
    return fieldErrors.map((e: any) => e.message).filter(Boolean).join('; ');
  }
  if (err?.details?.message) return String(err.details.message);
  if (err?.message) return String(err.message);
  if (typeof data?.message === 'string') return data.message;
  return fallback;
}

const log = {
  info: (...args: any[]) => DEBUG_MODE && console.log('ℹ️', ...args),
  success: (...args: any[]) => DEBUG_MODE && console.log('✅', ...args),
  error: (...args: any[]) => console.error('❌', ...args),
  warn: (...args: any[]) => DEBUG_MODE && console.warn('⚠️', ...args),
};

export interface RegisterUserData {
  email: string;
  password: string;
  phone_number: string;
  display_name: string;
  cpf_cnpj: string;
}

export interface RegisterDriverData {
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  cnh_number: string;
  vehicle_plate: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_type: string;
  vehicle_color: string;
}

export interface RegisterDriverResponse {
  success: boolean;
  message?: string;
  driver?: any;
  error?: string;
}

export interface ApiUser {
  id: number;
  uid: string;
  provider: string;
  email: string;
  email_verified: boolean;
  phone_number: string;
  display_name: string;
  photo_url: string | null;
  cpf_cnpj: string;
  last_latitude: number | null;
  last_longitude: number | null;
  location_updated_at: string | null;
  asaas_customer_id: string | null;
  plan_status: string | null;
  plan_valid_until: string | null;
  plan_overdue_since: string | null;
  plan_reactivated_at: string | null;
  created_at: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  user?: ApiUser;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: ApiUser;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async registerDriverMultipart(formData: FormData): Promise<RegisterDriverResponse> {
    try {
      const url = `${this.baseUrl}/api/drivers/register`;
      log.info('Tentando registrar guincheiro (multipart) em:', url);

      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        // Não definir Content-Type: o browser define com o boundary correto
        body: formData,
      });

      const responseText = await response.text();
      log.info('Status da resposta:', response.status);

      if (!response.ok) {
        let errorData: any = {};
        if (response.headers.get('content-type')?.includes('application/json')) {
          try { errorData = JSON.parse(responseText); } catch {}
        }
        throw new Error(
          errorData.error?.message ||
          errorData.message ||
          `Erro ${response.status}: ${response.statusText}`
        );
      }

      let result: any;
      try {
        result = JSON.parse(responseText);
        log.success('Cadastro de guincheiro (multipart) bem-sucedido!', result);
      } catch {
        throw new Error('A API retornou uma resposta inválida.');
      }

      return { success: true, ...result };
    } catch (error) {
      log.error('Erro no registro multipart de guincheiro:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return { success: false, error: 'Não foi possível conectar à API.' };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  async registerDriver(data: RegisterDriverData): Promise<RegisterDriverResponse> {
    try {
      const url = `${this.baseUrl}/api/drivers/register`;
      log.info('Tentando registrar guincheiro em:', url);
      log.info('Dados enviados:', JSON.stringify(data, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      log.info('Status da resposta:', response.status);
      log.info('Content-Type:', response.headers.get('content-type'));

      const responseText = await response.text();
      log.info('Resposta (primeiros 500 chars):', responseText.substring(0, 500));

      if (!response.ok) {
        let errorData: any = {};
        if (response.headers.get('content-type')?.includes('application/json')) {
          try {
            errorData = JSON.parse(responseText);
          } catch (e) {
            log.error('Resposta não é JSON válido');
          }
        }

        log.error('Erro da API:', errorData);
        log.error('Status HTTP:', response.status, response.statusText);

        throw new Error(
          errorData.error?.message ||
          errorData.message ||
          `Erro ${response.status}: ${response.statusText}. A API pode não estar configurada corretamente.`
        );
      }

      let result: any;
      try {
        result = JSON.parse(responseText);
        log.success('Cadastro de guincheiro bem-sucedido!', result);
      } catch (e) {
        log.error('Resposta não é JSON válido:', responseText.substring(0, 200));
        throw new Error('A API retornou uma resposta inválida (não é JSON). Verifique se a rota está correta.');
      }

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      log.error('Erro na requisição de registro de guincheiro:', error);

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          error: 'Não foi possível conectar à API. Verifique se a API está rodando e acessível.',
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao registrar guincheiro',
      };
    }
  }

  async registerUser(data: RegisterUserData): Promise<RegisterResponse> {
    try {
      const url = `${this.baseUrl}/api/users/register`;
      log.info('Tentando registrar usuário em:', url);
      log.info('Dados enviados:', { ...data, password: '***' });

      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      log.info('Status da resposta:', response.status);
      log.info('Content-Type:', response.headers.get('content-type'));

      // Pegar o texto da resposta primeiro
      const responseText = await response.text();
      log.info('Resposta (primeiros 500 chars):', responseText.substring(0, 500));

      if (!response.ok) {
        // Tentar fazer parse do JSON se for JSON
        let errorData: any = {};
        if (response.headers.get('content-type')?.includes('application/json')) {
          try {
            errorData = JSON.parse(responseText);
          } catch (e) {
            log.error('Resposta não é JSON válido');
          }
        }

        log.error('Erro da API:', errorData);
        log.error('Status HTTP:', response.status, response.statusText);

        throw new Error(
          errorData.error?.message ||
          errorData.message ||
          `Erro ${response.status}: ${response.statusText}. A API pode não estar configurada corretamente.`
        );
      }

      // Tentar fazer parse do JSON
      let result: any;
      try {
        result = JSON.parse(responseText);
        log.success('Cadastro bem-sucedido!', result);
      } catch (e) {
        log.error('Resposta não é JSON válido:', responseText.substring(0, 200));
        throw new Error('A API retornou uma resposta inválida (não é JSON). Verifique se a rota está correta.');
      }

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      log.error('Erro na requisição de registro:', error);

      // Detectar erro de CORS ou de rede
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const errorMsg = `Não foi possível conectar à API em ${this.baseUrl}.\n\n` +
          'Possíveis causas:\n' +
          '1. A API não está rodando ou não está acessível\n' +
          '2. CORS não está configurado corretamente no servidor\n' +
          '3. Problema de rede ou firewall\n\n' +
          'Verifique o console para mais detalhes.';

        log.error(errorMsg);
        log.warn('URL tentada:', `${this.baseUrl}/api/users/register`);

        return {
          success: false,
          error: 'Não foi possível conectar à API. Verifique se a API está rodando e acessível.',
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao registrar usuário',
      };
    }
  }

  async loginAdmin(email: string, password: string): Promise<LoginResponse> {
    try {
      const url = `${this.baseUrl}/api/admin/login`;
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseText = await response.text();
      let errorData: any = {};
      if (!response.ok) {
        try { errorData = JSON.parse(responseText); } catch {}
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        if (errorData.error?.message) errorMessage = errorData.error.message;
        else if (typeof errorData.error === 'string') errorMessage = errorData.error;
        else if (errorData.message) errorMessage = errorData.message;
        throw new Error(errorMessage);
      }

      const result = JSON.parse(responseText);
      return { success: true, ...result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao fazer login',
      };
    }
  }

  async loginUser(email: string, password: string): Promise<LoginResponse> {
    try {
      const url = `${this.baseUrl}/api/users/login`;
      log.info('Tentando fazer login em:', url);
      log.info('Email:', email);

      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      log.info('Status da resposta:', response.status);
      log.info('Content-Type:', response.headers.get('content-type'));

      // Pegar o texto da resposta primeiro
      const responseText = await response.text();
      log.info('Resposta (primeiros 500 chars):', responseText.substring(0, 500));

      if (!response.ok) {
        // Tentar fazer parse do JSON se for JSON
        let errorData: any = {};
        if (response.headers.get('content-type')?.includes('application/json')) {
          try {
            errorData = JSON.parse(responseText);
          } catch (e) {
            log.error('Resposta não é JSON válido');
          }
        }

        log.error('Erro da API:', errorData);
        log.error('Status HTTP:', response.status, response.statusText);

        // Extrair mensagem de erro (pode ser string ou objeto)
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        throw new Error(errorMessage);
      }

      // Tentar fazer parse do JSON
      let result: any;
      try {
        result = JSON.parse(responseText);
        log.success('Login bem-sucedido!', result);
      } catch (e) {
        log.error('Resposta não é JSON válido:', responseText.substring(0, 200));
        throw new Error('A API retornou uma resposta inválida (não é JSON). Verifique se a rota está correta.');
      }

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      log.error('Erro na requisição de login:', error);

      // Detectar erro de CORS ou de rede
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const errorMsg = `Não foi possível conectar à API em ${this.baseUrl}.\n\n` +
          'Possíveis causas:\n' +
          '1. A API não está rodando ou não está acessível\n' +
          '2. CORS não está configurado corretamente no servidor\n' +
          '3. Problema de rede ou firewall\n\n' +
          'Verifique o console para mais detalhes.';

        log.error(errorMsg);
        log.warn('URL tentada:', url);

        return {
          success: false,
          error: 'Não foi possível conectar à API. Verifique se a API está rodando e acessível.',
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao fazer login',
      };
    }
  }

  async loginDriver(email: string, password: string): Promise<LoginResponse> {
    try {
      const url = `${this.baseUrl}/api/drivers/login`;
      log.info('Tentando fazer login de guincheiro em:', url);
      log.info('Email:', email);

      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      log.info('Status da resposta:', response.status);
      log.info('Content-Type:', response.headers.get('content-type'));

      const responseText = await response.text();
      log.info('Resposta (primeiros 500 chars):', responseText.substring(0, 500));

      if (!response.ok) {
        let errorData: any = {};
        if (response.headers.get('content-type')?.includes('application/json')) {
          try {
            errorData = JSON.parse(responseText);
          } catch (e) {
            log.error('Resposta não é JSON válido');
          }
        }

        log.error('Erro da API:', errorData);
        log.error('Status HTTP:', response.status, response.statusText);

        // Extrair mensagem de erro (pode ser string ou objeto)
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        throw new Error(errorMessage);
      }

      let result: any;
      try {
        result = JSON.parse(responseText);
        log.success('Login de guincheiro bem-sucedido!', result);
      } catch (e) {
        log.error('Resposta não é JSON válido:', responseText.substring(0, 200));
        throw new Error('A API retornou uma resposta inválida (não é JSON). Verifique se a rota está correta.');
      }

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      log.error('Erro na requisição de login de guincheiro:', error);

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          error: 'Não foi possível conectar à API. Verifique se a API está rodando e acessível.',
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao fazer login',
      };
    }
  }

  private getStorage(): Storage {
    return localStorage.getItem('remember_me') === 'true' ? localStorage : sessionStorage;
  }

  private getFromAnyStorage(key: string): string | null {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  }

  private removeFromAllStorage(key: string) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  // Método auxiliar para armazenar tokens
  storeAuthTokens(accessToken?: string, refreshToken?: string, token?: string) {
    const storage = this.getStorage();
    if (accessToken) {
      storage.setItem('access_token', accessToken);
    }
    if (refreshToken) {
      storage.setItem('refresh_token', refreshToken);
    }
    if (token) {
      storage.setItem('auth_token', token);
    }
  }

  // Método auxiliar para limpar tokens
  clearAuthTokens() {
    this.removeFromAllStorage('access_token');
    this.removeFromAllStorage('refresh_token');
    this.removeFromAllStorage('auth_token');
  }

  // Método auxiliar para obter token de acesso
  getAccessToken(): string | null {
    return this.getFromAnyStorage('access_token');
  }

  // Método auxiliar para obter refresh token
  getRefreshToken(): string | null {
    return this.getFromAnyStorage('refresh_token');
  }

  // Método para obter dados completos do usuário armazenados
  getUserData(): ApiUser | null {
    const userData = this.getFromAnyStorage('user_data');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Método para verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Método para verificar se o plano está ativo (local/fallback)
  isPlanActive(): boolean {
    const userData = this.getUserData();
    if (!userData) return false;

    if (userData.plan_status === 'ACTIVE') {
      if (userData.plan_valid_until) {
        const validUntil = new Date(userData.plan_valid_until);
        const now = new Date();
        return validUntil > now;
      }
      return true;
    }
    return false;
  }

  // Consulta o status do plano em tempo real via API
  async fetchPlanStatus(): Promise<{ plan_status: string; plan_code: string | null; plan_reactivated_at: string | null } | null> {
    try {
      const accessToken = this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/api/users/plan-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      log.info('Plan status response:', data);

      // Suporta { plan_status } ou { data: { plan_status } }
      const plan_status = data.plan_status || data.data?.plan_status || null;
      const plan_code = data.plan_code || data.data?.plan_code || null;
      const plan_reactivated_at = data.plan_reactivated_at || data.data?.plan_reactivated_at || null;

      return { plan_status, plan_code, plan_reactivated_at };
    } catch (error) {
      log.error('Erro ao buscar plan-status:', error);
      return null;
    }
  }

  // Método para verificar se o email foi verificado
  isEmailVerified(): boolean {
    const userData = this.getUserData();
    return userData?.email_verified || false;
  }

  // Método para criar headers autenticados com Bearer token
  private getAuthHeaders(): HeadersInit {
    const accessToken = this.getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  // Método genérico para fazer requisições autenticadas GET
  async authenticatedGet<T>(endpoint: string): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado ou inválido - limpar autenticação
          this.clearAuthTokens();
          localStorage.removeItem('user');
          localStorage.removeItem('user_data');
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição autenticada GET:', error);
      return null;
    }
  }

  // Método genérico para fazer requisições autenticadas POST
  async authenticatedPost<T>(endpoint: string, data: any): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        this.clearAuthTokens();
        localStorage.removeItem('user');
        localStorage.removeItem('user_data');
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      // Retorna o corpo JSON mesmo em respostas de erro (400, 422, etc.)
      // para que o caller possa exibir mensagens detalhadas da API
      return await response.json();
    } catch (error) {
      console.error('Erro na requisição autenticada POST:', error);
      return null;
    }
  }

  // Método genérico para fazer requisições autenticadas PUT
  async authenticatedPut<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      this.clearAuthTokens();
      localStorage.removeItem('user');
      localStorage.removeItem('user_data');
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    const json = await response.json().catch(() => ({}) as any);
    if (!response.ok) {
      throw new Error(extractApiError(json, `Erro na requisição: ${response.status}`));
    }
    return json;
  }

  // Método genérico para fazer requisições autenticadas PATCH
  async authenticatedPatch<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      this.clearAuthTokens();
      localStorage.removeItem('user');
      localStorage.removeItem('user_data');
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    const json = await response.json().catch(() => ({}) as any);
    if (!response.ok) {
      throw new Error(extractApiError(json, `Erro na requisição: ${response.status}`));
    }
    return json;
  }

  // Método genérico para fazer requisições autenticadas DELETE
  async authenticatedDelete<T>(endpoint: string): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado ou inválido - limpar autenticação
          this.clearAuthTokens();
          localStorage.removeItem('user');
          localStorage.removeItem('user_data');
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição autenticada DELETE:', error);
      return null;
    }
  }

  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    try {
      const url = `${this.baseUrl}/api/users/google`;
      log.info('Tentando login com Google em:', url);

      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorData: any = {};
        if (response.headers.get('content-type')?.includes('application/json')) {
          try { errorData = JSON.parse(responseText); } catch {}
        }
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        if (errorData.error?.message) errorMessage = errorData.error.message;
        else if (typeof errorData.error === 'string') errorMessage = errorData.error;
        else if (errorData.message) errorMessage = errorData.message;
        throw new Error(errorMessage);
      }

      let result: any;
      try {
        result = JSON.parse(responseText);
        log.success('Login com Google bem-sucedido!', result);
      } catch {
        throw new Error('Resposta inválida da API.');
      }

      return { success: true, ...result };
    } catch (error) {
      log.error('Erro no login com Google:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return { success: false, error: 'Não foi possível conectar à API.' };
      }
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  async loginDriverWithGoogle(idToken: string): Promise<LoginResponse> {
    try {
      const url = `${this.baseUrl}/api/drivers/login/google`;
      log.info('Tentando login de guincheiro com Google em:', url);

      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorData: any = {};
        if (response.headers.get('content-type')?.includes('application/json')) {
          try { errorData = JSON.parse(responseText); } catch {}
        }
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        if (errorData.error?.message) errorMessage = errorData.error.message;
        else if (typeof errorData.error === 'string') errorMessage = errorData.error;
        else if (errorData.message) errorMessage = errorData.message;
        throw new Error(errorMessage);
      }

      let result: any;
      try {
        result = JSON.parse(responseText);
        log.success('Login de guincheiro com Google bem-sucedido!', result);
      } catch {
        throw new Error('Resposta inválida da API.');
      }

      return { success: true, ...result };
    } catch (error) {
      log.error('Erro no login de guincheiro com Google:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return { success: false, error: 'Não foi possível conectar à API.' };
      }
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  async getDriversPendingIssues(): Promise<any> {
    return this.authenticatedGet<any>('/api/drivers/pending-issues');
  }

  async updateDriverStatus(driverId: number, status: string, rejection_reason?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const accessToken = this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/api/drivers/${driverId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status, rejection_reason }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = data.error?.message || data.message || (typeof data.error === 'string' ? data.error : `Erro ${response.status}`);
        return { success: false, message: msg };
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Erro de conexão' };
    }
  }

  async updateDriverDocumentStatus(driverId: number, type: string, status: string, rejection_reason?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const accessToken = this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/api/drivers/${driverId}/documents/${type}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status, rejection_reason }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = data.error?.message || data.message || (typeof data.error === 'string' ? data.error : `Erro ${response.status}`);
        return { success: false, message: msg };
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Erro de conexão' };
    }
  }

  async fetchDriverDocumentBlob(driverId: number, type: string): Promise<string | null> {
    try {
      const accessToken = this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/api/drivers/${driverId}/documents/${type}/file`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (!response.ok) return null;
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }

  async getAdminDrivers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    is_blocked?: string;
  } = {}): Promise<any> {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.search) qs.set('search', params.search);
    if (params.status) qs.set('status', params.status);
    if (params.is_blocked !== undefined && params.is_blocked !== '') qs.set('is_blocked', params.is_blocked);
    return this.authenticatedGet<any>(`/api/admin/drivers?${qs.toString()}`);
  }

  async getAdminDriverDetails(driverId: number): Promise<any> {
    return this.authenticatedGet<any>(`/api/admin/drivers/${driverId}`);
  }

  async adminBlockUser(userId: string, reason: string): Promise<{ success: boolean; message?: string }> {
    try {
      const accessToken = this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/api/admin/users/${userId}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = data.error?.message || data.message || (typeof data.error === 'string' ? data.error : `Erro ${response.status}`);
        return { success: false, message: msg };
      }
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Erro de conexão' };
    }
  }

  async adminUnblockUser(userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const accessToken = this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/api/admin/users/${userId}/unblock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = data.error?.message || data.message || (typeof data.error === 'string' ? data.error : `Erro ${response.status}`);
        return { success: false, message: msg };
      }
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Erro de conexão' };
    }
  }

  async getAdminUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    plan_status?: string;
    is_blocked?: string;
  } = {}): Promise<any> {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.search) qs.set('search', params.search);
    if (params.plan_status) qs.set('plan_status', params.plan_status);
    if (params.is_blocked !== undefined && params.is_blocked !== '') qs.set('is_blocked', params.is_blocked);
    return this.authenticatedGet<any>(`/api/admin/users?${qs.toString()}`);
  }

  // Exemplo de uso: Obter perfil do usuário autenticado
  async getProfile(): Promise<ApiUser | null> {
    return this.authenticatedGet<ApiUser>('/api/users/profile');
  }

  // Exemplo de uso: Atualizar perfil do usuário
  async updateProfile(data: Partial<ApiUser>): Promise<ApiUser | null> {
    return this.authenticatedPut<ApiUser>('/api/users/profile', data);
  }

  // Obter dados completos do usuário (UserDetails)
  async getUserDetails(): Promise<any | null> {
    return this.authenticatedGet<any>('/api/users/me');
  }

  // Atualizar dados completos do usuário (UserDetails)
  async updateUserDetails(data: any): Promise<any | null> {
    return this.authenticatedPatch<any>('/api/users/me', data);
  }

  // Obter dados completos do guincheiro (DriverDetails)
  async getDriverDetails(): Promise<any | null> {
    return this.authenticatedGet<any>('/api/drivers/me');
  }

  // Atualizar dados completos do guincheiro (DriverDetails)
  async updateDriverDetails(data: any): Promise<any | null> {
    return this.authenticatedPatch<any>('/api/drivers/me', data);
  }

  // Alterar senha do usuário
  async changeUserPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: any }> {
    return this.authenticatedPost<any>('/api/users/change-password', { currentPassword, newPassword });
  }

  // Alterar senha do guincheiro
  async changeDriverPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: any }> {
    return this.authenticatedPost<any>('/api/drivers/change-password', { currentPassword, newPassword });
  }

  // Gera URL autenticada para imagens privadas em /uploads (adiciona ?token=...)
  // Converte URLs absolutas para relativas para passar pelo proxy do Vite (evita CORS)
  getAuthImageUrl(url: string | undefined | null): string | undefined {
    if (!url) return undefined;
    // URLs externas (Google, etc.) não contêm /uploads/ — não precisam de token
    if (!url.includes('/uploads/')) return url;
    const token = this.getAccessToken();
    if (!token) return url;
    // Extrai apenas o pathname para request same-origin via proxy Vite
    let imgPath = url;
    try {
      const parsed = new URL(url);
      imgPath = parsed.pathname;
    } catch { /* já é relativa */ }
    const separator = imgPath.includes('?') ? '&' : '?';
    return `${imgPath}${separator}token=${encodeURIComponent(token)}`;
  }

  // Consulta endereço pelo CEP via backend (proxy ViaCEP)
  async getCep(cep: string): Promise<{ street: string | null; neighborhood: string | null; city: string | null; state: string | null; complement: string | null } | null> {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return null;
    try {
      const res = await fetch(`${this.baseUrl}/api/utils/cep/${digits}`);
      const json = await res.json();
      if (json?.success && json?.data) return json.data;
      return null;
    } catch {
      return null;
    }
  }

  // Upload de foto de perfil do guincheiro
  async uploadDriverPhoto(file: File): Promise<{ success: boolean; photo_url?: string; error?: string }> {
    try {
      const accessToken = this.getAccessToken();
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${this.baseUrl}/api/drivers/me/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuthTokens();
          localStorage.removeItem('user');
          localStorage.removeItem('user_data');
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        photo_url: result.data?.driver?.photo_url || result.photo_url,
      };
    } catch (error) {
      log.error('Erro no upload de foto do guincheiro:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar foto',
      };
    }
  }

  // Upload de CNH do guincheiro
  async uploadDriverCNH(file: File): Promise<{ success: boolean; document?: any; error?: string }> {
    try {
      const accessToken = this.getAccessToken();
      const formData = new FormData();
      formData.append('cnh_photo', file);

      const response = await fetch(`${this.baseUrl}/api/drivers/me/documents/cnh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuthTokens();
          localStorage.removeItem('user');
          localStorage.removeItem('user_data');
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        document: result.document,
      };
    } catch (error) {
      log.error('Erro no upload de CNH:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar CNH',
      };
    }
  }

  // Upload de CRLV do guincheiro
  async uploadDriverCRLV(file: File): Promise<{ success: boolean; document?: any; error?: string }> {
    try {
      const accessToken = this.getAccessToken();
      const formData = new FormData();
      formData.append('crlv_photo', file);

      const response = await fetch(`${this.baseUrl}/api/drivers/me/documents/crlv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuthTokens();
          localStorage.removeItem('user');
          localStorage.removeItem('user_data');
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        document: result.document,
      };
    } catch (error) {
      log.error('Erro no upload de CRLV:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar CRLV',
      };
    }
  }

  // Upload de Selfie do guincheiro
  async uploadDriverSelfie(file: File): Promise<{ success: boolean; document?: any; error?: string }> {
    try {
      const accessToken = this.getAccessToken();
      const formData = new FormData();
      formData.append('selfie', file);

      const response = await fetch(`${this.baseUrl}/api/drivers/me/documents/selfie`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuthTokens();
          localStorage.removeItem('user');
          localStorage.removeItem('user_data');
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        document: result.document,
      };
    } catch (error) {
      log.error('Erro no upload de Selfie:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar Selfie',
      };
    }
  }

  // Retorna o pagamento PIX PENDING mais recente do usuário (para exibir QR Code)
  async getPendingPixPayment(): Promise<{ success: boolean; payment: { asaas_payment_id: string; value: number; due_date: string; created_at: string } | null } | null> {
    return this.authenticatedGet('/api/asaas/subscriptions/me/pending-pix');
  }

  // Retorna o QR Code PIX de um pagamento específico
  async getPixQrCode(paymentId: string): Promise<{ success: boolean; paymentId: string; encodedImage: string; payload: string; expirationDate: string } | null> {
    return this.authenticatedGet(`/api/asaas/payments/${paymentId}/qrcode`);
  }

  // Upload de foto de perfil
  async uploadProfilePhoto(file: File): Promise<{ success: boolean; photo_url?: string; error?: string }> {
    try {
      const accessToken = this.getAccessToken();
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${this.baseUrl}/api/users/me/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuthTokens();
          localStorage.removeItem('user');
          localStorage.removeItem('user_data');
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        photo_url: result.data?.user?.photo_url || result.photo_url,
      };
    } catch (error) {
      log.error('Erro no upload de foto:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar foto',
      };
    }
  }
}

export const apiService = new ApiService(API_BASE_URL);
