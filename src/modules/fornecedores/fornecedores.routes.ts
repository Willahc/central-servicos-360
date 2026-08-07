import { Router, Request, Response } from 'express';
import { NotFoundError } from '../../common/errors/AppError';

const router = Router();

// Mock: Dados de fornecedores
const mockSuppliers = [
  {
    id: 'SUP-01',
    name: 'Copastur Viagens e Turismo',
    category: 'Agência de Viagens',
    contract: 'CT-2024-089',
    status: 'Ativo',
    slaTarget: 'Atendimento cotação até 2h',
    contact: {
      name: 'João Silva',
      email: 'joao.silva@copastur.com.br',
      phone: '(11) 3456-7890'
    },
    metrics: {
      totalRequests: 45,
      averageResponseTime: '1.8h',
      complianceRate: 98.5
    }
  },
  {
    id: 'SUP-02',
    name: 'Uber for Business Brasil',
    category: 'Mobilidade Urbana',
    contract: 'CT-2023-112',
    status: 'Ativo',
    slaTarget: 'Disponibilidade 99.9%',
    contact: {
      name: 'Maria Santos',
      email: 'maria.santos@uber.com',
      phone: '(11) 9876-5432'
    },
    metrics: {
      totalRequests: 120,
      averageResponseTime: '5min',
      complianceRate: 99.2
    }
  },
  {
    id: 'SUP-03',
    name: 'Empresa Brasileira de Correios e Telégrafos',
    category: 'Serviços Postais',
    contract: 'CT-2022-045',
    status: 'Ativo',
    slaTarget: 'Coleta diária às 16h',
    contact: {
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@correios.com.br',
      phone: '(61) 3215-8888'
    },
    metrics: {
      totalRequests: 85,
      averageResponseTime: '24h',
      complianceRate: 97.8
    }
  },
  {
    id: 'SUP-04',
    name: 'Gráfica & Soluções Digitais Fictícia',
    category: 'Xerox e Impressões',
    contract: 'CT-2025-014',
    status: 'Ativo',
    slaTarget: 'Impressão Padrão 24h / Urgente 4h',
    contact: {
      name: 'Ana Costa',
      email: 'ana.costa@graficamock.com.br',
      phone: '(11) 2345-6789'
    },
    metrics: {
      totalRequests: 32,
      averageResponseTime: '18h',
      complianceRate: 96.5
    }
  }
];

// GET /api/suppliers - Listar fornecedores
router.get('/', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: mockSuppliers,
    total: mockSuppliers.length
  });
});

// GET /api/suppliers/:id - Detalhes do fornecedor
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const supplier = mockSuppliers.find(s => s.id === id);
  
  if (!supplier) {
    throw new NotFoundError('Fornecedor');
  }

  res.json({
    success: true,
    data: supplier
  });
});

// GET /api/suppliers/:id/sla - Métricas de SLA
router.get('/:id/sla', async (req: Request, res: Response) => {
  const { id } = req.params;
  const supplier = mockSuppliers.find(s => s.id === id);
  
  if (!supplier) {
    throw new NotFoundError('Fornecedor');
  }

  const slaMetrics = {
    supplierId: supplier.id,
    supplierName: supplier.name,
    slaTarget: supplier.slaTarget,
    currentMetrics: supplier.metrics,
    period: 'Últimos 30 dias',
    status: supplier.metrics.complianceRate >= 95 ? 'Dentro da meta' : 'Abaixo da meta'
  };

  res.json({
    success: true,
    data: slaMetrics
  });
});

export default router;