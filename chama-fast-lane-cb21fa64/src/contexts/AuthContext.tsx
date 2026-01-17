import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
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
      tiposGuincho: ['plataforma', 'reboque_leve'],
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
      tiposGuincho: ['plataforma', 'munck'],
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
      tiposGuincho: ['reboque_leve'],
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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Admin login
    if (email === 'admin@chama365.com' && password === 'admin123') {
      setUser(testAdmin);
      localStorage.setItem('user', JSON.stringify(testAdmin));
      return true;
    }

    // Find user in mock data
    const foundUser = allUsers.find(u => u.email === email);
    if (foundUser && password === '123') {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isAdmin,
      login, 
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
