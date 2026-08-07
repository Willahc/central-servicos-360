import { Router, Request, Response } from 'express';
import { requestRepository } from '../../database';

const router = Router();

// GET /api/dashboard/metrics - KPIs consolidados
router.get('/metrics', async (req: Request, res: Response) => {
  const requests = await requestRepository.findAll();
  
  const metrics = {
    totalRequests: requests.length,
    pendingApprovals: requests.filter(r => r.status === 'PENDENTE_APROVACAO').length,
    activeTrips: requests.filter(r => r.serviceType === 'viagem' && r.status === 'APROVADO').length,
    nonFlownTickets: 2, // Mock: Consultar de adapter específico
    byServiceType: {
      viagem: requests.filter(r => r.serviceType === 'viagem').length,
      mobilidade: requests.filter(r => r.serviceType === 'mobilidade').length,
      correios: requests.filter(r => r.serviceType === 'correios').length,
      xerox: requests.filter(r => r.serviceType === 'xerox').length
    }
  };

  res.json({
    success: true,
    data: metrics
  });
});

// GET /api/dashboard/status-distribution - Distribuição por status
router.get('/status-distribution', async (req: Request, res: Response) => {
  const requests = await requestRepository.findAll();
  
  const distribution = {
    RASCUNHO: requests.filter(r => r.status === 'RASCUNHO').length,
    PENDENTE_APROVACAO: requests.filter(r => r.status === 'PENDENTE_APROVACAO').length,
    APROVADO: requests.filter(r => r.status === 'APROVADO').length,
    EM_ATENDIMENTO: requests.filter(r => r.status === 'EM_ATENDIMENTO').length,
    CONCLUIDO: requests.filter(r => r.status === 'CONCLUIDO').length,
    REJEITADO: requests.filter(r => r.status === 'REJEITADO').length,
    CANCELADO: requests.filter(r => r.status === 'CANCELADO').length
  };

  res.json({
    success: true,
    data: distribution
  });
});

// GET /api/dashboard/recent-queue - Fila operacional recente
router.get('/recent-queue', async (req: Request, res: Response) => {
  const requests = await requestRepository.findAll();
  
  // Ordenar por data de atualização (mais recente primeiro) e pegar últimos 5
  const recentRequests = requests
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      title: r.title,
      requesterName: r.requesterName,
      status: r.status,
      serviceType: r.serviceType
    }));

  res.json({
    success: true,
    data: recentRequests
  });
});

export default router;