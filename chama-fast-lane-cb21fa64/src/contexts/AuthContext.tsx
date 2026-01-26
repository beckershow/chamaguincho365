import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';

export type UserType = 'cliente' | 'motorista' | 'admin';
export type ApprovalStatus = 'pendente' | 'aprovado' | 'reprovado';

interface ClienteProfile {
  whatsapp: string;
  cidade: string;
  estado: string;
  tipoNecessidade: string;
}

interface MotoristaProfile {
  whatsapp: string;
  cidade: string;
  estado: string;
  possuiCaminhao: string;
  tiposGuincho: string[];
  disponibilidade: string;
  areaAtuacao: number;
  observacoes: string;
  status: ApprovalStatus;
  motivoReprovacao?: string;
}

interface AdminProfile {
  role: 'admin';
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  type: UserType;
  profile: ClienteProfile | MotoristaProfile | AdminProfile;
  cpf_cnpj?: string;
  phone_number?: string;
  createdAt?: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDriver: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  loginAsDriver: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  // Mock data for admin
  allUsers: User[];
  updateUserStatus: (userId: string, status: ApprovalStatus, motivo?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'teste@gmail.com',
    name: 'Usuário Teste',
    avatar: undefined,
    type: 'cliente',
    createdAt: '2025-01-10',
    profile: {
      whatsapp: '(11) 99999-9999',
      cidade: 'São Paulo',
      estado: 'SP',
      tipoNecessidade: 'quero_conhecer',
    } as ClienteProfile,
  },
  {
    id: '2',
    email: 'guincho@gmail.com',
    name: 'João Guincheiro',
    avatar: undefined,
    type: 'motorista',
    createdAt: '2025-01-08',
    profile: {
      whatsapp: '(11) 98888-8888',
      cidade: 'São Paulo',
      estado: 'SP',
      possuiCaminhao: 'sim',
      tiposGuincho: ['Plataforma', 'Reboque'],
      disponibilidade: '24h',
      areaAtuacao: 100,
      observacoes: 'Atendo toda região metropolitana',
      status: 'aprovado',
    } as MotoristaProfile,
  },
  {
    id: '3',
    email: 'maria@gmail.com',
    name: 'Maria Silva',
    avatar: undefined,
    type: 'cliente',
    createdAt: '2025-01-12',
    profile: {
      whatsapp: '(21) 97777-7777',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      tipoNecessidade: 'preciso_agora',
    } as ClienteProfile,
  },
  {
    id: '4',
    email: 'carlos.guincho@gmail.com',
    name: 'Carlos Pereira',
    avatar: undefined,
    type: 'motorista',
    createdAt: '2025-01-11',
    profile: {
      whatsapp: '(11) 96666-6666',
      cidade: 'Campinas',
      estado: 'SP',
      possuiCaminhao: 'sim',
      tiposGuincho: ['Plataforma', 'Pesado'],
      disponibilidade: 'comercial',
      areaAtuacao: 80,
      observacoes: 'Especializado em veículos pesados',
      status: 'pendente',
    } as MotoristaProfile,
  },
  {
    id: '5',
    email: 'pedro.reboque@gmail.com',
    name: 'Pedro Santos',
    avatar: undefined,
    type: 'motorista',
    createdAt: '2025-01-13',
    profile: {
      whatsapp: '(31) 95555-5555',
      cidade: 'Belo Horizonte',
      estado: 'MG',
      possuiCaminhao: 'nao',
      tiposGuincho: ['Reboque'],
      disponibilidade: 'noturno',
      areaAtuacao: 50,
      observacoes: '',
      status: 'pendente',
    } as MotoristaProfile,
  },
  {
    id: '6',
    email: 'ana.cliente@gmail.com',
    name: 'Ana Costa',
    avatar: undefined,
    type: 'cliente',
    createdAt: '2025-01-14',
    profile: {
      whatsapp: '(41) 94444-4444',
      cidade: 'Curitiba',
      estado: 'PR',
      tipoNecessidade: 'quero_cotacao',
    } as ClienteProfile,
  },
];

