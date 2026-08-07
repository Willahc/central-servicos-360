import { Router, Request, Response } from 'express';
import { requestRepository } from '../../database';
import { NotFoundError, ValidationError } from '../../common/errors/AppError';
import { validate } from '../../middleware/validate';
import { authorize } from '../../middleware/auth';
import { createMobilidadeAccessSchema, requestVoucherSchema } from '../../common/validation-schemas';

const router = Router();

// Mock: Dados de corridas de mobilidade
const mockRides = [
  {
    id: 'RID-5501',
    passenger: 'Carlos Andrade',
    date: '2026-08-01 22:45',
    origin: 'Unidade Paulista',
    destination: 'Residência Fictícia',
    cost: 48.50,
    provider: 'Uber for Business',
    costCenter: 'CC-3021',
    policyFlag: true,
    flagReason: 'Corrida em horário noturno fora de viagem ativa (Requer validação no faturamento)'
  },
  {
    id: 'RID-5502',
    passenger: 'Fernanda Lima',
    date: '2026-07-28 14:10',
    origin: 'Unidade Paulista',
    destination: 'Aeroporto de Congonhas',
    cost: 35.00,
    provider: 'Táxi Digital',
    costCenter: 'CC-1010',
    policyFlag: false,
    flagReason: null
  },
  {
    id: 'RID-5503',
    passenger: 'Roberto Silva',
    date: '2026-07-25 09:30',
    origin: 'Aeroporto Santos Dumont',
    destination: 'Hotel Fictício RJ',
    cost: 42.10,
    provider: 'Uber for Business',
    costCenter: 'CC-2005',
    policyFlag: false,
    flagReason: null
  }
];

// GET /api/mobilidade/rides - Listar corridas realizadas
router.get('/rides', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: mockRides,
    total: mockRides.length
  });
});

// GET /api/mobilidade/rides/:id - Detalhes de uma corrida
router.get('/rides/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const ride = mockRides.find(r => r.id === id);

  if (!ride) {
    throw new NotFoundError('Corrida');
  }

  res.json({
    success: true,
    data: ride
  });
});

// POST /api/mobilidade/access-requests - Solicitar acesso/ajuste
router.post('/access-requests', authorize('colaborador', 'administrador'), validate(createMobilidadeAccessSchema), async (req: Request, res: Response) => {
  const { serviceType, title, requesterId, requesterName, costCenter, details } = req.body;

  const newRequest = {
    id: requestRepository.generateId('SOL'),
    serviceType: (serviceType || 'mobilidade') as 'viagem' | 'mobilidade' | 'correios' | 'xerox',
    title: title || 'Solicitação de acesso mobilidade',
    requesterId,
    requesterName,
    costCenter,
    status: 'PENDENTE_APROVACAO' as const,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    urgent: false,
    details: details || {},
    history: [
      {
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        action: 'Solicitação de acesso mobilidade criada.',
        user: requesterName
      }
    ]
  };

  await requestRepository.create(newRequest);

  res.status(201).json({
    success: true,
    data: newRequest,
    message: 'Solicitação de acesso criada com sucesso'
  });
});

// GET /api/mobilidade/limits - Consultar limites mensais
router.get('/limits', async (req: Request, res: Response) => {
  const limits = [
    { userId: 'USR-001', userName: 'Carlos Andrade', monthlyLimit: 500.00, currentUsage: 48.50, remaining: 451.50 },
    { userId: 'USR-002', userName: 'Fernanda Lima', monthlyLimit: 500.00, currentUsage: 35.00, remaining: 465.00 },
    { userId: 'USR-007', userName: 'Roberto Silva', monthlyLimit: 500.00, currentUsage: 42.10, remaining: 457.90 }
  ];

  res.json({
    success: true,
    data: limits
  });
});

// POST /api/mobilidade/voucher - Solicitar voucher
router.post('/voucher', authorize('colaborador', 'administrador'), validate(requestVoucherSchema), async (req: Request, res: Response) => {
  const { userEmail, costCenter, reason } = req.body;

  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const voucher = {
    voucherCode: `UBER-HSL-${randomCode}`,
    qrCodeUrl: `https://mock.siriolibanes.org.br/vouchers/uber/${randomCode}.png`,
    userEmail: userEmail || 'colaborador@ficticio.org',
    costCenter: costCenter || 'CC-4000',
    reason: reason || 'Deslocamento',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  res.json({
    success: true,
    data: voucher,
    message: 'Voucher gerado com sucesso'
  });
});

export default router;
