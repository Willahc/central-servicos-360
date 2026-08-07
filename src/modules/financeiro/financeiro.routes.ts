import { Router, Request, Response } from 'express';
import { requestRepository } from '../../database';
import { NotFoundError } from '../../common/errors/AppError';
import { validate } from '../../middleware/validate';
import { authorize } from '../../middleware/auth';
import { exportFinanceSchema } from '../../common/validation-schemas';

const router = Router();

// Mock: Dados de centros de custo
const mockCostCenters = [
  { code: 'CC-1010', name: 'Diretoria Médica', manager: 'Fernanda Lima' },
  { code: 'CC-2005', name: 'Controladoria & Finanças', manager: 'Roberto Silva' },
  { code: 'CC-3021', name: 'Enfermagem Assistencial', manager: 'Mariana Costa' },
  { code: 'CC-4000', name: 'Infraestrutura & Supply Chain', manager: 'Renata Monteiro' },
  { code: 'CC-5001', name: 'Tecnologia da Informação', manager: 'Patrícia Souza' },
  { code: 'CC-6012', name: 'Ensino e Pesquisa', manager: 'Dr. Eduardo Ramos' }
];

// GET /api/finance/cost-centers - Listar centros de custo
router.get('/cost-centers', async (req: Request, res: Response) => {
  const requests = await requestRepository.findAll();

  const costCentersWithStats = mockCostCenters.map(cc => {
    const ccRequests = requests.filter(r => r.costCenter === cc.code);
    return {
      ...cc,
      requestCount: ccRequests.length,
      totalEstimatedCost: ccRequests.reduce((sum, r) => sum + ((r.details.estimatedCost as number) || 0), 0),
      pendingApprovals: ccRequests.filter(r => r.status === 'PENDENTE_APROVACAO').length,
      status: ccRequests.length > 0 ? 'Ativo' : 'Sem movimentação'
    };
  });

  res.json({
    success: true,
    data: costCentersWithStats
  });
});

// GET /api/finance/cost-centers/:code/summary - Resumo consolidado
router.get('/cost-centers/:code/summary', async (req: Request, res: Response) => {
  const { code } = req.params;
  const requests = await requestRepository.findAll();

  const ccRequests = requests.filter(r => r.costCenter === code);
  const costCenter = mockCostCenters.find(cc => cc.code === code);

  if (!costCenter) {
    throw new NotFoundError('Centro de custo');
  }

  const summary = {
    costCenter: costCenter,
    totalRequests: ccRequests.length,
    byServiceType: {
      viagem: ccRequests.filter(r => r.serviceType === 'viagem').length,
      mobilidade: ccRequests.filter(r => r.serviceType === 'mobilidade').length,
      correios: ccRequests.filter(r => r.serviceType === 'correios').length,
      xerox: ccRequests.filter(r => r.serviceType === 'xerox').length
    },
    byStatus: {
      PENDENTE_APROVACAO: ccRequests.filter(r => r.status === 'PENDENTE_APROVACAO').length,
      APROVADO: ccRequests.filter(r => r.status === 'APROVADO').length,
      EM_ATENDIMENTO: ccRequests.filter(r => r.status === 'EM_ATENDIMENTO').length,
      CONCLUIDO: ccRequests.filter(r => r.status === 'CONCLUIDO').length
    },
    totalEstimatedCost: ccRequests.reduce((sum, r) => sum + ((r.details.estimatedCost as number) || 0), 0)
  };

  res.json({
    success: true,
    data: summary
  });
});

// GET /api/finance/cost-centers/:code/requests - Solicitações do centro de custo
router.get('/cost-centers/:code/requests', async (req: Request, res: Response) => {
  const { code } = req.params;
  const requests = await requestRepository.findAll();

  const ccRequests = requests.filter(r => r.costCenter === code);

  res.json({
    success: true,
    data: ccRequests,
    total: ccRequests.length
  });
});

// GET /api/finance/conciliation - Status de conciliação
router.get('/conciliation', async (req: Request, res: Response) => {
  const conciliation = {
    lastSync: '2026-08-06 08:00:00',
    status: 'Concluído',
    pendingItems: 0,
    totalProcessed: 15,
    errors: 0
  };

  res.json({
    success: true,
    data: conciliation
  });
});

// POST /api/finance/export - Exportar dados para SAP/Senior
router.post('/export', authorize('financeiro', 'administrador'), validate(exportFinanceSchema), async (req: Request, res: Response) => {
  const { costCenter, startDate, endDate } = req.body;

  const exportResult = {
    exportId: `EXP-${Date.now()}`,
    costCenter: costCenter || 'Todos',
    period: `${startDate || '2026-07-01'} a ${endDate || '2026-08-06'}`,
    recordsExported: 12,
    status: 'Concluído (Mock)',
    fileUrl: `https://mock.siriolibanes.org.br/exports/sap_${Date.now()}.csv`
  };

  res.json({
    success: true,
    data: exportResult,
    message: 'Dados exportados com sucesso (simulado)'
  });
});

export default router;
