export type ServiceFront =
  | 'viagem'
  | 'mobilidade'
  | 'transporte'
  | 'estacionamento'
  | 'entregas'
  | 'achados_perdidos'
  | 'solicitacao_imagens'
  | 'investigacao_ocorrencia'
  | 'autorizacao_excepcional'
  | 'liberacao_acesso'
  | 'correios'
  | 'xerox';

export type RequestStatus =
  | 'RASCUNHO'
  | 'PENDENTE_APROVACAO'
  | 'APROVADO'
  | 'EM_ATENDIMENTO'
  | 'CONCLUIDO'
  | 'REJEITADO'
  | 'CANCELADO';

export type ValidationStatus =
  | 'CONFIRMADO_SCREENSHOT'
  | 'IDENTIFICADO_BENCHMARK'
  | 'PENDENTE_LEVANTAMENTO';

export interface EmployeeProfile {
  matricula: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  centroCusto: string;
  gestor: string;
  diretoria: string;
  unidade: string;
}

export interface PolicyDocument {
  id: string;
  title: string;
  service: ServiceFront;
  version: string;
  status: 'VIGENTE' | 'REVOGADO' | 'EM_REVISAO';
  effectiveFrom: string;
  effectiveTo: string | null;
  audience: 'COLABORADOR' | 'GESTOR' | 'OPERADOR' | 'TODOS';
  sourceType: 'DEMONSTRATIVO' | 'INSTITUCIONAL';
  sourceDocument: string | null;
  content: string;
  updatedAt: string;
}

export interface HistoryEvent {
  date: string;
  action: string;
  user: string;
}

export interface ServiceRequest {
  id: string;
  serviceType: ServiceFront;
  title: string;
  requesterId: string;
  requesterName: string;
  costCenter: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  urgent: boolean;
  details: Record<string, unknown>;
  history: HistoryEvent[];
}
