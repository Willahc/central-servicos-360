import { Router, Request, Response } from 'express';
import { requestRepository } from '../../database';
import { NotFoundError, ValidationError } from '../../common/errors/AppError';
import { validate } from '../../middleware/validate';
import { authorize } from '../../middleware/auth';
import { validateTransition } from '../../common/state-machine';
import { approveRequestSchema, rejectRequestSchema } from '../../common/validation-schemas';

const router = Router();

// GET /api/approvals/pending - Listar pendências de aprovação
router.get('/pending', async (req: Request, res: Response) => {
  const pendingRequests = await requestRepository.findByStatus('PENDENTE_APROVACAO');

  const approvals = pendingRequests.map(r => ({
    id: r.id,
    requesterName: r.requesterName,
    title: r.title,
    costCenter: r.costCenter,
    serviceType: r.serviceType,
    createdAt: r.createdAt,
    urgent: r.urgent
  }));

  res.json({
    success: true,
    data: approvals,
    total: approvals.length
  });
});

// PUT /api/approvals/:id/approve - Aprovar solicitação
router.put('/:id/approve', authorize('gestor', 'coordenadora', 'administrador'), validate(approveRequestSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { approverName, comment } = req.body;

  const request = await requestRepository.findById(id);

  if (!request) {
    throw new NotFoundError('Solicitação');
  }

  // R5: Usar máquina de estados centralizada
  validateTransition(request.status, 'APROVADO');

  const updatedRequest = await requestRepository.updateStatus(
    id,
    'APROVADO',
    approverName,
    `Aprovado pelo gestor.${comment ? ` Comentário: ${comment}` : ''}`
  );

  res.json({
    success: true,
    data: updatedRequest,
    message: 'Solicitação aprovada com sucesso'
  });
});

// PUT /api/approvals/:id/reject - Rejeitar solicitação (com justificativa obrigatória)
router.put('/:id/reject', authorize('gestor', 'coordenadora', 'administrador'), validate(rejectRequestSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { approverName, reason } = req.body;

  const request = await requestRepository.findById(id);

  if (!request) {
    throw new NotFoundError('Solicitação');
  }

  // R5: Usar máquina de estados centralizada
  validateTransition(request.status, 'REJEITADO');

  const updatedRequest = await requestRepository.updateStatus(
    id,
    'REJEITADO',
    approverName,
    `Rejeitado pelo gestor. Justificativa: ${reason}`
  );

  res.json({
    success: true,
    data: updatedRequest,
    message: 'Solicitação rejeitada com sucesso'
  });
});

// GET /api/approvals/history - Histórico de aprovações
router.get('/history', async (req: Request, res: Response) => {
  const allRequests = await requestRepository.findAll();

  const approvalHistory = allRequests
    .filter(r => r.status === 'APROVADO' || r.status === 'REJEITADO')
    .map(r => ({
      id: r.id,
      title: r.title,
      requesterName: r.requesterName,
      status: r.status,
      updatedAt: r.updatedAt,
      history: r.history
    }));

  res.json({
    success: true,
    data: approvalHistory
  });
});

export default router;
