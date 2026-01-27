import { useState, useEffect, useRef } from 'react';
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
import { User as UserIcon, LogOut, Truck, Phone, CheckCircle, XCircle, Clock, Shield, Camera, MapPin, Calendar, FileText, Loader2, Upload, Car, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const tiposGuincho = [
  { value: 'Reboque', label: 'Reboque' },
  { value: 'Pesado', label: 'Pesado' },
  { value: 'Plataforma', label: 'Plataforma' },
];

interface ClienteProfile {
  whatsapp: string;
  cpf_cnpj: string;
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

interface DriverDocument {
  type: string;
  url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploaded_at: string;
}

interface DriverProfileForm {
  // Dados Pessoais
  name: string;
  phone: string;
  email: string;
  cnh_number: string;
  cnh_category: string;
  cnh_expiry: string;
  // Veículo
  vehicle_plate: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_color: string;
  // Detalhes (Endereço e Documentos)
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
  // Documentos
  cnh_document?: DriverDocument;
  crlv_document?: DriverDocument;
  selfie_document?: DriverDocument;
  // Status
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

const formatCep = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
};

const formatDate = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .slice(0, 10);
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
    cpf_cnpj: '',
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

  // Photo upload state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Motorista form state - novo formato
  const [driverForm, setDriverForm] = useState<DriverProfileForm>({
    name: '',
    phone: '',
    email: '',
    cnh_number: '',
    cnh_category: '',
    cnh_expiry: '',
    vehicle_plate: '',
    vehicle_type: '',
    vehicle_model: '',
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
    cnh_document: undefined,
    crlv_document: undefined,
    selfie_document: undefined,
    status: 'pendente',
  });

  // Estado para upload de documentos
  const [isUploadingCNH, setIsUploadingCNH] = useState(false);
  const [isUploadingCRLV, setIsUploadingCRLV] = useState(false);
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
  const cnhInputRef = useRef<HTMLInputElement>(null);
  const crlvInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // Legacy motorista form state (para compatibilidade)
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

  // Estado para loading dos dados do perfil
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    const loadUserDetails = async () => {
      if (user && user.type === 'cliente' && isProfileOpen) {
        setIsLoadingProfile(true);
        try {
          const userDetails = await apiService.getUserDetails();
          // Acessar dados dentro de data.user se existir, senão usar diretamente
          const userData = (userDetails as any)?.data?.user || userDetails?.user;

          if (userData) {
            const details = userData.details || {};

            // Formatar data de nascimento se vier no formato ISO
            let birthDate = '';
            if (details.birth_date) {
              const date = new Date(details.birth_date);
              if (!isNaN(date.getTime())) {
                birthDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
              }
            }

            setClienteForm({
              name: userData.display_name || userData.name || user.name || '',
              whatsapp: userData.phone_number || '',
              cpf_cnpj: userData.cpf_cnpj || user.cpf_cnpj || '',
              birth_date: birthDate,
              postal_code: details.postal_code ? formatCep(details.postal_code) : '',
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
        } catch (error) {
          console.error('Erro ao carregar dados do perfil:', error);
          // Fallback para dados locais
          setClienteForm({
            name: user.name || '',
            whatsapp: user.phone_number || '',
            cpf_cnpj: user.cpf_cnpj || '',
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
        } finally {
          setIsLoadingProfile(false);
        }
      } else if (user && user.type === 'motorista' && isProfileOpen) {
        setIsLoadingProfile(true);
        try {
          const driverDetails = await apiService.getDriverDetails();
          // Acessar dados dentro de data.driver
          const driverData = (driverDetails as any)?.data?.driver || driverDetails?.driver;

          if (driverData) {
            const documents = driverData.documents || [];
            const details = driverData.details || {};

            // Formatar data de validade da CNH se vier no formato ISO
            let cnhExpiry = '';
            if (driverData.cnh_expiry) {
              const date = new Date(driverData.cnh_expiry);
              if (!isNaN(date.getTime())) {
                cnhExpiry = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
              }
            }

            // Formatar data de nascimento se vier no formato ISO
            let birthDate = '';
            if (details.birth_date) {
              const date = new Date(details.birth_date);
              if (!isNaN(date.getTime())) {
                birthDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
              }
            }

            // Buscar documentos
            const cnhDoc = documents.find((d: any) => d.type === 'CNH');
            const crlvDoc = documents.find((d: any) => d.type === 'CRLV');
            const selfieDoc = documents.find((d: any) => d.type === 'SELFIE');

            setDriverForm({
              name: driverData.name || '',
              phone: driverData.phone || '',
              email: driverData.email || user.email || '',
              cnh_number: driverData.cnh_number || '',
              cnh_category: driverData.cnh_category || '',
              cnh_expiry: cnhExpiry,
              vehicle_plate: driverData.vehicle_plate || '',
              vehicle_type: driverData.vehicle_type || '',
              vehicle_model: driverData.vehicle_model || '',
              vehicle_year: driverData.vehicle_year?.toString() || '',
              vehicle_color: driverData.vehicle_color || '',
              birth_date: birthDate,
              postal_code: details.postal_code ? formatCep(details.postal_code) : '',
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
              cnh_document: cnhDoc,
              crlv_document: crlvDoc,
              selfie_document: selfieDoc,
              status: driverData.status === 'APPROVED' ? 'aprovado' : driverData.status === 'REJECTED' ? 'reprovado' : 'pendente',
            });
          }
        } catch (error) {
          console.error('Erro ao carregar dados do guincheiro:', error);
          // Fallback para dados locais
          const profile = user.profile as MotoristaProfile;
          setDriverForm({
            name: user.name || '',
            phone: profile.whatsapp || '',
            email: user.email || '',
            cnh_number: '',
            cnh_category: '',
            cnh_expiry: '',
            vehicle_plate: '',
            vehicle_type: profile.tiposGuincho?.[0] || '',
            vehicle_model: '',
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
            status: profile.status || 'pendente',
          });
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };

    if (isProfileOpen) {
      loadUserDetails();
      setPreviewPhoto(null);
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

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    // Criar preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload para API - usar método correto baseado no tipo de usuário
    setIsUploadingPhoto(true);
    try {
      const result = user.type === 'motorista'
        ? await apiService.uploadDriverPhoto(file)
        : await apiService.uploadProfilePhoto(file);

      if (result.success) {
        // Atualizar o avatar no contexto imediatamente
        if (result.photo_url) {
          updateProfile({ avatar: result.photo_url });
        } else {
          // Usar o preview como fallback
          updateProfile({ avatar: reader.result as string });
        }
        toast.success('Foto atualizada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao enviar foto');
        setPreviewPhoto(null);
      }
    } catch (error) {
      toast.error('Erro ao enviar foto');
      setPreviewPhoto(null);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handlers para upload de documentos do guincheiro
  const handleDocumentUpload = async (
    file: File,
    type: 'cnh' | 'crlv' | 'selfie',
    setUploading: (v: boolean) => void,
    uploadFn: (file: File) => Promise<{ success: boolean; document?: any; error?: string }>
  ) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 10MB');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadFn(file);
      if (result.success && result.document) {
        setDriverForm(prev => ({
          ...prev,
          [`${type}_document`]: result.document,
        }));
        toast.success(`${type.toUpperCase()} enviada com sucesso!`);
      } else {
        toast.error(result.error || `Erro ao enviar ${type.toUpperCase()}`);
      }
    } catch (error) {
      toast.error(`Erro ao enviar ${type.toUpperCase()}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCNHUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleDocumentUpload(file, 'cnh', setIsUploadingCNH, apiService.uploadDriverCNH.bind(apiService));
    }
  };

  const handleCRLVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleDocumentUpload(file, 'crlv', setIsUploadingCRLV, apiService.uploadDriverCRLV.bind(apiService));
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleDocumentUpload(file, 'selfie', setIsUploadingSelfie, apiService.uploadDriverSelfie.bind(apiService));
    }
  };

  const getDocumentStatusBadge = (status?: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30 gap-1">
            <CheckCircle className="w-3 h-3" />
            Aprovado
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-500/20 text-red-600 hover:bg-red-500/30 gap-1">
            <XCircle className="w-3 h-3" />
            Reprovado
          </Badge>
        );
      case 'PENDING':
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30 gap-1">
            <Clock className="w-3 h-3" />
            Pendente
          </Badge>
        );
    }
  };

  const handleProfileSave = async () => {
    if (user.type === 'cliente') {
      // Validar campos obrigatórios
      if (!clienteForm.name.trim()) {
        toast.error('Nome completo é obrigatório');
        return;
      }
      if (!clienteForm.whatsapp.trim()) {
        toast.error('WhatsApp é obrigatório');
        return;
      }
      if (!clienteForm.birth_date.trim()) {
        toast.error('Data de nascimento é obrigatória');
        return;
      }
      if (!clienteForm.postal_code.trim()) {
        toast.error('CEP é obrigatório');
        return;
      }
      if (!clienteForm.street.trim()) {
        toast.error('Rua é obrigatória');
        return;
      }
      if (!clienteForm.number.trim()) {
        toast.error('Número é obrigatório');
        return;
      }
      if (!clienteForm.neighborhood.trim()) {
        toast.error('Bairro é obrigatório');
        return;
      }
      if (!clienteForm.city.trim()) {
        toast.error('Cidade é obrigatória');
        return;
      }
      if (!clienteForm.state.trim()) {
        toast.error('Estado é obrigatório');
        return;
      }
      if (!clienteForm.rg.trim()) {
        toast.error('RG é obrigatório');
        return;
      }
      if (!clienteForm.issuing_agency.trim()) {
        toast.error('Órgão emissor é obrigatório');
        return;
      }
      if (!clienteForm.issuing_state.trim()) {
        toast.error('UF do emissor é obrigatório');
        return;
      }

      // Converter data de DD/MM/AAAA para YYYY-MM-DD
      let birthDateISO = '';
      if (clienteForm.birth_date) {
        const parts = clienteForm.birth_date.split('/');
        if (parts.length === 3) {
          birthDateISO = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      // Atualizar via API com a estrutura correta
      const updateData = {
        name: clienteForm.name,
        display_name: clienteForm.name,
        email: user.email,
        phone_number: clienteForm.whatsapp,
        cpf_cnpj: clienteForm.cpf_cnpj,
        details: {
          birth_date: birthDateISO,
          postal_code: clienteForm.postal_code.replace(/\D/g, ''),
          street: clienteForm.street,
          number: clienteForm.number,
          neighborhood: clienteForm.neighborhood,
          city: clienteForm.city,
          state: clienteForm.state,
          complement: clienteForm.complement,
          reference: clienteForm.reference,
          rg: clienteForm.rg,
          issuing_agency: clienteForm.issuing_agency,
          issuing_state: clienteForm.issuing_state,
        },
      };

      try {
        const result = await apiService.updateUserDetails(updateData);
        if (result) {
          // Atualizar o contexto local com todos os dados
          const updatedUserData: Partial<typeof user> = {
            name: clienteForm.name,
            phone_number: clienteForm.whatsapp,
            cpf_cnpj: clienteForm.cpf_cnpj,
            profile: updateData.details as any,
          };

          // Se a foto foi alterada, incluir o preview como avatar
          if (previewPhoto) {
            updatedUserData.avatar = previewPhoto;
          }

          // Se a API retornou dados atualizados, usar o photo_url
          if (result.user?.photo_url) {
            updatedUserData.avatar = result.user.photo_url;
          }

          updateProfile(updatedUserData);
          toast.success('Perfil atualizado com sucesso!');
          setIsProfileOpen(false);
        } else {
          toast.error('Erro ao atualizar perfil');
        }
      } catch (error) {
        toast.error('Erro ao atualizar perfil');
      }
      return;
    } else if (user.type === 'motorista') {
      // Validar campos obrigatórios do guincheiro
      if (!driverForm.name.trim()) {
        toast.error('Nome completo é obrigatório');
        return;
      }
      if (!driverForm.phone.trim()) {
        toast.error('Telefone é obrigatório');
        return;
      }
      if (!driverForm.cnh_number.trim()) {
        toast.error('Número da CNH é obrigatório');
        return;
      }
      if (!driverForm.cnh_category.trim()) {
        toast.error('Categoria da CNH é obrigatória');
        return;
      }
      if (!driverForm.cnh_expiry.trim()) {
        toast.error('Validade da CNH é obrigatória');
        return;
      }
      if (!driverForm.vehicle_plate.trim()) {
        toast.error('Placa do veículo é obrigatória');
        return;
      }
      if (!driverForm.vehicle_type.trim()) {
        toast.error('Tipo do guincho é obrigatório');
        return;
      }
      if (!driverForm.vehicle_model.trim()) {
        toast.error('Modelo do veículo é obrigatório');
        return;
      }
      if (!driverForm.vehicle_year.trim()) {
        toast.error('Ano do veículo é obrigatório');
        return;
      }
      if (!driverForm.vehicle_color.trim()) {
        toast.error('Cor do veículo é obrigatória');
        return;
      }

      // Converter data de DD/MM/AAAA para YYYY-MM-DD
      let cnhExpiryISO = '';
      if (driverForm.cnh_expiry) {
        const parts = driverForm.cnh_expiry.split('/');
        if (parts.length === 3) {
          cnhExpiryISO = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      // Converter data de nascimento de DD/MM/AAAA para YYYY-MM-DD
      let birthDateISO = '';
      if (driverForm.birth_date) {
        const parts = driverForm.birth_date.split('/');
        if (parts.length === 3) {
          birthDateISO = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      // Atualizar via API no formato correto
      const updateData = {
        name: driverForm.name,
        phone: driverForm.phone,
        cnh_number: driverForm.cnh_number,
        cnh_category: driverForm.cnh_category,
        cnh_expiry: cnhExpiryISO,
        vehicle_plate: driverForm.vehicle_plate,
        vehicle_model: driverForm.vehicle_model,
        vehicle_year: driverForm.vehicle_year,
        vehicle_type: driverForm.vehicle_type,
        vehicle_color: driverForm.vehicle_color,
        details: {
          birth_date: birthDateISO,
          postal_code: driverForm.postal_code.replace(/\D/g, ''),
          street: driverForm.street,
          number: driverForm.number,
          neighborhood: driverForm.neighborhood,
          city: driverForm.city,
          state: driverForm.state,
          complement: driverForm.complement,
          reference: driverForm.reference,
          rg: driverForm.rg,
          issuing_agency: driverForm.issuing_agency,
          issuing_state: driverForm.issuing_state,
        },
      };

      try {
        const result = await apiService.updateDriverDetails(updateData);
        if (result) {
          // Atualizar o contexto local
          updateProfile({
            name: driverForm.name,
            phone_number: driverForm.phone,
            profile: {
              whatsapp: driverForm.phone,
              cidade: '',
              estado: '',
              possuiCaminhao: 'sim',
              tiposGuincho: [driverForm.vehicle_type],
              disponibilidade: '24h',
              areaAtuacao: 100,
              observacoes: '',
              status: driverForm.status,
            },
          });
          toast.success('Perfil atualizado com sucesso!');
          setIsProfileOpen(false);
        } else {
          toast.error('Erro ao atualizar perfil');
        }
      } catch (error) {
        toast.error('Erro ao atualizar perfil');
      }
    }
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
            <>
              <DropdownMenuItem onClick={() => navigate('/perfil')} className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Editar Perfil Completo</span>
              </DropdownMenuItem>
            </>
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

          {/* Loading state */}
          {isLoadingProfile && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando dados...</span>
            </div>
          )}

          {!isLoadingProfile && (
          <div className="space-y-4 py-4">
            {/* Avatar with upload */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24 cursor-pointer" onClick={handlePhotoClick}>
                  <AvatarImage src={previewPhoto || user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                    {getInitials(user.type === 'cliente' ? clienteForm.name : driverForm.name)}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
                  disabled={isUploadingPhoto}
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">Clique na foto para alterar</p>

            {/* Common fields - apenas para cliente */}
            {user.type === 'cliente' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    value={clienteForm.name}
                    onChange={(e) => setClienteForm({ ...clienteForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" value={user.email} disabled className="bg-muted" />
                </div>
              </>
            )}


            {/* CPF/CNPJ - somente para cliente */}
            {user.type === 'cliente' && (
              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                <Input
                  id="cpf_cnpj"
                  value={clienteForm.cpf_cnpj}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            {/* WhatsApp - apenas para cliente */}
            {user.type === 'cliente' && (
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp <span className="text-destructive">*</span></Label>
                <Input
                  id="whatsapp"
                  placeholder="(11) 99999-9999"
                  value={clienteForm.whatsapp}
                  onChange={(e) => setClienteForm({ ...clienteForm, whatsapp: formatWhatsApp(e.target.value) })}
                  required
                />
              </div>
            )}

            {/* Cliente specific fields */}
            {user.type === 'cliente' && (
              <>
                {/* Data de Nascimento */}
                <div className="space-y-2">
                  <Label htmlFor="birth_date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de Nascimento <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="birth_date"
                    placeholder="DD/MM/AAAA"
                    value={clienteForm.birth_date}
                    onChange={(e) => setClienteForm({ ...clienteForm, birth_date: formatDate(e.target.value) })}
                    maxLength={10}
                    required
                  />
                </div>

                {/* Seção de Endereço */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Endereço
                  </h4>

                  {/* CEP */}
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">CEP <span className="text-destructive">*</span></Label>
                    <Input
                      id="postal_code"
                      placeholder="00000-000"
                      value={clienteForm.postal_code}
                      onChange={(e) => setClienteForm({ ...clienteForm, postal_code: formatCep(e.target.value) })}
                      maxLength={9}
                      required
                    />
                  </div>

                  {/* Rua e Número */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="street">Rua <span className="text-destructive">*</span></Label>
                      <Input
                        id="street"
                        placeholder="Nome da rua"
                        value={clienteForm.street}
                        onChange={(e) => setClienteForm({ ...clienteForm, street: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number">Número <span className="text-destructive">*</span></Label>
                      <Input
                        id="number"
                        placeholder="Nº"
                        value={clienteForm.number}
                        onChange={(e) => setClienteForm({ ...clienteForm, number: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Bairro */}
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro <span className="text-destructive">*</span></Label>
                    <Input
                      id="neighborhood"
                      placeholder="Nome do bairro"
                      value={clienteForm.neighborhood}
                      onChange={(e) => setClienteForm({ ...clienteForm, neighborhood: e.target.value })}
                      required
                    />
                  </div>

                  {/* Cidade e Estado */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade <span className="text-destructive">*</span></Label>
                      <Input
                        id="city"
                        placeholder="Sua cidade"
                        value={clienteForm.city}
                        onChange={(e) => setClienteForm({ ...clienteForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado <span className="text-destructive">*</span></Label>
                      <Select
                        value={clienteForm.state}
                        onValueChange={(value) => setClienteForm({ ...clienteForm, state: value })}
                        required
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

                  {/* Complemento */}
                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      placeholder="Apto, bloco, etc."
                      value={clienteForm.complement}
                      onChange={(e) => setClienteForm({ ...clienteForm, complement: e.target.value })}
                    />
                  </div>

                  {/* Referência */}
                  <div className="space-y-2">
                    <Label htmlFor="reference">Ponto de Referência</Label>
                    <Input
                      id="reference"
                      placeholder="Próximo a..."
                      value={clienteForm.reference}
                      onChange={(e) => setClienteForm({ ...clienteForm, reference: e.target.value })}
                    />
                  </div>
                </div>

                {/* Seção de Documento (RG) */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Documento de Identidade
                  </h4>

                  {/* RG */}
                  <div className="space-y-2">
                    <Label htmlFor="rg">Número do RG <span className="text-destructive">*</span></Label>
                    <Input
                      id="rg"
                      placeholder="00.000.000-0"
                      value={clienteForm.rg}
                      onChange={(e) => setClienteForm({ ...clienteForm, rg: e.target.value })}
                      required
                    />
                  </div>

                  {/* Órgão Emissor e UF */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="issuing_agency">Órgão Emissor <span className="text-destructive">*</span></Label>
                      <Input
                        id="issuing_agency"
                        placeholder="SSP, DETRAN, etc."
                        value={clienteForm.issuing_agency}
                        onChange={(e) => setClienteForm({ ...clienteForm, issuing_agency: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issuing_state">UF Emissor <span className="text-destructive">*</span></Label>
                      <Select
                        value={clienteForm.issuing_state}
                        onValueChange={(value) => setClienteForm({ ...clienteForm, issuing_state: value })}
                        required
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
                </div>
              </>
            )}

            {/* Motorista - Dados Pessoais */}
            {user.type === 'motorista' && (
              <>
                {/* Seção: Dados Pessoais */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-primary" />
                    Dados Pessoais
                  </h4>

                  {/* Nome completo */}
                  <div className="space-y-2">
                    <Label htmlFor="driver_name">Nome completo <span className="text-destructive">*</span></Label>
                    <Input
                      id="driver_name"
                      value={driverForm.name}
                      onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                      required
                    />
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <Label htmlFor="driver_phone">Telefone <span className="text-destructive">*</span></Label>
                    <Input
                      id="driver_phone"
                      placeholder="(11) 99999-9999"
                      value={driverForm.phone}
                      onChange={(e) => setDriverForm({ ...driverForm, phone: formatWhatsApp(e.target.value) })}
                      required
                    />
                  </div>

                  {/* E-mail (somente leitura) */}
                  <div className="space-y-2">
                    <Label htmlFor="driver_email">E-mail (Login)</Label>
                    <Input
                      id="driver_email"
                      value={driverForm.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  {/* Número da CNH */}
                  <div className="space-y-2">
                    <Label htmlFor="cnh_number">Número da CNH <span className="text-destructive">*</span></Label>
                    <Input
                      id="cnh_number"
                      placeholder="00000000000"
                      value={driverForm.cnh_number}
                      onChange={(e) => setDriverForm({ ...driverForm, cnh_number: e.target.value.replace(/\D/g, '') })}
                      maxLength={11}
                      required
                    />
                  </div>

                  {/* Categoria e Validade da CNH */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="cnh_category">Categoria <span className="text-destructive">*</span></Label>
                      <Select
                        value={driverForm.cnh_category}
                        onValueChange={(value) => setDriverForm({ ...driverForm, cnh_category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Cat." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="AB">AB</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnh_expiry">Validade <span className="text-destructive">*</span></Label>
                      <Input
                        id="cnh_expiry"
                        placeholder="DD/MM/AAAA"
                        value={driverForm.cnh_expiry}
                        onChange={(e) => setDriverForm({ ...driverForm, cnh_expiry: formatDate(e.target.value) })}
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Meu Veículo */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-medium flex items-center gap-2">
                    <Car className="w-4 h-4 text-primary" />
                    Meu Veículo
                  </h4>

                  {/* Placa */}
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_plate">Placa <span className="text-destructive">*</span></Label>
                    <Input
                      id="vehicle_plate"
                      placeholder="ABC-1234 ou ABC1D23"
                      value={driverForm.vehicle_plate}
                      onChange={(e) => setDriverForm({ ...driverForm, vehicle_plate: e.target.value.toUpperCase() })}
                      maxLength={8}
                      required
                    />
                  </div>

                  {/* Tipo do Guincho */}
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_type">Tipo do Guincho <span className="text-destructive">*</span></Label>
                    <Select
                      value={driverForm.vehicle_type}
                      onValueChange={(value) => setDriverForm({ ...driverForm, vehicle_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposGuincho.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Modelo e Ano */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_model">Modelo <span className="text-destructive">*</span></Label>
                      <Input
                        id="vehicle_model"
                        placeholder="Ex: Mercedes Atego"
                        value={driverForm.vehicle_model}
                        onChange={(e) => setDriverForm({ ...driverForm, vehicle_model: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_year">Ano <span className="text-destructive">*</span></Label>
                      <Input
                        id="vehicle_year"
                        placeholder="2020"
                        value={driverForm.vehicle_year}
                        onChange={(e) => setDriverForm({ ...driverForm, vehicle_year: e.target.value.replace(/\D/g, '') })}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  {/* Cor */}
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_color">Cor <span className="text-destructive">*</span></Label>
                    <Input
                      id="vehicle_color"
                      placeholder="Ex: Branco"
                      value={driverForm.vehicle_color}
                      onChange={(e) => setDriverForm({ ...driverForm, vehicle_color: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Seção: Documentos */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-medium flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Documentos
                  </h4>

                  {/* CNH */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Foto da CNH</p>
                        {driverForm.cnh_document?.url && (
                          <p className="text-xs text-muted-foreground">Enviado</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDocumentStatusBadge(driverForm.cnh_document?.status)}
                      {driverForm.cnh_document?.status !== 'APPROVED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cnhInputRef.current?.click()}
                          disabled={isUploadingCNH}
                        >
                          {isUploadingCNH ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </Button>
                      )}
                      <input
                        ref={cnhInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCNHUpload}
                      />
                    </div>
                  </div>

                  {/* CRLV */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Foto da CRLV</p>
                        {driverForm.crlv_document?.url && (
                          <p className="text-xs text-muted-foreground">Enviado</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDocumentStatusBadge(driverForm.crlv_document?.status)}
                      {driverForm.crlv_document?.status !== 'APPROVED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => crlvInputRef.current?.click()}
                          disabled={isUploadingCRLV}
                        >
                          {isUploadingCRLV ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </Button>
                      )}
                      <input
                        ref={crlvInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCRLVUpload}
                      />
                    </div>
                  </div>

                  {/* Selfie */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Selfie (Foto do rosto)</p>
                        {driverForm.selfie_document?.url && (
                          <p className="text-xs text-muted-foreground">Enviado</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDocumentStatusBadge(driverForm.selfie_document?.status)}
                      {driverForm.selfie_document?.status !== 'APPROVED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selfieInputRef.current?.click()}
                          disabled={isUploadingSelfie}
                        >
                          {isUploadingSelfie ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </Button>
                      )}
                      <input
                        ref={selfieInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSelfieUpload}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Documentos aprovados não podem ser reenviados. Documentos pendentes ou reprovados podem ser atualizados.
                  </p>
                </div>

                {/* Seção: Dados Adicionais */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Dados Adicionais
                  </h4>

                  {/* Data de Nascimento */}
                  <div className="space-y-2">
                    <Label htmlFor="driver_birth_date">Data de Nascimento</Label>
                    <Input
                      id="driver_birth_date"
                      placeholder="DD/MM/AAAA"
                      value={driverForm.birth_date}
                      onChange={(e) => setDriverForm({ ...driverForm, birth_date: formatDate(e.target.value) })}
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Seção: Endereço */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Endereço
                  </h4>

                  {/* CEP */}
                  <div className="space-y-2">
                    <Label htmlFor="driver_postal_code">CEP</Label>
                    <Input
                      id="driver_postal_code"
                      placeholder="00000-000"
                      value={driverForm.postal_code}
                      onChange={(e) => setDriverForm({ ...driverForm, postal_code: formatCep(e.target.value) })}
                      maxLength={9}
                    />
                  </div>

                  {/* Rua e Número */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="driver_street">Rua</Label>
                      <Input
                        id="driver_street"
                        placeholder="Nome da rua"
                        value={driverForm.street}
                        onChange={(e) => setDriverForm({ ...driverForm, street: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driver_number">Número</Label>
                      <Input
                        id="driver_number"
                        placeholder="Nº"
                        value={driverForm.number}
                        onChange={(e) => setDriverForm({ ...driverForm, number: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Bairro */}
                  <div className="space-y-2">
                    <Label htmlFor="driver_neighborhood">Bairro</Label>
                    <Input
                      id="driver_neighborhood"
                      placeholder="Nome do bairro"
                      value={driverForm.neighborhood}
                      onChange={(e) => setDriverForm({ ...driverForm, neighborhood: e.target.value })}
                    />
                  </div>

                  {/* Cidade e Estado */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="driver_city">Cidade</Label>
                      <Input
                        id="driver_city"
                        placeholder="Sua cidade"
                        value={driverForm.city}
                        onChange={(e) => setDriverForm({ ...driverForm, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driver_state">Estado</Label>
                      <Select
                        value={driverForm.state}
                        onValueChange={(value) => setDriverForm({ ...driverForm, state: value })}
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

                  {/* Complemento */}
                  <div className="space-y-2">
                    <Label htmlFor="driver_complement">Complemento</Label>
                    <Input
                      id="driver_complement"
                      placeholder="Apto, bloco, etc."
                      value={driverForm.complement}
                      onChange={(e) => setDriverForm({ ...driverForm, complement: e.target.value })}
                    />
                  </div>

                  {/* Referência */}
                  <div className="space-y-2">
                    <Label htmlFor="driver_reference">Ponto de Referência</Label>
                    <Input
                      id="driver_reference"
                      placeholder="Próximo a..."
                      value={driverForm.reference}
                      onChange={(e) => setDriverForm({ ...driverForm, reference: e.target.value })}
                    />
                  </div>
                </div>

                {/* Seção: Documento de Identidade (RG) */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Documento de Identidade
                  </h4>

                  {/* RG */}
                  <div className="space-y-2">
                    <Label htmlFor="driver_rg">Número do RG</Label>
                    <Input
                      id="driver_rg"
                      placeholder="00.000.000-0"
                      value={driverForm.rg}
                      onChange={(e) => setDriverForm({ ...driverForm, rg: e.target.value })}
                    />
                  </div>

                  {/* Órgão Emissor e UF */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="driver_issuing_agency">Órgão Emissor</Label>
                      <Input
                        id="driver_issuing_agency"
                        placeholder="SSP, DETRAN, etc."
                        value={driverForm.issuing_agency}
                        onChange={(e) => setDriverForm({ ...driverForm, issuing_agency: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driver_issuing_state">UF Emissor</Label>
                      <Select
                        value={driverForm.issuing_state}
                        onValueChange={(value) => setDriverForm({ ...driverForm, issuing_state: value })}
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
                </div>
              </>
            )}
          </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleProfileSave} disabled={isLoadingProfile}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
