import { Router, Request, Response } from 'express';
import { requestRepository } from '../../database';
import { NotFoundError, ValidationError } from '../../common/errors/AppError';
import { validate } from '../../middleware/validate';
import { authorize } from '../../middleware/auth';
import { validateTransition, validateTransitionRole, getAllowedTransitions } from '../../common/state-machine';
import {
  createRequestSchema,
  updateRequestSchema,
  submitRequestSchema,
  requestsQuerySchema
} from '../../common/validation-schemas';

const router = Router();

// GET /api/requests - Listar solicitações com filtros
router.get('/', validate(requestsQuerySchema), async (req: Request, res: Response) => {
  const { status, serviceType, requesterId } = req.query;

  const filters: {
    status?: 'RASCUNHO' | 'PENDENTE_APROVACAO' | 'APROVADO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'REJEITADO' | 'CANCELADO';
    serviceType?: 'viagem' | 'mobilidade' | 'correios' | 'xerox';
    requesterId?: string;
  } = {};

  if (status) filters.status = status as 'RASCUNHO' | 'PENDENTE_APROVACAO' | 'APROVADO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'REJEITADO' | 'CANCELADO';
  if (serviceType) filters.serviceType = serviceType as 'viagem' | 'mobilidade' | 'correios' | 'xerox';
  if (requesterId) filters.requesterId = requesterId as string;

  const requests = await requestRepository.findByFilters(filters);

  res.json({
    success: true,
    data: requests,
    total: requests.length
  });
});

// GET /api/requests/:id - Detalhar solicitação
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const request = await requestRepository.findById(id);

  if (!request) {
    throw new NotFoundError('Solicitação');
  }

  // Incluir transições permitidas na resposta
  const allowedTransitions = getAllowedTransitions(request.status);

  res.json({
    success: true,
    data: {
      ...request,
      allowedTransitions
    }
  });
});

// POST /api/requests - Criar nova solicitação
router.post('/', authorize('colaborador', 'administrador'), validate(createRequestSchema), async (req: Request, res: Response) => {
  const { serviceType, title, requesterId, requesterName, costCenter, urgent, details, status } = req.body;

  const newRequest = {
    id: requestRepository.generateId('SOL'),
    serviceType: serviceType as 'viagem' | 'mobilidade' | 'correios' | 'xerox',
    title,
    requesterId,
    requesterName,
    costCenter,
    status: 'RASCUNHO' as const,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    urgent: urgent || false,
    details: details || {},
    history: [
      {
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        action: 'Solicitação criada.',
        user: requesterName
      }
    ]
  };

  await requestRepository.create(newRequest);

  res.status(201).json({
    success: true,
    data: newRequest
  });
});

// PUT /api/requests/:id/submit - Enviar para aprovação
router.put('/:id/submit', authorize('colaborador', 'administrador'), validate(submitRequestSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const request = await requestRepository.findById(id);

  if (!request) {
    throw new NotFoundError('Solicitação');
  }

  // R5: Usar máquina de estados centralizada
  validateTransition(request.status, 'PENDENTE_APROVACAO');

  const updatedRequest = await requestRepository.updateStatus(
    id,
    'PENDENTE_APROVACAO',
    request.requesterName,
    'Solicitação enviada para aprovação do gestor.'
  );

  res.json({
    success: true,
    data: updatedRequest
  });
});

// PUT /api/requests/:id/transition - Transição genérica de status
router.put('/:id/transition', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { targetStatus, user } = req.body;

  if (!targetStatus) {
    throw new ValidationError('targetStatus é obrigatório');
  }

  const request = await requestRepository.findById(id);
  if (!request) {
    throw new NotFoundError('Solicitação');
  }

  // R5: Validar transição de estado
  validateTransition(request.status, targetStatus);

  // R5: Validar autorização do perfil para esta transição
  const role = req.user?.role || 'colaborador';
  validateTransitionRole(request.status, targetStatus, role);

  const updatedRequest = await requestRepository.updateStatus(
    id,
    targetStatus,
    user || req.user?.name || 'Sistema',
    `Transição: ${request.status} → ${targetStatus}`
  );

  res.json({
    success: true,
    data: updatedRequest
  });
});

// GET /api/requests/:id/history - Obter histórico
router.get('/:id/history', async (req: Request, res: Response) => {
  const { id } = req.params;
  const request = await requestRepository.findById(id);

  if (!request) {
    throw new NotFoundError('Solicitação');
  }

  res.json({
    success: true,
    data: request.history
  });
});

// DELETE /api/requests/:id - Cancelar solicitação
router.delete('/:id', authorize('colaborador', 'administrador'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const request = await requestRepository.findById(id);

  if (!request) {
    throw new NotFoundError('Solicitação');
  }

  // R5: Usar máquina de estados centralizada
  validateTransition(request.status, 'CANCELADO');

  const updatedRequest = await requestRepository.updateStatus(
    id,
    'CANCELADO',
    request.requesterName,
    'Solicitação cancelada pelo solicitante.'
  );

  res.json({
    success: true,
    data: updatedRequest,
    message: 'Solicitação cancelada com sucesso'
  });
});

export default router;
