import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, Eye, EyeOff, Phone, FileText, Truck, User, CreditCard, Car, Calendar, Palette } from "lucide-react";
import logoChama from "@/assets/logo-chama365.png";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type UserType = "cliente" | "guincheiro" | null;

const tiposVeiculo = [
  { value: "Reboque", label: "Reboque" },
  { value: "Pesado", label: "Pesado" },
  { value: "Plataforma", label: "Plataforma" },
];

const Cadastro = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    password: "",
    confirmPassword: "",
  });

  // Guincheiro specific data
  const [guincheiro, setGuincheiro] = useState({
    cnh: "",
    placa: "",
    modelo: "",
    ano: "",
    tipo: "",
    cor: "",
  });


  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return value;
  };

  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2");
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})/, "$1-$2");
    }
  };

  const formatPlaca = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleaned.length <= 7) {
      // Formato Mercosul: ABC1D23
      return cleaned.slice(0, 7);
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast({
        title: "Termos não aceitos",
        description: "Você precisa aceitar os Termos de Uso e Política de Privacidade",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve conter no mínimo 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Formatar telefone para padrão internacional
      const phoneNumbers = formData.phone.replace(/\D/g, "");
      const internationalPhone = `+55${phoneNumbers}`;

      // Remover formatação do documento (apenas números)
      const documentNumbers = formData.document.replace(/\D/g, "");
      const documentType = documentNumbers.length <= 11 ? "CPF" : "CNPJ";

      if (userType === "guincheiro") {
        // Preparar dados do guincheiro no formato esperado pela API
        const driverData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: phoneNumbers, // Apenas números, sem +55
          cpf: documentNumbers, // Apenas números, sem formatação
          cnh_number: guincheiro.cnh,
          vehicle_plate: guincheiro.placa,
          vehicle_model: guincheiro.modelo,
          vehicle_year: parseInt(guincheiro.ano) || new Date().getFullYear(),
          vehicle_type: guincheiro.tipo, // Enviar com primeira letra maiúscula: Reboque, Pesado ou Plataforma
          vehicle_color: guincheiro.cor,
        };

        console.log("Enviando dados do guincheiro:", driverData);

        const result = await apiService.registerDriver(driverData);

        if (result.success) {
          // Acessar dados dentro de result.data se existir
          const responseData = (result as any).data;
          const driver = responseData?.driver || result.driver;

          // Armazenar dados do guincheiro
          if (driver) {
            localStorage.setItem('driver_data', JSON.stringify(driver));
          }

          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Seu cadastro está em análise. Você receberá uma notificação quando for aprovado.",
          });

          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          // Extrair mensagem de erro da resposta da API
          const errorMessage = result.error?.message || result.error || "Não foi possível realizar o cadastro. Tente novamente.";
          toast({
            title: "Erro no cadastro",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        // Cadastro de usuário comum
        const registerData = {
          email: formData.email,
          password: formData.password,
          phone_number: internationalPhone,
          display_name: formData.name,
          cpf_cnpj: formData.document,
        };

        console.log("Enviando dados:", registerData);

        const result = await apiService.registerUser(registerData);

        if (result.success) {
          // Acessar dados dentro de result.data se existir
          const responseData = (result as any).data;
          const userData = responseData?.user || result.user;
          const accessToken = responseData?.accessToken || result.accessToken;
          const refreshToken = responseData?.refreshToken || result.refreshToken;
          const token = responseData?.token || result.token;

          // Armazenar tokens
          if (accessToken || refreshToken || token) {
            apiService.storeAuthTokens(accessToken, refreshToken, token);
          }

          // Armazenar dados do usuário
          if (userData) {
            const userDataToStore = {
              id: userData.id.toString(),
              uid: userData.uid,
              email: userData.email,
              name: userData.display_name,
              phone_number: userData.phone_number,
              cpf_cnpj: userData.cpf_cnpj,
              photo_url: userData.photo_url,
              email_verified: userData.email_verified,
              created_at: userData.created_at,
            };
            localStorage.setItem('user_data', JSON.stringify(userDataToStore));
          }

          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Fazendo login automaticamente...",
          });

          // Fazer login automático com as credenciais recém-cadastradas
          setTimeout(async () => {
            const loginResult = await login(formData.email, formData.password);

            if (loginResult.success) {
              toast({
                title: "Login realizado!",
                description: "Você está conectado e será redirecionado para a página inicial.",
              });

              // Redirecionar para a página inicial
              setTimeout(() => {
                navigate("/");
              }, 1500);
            } else {
              // Se o login automático falhar, redirecionar para login manual
              toast({
                title: "Cadastro concluído",
                description: "Por favor, faça login com suas credenciais.",
              });
              setTimeout(() => {
                navigate("/login");
              }, 1500);
            }
          }, 1000);
        } else {
          // Extrair mensagem de erro da resposta da API
          const errorMessage = result.error?.message || result.error || "Não foi possível realizar o cadastro. Tente novamente.";
          toast({
            title: "Erro no cadastro",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao registrar:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar seu cadastro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    if (!userType) {
      alert("Por favor, selecione o tipo de conta primeiro");
      return;
    }
    // TODO: Implement Google OAuth registration
    console.log("Google register clicked", { userType });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <Link to="/">
            <img src={logoChama} alt="Chama365" className="h-16 mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
          <p className="text-muted-foreground text-center">
            Escolha o tipo de conta e preencha seus dados
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          {/* User Type Selection */}
          <div className="space-y-3 mb-6">
            <Label>Tipo de conta</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType("cliente")}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  userType === "cliente"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <User className="h-8 w-8" />
                <span className="font-medium">Usuário</span>
                <span className="text-xs text-muted-foreground">Solicitar guincho</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType("guincheiro")}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  userType === "guincheiro"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Truck className="h-8 w-8" />
                <span className="font-medium">Guincheiro</span>
                <span className="text-xs text-muted-foreground">Oferecer serviço</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  maxLength={15}
                  required
                />
              </div>
            </div>

            {/* CPF/CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="document">CPF/CNPJ</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="document"
                  type="text"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  className="pl-10"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: formatDocument(e.target.value) })}
                  maxLength={18}
                  required
                />
              </div>
            </div>

            {/* Guincheiro Specific Fields */}
            {userType === "guincheiro" && (
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Dados do Veículo
                </h3>

                {/* CNH */}
                <div className="space-y-2">
                  <Label htmlFor="cnh">Número da CNH</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cnh"
                      type="text"
                      placeholder="00000000000"
                      className="pl-10"
                      value={guincheiro.cnh}
                      onChange={(e) => setGuincheiro({ ...guincheiro, cnh: e.target.value.replace(/\D/g, "").slice(0, 11) })}
                      maxLength={11}
                      required
                    />
                  </div>
                </div>

                {/* Placa */}
                <div className="space-y-2">
                  <Label htmlFor="placa">Placa do Veículo</Label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="placa"
                      type="text"
                      placeholder="ABC1D23"
                      className="pl-10 uppercase"
                      value={guincheiro.placa}
                      onChange={(e) => setGuincheiro({ ...guincheiro, placa: formatPlaca(e.target.value) })}
                      maxLength={7}
                      required
                    />
                  </div>
                </div>

                {/* Modelo e Ano */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input
                      id="modelo"
                      type="text"
                      placeholder="Ex: Ford F-4000"
                      value={guincheiro.modelo}
                      onChange={(e) => setGuincheiro({ ...guincheiro, modelo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ano">Ano</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="ano"
                        type="text"
                        placeholder="2020"
                        className="pl-10"
                        value={guincheiro.ano}
                        onChange={(e) => setGuincheiro({ ...guincheiro, ano: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Tipo e Cor */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Guincho</Label>
                    <Select
                      value={guincheiro.tipo}
                      onValueChange={(value) => setGuincheiro({ ...guincheiro, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposVeiculo.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cor">Cor</Label>
                    <div className="relative">
                      <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cor"
                        type="text"
                        placeholder="Ex: Branco"
                        className="pl-10"
                        value={guincheiro.cor}
                        onChange={(e) => setGuincheiro({ ...guincheiro, cor: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                Eu concordo com os{" "}
                <Link to="/termos" className="text-primary hover:underline">
                  Termos de Uso
                </Link>{" "}
                e{" "}
                <Link to="/privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!userType || isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              ou continue com
            </span>
          </div>

          {/* Google Register */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleGoogleRegister}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar com Google
          </Button>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Entre aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
