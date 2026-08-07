// Instâncias compartilhadas dos repositórios
import { RequestRepository } from './repositories/RequestRepository';
import { UserRepository } from './repositories/UserRepository';

// Criar instâncias únicas (Singleton pattern)
export const requestRepository = new RequestRepository();
export const userRepository = new UserRepository();

// Inicializar dados mock compartilhados
const mockUsers = [
  { id: 'USR-001', email: 'carlos.andrade@ficticio.org', name: 'Carlos Andrade', role: 'colaborador', department: 'Enfermagem Assistencial', costCenter: 'CC-3021', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-002', email: 'fernanda.lima@ficticio.org', name: 'Fernanda Lima', role: 'gestor', department: 'Diretoria Médica', costCenter: 'CC-1010', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-003', email: 'william.nunes@ficticio.org', name: 'William Nunes', role: 'viagens', department: 'Central de Serviços', costCenter: 'CC-4000', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-004', email: 'maria.catarina@ficticio.org', name: 'Maria Catarina', role: 'faturamento', department: 'Central de Serviços', costCenter: 'CC-4000', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-005', email: 'renata.monteiro@ficticio.org', name: 'Renata Monteiro', role: 'coordenadora', department: 'Central de Serviços', costCenter: 'CC-4000', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-006', email: 'iramaia.rodrigues@ficticio.org', name: 'Iramaia Rodrigues', role: 'gerencia', department: 'Hotelaria & Infraestrutura', costCenter: 'CC-4000', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-007', email: 'roberto.silva@ficticio.org', name: 'Roberto Silva', role: 'financeiro', department: 'Controladoria & Finanças', costCenter: 'CC-2005', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-008', email: 'patricia.souza@ficticio.org', name: 'Patrícia Souza', role: 'administrador', department: 'Tecnologia da Informação', costCenter: 'CC-5001', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-009', email: 'marcelo.alves@ficticio.org', name: 'Marcelo Alves', role: 'auditoria', department: 'Governança & Riscos', costCenter: 'CC-5002', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const mockRequests = [
  {
    id: 'SOL-2026-001',
    serviceType: 'viagem' as const,
    title: 'Participação no Congresso Nacional de Hotelaria Hospitalar',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-3021',
    status: 'PENDENTE_APROVACAO' as const,
    createdAt: '2026-08-01 10:15',
    updatedAt: '2026-08-01 10:30',
    urgent: false,
    details: {
      origin: 'São Paulo (GRU)',
      destination: 'Brasília (BSB)',
      departureDate: '2026-09-15',
      returnDate: '2026-09-18',
      reason: 'Participação no congresso científico com apresentação de trabalho.',
      needsHotel: true,
      needsMobility: true,
      insuranceRequested: true,
      estimatedCost: 2450.00,
      nonFlownCreditUsed: null
    },
    history: [
      { date: '2026-08-01 10:15', action: 'Criado rascunho de solicitação de viagem.', user: 'Carlos Andrade' },
      { date: '2026-08-01 10:30', action: 'Enviado para aprovação do gestor.', user: 'Carlos Andrade' }
    ]
  },
  {
    id: 'SOL-2026-002',
    serviceType: 'viagem' as const,
    title: 'Visita Técnica à Unidade de Apoio Logístico',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-4000',
    status: 'APROVADO' as const,
    createdAt: '2026-07-20 14:00',
    updatedAt: '2026-07-21 09:00',
    urgent: false,
    details: {
      origin: 'São Paulo (CGH)',
      destination: 'Rio de Janeiro (SDU)',
      departureDate: '2026-08-20',
      returnDate: '2026-08-22',
      reason: 'Alinhamento operacional de procedimentos gráficos.',
      needsHotel: true,
      needsMobility: true,
      insuranceRequested: false,
      estimatedCost: 1890.00,
      nonFlownCreditUsed: 'TKT-99420 (R$ 450,00)'
    },
    history: [
      { date: '2026-07-20 14:00', action: 'Solicitação enviada.', user: 'Carlos Andrade' },
      { date: '2026-07-21 09:00', action: 'Aprovado pelo gestor.', user: 'Fernanda Lima' }
    ]
  },
  {
    id: 'SOL-2026-003',
    serviceType: 'mobilidade' as const,
    title: 'Inclusão de Acesso Uber for Business - Equipe de Plantão',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-3021',
    status: 'CONCLUIDO' as const,
    createdAt: '2026-07-25 11:20',
    updatedAt: '2026-07-25 16:45',
    urgent: false,
    details: {
      actionType: 'inclusao',
      platform: 'Uber for Business',
      monthlyLimit: 500.00,
      reason: 'Deslocamentos emergenciais em plantão noturno extraordinário.'
    },
    history: [
      { date: '2026-07-25 11:20', action: 'Solicitação de cadastro de acesso enviada.', user: 'Carlos Andrade' },
      { date: '2026-07-25 16:45', action: 'Concluído pelo operador.', user: 'Maria Catarina' }
    ]
  },
  {
    id: 'SOL-2026-004',
    serviceType: 'correios' as const,
    title: 'Envio de Documentação Contratual Auditada',
    requesterId: 'USR-002',
    requesterName: 'Fernanda Lima',
    costCenter: 'CC-1010',
    status: 'EM_ATENDIMENTO' as const,
    createdAt: '2026-08-02 08:30',
    updatedAt: '2026-08-02 11:00',
    urgent: true,
    details: {
      usageType: 'institucional',
      modality: 'SEDEX 10',
      destinationZip: '70040-010',
      urgencyRationale: 'Prazo regulatório de entrega até 12h do dia seguinte.',
      trackingCode: 'BR987654321SB'
    },
    history: [
      { date: '2026-08-02 08:30', action: 'Solicitação de postagem urgente enviada.', user: 'Fernanda Lima' },
      { date: '2026-08-02 11:00', action: 'Código de rastreamento associado.', user: 'Maria Catarina' }
    ]
  },
  {
    id: 'SOL-2026-005',
    serviceType: 'xerox' as const,
    title: 'Impressão de Manuais de Procedimentos Operacionais Padrão',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-3021',
    status: 'EM_ATENDIMENTO' as const,
    createdAt: '2026-08-03 09:00',
    updatedAt: '2026-08-03 09:30',
    urgent: false,
    details: {
      format: 'A4',
      colorMode: 'Colorido',
      paperType: 'Sulfite 90g',
      copies: 50,
      finishing: 'Espiral com capa transparente',
      fileName: 'Manual_POP_Enfermagem_2026.pdf'
    },
    history: [
      { date: '2026-08-03 09:00', action: 'Arquivo enviado para fila gráfica.', user: 'Carlos Andrade' },
      { date: '2026-08-03 09:30', action: 'Job alocado na fila de produção gráfica.', user: 'Atendimento Xerox' }
    ]
  }
];

// Inicializar repositórios com dados mock
mockUsers.forEach(user => userRepository.create(user));
mockRequests.forEach(req => requestRepository.create(req));