import { z } from 'zod';

// === AUTH SCHEMAS ===
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido').optional(),
    role: z.string().min(1, 'Role é obrigatória').optional()
  }).refine(data => data.email || data.role, {
    message: 'Email ou role é obrigatório'
  })
});

// === REQUEST SCHEMAS ===
const requestStatusEnum = z.enum([
  'RASCUNHO', 'PENDENTE_APROVACAO', 'APROVADO',
  'EM_ATENDIMENTO', 'CONCLUIDO', 'REJEITADO', 'CANCELADO'
]);

const serviceTypeEnum = z.enum(['viagem', 'mobilidade', 'correios', 'xerox']);

export const createRequestSchema = z.object({
  body: z.object({
    serviceType: serviceTypeEnum,
    title: z.string().min(1, 'Título é obrigatório').max(200),
    requesterId: z.string().min(1, 'ID do solicitante é obrigatório'),
    requesterName: z.string().min(1, 'Nome do solicitante é obrigatório'),
    costCenter: z.string().min(1, 'Centro de custo é obrigatório'),
    urgent: z.boolean().optional().default(false),
    details: z.record(z.unknown()).optional().default({}),
    status: z.literal('RASCUNHO').optional().default('RASCUNHO')
  })
});

export const updateRequestSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    costCenter: z.string().min(1).optional(),
    urgent: z.boolean().optional(),
    details: z.record(z.unknown()).optional()
  }),
  params: z.object({
    id: z.string().min(1)
  })
});

export const submitRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

// === APROVAÇÃO SCHEMAS ===
export const approveRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    approverName: z.string().min(1, 'Nome do aprovador é obrigatório'),
    comment: z.string().optional()
  })
});

export const rejectRequestSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    approverName: z.string().min(1, 'Nome do aprovador é obrigatório'),
    reason: z.string().min(1, 'Justificativa é obrigatória para rejeição (RN-GER-005)')
  })
});

// === MOBILIDADE SCHEMAS ===
export const createMobilidadeAccessSchema = z.object({
  body: z.object({
    serviceType: serviceTypeEnum.optional().default('mobilidade'),
    title: z.string().min(1).max(200).optional(),
    requesterId: z.string().min(1, 'ID do solicitante é obrigatório'),
    requesterName: z.string().min(1, 'Nome do solicitante é obrigatório'),
    costCenter: z.string().min(1, 'Centro de custo é obrigatório'),
    details: z.record(z.unknown()).optional().default({})
  })
});

export const requestVoucherSchema = z.object({
  body: z.object({
    userEmail: z.string().email('Email inválido').optional(),
    costCenter: z.string().min(1).optional(),
    reason: z.string().min(1, 'Motivo é obrigatório').optional()
  })
});

// === CORREIOS SCHEMAS ===
export const createCorreioSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Título é obrigatório').max(200),
    requesterId: z.string().min(1, 'ID do solicitante é obrigatório'),
    requesterName: z.string().min(1, 'Nome do solicitante é obrigatório'),
    costCenter: z.string().min(1, 'Centro de custo é obrigatório'),
    details: z.record(z.unknown()).optional().default({})
  })
});

export const updateCorreioUsageTypeSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    usageType: z.enum(['institucional', 'pessoal'], {
      errorMap: () => ({ message: 'Tipo de uso inválido (deve ser "institucional" ou "pessoal")' })
    })
  })
});

// === XEROX SCHEMAS ===
export const createXeroxJobSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Título é obrigatório').max(200),
    requesterId: z.string().min(1, 'ID do solicitante é obrigatório'),
    requesterName: z.string().min(1, 'Nome do solicitante é obrigatório'),
    costCenter: z.string().min(1, 'Centro de custo é obrigatório'),
    details: z.object({
      format: z.string().optional().default('A4'),
      colorMode: z.string().optional().default('P&B'),
      paperType: z.string().optional().default('Sulfite 90g'),
      copies: z.number().int().positive().optional().default(1),
      finishing: z.string().optional().default('Nenhum'),
      fileName: z.string().min(1, 'Nome do arquivo é obrigatório')
    })
  })
});

// === TICKETS SCHEMAS ===
export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Título é obrigatório').max(200),
    requester: z.string().min(1, 'Solicitante é obrigatório'),
    category: z.string().min(1, 'Categoria é obrigatória'),
    priority: z.enum(['Baixa', 'Média', 'Alta', 'Urgente']).optional().default('Média'),
    description: z.string().min(1, 'Descrição é obrigatória')
  })
});

export const resolveTicketSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    resolution: z.string().min(1, 'Resolução é obrigatória'),
    assignedTo: z.string().min(1, 'Responsável é obrigatório')
  })
});

export const escalateTicketSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    reason: z.string().min(1, 'Motivo do escalonamento é obrigatório')
  })
});

// === FINANCEIRO SCHEMAS ===
export const exportFinanceSchema = z.object({
  body: z.object({
    costCenter: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  })
});

// === QUERY SCHEMAS ===
export const requestsQuerySchema = z.object({
  query: z.object({
    status: requestStatusEnum.optional(),
    serviceType: serviceTypeEnum.optional(),
    requesterId: z.string().optional()
  })
});

export const ticketsQuerySchema = z.object({
  query: z.object({
    status: z.string().optional(),
    category: z.string().optional()
  })
});
