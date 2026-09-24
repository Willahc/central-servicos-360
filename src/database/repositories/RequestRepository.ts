import { BaseEntity, BaseRepository } from './BaseRepository';

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

export interface HistoryEvent {
  date: string;
  action: string;
  user: string;
}

export interface ServiceRequest extends BaseEntity {
  serviceType: ServiceFront;
  title: string;
  requesterId: string;
  requesterName: string;
  costCenter: string;
  status: RequestStatus;
  urgent: boolean;
  details: Record<string, unknown>;
  history: HistoryEvent[];
}

export class RequestRepository extends BaseRepository<ServiceRequest> {
  async findByStatus(status: RequestStatus): Promise<ServiceRequest[]> {
    return Array.from(this.data.values()).filter(req => req.status === status);
  }

  async findByServiceType(serviceType: ServiceFront): Promise<ServiceRequest[]> {
    return Array.from(this.data.values()).filter(req => req.serviceType === serviceType);
  }

  async findByRequester(requesterId: string): Promise<ServiceRequest[]> {
    return Array.from(this.data.values()).filter(req => req.requesterId === requesterId);
  }

  async findByFilters(filters: {
    status?: RequestStatus;
    serviceType?: ServiceFront;
    requesterId?: string;
  }): Promise<ServiceRequest[]> {
    return Array.from(this.data.values()).filter(req => {
      if (filters.status && req.status !== filters.status) return false;
      if (filters.serviceType && req.serviceType !== filters.serviceType) return false;
      if (filters.requesterId && req.requesterId !== filters.requesterId) return false;
      return true;
    });
  }

  async addHistoryEvent(id: string, event: Omit<HistoryEvent, 'date'>): Promise<ServiceRequest | null> {
    const request = this.data.get(id);
    if (!request) return null;

    const newEvent: HistoryEvent = {
      ...event,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    request.history.push(newEvent);
    request.updatedAt = newEvent.date;
    return request;
  }

  async updateStatus(id: string, newStatus: RequestStatus, user: string, action: string): Promise<ServiceRequest | null> {
    const request = await this.update(id, { status: newStatus });
    if (!request) return null;

    await this.addHistoryEvent(id, { action, user });
    return request;
  }
}