import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, User, UserType, ApprovalStatus } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, LogOut, Truck, Phone, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const tiposGuincho = [
  { value: 'plataforma', label: 'Plataforma' },
  { value: 'reboque_leve', label: 'Reboque Leve' },
  { value: 'munck', label: 'Munck' },
  { value: 'pesado', label: 'Pesado (caminhões)' },
];

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
}

const formatWhatsApp = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
  return value;
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

export function UserMenu() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, isAdmin } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Cliente form state
  const [clienteForm, setClienteForm] = useState<ClienteProfile & { name: string }>({
    name: '',
    whatsapp: '',
    cidade: '',
    estado: '',
    tipoNecessidade: '',
  });

  // Motorista form state
  const [motoristaForm, setMotoristaForm] = useState<MotoristaProfile & { name: string }>({
    name: '',
    whatsapp: '',
    cidade: '',
    estado: '',
    possuiCaminhao: '',
    tiposGuincho: [],
    disponibilidade: '',
    areaAtuacao: 50,
    observacoes: '',
    status: 'pendente',
  });

  useEffect(() => {
    if (user && user.profile) {
      if (user.type === 'cliente') {
        const profile = user.profile as ClienteProfile;
        setClienteForm({
          name: user.name || '',
          whatsapp: profile?.whatsapp || '',
          cidade: profile?.cidade || '',
          estado: profile?.estado || '',
          tipoNecessidade: profile?.tipoNecessidade || '',
        });
      } else if (user.type === 'motorista') {
        const profile = user.profile as MotoristaProfile;
        setMotoristaForm({
          name: user.name || '',
          whatsapp: profile.whatsapp || '',
          cidade: profile.cidade || '',
          estado: profile.estado || '',
          possuiCaminhao: profile.possuiCaminhao || '',
          tiposGuincho: profile.tiposGuincho || [],
          disponibilidade: profile.disponibilidade || '',
          areaAtuacao: profile.areaAtuacao || 50,
          observacoes: profile.observacoes || '',
          status: profile.status || 'pendente',
        });
      }
    }
  }, [user, isProfileOpen]);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleTipoGuincho = (tipo: string) => {
    setMotoristaForm((prev) => ({
      ...prev,
      tiposGuincho: prev.tiposGuincho.includes(tipo)
        ? prev.tiposGuincho.filter((t) => t !== tipo)
        : [...prev.tiposGuincho, tipo],
    }));
  };

  const handleProfileSave = () => {
    if (user.type === 'cliente') {
      updateProfile({
        name: clienteForm.name,
        profile: {
          whatsapp: clienteForm.whatsapp,
          cidade: clienteForm.cidade,
          estado: clienteForm.estado,
          tipoNecessidade: clienteForm.tipoNecessidade,
        },
      });
    } else {
      updateProfile({
        name: motoristaForm.name,
        profile: {
          whatsapp: motoristaForm.whatsapp,
          cidade: motoristaForm.cidade,
          estado: motoristaForm.estado,
          possuiCaminhao: motoristaForm.possuiCaminhao,
          tiposGuincho: motoristaForm.tiposGuincho,
          disponibilidade: motoristaForm.disponibilidade,
          areaAtuacao: motoristaForm.areaAtuacao,
          observacoes: motoristaForm.observacoes,
          status: motoristaForm.status,
        },
      });
    }
    toast.success('Perfil atualizado com sucesso!');
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 focus:outline-none">
            <Avatar className="h-9 w-9 cursor-pointer border-2 border-primary/50 hover:border-primary transition-colors">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                {user.type === 'motorista' && (
                  <Truck className="w-3 h-3 text-primary" />
                )}
                {user.type === 'admin' && (
                  <Shield className="w-3 h-3 text-primary" />
                )}
              </div>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              {user.type === 'motorista' && (
                <div className="pt-1">
                  {getStatusBadge((user.profile as MotoristaProfile).status)}
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isAdmin && (
            <>
              <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Painel Admin</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {!isAdmin && (
            <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Editar Perfil</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {user.type === 'motorista' ? (
                <>
                  <Truck className="w-5 h-5 text-primary" />
                  Perfil do Motorista
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5 text-primary" />
                  Meu Perfil
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Atualize suas informações de perfil aqui.
            </DialogDescription>
          </DialogHeader>

          {user.type === 'motorista' && (
            <div className="flex justify-center pb-2">
              {getStatusBadge((user.profile as MotoristaProfile).status)}
            </div>
          )}

          <div className="space-y-4 py-4">
            {/* Avatar */}
            <div className="flex justify-center">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {getInitials(user.type === 'cliente' ? clienteForm.name : motoristaForm.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Common fields */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={user.type === 'cliente' ? clienteForm.name : motoristaForm.name}
                onChange={(e) => 
                  user.type === 'cliente'
                    ? setClienteForm({ ...clienteForm, name: e.target.value })
                    : setMotoristaForm({ ...motoristaForm, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={user.email} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                placeholder="(11) 99999-9999"
                value={user.type === 'cliente' ? clienteForm.whatsapp : motoristaForm.whatsapp}
                onChange={(e) => 
                  user.type === 'cliente'
                    ? setClienteForm({ ...clienteForm, whatsapp: formatWhatsApp(e.target.value) })
                    : setMotoristaForm({ ...motoristaForm, whatsapp: formatWhatsApp(e.target.value) })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="Sua cidade"
                  value={user.type === 'cliente' ? clienteForm.cidade : motoristaForm.cidade}
                  onChange={(e) =>
                    user.type === 'cliente'
                      ? setClienteForm({ ...clienteForm, cidade: e.target.value })
                      : setMotoristaForm({ ...motoristaForm, cidade: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={user.type === 'cliente' ? clienteForm.estado : motoristaForm.estado}
                  onValueChange={(value) =>
                    user.type === 'cliente'
                      ? setClienteForm({ ...clienteForm, estado: value })
                      : setMotoristaForm({ ...motoristaForm, estado: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cliente specific fields */}
            {user.type === 'cliente' && (
              <div className="space-y-2">
                <Label>O que você precisa?</Label>
                <Select
                  value={clienteForm.tipoNecessidade}
                  onValueChange={(value) => setClienteForm({ ...clienteForm, tipoNecessidade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preciso_agora">Preciso de guincho agora</SelectItem>
                    <SelectItem value="quero_cotacao">Quero uma cotação</SelectItem>
                    <SelectItem value="quero_conhecer">Quero conhecer os planos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Motorista specific fields */}
            {user.type === 'motorista' && (
              <>
                <div className="space-y-2">
                  <Label>Possui caminhão plataforma?</Label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setMotoristaForm({ ...motoristaForm, possuiCaminhao: 'sim' })}
                      className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                        motoristaForm.possuiCaminhao === 'sim'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => setMotoristaForm({ ...motoristaForm, possuiCaminhao: 'nao' })}
                      className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                        motoristaForm.possuiCaminhao === 'nao'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de guincho</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {tiposGuincho.map((tipo) => (
                      <button
                        key={tipo.value}
                        type="button"
                        onClick={() => toggleTipoGuincho(tipo.value)}
                        className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          motoristaForm.tiposGuincho.includes(tipo.value)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {tipo.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Disponibilidade</Label>
                  <Select
                    value={motoristaForm.disponibilidade}
                    onValueChange={(value) => setMotoristaForm({ ...motoristaForm, disponibilidade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua disponibilidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 horas</SelectItem>
                      <SelectItem value="comercial">Horário comercial (8h às 18h)</SelectItem>
                      <SelectItem value="noturno">Noturno (18h às 6h)</SelectItem>
                      <SelectItem value="fins_semana">Fins de semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Área de atuação</Label>
                    <span className="text-sm font-semibold text-primary">
                      {motoristaForm.areaAtuacao} km
                    </span>
                  </div>
                  <Slider
                    value={[motoristaForm.areaAtuacao]}
                    onValueChange={(value) => setMotoristaForm({ ...motoristaForm, areaAtuacao: value[0] })}
                    min={10}
                    max={300}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10 km</span>
                    <span>300 km</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informações adicionais sobre seu serviço..."
                    value={motoristaForm.observacoes}
                    onChange={(e) => setMotoristaForm({ ...motoristaForm, observacoes: e.target.value })}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleProfileSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
