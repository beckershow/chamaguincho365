/**
 * Utilitários de status de plano — reutilizável em todo o sistema frontend.
 *
 * Uso:
 *   import { getPlanBlockInfo, isPlanBlocked } from '@/utils/planStatus';
 */

export type PlanStatus =
  | 'ACTIVE'
  | 'COOLDOWN'
  | 'PAST_DUE'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'INACTIVE'
  | 'PENDING'
  | string;

export type PlanBlockSeverity = 'ok' | 'warning' | 'blocked';

export interface PlanBlockInfo {
  /** true quando o usuário não tem acesso ao serviço */
  isBlocked: boolean;
  /** 'ok' | 'warning' (pago, aguardando) | 'blocked' (sem acesso) */
  severity: PlanBlockSeverity;
  /** Mensagem curta para exibir no badge/banner */
  label: string;
  /** Descrição completa para exibir no banner */
  description: string;
}

const INFO_MAP: Record<string, PlanBlockInfo> = {
  ACTIVE: {
    isBlocked: false,
    severity: 'ok',
    label: 'Ativo',
    description: 'Seu plano está ativo.',
  },
  COOLDOWN: {
    isBlocked: true,
    severity: 'warning',
    label: 'Processando',
    description: 'Pagamento recebido. O acesso será liberado em até 48 horas.',
  },
  PAST_DUE: {
    isBlocked: true,
    severity: 'blocked',
    label: 'Bloqueado',
    description: 'Seu plano está bloqueado por pagamento em atraso. Regularize para recuperar o acesso.',
  },
  OVERDUE: {
    isBlocked: true,
    severity: 'blocked',
    label: 'Bloqueado',
    description: 'Seu plano está bloqueado por pagamento em atraso. Regularize para recuperar o acesso.',
  },
  CANCELLED: {
    isBlocked: false,
    severity: 'warning',
    label: 'Cancelado',
    description: 'Assinatura cancelada. Você ainda tem acesso até o fim do período pago.',
  },
  EXPIRED: {
    isBlocked: true,
    severity: 'blocked',
    label: 'Expirado',
    description: 'Seu plano expirou. Assine um novo plano para continuar usando o serviço.',
  },
  INACTIVE: {
    isBlocked: true,
    severity: 'blocked',
    label: 'Inativo',
    description: 'Você não possui um plano ativo.',
  },
  PENDING: {
    isBlocked: true,
    severity: 'warning',
    label: 'Pendente',
    description: 'Aguardando confirmação de pagamento para ativar seu plano.',
  },
};

/**
 * Retorna informações detalhadas sobre o bloqueio do plano.
 * Aceita qualquer string de status — valores desconhecidos retornam 'blocked'.
 */
export function getPlanBlockInfo(status: PlanStatus | null | undefined): PlanBlockInfo {
  if (!status) {
    return INFO_MAP.INACTIVE;
  }
  return (
    INFO_MAP[String(status).toUpperCase()] ?? {
      isBlocked: true,
      severity: 'blocked',
      label: status,
      description: 'Status de plano desconhecido.',
    }
  );
}

/**
 * Retorna true se o plano está bloqueado (sem acesso ao serviço).
 */
export function isPlanBlocked(status: PlanStatus | null | undefined): boolean {
  return getPlanBlockInfo(status).isBlocked;
}

/**
 * Retorna true se o plano tem acesso ativo (ACTIVE ou CANCELLED dentro do período).
 */
export function isPlanActive(status: PlanStatus | null | undefined): boolean {
  const s = String(status || '').toUpperCase();
  return s === 'ACTIVE' || s === 'CANCELLED';
}
