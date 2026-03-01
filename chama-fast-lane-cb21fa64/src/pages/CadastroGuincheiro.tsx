import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import logoChama from "@/assets/logo-chama365.png";
import {
  User, Mail, Lock, Eye, EyeOff, Phone, FileText, CreditCard,
  Car, Calendar, Palette, MapPin, Building2, Camera, Truck,
  ChevronRight, ChevronLeft, Check, DollarSign, Banknote, Hash,
} from "lucide-react";

// ─── Constantes ──────────────────────────────────────────────────────────────

const STEPS = ["Conta", "Pessoal", "Endereço", "Veículo", "Dados bancários", "Fotos"];

const CNH_CATEGORIES = ["A", "B", "C", "D", "E", "AC", "AD", "AE"];

const VEHICLE_TYPES = [
  { value: "Caminhao", label: "Caminhão" },
  { value: "Carro", label: "Carro" },
  { value: "Moto", label: "Moto" },
  { value: "Utilitario", label: "Utilitário" },
  { value: "Plataforma", label: "Plataforma" },
  { value: "Asa-delta", label: "Asa-delta" },
  { value: "Reboque Pesado", label: "Reboque Pesado" },
];

const ACCOUNT_TYPES = [
  { value: "CONTA_CORRENTE", label: "Conta Corrente" },
  { value: "CONTA_POUPANCA", label: "Conta Poupança" },
  { value: "CONTA_PAGAMENTO", label: "Conta de Pagamento" },
];

const PIX_TYPES = [
  { value: "CPF", label: "CPF" },
  { value: "CNPJ", label: "CNPJ" },
  { value: "EMAIL", label: "E-mail" },
  { value: "PHONE", label: "Telefone" },
  { value: "EVP", label: "Chave aleatória (EVP)" },
];

// ─── Helpers de validação ─────────────────────────────────────────────────────

const onlyDigits = (v: string) => v.replace(/\D/g, "");

const isValidCPF = (cpf: string): boolean => {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
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
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = w1.reduce((acc, w, i) => acc + parseInt(cnpj[i]) * w, 0);
  let d1 = sum % 11;
  d1 = d1 < 2 ? 0 : 11 - d1;
  if (d1 !== parseInt(cnpj[12])) return false;
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = w2.reduce((acc, w, i) => acc + parseInt(cnpj[i]) * w, 0);
  let d2 = sum % 11;
  d2 = d2 < 2 ? 0 : 11 - d2;
  return d2 === parseInt(cnpj[13]);
};

const isValidPlate = (plate: string): boolean =>
  /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate) || /^[A-Z]{3}[0-9]{4}$/.test(plate);

// ─── Formatadores ─────────────────────────────────────────────────────────────

const formatPhone = (v: string) => {
  const n = onlyDigits(v);
  if (n.length <= 11)
    return n.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
  return v;
};

