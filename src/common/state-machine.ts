import { RequestStatus } from '../database/repositories/RequestRepository';
import { ValidationError, ForbiddenError } from '../common/errors/AppError';

/**
 * MÁQUINA DE ESTADOS - Central de Serviços 360
 *
 * Transições permitidas (regra funcional de demonstração):
 *
 *   RASCUNHO ──────────────> PENDENTE_APROVACAO
 *   RASCUNHO ──────────────> CANCELADO
 *   PENDENTE_APROVACAO ────> APROVADO
 *   PENDENTE_APROVACAO ────> REJEITADO
 *   PENDENTE_APROVACAO ────> CANCELADO
 *   APROVADO ──────────────> EM_ATENDIMENTO
 *   EM_ATENDIMENTO ────────> CONCLUIDO
 *
 * Transições inválidas são bloqueadas centralmente.
 */
const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  RASCUNHO: ['PENDENTE_APROVACAO', 'CANCELADO'],
  PENDENTE_APROVACAO: ['APROVADO', 'REJEITADO', 'CANCELADO'],
  APROVADO: ['EM_ATENDIMENTO'],
  EM_ATENDIMENTO: ['CONCLUIDO'],
  CONCLUIDO: [],
  REJEITADO: [],
  CANCELADO: []
};

/**
 * MATRIZ DE AUTORIZAÇÃO POR TRANSIÇÃO (regra funcional de demonstração)
 *
 * Cada transição pode ser executada apenas por perfis específicos.
 * Esta é uma regra de demonstração, NÃO RBAC institucional definitivo.
 *
 * | Transição                      | Roles Permitidos                          |
 * |--------------------------------|-------------------------------------------|
 * | RASCUNHO → PENDENTE_APROVACAO  | colaborador, administrador                 |
 * | RASCUNHO → CANCELADO           | colaborador, administrador                 |
 * | PENDENTE_APROVACAO → APROVADO  | gestor, coordenadora, administrador        |
 * | PENDENTE_APROVACAO → REJEITADO | gestor, coordenadora, administrador        |
 * | PENDENTE_APROVACAO → CANCELADO | colaborador, gestor, coordenadora, administrador |
 * | APROVADO → EM_ATENDIMENTO      | viagens, faturamento, coordenadora, administrador |
 * | EM_ATENDIMENTO → CONCLUIDO     | viagens, faturamento, coordenadora, administrador |
 */
const TRANSITION_ROLES: Record<string, string[]> = {
  'RASCUNHO->PENDENTE_APROVACAO': ['colaborador', 'administrador'],
  'RASCUNHO->CANCELADO': ['colaborador', 'administrador'],
  'PENDENTE_APROVACAO->APROVADO': ['gestor', 'coordenadora', 'administrador'],
  'PENDENTE_APROVACAO->REJEITADO': ['gestor', 'coordenadora', 'administrador'],
  'PENDENTE_APROVACAO->CANCELADO': ['colaborador', 'gestor', 'coordenadora', 'administrador'],
  'APROVADO->EM_ATENDIMENTO': ['viagens', 'faturamento', 'coordenadora', 'administrador'],
  'EM_ATENDIMENTO->CONCLUIDO': ['viagens', 'faturamento', 'coordenadora', 'administrador']
};

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function validateTransition(from: RequestStatus, to: RequestStatus): void {
  if (!canTransition(from, to)) {
    throw new ValidationError(
      `Transição inválida: ${from} → ${to}. ` +
      `Transições permitidas a partir de "${from}": ${ALLOWED_TRANSITIONS[from].join(', ') || 'nenhuma'}`
    );
  }
}

export function validateTransitionRole(from: RequestStatus, to: RequestStatus, role: string): void {
  const key = `${from}->${to}`;
  const allowedRoles = TRANSITION_ROLES[key];
  if (!allowedRoles) {
    throw new ValidationError(`Transição ${from} → ${to} não é permitida`);
  }
  if (!allowedRoles.includes(role)) {
    throw new ForbiddenError(
      `Perfil "${role}" não autorizado para transição ${from} → ${to}. ` +
      `Perfis permitidos: ${allowedRoles.join(', ')}`
    );
  }
}

export function getAllowedTransitions(status: RequestStatus): RequestStatus[] {
  return ALLOWED_TRANSITIONS[status] || [];
}

export function getTransitionRoles(from: RequestStatus, to: RequestStatus): string[] {
  const key = `${from}->${to}`;
  return TRANSITION_ROLES[key] || [];
}

export function getStatusLabel(status: RequestStatus): string {
  const labels: Record<RequestStatus, string> = {
    RASCUNHO: 'Rascunho',
    PENDENTE_APROVACAO: 'Pendente Aprovação',
    APROVADO: 'Aprovado',
    EM_ATENDIMENTO: 'Em Atendimento',
    CONCLUIDO: 'Concluído',
    REJEITADO: 'Rejeitado',
    CANCELADO: 'Cancelado'
  };
  return labels[status] || status;
}