// Admin user
const testAdmin: User = {
  id: 'admin-1',
  email: 'admin@chama365.com',
  name: 'Administrador',
  avatar: undefined,
  type: 'admin',
  profile: {
    role: 'admin',
  } as AdminProfile,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Validate that the stored user has the new structure with profile
        if (parsedUser && parsedUser.profile && parsedUser.type) {
          setUser(parsedUser);
        } else {
          // Clear invalid/old data
          localStorage.removeItem('user');
        }
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    // Admin login (mock - mantém o acesso admin local)
    if (email === 'admin@chama365.com' && password === 'admin123') {
      setUser(testAdmin);
      localStorage.setItem('user', JSON.stringify(testAdmin));
      return { success: true };
    }

    try {
      // Tenta fazer login via API
      const result = await apiService.loginUser(email, password);

      // Acessar dados dentro de result.data se existir, senão usar diretamente do result
      const responseData = (result as any).data;
      const userData = responseData?.user || result.user;
      const accessToken = responseData?.accessToken || result.accessToken;
      const refreshToken = responseData?.refreshToken || result.refreshToken;
      const token = responseData?.token || result.token;

      if (result.success && userData) {
        // Armazenar todos os tokens
        apiService.storeAuthTokens(accessToken, refreshToken, token);

        // Mapeia os dados da API para o formato do User local
        const loggedUser: User = {
          id: userData.id.toString(),
          email: userData.email,
          name: userData.display_name,
          avatar: userData.photo_url || undefined,
          type: 'cliente', // Tipo padrão, pode ser ajustado conforme a lógica do sistema
          profile: {
            whatsapp: userData.phone_number,
          } as ClienteProfile,
          cpf_cnpj: userData.cpf_cnpj,
          phone_number: userData.phone_number,
          createdAt: userData.created_at,
        };

        setUser(loggedUser);
        localStorage.setItem('user', JSON.stringify(loggedUser));

        // Armazenar dados completos do usuário da API
        const fullUserData = {
          id: userData.id,
          uid: userData.uid,
          provider: userData.provider,
          email: userData.email,
          email_verified: userData.email_verified,
          phone_number: userData.phone_number,
          display_name: userData.display_name,
          photo_url: userData.photo_url,
          cpf_cnpj: userData.cpf_cnpj,
          last_latitude: userData.last_latitude,
          last_longitude: userData.last_longitude,
          location_updated_at: userData.location_updated_at,
          asaas_customer_id: userData.asaas_customer_id,
          plan_status: userData.plan_status,
          plan_valid_until: userData.plan_valid_until,
          plan_overdue_since: userData.plan_overdue_since,
          plan_reactivated_at: userData.plan_reactivated_at,
          created_at: userData.created_at,
        };
        localStorage.setItem('user_data', JSON.stringify(fullUserData));

        return { success: true };
      }

      // Fallback para mock users (para testes locais)
      const foundUser = allUsers.find(u => u.email === email);
      if (foundUser && password === '123') {
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Erro no login:', error);

      // Fallback para mock users em caso de erro na API
      const foundUser = allUsers.find(u => u.email === email);
      if (foundUser && password === '123') {
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        return { success: true };
      }

      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  };

  const loginAsDriver = async (email: string, password: string): Promise<LoginResult> => {
    try {
      // Tenta fazer login via API de drivers
      const result = await apiService.loginDriver(email, password);

      // Acessar dados dentro de result.data
      const responseData = (result as any).data;
      const driver = responseData?.driver;
      const accessToken = responseData?.accessToken;
      const refreshToken = responseData?.refreshToken;
      const token = responseData?.token;

      if (result.success && driver) {
        // Armazenar todos os tokens
        apiService.storeAuthTokens(accessToken, refreshToken, token);

        // Carregar dados completos do guincheiro via /api/drivers/me
        const driverDetailsResponse = await apiService.getDriverDetails();
        // Acessar dados dentro de data.driver se existir
        const driverDetailsData = (driverDetailsResponse as any)?.data?.driver || driverDetailsResponse?.driver || driver;

        // Os dados do veículo agora vêm diretamente no objeto driver
        const vehicleType = driverDetailsData.vehicle_type || '';

        // Mapeia os dados da API para o formato do User local
        const loggedUser: User = {
          id: driverDetailsData.id?.toString() || '',
          email: driverDetailsData.email,
          name: driverDetailsData.name || '',
          avatar: driverDetailsData.photo_url || undefined,
          type: 'motorista',
          profile: {
            whatsapp: driverDetailsData.phone || '',
            cidade: '',
            estado: '',
            possuiCaminhao: driverDetailsData.vehicle_plate ? 'sim' : 'nao',
            tiposGuincho: vehicleType ? [vehicleType] : [],
            disponibilidade: driverDetailsData.is_available ? '24h' : 'indisponivel',
            areaAtuacao: 100,
            observacoes: '',
            status: driverDetailsData.status === 'APPROVED' ? 'aprovado' : 'pendente',
          } as MotoristaProfile,
          cpf_cnpj: driverDetailsData.document_number,
          phone_number: driverDetailsData.phone,
          createdAt: driverDetailsData.created_at,
        };

        setUser(loggedUser);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        localStorage.setItem('user_type', 'driver');

        // Armazenar dados completos do driver (incluindo dados do veículo)
        const fullDriverData = {
          ...driverDetailsData,
          vehicle: {
            plate: driverDetailsData.vehicle_plate,
            model: driverDetailsData.vehicle_model,
            type: driverDetailsData.vehicle_type,
            year: driverDetailsData.vehicle_year,
            color: driverDetailsData.vehicle_color,
          },
          cnh: {
            number: driverDetailsData.cnh_number,
            category: driverDetailsData.cnh_category,
            expiry: driverDetailsData.cnh_expiry,
          },
        };
        localStorage.setItem('driver_data', JSON.stringify(fullDriverData));

        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Erro no login de guincheiro:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_type');
    localStorage.removeItem('driver_data');
    apiService.clearAuthTokens();
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateUserStatus = (userId: string, status: ApprovalStatus, motivo?: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId && u.type === 'motorista') {
        return {
          ...u,
          profile: {
            ...u.profile,
            status,
            motivoReprovacao: status === 'reprovado' ? motivo : undefined,
          },
        };
      }
      return u;
    }));
  };

  const isAdmin = user?.type === 'admin';
  const isDriver = user?.type === 'motorista';

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin,
      isDriver,
      login,
      loginAsDriver,
      logout,
      updateProfile,
      allUsers,
      updateUserStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
