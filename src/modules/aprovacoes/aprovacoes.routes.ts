import { Router, Request, Response } from 'express';
import { requestRepository } from '../../database';
import { ForbiddenError, NotFoundError, ValidationError } from '../../common/errors/AppError';
import { validate } from '../../middleware/validate';
import { authorize } from '../../middleware/auth';
import { validateTransition } from '../../common/state-machine';
import { approveRequestSchema, rejectRequestSchema } from '../../common/validation-schemas';

const router = Router();

// Alçada demonstrativa do protótipo. A atribuição é decidida no servidor;
// estado de frontend/localStorage nunca amplia o escopo do gestor.
const PRIMARY_DEMO_APPROVERS = new Set(['USR-DEMO-02', 'USR-002']);
const inApprovalScope = (req: Request) => req.user!.role === 'ADMINISTRADOR' || PRIMARY_DEMO_APPROVERS.has(req.user!.id);
const assertApprovalScope = (req: Request) => {
  if (!inApprovalScope(req)) throw new ForbiddenError('Solicitação fora da alçada do gestor autenticado');
};
const demoIdentity = (requesterId: string) => {
  const suffix = requesterId.endsWith('2') ? 'B' : requesterId.endsWith('3') ? 'C' : 'A';
  return { name: `Colaborador Demo ${suffix}`, area: `Área Demonstrativa ${suffix}`, costCenter: suffix === 'B' ? 'CC-DEMO-02' : 'CC-DEMO-01' };
};
const serviceNames: Record<string, string> = { viagem: 'Viagem', mobilidade: 'Mobilidade', entregas: 'Entrega', estacionamento: 'Estacionamento', correios: 'Correios', xerox: 'Impressões', achados_perdidos: 'Achados e Perdidos', liberacao_acesso: 'Acesso', autorizacao_excepcional: 'Autorização Excepcional', solicitacao_imagens: 'Imagens', transporte: 'Transporte' };
const neutralDetails = (item: any) => {
  const details = { ...item.details };
  const replacements: Record<string, string> = {
    origin: 'Origem Demonstrativa', destination: 'Destino Demonstrativo', reason: 'Finalidade corporativa demonstrativa.',
    justification: 'Justificativa demonstrativa para análise.', description: `Solicitação demonstrativa de ${serviceNames[item.serviceType] || 'serviço'}.`,
    location: 'Unidade Demonstrativa', resource: 'Recurso Demonstrativo', recipient: 'Destinatário Demo', sender: 'Remetente Demo',
    itemDescription: 'Volume demonstrativo', content: 'Conteúdo demonstrativo', vehicleModel: 'Veículo Demo', userTarget: 'Colaborador Demo'
  };
  Object.entries(replacements).forEach(([key, value]) => { if (key in details) details[key] = value; });
  return details;
};
const approverView = (item: any) => {
  const identity = demoIdentity(item.requesterId || 'USR-001');
  return {
    ...item,
    title: `Solicitação demonstrativa de ${serviceNames[item.serviceType] || 'serviço'}`,
    requesterName: identity.name,
    costCenter: identity.costCenter,
    details: { ...neutralDetails(item), department: identity.area },
    history: (item.history || []).map((event: any) => ({ ...event, user: event.action?.includes('Aprovado') || event.action?.includes('Rejeitado') ? 'Gestor Demo' : identity.name })),
    approvalScope: 'ALCADA_DEMONSTRATIVA',
    approvalReason: `Aprovação atribuída ao gestor responsável pelo centro de custo ${identity.costCenter}.`,
    applicablePolicy: null
  };
};