const formatCPFCNPJ = (v: string) => {
  const n = onlyDigits(v).slice(0, 14);
  if (n.length <= 11) {
    // CPF: 000.000.000-00
    return n
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  // CNPJ: 00.000.000/0000-00
  return n
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

const formatBRL = (v: string): string => {
  const digits = onlyDigits(v);
  if (!digits) return "";
  const num = parseInt(digits, 10);
  return (num / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseBRL = (v: string): number =>
  parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;

const formatCEP = (v: string) => {
  const n = onlyDigits(v);
  return n.replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
};

// ─── Indicador de etapa ───────────────────────────────────────────────────────

interface StepIndicatorProps {
  current: number;
  total: number;
  labels: string[];
}

const StepIndicator = ({ current, total, labels }: StepIndicatorProps) => (
  <div className="w-full mb-6">
    <div className="flex items-start justify-between mb-3 gap-0.5">
      {labels.map((label, idx) => {
        const step = idx + 1;
        const isCompleted = step < current;
        const isCurrent = step === current;
        return (
          <div key={step} className="flex flex-col items-center flex-1 relative">
            {idx < total - 1 && (
              <div
                className={`absolute top-3.5 left-1/2 w-full h-0.5 transition-colors ${
                  isCompleted ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
            <div
              className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all bg-background ${
                isCompleted
                  ? "bg-primary border-primary text-primary-foreground"
                  : isCurrent
                  ? "border-primary text-primary"
                  : "border-muted text-muted-foreground"
              }`}
            >
              {isCompleted ? <Check className="w-3.5 h-3.5" /> : step}
            </div>
            <span
              className={`text-[9px] mt-1 text-center font-medium leading-tight ${
                isCurrent
                  ? "text-primary"
                  : isCompleted
                  ? "text-primary"
                  : "text-muted-foreground/50"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
    <div className="w-full bg-muted rounded-full h-1 mt-1">
      <div
        className="bg-primary h-1 rounded-full transition-all duration-500"
        style={{ width: `${((current - 1) / (total - 1)) * 100}%` }}
      />
    </div>
    <p className="text-xs text-muted-foreground text-right mt-1">
      Etapa {current} de {total}
    </p>
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────

const CadastroGuincheiro = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Dados pré-preenchidos vindos do login Google
  const googlePrefill = (location.state as any)?.googlePrefill as { name: string; email: string } | undefined;

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Etapa 1 – Conta (pré-preenchido se veio do Google)
  const [conta, setConta] = useState({
    name: googlePrefill?.name || "",
    email: googlePrefill?.email || "",
    password: "",
    confirmPassword: "",
  });

  // Etapa 2 – Pessoal
  const [pessoal, setPessoal] = useState({
    phone: "",
    cpf: "",
    cnh: "",
    cnhCategory: "",
    cnhExpiry: "",
    birthDate: "",
    income: "",
  });

  // Etapa 3 – Endereço
  const [endereco, setEndereco] = useState({
    postalCode: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    complement: "",
    reference: "",
  });

  // Etapa 4 – Veículo
  const [veiculo, setVeiculo] = useState({
    plate: "",
    model: "",
    year: "",
    color: "",
    vehicleType: "",
  });

  // Etapa 5 – Dados Bancários
  const [bancario, setBancario] = useState({
    bankAccountName: "",
    bankCode: "",
    bankAgency: "",
    bankAccountNumber: "",
    bankAccountDigit: "",
    bankAccountType: "",
    pixKey: "",
    pixKeyType: "",
  });

  // Etapa 6 – Fotos
  const [cnhPhoto, setCnhPhoto] = useState<File | null>(null);
  const [crlvPhoto, setCrlvPhoto] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [cnhPhotoPreview, setCnhPhotoPreview] = useState("");
  const [crlvPhotoPreview, setCrlvPhotoPreview] = useState("");
  const [selfiePreview, setSelfiePreview] = useState("");

  const cnhPhotoRef = useRef<HTMLInputElement>(null);
  const crlvPhotoRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleFileChange = (
    file: File | undefined,
    setFile: (f: File) => void,
    setPreview: (s: string) => void
  ) => {
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const lookupCep = async (cep: string) => {
    const digits = onlyDigits(cep);
    if (digits.length !== 8) return;
    setIsCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setEndereco((prev) => ({
          ...prev,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
          complement: data.complemento || "",
        }));
      } else {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível consultar o endereço",
        variant: "destructive",
      });
    } finally {
      setIsCepLoading(false);
    }
  };

  // ─── Validações por etapa ──────────────────────────────────────────────────

  const validateStep = (step: number): string | null => {
    switch (step) {
      case 1: {
        if (!conta.name.trim() || conta.name.trim().length < 3)
          return "Nome deve ter pelo menos 3 caracteres";
        if (conta.name.trim().split(/\s+/).length < 2)
          return "Informe nome e sobrenome";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(conta.email.trim()))
          return "E-mail inválido";
        if (conta.password.length < 8)
          return "Senha deve ter no mínimo 8 caracteres";
        if (!/[A-Z]/.test(conta.password))
          return "Senha deve conter pelo menos uma letra maiúscula";
        if (!/[a-z]/.test(conta.password))
          return "Senha deve conter pelo menos uma letra minúscula";
        if (!/[0-9]/.test(conta.password))
          return "Senha deve conter pelo menos um número";
        if (conta.password !== conta.confirmPassword)
          return "As senhas não coincidem";
        if (!acceptTerms)
          return "Você precisa aceitar os Termos de Uso e Política de Privacidade";
        return null;
      }
      case 2: {
        if (onlyDigits(pessoal.phone).length < 10)
          return "Telefone inválido, informe DDD + número";
        const docDigits = onlyDigits(pessoal.cpf);
        if (docDigits.length === 11) {
          if (!isValidCPF(docDigits)) return "CPF inválido";
        } else if (docDigits.length === 14) {
          if (!isValidCNPJ(docDigits)) return "CNPJ inválido";
        } else {
          return "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido";
        }
        const cnhD = onlyDigits(pessoal.cnh);
        if (cnhD.length !== 11) return "CNH deve ter 11 dígitos";
        if (/^(\d)\1{10}$/.test(cnhD)) return "CNH inválida, verifique os dígitos";
        if (!pessoal.cnhCategory) return "Selecione a categoria da CNH";
        if (!pessoal.cnhExpiry) return "Informe a validade da CNH";
        if (!pessoal.birthDate) return "Informe a data de nascimento";
        const inc = parseBRL(pessoal.income);
        if (!pessoal.income || isNaN(inc) || inc <= 0)
          return "Informe uma renda mensal válida";
        return null;
      }
      case 3: {
        if (onlyDigits(endereco.postalCode).length !== 8)
          return "CEP deve ter 8 dígitos";
        if (!endereco.street.trim()) return "Rua é obrigatória";
        if (!endereco.number.trim()) return "Número é obrigatório";
        if (!endereco.neighborhood.trim()) return "Bairro é obrigatório";
        if (!endereco.city.trim()) return "Cidade é obrigatória";
        if (endereco.state.trim().length !== 2)
          return "UF deve ter 2 letras (ex: SP)";
        return null;
      }
      case 4: {
        const plate = veiculo.plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (!isValidPlate(plate))
          return "Placa inválida. Use ABC1D23 (Mercosul) ou ABC1234 (antigo)";
        if (!veiculo.model.trim()) return "Modelo é obrigatório";
        const yr = parseInt(veiculo.year);
        const curYear = new Date().getFullYear();
        if (!veiculo.year || veiculo.year.length !== 4 || yr < 1980 || yr > curYear + 1)
          return `Ano inválido (1980–${curYear + 1})`;
        if (!veiculo.color.trim()) return "Cor é obrigatória";
        if (!veiculo.vehicleType) return "Selecione o tipo de veículo";
        return null;
      }
      case 5: {
        if (!bancario.bankAccountName.trim()) return "Nome do titular é obrigatório";
        if (onlyDigits(bancario.bankCode).length !== 3)
          return "Código do banco deve ter 3 dígitos";
        const agD = onlyDigits(bancario.bankAgency);
        if (agD.length < 4 || agD.length > 6)
          return "Agência deve ter 4 a 6 dígitos";
        const accD = onlyDigits(bancario.bankAccountNumber);
        if (accD.length < 3 || accD.length > 12)
          return "Número da conta inválido (3–12 dígitos)";
        if (!/^[0-9xX]$/.test(bancario.bankAccountDigit))
          return "Dígito da conta inválido (0–9 ou X)";
        if (!bancario.bankAccountType) return "Selecione o tipo de conta";
        if (!bancario.pixKeyType) return "Selecione o tipo da chave Pix";
        if (!bancario.pixKey.trim()) return "Chave Pix é obrigatória";
        const pk = bancario.pixKey.trim();
        if (bancario.pixKeyType === "CPF" && !isValidCPF(onlyDigits(pk)))
          return "CPF da chave Pix inválido";
        if (bancario.pixKeyType === "CNPJ" && !isValidCNPJ(onlyDigits(pk)))
          return "CNPJ da chave Pix inválido";
        if (bancario.pixKeyType === "PHONE") {
          const pd = onlyDigits(pk);
          if (pd.length < 10 || pd.length > 11)
            return "Telefone Pix deve ter DDD + número";
        }
        if (
          bancario.pixKeyType === "EMAIL" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pk)
        )
          return "E-mail Pix inválido";
        if (bancario.pixKeyType === "EVP" && pk.length < 20)
          return "Chave aleatória Pix parece incompleta";
        return null;
      }
      case 6: {
        if (!cnhPhoto) return "Foto da CNH é obrigatória";
        if (!crlvPhoto) return "Foto do CRLV é obrigatória";
        if (!selfie) return "Selfie é obrigatória";
        return null;
      }
      default:
        return null;
    }
  };

  const handleNext = () => {
    const err = validateStep(currentStep);
    if (err) {
      toast({ title: "Verifique os dados", description: err, variant: "destructive" });
      return;
    }
    setCurrentStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const err = validateStep(6);
    if (err) {
      toast({ title: "Verifique os dados", description: err, variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const fd = new FormData();

      // Etapa 1
      fd.append("name", conta.name.trim());
      fd.append("email", conta.email.trim());
      fd.append("password", conta.password);

      // Etapa 2
      const docDigits = onlyDigits(pessoal.cpf);
      const docType = docDigits.length === 14 ? "CNPJ" : "CPF";
      fd.append("phone", onlyDigits(pessoal.phone));
      fd.append("cpf", docDigits);
      fd.append("document_type", docType);
      fd.append("document_number", docDigits);
      fd.append("cnh_number", onlyDigits(pessoal.cnh));
      fd.append("cnh_category", pessoal.cnhCategory);
      fd.append("cnh_expiry", pessoal.cnhExpiry);
      fd.append("birth_date", pessoal.birthDate);
      fd.append("income_value", parseBRL(pessoal.income).toFixed(2));

      // Etapa 3
      fd.append("postal_code", onlyDigits(endereco.postalCode));
      fd.append("street", endereco.street.trim());
      fd.append("number", endereco.number.trim());
      fd.append("neighborhood", endereco.neighborhood.trim());
      fd.append("city", endereco.city.trim());
      fd.append("state", endereco.state.toUpperCase().trim());
      if (endereco.complement.trim()) fd.append("complement", endereco.complement.trim());
      if (endereco.reference.trim()) fd.append("reference", endereco.reference.trim());

      // Etapa 4
      fd.append(
        "vehicle_plate",
        veiculo.plate.toUpperCase().replace(/[^A-Z0-9]/g, "")
      );
      fd.append("vehicle_model", veiculo.model.trim());
      fd.append("vehicle_year", veiculo.year);
      fd.append("vehicle_color", veiculo.color.trim());
      fd.append("vehicle_type", veiculo.vehicleType);

      // Etapa 5
      fd.append(
        "bank_account_name",
        bancario.bankAccountName.trim() || conta.name.trim()
      );
      fd.append("bank_code", onlyDigits(bancario.bankCode));
      fd.append("bank_agency", onlyDigits(bancario.bankAgency));
      fd.append(
        "bank_account_number",
        `${onlyDigits(bancario.bankAccountNumber)}-${bancario.bankAccountDigit.toUpperCase()}`
      );
      fd.append("bank_account_type", bancario.bankAccountType);
      fd.append("pix_key", bancario.pixKey.trim());
      fd.append("pix_key_type", bancario.pixKeyType);

      // Etapa 6 – Fotos
      fd.append("cnh_photo", cnhPhoto!);
      fd.append("crlv_photo", crlvPhoto!);
      fd.append("selfie", selfie!);

      const result = await apiService.registerDriverMultipart(fd);

      if (result.success) {
        if (result.driver) localStorage.setItem("driver_data", JSON.stringify(result.driver));
        toast({
          title: "Cadastro realizado com sucesso!",
          description:
            "Seu cadastro está em análise. Você receberá uma notificação quando for aprovado.",
        });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast({
          title: "Erro no cadastro",
          description:
            result.error || "Não foi possível realizar o cadastro. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar seu cadastro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Renderização das etapas ───────────────────────────────────────────────

  const renderStep = () => {
    switch (currentStep) {
      // ── Etapa 1: Conta ──────────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-4">
            {googlePrefill && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
                <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Dados importados do Google. Complete as etapas restantes para finalizar seu cadastro.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  className={`pl-10 ${googlePrefill ? "bg-muted/50" : ""}`}
                  value={conta.name}
                  onChange={(e) => setConta({ ...conta, name: e.target.value })}
                  readOnly={!!googlePrefill}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className={`pl-10 ${googlePrefill ? "bg-muted/50" : ""}`}
                  value={conta.email}
                  onChange={(e) => setConta({ ...conta, email: e.target.value })}
                  readOnly={!!googlePrefill}
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
                  value={conta.password}
                  onChange={(e) => setConta({ ...conta, password: e.target.value })}
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
              <p className="text-xs text-muted-foreground">
                Mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={conta.confirmPassword}
                  onChange={(e) =>
                    setConta({ ...conta, confirmPassword: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(c) => setAcceptTerms(c as boolean)}
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
          </div>
        );

      // ── Etapa 2: Pessoal ────────────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="pl-10"
                  value={pessoal.phone}
                  onChange={(e) =>
                    setPessoal({ ...pessoal, phone: formatPhone(e.target.value) })
                  }
                  maxLength={15}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF / CNPJ</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  className="pl-10"
                  value={pessoal.cpf}
                  onChange={(e) =>
                    setPessoal({ ...pessoal, cpf: formatCPFCNPJ(e.target.value) })
                  }
                  maxLength={18}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">CPF (11 dígitos) ou CNPJ (14 dígitos)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cnh">Número da CNH</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cnh"
                    type="text"
                    placeholder="00000000000"
                    className="pl-10"
                    value={pessoal.cnh}
                    onChange={(e) =>
                      setPessoal({
                        ...pessoal,
                        cnh: e.target.value.replace(/\D/g, "").slice(0, 11),
                      })
                    }
                    maxLength={11}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnhCategory">Categoria CNH</Label>
                <Select
                  value={pessoal.cnhCategory}
                  onValueChange={(v) => setPessoal({ ...pessoal, cnhCategory: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CNH_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cnhExpiry">Validade da CNH</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cnhExpiry"
                    type="date"
                    className="pl-10"
                    value={pessoal.cnhExpiry}
                    onChange={(e) =>
                      setPessoal({ ...pessoal, cnhExpiry: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="birthDate"
                    type="date"
                    className="pl-10"
                    value={pessoal.birthDate}
                    onChange={(e) =>
                      setPessoal({ ...pessoal, birthDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="income">Renda Mensal (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  R$
                </span>
                <Input
                  id="income"
                  type="text"
                  inputMode="numeric"
                  placeholder="0,00"
                  className="pl-14"
                  value={pessoal.income}
                  onChange={(e) =>
                    setPessoal({ ...pessoal, income: formatBRL(e.target.value) })
                  }
                  required
                />
              </div>
            </div>
          </div>
        );

      // ── Etapa 3: Endereço ───────────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">CEP</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="postalCode"
                  type="text"
                  placeholder="00000-000"
                  className="pl-10"
                  value={endereco.postalCode}
                  onChange={(e) => {
                    const formatted = formatCEP(e.target.value);
                    setEndereco({ ...endereco, postalCode: formatted });
                    if (onlyDigits(formatted).length === 8) lookupCep(formatted);
                  }}
                  maxLength={9}
                  required
                />
                {isCepLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
                    Buscando...
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="street">Rua / Avenida</Label>
                <Input
                  id="street"
                  type="text"
                  placeholder="Rua das Flores"
                  value={endereco.street}
                  onChange={(e) => setEndereco({ ...endereco, street: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  type="text"
                  placeholder="123"
                  value={endereco.number}
                  onChange={(e) => setEndereco({ ...endereco, number: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                type="text"
                placeholder="Centro"
                value={endereco.neighborhood}
                onChange={(e) =>
                  setEndereco({ ...endereco, neighborhood: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="São Paulo"
                  value={endereco.city}
                  onChange={(e) => setEndereco({ ...endereco, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">UF</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="SP"
                  maxLength={2}
                  value={endereco.state}
                  onChange={(e) =>
                    setEndereco({
                      ...endereco,
                      state: e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complement">
                Complemento{" "}
                <span className="text-muted-foreground text-xs">(opcional)</span>
              </Label>
              <Input
                id="complement"
                type="text"
                placeholder="Apto 42, Bloco B"
                value={endereco.complement}
                onChange={(e) =>
                  setEndereco({ ...endereco, complement: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">
                Referência{" "}
                <span className="text-muted-foreground text-xs">(opcional)</span>
              </Label>
              <Input
                id="reference"
                type="text"
                placeholder="Próximo ao mercado"
                value={endereco.reference}
                onChange={(e) =>
                  setEndereco({ ...endereco, reference: e.target.value })
                }
              />
            </div>
          </div>
        );

      // ── Etapa 4: Veículo ────────────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plate">Placa do Veículo</Label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="plate"
                  type="text"
                  placeholder="ABC1D23"
                  className="pl-10 uppercase"
                  value={veiculo.plate}
                  onChange={(e) =>
                    setVeiculo({
                      ...veiculo,
                      plate: e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 7),
                    })
                  }
                  maxLength={7}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Formato Mercosul (ABC1D23) ou antigo (ABC1234)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo do Veículo</Label>
              <Input
                id="model"
                type="text"
                placeholder="Ex: VW Delivery 8.160"
                value={veiculo.model}
                onChange={(e) => setVeiculo({ ...veiculo, model: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="year">Ano</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="year"
                    type="text"
                    placeholder="2020"
                    className="pl-10"
                    value={veiculo.year}
                    onChange={(e) =>
                      setVeiculo({
                        ...veiculo,
                        year: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    maxLength={4}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <div className="relative">
                  <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="color"
                    type="text"
                    placeholder="Ex: Branco"
                    className="pl-10"
                    value={veiculo.color}
                    onChange={(e) => setVeiculo({ ...veiculo, color: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Tipo de Veículo</Label>
              <Select
                value={veiculo.vehicleType}
                onValueChange={(v) => setVeiculo({ ...veiculo, vehicleType: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      // ── Etapa 5: Dados Bancários ────────────────────────────────────────────
      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankAccountName">Titular da Conta (como no banco)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="bankAccountName"
                  type="text"
                  placeholder="Nome como consta no banco"
                  className="pl-10"
                  value={bancario.bankAccountName}
                  onChange={(e) =>
                    setBancario({ ...bancario, bankAccountName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="bankCode">Código do Banco</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="bankCode"
                    type="text"
                    placeholder="341"
                    className="pl-10"
                    value={bancario.bankCode}
                    onChange={(e) =>
                      setBancario({
                        ...bancario,
                        bankCode: e.target.value.replace(/\D/g, "").slice(0, 3),
                      })
                    }
                    maxLength={3}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAgency">Agência</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="bankAgency"
                    type="text"
                    placeholder="0001"
                    className="pl-10"
                    value={bancario.bankAgency}
                    onChange={(e) =>
                      setBancario({
                        ...bancario,
                        bankAgency: e.target.value.replace(/\D/g, "").slice(0, 6),
                      })
                    }
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="bankAccountNumber">Número da Conta</Label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="bankAccountNumber"
                    type="text"
                    placeholder="000000000"
                    className="pl-10"
                    value={bancario.bankAccountNumber}
                    onChange={(e) =>
                      setBancario({
                        ...bancario,
                        bankAccountNumber: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 12),
                      })
                    }
                    maxLength={12}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccountDigit">Dígito</Label>
                <Input
                  id="bankAccountDigit"
                  type="text"
                  placeholder="0"
                  value={bancario.bankAccountDigit}
                  onChange={(e) =>
                    setBancario({
                      ...bancario,
                      bankAccountDigit: e.target.value
                        .replace(/[^0-9xX]/g, "")
                        .slice(0, 1)
                        .toUpperCase(),
                    })
                  }
                  maxLength={1}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccountType">Tipo de Conta</Label>
              <Select
                value={bancario.bankAccountType}
                onValueChange={(v) => setBancario({ ...bancario, bankAccountType: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 border-t border-border space-y-3">
              <h4 className="font-medium text-sm">Chave Pix</h4>

              <div className="space-y-2">
                <Label htmlFor="pixKeyType">Tipo da Chave</Label>
                <Select
                  value={bancario.pixKeyType}
                  onValueChange={(v) =>
                    setBancario({ ...bancario, pixKeyType: v, pixKey: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PIX_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {bancario.pixKeyType && (
                <div className="space-y-2">
                  <Label htmlFor="pixKey">Chave Pix</Label>
                  <Input
                    id="pixKey"
                    type="text"
                    placeholder={
                      bancario.pixKeyType === "CPF"
                        ? "000.000.000-00"
                        : bancario.pixKeyType === "CNPJ"
                        ? "00.000.000/0000-00"
                        : bancario.pixKeyType === "EMAIL"
                        ? "seu@email.com"
                        : bancario.pixKeyType === "PHONE"
                        ? "(00) 00000-0000"
                        : "Chave aleatória (EVP)"
                    }
                    value={bancario.pixKey}
                    onChange={(e) =>
                      setBancario({ ...bancario, pixKey: e.target.value })
                    }
                    required
                  />
                </div>
              )}
            </div>
          </div>
        );

      // ── Etapa 6: Fotos ──────────────────────────────────────────────────────
      case 6: {
        const fotosConfig = [
          {
            label: "Foto da CNH",
            key: "cnh",
            file: cnhPhoto,
            preview: cnhPhotoPreview,
            ref: cnhPhotoRef,
            setFile: setCnhPhoto,
            setPreview: setCnhPhotoPreview,
          },
          {
            label: "Foto do CRLV",
            key: "crlv",
            file: crlvPhoto,
            preview: crlvPhotoPreview,
            ref: crlvPhotoRef,
            setFile: setCrlvPhoto,
            setPreview: setCrlvPhotoPreview,
          },
          {
            label: "Selfie com documento",
            key: "selfie",
            file: selfie,
            preview: selfiePreview,
            ref: selfieRef,
            setFile: setSelfie,
            setPreview: setSelfiePreview,
          },
        ];

        return (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Envie fotos legíveis dos documentos. Formatos aceitos: JPG, PNG.
            </p>
            {fotosConfig.map((item) => (
              <div key={item.key} className="space-y-2">
                <Label>{item.label}</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all hover:border-primary ${
                    item.file ? "border-primary/50 bg-primary/5" : "border-border"
                  }`}
                  onClick={() => item.ref.current?.click()}
                >
                  {item.preview ? (
                    <div className="space-y-2">
                      <img
                        src={item.preview}
                        alt={item.label}
                        className="max-h-32 mx-auto rounded object-contain"
                      />
                      <p className="text-xs text-muted-foreground">{item.file?.name}</p>
                      <p className="text-xs text-primary font-medium">
                        Clique para trocar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">
                        Clique para enviar
                      </p>
                      <p className="text-xs text-muted-foreground">JPG ou PNG</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={item.ref}
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0], item.setFile, item.setPreview)
                  }
                />
              </div>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  // ─── Step title ────────────────────────────────────────────────────────────

  const stepTitles = [
    { icon: <User className="h-5 w-5 text-primary" />, label: "Dados da Conta" },
    { icon: <FileText className="h-5 w-5 text-primary" />, label: "Dados Pessoais" },
    { icon: <MapPin className="h-5 w-5 text-primary" />, label: "Endereço" },
    { icon: <Truck className="h-5 w-5 text-primary" />, label: "Dados do Veículo" },
    { icon: <Banknote className="h-5 w-5 text-primary" />, label: "Dados Bancários" },
    { icon: <Camera className="h-5 w-5 text-primary" />, label: "Documentos (Fotos)" },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center">
          <Link to="/">
            <img src={logoChama} alt="Chama365" className="h-16 mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Cadastro de Guincheiro</h1>
          <p className="text-muted-foreground text-center text-sm">
            Preencha todos os dados para criar sua conta
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <StepIndicator
            current={currentStep}
            total={STEPS.length}
            labels={STEPS}
          />

          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            {stepTitles[currentStep - 1].icon}
            {stepTitles[currentStep - 1].label}
          </h2>

          {renderStep()}

          <div className="flex gap-3 mt-6">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
            )}
            {currentStep < STEPS.length ? (
              <Button
                type="button"
                className="flex-1"
                onClick={handleNext}
                disabled={isLoading}
              >
                Próximo <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                className="flex-1"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Finalizar Cadastro"}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Entre aqui
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CadastroGuincheiro;
