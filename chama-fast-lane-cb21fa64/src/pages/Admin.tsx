import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  MapPin,
  Calendar,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import logoChama from '@/assets/logo-chama365.png';

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

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pendente', className: 'bg-yellow-500/20 text-yellow-600' },
  APPROVED: { label: 'Aprovado', className: 'bg-green-500/20 text-green-600' },
  REJECTED: { label: 'Rejeitado', className: 'bg-red-500/20 text-red-600' },
};

const ISSUE_COLOR_CLASS: Record<string, string> = {
  red: 'bg-red-500/20 text-red-600',
  yellow: 'bg-yellow-500/20 text-yellow-700',
  blue: 'bg-blue-500/20 text-blue-600',
};

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  photo_url: string | null;
  cnh_number: string | null;
  cnh_category: string | null;
  cnh_expiry: string | null;
  created_at: string;
  pending_issues: string[];
  documents: {
    cnh: any | null;
    crlv: any | null;
    selfie: any | null;
  };
  vehicle: { plate: string; model: string } | null;
  details: {
    birth_date: string | null;
    rg: string | null;
    postal_code: string | null;
    city: string | null;
    state: string | null;
  } | null;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getDriversPendingIssues();
      if (response?.success) {
        setDrivers(response.data?.drivers || []);
      } else {
        setError(response?.message || 'Erro ao carregar dados');
      }
    } catch (err) {
      setError('Não foi possível conectar à API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const filteredDrivers = useMemo(() => {
    if (!searchTerm) return drivers;
    const term = searchTerm.toLowerCase();
    return drivers.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        d.email.toLowerCase().includes(term)
    );
  }, [drivers, searchTerm]);

  const totalPendencias = useMemo(
    () => drivers.reduce((sum, d) => sum + d.pending_issues.length, 0),
    [drivers]
  );

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

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logout realizado com sucesso!');
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
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
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Truck className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{drivers.length}</p>
                <p className="text-sm text-muted-foreground">Motoristas com pendências</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalPendencias}</p>
                <p className="text-sm text-muted-foreground">Total de pendências</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Refresh */}
        <div className="bg-white rounded-xl p-4 border border-border mb-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchDrivers} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl border border-border p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando motoristas...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-border p-12 flex flex-col items-center justify-center gap-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchDrivers}>Tentar novamente</Button>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Nenhum motorista encontrado para esta busca.'
                : 'Nenhum motorista com pendências.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">
                Motoristas ({filteredDrivers.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {filteredDrivers.map((driver) => {
                const isExpanded = expandedId === driver.id;
                const statusInfo = STATUS_MAP[driver.status] || STATUS_MAP.PENDING;

                return (
                  <div key={driver.id} className="hover:bg-secondary/30 transition-colors">
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : driver.id)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Avatar + Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src={driver.photo_url || undefined} alt={driver.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {getInitials(driver.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-foreground truncate">{driver.name}</p>
                              <Badge className={statusInfo.className}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {driver.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {driver.phone}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Vehicle */}
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Car className="w-4 h-4" />
                          {driver.vehicle
                            ? `${driver.vehicle.plate} - ${driver.vehicle.model}`
                            : 'Sem veículo'}
                        </div>

                        {/* CNH summary */}
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <CreditCard className="w-4 h-4" />
                          {driver.cnh_number
                            ? `${driver.cnh_number} (${driver.cnh_category || '-'})`
                            : 'CNH não informada'}
                        </div>

                        {/* Expand icon */}
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Pending issues badges */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {driver.pending_issues.map((issue) => {
                          const info = PENDING_ISSUE_MAP[issue];
                          const colorClass = info
                            ? ISSUE_COLOR_CLASS[info.color]
                            : 'bg-gray-500/20 text-gray-600';
                          return (
                            <Badge key={issue} className={colorClass}>
                              {info?.label || issue}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border/50 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                          {/* Documents */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              Documentos
                            </h4>
                            <div className="space-y-1 text-muted-foreground">
                              <p>
                                CNH: {driver.documents.cnh
                                  ? `${driver.documents.cnh.status} (enviado ${formatDate(driver.documents.cnh.uploaded_at)})`
                                  : 'Não enviado'}
                              </p>
                              <p>
                                CRLV: {driver.documents.crlv
                                  ? `${driver.documents.crlv.status} (enviado ${formatDate(driver.documents.crlv.uploaded_at)})`
                                  : 'Não enviado'}
                              </p>
                              <p>
                                Selfie: {driver.documents.selfie
                                  ? `${driver.documents.selfie.status} (enviado ${formatDate(driver.documents.selfie.uploaded_at)})`
                                  : 'Não enviado'}
                              </p>
                              {driver.cnh_expiry && (
                                <p>Validade CNH: {formatDate(driver.cnh_expiry)}</p>
                              )}
                            </div>
                          </div>

                          {/* Vehicle */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1">
                              <Car className="w-4 h-4" />
                              Veículo
                            </h4>
                            {driver.vehicle ? (
                              <div className="space-y-1 text-muted-foreground">
                                <p>Placa: {driver.vehicle.plate}</p>
                                <p>Modelo: {driver.vehicle.model}</p>
                              </div>
                            ) : (
                              <p className="text-muted-foreground">Nenhum veículo cadastrado</p>
                            )}
                          </div>

                          {/* Personal details */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Dados Pessoais
                            </h4>
                            {driver.details ? (
                              <div className="space-y-1 text-muted-foreground">
                                {driver.details.birth_date && (
                                  <p className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Nascimento: {formatDate(driver.details.birth_date)}
                                  </p>
                                )}
                                {driver.details.rg && <p>RG: {driver.details.rg}</p>}
                                {driver.details.city && (
                                  <p className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {driver.details.city}/{driver.details.state}
                                  </p>
                                )}
                                {driver.details.postal_code && (
                                  <p>CEP: {driver.details.postal_code}</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">Sem dados adicionais</p>
                            )}
                            <p className="mt-2 text-xs text-muted-foreground">
                              Cadastro: {formatDate(driver.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
