import { Router, Request, Response } from 'express';
import { NotFoundError, ValidationError } from '../../common/errors/AppError';
import { validate } from '../../middleware/validate';
import { authorize } from '../../middleware/auth';
import { createTicketSchema, resolveTicketSchema, escalateTicketSchema, ticketsQuerySchema } from '../../common/validation-schemas';

const router = Router();

// Mock: Dados de chamados
const mockTickets = [
  {
    id: 'TICK-101',
    title: 'Dúvida sobre franquia de bagagem adicional',
    requester: 'Carlos Andrade',
    category: 'Viagens',
    status: 'EM_ABERTO',
    priority: 'Média',
    createdAt: '2026-08-04 14:20',
    updatedAt: '2026-08-04 14:20',
    description: 'Gostaria de saber como solicitar franquia de bagagem adicional para viagem internacional.',
    assignedTo: null,
    resolution: null
  },
  {
    id: 'TICK-102',
    title: 'Solicitação de limite emergencial Uber plantão',
    requester: 'Mariana Costa',
    category: 'Mobilidade',
    status: 'RESOLVIDO',
    priority: 'Alta',
    createdAt: '2026-08-01 09:10',
    updatedAt: '2026-08-01 15:30',
    description: 'Preciso de aumento temporário do limite mensal para deslocamentos emergenciais em plantão.',
    assignedTo: 'Maria Catarina',
    resolution: 'Limite aumentado temporariamente conforme política de emergência.'
  }
];

// GET /api/tickets - Listar chamados
router.get('/', validate(ticketsQuerySchema), async (req: Request, res: Response) => {
  const { status, category } = req.query;

  let filteredTickets = mockTickets;

  if (status) {
    filteredTickets = filteredTickets.filter(t => t.status === status);
  }

  if (category) {
    filteredTickets = filteredTickets.filter(t => t.category === category);
  }

  res.json({
    success: true,
    data: filteredTickets,
    total: filteredTickets.length
  });
});

// GET /api/tickets/:id - Detalhes do chamado
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const ticket = mockTickets.find(t => t.id === id);

  if (!ticket) {
    throw new NotFoundError('Chamado');
  }

  res.json({
    success: true,
    data: ticket
  });
});

// POST /api/tickets - Abrir novo chamado
router.post('/', validate(createTicketSchema), async (req: Request, res: Response) => {
  const { title, requester, category, priority, description } = req.body;

  const newTicket = {
    id: `TICK-${Date.now()}`,
    title,
    requester,
    category,
    status: 'EM_ABERTO',
    priority: priority || 'Média',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    description,
    assignedTo: null,
    resolution: null
  };

  mockTickets.push(newTicket);

  res.status(201).json({
    success: true,
    data: newTicket,
    message: 'Chamado aberto com sucesso'
  });
});

// PUT /api/tickets/:id/resolve - Marcar como resolvido
router.put('/:id/resolve', authorize('faturamento', 'coordenadora', 'administrador'), validate(resolveTicketSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { resolution, assignedTo } = req.body;

  const ticket = mockTickets.find(t => t.id === id);

  if (!ticket) {
    throw new NotFoundError('Chamado');
  }

  if (ticket.status === 'RESOLVIDO') {
    throw new ValidationError('Chamado já está resolvido');
  }

  ticket.status = 'RESOLVIDO';
  ticket.resolution = resolution;
  ticket.assignedTo = assignedTo;
  ticket.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

  res.json({
    success: true,
    data: ticket,
    message: 'Chamado resolvido com sucesso'
  });
});

// PUT /api/tickets/:id/escalate - Escalonar chamado
router.put('/:id/escalate', validate(escalateTicketSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const ticket = mockTickets.find(t => t.id === id);

  if (!ticket) {
    throw new NotFoundError('Chamado');
  }

  if (ticket.status !== 'EM_ABERTO') {
    throw new ValidationError('Apenas chamados em aberto podem ser escalonados');
  }

  ticket.priority = 'Alta';
  ticket.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

  res.json({
    success: true,
    data: ticket,
    message: `Chamado escalonado com sucesso. Motivo: ${reason}`
  });
});

export default router;
