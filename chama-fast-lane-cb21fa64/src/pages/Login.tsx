import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff, User, Truck, X, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getGoogleSavedAccounts,
  removeGoogleSavedAccount,
  type GoogleSavedAccount,
} from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logoChama from "@/assets/logo-chama365.png";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

type LoginType = "cliente" | "guincheiro";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginAsDriver, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<LoginType>("cliente");
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Google
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const newAccountButtonRef = useRef<HTMLDivElement>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<GoogleSavedAccount[]>([]);
  // Quando true, mostra o botão Google para "nova conta" em vez dos cards
  const [showNewAccountButton, setShowNewAccountButton] = useState(false);

  // Carrega contas salvas
  useEffect(() => {
    setSavedAccounts(getGoogleSavedAccounts());
  }, []);

  const handleGoogleCredentialResponse = useCallback(
    async (response: any) => {
      setGoogleLoading(true);
      try {
        const result = await loginWithGoogle(response.credential, rememberMe);
        if (result.success) {
          toast({ title: "Login realizado com sucesso!", description: "Você será redirecionado..." });
          // Atualiza a lista de contas após login
          setSavedAccounts(getGoogleSavedAccounts());
          setTimeout(() => navigate("/"), 1000);
        } else {
          const msg = result.error?.message || result.error || "Erro ao fazer login com Google.";
          toast({ title: "Erro no login", description: msg, variant: "destructive" });
        }
      } catch {
        toast({ title: "Erro no login", description: "Erro ao conectar com Google.", variant: "destructive" });
      } finally {
        setGoogleLoading(false);
        setShowNewAccountButton(false);
      }
    },
    [loginWithGoogle, rememberMe, navigate, toast]
  );

  // Inicializa e renderiza o botão Google padrão (sem hint)
  const renderGoogleButton = useCallback(
    (container: HTMLDivElement | null) => {
      if (!container || !window.google) return;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
      });
      window.google.accounts.id.renderButton(container, {
        theme: "outline",
        size: "large",
        width: container.offsetWidth || 300,
        text: "continue_with",
        locale: "pt-BR",
      });
    },
    [handleGoogleCredentialResponse]
  );

  // Inicializa botão padrão (quando não há contas salvas)
  useEffect(() => {
    if (savedAccounts.length === 0 && googleButtonRef.current) {
      renderGoogleButton(googleButtonRef.current);
    }
  }, [savedAccounts.length, renderGoogleButton]);

  // Inicializa botão "nova conta" (quando o usuário clicou em "+ Usar outra conta")
  useEffect(() => {
    if (showNewAccountButton && newAccountButtonRef.current) {
      renderGoogleButton(newAccountButtonRef.current);
    }
  }, [showNewAccountButton, renderGoogleButton]);

  // Login com uma conta salva: usa login_hint para pré-selecionar no Google
  const handleSavedAccountLogin = (account: GoogleSavedAccount) => {
    if (!window.google) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    setGoogleLoading(true);
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredentialResponse,
      login_hint: account.email,
      cancel_on_tap_outside: false,
    });

    window.google.accounts.id.prompt((notification: any) => {
      // Se o prompt não puder ser exibido (navegador bloqueou), faz fallback
      if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
        setGoogleLoading(false);
        setShowNewAccountButton(true);
        toast({
          title: "Clique no botão abaixo para continuar",
          description: `Entrando com ${account.email}`,
        });
      }
    });
  };

  const handleRemoveAccount = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    removeGoogleSavedAccount(email);
    const updated = getGoogleSavedAccounts();
    setSavedAccounts(updated);
    if (updated.length === 0) setShowNewAccountButton(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let result;
    if (loginType === "guincheiro") {
      result = await loginAsDriver(formData.email, formData.password, rememberMe);
    } else {
      result = await login(formData.email, formData.password, rememberMe);
    }

    if (result.success) {
      toast({
        title: "Login realizado com sucesso!",
        description: loginType === "guincheiro" ? "Bem-vindo, guincheiro!" : "Você será redirecionado...",
      });
      setTimeout(() => navigate("/"), 1000);
    } else {
      const errorMessage =
        result.error?.message || result.error || "E-mail ou senha inválidos. Verifique seus dados.";
      toast({ title: "Erro no login", description: errorMessage, variant: "destructive" });
    }

    setIsLoading(false);
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasSavedAccounts = savedAccounts.length > 0;

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
          {/* Tipo de login */}
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
              <Link to="/esqueci-senha" className="text-sm text-primary hover:underline">
                Esqueci a senha
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Divisor Google */}
          {clientId && (
            <>
              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  ou continue com
                </span>
              </div>

              {/* Contas Google salvas */}
              {hasSavedAccounts ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">Continuar como</p>

                  {savedAccounts.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => handleSavedAccountLogin(account)}
                      disabled={googleLoading}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-all group text-left"
                    >
                      {/* Avatar */}
                      {account.photo ? (
                        <img
                          src={account.photo}
                          alt={account.name}
                          className="h-9 w-9 rounded-full flex-shrink-0 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                          {account.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{account.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                      </div>

                      {/* Remover */}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveAccount(e, account.email)}
                        className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                        title="Remover conta"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </button>
                  ))}

                  {/* Usar outra conta */}
                  {!showNewAccountButton ? (
                    <button
                      type="button"
                      onClick={() => setShowNewAccountButton(true)}
                      className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-accent transition-all text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-4 w-4" />
                      Usar outra conta Google
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground text-center">
                        Clique no botão para entrar com uma nova conta
                      </p>
                      <div ref={newAccountButtonRef} className="w-full flex justify-center" />
                    </div>
                  )}
                </div>
              ) : (
                /* Botão Google padrão (sem contas salvas) */
                <div ref={googleButtonRef} className="w-full flex justify-center" />
              )}

              {googleLoading && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Autenticando com Google...
                </p>
              )}
            </>
          )}

          {!clientId && (
            <p className="text-xs text-muted-foreground text-center py-2 mt-4">
              Login com Google indisponível (VITE_GOOGLE_CLIENT_ID não configurado)
            </p>
          )}

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
