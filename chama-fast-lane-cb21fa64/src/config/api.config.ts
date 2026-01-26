// Configuração da API

// Detecta automaticamente se está em desenvolvimento
const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
  production: {
    baseUrl: 'https://api.chama365guinchos.com.br',
    useMock: false,
  },
  development: {
    // Em desenvolvimento, usa URL relativa para usar o proxy do Vite
    baseUrl: '', // Vazio = usa o mesmo host (localhost:8080) que será redirecionado pelo proxy
    useMock: false,
  },
};

export const getCurrentConfig = () => {
  return isDevelopment ? API_CONFIG.development : API_CONFIG.production;
};

// URL base da API
export const API_BASE_URL = getCurrentConfig().baseUrl;

// Se deve tentar usar mock em caso de falha
export const USE_MOCK_FALLBACK = getCurrentConfig().useMock;

// Configuração de CORS para desenvolvimento
export const CORS_CONFIG = {
  mode: 'cors' as RequestMode,
  credentials: 'omit' as RequestCredentials,
};

// Logs de debug
export const DEBUG_MODE = isDevelopment;
