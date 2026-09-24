import { Request } from 'express';
import { ForbiddenError } from './errors/AppError';
import { ServiceRequest } from './interfaces/service-request.interface';
import { hasServiceScope } from './authorization';

export function canReadRequest(req: Request, item: ServiceRequest): boolean {
  const user = req.user!;
  if (user.role === 'ADMINISTRADOR') return true;
  if (user.role === 'COLABORADOR') return item.requesterId === user.id;
  if (user.role === 'AGENTE_SERVICO') {
    return hasServiceScope({ role: 'AGENTE_SERVICO', serviceScopes: user.serviceScopes }, item.serviceType)
      && ['APROVADO', 'EM_ATENDIMENTO', 'CONCLUIDO'].includes(item.status);
  }
  return false;
}

export function assertCanReadRequest(req: Request, item: ServiceRequest): void {
  if (!canReadRequest(req, item)) throw new ForbiddenError('Solicitação fora do escopo do usuário autenticado');
}

export function assertRequestOwnerOrAdmin(req: Request, item: ServiceRequest): void {
  if (req.user!.role !== 'ADMINISTRADOR' && item.requesterId !== req.user!.id) {
    throw new ForbiddenError('Solicitação não pertence ao colaborador autenticado');
  }
}
