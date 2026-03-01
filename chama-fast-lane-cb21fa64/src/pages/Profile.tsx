import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, CreditCard, Lock, LogOut, ArrowLeft, Truck, MapPin, FileText, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SubscriptionManagement } from '@/components/SubscriptionManagement';
import { apiService } from '@/services/api';

interface DriverFormData {
  // Dados Básicos
  name: string;
  email: string;
  phone: string;
  document_type: string;
  document_number: string;

  // CNH
  cnh_number: string;
  cnh_category: string;
  cnh_expiry: string;

  // Veículo
  vehicle_plate: string;
  vehicle_model: string;
  vehicle_type: string;
  vehicle_year: string;
  vehicle_color: string;

  // Endereço (details)
  birth_date: string;
  postal_code: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
  reference: string;
  rg: string;
  issuing_agency: string;
  issuing_state: string;

  // Dados bancários
  bank_account_name: string;
  bank_code: string;
  bank_agency: string;
  bank_account_number: string;
  bank_account_digit: string;
  bank_account_type: string;
  pix_key_type: string;
  pix_key: string;
  income_value: string;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
}

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

// Converte +5511999999999 ou 11999999999 → (11) 99999-9999
function parsePhoneDisplay(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  // Remove prefixo 55 se vier no formato +55...
  const local = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;
  return formatPhone(local);
}

