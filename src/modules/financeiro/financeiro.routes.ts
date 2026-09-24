import { Router, Request, Response } from 'express';
import { requestRepository } from '../../database';
import { NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import { validate } from '../../middleware/validate';
import { authorize } from '../../middleware/auth';
import { exportFinanceSchema } from '../../common/validation-schemas';

const router = Router();

// ============================================================
// DADOS DEMONSTRATIVOS CENTRALIZADOS
// ============================================================
// Todos os valores abaixo são fictícios para demonstração.
// NÃO representam centros de custo, gestores ou valores reais.

const MOCK_COST_CENTERS = [
  { code: 'CC-DEMO-01', name: 'Área Assistencial A', manager: 'Gestor Exemplo A' },
  { code: 'CC-DEMO-02', name: 'Área Administrativa B', manager: 'Gestor Exemplo B' },
  { code: 'CC-DEMO-03', name: 'Área Operacional C', manager: 'Gestor Exemplo C' },
  { code: 'CC-DEMO-04', name: 'Área de Suporte D', manager: 'Gestor Exemplo D' },
  { code: 'CC-DEMO-05', name: 'Área Técnica E', manager: 'Gestor Exemplo E' },
  { code: 'CC-DEMO-06', name: 'Área de Ensino F', manager: 'Gestor Exemplo F' }
];

// ============================================================
// MAPEAMENTO GESTOR → CC DEMONSTRATIVO
// ============================================================
// Vínculo explícito para o perfil gestor.
// Cada email de gestor está vinculado a um único CC.
// Documentação: O vínculo é exclusivamente demonstrativo.

const GESTOR_CC_MAP: Record<string, string> = {
  'fernanda.lima@ficticio.org': 'CC-DEMO-02',
  'exemplo.b@ficticio.org': 'CC-DEMO-02'
};

// ============================================================
// MATRIZ DE AUTORIZAÇÃO — MÓDULO FINANCEIRO
// ============================================================
// Roles autorizadas a acessar dados financeiros:
const ROLES_WITH_FINANCE_ACCESS = [
  'GESTOR_APROVADOR', 'ADMINISTRADOR'
];

// Roles que podem visualizar dados consolidados (todos CC):
const ROLES_CONSOLIDATED_VIEW = [
  'ADMINISTRADOR'
];

// Roles que podem exportar:
const ROLES_EXPORT = ['ADMINISTRADOR'];

// ============================================================
// HELPER: verificar acesso do usuário
// ============================================================
function requireFinanceAccess(req: Request): void {
  const role = req.user?.role;
  if (!role || !ROLES_WITH_FINANCE_ACCESS.includes(role)) {
    throw new ForbiddenError('Perfil de usuário não autorizado para acessar dados financeiros');
  }
}

function getUserCostCenter(req: Request): string | null {
  const role = req.user?.role;
  const email = req.user?.email;
  const userCc = (req.user as any)?.costCenter;

  if (role === 'GESTOR_APROVADOR') {
    if (userCc) return userCc;
    if (email && GESTOR_CC_MAP[email]) return GESTOR_CC_MAP[email];
    return 'CC-DEMO-02';
  }
  return null;
}

function isConsolidatedView(role: string): boolean {
  return ROLES_CONSOLIDATED_VIEW.includes(role);
}

// ============================================================
// GET /api/finance/cost-centers
// ============================================================
// colaborador → 403
// gestor → somente CC próprio
// demais autorizados → todos CC conforme RBAC

router.get('/cost-centers', async (req: Request, res: Response) => {
  requireFinanceAccess(req);

  const role = req.user!.role;
  const requests = await requestRepository.findAll();
  const userCC = getUserCostCenter(req);

  let centersToReturn = MOCK_COST_CENTERS;

  // Gestor só enxerga seu próprio CC
  if (role === 'GESTOR_APROVADOR' && userCC) {
    centersToReturn = MOCK_COST_CENTERS.filter(cc => cc.code === userCC);
  }

  const costCentersWithStats = centersToReturn.map(cc => {
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

// ============================================================
// GET /api/finance/cost-centers/:code/summary
// ============================================================
// colaborador → 403
// gestor → somente CC próprio
// demais → qualquer CC

router.get('/cost-centers/:code/summary', async (req: Request, res: Response) => {
  requireFinanceAccess(req);

  const { code } = req.params;
  const role = req.user!.role;
  const userCC = getUserCostCenter(req);

  // Gestor só pode acessar seu próprio CC
  if (role === 'GESTOR_APROVADOR' && userCC && code !== userCC) {
    throw new ForbiddenError('Perfil de usuário não autorizado para acessar este centro de custo');
  }

  const requests = await requestRepository.findAll();
  const ccRequests = requests.filter(r => r.costCenter === code);
  const costCenter = MOCK_COST_CENTERS.find(cc => cc.code === code);

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

// ============================================================
// GET /api/finance/cost-centers/:code/requests
// ============================================================
// colaborador → 403
// gestor → somente CC próprio
// demais → qualquer CC

router.get('/cost-centers/:code/requests', async (req: Request, res: Response) => {
  requireFinanceAccess(req);

  const { code } = req.params;
  const role = req.user!.role;
  const userCC = getUserCostCenter(req);

  if (role === 'GESTOR_APROVADOR' && userCC && code !== userCC) {
    throw new ForbiddenError('Perfil de usuário não autorizado para acessar este centro de custo');
  }

  const requests = await requestRepository.findAll();
  const ccRequests = requests.filter(r => r.costCenter === code);

  res.json({
    success: true,
    data: ccRequests,
    total: ccRequests.length
  });
});

// ============================================================
// GET /api/finance/conciliation
// ============================================================
// colaborador → 403
// gestor → conciliação do CC próprio
// demais → conciliação consolidada

router.get('/conciliation', async (req: Request, res: Response) => {
  requireFinanceAccess(req);

  const role = req.user!.role;
  const requests = await requestRepository.findAll();

  if (role === 'GESTOR_APROVADOR') {
    const userCC = getUserCostCenter(req);
    const ccRequests = userCC ? requests.filter(r => r.costCenter === userCC) : [];
    const conciliation = {
      lastSync: '2026-08-06 08:00:00',
      status: 'Concluído',
      pendingItems: ccRequests.filter(r => r.status === 'PENDENTE_APROVACAO').length,
      totalProcessed: ccRequests.length,
      errors: 0,
      scope: 'CC próprio'
    };
    return res.json({ success: true, data: conciliation });
  }

  const conciliation = {
    lastSync: '2026-08-06 08:00:00',
    status: 'Concluído',
    pendingItems: requests.filter(r => r.status === 'PENDENTE_APROVACAO').length,
    totalProcessed: requests.length,
    errors: 0,
    scope: 'Consolidado'
  };

  res.json({
    success: true,
    data: conciliation
  });
});

// ============================================================
// GET /api/finance/alerts
// ============================================================
// Alertas demonstrativos derivados do dataset.

router.get('/alerts', async (req: Request, res: Response) => {
  requireFinanceAccess(req);

  const role = req.user!.role;
  const requests = await requestRepository.findAll();
  const userCC = getUserCostCenter(req);

  let scopedRequests = requests;
  if (role === 'GESTOR_APROVADOR' && userCC) {
    scopedRequests = requests.filter(r => r.costCenter === userCC);
  }

  const alerts = [];
  const pendingCount = scopedRequests.filter(r => r.status === 'PENDENTE_APROVACAO').length;
  if (pendingCount > 0) {
    alerts.push({
      type: 'pendencia',
      severity: 'atencao',
      message: `${pendingCount} solicitação(ões) aguardando conciliação`,
      timestamp: '2026-08-06 08:00:00'
    });
  }

  const urgentCount = scopedRequests.filter(r => r.urgent).length;
  if (urgentCount > 0) {
    alerts.push({
      type: 'desvio',
      severity: 'informativo',
      message: `${urgentCount} solicitação(ões) marcada(s) como urgente(s) no período`,
      timestamp: '2026-08-06 08:00:00'
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: 'informativo',
      severity: 'informativo',
      message: 'Nenhuma pendência financeira encontrada neste cenário demonstrativo.',
      timestamp: '2026-08-06 08:00:00'
    });
  }

  res.json({
    success: true,
    data: alerts
  });
});

// ============================================================
// POST /api/finance/export
// ============================================================
// Restrito a financeiro e administrador.

router.post('/export', authorize(...ROLES_EXPORT), validate(exportFinanceSchema), async (req: Request, res: Response) => {
  const { costCenter, startDate, endDate } = req.body;

  const exportResult = {
    exportId: `EXP-${Date.now()}`,
    costCenter: costCenter || 'Todos',
    period: `${startDate || '2026-07-01'} a ${endDate || '2026-08-06'}`,
    recordsExported: 12,
    status: 'Concluído (Demonstrativo)',
    erpTarget: 'ERP corporativo — integração pendente de validação técnica',
    fileUrl: `https://mock.example.org/exports/finance_${Date.now()}.csv`
  };

  res.json({
    success: true,
    data: exportResult,
    message: 'Dados exportados com sucesso (demonstrativo)'
  });
});

export default router;