// GET /api/approvals/pending - Listar pendências de aprovação
router.get('/pending', authorize('GESTOR_APROVADOR', 'ADMINISTRADOR'), async (req: Request, res: Response) => {
  const pendingRequests = await requestRepository.findByStatus('PENDENTE_APROVACAO');
  const scopedRequests = inApprovalScope(req) ? pendingRequests : [];
  const approvals = scopedRequests.map(r => ({
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

router.get('/my-pending', authorize('GESTOR_APROVADOR', 'ADMINISTRADOR'), async (req: Request, res: Response) => {
  const pending = await requestRepository.findByStatus('PENDENTE_APROVACAO');
  const scoped = inApprovalScope(req) ? pending : [];
  res.json({ success: true, data: scoped.map(approverView), total: scoped.length });
});

router.get('/:id(SOL-[A-Za-z0-9-]+)', authorize('GESTOR_APROVADOR', 'ADMINISTRADOR'), async (req: Request, res: Response) => {
  const item = await requestRepository.findById(req.params.id);
  if (!item) throw new NotFoundError('Solicitação');
  assertApprovalScope(req);
  res.json({ success: true, data: approverView(item) });
});

// PUT /api/approvals/:id/approve - Aprovar solicitação
router.put('/:id/approve', authorize('gestor', 'coordenacao', 'administrador'), validate(approveRequestSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { comment } = req.body;

  const request = await requestRepository.findById(id);

  if (!request) {
    throw new NotFoundError('Solicitação');
  }
  assertApprovalScope(req);

  // R5: Usar máquina de estados centralizada
  validateTransition(request.status, 'APROVADO');

  const updatedRequest = await requestRepository.updateStatus(
    id,
    'APROVADO',
    req.user!.name,
    `Aprovado pelo gestor.${comment ? ` Comentário: ${comment}` : ''}`
  );

  res.json({
    success: true,
    data: updatedRequest,
    message: 'Solicitação aprovada com sucesso'
  });
});

router.post('/:id/approve', authorize('GESTOR_APROVADOR', 'ADMINISTRADOR'), validate(approveRequestSchema), async (req: Request, res: Response) => {
  const item = await requestRepository.findById(req.params.id);
  if (!item) throw new NotFoundError('Solicitação');
  assertApprovalScope(req);
  validateTransition(item.status, 'APROVADO');
  const updated = await requestRepository.updateStatus(item.id, 'APROVADO', req.user!.name, `Aprovado pelo gestor.${req.body.comment ? ` Comentário: ${req.body.comment}` : ''}`);
  res.json({ success: true, data: updated, message: 'Solicitação aprovada com sucesso' });
});

// PUT /api/approvals/:id/reject - Rejeitar solicitação (com justificativa obrigatória)
router.put('/:id/reject', authorize('gestor', 'coordenacao', 'administrador'), validate(rejectRequestSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const request = await requestRepository.findById(id);

  if (!request) {
    throw new NotFoundError('Solicitação');
  }
  assertApprovalScope(req);

  // R5: Usar máquina de estados centralizada
  validateTransition(request.status, 'REJEITADO');

  const updatedRequest = await requestRepository.updateStatus(
    id,
    'REJEITADO',
    req.user!.name,
    `Rejeitado pelo gestor. Justificativa: ${reason}`
  );

  res.json({
    success: true,
    data: updatedRequest,
    message: 'Solicitação rejeitada com sucesso'
  });
});

router.post('/:id/reject', authorize('GESTOR_APROVADOR', 'ADMINISTRADOR'), validate(rejectRequestSchema), async (req: Request, res: Response) => {
  const item = await requestRepository.findById(req.params.id);
  if (!item) throw new NotFoundError('Solicitação');
  assertApprovalScope(req);
  validateTransition(item.status, 'REJEITADO');
  const updated = await requestRepository.updateStatus(item.id, 'REJEITADO', req.user!.name, `Rejeitado pelo gestor. Justificativa: ${req.body.reason}`);
  res.json({ success: true, data: updated, message: 'Solicitação rejeitada com sucesso' });
});

// GET /api/approvals/history - Histórico de aprovações
router.get('/history', authorize('GESTOR_APROVADOR', 'ADMINISTRADOR'), async (req: Request, res: Response) => {
  const allRequests = await requestRepository.findAll();

  const approvalHistory = (inApprovalScope(req) ? allRequests : [])
    .filter(r => r.status === 'APROVADO' || r.status === 'REJEITADO')
    .map(approverView);

  res.json({
    success: true,
    data: approvalHistory
  });
});

export default router;
