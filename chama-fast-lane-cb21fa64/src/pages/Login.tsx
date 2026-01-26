import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff, Shield, User, Truck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logoChama from "@/assets/logo-chama365.png";

type LoginType = "cliente" | "guincheiro";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginAsDriver } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<LoginType>("cliente");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let result;

    if (loginType === "guincheiro") {
      result = await loginAsDriver(formData.email, formData.password);
    } else {
      result = await login(formData.email, formData.password);
    }

    if (result.success) {
      toast({
        title: "Login realizado com sucesso!",
        description: loginType === "guincheiro"
          ? "Bem-vindo, guincheiro! Você será redirecionado..."
          : "Você será redirecionado...",
      });
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } else {
      // Extrair mensagem de erro da resposta da API
      const errorMessage = result.error?.message || result.error || "E-mail ou senha inválidos. Verifique seus dados e tente novamente.";
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    toast({
      title: "Em desenvolvimento",
      description: "Login com Google será implementado em breve.",
    });
  };

  const handleAdminLogin = async () => {
    setIsLoading(true);
    const result = await login('admin@chama365.com', 'admin123');
    if (result.success) {
      toast({
        title: "Login de administrador realizado!",
        description: "Você será redirecionado...",
      });
      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } else {
      // Extrair mensagem de erro da resposta da API
      const errorMessage = result.error?.message || result.error || "Credenciais de administrador inválidas.";
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <Link to="/">
            <img src={logoChama} alt="Chama365" className="h-16 mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h1>
          <p className="text-muted-foreground">Entre na sua conta para continuar</p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          {/* Login Type Selection */}
          <div className="space-y-3 mb-6">
            <Label>Entrar como</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLoginType("cliente")}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  loginType === "cliente"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <User className="h-8 w-8" />
                <span className="font-medium">Usuário</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginType("guincheiro")}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  loginType === "guincheiro"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Truck className="h-8 w-8" />
                <span className="font-medium">Guincheiro</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  Lembrar de mim
                </Label>
              </div>
              <Link
                to="/esqueci-senha"
                className="text-sm text-primary hover:underline"
              >
                Esqueci a senha
              </Link>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              ou continue com
            </span>
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleGoogleLogin}
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

          {/* Admin Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-primary/50 text-primary hover:bg-primary/10"
            size="lg"
            onClick={handleAdminLogin}
          >
            <Shield className="h-5 w-5 mr-2" />
            Entrar como Administrador
          </Button>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem uma conta?{" "}
            <Link to="/cadastro" className="text-primary font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
