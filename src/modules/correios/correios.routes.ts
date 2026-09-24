import { Router, Request, Response } from 'express';
import { requestRepository } from '../../database';
import { NotFoundError, ValidationError } from '../../common/errors/AppError';
import { validate } from '../../middleware/validate';
import { authorize, authorizeService } from '../../middleware/auth';
import { assertCanReadRequest } from '../../common/request-access';
import { createCorreioSchema, updateCorreioUsageTypeSchema } from '../../common/validation-schemas';

const router = Router();

// GET /api/correios - Listar pedidos de envio
router.get('/', authorize('AGENTE_SERVICO', 'ADMINISTRADOR'), authorizeService('correios'), async (req: Request, res: Response) => {
  const correios = await requestRepository.findByServiceType('correios');

  res.json({
    success: true,
    data: correios,
    total: correios.length
  });
});

// GET /api/correios/:id - Detalhes do envio
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const correio = await requestRepository.findById(id);

  if (!correio || correio.serviceType !== 'correios') {
    throw new NotFoundError('Solicitação de correios');
  }
  assertCanReadRequest(req, correio);

  res.json({
    success: true,
    data: correio
  });
});

// POST /api/correios - Criar nova solicitação de postagem
router.post('/', authorize('colaborador', 'administrador'), validate(createCorreioSchema), async (req: Request, res: Response) => {
  const { title, details } = req.body;
  const { id: requesterId, name: requesterName, costCenter } = req.user!;

  const newRequest = {
    id: requestRepository.generateId('SOL'),
    serviceType: 'correios' as const,
    title,
    requesterId,
    requesterName,
    costCenter,
    status: 'PENDENTE_APROVACAO' as const,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    urgent: details?.urgencyRationale ? true : false,
    details: details || {},
    history: [
      {
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        action: 'Solicitação de postagem criada.',
        user: requesterName
      }
    ]
  };

  await requestRepository.create(newRequest);

  res.status(201).json({
    success: true,
    data: newRequest,
    message: 'Solicitação de postagem criada com sucesso'
  });
});

// GET /api/correios/:id/tracking - Consultar rastreamento
router.get('/:id/tracking', async (req: Request, res: Response) => {
  const { id } = req.params;
  const correio = await requestRepository.findById(id);

  if (!correio || correio.serviceType !== 'correios') {
    throw new NotFoundError('Solicitação de correios');
  }
  assertCanReadRequest(req, correio);

  const tracking = {
    requestId: correio.id,
    trackingCode: correio.details.trackingCode || 'BR987654321SB',
    status: correio.status === 'EM_ATENDIMENTO' ? 'Em trânsito' : 'Aguardando coleta',
    events: [
      {
        date: correio.createdAt,
        location: 'Unidade de Origem',
        status: 'Objeto postado'
      }
    ],
    estimatedDelivery: '2026-08-03'
  };

  res.json({
    success: true,
    data: tracking
  });
});

// PUT /api/correios/:id/usage-type - Definir modalidade
router.put('/:id/usage-type', authorize('colaborador', 'administrador', 'faturamento'), validate(updateCorreioUsageTypeSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { usageType } = req.body;

  const correio = await requestRepository.findById(id);

  if (!correio || correio.serviceType !== 'correios') {
    throw new NotFoundError('Solicitação de correios');
  }
  assertCanReadRequest(req, correio);

  const updatedDetails = { ...correio.details, usageType };
  await requestRepository.update(id, { details: updatedDetails });

  await requestRepository.addHistoryEvent(id, {
    action: `Modalidade de uso alterada para: ${usageType}`,
    user: 'Sistema'
  });

  res.json({
    success: true,
    message: 'Modalidade de uso atualizada com sucesso'
  });
});

export default router;
