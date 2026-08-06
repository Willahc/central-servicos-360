export type ServiceFront = 'viagem' | 'mobilidade' | 'correios' | 'xerox';

export type RequestStatus =
  | 'RASCUNHO'
  | 'PENDENTE_APROVACAO'
  | 'APROVADO'
  | 'EM_ATENDIMENTO'
  | 'CONCLUIDO'
  | 'REJEITADO'
  | 'CANCELADO';

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
