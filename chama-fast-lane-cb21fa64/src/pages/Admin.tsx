import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Truck,
  Search,
  LogOut,
  Shield,
  Phone,
  Mail,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Car,
  FileText,
  User,
  Users,
  MapPin,
  Calendar,
  CreditCard,
  Loader2,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import logoChama from '@/assets/logo-chama365.png';

// ─────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────
const PENDING_ISSUE_MAP: Record<string, { label: string; color: 'red' | 'yellow' | 'blue' }> = {
  ACCOUNT_NOT_APPROVED: { label: 'Conta não aprovada', color: 'red' },
  MISSING_PROFILE_PHOTO: { label: 'Sem foto de perfil', color: 'yellow' },
  MISSING_CNH_NUMBER: { label: 'CNH não informada', color: 'yellow' },
  CNH_EXPIRED: { label: 'CNH vencida', color: 'red' },
  MISSING_CNH_DOCUMENT: { label: 'Doc. CNH ausente', color: 'yellow' },
  CNH_DOC_REJECTED: { label: 'Doc. CNH rejeitado', color: 'red' },
  CNH_DOC_PENDING: { label: 'Doc. CNH pendente', color: 'blue' },
  MISSING_CRLV_DOCUMENT: { label: 'Doc. CRLV ausente', color: 'yellow' },
  CRLV_DOC_REJECTED: { label: 'Doc. CRLV rejeitado', color: 'red' },
  CRLV_DOC_PENDING: { label: 'Doc. CRLV pendente', color: 'blue' },
  MISSING_SELFIE: { label: 'Selfie ausente', color: 'yellow' },
  SELFIE_DOC_REJECTED: { label: 'Selfie rejeitada', color: 'red' },
  SELFIE_DOC_PENDING: { label: 'Selfie pendente', color: 'blue' },
  MISSING_VEHICLE: { label: 'Sem veículo', color: 'yellow' },
};

const DRIVER_STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING:  { label: 'Pendente',  className: 'bg-yellow-500/20 text-yellow-600' },
  APPROVED: { label: 'Aprovado',  className: 'bg-green-500/20 text-green-600'  },
  REJECTED: { label: 'Rejeitado', className: 'bg-red-500/20 text-red-600'      },
  BLOCKED:  { label: 'Bloqueado', className: 'bg-gray-500/20 text-gray-600'    },
};

const USER_STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIVE:  { label: 'Ativo',     className: 'bg-green-500/20 text-green-600' },
  BLOCKED: { label: 'Bloqueado', className: 'bg-red-500/20 text-red-600'     },
};

const PLAN_STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIVE:    { label: 'Ativo',     className: 'bg-green-500/20 text-green-600'   },
  INACTIVE:  { label: 'Inativo',   className: 'bg-gray-500/20 text-gray-600'     },
  OVERDUE:   { label: 'Vencido',   className: 'bg-red-500/20 text-red-600'       },
  CANCELLED: { label: 'Cancelado', className: 'bg-orange-500/20 text-orange-600' },
  TRIAL:     { label: 'Trial',     className: 'bg-blue-500/20 text-blue-600'     },
};

const ISSUE_COLOR_CLASS: Record<string, string> = {
  red:    'bg-red-500/20 text-red-600',
  yellow: 'bg-yellow-500/20 text-yellow-700',
  blue:   'bg-blue-500/20 text-blue-600',
};

const PAGE_SIZE = 10;

// ─────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────
// Dados retornados por GET /api/admin/drivers (lista)
interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  cnh_number: string | null;
  status: string;
  is_blocked: boolean;
  block_reason: string | null;
  rejection_reason: string | null;
  created_at: string;
}

// Dados retornados por GET /api/admin/drivers/:id (detalhe, carregado ao expandir)
interface DriverDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  photo_url: string | null;
  cnh_number: string | null;
  cnh_category: string | null;
  cnh_expiry: string | null;
  is_blocked: boolean;
  block_reason: string | null;
  rejection_reason: string | null;
  birth_date: string | null;
  rg: string | null;
  postal_code: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  documents: Array<{ id: number; document_type: string; status: string; rejection_reason: string | null }>;
  vehicles: Array<{ id: number; plate: string; model: string; type: string; year: number; color: string }>;
  pending_issues: string[];
}

interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  phone_number: string;
  cpf_cnpj: string;
  status: string;
  plan_code: string | null;
  plan_status: string | null;
  plan_valid_until: string | null;
  is_blocked: boolean;
  block_reason?: string | null;
  created_at: string;
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const formatDate = (d: string | null) => {
  if (!d) return '-';
  try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return d; }
};

// ─────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  // Aba ativa
  const [activeTab, setActiveTab] = useState<'motoristas' | 'usuarios'>('motoristas');

  // ── Estado: Motoristas ──────────────────
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [driversError, setDriversError] = useState<string | null>(null);
  const [driverPage, setDriverPage] = useState(1);
  const [driverTotalPages, setDriverTotalPages] = useState(1);
  const [driverTotal, setDriverTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Record<number, DriverDetail | null>>({});
  const [expandingId, setExpandingId] = useState<number | null>(null);

  const [driverFilters, setDriverFilters] = useState({ search: '', status: '' });

  // ── Estado: Usuários ────────────────────
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotal, setUserTotal] = useState(0);

  const [userFilters, setUserFilters] = useState({
    search: '',
    plan_status: '',
    is_blocked: '',
  });

  // ── Dialogs ─────────────────────────────
  const [reasonDialog, setReasonDialog] = useState<{
    open: boolean; driverId: number;
    target: 'driver' | 'cnh' | 'crlv' | 'selfie';
    action: 'REJECTED' | 'BLOCKED'; reason: string;
  }>({ open: false, driverId: 0, target: 'driver', action: 'REJECTED', reason: '' });

  const [imageDialog, setImageDialog] = useState<{ open: boolean; url: string; title: string }>({
    open: false, url: '', title: '',
  });

  const [userBlockDialog, setUserBlockDialog] = useState<{
    open: boolean; userId: string; userName: string; isBlocked: boolean; reason: string;
  }>({ open: false, userId: '', userName: '', isBlocked: false, reason: '' });

  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch motoristas (server-side) ──────
  const fetchDrivers = useCallback(async (page = 1, filters = driverFilters) => {
    setDriversLoading(true);
    setDriversError(null);
    try {
      const response = await apiService.getAdminDrivers({
        page,
        limit: PAGE_SIZE,
        search: filters.search || undefined,
        status: filters.status || undefined,
      });
      if (response?.success) {
        setDrivers(response.data?.drivers || []);
        setDriverTotalPages(response.data?.pagination?.totalPages || 1);
        setDriverTotal(response.data?.pagination?.total || 0);
        setDriverPage(page);
      } else {
        setDriversError(response?.message || 'Erro ao carregar motoristas');
      }
    } catch {
      setDriversError('Não foi possível conectar à API.');
    } finally {
      setDriversLoading(false);
    }
  }, [driverFilters]);

  // ── Fetch detalhe de motorista (ao expandir) ──
  const fetchDriverDetail = useCallback(async (driverId: number) => {
    setExpandingId(driverId);
    try {
      const response = await apiService.getAdminDriverDetails(driverId);
      if (response?.success) {
        const d = response.data?.driver ?? {};
        const documents: DriverDetail['documents'] = response.data?.documents || [];
        const vehicles: DriverDetail['vehicles'] = response.data?.vehicles || [];

        const issues: string[] = [];
        if (d.status !== 'APPROVED') issues.push('ACCOUNT_NOT_APPROVED');
        if (!d.cnh_number) issues.push('MISSING_CNH_NUMBER');
        if (d.cnh_expiry && new Date(d.cnh_expiry) < new Date()) issues.push('CNH_EXPIRED');
        const cnh = documents.find((x) => x.document_type === 'CNH');
        if (!cnh) issues.push('MISSING_CNH_DOCUMENT');
        else if (cnh.status === 'REJECTED') issues.push('CNH_DOC_REJECTED');
        else if (cnh.status !== 'APPROVED') issues.push('CNH_DOC_PENDING');
        const crlv = documents.find((x) => x.document_type === 'CRLV');
        if (!crlv) issues.push('MISSING_CRLV_DOCUMENT');
        else if (crlv.status === 'REJECTED') issues.push('CRLV_DOC_REJECTED');
        else if (crlv.status !== 'APPROVED') issues.push('CRLV_DOC_PENDING');
        const selfie = documents.find((x) => x.document_type === 'SELFIE');
        if (!selfie) issues.push('MISSING_SELFIE');
        else if (selfie.status === 'REJECTED') issues.push('SELFIE_DOC_REJECTED');
        else if (selfie.status !== 'APPROVED') issues.push('SELFIE_DOC_PENDING');
        if (!vehicles.length) issues.push('MISSING_VEHICLE');

        setExpandedDetails((prev) => ({
          ...prev,
          [driverId]: { ...d, documents, vehicles, pending_issues: issues },
        }));
      } else {
        toast.error('Erro ao carregar detalhes do motorista');
        setExpandedDetails((prev) => ({ ...prev, [driverId]: null }));
      }
    } catch {
      toast.error('Erro ao carregar detalhes do motorista');
      setExpandedDetails((prev) => ({ ...prev, [driverId]: null }));
    } finally {
      setExpandingId(null);
    }
  }, []);

  // ── Fetch usuários ──────────────────────
  const fetchUsers = useCallback(async (page = 1, filters = userFilters) => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await apiService.getAdminUsers({
        page,
        limit: PAGE_SIZE,
        search: filters.search || undefined,
        plan_status: filters.plan_status || undefined,
        is_blocked: filters.is_blocked !== '' ? filters.is_blocked : undefined,
      });
      if (response?.success) {
        setUsers(response.data?.users || []);
        setUserTotalPages(response.data?.pagination?.totalPages || 1);
        setUserTotal(response.data?.pagination?.total || 0);
        setUserPage(page);
      } else {
        setUsersError(response?.message || 'Erro ao carregar usuários');
      }
    } catch {
      setUsersError('Não foi possível conectar à API.');
    } finally {
      setUsersLoading(false);
    }
  }, [userFilters]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  useEffect(() => {
    if (activeTab === 'usuarios') fetchUsers(1, userFilters);
  }, [activeTab]);

  // Expandir motorista: carrega detalhe ao abrir
  const handleToggleExpand = useCallback((driverId: number) => {
    if (expandedId === driverId) {
      setExpandedId(null);
    } else {
      setExpandedId(driverId);
      if (expandedDetails[driverId] === undefined) {
        fetchDriverDetail(driverId);
      }
    }
  }, [expandedId, expandedDetails, fetchDriverDetail]);

  // ── Ações motoristas ────────────────────
  const handleDriverStatusAction = async (driverId: number, status: string, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await apiService.updateDriverStatus(driverId, status, reason);
      if (res.success) {
        toast.success(`Status atualizado para ${DRIVER_STATUS_MAP[status]?.label || status}`);
        // Atualiza lista e detalhe
        fetchDrivers(driverPage, driverFilters);
        setExpandedDetails((prev) => ({ ...prev, [driverId]: undefined as any }));
        fetchDriverDetail(driverId);
      } else {
        toast.error(res.message || 'Erro ao atualizar status');
      }
    } catch {
      toast.error('Erro ao atualizar status do motorista');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDocStatusAction = async (driverId: number, type: string, status: string, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await apiService.updateDriverDocumentStatus(driverId, type, status, reason);
      if (res.success) {
        toast.success(`Documento ${type.toUpperCase()} atualizado para ${DRIVER_STATUS_MAP[status]?.label || status}`);
        // Recarrega apenas o detalhe expandido
        setExpandedDetails((prev) => ({ ...prev, [driverId]: undefined as any }));
        fetchDriverDetail(driverId);
      } else {
        toast.error(res.message || 'Erro ao atualizar documento');
      }
    } catch {
      toast.error('Erro ao atualizar status do documento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReasonSubmit = () => {
    if (!reasonDialog.reason.trim()) { toast.error('Informe o motivo'); return; }
    if (reasonDialog.target === 'driver') {
      handleDriverStatusAction(reasonDialog.driverId, reasonDialog.action, reasonDialog.reason);
    } else {
      handleDocStatusAction(reasonDialog.driverId, reasonDialog.target, reasonDialog.action, reasonDialog.reason);
    }
    setReasonDialog((prev) => ({ ...prev, open: false, reason: '' }));
  };

  const handleUserBlockSubmit = async () => {
    const { userId, isBlocked, reason } = userBlockDialog;
    if (isBlocked && !reason.trim()) { toast.error('Informe o motivo do bloqueio'); return; }
    setActionLoading(true);
    try {
      const res = isBlocked
        ? await apiService.adminBlockUser(userId, reason)
        : await apiService.adminUnblockUser(userId);
      if (res.success) {
        toast.success(isBlocked ? 'Usuário bloqueado com sucesso' : 'Usuário desbloqueado com sucesso');
        setUserBlockDialog((prev) => ({ ...prev, open: false, reason: '' }));
        fetchUsers(userPage, userFilters);
      } else {
        toast.error(res.message || 'Erro ao atualizar status do usuário');
      }
    } catch {
      toast.error('Erro ao atualizar status do usuário');
    } finally {
      setActionLoading(false);
    }
  };

  const openDocImage = async (driverId: number, type: string, title: string) => {
    const url = await apiService.fetchDriverDocumentBlob(driverId, type);
    if (url) {
      setImageDialog({ open: true, url, title });
    } else {
      toast.error('Erro ao carregar imagem do documento');
    }
  };

  // ── Guard ────────────────────────────────
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

  const handleLogout = () => { logout(); navigate('/'); toast.success('Logout realizado com sucesso!'); };

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
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
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="section-container py-4 sm:py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'motoristas' ? 'default' : 'outline'}
            onClick={() => setActiveTab('motoristas')}
            className="gap-2"
          >
            <Truck className="w-4 h-4" />
            Motoristas
            {drivers.length > 0 && (
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'motoristas' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                {drivers.length}
              </span>
            )}
          </Button>
          <Button
            variant={activeTab === 'usuarios' ? 'default' : 'outline'}
            onClick={() => setActiveTab('usuarios')}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            Usuários
            {userTotal > 0 && (
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'usuarios' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                {userTotal}
              </span>
            )}
          </Button>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* ABA MOTORISTAS                         */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'motoristas' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-5 border border-border flex items-center gap-3">
                <div className="p-3 bg-yellow-500/10 rounded-lg"><Truck className="w-5 h-5 text-yellow-500" /></div>
                <div>
                  <p className="text-2xl font-bold">{driverTotal}</p>
                  <p className="text-xs text-muted-foreground">Total de motoristas</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-border flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg"><CheckCircle className="w-5 h-5 text-green-500" /></div>
                <div>
                  <p className="text-2xl font-bold">{drivers.filter((d) => d.status === 'APPROVED').length}</p>
                  <p className="text-xs text-muted-foreground">Aprovados nesta página</p>
                </div>
              </div>
            </div>

            {/* Filtros motoristas */}
            <div className="bg-white rounded-xl p-4 border border-border mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome, e-mail ou CPF..."
                    className="pl-10"
                    value={driverFilters.search}
                    onChange={(e) => setDriverFilters((f) => ({ ...f, search: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchDrivers(1, driverFilters); }}
                  />
                </div>
                <Select
                  value={driverFilters.status || 'all'}
                  onValueChange={(v) => {
                    const next = { ...driverFilters, status: v === 'all' ? '' : v };
                    setDriverFilters(next);
                    fetchDrivers(1, next);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="APPROVED">Aprovado</SelectItem>
                    <SelectItem value="REJECTED">Rejeitado</SelectItem>
                    <SelectItem value="BLOCKED">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => fetchDrivers(1, driverFilters)} disabled={driversLoading}>
                    <Search className="w-4 h-4 mr-2" /> Buscar
                  </Button>
                  <Button variant="outline" size="icon"
                    onClick={() => { const f = { search: '', status: '' }; setDriverFilters(f); fetchDrivers(1, f); }}
                    title="Limpar filtros"><X className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => fetchDrivers(driverPage, driverFilters)} disabled={driversLoading}>
                    <RefreshCw className={`w-4 h-4 ${driversLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista motoristas */}
            {driversLoading ? (
              <div className="bg-white rounded-xl border border-border p-12 flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando motoristas...</p>
              </div>
            ) : driversError ? (
              <div className="bg-white rounded-xl border border-border p-12 flex flex-col items-center gap-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <p className="text-red-600">{driversError}</p>
                <Button onClick={() => fetchDrivers(1, driverFilters)}>Tentar novamente</Button>
              </div>
            ) : drivers.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-12 text-center">
                <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {Object.values(driverFilters).some(Boolean) ? 'Nenhum motorista encontrado para os filtros aplicados.' : 'Nenhum motorista cadastrado.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold">Motoristas ({driverTotal})</h2>
                </div>

                <div className="divide-y divide-border">
                  {drivers.map((driver) => {
                    const isExpanded = expandedId === driver.id;
                    const isLoadingDetail = expandingId === driver.id;
                    const detail = expandedDetails[driver.id];
                    const statusInfo = DRIVER_STATUS_MAP[driver.status] || DRIVER_STATUS_MAP.PENDING;

                    return (
                      <div key={driver.id} className="hover:bg-secondary/30 transition-colors">
                        {/* Linha resumo */}
                        <div className="p-4 cursor-pointer" onClick={() => handleToggleExpand(driver.id)}>
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Avatar className="h-12 w-12 flex-shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {getInitials(driver.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium truncate">{driver.name}</p>
                                  <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                                  {driver.is_blocked && <Badge className="bg-gray-500/20 text-gray-600 text-xs">Bloqueado</Badge>}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{driver.email}</span>
                                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{driver.phone}</span>
                                </div>
                              </div>
                            </div>
                            <div className="hidden md:flex text-sm text-muted-foreground items-center gap-1">
                              <CreditCard className="w-4 h-4" />
                              {driver.cnh_number || 'CNH não informada'}
                            </div>
                            <div className="flex-shrink-0">
                              {isLoadingDetail
                                ? <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                : isExpanded
                                  ? <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                  : <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              }
                            </div>
                          </div>
                        </div>

                        {/* Expandido */}
                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-border/50 pt-4">
                            {isLoadingDetail || !detail ? (
                              <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm">Carregando detalhes...</span>
                              </div>
                            ) : (
                              <>
                                {/* Pendências */}
                                {detail.pending_issues.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {detail.pending_issues.map((issue) => {
                                      const info = PENDING_ISSUE_MAP[issue];
                                      return (
                                        <Badge key={issue} className={info ? ISSUE_COLOR_CLASS[info.color] : 'bg-gray-500/20 text-gray-600'}>
                                          {info?.label || issue}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Ações de status */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                  <span className="text-sm font-semibold mr-2 self-center">Status:</span>
                                  <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50"
                                    disabled={actionLoading || detail.status === 'APPROVED'}
                                    onClick={(e) => { e.stopPropagation(); handleDriverStatusAction(driver.id, 'APPROVED'); }}>
                                    <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"
                                    disabled={actionLoading || detail.status === 'REJECTED'}
                                    onClick={(e) => { e.stopPropagation(); setReasonDialog({ open: true, driverId: driver.id, target: 'driver', action: 'REJECTED', reason: '' }); }}>
                                    <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-50"
                                    disabled={actionLoading || detail.is_blocked}
                                    onClick={(e) => { e.stopPropagation(); setReasonDialog({ open: true, driverId: driver.id, target: 'driver', action: 'BLOCKED', reason: '' }); }}>
                                    <Ban className="w-4 h-4 mr-1" /> Bloquear
                                  </Button>
                                </div>

                                {/* Documentos */}
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-1"><FileText className="w-4 h-4" /> Documentos</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {(['CNH', 'CRLV', 'SELFIE'] as const).map((docType) => {
                                      const doc = detail.documents.find((d) => d.document_type === docType);
                                      const docStatus = doc?.status ?? null;
                                      const hasDoc = docStatus !== null;
                                      const label = docType === 'SELFIE' ? 'Selfie' : docType;
                                      const docApiType = docType.toLowerCase(); // para chamadas de API
                                      const docStatusInfo = docStatus
                                        ? (DRIVER_STATUS_MAP[docStatus] ?? { label: docStatus, className: 'bg-gray-500/20 text-gray-600' })
                                        : null;
                                      const isApproved = docStatus === 'APPROVED';
                                      const isRejected = docStatus === 'REJECTED';
                                      return (
                                        <div key={docType} className={`rounded-lg border p-3 flex flex-col gap-2 ${
                                          isApproved ? 'border-green-200 bg-green-50/50'
                                          : isRejected ? 'border-red-200 bg-red-50/50'
                                          : hasDoc ? 'border-yellow-200 bg-yellow-50/50'
                                          : 'border-border bg-secondary/20'
                                        }`}>
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm">{label}</span>
                                            {docStatusInfo
                                              ? <Badge className={`${docStatusInfo.className} text-xs`}>{docStatusInfo.label}</Badge>
                                              : <span className="text-xs text-muted-foreground italic">Não enviado</span>
                                            }
                                          </div>
                                          {docType === 'CNH' && detail.cnh_expiry && (
                                            <p className="text-xs text-muted-foreground">Validade: {formatDate(detail.cnh_expiry)}</p>
                                          )}
                                          {doc?.rejection_reason && isRejected && (
                                            <p className="text-xs text-red-500">Motivo: {doc.rejection_reason}</p>
                                          )}
                                          {hasDoc && (
                                            <div className="flex flex-wrap gap-1 mt-auto pt-1 border-t border-border/40">
                                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs flex-1"
                                                onClick={(e) => { e.stopPropagation(); openDocImage(driver.id, docApiType, `${label} - ${driver.name}`); }}>
                                                <Eye className="w-3 h-3 mr-1" /> Ver
                                              </Button>
                                              {!isApproved && (
                                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-green-600 hover:bg-green-50 flex-1"
                                                  disabled={actionLoading}
                                                  onClick={(e) => { e.stopPropagation(); handleDocStatusAction(driver.id, docApiType, 'APPROVED'); }}>
                                                  <CheckCircle className="w-3 h-3 mr-1" /> Aprovar
                                                </Button>
                                              )}
                                              {!isRejected && (
                                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 flex-1"
                                                  disabled={actionLoading}
                                                  onClick={(e) => { e.stopPropagation(); setReasonDialog({ open: true, driverId: driver.id, target: docApiType as any, action: 'REJECTED', reason: '' }); }}>
                                                  <XCircle className="w-3 h-3 mr-1" /> Rejeitar
                                                </Button>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Veículo + Dados pessoais */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                  <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-1"><Car className="w-4 h-4" /> Veículo</h4>
                                    {detail.vehicles?.length ? (
                                      <div className="space-y-1 text-muted-foreground">
                                        <p>Placa: {detail.vehicles[0].plate}</p>
                                        <p>Modelo: {detail.vehicles[0].model}</p>
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground">Nenhum veículo cadastrado</p>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-1"><User className="w-4 h-4" /> Dados Pessoais</h4>
                                    <div className="space-y-1 text-muted-foreground">
                                      {detail.birth_date && <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Nasc.: {formatDate(detail.birth_date)}</p>}
                                      {detail.rg && <p>RG: {detail.rg}</p>}
                                      {detail.city && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{detail.city}/{detail.state}</p>}
                                      {detail.postal_code && <p>CEP: {detail.postal_code}</p>}
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">Cadastro: {formatDate(detail.created_at)}</p>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Paginação motoristas */}
                {driverTotalPages > 1 && (
                  <div className="p-4 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm text-muted-foreground">
                      <span className="hidden sm:inline">Página {driverPage} de {driverTotalPages} · </span>
                      {driverTotal} registros
                    </p>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" disabled={driverPage === 1}
                        onClick={() => fetchDrivers(driverPage - 1, driverFilters)}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="hidden sm:flex gap-1">
                        {Array.from({ length: Math.min(5, driverTotalPages) }, (_, i) => {
                          const start = Math.max(1, Math.min(driverPage - 2, driverTotalPages - 4));
                          const p = start + i;
                          return (
                            <Button key={p} variant={p === driverPage ? 'default' : 'outline'} size="sm"
                              onClick={() => fetchDrivers(p, driverFilters)}>{p}</Button>
                          );
                        })}
                      </span>
                      <span className="flex sm:hidden items-center px-2 text-sm text-muted-foreground">
                        {driverPage}/{driverTotalPages}
                      </span>
                      <Button variant="outline" size="sm" disabled={driverPage === driverTotalPages}
                        onClick={() => fetchDrivers(driverPage + 1, driverFilters)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════ */}
        {/* ABA USUÁRIOS                           */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'usuarios' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-5 border border-border flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userTotal}</p>
                  <p className="text-xs text-muted-foreground">Total de usuários</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-border flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.filter((u) => !u.is_blocked).length}</p>
                  <p className="text-xs text-muted-foreground">Ativos nesta página</p>
                </div>
              </div>
            </div>

            {/* Filtros usuários */}
            <div className="bg-white rounded-xl p-4 border border-border mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome, e-mail ou CPF..."
                    className="pl-10"
                    value={userFilters.search}
                    onChange={(e) => setUserFilters((f) => ({ ...f, search: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchUsers(1, userFilters); }}
                  />
                </div>
                <Select
                  value={userFilters.plan_status || 'all'}
                  onValueChange={(v) => {
                    const next = { ...userFilters, plan_status: v === 'all' ? '' : v };
                    setUserFilters(next);
                    fetchUsers(1, next);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Plano" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os planos</SelectItem>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                    <SelectItem value="OVERDUE">Vencido</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    <SelectItem value="TRIAL">Trial</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={userFilters.is_blocked !== '' ? userFilters.is_blocked : 'all'}
                  onValueChange={(v) => {
                    const next = { ...userFilters, is_blocked: v === 'all' ? '' : v };
                    setUserFilters(next);
                    fetchUsers(1, next);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="false">Ativos</SelectItem>
                    <SelectItem value="true">Bloqueados</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => fetchUsers(1, userFilters)}>
                    <Search className="w-4 h-4 mr-2" /> Buscar
                  </Button>
                  <Button variant="outline" size="icon"
                    onClick={() => { const f = { search: '', plan_status: '', is_blocked: '' }; setUserFilters(f); fetchUsers(1, f); }}
                    title="Limpar filtros">
                    <X className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => fetchUsers(userPage, userFilters)} disabled={usersLoading}>
                    <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista usuários */}
            {usersLoading ? (
              <div className="bg-white rounded-xl border border-border p-12 flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando usuários...</p>
              </div>
            ) : usersError ? (
              <div className="bg-white rounded-xl border border-border p-12 flex flex-col items-center gap-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <p className="text-red-600">{usersError}</p>
                <Button onClick={() => fetchUsers(1, userFilters)}>Tentar novamente</Button>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold">Usuários ({userTotal})</h2>
                </div>

                {/* Cards mobile */}
                <div className="divide-y divide-border md:hidden">
                  {users.map((u) => {
                    const statusInfo = u.is_blocked ? USER_STATUS_MAP.BLOCKED : USER_STATUS_MAP.ACTIVE;
                    const planInfo = u.plan_status ? PLAN_STATUS_MAP[u.plan_status] : null;
                    return (
                      <div key={u.id} className="p-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {getInitials(u.display_name || u.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{u.display_name || '-'}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                          <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                        </div>
                        {u.is_blocked && u.block_reason && (
                          <p className="text-xs text-red-500 pl-12 flex items-center gap-1">
                            <Ban className="w-3 h-3 shrink-0" /> Motivo: {u.block_reason}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pl-12">
                          <span>{u.phone_number || 'Sem telefone'}</span>
                          <div className="flex items-center gap-2">
                            {u.plan_code && <span className="font-medium text-foreground">{u.plan_code}</span>}
                            {planInfo
                              ? <Badge className={`${planInfo.className} text-xs`}>{planInfo.label}</Badge>
                              : <span>Sem plano</span>
                            }
                          </div>
                        </div>
                        <div className="flex items-center justify-between pl-12">
                          <p className="text-xs text-muted-foreground">Cadastro: {formatDate(u.created_at)}</p>
                          {u.is_blocked ? (
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-green-600 border-green-300 hover:bg-green-50"
                              disabled={actionLoading}
                              onClick={() => setUserBlockDialog({ open: true, userId: u.id, userName: u.display_name || u.email, isBlocked: false, reason: '' })}>
                              <CheckCircle className="w-3 h-3 mr-1" /> Desbloquear
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-600 border-red-300 hover:bg-red-50"
                              disabled={actionLoading}
                              onClick={() => setUserBlockDialog({ open: true, userId: u.id, userName: u.display_name || u.email, isBlocked: true, reason: '' })}>
                              <Ban className="w-3 h-3 mr-1" /> Bloquear
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tabela desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">E-mail</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Telefone</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Plano</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Cadastro</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((u) => {
                        const statusInfo = u.is_blocked ? USER_STATUS_MAP.BLOCKED : USER_STATUS_MAP.ACTIVE;
                        const planInfo = u.plan_status ? PLAN_STATUS_MAP[u.plan_status] : null;
                        return (
                          <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 shrink-0">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                    {getInitials(u.display_name || u.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium truncate max-w-[150px]">{u.display_name || '-'}</span>
                              </div>
                            </td>
                            <td className="p-3 text-muted-foreground truncate max-w-[180px]">{u.email}</td>
                            <td className="p-3 text-muted-foreground">{u.phone_number || '-'}</td>
                            <td className="p-3">
                              <div className="space-y-1">
                                {u.plan_code && <p className="text-xs font-medium">{u.plan_code}</p>}
                                {planInfo
                                  ? <Badge className={`${planInfo.className} text-xs`}>{planInfo.label}</Badge>
                                  : <span className="text-muted-foreground text-xs">Sem plano</span>
                                }
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="space-y-1">
                                <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                                {u.is_blocked && u.block_reason && (
                                  <p className="text-xs text-red-500 max-w-[160px] truncate" title={u.block_reason}>
                                    {u.block_reason}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-muted-foreground text-xs">{formatDate(u.created_at)}</td>
                            <td className="p-3">
                              {u.is_blocked ? (
                                <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50"
                                  disabled={actionLoading}
                                  onClick={() => setUserBlockDialog({ open: true, userId: u.id, userName: u.display_name || u.email, isBlocked: false, reason: '' })}>
                                  <CheckCircle className="w-4 h-4 mr-1" /> Desbloquear
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"
                                  disabled={actionLoading}
                                  onClick={() => setUserBlockDialog({ open: true, userId: u.id, userName: u.display_name || u.email, isBlocked: true, reason: '' })}>
                                  <Ban className="w-4 h-4 mr-1" /> Bloquear
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginação usuários */}
                {userTotalPages > 1 && (
                  <div className="p-4 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm text-muted-foreground">
                      <span className="hidden sm:inline">Página {userPage} de {userTotalPages} · </span>
                      {userTotal} registros
                    </p>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" disabled={userPage === 1}
                        onClick={() => fetchUsers(userPage - 1, userFilters)}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="hidden sm:flex gap-1">
                        {Array.from({ length: Math.min(5, userTotalPages) }, (_, i) => {
                          const start = Math.max(1, Math.min(userPage - 2, userTotalPages - 4));
                          const p = start + i;
                          return (
                            <Button key={p} variant={p === userPage ? 'default' : 'outline'} size="sm"
                              onClick={() => fetchUsers(p, userFilters)}>
                              {p}
                            </Button>
                          );
                        })}
                      </span>
                      <span className="flex sm:hidden items-center px-2 text-sm text-muted-foreground">
                        {userPage}/{userTotalPages}
                      </span>
                      <Button variant="outline" size="sm" disabled={userPage === userTotalPages}
                        onClick={() => fetchUsers(userPage + 1, userFilters)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Dialog motivo */}
      <Dialog open={reasonDialog.open} onOpenChange={(open) => setReasonDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reasonDialog.action === 'BLOCKED' ? 'Bloquear' : 'Rejeitar'}{' '}
              {reasonDialog.target === 'driver' ? 'motorista' : `documento ${reasonDialog.target.toUpperCase()}`}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Informe o motivo..."
            value={reasonDialog.reason}
            onChange={(e) => setReasonDialog((prev) => ({ ...prev, reason: e.target.value }))}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReasonDialog((prev) => ({ ...prev, open: false }))}>Cancelar</Button>
            <Button variant="destructive" disabled={actionLoading} onClick={handleReasonSubmit}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog bloquear/desbloquear usuário */}
      <Dialog open={userBlockDialog.open} onOpenChange={(open) => setUserBlockDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userBlockDialog.isBlocked ? 'Bloquear' : 'Desbloquear'} usuário
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Usuário: <span className="font-medium text-foreground">{userBlockDialog.userName}</span>
          </p>
          {userBlockDialog.isBlocked && (
            <Textarea
              placeholder="Informe o motivo do bloqueio (obrigatório)..."
              value={userBlockDialog.reason}
              onChange={(e) => setUserBlockDialog((prev) => ({ ...prev, reason: e.target.value }))}
              rows={3}
            />
          )}
          {!userBlockDialog.isBlocked && (
            <p className="text-sm text-muted-foreground">Tem certeza que deseja desbloquear este usuário?</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserBlockDialog((prev) => ({ ...prev, open: false }))}>Cancelar</Button>
            <Button
              variant={userBlockDialog.isBlocked ? 'destructive' : 'default'}
              disabled={actionLoading}
              onClick={handleUserBlockSubmit}
            >
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {userBlockDialog.isBlocked ? 'Confirmar Bloqueio' : 'Confirmar Desbloqueio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog imagem */}
      <Dialog open={imageDialog.open} onOpenChange={(open) => {
        if (!open && imageDialog.url) URL.revokeObjectURL(imageDialog.url);
        setImageDialog((prev) => ({ ...prev, open }));
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{imageDialog.title}</DialogTitle></DialogHeader>
          <div className="flex items-center justify-center">
            <img src={imageDialog.url} alt={imageDialog.title} className="max-h-[70vh] object-contain rounded" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
