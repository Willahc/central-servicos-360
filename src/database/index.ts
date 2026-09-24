// Instâncias compartilhadas dos repositórios
import { RequestRepository } from './repositories/RequestRepository';
import { UserRepository } from './repositories/UserRepository';

// Criar instâncias únicas (Singleton pattern)
export const requestRepository = new RequestRepository();
export const userRepository = new UserRepository();

// Inicializar dados mock compartilhados
const mockUsers = [
  // Usuários de demonstração neutros (sem nomes pessoais de colaboradores reais)
  { id: 'USR-DEMO-01', email: 'colaborador.demo@hospital-demo.org', name: 'Colaborador Demo', role: 'COLABORADOR', serviceScopes: [], department: 'Área Assistencial Demonstrativa', costCenter: 'CC-DEMO-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-DEMO-02', email: 'gestor.demo@hospital-demo.org', name: 'Gestor Demo', role: 'GESTOR_APROVADOR', serviceScopes: [], department: 'Gestão Demonstrativa', costCenter: 'CC-DEMO-02', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-DEMO-03', email: 'agente.viagens.demo@hospital-demo.org', name: 'Agente Demo Viagens', role: 'AGENTE_SERVICO', serviceScopes: ['viagem', 'mobilidade'], department: 'Central de Serviços Demonstrativa', costCenter: 'CC-DEMO-03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-DEMO-04', email: 'agente.transportes.demo@hospital-demo.org', name: 'Agente Demo Transportes', role: 'AGENTE_SERVICO', serviceScopes: ['transportes'], department: 'Central de Transportes Demonstrativa', costCenter: 'CC-DEMO-03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-DEMO-05', email: 'agente.servicos.demo@hospital-demo.org', name: 'Agente Demo Serviços Gerais', role: 'AGENTE_SERVICO', serviceScopes: ['correios', 'entregas', 'xerox', 'estacionamento', 'achados_perdidos'], department: 'Central de Serviços Demonstrativa', costCenter: 'CC-DEMO-03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-DEMO-06', email: 'admin.demo@hospital-demo.org', name: 'Administrador Demo', role: 'ADMINISTRADOR', serviceScopes: ['ALL'], department: 'Governança e TI Demonstrativa', costCenter: 'CC-DEMO-05', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  // Usuários para compatibilidade com fixtures de testes
  { id: 'USR-001', email: 'carlos.andrade@ficticio.org', name: 'Carlos Andrade', role: 'COLABORADOR', serviceScopes: [], department: 'UTI Geral Adulto', costCenter: 'CC-DEMO-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-002', email: 'fernanda.lima@ficticio.org', name: 'Fernanda Lima', role: 'GESTOR_APROVADOR', serviceScopes: [], department: 'Diretoria Médica e Clínica', costCenter: 'CC-DEMO-02', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-003', email: 'william.nunes@ficticio.org', name: 'Agente Viagens + Mobilidade', role: 'AGENTE_SERVICO', serviceScopes: ['viagens', 'mobilidade'], department: 'Central de Serviços', costCenter: 'CC-DEMO-03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-004', email: 'maria.catarina@ficticio.org', name: 'Agente Transportes', role: 'AGENTE_SERVICO', serviceScopes: ['transportes'], department: 'Central de Transportes', costCenter: 'CC-DEMO-03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-005', email: 'renata.monteiro@ficticio.org', name: 'Renata Monteiro', role: 'coordenacao', roles: ['colaborador', 'coordenacao'], serviceScopes: ['ALL'], department: 'Coordenação de Infraestrutura', costCenter: 'CC-DEMO-03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-006', email: 'iramaia.rodrigues@ficticio.org', name: 'Iramaia Rodrigues', role: 'gerencia', department: 'Gerência de Facilities', costCenter: 'CC-DEMO-03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-007', email: 'roberto.silva@ficticio.org', name: 'Roberto Silva', role: 'financeiro', department: 'Controladoria & Finanças', costCenter: 'CC-DEMO-04', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-008', email: 'patricia.souza@ficticio.org', name: 'Patrícia Souza', role: 'ADMINISTRADOR', serviceScopes: ['ALL'], department: 'Governança e TI', costCenter: 'CC-DEMO-05', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-009', email: 'marcelo.alves@ficticio.org', name: 'Marcelo Alves', role: 'auditoria', department: 'Auditoria Interna', costCenter: 'CC-DEMO-06', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  // Aliases para compatibilidade
  { id: 'USR-010', email: 'exemplo.a@ficticio.org', name: 'Carlos Andrade', role: 'colaborador', department: 'UTI Geral Adulto', costCenter: 'CC-DEMO-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-011', email: 'exemplo.b@ficticio.org', name: 'Fernanda Lima', role: 'gestor', department: 'Diretoria Médica e Clínica', costCenter: 'CC-DEMO-02', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-012', email: 'operador.viagens@ficticio.org', name: 'Agente Viagens + Mobilidade', role: 'AGENTE_SERVICO', serviceScopes: ['viagens', 'mobilidade'], department: 'Central de Serviços', costCenter: 'CC-DEMO-03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-013', email: 'admin@ficticio.org', name: 'Patrícia Souza', role: 'ADMINISTRADOR', serviceScopes: ['ALL'], department: 'Governança e TI', costCenter: 'CC-DEMO-05', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'USR-014', email: 'agente.servicos.gerais@ficticio.org', name: 'Agente Serviços Gerais', role: 'AGENTE_SERVICO', serviceScopes: ['correios', 'entregas', 'xerox', 'estacionamento', 'achados_perdidos'], department: 'Central de Serviços', costCenter: 'CC-DEMO-03', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const mockRequests = [
  {
    id: 'SOL-2026-001',
    serviceType: 'viagem' as const,
    title: 'Congresso Internacional de Terapia Intensiva',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-3021',
    status: 'PENDENTE_APROVACAO' as const,
    createdAt: '2026-08-01 10:15',
    updatedAt: '2026-08-01 10:30',
    urgent: true,
    details: {
      origin: 'São Paulo (GRU)',
      destination: 'Brasília (BSB)',
      departureDate: '2026-09-15',
      returnDate: '2026-09-18',
      flightNumber: 'LA-3204 / LA-3209',
      airline: 'LATAM Airlines',
      hotelName: 'Windsor Plaza Brasília Hotel',
      reason: 'Apresentação de trabalho científico aprovado sobre protocolos de sepse em UTI.',
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
    title: 'Visita Técnica à Unidade Regional do Rio de Janeiro',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-3021',
    status: 'APROVADO' as const,
    createdAt: '2026-07-20 14:00',
    updatedAt: '2026-07-21 09:00',
    urgent: false,
    details: {
      origin: 'São Paulo (CGH)',
      destination: 'Rio de Janeiro (SDU)',
      departureDate: '2026-08-20',
      returnDate: '2026-08-22',
      flightNumber: 'G3-1020 / G3-1025',
      airline: 'GOL Linhas Aéreas',
      hotelName: 'Hotel Prodigy Santos Dumont',
      reason: 'Alinhamento de procedimentos assistenciais e treinamento de equipe local.',
      needsHotel: true,
      needsMobility: true,
      insuranceRequested: false,
      estimatedCost: 1890.00,
      nonFlownCreditUsed: 'TKT-99420 (R$ 450,00)'
    },
    history: [
      { date: '2026-07-20 14:00', action: 'Solicitação de viagem enviada.', user: 'Carlos Andrade' },
      { date: '2026-07-21 09:00', action: 'Aprovado pela Gestora Fernanda Lima.', user: 'Fernanda Lima' }
    ]
  },
  {
    id: 'SOL-2026-003',
    serviceType: 'mobilidade' as const,
    title: 'Cadastro e Inclusão no Uber for Business',
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
      city: 'São Paulo / SP',
      reason: 'Deslocamentos assistenciais em plantões noturnos e interunidades.'
    },
    history: [
      { date: '2026-07-25 11:20', action: 'Solicitação de cadastro de acesso enviada.', user: 'Carlos Andrade' },
      { date: '2026-07-25 16:45', action: 'Concluído pelo operador de faturamento.', user: 'Maria Catarina' }
    ]
  },
  {
    id: 'SOL-2026-004',
    serviceType: 'correios' as const,
    title: 'Envio de Documentação de Convênio Médico',
    requesterId: 'USR-002',
    requesterName: 'Fernanda Lima',
    costCenter: 'CC-1040',
    status: 'EM_ATENDIMENTO' as const,
    createdAt: '2026-08-02 08:30',
    updatedAt: '2026-08-02 11:00',
    urgent: true,
    details: {
      usageType: 'institucional',
      modality: 'SEDEX 10',
      destinationZip: '70040-010',
      recipientName: 'Ministério da Saúde - Protocolo Geral',
      address: 'Esplanada dos Ministérios, Bloco G - Brasília/DF',
      content: 'Dossiê regulatório e termos de credenciamento hospitalar.',
      urgencyRationale: 'Prazo regulatório com vencimento em 48h (RN-COR-002).',
      trackingCode: 'BR-SEDEX-0001',
      estimatedCost: 58.40
    },
    history: [
      { date: '2026-08-02 08:30', action: 'Solicitação de postagem urgente enviada.', user: 'Fernanda Lima' },
      { date: '2026-08-02 11:00', action: 'Código de rastreamento BR-SEDEX-0001 gerado.', user: 'Atendente Correios' }
    ]
  },
  {
    id: 'SOL-2026-005',
    serviceType: 'xerox' as const,
    title: 'Manual de Boas Práticas e Protocolos de Enfermagem 2026',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-3021',
    status: 'EM_ATENDIMENTO' as const,
    createdAt: '2026-08-03 09:00',
    updatedAt: '2026-08-03 09:30',
    urgent: false,
    details: {
      jobId: 'JOB-DEMO-001',
      format: 'A4',
      colorMode: 'Colorido',
      paperType: 'Couché 115g / Sulfite 90g',
      copies: 50,
      pages: 150,
      finish: 'Espiral duplo com capa cristal',
      fileName: 'Manual_Protocolos_UTI_2026.pdf'
    },
    history: [
      { date: '2026-08-03 09:00', action: 'Arquivo enviado para fila gráfica.', user: 'Carlos Andrade' },
      { date: '2026-08-03 09:30', action: 'Job alocado na máquina de produção offset digital.', user: 'Operador Gráfica' }
    ]
  },
  {
    id: 'SOL-2026-006',
    serviceType: 'viagem' as const,
    title: 'Treinamento em Robótica Cirúrgica em Porto Alegre',
    requesterId: 'USR-002',
    requesterName: 'Fernanda Lima',
    costCenter: 'CC-4010',
    status: 'EM_ATENDIMENTO' as const,
    createdAt: '2026-08-04 11:15',
    updatedAt: '2026-08-05 08:30',
    urgent: false,
    details: {
      origin: 'São Paulo (CGH)',
      destination: 'Porto Alegre (POA)',
      departureDate: '2026-09-22',
      returnDate: '2026-09-24',
      flightNumber: 'AD-4120 / AD-4125',
      airline: 'Azul Linhas Aéreas',
      hotelName: 'Hotel Deville Prime Porto Alegre',
      reason: 'Certificação em procedimento minimamente invasivo robótico DaVinci.',
      needsHotel: true,
      needsMobility: true,
      insuranceRequested: true,
      estimatedCost: 3120.00,
      nonFlownCreditUsed: null
    },
    history: [
      { date: '2026-08-04 11:15', action: 'Solicitação criada.', user: 'Fernanda Lima' },
      { date: '2026-08-05 08:30', action: 'Cotação emitida pela agência Copastur.', user: 'William Nunes' }
    ]
  },
  {
    id: 'SOL-2026-007',
    serviceType: 'mobilidade' as const,
    title: 'Solicitação de Voucher Extra para Plantão Noturno',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-3021',
    status: 'PENDENTE_APROVACAO' as const,
    createdAt: '2026-08-05 16:20',
    updatedAt: '2026-08-05 16:20',
    urgent: false,
    details: {
      actionType: 'ajuste_limite',
      platform: 'Uber for Business',
      monthlyLimit: 750.00,
      city: 'São Paulo / SP',
      reason: 'Cobertura de escala emergencial de plantões noturnos na UTI Geral (RN-MOB-001).'
    },
    history: [
      { date: '2026-08-05 16:20', action: 'Solicitação enviada para aprovação do gestor.', user: 'Carlos Andrade' }
    ]
  },
  {
    id: 'SOL-2026-008',
    serviceType: 'correios' as const,
    title: 'Envio de Lâminas e Amostras de Pesquisa Clínica',
    requesterId: 'USR-002',
    requesterName: 'Fernanda Lima',
    costCenter: 'CC-7080',
    status: 'PENDENTE_APROVACAO' as const,
    createdAt: '2026-08-06 09:10',
    updatedAt: '2026-08-06 09:10',
    urgent: true,
    details: {
      usageType: 'institucional',
      modality: 'SEDEX',
      destinationZip: '30130-100',
      recipientName: 'Laboratório Central UFMG - Belo Horizonte/MG',
      address: 'Av. Alfredo Balena, 190 - Santa Efigênia',
      content: 'Frascos lacrados com material biológico e termos do CEP.',
      urgencyRationale: 'Material termo-sensível necessitando entrega em até 24h.',
      trackingCode: 'BR-SEDEX-0008',
      estimatedCost: 89.20
    },
    history: [
      { date: '2026-08-06 09:10', action: 'Solicitação enviada para aprovação de custos.', user: 'Fernanda Lima' }
    ]
  },
  {
    id: 'SOL-2026-009',
    serviceType: 'xerox' as const,
    title: 'Impressão de Cartilhas de Orientação ao Paciente Oncológico',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-5020',
    status: 'PENDENTE_APROVACAO' as const,
    createdAt: '2026-08-06 14:00',
    updatedAt: '2026-08-06 14:00',
    urgent: false,
    details: {
      jobId: 'JOB-DEMO-006',
      format: 'A5',
      colorMode: 'Colorido',
      paperType: 'Reciclato 90g',
      copies: 200,
      pages: 32,
      finish: 'Grampo canoa (revista)',
      fileName: 'Cartilha_Oncologia_Cuidados.pdf'
    },
    history: [
      { date: '2026-08-06 14:00', action: 'Solicitação submetida para alocação na gráfica.', user: 'Carlos Andrade' }
    ]
  },
  {
    id: 'SOL-2026-010',
    serviceType: 'viagem' as const,
    title: 'Auditoria de Acreditação Hospitalar JCI em Curitiba',
    requesterId: 'USR-009',
    requesterName: 'Marcelo Alves',
    costCenter: 'CC-6015',
    status: 'CONCLUIDO' as const,
    createdAt: '2026-07-10 08:00',
    updatedAt: '2026-07-16 18:00',
    urgent: false,
    details: {
      origin: 'São Paulo (CGH)',
      destination: 'Curitiba (CWB)',
      departureDate: '2026-07-14',
      returnDate: '2026-07-16',
      flightNumber: 'LA-3110 / LA-3115',
      airline: 'LATAM Airlines',
      hotelName: 'Radisson Hotel Curitiba',
      reason: 'Auditoria prévia de padrões de segurança e compliance.',
      needsHotel: true,
      needsMobility: true,
      insuranceRequested: true,
      estimatedCost: 1950.00,
      nonFlownCreditUsed: null
    },
    history: [
      { date: '2026-07-10 08:00', action: 'Solicitação aprovada.', user: 'Iramaia Rodrigues' },
      { date: '2026-07-16 18:00', action: 'Viagem realizada e prestação de contas aprovada.', user: 'Roberto Silva' }
    ]
  },
  {
    id: 'SOL-2026-016',
    serviceType: 'transporte' as const,
    title: 'Transferência de Paciente Monitorado UTI -> Centro Cirúrgico',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-3021',
    status: 'EM_ATENDIMENTO' as const,
    createdAt: '2026-08-08 08:30',
    updatedAt: '2026-08-08 08:45',
    urgent: true,
    details: {
      transportType: 'Pessoa',
      origin: 'UTI Geral Adulto - Bloco A (3º Andar)',
      destination: 'Centro Cirúrgico - Bloco B (2º Andar)',
      date: '2026-08-08',
      time: '09:00',
      priority: 'Urgente',
      description: 'Transferência de paciente leito 304 com acompanhamento de enfermagem.',
      notes: 'Necessita maca com suporte duplo de soro e monitor multiparamétrico portátil.'
    },
    history: [
      { date: '2026-08-08 08:30', action: 'Solicitação de transporte interno aberta com prioridade urgente.', user: 'Carlos Andrade' },
      { date: '2026-08-08 08:45', action: 'Equipe de maqueiros alocada para o transporte.', user: 'Central de Transporte Interno' }
    ]
  },
  {
    id: 'SOL-2026-017',
    serviceType: 'transporte' as const,
    title: 'Movimentação de Equipamento Ultrassom Portátil entre Blocos',
    requesterId: 'USR-002',
    requesterName: 'Fernanda Lima',
    costCenter: 'CC-1040',
    status: 'CONCLUIDO' as const,
    createdAt: '2026-08-07 14:00',
    updatedAt: '2026-08-07 15:30',
    urgent: false,
    details: {
      transportType: 'Equipamento',
      origin: 'Engenharia Clínica - Subsolo Bloco C',
      destination: 'Pronto Atendimento - Térreo Bloco A',
      date: '2026-08-07',
      time: '14:30',
      priority: 'Normal',
      description: 'Transporte de ultrassom calibrado para reforço de atendimento no PA.',
      notes: 'Equipamento sensível com capa protetora antichoque.'
    },
    history: [
      { date: '2026-08-07 14:00', action: 'Solicitação de movimentação registrada.', user: 'Fernanda Lima' },
      { date: '2026-08-07 15:30', action: 'Equipamento entregue no destino e termo assinado.', user: 'Transporte Interno' }
    ]
  },
  {
    id: 'SOL-2026-018',
    serviceType: 'estacionamento' as const,
    title: 'Vaga Reservada para Médico Palestrante Convidado',
    requesterId: 'USR-002',
    requesterName: 'Fernanda Lima',
    costCenter: 'CC-7080',
    status: 'APROVADO' as const,
    createdAt: '2026-08-06 11:00',
    updatedAt: '2026-08-06 14:10',
    urgent: false,
    details: {
      parkingType: 'Visitante',
      vehiclePlate: 'ABC-4E88 (Simulado)',
      vehicleModel: 'Corolla Prata',
      periodStart: '2026-08-12 07:30',
      periodEnd: '2026-08-12 18:00',
      location: 'Edifício Garagem Bela Vista - Vagas VIP / Docentes',
      justification: 'Palestrante internacional convidado do Simpósio de Pesquisa Clínica IEP.',
      notes: 'Fluxo demonstrativo sujeito à validação institucional.'
    },
    history: [
      { date: '2026-08-06 11:00', action: 'Solicitação de vaga para visitante submetida.', user: 'Fernanda Lima' },
      { date: '2026-08-06 14:10', action: 'Vaga liberada e credencial temporária gerada na guarita.', user: 'Controle de Estacionamento' }
    ]
  },
  {
    id: 'SOL-2026-019',
    serviceType: 'estacionamento' as const,
    title: 'Cadastro e Atualização de Veículo do Corpo Clínico',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-3021',
    status: 'PENDENTE_APROVACAO' as const,
    createdAt: '2026-08-08 09:20',
    updatedAt: '2026-08-08 09:20',
    urgent: false,
    details: {
      parkingType: 'Cadastro/alteração de veículo',
      vehiclePlate: 'XYZ-9K21 (Simulado)',
      vehicleModel: 'Compass Branco',
      periodStart: '2026-08-15',
      periodEnd: '2027-08-15',
      location: 'Garagem Subsolo 1 - Funcionários',
      justification: 'Substituição de veículo cadastrado para acesso com TAG automática.',
      notes: 'Fluxo demonstrativo sujeito à validação institucional.'
    },
    history: [
      { date: '2026-08-08 09:20', action: 'Solicitação de cadastro de veículo enviada para validação.', user: 'Carlos Andrade' }
    ]
  },
  {
    id: 'SOL-2026-020',
    serviceType: 'entregas' as const,
    title: 'Malote de Medicamentos Especiais: Farmácia Central -> UTI Geral',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-3021',
    status: 'EM_ATENDIMENTO' as const,
    createdAt: '2026-08-08 10:00',
    updatedAt: '2026-08-08 10:20',
    urgent: true,
    details: {
      deliveryType: 'Malote',
      origin: 'Farmácia Central - Bloco C (1º Subsolo)',
      destination: 'Farmácia Satélite UTI - Bloco A (3º Andar)',
      senderName: 'Farmacêutico Responsável (Simulado)',
      recipientName: 'Carlos Andrade (Enfermeiro Chefe)',
      dateTimeDesired: '2026-08-08 11:00',
      itemDescription: 'Malote lacrado com antibióticos de reserva e insumos de emergência.',
      priority: 'Alta',
      notes: 'Entrega interna protocolada com conferência de lacre.'
    },
    history: [
      { date: '2026-08-08 10:00', action: 'Solicitação de entrega interna urgente aberta.', user: 'Carlos Andrade' },
      { date: '2026-08-08 10:20', action: 'Malote coletado pelo mensageiro interno.', user: 'Central de Entregas Internas' }
    ]
  },
  {
    id: 'SOL-2026-021',
    serviceType: 'entregas' as const,
    title: 'Coleta de Dossiês Físicos de Pesquisa no Arquivo Médico',
    requesterId: 'USR-002',
    requesterName: 'Fernanda Lima',
    costCenter: 'CC-7080',
    status: 'CONCLUIDO' as const,
    createdAt: '2026-08-05 09:30',
    updatedAt: '2026-08-05 14:00',
    urgent: false,
    details: {
      deliveryType: 'Coleta',
      origin: 'SAME / Arquivo Médico Central - Bloco D',
      destination: 'Secretaria do IEP - Bloco E (5º Andar)',
      senderName: 'Arquivo SAME',
      recipientName: 'Secretaria IEP',
      dateTimeDesired: '2026-08-05 14:00',
      itemDescription: '2 caixas arquivo com termos de consentimento e históricos de ensaios clínicos.',
      priority: 'Normal',
      notes: 'Movimentação interna realizada conforme protocolo de custódia documental.'
    },
    history: [
      { date: '2026-08-05 09:30', action: 'Solicitação de coleta interna enviada.', user: 'Fernanda Lima' },
      { date: '2026-08-05 14:00', action: 'Caixas entregues e assinadas pelo destinatário.', user: 'Central de Entregas Internas' }
    ]
  },
  {
    id: 'SOL-2026-022',
    serviceType: 'achados_perdidos' as const,
    title: 'Crachá de Acesso Médico Encontrado na Sala de Espera do PA',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-6015',
    status: 'EM_ATENDIMENTO' as const,
    createdAt: '2026-08-07 16:15',
    updatedAt: '2026-08-07 17:00',
    urgent: false,
    details: {
      occurrenceType: 'ENCONTREI_ITEM',
      category: 'Documentos/Crachás',
      description: 'Crachá institucional magnético com cordão azul do Hospital Sírio-Libanês.',
      location: 'Pronto Atendimento - Poltrona 12 da recepção externa',
      datetimeApprox: '2026-08-07 16:00',
      characteristics: 'Nome do titular: Dr. Fernando M. (fictício), sem avarias visíveis.',
      contact: 'Ramal 4021 - Recepção Central',
      stage: 'ITEM_LOCALIZADO',
      notes: 'Item guardado no cofre do setor de Achados e Perdidos aguardando retirada.'
    },
    history: [
      { date: '2026-08-07 16:15', action: 'Item encontrado registrado pelo colaborador.', user: 'Carlos Andrade' },
      { date: '2026-08-07 17:00', action: 'Item custodiado e catalogado no inventário de Achados e Perdidos.', user: 'Atendente Achados e Perdidos' }
    ]
  },
  {
    id: 'SOL-2026-023',
    serviceType: 'achados_perdidos' as const,
    title: 'Estojo com Óculos de Grau Perdido no Auditório Principal',
    requesterId: 'USR-002',
    requesterName: 'Fernanda Lima',
    costCenter: 'CC-1040',
    status: 'PENDENTE_APROVACAO' as const,
    createdAt: '2026-08-08 11:30',
    updatedAt: '2026-08-08 11:30',
    urgent: false,
    details: {
      occurrenceType: 'PERDI_ITEM',
      category: 'Óculos',
      description: 'Óculos de grau armação tartaruga marrom em estojo de couro preto.',
      location: 'Auditório IEP - Fileira G lado direito',
      datetimeApprox: '2026-08-08 10:30',
      characteristics: 'Marca Ray-Ban (simulada), lente multifocal com proteção UV.',
      contact: 'fernanda.lima@ficticio.org / Ramal 1040',
      stage: 'EM_BUSCA',
      notes: 'Solicitante relatou esquecimento logo após o término da reunião clínica.'
    },
    history: [
      { date: '2026-08-08 11:30', action: 'Registro de perda aberto pela colaboradora.', user: 'Fernanda Lima' }
    ]
  },
  {
    id: 'SOL-2026-024',
    serviceType: 'solicitacao_imagens' as const,
    title: 'Verificação de CFTV: Avaria em Veículo na Garagem Subsolo 2',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-3021',
    status: 'PENDENTE_APROVACAO' as const,
    createdAt: '2026-08-07 18:00',
    updatedAt: '2026-08-07 18:00',
    urgent: false,
    details: {
      imageRequestType: 'CFTV / Segurança Patrimonial',
      purpose: 'Apuração de incidente patrimonial (pequeno arranhão em veículo estacionado)',
      sector: 'Edifício Garagem - Subsolo 2 (Corredor D)',
      periodReference: '2026-08-07 das 14:00 às 17:30',
      description: 'Solicitação de gravação das câmeras CAM-SS2-04 e CAM-SS2-05 para verificar passagem de carrinho de transporte.',
      justification: 'Identificação de eventual contato com lateral de veículo operacional (simulação).',
      attachmentsMetadata: 'croqui_posicao_veiculo_demo.pdf (Metadados apenas)',
      notice: 'Fluxo demonstrativo. Regras de privacidade, autorização e retenção dependem de validação institucional.'
    },
    history: [
      { date: '2026-08-07 18:00', action: 'Solicitação de imagens submetida para avaliação da Segurança Patrimonial.', user: 'Carlos Andrade' }
    ]
  },
  {
    id: 'SOL-2026-025',
    serviceType: 'solicitacao_imagens' as const,
    title: 'Registro Fotográfico Institucional da Inauguração de Nova Ala',
    requesterId: 'USR-002',
    requesterName: 'Fernanda Lima',
    costCenter: 'CC-2055',
    status: 'CONCLUIDO' as const,
    createdAt: '2026-08-01 09:00',
    updatedAt: '2026-08-03 17:00',
    urgent: false,
    details: {
      imageRequestType: 'Registro Institucional de Evento',
      purpose: 'Divulgação em mural interno e newsletter corporativa da Infraestrutura',
      sector: 'Ala de Internação - 6º Andar Bloco A',
      periodReference: '2026-08-02 das 10:00 às 12:00',
      description: 'Cobertura fotográfica da cerimônia simbólica de entrega da reforma da ala.',
      justification: 'Material institucional para arquivo histórico da Diretoria de Infraestrutura.',
      attachmentsMetadata: 'termo_cessao_imagem_evento_demo.pdf',
      notice: 'Fluxo demonstrativo. Regras de privacidade, autorização e retenção dependem de validação institucional.'
    },
    history: [
      { date: '2026-08-01 09:00', action: 'Solicitação criada e aprovada pela coordenação.', user: 'Fernanda Lima' },
      { date: '2026-08-03 17:00', action: 'Imagens tratadas e disponibilizadas no repositório institucional.', user: 'Comunicação Corporativa' }
    ]
  },
  {
    id: 'SOL-2026-026',
    serviceType: 'autorizacao_excepcional' as const,
    title: 'Extrapolação Orçamentária Emergencial para Peça de Tomógrafo',
    requesterId: 'USR-002',
    requesterName: 'Fernanda Lima',
    costCenter: 'CC-4010',
    status: 'PENDENTE_APROVACAO' as const,
    createdAt: '2026-08-08 07:45',
    updatedAt: '2026-08-08 07:45',
    urgent: true,
    details: {
      exceptionCategory: 'Orçamentária / Custo',
      reason: 'Aquisição em regime de urgência de tubo de raios-X para substituição preventiva imediata no Pronto Atendimento.',
      validityPeriod: 'Agosto/2026 (Excepcionalidade única)',
      unitCostCenter: 'CC-4010 - Centro Cirúrgico e Diagnóstico',
      mandatoryJustification: 'Manutenção da capacidade assistencial ininterrupta do PA durante o fim de semana com alto volume de exames.',
      estimatedImpact: 'Impacto financeiro estimado em R$ 42.000,00 sobre o teto mensal do CC-4010.',
      notes: 'Encaminhado diretamente para deliberação da Diretoria de Operações.'
    },
    history: [
      { date: '2026-08-08 07:45', action: 'Autorização excepcional submetida para alçada da Diretoria.', user: 'Fernanda Lima' }
    ]
  },
  {
    id: 'SOL-2026-027',
    serviceType: 'autorizacao_excepcional' as const,
    title: 'Acesso Fora do Expediente para Calibração de Equipamentos CME',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-2055',
    status: 'APROVADO' as const,
    createdAt: '2026-08-04 15:00',
    updatedAt: '2026-08-05 10:00',
    urgent: false,
    details: {
      exceptionCategory: 'Operacional / Horário',
      reason: 'Manutenção e validação termométrica de autoclaves fora do horário cirúrgico.',
      validityPeriod: '10/08/2026 a 12/08/2026 (das 22h às 05h)',
      unitCostCenter: 'CC-2055 - Infraestrutura & Supply Chain',
      mandatoryJustification: 'Evitar interrupção da rotina diurna de esterilização de instrumentais cirúrgicos.',
      estimatedImpact: 'Sem custo adicional direto; escala de plantão técnico acordada.',
      notes: 'Autorização concedida com ciência da coordenação de enfermagem e segurança.'
    },
    history: [
      { date: '2026-08-04 15:00', action: 'Solicitação de excepcionalidade aberta.', user: 'Carlos Andrade' },
      { date: '2026-08-05 10:00', action: 'Aprovada pela Gerência de Operações.', user: 'Iramaia Rodrigues' }
    ]
  },
  {
    id: 'SOL-2026-028',
    serviceType: 'liberacao_acesso' as const,
    title: 'Acesso Temporário para Auditores de Acreditação Hospitalar',
    requesterId: 'USR-009',
    requesterName: 'Marcelo Alves',
    costCenter: 'CC-6015',
    status: 'APROVADO' as const,
    createdAt: '2026-08-03 11:20',
    updatedAt: '2026-08-04 09:00',
    urgent: false,
    details: {
      accessType: 'Acesso temporário (auditor/consultor)',
      targetResource: 'Áreas Assistenciais, CME, Farmácia Central e Arquivo Médico',
      targetUser: 'Auditor Líder - Equipe Externa de Certificação (3 pessoas)',
      justification: 'Auditoria de conformidade com normas de qualidade hospitalar JCI.',
      validityPeriod: '15/08/2026 a 19/08/2026',
      managerResponsible: 'Marcelo Alves (Auditoria Interna)',
      notes: 'Fluxo demonstrativo. Não manipula credenciais reais nem integra com Active Directory.'
    },
    history: [
      { date: '2026-08-03 11:20', action: 'Solicitação de liberação de acesso temporário registrada.', user: 'Marcelo Alves' },
      { date: '2026-08-04 09:00', action: 'Aprovado pelo Gestor e crachás de visitante programados na recepção.', user: 'Fernanda Lima' }
    ]
  },
  {
    id: 'SOL-2026-029',
    serviceType: 'liberacao_acesso' as const,
    title: 'Solicitação de Acesso Magnético à Sala Segura do Data Center',
    requesterId: 'USR-008',
    requesterName: 'Patrícia Souza',
    costCenter: 'CC-5020',
    status: 'PENDENTE_APROVACAO' as const,
    createdAt: '2026-08-08 14:00',
    updatedAt: '2026-08-08 14:00',
    urgent: false,
    details: {
      accessType: 'Solicitar acesso especial',
      targetResource: 'Sala Segura TI / Racks de Servidores Principais (Bloco A - 2º Subsolo)',
      targetUser: 'Patrícia Souza (Governança e TI)',
      justification: 'Instalação física de novos switches de alta redundância da rede hospitalar.',
      validityPeriod: 'Permanente com revisão semestral',
      managerResponsible: 'Diretoria de Tecnologia e Governança',
      notes: 'Fluxo demonstrativo sem alteração de permissões no IAM corporativo.'
    },
    history: [
      { date: '2026-08-08 14:00', action: 'Solicitação de acesso especial enviada para aprovação do gestor.', user: 'Patrícia Souza' }
    ]
  },
  {
    id: 'SOL-2026-030',
    serviceType: 'investigacao_ocorrencia' as const,
    title: 'Registro de Ocorrência: Avaria em Equipamento de Monitorização',
    requesterId: 'USR-001',
    requesterName: 'Carlos Andrade',
    costCenter: 'CC-3021',
    status: 'EM_ATENDIMENTO' as const,
    createdAt: '2026-08-07 10:15',
    updatedAt: '2026-08-07 11:30',
    urgent: false,
    details: {
      category: 'Patrimonial / Operacional',
      location: 'UTI Geral Adulto - Leito 14',
      dateOccurrence: '07/08/2026 08:30',
      description: 'Cabo de sensor de oximetria danificado durante troca de turno.',
      statusLevantamento: 'Campos e procedimento pendentes de levantamento no sistema atual.',
      isDemonstrative: true
    },
    history: [
      { date: '2026-08-07 10:15', action: 'Ocorrência registrada no catálogo de serviços.', user: 'Carlos Andrade' },
      { date: '2026-08-07 11:30', action: 'Triagem iniciada pela equipe de Segurança / Facilities.', user: 'Fernanda Lima' }
    ]
  }
];

export const mockEmployeeProfile = {
  matricula: 'MAT-DEMO-01',
  nome: 'Colaborador Demo',
  email: 'colaborador.demo@hospital-demo.org',
  cargo: 'Cargo Demonstrativo',
  departamento: 'Área Demonstrativa',
  centroCusto: 'CC-DEMO-01',
  gestor: 'Gestor Demo',
  diretoria: 'Diretoria de Operações Demonstrativa',
  unidade: 'Complexo Demonstrativo Central'
};

export const mockServiceScopes = {
  operador_viagens: ['viagem'],
  operador_servicos_gerais: ['entregas', 'estacionamento', 'achados_perdidos', 'transporte'],
  coordenacao: ['ALL'],
  administrador: ['ALL']
};

export const mockPolicyDocuments = [
  {
    id: 'POL-VIA-001',
    title: 'Diretriz de Viagens Corporativas e Hospedagem',
    service: 'viagem' as const,
    version: 'v2.4',
    status: 'VIGENTE' as const,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    audience: 'TODOS' as const,
    sourceType: 'DEMONSTRATIVO' as const,
    sourceDocument: null,
    content: 'Antecedência mínima de 14 dias para voos nacionais. Tarifa preferencial corporativa.',
    updatedAt: '2026-08-01'
  },
  {
    id: 'POL-MOB-002',
    title: 'Política de Mobilidade Urbana e Vouchers Noturnos',
    service: 'mobilidade' as const,
    version: 'v1.8',
    status: 'VIGENTE' as const,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    audience: 'TODOS' as const,
    sourceType: 'DEMONSTRATIVO' as const,
    sourceDocument: null,
    content: 'Corridas entre 22h e 06h autorizadas para plantonistas. Uso exclusivo de voucher corporativo.',
    updatedAt: '2026-08-01'
  },
  {
    id: 'POL-COR-001',
    title: 'Procedimento Operacional de Envios e Postagens',
    service: 'correios' as const,
    version: 'v2.0',
    status: 'VIGENTE' as const,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    audience: 'TODOS' as const,
    sourceType: 'DEMONSTRATIVO' as const,
    sourceDocument: null,
    content: 'SEDEX 10 restrito a documentos e amostras com justificativa formal de urgência.',
    updatedAt: '2026-08-01'
  },
  {
    id: 'POL-XER-001',
    title: 'Norma de Impressões Gráficas e Tiragens Especiais',
    service: 'xerox' as const,
    version: 'v1.2',
    status: 'VIGENTE' as const,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    audience: 'TODOS' as const,
    sourceType: 'DEMONSTRATIVO' as const,
    sourceDocument: null,
    content: 'Tiragens superiores a 100 cópias demandam aprovação do centro de custo requisitante.',
    updatedAt: '2026-08-01'
  },
  {
    id: 'POL-ACS-001',
    title: 'Norma de Controle de Acesso e Credenciamento Temporário',
    service: 'liberacao_acesso' as const,
    version: 'v1.0',
    status: 'VIGENTE' as const,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    audience: 'TODOS' as const,
    sourceType: 'DEMONSTRATIVO' as const,
    sourceDocument: null,
    content: 'Credenciais de auditoria têm validade máxima de 5 dias úteis com assinatura de termo de sigilo.',
    updatedAt: '2026-08-01'
  }
];

// Inicializar repositórios com dados mock
mockUsers.forEach(user => userRepository.create(user));
mockRequests.forEach(req => requestRepository.create(req));
