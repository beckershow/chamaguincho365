import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import logoChama from "@/assets/logo-chama365.png";

const EsqueciSenha = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password reset logic with endpoint
    console.log("Password reset for:", email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center">
            <Link to="/">
              <img src={logoChama} alt="Chama365" className="h-16 mb-4" />
            </Link>
          </div>

          {/* Success Message */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">E-mail enviado!</h1>
            <p className="text-muted-foreground mb-6">
              Se existe uma conta com o e-mail <strong>{email}</strong>, você receberá um link para redefinir sua senha.
            </p>
            <Link to="/login">
              <Button className="w-full" size="lg">
                Voltar para o login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <Link to="/">
            <img src={logoChama} alt="Chama365" className="h-16 mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Esqueceu a senha?</h1>
          <p className="text-muted-foreground text-center">
            Digite seu e-mail e enviaremos um link para redefinir sua senha
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg">
              Enviar link de recuperação
            </Button>
          </form>

          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;
