import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, CreditCard, Lock, LogOut, ArrowLeft, Truck, MapPin, FileText } from 'lucide-react';
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
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
}

export default function Profile() {
  const { user, isAuthenticated, isDriver, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [planStatus, setPlanStatus] = useState<string | null>(null);

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
              phone: driver.phone || '',
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
              phone: userInfo.phone_number || '',
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isDriver) {
        // Atualizar perfil do motorista via PATCH /api/drivers/me
        await apiService.updateDriverDetails({
          name: driverFormData.name,
          phone: driverFormData.phone,
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
          },
        });
      } else {
        // Atualizar perfil do cliente via PATCH /api/users/me
        await apiService.updateUserDetails({
          display_name: clientFormData.name,
          phone_number: clientFormData.phone,
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
              <AvatarImage src={user.avatar} />
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
                          value={isDriver ? driverFormData.phone : clientFormData.phone}
                          onChange={(e) => isDriver
                            ? setDriverFormData({ ...driverFormData, phone: e.target.value })
                            : setClientFormData({ ...clientFormData, phone: e.target.value })
                          }
                          placeholder="(00) 00000-0000"
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
                          <Input
                            id="postal_code"
                            value={driverFormData.postal_code}
                            onChange={(e) => setDriverFormData({ ...driverFormData, postal_code: e.target.value })}
                            placeholder="00000-000"
                          />
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
                  <CardTitle>Segurança da Conta</CardTitle>
                  <CardDescription>
                    Altere sua senha e gerencie a segurança da conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button>Alterar Senha</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