export default function Profile() {
  const { user, isAuthenticated, isDriver, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [planStatus, setPlanStatus] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  // Estado para dados do formulário
  const [clientFormData, setClientFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
  });

  const [driverFormData, setDriverFormData] = useState<DriverFormData>({
    name: '',
    email: '',
    phone: '',
    document_type: '',
    document_number: '',
    cnh_number: '',
    cnh_category: '',
    cnh_expiry: '',
    vehicle_plate: '',
    vehicle_model: '',
    vehicle_type: '',
    vehicle_year: '',
    vehicle_color: '',
    birth_date: '',
    postal_code: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: '',
    reference: '',
    rg: '',
    issuing_agency: '',
    issuing_state: '',
    bank_account_name: '',
    bank_code: '',
    bank_agency: '',
    bank_account_number: '',
    bank_account_digit: '',
    bank_account_type: '',
    pix_key_type: '',
    pix_key: '',
    income_value: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Carregar dados atualizados do usuário da API
    const loadUserData = async () => {
      try {
        if (isDriver) {
          // Para motoristas, buscar dados completos do driver
          const driverData = await apiService.getDriverDetails();
          const driver = driverData?.data?.driver || driverData?.driver;

          console.log('[Profile] Driver data loaded:', driver);

          if (driver) {
            const details = driver.details || {};

            // Atualizar formData com dados do motorista
            setDriverFormData({
              name: driver.name || '',
              email: driver.email || '',
              phone: parsePhoneDisplay(driver.phone || ''),
              document_type: driver.document_type || '',
              document_number: driver.document_number || '',
              cnh_number: driver.cnh_number || '',
              cnh_category: driver.cnh_category || '',
              cnh_expiry: driver.cnh_expiry || '',
              vehicle_plate: driver.vehicle_plate || '',
              vehicle_model: driver.vehicle_model || '',
              vehicle_type: driver.vehicle_type || '',
              vehicle_year: driver.vehicle_year?.toString() || '',
              vehicle_color: driver.vehicle_color || '',
              birth_date: details.birth_date || '',
              postal_code: details.postal_code || '',
              street: details.street || '',
              number: details.number || '',
              neighborhood: details.neighborhood || '',
              city: details.city || '',
              state: details.state || '',
              complement: details.complement || '',
              reference: details.reference || '',
              rg: details.rg || '',
              issuing_agency: details.issuing_agency || '',
              issuing_state: details.issuing_state || '',
              bank_account_name: details.bank_account_name || '',
              bank_code: details.bank_code || '',
              bank_agency: details.bank_agency || '',
              bank_account_number: details.bank_account_number || '',
              bank_account_digit: details.bank_account_digit || '',
              bank_account_type: details.bank_account_type || '',
              pix_key_type: details.pix_key_type || '',
              pix_key: details.pix_key || '',
              income_value: details.income_value?.toString() || '',
            });
          }
        } else {
          // Para clientes, buscar dados do usuário
          const userData = await apiService.getUserDetails();
          const userInfo = userData?.data?.user || userData?.user || userData;

          console.log('[Profile] User data loaded:', userInfo);

          if (userInfo) {
            // Atualizar formData com dados do usuário
            setClientFormData({
              name: userInfo.display_name || userInfo.name || '',
              email: userInfo.email || '',
              phone: parsePhoneDisplay(userInfo.phone_number || ''),
            });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        toast.error('Erro ao carregar dados do perfil');
      }
    };

    loadUserData();

    // Carregar status do plano (apenas para clientes)
    if (!isDriver) {
      apiService.fetchPlanStatus().then((res) => {
        setPlanStatus(res?.plan_status || null);
      }).catch(() => {});
    }
  }, [isAuthenticated, isDriver, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Você saiu da sua conta');
    navigate('/');
  };

  const lookupCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const data = await apiService.getCep(digits);
      if (data) {
        setDriverFormData((prev) => ({
          ...prev,
          street: data.street || prev.street,
          neighborhood: data.neighborhood || prev.neighborhood,
          city: data.city || prev.city,
          state: data.state || prev.state,
          complement: data.complement || prev.complement,
        }));
      } else {
        toast.error('CEP não encontrado');
      }
    } catch {
      toast.error('Erro ao buscar CEP');
    } finally {
      setCepLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isDriver) {
        const driverPhoneDigits = driverFormData.phone.replace(/\D/g, '');
        // Atualizar perfil do motorista via PATCH /api/drivers/me
        await apiService.updateDriverDetails({
          name: driverFormData.name,
          phone: driverPhoneDigits ? `+55${driverPhoneDigits}` : '',
          document_number: driverFormData.document_number,
          cnh_number: driverFormData.cnh_number,
          cnh_category: driverFormData.cnh_category,
          cnh_expiry: driverFormData.cnh_expiry,
          vehicle_plate: driverFormData.vehicle_plate,
          vehicle_model: driverFormData.vehicle_model,
          vehicle_type: driverFormData.vehicle_type,
          vehicle_year: driverFormData.vehicle_year ? parseInt(driverFormData.vehicle_year) : undefined,
          vehicle_color: driverFormData.vehicle_color,
          details: {
            birth_date: driverFormData.birth_date,
            postal_code: driverFormData.postal_code,
            street: driverFormData.street,
            number: driverFormData.number,
            neighborhood: driverFormData.neighborhood,
            city: driverFormData.city,
            state: driverFormData.state,
            complement: driverFormData.complement,
            reference: driverFormData.reference,
            rg: driverFormData.rg,
            issuing_agency: driverFormData.issuing_agency,
            issuing_state: driverFormData.issuing_state,
            bank_account_name: driverFormData.bank_account_name,
            bank_code: driverFormData.bank_code,
            bank_agency: driverFormData.bank_agency,
            bank_account_number: driverFormData.bank_account_number,
            bank_account_digit: driverFormData.bank_account_digit,
            bank_account_type: driverFormData.bank_account_type,
            pix_key_type: driverFormData.pix_key_type,
            pix_key: driverFormData.pix_key,
            income_value: driverFormData.income_value,
          },
        });
      } else {
        const clientPhoneDigits = clientFormData.phone.replace(/\D/g, '');
        // Atualizar perfil do cliente via PATCH /api/users/me
        await apiService.updateUserDetails({
          ...(clientFormData.name?.trim() && { display_name: clientFormData.name.trim() }),
          ...(clientPhoneDigits ? { phone_number: `+55${clientPhoneDigits}` } : {}),
        });
      }

      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error?.message || 'Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const validateNewPassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Mínimo de 8 caracteres';
    if (!/[A-Z]/.test(pwd)) return 'Inclua pelo menos 1 letra maiúscula';
    if (!/[a-z]/.test(pwd)) return 'Inclua pelo menos 1 letra minúscula';
    if (!/\d/.test(pwd)) return 'Inclua pelo menos 1 número';
    return null;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.current) {
      toast.error('Informe a senha atual');
      return;
    }

    const pwdError = validateNewPassword(passwordForm.next);
    if (pwdError) {
      toast.error(pwdError);
      return;
    }

    if (passwordForm.next !== passwordForm.confirm) {
      toast.error('A confirmação de senha não coincide com a nova senha');
      return;
    }
    if (passwordForm.current === passwordForm.next) {
      toast.error('A nova senha deve ser diferente da senha atual');
      return;
    }

    setIsChangingPassword(true);
    try {
      const fn = isDriver
        ? apiService.changeDriverPassword.bind(apiService)
        : apiService.changeUserPassword.bind(apiService);

      const result = await fn(passwordForm.current, passwordForm.next) as any;

      if (result?.success) {
        toast.success('Senha alterada com sucesso!');
        setPasswordForm({ current: '', next: '', confirm: '' });
        return;
      }

      // Extrai mensagens detalhadas do Zod se existirem
      const errors: { field: string; message: string }[] = result?.error?.errors || [];
      if (errors.length > 0) {
        errors.forEach((err) => toast.error(err.message));
      } else {
        const code = result?.error?.code;
        const msg =
          code === 'PASSWORD_INCORRECT' ? 'Senha atual incorreta' :
          result?.error?.message || 'Erro ao alterar senha';
        toast.error(msg);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro inesperado ao alterar senha');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={apiService.getAuthImageUrl(user.avatar)} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {user.type === 'cliente' ? 'Cliente' : user.type === 'motorista' ? 'Guincheiro' : 'Admin'}
                </span>
                {planStatus === 'ACTIVE' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400">
                    Plano Ativo
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          <Separator className="mb-8" />

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className={`grid w-full ${isDriver ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'} h-auto`}>
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Dados Pessoais</span>
              </TabsTrigger>
              {!isDriver && (
                <TabsTrigger value="subscription" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline">Assinatura</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="security" className="gap-2">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Segurança</span>
              </TabsTrigger>
            </TabsList>

            {/* Dados Pessoais */}
            <TabsContent value="profile">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Dados Básicos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informações Básicas
                    </CardTitle>
                    <CardDescription>
                      Dados principais do seu perfil
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                          id="name"
                          value={isDriver ? driverFormData.name : clientFormData.name}
                          onChange={(e) => isDriver
                            ? setDriverFormData({ ...driverFormData, name: e.target.value })
                            : setClientFormData({ ...clientFormData, name: e.target.value })
                          }
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={isDriver ? driverFormData.email : clientFormData.email}
                          onChange={(e) => isDriver
                            ? setDriverFormData({ ...driverFormData, email: e.target.value })
                            : setClientFormData({ ...clientFormData, email: e.target.value })
                          }
                          placeholder="seu@email.com"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={isDriver ? driverFormData.phone : clientFormData.phone}
                          onChange={(e) => {
                            const masked = formatPhone(e.target.value);
                            isDriver
                              ? setDriverFormData({ ...driverFormData, phone: masked })
                              : setClientFormData({ ...clientFormData, phone: masked });
                          }}
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                        />
                      </div>
                      {isDriver && (
                        <div className="space-y-2">
                          <Label htmlFor="document_number">CPF</Label>
                          <Input
                            id="document_number"
                            value={driverFormData.document_number}
                            onChange={(e) => setDriverFormData({ ...driverFormData, document_number: e.target.value })}
                            placeholder="000.000.000-00"
                          />
                        </div>
                      )}
                    </div>
                    {isDriver && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="birth_date">Data de Nascimento</Label>
                          <Input
                            id="birth_date"
                            type="date"
                            value={driverFormData.birth_date}
                            onChange={(e) => setDriverFormData({ ...driverFormData, birth_date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rg">RG</Label>
                          <Input
                            id="rg"
                            value={driverFormData.rg}
                            onChange={(e) => setDriverFormData({ ...driverFormData, rg: e.target.value })}
                            placeholder="00.000.000-0"
                          />
                        </div>
                      </div>
                    )}
                    {isDriver && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="issuing_agency">Órgão Emissor</Label>
                          <Input
                            id="issuing_agency"
                            value={driverFormData.issuing_agency}
                            onChange={(e) => setDriverFormData({ ...driverFormData, issuing_agency: e.target.value })}
                            placeholder="SSP"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="issuing_state">UF Emissor</Label>
                          <Input
                            id="issuing_state"
                            value={driverFormData.issuing_state}
                            onChange={(e) => setDriverFormData({ ...driverFormData, issuing_state: e.target.value })}
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* CNH - Apenas para motoristas */}
                {isDriver && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        CNH - Carteira de Habilitação
                      </CardTitle>
                      <CardDescription>
                        Dados da sua carteira de motorista
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cnh_number">Número da CNH</Label>
                          <Input
                            id="cnh_number"
                            value={driverFormData.cnh_number}
                            onChange={(e) => setDriverFormData({ ...driverFormData, cnh_number: e.target.value })}
                            placeholder="00000000000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cnh_category">Categoria</Label>
                          <Input
                            id="cnh_category"
                            value={driverFormData.cnh_category}
                            onChange={(e) => setDriverFormData({ ...driverFormData, cnh_category: e.target.value })}
                            placeholder="D"
                            maxLength={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cnh_expiry">Validade</Label>
                          <Input
                            id="cnh_expiry"
                            type="date"
                            value={driverFormData.cnh_expiry}
                            onChange={(e) => setDriverFormData({ ...driverFormData, cnh_expiry: e.target.value })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Veículo - Apenas para motoristas */}
                {isDriver && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Veículo de Trabalho
                      </CardTitle>
                      <CardDescription>
                        Informações do seu veículo guincho
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vehicle_plate">Placa</Label>
                          <Input
                            id="vehicle_plate"
                            value={driverFormData.vehicle_plate}
                            onChange={(e) => setDriverFormData({ ...driverFormData, vehicle_plate: e.target.value.toUpperCase() })}
                            placeholder="ABC1234"
                            maxLength={7}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vehicle_model">Modelo</Label>
                          <Input
                            id="vehicle_model"
                            value={driverFormData.vehicle_model}
                            onChange={(e) => setDriverFormData({ ...driverFormData, vehicle_model: e.target.value })}
                            placeholder="Iveco Daily"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vehicle_type">Tipo</Label>
                          <Input
                            id="vehicle_type"
                            value={driverFormData.vehicle_type}
                            onChange={(e) => setDriverFormData({ ...driverFormData, vehicle_type: e.target.value })}
                            placeholder="GUINCHO"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vehicle_year">Ano</Label>
                          <Input
                            id="vehicle_year"
                            value={driverFormData.vehicle_year}
                            onChange={(e) => setDriverFormData({ ...driverFormData, vehicle_year: e.target.value })}
                            placeholder="2020"
                            maxLength={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vehicle_color">Cor</Label>
                          <Input
                            id="vehicle_color"
                            value={driverFormData.vehicle_color}
                            onChange={(e) => setDriverFormData({ ...driverFormData, vehicle_color: e.target.value })}
                            placeholder="Branco"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Endereço - Apenas para motoristas */}
                {isDriver && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Endereço
                      </CardTitle>
                      <CardDescription>
                        Seu endereço completo
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="postal_code">CEP</Label>
                          <div className="relative">
                            <Input
                              id="postal_code"
                              value={driverFormData.postal_code}
                              onChange={(e) => {
                                const masked = formatCep(e.target.value);
                                setDriverFormData({ ...driverFormData, postal_code: masked });
                                lookupCep(masked);
                              }}
                              onBlur={(e) => lookupCep(e.target.value)}
                              placeholder="00000-000"
                              maxLength={9}
                              className={cepLoading ? 'pr-9 opacity-70' : ''}
                              disabled={cepLoading}
                            />
                            {cepLoading && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                          {cepLoading && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Buscando endereço...
                            </p>
                          )}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="street">Rua/Avenida</Label>
                          <Input
                            id="street"
                            value={driverFormData.street}
                            onChange={(e) => setDriverFormData({ ...driverFormData, street: e.target.value })}
                            placeholder="Av Paulista"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="number">Número</Label>
                          <Input
                            id="number"
                            value={driverFormData.number}
                            onChange={(e) => setDriverFormData({ ...driverFormData, number: e.target.value })}
                            placeholder="1000"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="complement">Complemento</Label>
                          <Input
                            id="complement"
                            value={driverFormData.complement}
                            onChange={(e) => setDriverFormData({ ...driverFormData, complement: e.target.value })}
                            placeholder="Apto 101"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="neighborhood">Bairro</Label>
                          <Input
                            id="neighborhood"
                            value={driverFormData.neighborhood}
                            onChange={(e) => setDriverFormData({ ...driverFormData, neighborhood: e.target.value })}
                            placeholder="Bela Vista"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            value={driverFormData.city}
                            onChange={(e) => setDriverFormData({ ...driverFormData, city: e.target.value })}
                            placeholder="São Paulo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">Estado</Label>
                          <Input
                            id="state"
                            value={driverFormData.state}
                            onChange={(e) => setDriverFormData({ ...driverFormData, state: e.target.value.toUpperCase() })}
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reference">Ponto de Referência</Label>
                        <Input
                          id="reference"
                          value={driverFormData.reference}
                          onChange={(e) => setDriverFormData({ ...driverFormData, reference: e.target.value })}
                          placeholder="Próximo ao metrô"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Dados Bancários - Apenas para motoristas */}
                {isDriver && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Dados Bancários
                      </CardTitle>
                      <CardDescription>
                        Informações para recebimento de pagamentos
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bank_account_name">Nome do Titular</Label>
                          <Input
                            id="bank_account_name"
                            value={driverFormData.bank_account_name}
                            onChange={(e) => setDriverFormData({ ...driverFormData, bank_account_name: e.target.value })}
                            placeholder="Nome completo do titular"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="income_value">Renda Mensal (R$)</Label>
                          <Input
                            id="income_value"
                            value={driverFormData.income_value}
                            onChange={(e) => setDriverFormData({ ...driverFormData, income_value: e.target.value })}
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bank_code">Código do Banco</Label>
                          <Input
                            id="bank_code"
                            value={driverFormData.bank_code}
                            onChange={(e) => setDriverFormData({ ...driverFormData, bank_code: e.target.value.replace(/\D/g, '') })}
                            placeholder="001"
                            maxLength={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bank_agency">Agência</Label>
                          <Input
                            id="bank_agency"
                            value={driverFormData.bank_agency}
                            onChange={(e) => setDriverFormData({ ...driverFormData, bank_agency: e.target.value.replace(/\D/g, '') })}
                            placeholder="0001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bank_account_type">Tipo de Conta</Label>
                          <Select
                            value={driverFormData.bank_account_type}
                            onValueChange={(value) => setDriverFormData({ ...driverFormData, bank_account_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CONTA_CORRENTE">Conta Corrente</SelectItem>
                              <SelectItem value="CONTA_POUPANCA">Conta Poupança</SelectItem>
                              <SelectItem value="CONTA_PAGAMENTO">Conta Pagamento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bank_account_number">Número da Conta</Label>
                          <Input
                            id="bank_account_number"
                            value={driverFormData.bank_account_number}
                            onChange={(e) => setDriverFormData({ ...driverFormData, bank_account_number: e.target.value.replace(/\D/g, '') })}
                            placeholder="00000000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bank_account_digit">Dígito</Label>
                          <Input
                            id="bank_account_digit"
                            value={driverFormData.bank_account_digit}
                            onChange={(e) => setDriverFormData({ ...driverFormData, bank_account_digit: e.target.value.toUpperCase() })}
                            placeholder="0"
                            maxLength={1}
                          />
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pix_key_type">Tipo de Chave PIX</Label>
                          <Select
                            value={driverFormData.pix_key_type}
                            onValueChange={(value) => setDriverFormData({ ...driverFormData, pix_key_type: value, pix_key: '' })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CPF">CPF</SelectItem>
                              <SelectItem value="CNPJ">CNPJ</SelectItem>
                              <SelectItem value="EMAIL">E-mail</SelectItem>
                              <SelectItem value="PHONE">Telefone</SelectItem>
                              <SelectItem value="EVP">Chave Aleatória</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pix_key">Chave PIX</Label>
                          <Input
                            id="pix_key"
                            value={driverFormData.pix_key}
                            onChange={(e) => setDriverFormData({ ...driverFormData, pix_key: e.target.value })}
                            placeholder={
                              driverFormData.pix_key_type === 'CPF' ? '000.000.000-00' :
                              driverFormData.pix_key_type === 'CNPJ' ? '00.000.000/0000-00' :
                              driverFormData.pix_key_type === 'EMAIL' ? 'email@exemplo.com' :
                              driverFormData.pix_key_type === 'PHONE' ? '(00) 00000-0000' :
                              'Chave aleatória'
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Botão Salvar */}
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading} size="lg">
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Assinatura & Cobrança */}
            {!isDriver && (
              <TabsContent value="subscription">
                <SubscriptionManagement />
              </TabsContent>
            )}

            {/* Segurança */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                  <CardDescription>
                    Use uma senha forte com pelo menos 8 caracteres
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {/* Senha atual */}
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Senha Atual</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Nova senha */}
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPasswords.next ? 'text' : 'password'}
                          value={passwordForm.next}
                          onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          minLength={8}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, next: !showPasswords.next })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordForm.next.length > 0 && (() => {
                        const err = validateNewPassword(passwordForm.next);
                        return err ? <p className="text-xs text-destructive">{err}</p> : null;
                      })()}
                    </div>

                    {/* Confirmar nova senha */}
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          minLength={8}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordForm.confirm.length > 0 && passwordForm.next !== passwordForm.confirm && (
                        <p className="text-xs text-destructive">As senhas não coincidem</p>
                      )}
                      {passwordForm.confirm.length > 0 && passwordForm.next === passwordForm.confirm && passwordForm.next.length >= 8 && (
                        <p className="text-xs text-green-600 dark:text-green-400">Senhas coincidem ✓</p>
                      )}
                    </div>

                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
