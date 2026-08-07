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
    { id: "viagens", name: "Operador de Viagens (Simulado)", description: "Operacionalização de voos, hotéis, seguro e bilhetes não voados." },
    { id: "faturamento", name: "Faturamento e Apoio Operacional (Simulado)", description: "Gestão de mobilidade, faturas, correios e conciliação." },
    { id: "coordenadora", name: "Coordenadora (Simulado)", description: "Acompanhamento tático, SLA, exceções e escalonamento." },
    { id: "gerencia", name: "Gerência (Simulado)", description: "Indicadores estratégicos e relatórios consolidados." },
    { id: "financeiro", name: "Financeiro", description: "Consolidação por centro de custo, faturas e carga de despesas." },
    { id: "administrador", name: "Administrador", description: "Parametrizações, gestão de perfis e reset de demonstração." },
    { id: "auditoria", name: "Auditoria", description: "Trilha auditável de eventos e conformidade do sistema." }
  ],

  // Usuários Fictícios
  users: [
    { id: "USR-001", name: "Carlos Andrade", email: "carlos.andrade@ficticio.org", role: "colaborador", department: "Departamento A (Simulado)", costCenter: "CC-3021 (Assistência)" },
    { id: "USR-002", name: "Fernanda Lima", email: "fernanda.lima@ficticio.org", role: "gestor", department: "Departamento B (Simulado)", costCenter: "CC-1010 (Diretoria)" },
    { id: "USR-003", name: "Operador de Viagens (Simulado)", email: "william.nunes@ficticio.org", role: "viagens", department: "Suporte Operacional (Simulado)", costCenter: "CC-4000 (Infraestrutura)" },
    { id: "USR-004", name: "Faturamento (Simulado)", email: "maria.catarina@ficticio.org", role: "faturamento", department: "Suporte Operacional (Simulado)", costCenter: "CC-4000 (Infraestrutura)" },
    { id: "USR-005", name: "Coordenadora (Simulado)", email: "renata.monteiro@ficticio.org", role: "coordenadora", department: "Suporte Operacional (Simulado)", costCenter: "CC-4000 (Infraestrutura)" },
    { id: "USR-006", name: "Gerência (Simulado)", email: "iramaia.rodrigues@ficticio.org", role: "gerencia", department: "Infraestrutura (Simulado)", costCenter: "CC-4000 (Infraestrutura)" },
    { id: "USR-007", name: "Roberto Silva", email: "roberto.silva@ficticio.org", role: "financeiro", department: "Departamento C (Simulado)", costCenter: "CC-2005 (Financeiro)" },
    { id: "USR-008", name: "Patrícia Souza", email: "patricia.souza@ficticio.org", role: "administrador", department: "Departamento D (Simulado)", costCenter: "CC-5001 (TI)" },
    { id: "USR-009", name: "Marcelo Alves", email: "marcelo.alves@ficticio.org", role: "auditoria", department: "Departamento E (Simulado)", costCenter: "CC-5002 (Compliance)" }
  ],

  // Centros de Custo Fictícios
  costCenters: [
    { code: "CC-1010", name: "Centro B (Simulado)", manager: "Gestor Simulado" },
    { code: "CC-2005", name: "Centro C (Simulado)", manager: "Financeiro Simulado" },
    { code: "CC-3021", name: "Centro A (Simulado)", manager: "Gestor Simulado A" },
    { code: "CC-4000", name: "Centro F (Simulado)", manager: "Coordenador Simulado" },
    { code: "CC-5001", name: "Centro D (Simulado)", manager: "Admin Simulado" },
    { code: "CC-6012", name: "Centro G (Simulado)", manager: "Gestor Simulado B" }
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
        { date: "2026-07-25 16:45", action: "Concluído pelo operador em modo mock.", user: "Operador Simulado" }
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
        { date: "2026-08-02 11:00", action: "Código de rastreamento associado.", user: "Operador Simulado" }
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
    { id: "TKT-77341", passenger: "Usuário Simulado", airline: "AZUL", ticketNumber: "577-4561237890", originalDate: "2026-01-20", originalRoute: "VCP-CNF", originalAmount: 1100.00, creditBalance: 0.00, expiresAt: "2026-06-30", status: "UTILIZADO" }
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
    { id: "TICK-102", title: "Solicitação de limite emergencial Uber plantão", requester: "Usuário Simulado", category: "Mobilidade", status: "RESOLVIDO", priority: "Alta", createdAt: "2026-08-01 09:10" }
  ],

  // Base de Conhecimento Oficial (RN-CHAT-001)
  knowledgeArticles: [
    {
      id: "ART-01",
      title: "Como Solicitar uma Viagem Corporativa (Demonstrativo)",
      category: "Viagens",
      updatedAt: "2026-07-15",
      docRef: "SIMULADO-VIA-001",
      content: "Para solicitar uma viagem corporativa, acesse o Portal da Central de Serviços 360 (Simulado), selecione Nova Solicitação -> Viagens Corporativas. Preencha origem, destino, datas e centro de custo. A solicitação será encaminhada para aprovação do seu Gestor antes do envio para cotação."
    },
    {
      id: "ART-02",
      title: "Regras de Acesso à Mobilidade (Demonstrativo)",
      category: "Mobilidade",
      updatedAt: "2026-07-20",
      docRef: "SIMULADO-MOB-001",
      content: "O uso de mobilidade corporativa é restrito a deslocamentos a trabalho ou plantões noturnos autorizados. A inclusão de perfil Uber for Business é solicitada no módulo Mobilidade e passa por validação do Faturamento e da Coordenação."
    },
    {
      id: "ART-03",
      title: "Envio de Encomendas via Correios (Demonstrativo)",
      category: "Correios",
      updatedAt: "2026-06-10",
      docRef: "SIMULADO-COR-001",
      content: "Envios institucionais exigem indicação do Centro de Custo. Envios expressos como SEDEX 10 exigem justificativa formal de urgência. Envios de uso pessoal dependem de autorização prévia e indicação de forma de acerto."
    },
    {
      id: "ART-04",
      title: "Impressões e Serviços Gráficos (Demonstrativo)",
      category: "Xerox",
      updatedAt: "2026-05-18",
      docRef: "SIMULADO-XER-001",
      content: "As solicitações gráficas devem indicar o formato (A4/A3), tipo de papel, tiragem e acabamento (encadernação, plastificação). Prazos padrão são de 24h úteis para tiragens normais."
    }
  ],

  // ============================================================
  // DADOS DEMONSTRATIVOS DO DASHBOARD (UI-1.2 - Centralizados)
  // ============================================================
  // NOTA: Todos os valores abaixo são demonstrativos.
  // NÃO representam dados reais de produção.
  // Fonte: dataset local demonstrativo (não derivado de API)
  dashboard: {
    // KPIs Principais
    kpis: {
      solicitacoesHoje: { value: 128, label: "Solicitações hoje", change: "+12% vs ontem", changeType: "up", note: "sim." },
      viagensAndamento: { value: 34, label: "Viagens em andamento", change: "+8% vs ontem", changeType: "up", note: "sim." },
      prazoVencido: { value: 7, label: "Itens com prazo vencido", change: "-2 vs ontem", changeType: "down", note: "sim.", concept: "itens com deadline vencido (diferente da fila operacional)" },
      economiaMes: { value: 128450, label: "Economia no mês", change: "-18% vs mês anterior", changeType: "down", currency: "BRL", note: "sim." },
      bilhetesNaoVoados: { value: 5, label: "Bilhetes não voados", change: "-1 vs ontem", changeType: "down", note: "sim." },
      atendimentosAbertos: { value: 43, label: "Atendimentos abertos", change: "+10% vs ontem", changeType: "up", note: "sim." }
    },

    // Solicitações por dia (gráfico de linha)
    solicitacoesPorDia: {
      days: ["16/mai", "17/mai", "18/mai", "19/mai", "20/mai", "21/mai", "22/mai"],
      values: [80, 120, 150, 90, 170, 140, 128]
    },

    // Fila operacional (não confundir com KPI prazo vencido)
    filaOperacional: {
      badge: "5 pendências",
      items: [
        { icon: "✈️", title: "Viagem – João R. Silva", subtitle: "Brasília – 23/mai", badge: "Crítico", badgeClass: "critico", time: "Há 2h", type: "Aprovação do gestor" },
        { icon: "🎫", title: "Bilhete não voado – LA 3856", subtitle: "São Paulo → Curitiba – 15/mai", badge: "Alto", badgeClass: "alto", time: "Há 5h", type: "Reembolso pendente" },
        { icon: "🚗", title: "Mobilidade – Correção de CC", subtitle: "12 corridas", badge: "Alto", badgeClass: "alto", time: "Há 6h", type: "Aguardando ajuste" },
        { icon: "📦", title: "Correios – Rastreamento", subtitle: "7 objetos", badge: "Médio", badgeClass: "medio", time: "Há 8h", type: "Pendência cliente" },
        { icon: "🖨️", title: "Xerox – Impressões", subtitle: "23 solicitações", badge: "Médio", badgeClass: "medio", time: "Há 8h", type: "Fila de produção" }
      ]
    },

    // Gastos por categoria (gráfico de barras)
    gastosPorCategoria: [
      { name: "Viagens", value: 186230, color: "#2563eb", note: "sim." },
      { name: "Mobilidade", value: 72540, color: "#0ea5e9", note: "sim." },
      { name: "Correios", value: 18760, color: "#8b5cf6", note: "sim." },
      { name: "Xerox", value: 9850, color: "#f59e0b", note: "sim." }
    ],

    // Status das solicitações (donut chart)
    statusSolicitacoes: {
      total: 1248,
      segments: [
        { label: "Aguardando aprovação", pct: 46, color: "#f59e0b", count: 574 },
        { label: "Emissão", pct: 28, color: "#2563eb", count: 348 },
        { label: "Concluído", pct: 18, color: "#059669", count: 224 },
        { label: "Crítico", pct: 8, color: "#dc2626", count: 102 }
      ],
      note: "sim."
    },

    // Mobilidade
    mobilidade: {
      usuariosAtivos: { value: 212, change: "+6%", changeType: "up" },
      corridasHoje: { value: 156, change: "+9%", changeType: "up" },
      correcoesCC: { value: 12, change: "-3%", changeType: "down" },
      note: "sim."
    },

    // Correios e Xerox
    correiosXerox: {
      postagensHoje: { value: 58, change: "+7%", changeType: "up" },
      impressoesPendentes: { value: 134, change: "+5%", changeType: "up" },
      rastreamentos: { value: 27, change: "+2%", changeType: "up" },
      note: "sim."
    },

    // Viagens e serviços recentes
    servicosRecentes: [
      { name: "Ana Carolina M.", type: "✈️ Viagem", status: "Concluído", statusClass: "status-CONCLUIDO", cc: "CC 1101 – Diretoria", date: "22/mai 09:15" },
      { name: "Rafael Souza", type: "✈️ Viagem", status: "Em emissão", statusClass: "status-EM_ATENDIMENTO", cc: "CC 2105 – TI", date: "22/mai 08:47" },
      { name: "Juliana P. Costa", type: "🚗 Mobilidade", status: "Concluído", statusClass: "status-CONCLUIDO", cc: "CC 3102 – UTI", date: "22/mai 08:30" },
      { name: "Fernando Almeida", type: "📦 Correios", status: "Em andamento", statusClass: "status-EM_ATENDIMENTO", cc: "CC 4104 – Compras", date: "22/mai 08:12" },
      { name: "Patricia Lima", type: "🖨️ Xerox", status: "Aguard. aprovação", statusClass: "status-PENDENTE_APROVACAO", cc: "CC 5103 – RH", date: "21/mai 17:41" }
    ],

    // Fornecedores/SLA (dados demonstrativos)
    // NOTA: Copastur, Uber for Business, Correios = referências reais do contexto do projeto
    //       Simulado Corp = fornecedor fictício/demonstrativo
    fornecedores: [
      { name: "Copastur", category: "Viagens corporativas", sla: 98, label: "SLA demonstrativo", status: "On time", color: "#2563eb", type: "real" },
      { name: "Uber for Business", category: "Mobilidade", sla: 96, label: "SLA demonstrativo", status: "On time", color: "#059669", type: "real" },
      { name: "Simulado Corp", category: "Gestão de viagens", sla: 97, label: "SLA demonstrativo", status: "On time", color: "#ea580c", type: "ficticio" },
      { name: "Correios", category: "Serviços postais", sla: 95, label: "SLA demonstrativo", status: "On time", color: "#2563eb", type: "real" }
    ],

    // Últimas ações (activity feed)
    ultimasAcoes: [
      { icon: "✅", text: "Aprovação concluída", detail: "Viagem para Brasília – Ana C. M.", time: "Há 10 min", color: "var(--success)" },
      { icon: "👤", text: "Usuário ativado", detail: "Lucas Ferreira foi ativado no sistema", time: "Há 32 min", color: "var(--accent)" },
      { icon: "📄", text: "Nota fiscal importada", detail: "NF 12345 – Copastur – R$ 12.450,00", time: "Há 1 h", color: "var(--text-muted)" },
      { icon: "🎫", text: "Bilhete reemitido", detail: "LA 3856 – São Paulo → Curitiba", time: "Há 2 h", color: "var(--text-muted)" }
    ]
  },

  // Trilha Auditável Inicial (RN-SEG-003)
  auditLogs: [
    { id: "AUD-1001", timestamp: "2026-08-06 08:00:00", user: "Administrador (Simulado)", role: "administrador", action: "SISTEMA_INICIALIZADO", resource: "CS360_CORE", ip: "127.0.0.1 (Local Mock)", details: "Sessão iniciada no protótipo de demonstração." },
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
