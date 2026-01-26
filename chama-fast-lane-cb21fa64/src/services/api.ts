import { API_BASE_URL, DEBUG_MODE } from '@/config/api.config';

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

  // Método auxiliar para armazenar tokens
  storeAuthTokens(accessToken?: string, refreshToken?: string, token?: string) {
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    if (token) {
      localStorage.setItem('auth_token', token);
    }
  }

  // Método auxiliar para limpar tokens
  clearAuthTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_token');
  }

  // Método auxiliar para obter token de acesso
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Método auxiliar para obter refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Método para obter dados completos do usuário armazenados
  getUserData(): ApiUser | null {
    const userData = localStorage.getItem('user_data');
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

  // Método para verificar se o plano está ativo
  isPlanActive(): boolean {
    const userData = this.getUserData();
    if (!userData) return false;

    if (userData.plan_status === 'ACTIVE') {
      // Verificar se o plano não está vencido
      if (userData.plan_valid_until) {
        const validUntil = new Date(userData.plan_valid_until);
        const now = new Date();
        return validUntil > now;
      }
      return true;
    }
    return false;
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

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado ou inválido - limpar autenticação
          this.clearAuthTokens();
          localStorage.removeItem('user');
          localStorage.removeItem('user_data');
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição autenticada POST:', error);
      return null;
    }
  }

  // Método genérico para fazer requisições autenticadas PUT
  async authenticatedPut<T>(endpoint: string, data: any): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado ou inválido - limpar autenticação
          this.clearAuthTokens();
          localStorage.removeItem('user');
          localStorage.removeItem('user_data');
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição autenticada PUT:', error);
      return null;
    }
  }

  // Método genérico para fazer requisições autenticadas PATCH
  async authenticatedPatch<T>(endpoint: string, data: any): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado ou inválido - limpar autenticação
          this.clearAuthTokens();
          localStorage.removeItem('user');
          localStorage.removeItem('user_data');
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição autenticada PATCH:', error);
      return null;
    }
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
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        photo_url: result.photo_url,
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
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        photo_url: result.photo_url,
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
