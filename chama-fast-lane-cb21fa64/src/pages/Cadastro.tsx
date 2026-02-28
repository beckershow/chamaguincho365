import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff, Phone, FileText, Truck, User, ChevronRight } from "lucide-react";
import logoChama from "@/assets/logo-chama365.png";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

type UserType = "cliente" | "guincheiro" | null;

const Cadastro = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planCode = searchParams.get('plan');
  const { toast } = useToast();
  const { login, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>("cliente");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    password: "",
    confirmPassword: "",
  });

  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleCredentialResponse = useCallback(async (response: any) => {
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle(response.credential);
      if (result.success) {
        toast({ title: "Conta Google vinculada!", description: "Redirecionando..." });
        setTimeout(() => {
          if (planCode && (planCode === 'BASICO' || planCode === 'INTERMEDIARIO')) {
            navigate(`/planos/checkout/${planCode}`);
          } else {
            navigate("/");
          }
        }, 1000);
      } else {
        const msg = result.error?.message || result.error || "Erro ao entrar com Google.";
        toast({ title: "Erro", description: msg, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro", description: "Erro ao conectar com Google.", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  }, [loginWithGoogle, navigate, planCode, toast]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google || !googleButtonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredentialResponse,
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      width: googleButtonRef.current.offsetWidth || 320,
      text: 'continue_with',
      locale: 'pt-BR',
    });
  }, [handleGoogleCredentialResponse, userType]);



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

  const isValidCPF = (cpf: string): boolean => {
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
    let d1 = (sum * 10) % 11;
    if (d1 === 10) d1 = 0;
    if (d1 !== parseInt(cpf[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
    let d2 = (sum * 10) % 11;
    if (d2 === 10) d2 = 0;

    return d2 === parseInt(cpf[10]);
  };

  const isValidCNPJ = (cnpj: string): boolean => {
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(cnpj[i]) * weights1[i];
    let d1 = sum % 11;
    d1 = d1 < 2 ? 0 : 11 - d1;
    if (d1 !== parseInt(cnpj[12])) return false;

    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) sum += parseInt(cnpj[i]) * weights2[i];
    let d2 = sum % 11;
    d2 = d2 < 2 ? 0 : 11 - d2;

    return d2 === parseInt(cnpj[13]);
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({
        title: "E-mail inválido",
        description: "Informe um e-mail válido",
        variant: "destructive",
      });
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      toast({
        title: "Telefone inválido",
        description: "Informe um telefone válido com DDD",
        variant: "destructive",
      });
      return;
    }

    const docDigits = formData.document.replace(/\D/g, "");
    if (docDigits.length === 11) {
      if (!isValidCPF(docDigits)) {
        toast({
          title: "CPF inválido",
          description: "O CPF informado não é válido",
          variant: "destructive",
        });
        return;
      }
    } else if (docDigits.length === 14) {
      if (!isValidCNPJ(docDigits)) {
        toast({
          title: "CNPJ inválido",
          description: "O CNPJ informado não é válido",
          variant: "destructive",
        });
        return;
      }
    } else {
      toast({
        title: "CPF/CNPJ inválido",
        description: "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido",
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

      {
        // Cadastro de usuário comum
        const registerData = {
          email: formData.email,
          password: formData.password,
          phone_number: internationalPhone,
          display_name: formData.name,
          cpf_cnpj: documentNumbers,
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
                description: planCode
                  ? "Você está conectado e será redirecionado para finalizar sua assinatura."
                  : "Você está conectado e será redirecionado para a página inicial.",
              });

              // Redirecionar para checkout do plano ou página inicial
              setTimeout(() => {
                if (planCode && (planCode === 'BASICO' || planCode === 'INTERMEDIARIO')) {
                  navigate(`/planos/checkout/${planCode}`);
                } else {
                  navigate("/");
                }
              }, 1500);
            } else {
              // Se o login automático falhar, redirecionar para login manual
              toast({
                title: "Cadastro concluído",
                description: "Por favor, faça login com suas credenciais.",
              });
              setTimeout(() => {
                const redirectPath = planCode ? `/login?redirect=/planos/checkout/${planCode}` : '/login';
                navigate(redirectPath);
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
          {planCode && (
            <div className="mt-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary font-medium">
                Você será direcionado para assinar o Plano {planCode === 'BASICO' ? 'Básico' : 'Intermediário'}
              </p>
            </div>
          )}
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

          {/* Guincheiro: redireciona para o cadastro completo em 6 etapas */}
          {userType === "guincheiro" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Truck className="h-5 w-5" />
                  Cadastro completo de Guincheiro
                </div>
                <p className="text-sm text-muted-foreground">
                  O cadastro de guincheiro é feito em <strong>6 etapas</strong> e inclui:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-none">
                  {[
                    "Dados da conta",
                    "Dados pessoais (CPF, CNH, renda)",
                    "Endereço completo",
                    "Dados do veículo",
                    "Dados bancários e Pix",
                    "Envio de fotos (CNH, CRLV, selfie)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={() => navigate("/cadastro/guincheiro")}
              >
                Iniciar cadastro de guincheiro
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Cliente: formulário direto */}
          {userType === "cliente" && (
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
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
          )}

          {/* Divider e Google — só exibe para cliente */}
          {userType === "cliente" && (
            <>
              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  ou continue com
                </span>
              </div>

              <div ref={googleButtonRef} className="w-full flex justify-center" />
              {googleLoading && (
                <p className="text-sm text-muted-foreground text-center">Autenticando com Google...</p>
              )}
              {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Login com Google indisponível (VITE_GOOGLE_CLIENT_ID não configurado)
                </p>
              )}

              <p className="text-center text-sm text-muted-foreground mt-6">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Entre aqui
                </Link>
              </p>
            </>
          )}

          {!userType && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Selecione o tipo de conta acima para continuar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
