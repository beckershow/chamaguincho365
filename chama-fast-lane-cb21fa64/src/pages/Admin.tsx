import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, User, ApprovalStatus } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Users,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  LogOut,
  Shield,
  Phone,
  MapPin,
  Calendar,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import logoChama from '@/assets/logo-chama365.png';

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

interface ClienteProfile {
  whatsapp: string;
  cidade: string;
  estado: string;
  tipoNecessidade: string;
}

const tiposGuinchoLabels: Record<string, string> = {
  plataforma: 'Plataforma',
  reboque_leve: 'Reboque Leve',
  munck: 'Munck',
  pesado: 'Pesado',
};

const disponibilidadeLabels: Record<string, string> = {
  '24h': '24 horas',
  comercial: 'Horário Comercial',
  noturno: 'Noturno',
  fins_semana: 'Fins de Semana',
};

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, logout, allUsers, updateUserStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'cliente' | 'motorista'>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | ApprovalStatus>('todos');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Stats - calculate before conditional return
  const totalClientes = allUsers.filter(u => u.type === 'cliente').length;
  const totalMotoristas = allUsers.filter(u => u.type === 'motorista').length;
  const pendentes = allUsers.filter(u => u.type === 'motorista' && (u.profile as MotoristaProfile).status === 'pendente').length;
  const aprovados = allUsers.filter(u => u.type === 'motorista' && (u.profile as MotoristaProfile).status === 'aprovado').length;

  // Filtered users - must be called before any conditional returns
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      // Exclude admin
      if (u.type === 'admin') return false;
      
      // Search filter
      const matchesSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter
      const matchesType = filterType === 'todos' || u.type === filterType;
      
      // Status filter (only for motoristas)
      let matchesStatus = true;
      if (filterStatus !== 'todos') {
        if (u.type === 'motorista') {
          matchesStatus = (u.profile as MotoristaProfile).status === filterStatus;
        } else {
          // For clients, only show if filter is 'todos'
          matchesStatus = false;
        }
      }
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [allUsers, searchTerm, filterType, filterStatus]);

  // Redirect if not admin - AFTER all hooks
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Acesso Restrito</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
          <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'aprovado':
        return (
          <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30 gap-1">
            <CheckCircle className="w-3 h-3" />
            Aprovado
          </Badge>
        );
      case 'reprovado':
        return (
          <Badge className="bg-red-500/20 text-red-600 hover:bg-red-500/30 gap-1">
            <XCircle className="w-3 h-3" />
            Reprovado
          </Badge>
        );
      case 'pendente':
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30 gap-1">
            <Clock className="w-3 h-3" />
            Pendente
          </Badge>
        );
    }
  };

  const handleApprove = (userId: string) => {
    updateUserStatus(userId, 'aprovado');
    toast.success('Usuário aprovado com sucesso!');
  };

  const handleReject = () => {
    if (selectedUser && rejectReason.trim()) {
      updateUserStatus(selectedUser.id, 'reprovado', rejectReason);
      toast.success('Usuário reprovado.');
      setIsRejectDialogOpen(false);
      setRejectReason('');
      setSelectedUser(null);
    }
  };

  const openRejectDialog = (user: User) => {
    setSelectedUser(user);
    setIsRejectDialogOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logout realizado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img src={logoChama} alt="Chama365" className="h-10" />
              <div className="hidden sm:block">
                <h1 className="font-bold text-foreground">Painel Administrativo</h1>
                <p className="text-xs text-muted-foreground">Bem-vindo, {user?.name}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="section-container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalClientes}</p>
                <p className="text-sm text-muted-foreground">Clientes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalMotoristas}</p>
                <p className="text-sm text-muted-foreground">Guincheiros</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendentes}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{aprovados}</p>
                <p className="text-sm text-muted-foreground">Aprovados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-border mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="cliente">Clientes</SelectItem>
                  <SelectItem value="motorista">Guincheiros</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="reprovado">Reprovado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">
              Usuários ({filteredUsers.length})
            </h2>
          </div>
          <div className="divide-y divide-border">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum usuário encontrado.
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div key={u.id} className="p-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={u.avatar} alt={u.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground truncate">{u.name}</p>
                          {u.type === 'motorista' ? (
                            <Badge variant="outline" className="text-primary border-primary gap-1">
                              <Truck className="w-3 h-3" />
                              Guincheiro
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-blue-500 border-blue-500 gap-1">
                              <Users className="w-3 h-3" />
                              Cliente
                            </Badge>
                          )}
                          {u.type === 'motorista' && getStatusBadge((u.profile as MotoristaProfile).status)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {u.type === 'cliente' ? (
                        <>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {(u.profile as ClienteProfile).whatsapp}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {(u.profile as ClienteProfile).cidade}/{(u.profile as ClienteProfile).estado}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {(u.profile as MotoristaProfile).whatsapp}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {(u.profile as MotoristaProfile).cidade}/{(u.profile as MotoristaProfile).estado}
                          </span>
                          <span className="flex items-center gap-1">
                            <Truck className="w-4 h-4" />
                            {(u.profile as MotoristaProfile).tiposGuincho
                              .map(t => tiposGuinchoLabels[t] || t)
                              .join(', ')}
                          </span>
                        </>
                      )}
                      {u.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {u.createdAt}
                        </span>
                      )}
                    </div>

                    {/* Actions (only for motoristas) */}
                    {u.type === 'motorista' && (
                      <div className="flex gap-2 lg:flex-shrink-0">
                        {(u.profile as MotoristaProfile).status === 'pendente' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleApprove(u.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openRejectDialog(u)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Recusar
                            </Button>
                          </>
                        )}
                        {(u.profile as MotoristaProfile).status === 'reprovado' && (
                          <div className="text-sm text-red-500">
                            <span className="font-medium">Motivo:</span>{' '}
                            {(u.profile as MotoristaProfile).motivoReprovacao || 'Não informado'}
                          </div>
                        )}
                        {(u.profile as MotoristaProfile).status === 'aprovado' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRejectDialog(u)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Suspender
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar/Suspender Guincheiro</DialogTitle>
            <DialogDescription>
              Informe o motivo da recusa para {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Textarea
                id="motivo"
                placeholder="Descreva o motivo da recusa..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Confirmar Recusa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
