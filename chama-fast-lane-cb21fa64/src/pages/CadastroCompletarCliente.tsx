import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import logoChama from "@/assets/logo-chama365.png";
import { Link } from "react-router-dom";

const formatPhone = (v: string) => {
  const n = v.replace(/\D/g, "");
  if (n.length <= 11)
    return n.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
  return v;
};

const formatDocument = (v: string) => {
  const n = v.replace(/\D/g, "").slice(0, 14);
  if (n.length <= 11)
    return n.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return n.replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

const CadastroCompletarCliente = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { updateProfile, user } = useAuth();

  const state = (location.state as any) || {};
  const prefill = state.prefill as { name: string; email: string } | undefined;
  const planCode = state.planCode as string | undefined;

  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast({ title: "Termos não aceitos", description: "Você precisa aceitar os Termos de Uso e Política de Privacidade.", variant: "destructive" });
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      toast({ title: "Telefone inválido", description: "Informe um telefone válido com DDD (10 ou 11 dígitos).", variant: "destructive" });
      return;
    }

    const docDigits = document.replace(/\D/g, "");
    if (docDigits.length !== 11 && docDigits.length !== 14) {
      toast({ title: "CPF/CNPJ inválido", description: "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.updateUserDetails({
        phone_number: `+55${phoneDigits}`,
        cpf_cnpj: docDigits,
      });

      if (result) {
        if (user) {
          updateProfile({ phone_number: `+55${phoneDigits}`, cpf_cnpj: docDigits });
        }
        toast({ title: "Cadastro concluído!", description: "Bem-vindo à Chama365!" });
        setTimeout(() => {
          if (planCode && (planCode === 'BASICO' || planCode === 'INTERMEDIARIO')) {
            navigate(`/planos/checkout/${planCode}`);
          } else {
            navigate("/");
          }
        }, 1000);
      } else {
        toast({ title: "Erro", description: "Não foi possível salvar os dados. Tente novamente.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro inesperado", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Link to="/">
            <img src={logoChama} alt="Chama365" className="h-16 mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Complete seu cadastro</h1>
          <p className="text-muted-foreground text-center">Só mais algumas informações para você começar</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-lg space-y-6">
          {/* Banner Google */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <div>
              <p className="text-sm font-medium text-foreground">{prefill?.name || user?.name}</p>
              <p className="text-xs text-muted-foreground">{prefill?.email || user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="pl-10"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  maxLength={15}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">CPF / CNPJ</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="document"
                  type="text"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  className="pl-10"
                  value={document}
                  onChange={(e) => setDocument(formatDocument(e.target.value))}
                  maxLength={18}
                  required
                />
              </div>
            </div>

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

            <Button type="submit" className="w-full" size="lg" disabled={isLoading || !acceptTerms}>
              {isLoading ? "Salvando..." : "Concluir cadastro"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CadastroCompletarCliente;
