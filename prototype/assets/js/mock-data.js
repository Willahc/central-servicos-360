/**
 * CENTRAL DE SERVIÇOS 360 - DADOS FICTÍCIOS CENTRALIZADOS (MOCK DATA)
 * Protótipo Interno Estático - Sem dependências externas / Sem dados reais
 */

window.CS360_INITIAL_MOCK = {
  // Configuração da marca e avisos
  systemInfo: {
    appName: "Central de Serviços 360",
    version: "0.5.0 (MVP Estático)",
    warningNotice: "Protótipo interno — dados fictícios. Autenticação simulada.",
    mode: "MOCK / ADAPTADORES SIMULADOS ATIVOS"
  },

  // 9 Perfis de Usuários Simulado (RBAC)
  roles: [
    { id: "colaborador", name: "Colaborador (Solicitante)", description: "Acesso ao catálogo, solicitações próprias, histórico e chatbot." },
    { id: "gestor", name: "Gestor Aprovador", description: "Aprovação de solicitações de subordinados conforme alçadas." },
    { id: "viagens", name: "Gestão de Viagens (William)", description: "Operacionalização de voos, hotéis, seguro e bilhetes não voados." },
    { id: "faturamento", name: "Faturamento e Apoio Operacional (Maria)", description: "Gestão de mobilidade, faturas, correios e conciliação." },
    { id: "coordenadora", name: "Coordenadora (Renata Monteiro)", description: "Acompanhamento tático, SLA, exceções e escalonamento." },
    { id: "gerencia", name: "Gerência (Iramaia Rodrigues)", description: "Indicadores estratégicos e relatórios consolidados." },
    { id: "financeiro", name: "Financeiro", description: "Consolidação por centro de custo, faturas e carga de despesas." },
    { id: "administrador", name: "Administrador", description: "Parametrizações, gestão de perfis e reset de demonstração." },
    { id: "auditoria", name: "Auditoria", description: "Trilha auditável de eventos e conformidade do sistema." }
  ],

  // Usuários Fictícios
  users: [
    { id: "USR-001", name: "Carlos Andrade", email: "carlos.andrade@ficticio.org", role: "colaborador", department: "Enfermagem Assistencial", costCenter: "CC-3021 (Assistência)" },
    { id: "USR-002", name: "Fernanda Lima", email: "fernanda.lima@ficticio.org", role: "gestor", department: "Diretoria Médica", costCenter: "CC-1010 (Diretoria)" },
    { id: "USR-003", name: "William Nunes (Simulado)", email: "william.nunes@ficticio.org", role: "viagens", department: "Central de Serviços", costCenter: "CC-4000 (Infraestrutura)" },
    { id: "USR-004", name: "Maria Catarina (Simulado)", email: "maria.catarina@ficticio.org", role: "faturamento", department: "Central de Serviços", costCenter: "CC-4000 (Infraestrutura)" },
    { id: "USR-005", name: "Renata Monteiro (Simulado)", email: "renata.monteiro@ficticio.org", role: "coordenadora", department: "Central de Serviços", costCenter: "CC-4000 (Infraestrutura)" },
    { id: "USR-006", name: "Iramaia Rodrigues (Simulado)", email: "iramaia.rodrigues@ficticio.org", role: "gerencia", department: "Hotelaria & Infraestrutura", costCenter: "CC-4000 (Infraestrutura)" },
    { id: "USR-007", name: "Roberto Silva", email: "roberto.silva@ficticio.org", role: "financeiro", department: "Controladoria & Finanças", costCenter: "CC-2005 (Financeiro)" },
    { id: "USR-008", name: "Patrícia Souza", email: "patricia.souza@ficticio.org", role: "administrador", department: "Tecnologia da Informação", costCenter: "CC-5001 (TI)" },
    { id: "USR-009", name: "Marcelo Alves", email: "marcelo.alves@ficticio.org", role: "auditoria", department: "Governança & Riscos", costCenter: "CC-5002 (Compliance)" }
  ],

  // Centros de Custo Fictícios
  costCenters: [
    { code: "CC-1010", name: "Diretoria Médica", manager: "Fernanda Lima" },
    { code: "CC-2005", name: "Controladoria & Finanças", manager: "Roberto Silva" },
    { code: "CC-3021", name: "Enfermagem Assistencial", manager: "Mariana Costa" },
    { code: "CC-4000", name: "Infraestrutura & Supply Chain", manager: "Renata Monteiro" },
    { code: "CC-5001", name: "Tecnologia da Informação", manager: "Patrícia Souza" },
    { code: "CC-6012", name: "Ensino e Pesquisa", manager: "Dr. Eduardo Ramos" }
  ],

  // Solicitações Consolidadas (Base Central)
  requests: [
    {
      id: "SOL-2026-001",
      serviceType: "viagem",
      title: "Participação no Congresso Nacional de Hotelaria Hospitalar",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-3021",
      status: "PENDENTE_APROVACAO", // Rascunho, PENDENTE_APROVACAO, APROVADO, EM_ATENDIMENTO, CONCLUIDO, REJEITADO, CANCELADO
      createdAt: "2026-08-01 10:15",
      updatedAt: "2026-08-01 10:30",
      urgent: false,
      details: {
        origin: "São Paulo (GRU)",
        destination: "Brasília (BSB)",
        departureDate: "2026-09-15",
        returnDate: "2026-09-18",
        reason: "Participação no congresso científico com apresentação de trabalho.",
        needsHotel: true,
        needsMobility: true,
        insuranceRequested: true,
        estimatedCost: 2450.00,
        nonFlownCreditUsed: null
      },
      history: [
        { date: "2026-08-01 10:15", action: "Criado rascunho de solicitação de viagem.", user: "Carlos Andrade" },
        { date: "2026-08-01 10:30", action: "Enviado para aprovação do gestor.", user: "Carlos Andrade" }
      ]
    },
    {
      id: "SOL-2026-002",
      serviceType: "viagem",
      title: "Visita Técnica à Unidade de Apoio Logístico",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-4000",
      status: "APROVADO",
      createdAt: "2026-07-20 14:00",
      updatedAt: "2026-07-21 09:00",
      urgent: false,
      details: {
        origin: "São Paulo (CGH)",
        destination: "Rio de Janeiro (SDU)",
        departureDate: "2026-08-20",
        returnDate: "2026-08-22",
        reason: "Alinhamento operacional de procedimentos gráficos.",
        needsHotel: true,
        needsMobility: true,
        insuranceRequested: false,
        estimatedCost: 1890.00,
        nonFlownCreditUsed: "TKT-99420 (R$ 450,00)"
      },
      history: [
        { date: "2026-07-20 14:00", action: "Solicitação enviada.", user: "Carlos Andrade" },
        { date: "2026-07-21 09:00", action: "Aprovado pelo gestor. Rationale: Viagem alinhada com plano orçamentário.", user: "Fernanda Lima" }
      ]
    },
    {
      id: "SOL-2026-003",
      serviceType: "mobilidade",
      title: "Inclusão de Acesso Uber for Business - Equipe de Plantão",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-3021",
      status: "CONCLUIDO",
      createdAt: "2026-07-25 11:20",
      updatedAt: "2026-07-25 16:45",
      urgent: false,
      details: {
        actionType: "inclusao",
        platform: "Uber for Business",
        monthlyLimit: 500.00,
        reason: "Deslocamentos emergenciais em plantão noturno extraordinário."
      },
      history: [
        { date: "2026-07-25 11:20", action: "Solicitação de cadastro de acesso enviada.", user: "Carlos Andrade" },
        { date: "2026-07-25 16:45", action: "Concluído pelo operador em modo mock.", user: "Maria Catarina" }
      ]
    },
    {
      id: "SOL-2026-004",
      serviceType: "correios",
      title: "Envio de Documentação Contratual Auditada",
      requesterId: "USR-002",
      requesterName: "Fernanda Lima",
      costCenter: "CC-1010",
      status: "EM_ATENDIMENTO",
      createdAt: "2026-08-02 08:30",
      updatedAt: "2026-08-02 11:00",
      urgent: true,
      details: {
        usageType: "institucional",
        modality: "SEDEX 10",
        destinationZip: "70040-010",
        urgencyRationale: "Prazo regulatório de entrega até 12h do dia seguinte.",
        trackingCode: "BR987654321SB"
      },
      history: [
        { date: "2026-08-02 08:30", action: "Solicitação de postagem urgente enviada.", user: "Fernanda Lima" },
        { date: "2026-08-02 11:00", action: "Código de rastreamento associado.", user: "Maria Catarina" }
      ]
    },
    {
      id: "SOL-2026-005",
      serviceType: "xerox",
      title: "Impressão de Manuais de Procedimentos Operacionais Padrão",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-3021",
      status: "EM_ATENDIMENTO",
      createdAt: "2026-08-03 09:00",
      updatedAt: "2026-08-03 09:30",
      urgent: false,
      details: {
        format: "A4",
        colorMode: "Colorido",
        paperType: "Sulfite 90g",
        copies: 50,
        finishing: "Espiral com capa transparente",
        fileName: "Manual_POP_Enfermagem_2026.pdf"
      },
      history: [
        { date: "2026-08-03 09:00", action: "Arquivo enviado para fila gráfica.", user: "Carlos Andrade" },
        { date: "2026-08-03 09:30", action: "Job alocado na fila de produção gráfica.", user: "Atendimento Xerox" }
      ]
    }
  ],

  // Bilhetes Não Voados e Créditos de Passagens (RN-VIA-002)
  nonFlownTickets: [
    { id: "TKT-99420", passenger: "Carlos Andrade", airline: "LATAM", ticketNumber: "045-2345678901", originalDate: "2026-03-10", originalRoute: "GRU-BSB", originalAmount: 850.00, creditBalance: 450.00, expiresAt: "2026-11-30", status: "DISPONIVEL" },
    { id: "TKT-88112", passenger: "Fernanda Lima", airline: "GOL", ticketNumber: "127-9876543210", originalDate: "2026-04-15", originalRoute: "CGH-SDU", originalAmount: 620.00, creditBalance: 620.00, expiresAt: "2026-10-15", status: "DISPONIVEL" },
    { id: "TKT-77341", passenger: "Mariana Costa", airline: "AZUL", ticketNumber: "577-4561237890", originalDate: "2026-01-20", originalRoute: "VCP-CNF", originalAmount: 1100.00, creditBalance: 0.00, expiresAt: "2026-06-30", status: "UTILIZADO" }
  ],

  // Corridas de Mobilidade Simuladas (Uber / Táxi)
  mobilityRides: [
    { id: "RID-5501", passenger: "Carlos Andrade", date: "2026-08-01 22:45", origin: "Unidade Paulista", destination: "Residência Fictícia", cost: 48.50, provider: "Uber for Business", costCenter: "CC-3021", policyFlag: true, flagReason: "Corrida em horário noturno fora de viagem ativa (Requer validação no faturamento)" },
    { id: "RID-5502", passenger: "Fernanda Lima", date: "2026-07-28 14:10", origin: "Unidade Paulista", destination: "Aeroporto de Congonhas", cost: 35.00, provider: "Táxi Digital", costCenter: "CC-1010", policyFlag: false, flagReason: null },
    { id: "RID-5503", passenger: "Roberto Silva", date: "2026-07-25 09:30", origin: "Aeroporto Santos Dumont", destination: "Hotel Fictício RJ", cost: 42.10, provider: "Uber for Business", costCenter: "CC-2005", policyFlag: false, flagReason: null }
  ],

  // Fornecedores & Contratos
  suppliers: [
    { id: "SUP-01", name: "Copastur Viagens e Turismo", category: "Agência de Viagens", contract: "CT-2024-089", status: "Ativo", slaTarget: "Atendimento cotação até 2h" },
    { id: "SUP-02", name: "Uber for Business Brasil", category: "Mobilidade Urbana", contract: "CT-2023-112", status: "Ativo", slaTarget: "Disponibilidade 99.9%" },
    { id: "SUP-03", name: "Empresa Brasileira de Correios e Telégrafos", category: "Serviços Postais", contract: "CT-2022-045", status: "Ativo", slaTarget: "Coleta diária às 16h" },
    { id: "SUP-04", name: "Gráfica & Soluções Digitais Fictícia", category: "Xerox e Impressões", contract: "CT-2025-014", status: "Ativo", slaTarget: "Impressão Padrão 24h / Urgente 4h" }
  ],

  // Fila de Atendimento Humano (Chamados)
  tickets: [
    { id: "TICK-101", title: "Dúvida sobre franquia de bagagem adicional", requester: "Carlos Andrade", category: "Viagens", status: "EM_ABERTO", priority: "Média", createdAt: "2026-08-04 14:20" },
    { id: "TICK-102", title: "Solicitação de limite emergencial Uber plantão", requester: "Mariana Costa", category: "Mobilidade", status: "RESOLVIDO", priority: "Alta", createdAt: "2026-08-01 09:10" }
  ],

  // Base de Conhecimento Oficial (RN-CHAT-001)
  knowledgeArticles: [
    {
      id: "ART-01",
      title: "Como Solicitar uma Viagem Corporativa",
      category: "Viagens",
      updatedAt: "2026-07-15",
      docRef: "POL-VIA-2026-V2.pdf (Seção 3.1)",
      content: "Para solicitar uma viagem corporativa, acesse o Portal da Central de Serviços 360, selecione Nova Solicitação -> Viagens Corporativas. Preencha origem, destino, datas e centro de custo. A solicitação será encaminhada para aprovação do seu Gestor antes do envio para cotação."
    },
    {
      id: "ART-02",
      title: "Regras e Cadastro de Acesso à Mobilidade (Uber / Táxi)",
      category: "Mobilidade",
      updatedAt: "2026-07-20",
      docRef: "NOR-MOB-2025-V1.pdf (Seção 4)",
      content: "O uso de mobilidade corporativa é restrito a deslocamentos a trabalho ou plantões noturnos autorizados. A inclusão de perfil Uber for Business é solicitada no módulo Mobilidade e passa por validação do Faturamento e da Coordenação."
    },
    {
      id: "ART-03",
      title: "Como Enviar Encomendas via Correios (Institucional vs. Pessoal)",
      category: "Correios",
      updatedAt: "2026-06-10",
      docRef: "DIR-COR-2024-V3.pdf (Seção 2)",
      content: "Envios institucionais exigem indicação do Centro de Custo. Envios expressos como SEDEX 10 exigem justificativa formal de urgência. Envios de uso pessoal dependem de autorização prévia e indicação de forma de acerto."
    },
    {
      id: "ART-04",
      title: "Solicitação de Impressões e Serviços Gráficos",
      category: "Xerox",
      updatedAt: "2026-05-18",
      docRef: "MAN-XER-2025-V1.pdf (Seção 5)",
      content: "As solicitações gráficas devem indicar o formato (A4/A3), tipo de papel, tiragem e acabamento (encadernação, plastificação). Prazos padrão são de 24h úteis para tiragens normais."
    }
  ],

  // Trilha Auditável Inicial (RN-SEG-003)
  auditLogs: [
    { id: "AUD-1001", timestamp: "2026-08-06 08:00:00", user: "Patrícia Souza (Admin)", role: "administrador", action: "SISTEMA_INICIALIZADO", resource: "CS360_CORE", ip: "127.0.0.1 (Local Mock)", details: "Sessão iniciada no protótipo estático sem chamadas externas." },
    { id: "AUD-1002", timestamp: "2026-08-06 08:15:30", user: "Carlos Andrade", role: "colaborador", action: "SOLICITACAO_CRIADA", resource: "SOL-2026-001", ip: "127.0.0.1 (Local Mock)", details: "Criada solicitação de viagem para Brasília." }
  ]
};

// Inicialização segura no localStorage com prefixo cs360_
(function initializeMockStorage() {
  const STORAGE_KEY = "cs360_data";
  const USER_ROLE_KEY = "cs360_active_role";

  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.CS360_INITIAL_MOCK));
  }
  if (!localStorage.getItem(USER_ROLE_KEY)) {
    localStorage.setItem(USER_ROLE_KEY, "colaborador");
  }
})();
