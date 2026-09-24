import { Router, Request, Response } from 'express';
import { requestRepository } from '../../database';
import { NotFoundError, ValidationError } from '../../common/errors/AppError';
import { validateTransition } from '../../common/state-machine';
import { authorize, authorizeService } from '../../middleware/auth';
import { assertCanReadRequest } from '../../common/request-access';

const router = Router();

// Mock: Dados de bilhetes não voados
const mockNonFlownTickets = [
  {
    id: 'TKT-99420',
    passenger: 'Solicitante Exemplo A',
    airline: 'LATAM',
    ticketNumber: '045-2345678901',
    originalDate: '2026-03-10',
    originalRoute: 'GRU-BSB',
    originalAmount: 850.00,
    creditBalance: 450.00,
    expiresAt: '2026-11-30',
    status: 'DISPONIVEL'
  },
  {
    id: 'TKT-88112',
    passenger: 'Solicitante Exemplo B',
    airline: 'GOL',
    ticketNumber: '127-9876543210',
    originalDate: '2026-04-15',
    originalRoute: 'CGH-SDU',
    originalAmount: 620.00,
    creditBalance: 620.00,
    expiresAt: '2026-10-15',
    status: 'DISPONIVEL'
  },
  {
    id: 'TKT-77341',
    passenger: 'Viajante Simulado',
    airline: 'AZUL',
    ticketNumber: '577-4561237890',
    originalDate: '2026-01-20',
    originalRoute: 'VCP-CNF',
    originalAmount: 1100.00,
    creditBalance: 0.00,
    expiresAt: '2026-06-30',
    status: 'UTILIZADO'
  }
];

// GET /api/viagens - Listar solicitações de viagem
router.get('/', authorize('AGENTE_SERVICO', 'ADMINISTRADOR'), authorizeService('viagem'), async (req: Request, res: Response) => {
  const viagens = await requestRepository.findByServiceType('viagem');

  res.json({
    success: true,
    data: viagens,
    total: viagens.length
  });
});

// GET /api/viagens/:id - Detalhes da viagem
router.get('/:id(SOL-[A-Za-z0-9-]+)', async (req: Request, res: Response) => {
  const { id } = req.params;
  const viagem = await requestRepository.findById(id);

  if (!viagem || viagem.serviceType !== 'viagem') {
    throw new NotFoundError('Solicitação de viagem');
  }
  assertCanReadRequest(req, viagem);

  res.json({
    success: true,
    data: viagem
  });
});

// GET /api/viagens/:id/itinerary - Dados do itinerário
router.get('/:id/itinerary', async (req: Request, res: Response) => {
  const { id } = req.params;
  const viagem = await requestRepository.findById(id);

  if (!viagem || viagem.serviceType !== 'viagem') {
    throw new NotFoundError('Solicitação de viagem');
  }
  assertCanReadRequest(req, viagem);

  const itinerary = {
    requestId: viagem.id,
    origin: viagem.details.origin,
    destination: viagem.details.destination,
    departureDate: viagem.details.departureDate,
    returnDate: viagem.details.returnDate,
    reason: viagem.details.reason,
    needsHotel: viagem.details.needsHotel,
    needsMobility: viagem.details.needsMobility,
    insuranceRequested: viagem.details.insuranceRequested,
    estimatedCost: viagem.details.estimatedCost,
    nonFlownCreditUsed: viagem.details.nonFlownCreditUsed,
    status: viagem.status
  };

  res.json({
    success: true,
    data: itinerary
  });
});

// GET /api/non-flown-tickets - Listar bilhetes não voados
router.get('/non-flown-tickets', authorize('AGENTE_SERVICO', 'ADMINISTRADOR'), authorizeService('viagem'), async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: mockNonFlownTickets,
    total: mockNonFlownTickets.length
  });
});

// PUT /api/non-flown-tickets/:id/apply - Aplicar crédito a viagem
router.put('/non-flown-tickets/:id/apply', authorize('operador', 'administrador'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { requestId } = req.body;

  const ticket = mockNonFlownTickets.find(t => t.id === id);

  if (!ticket) {
    throw new NotFoundError('Bilhete não voados');
  }

  if (ticket.status !== 'DISPONIVEL') {
    throw new NotFoundError('Crédito não disponível para uso');
  }

  ticket.status = 'UTILIZADO';
  ticket.creditBalance = 0;

  res.json({
    success: true,
    data: ticket,
    message: 'Crédito aplicado com sucesso à viagem'
  });
});

// GET /api/viagens/:id/insurance - Status do seguro viagem
router.get('/:id/insurance', async (req: Request, res: Response) => {
  const { id } = req.params;
  const viagem = await requestRepository.findById(id);

  if (!viagem || viagem.serviceType !== 'viagem') {
    throw new NotFoundError('Solicitação de viagem');
  }
  assertCanReadRequest(req, viagem);

  const insurance = {
    requestId: viagem.id,
    requested: viagem.details.insuranceRequested || false,
    status: viagem.details.insuranceRequested ? 'Solicitado' : 'Não solicitado',
    provider: 'Seguradora Mock (Simulado)',
    policyNumber: viagem.details.insuranceRequested ? `POL-${viagem.id}-${Date.now()}` : null,
    coverage: viagem.details.insuranceRequested ? 'Nacional/Internacional' : null
  };

  res.json({
    success: true,
    data: insurance
  });
});

// PUT /api/viagens/:id/start - Iniciar atendimento da viagem (APROVADO → EM_ATENDIMENTO)
router.put('/:id/start', authorize('AGENTE_SERVICO', 'ADMINISTRADOR'), authorizeService('viagem'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const viagem = await requestRepository.findById(id);

  if (!viagem || viagem.serviceType !== 'viagem') {
    throw new NotFoundError('Solicitação de viagem');
  }

  validateTransition(viagem.status, 'EM_ATENDIMENTO');

  const updated = await requestRepository.updateStatus(
    id,
    'EM_ATENDIMENTO',
    req.user?.name || 'Sistema',
    'Viagem iniciada pela equipe de viagens.'
  );

  res.json({
    success: true,
    data: updated,
    message: 'Viagem em atendimento'
  });
});

// PUT /api/viagens/:id/complete - Concluir viagem (EM_ATENDIMENTO → CONCLUIDO)
router.put('/:id/complete', authorize('AGENTE_SERVICO', 'ADMINISTRADOR'), authorizeService('viagem'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const viagem = await requestRepository.findById(id);

  if (!viagem || viagem.serviceType !== 'viagem') {
    throw new NotFoundError('Solicitação de viagem');
  }

  validateTransition(viagem.status, 'CONCLUIDO');

  const updated = await requestRepository.updateStatus(
    id,
    'CONCLUIDO',
    req.user?.name || 'Sistema',
    'Viagem concluída com sucesso.'
  );

  res.json({
    success: true,
    data: updated,
    message: 'Viagem concluída'
  });
});

export default router;
