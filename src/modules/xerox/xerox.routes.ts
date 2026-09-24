import { Router, Request, Response } from 'express';
import { requestRepository } from '../../database';
import { NotFoundError, ValidationError } from '../../common/errors/AppError';
import { validate } from '../../middleware/validate';
import { authorize, authorizeService } from '../../middleware/auth';
import { assertCanReadRequest, assertRequestOwnerOrAdmin } from '../../common/request-access';
import { validateTransition } from '../../common/state-machine';
import { createXeroxJobSchema } from '../../common/validation-schemas';

const router = Router();

// GET /api/xerox/jobs - Listar jobs de impressão
router.get('/jobs', authorize('AGENTE_SERVICO', 'ADMINISTRADOR'), authorizeService('xerox'), async (req: Request, res: Response) => {
  const xeroxJobs = await requestRepository.findByServiceType('xerox');

  res.json({
    success: true,
    data: xeroxJobs,
    total: xeroxJobs.length
  });
});

// GET /api/xerox/jobs/:id - Detalhes do job
router.get('/jobs/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const job = await requestRepository.findById(id);

  if (!job || job.serviceType !== 'xerox') {
    throw new NotFoundError('Job de impressão');
  }
  assertCanReadRequest(req, job);

  res.json({
    success: true,
    data: job
  });
});

// POST /api/xerox/jobs - Criar novo job de impressão
router.post('/jobs', authorize('colaborador', 'administrador'), validate(createXeroxJobSchema), async (req: Request, res: Response) => {
  const { title, details } = req.body;
  const { id: requesterId, name: requesterName, costCenter } = req.user!;

  const newJob = {
    id: requestRepository.generateId('SOL'),
    serviceType: 'xerox' as const,
    title,
    requesterId,
    requesterName,
    costCenter,
    status: 'EM_ATENDIMENTO' as const,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    urgent: false,
    details: {
      format: details.format || 'A4',
      colorMode: details.colorMode || 'P&B',
      paperType: details.paperType || 'Sulfite 90g',
      copies: details.copies || 1,
      finishing: details.finishing || 'Nenhum',
      fileName: details.fileName || 'documento.pdf'
    },
    history: [
      {
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        action: 'Job de impressão criado e adicionado à fila.',
        user: requesterName
      }
    ]
  };

  await requestRepository.create(newJob);

  res.status(201).json({
    success: true,
    data: newJob,
    message: 'Job de impressão criado com sucesso'
  });
});

// POST /api/xerox/jobs/:id/file - Upload do arquivo (simulado)
router.post('/jobs/:id/file', authorize('colaborador', 'administrador'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const job = await requestRepository.findById(id);

  if (!job || job.serviceType !== 'xerox') {
    throw new NotFoundError('Job de impressão');
  }
  assertRequestOwnerOrAdmin(req, job);

  const fileInfo = {
    fileName: `arquivo_${id}.pdf`,
    fileSize: '2.5 MB',
    uploadDate: new Date().toISOString(),
    status: 'Recebido para processamento'
  };

  res.json({
    success: true,
    data: fileInfo,
    message: 'Arquivo enviado com sucesso para processamento'
  });
});

// GET /api/xerox/jobs/:id/status - Status de produção
router.get('/jobs/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const job = await requestRepository.findById(id);

  if (!job || job.serviceType !== 'xerox') {
    throw new NotFoundError('Job de impressão');
  }
  assertCanReadRequest(req, job);

  const status = {
    requestId: job.id,
    status: job.status,
    productionStage: 'Em fila de produção',
    estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    operator: 'Operador Mock (Simulado)'
  };

  res.json({
    success: true,
    data: status
  });
});

// PUT /api/xerox/jobs/:id/complete - Marcar job como concluído
router.put('/jobs/:id/complete', authorize('faturamento', 'coordenadora', 'administrador'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const job = await requestRepository.findById(id);

  if (!job || job.serviceType !== 'xerox') {
    throw new NotFoundError('Job de impressão');
  }

  validateTransition(job.status, 'CONCLUIDO');

  const updatedJob = await requestRepository.updateStatus(
    id,
    'CONCLUIDO',
    'Sistema',
    'Job de impressão concluído.'
  );

  res.json({
    success: true,
    data: updatedJob,
    message: 'Job marcado como concluído'
  });
});

export default router;
