/**
 * CENTRAL DE SERVIÇOS 360 - DADOS FICTÍCIOS CENTRALIZADOS (MOCK DATA)
 * Protótipo Interno Estático e Conectado - Base Rica de Demonstração
 * Diretoria de Infraestrutura & Supply Chain - Hospital Sírio-Libanês (Cenário Demonstrativo)
 */

window.CS360_INITIAL_MOCK = {
  // Configuração da marca e avisos
  systemInfo: {
    appName: "Central de Serviços 360",
    version: "1.0.0 (Demonstração Corporativa)",
    warningNotice: "Protótipo interno de validação — dados fictícios estruturados para demonstração.",
    mode: "MOCK / ADAPTADORES SIMULADOS ATIVOS"
  },

  // 4 perfis oficiais; as cinco opções visuais abaixo são identidades de demonstração.
  roles: [
    { id: "COLABORADOR", name: "Colaborador", description: "Portal e solicitações próprias." },
    { id: "AGENTE_SERVICO", name: "Agente de Serviço", description: "Operação limitada por serviceScopes." },
    { id: "GESTOR_APROVADOR", name: "Gestor Aprovador", description: "Decisões destinadas à sua alçada." },
    { id: "ADMINISTRADOR", name: "Administrador", description: "Governança e acesso ALL." }
  ],

  // Usuários Fictícios
  users: [
    { id: "USR-001", name: "Carlos Andrade", email: "carlos.andrade@ficticio.org", role: "COLABORADOR", serviceScopes: [], department: "UTI Geral Adulto", costCenter: "CC-3021" },
    { id: "USR-002", name: "Fernanda Lima", email: "fernanda.lima@ficticio.org", role: "GESTOR_APROVADOR", serviceScopes: [], department: "Diretoria Médica", costCenter: "CC-1040" },
    { id: "USR-003", name: "Agente Viagens + Mobilidade", email: "william.nunes@ficticio.org", role: "AGENTE_SERVICO", serviceScopes: ["viagens", "mobilidade"], department: "Central de Serviços", costCenter: "CC-2055" },
    { id: "USR-004", name: "Agente Transportes", email: "maria.catarina@ficticio.org", role: "AGENTE_SERVICO", serviceScopes: ["transportes"], department: "Central de Transportes", costCenter: "CC-2055" },
    { id: "USR-005", name: "Renata Monteiro", email: "renata.monteiro@ficticio.org", role: "coordenadora", department: "Coordenação de Infraestrutura", costCenter: "CC-2055" },
    { id: "USR-006", name: "Iramaia Rodrigues", email: "iramaia.rodrigues@ficticio.org", role: "gerencia", department: "Gerência de Operações e Facilities", costCenter: "CC-2055" },
    { id: "USR-007", name: "Roberto Silva", email: "roberto.silva@ficticio.org", role: "financeiro", department: "Controladoria & Finanças", costCenter: "CC-4010" },
    { id: "USR-008", name: "Patrícia Souza", email: "patricia.souza@ficticio.org", role: "ADMINISTRADOR", serviceScopes: ["ALL"], department: "Governança e TI", costCenter: "CC-5020" },
    { id: "USR-009", name: "Marcelo Alves", email: "marcelo.alves@ficticio.org", role: "auditoria", department: "Auditoria Interna e Compliance", costCenter: "CC-6015" }
  ],

  // Centros de Custo
  costCenters: [
    { code: "CC-3021", name: "UTI Geral Adulto", manager: "Fernanda Lima" },
    { code: "CC-1040", name: "Diretoria Médica e Clínica", manager: "Fernanda Lima" },
    { code: "CC-2055", name: "Infraestrutura & Supply Chain", manager: "Iramaia Rodrigues" },
    { code: "CC-4010", name: "Centro Cirúrgico e CME", manager: "Dr. Eduardo Santos" },
    { code: "CC-5020", name: "Oncologia e Hematologia", manager: "Dra. Juliana Prado" },
    { code: "CC-6015", name: "Pronto Atendimento e Emergência", manager: "Dr. Ricardo Menezes" },
    { code: "CC-7080", name: "Pesquisa Clínica e Ensino (IEP)", manager: "Dra. Camila Vasconcelos" }
  ],

  // Solicitações Consolidadas (Base Central com 20+ registros ricos)
  requests: [
    {
      id: "SOL-2026-001",
      serviceType: "viagem",
      title: "Congresso Internacional de Terapia Intensiva",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-3021",
      status: "PENDENTE_APROVACAO",
      createdAt: "2026-08-01 10:15",
      updatedAt: "2026-08-01 10:30",
      urgent: true,
      details: {
        origin: "São Paulo (GRU)",
        destination: "Brasília (BSB)",
        departureDate: "2026-09-15",
        returnDate: "2026-09-18",
        flightNumber: "LA-3204 / LA-3209",
        airline: "LATAM Airlines",
        hotelName: "Windsor Plaza Brasília Hotel",
        reason: "Apresentação de trabalho científico aprovado sobre protocolos de sepse em UTI.",
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
      title: "Visita Técnica à Unidade Regional do Rio de Janeiro",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-3021",
      status: "APROVADO",
      createdAt: "2026-07-20 14:00",
      updatedAt: "2026-07-21 09:00",
      urgent: false,
      details: {
        origin: "São Paulo (CGH)",
        destination: "Rio de Janeiro (SDU)",
        departureDate: "2026-08-20",
        returnDate: "2026-08-22",
        flightNumber: "G3-1020 / G3-1025",
        airline: "GOL Linhas Aéreas",
        hotelName: "Hotel Prodigy Santos Dumont",
        reason: "Alinhamento de procedimentos assistenciais e treinamento de equipe local.",
        needsHotel: true,
        needsMobility: true,
        insuranceRequested: false,
        estimatedCost: 1890.00,
        nonFlownCreditUsed: "TKT-99420 (R$ 450,00)"
      },
      history: [
        { date: "2026-07-20 14:00", action: "Solicitação de viagem enviada.", user: "Carlos Andrade" },
        { date: "2026-07-21 09:00", action: "Aprovado pela Gestora Fernanda Lima.", user: "Fernanda Lima" }
      ]
    },
    {
      id: "SOL-2026-003",
      serviceType: "mobilidade",
      title: "Cadastro e Inclusão no Uber for Business",
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
        city: "São Paulo / SP",
        reason: "Deslocamentos assistenciais em plantões noturnos e interunidades."
      },
      history: [
        { date: "2026-07-25 11:20", action: "Solicitação de cadastro de acesso enviada.", user: "Carlos Andrade" },
        { date: "2026-07-25 16:45", action: "Concluído pelo operador de faturamento.", user: "Maria Catarina" }
      ]
    },
    {
      id: "SOL-2026-004",
      serviceType: "correios",
      title: "Envio de Documentação de Convênio Médico",
      requesterId: "USR-002",
      requesterName: "Fernanda Lima",
      costCenter: "CC-1040",
      status: "EM_ATENDIMENTO",
      createdAt: "2026-08-02 08:30",
      updatedAt: "2026-08-02 11:00",
      urgent: true,
      details: {
        usageType: "institucional",
        modality: "SEDEX 10",
        destinationZip: "70040-010",
        recipientName: "Ministério da Saúde - Protocolo Geral",
        address: "Esplanada dos Ministérios, Bloco G - Brasília/DF",
        content: "Dossiê regulatório e termos de credenciamento hospitalar.",
        urgencyRationale: "Prazo regulatório com vencimento em 48h (RN-COR-002).",
        trackingCode: "BR-SEDEX-0001",
        estimatedCost: 58.40
      },
      history: [
        { date: "2026-08-02 08:30", action: "Solicitação de postagem urgente enviada.", user: "Fernanda Lima" },
        { date: "2026-08-02 11:00", action: "Código de rastreamento BR-SEDEX-0001 gerado.", user: "Atendente Correios" }
      ]
    },
    {
      id: "SOL-2026-005",
      serviceType: "xerox",
      title: "Manual de Boas Práticas e Protocolos de Enfermagem 2026",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-3021",
      status: "EM_ATENDIMENTO",
      createdAt: "2026-08-03 09:00",
      updatedAt: "2026-08-03 09:30",
      urgent: false,
      details: {
        jobId: "JOB-DEMO-001",
        format: "A4",
        colorMode: "Colorido",
        paperType: "Couché 115g / Sulfite 90g",
        copies: 50,
        pages: 150,
        finish: "Espiral duplo com capa cristal",
        fileName: "Manual_Protocolos_UTI_2026.pdf"
      },
      history: [
        { date: "2026-08-03 09:00", action: "Arquivo enviado para fila gráfica.", user: "Carlos Andrade" },
        { date: "2026-08-03 09:30", action: "Job alocado na máquina de produção offset digital.", user: "Operador Gráfica" }
      ]
    },
    {
      id: "SOL-2026-006",
      serviceType: "viagem",
      title: "Treinamento em Robótica Cirúrgica em Porto Alegre",
      requesterId: "USR-002",
      requesterName: "Fernanda Lima",
      costCenter: "CC-4010",
      status: "EM_ATENDIMENTO",
      createdAt: "2026-08-04 11:15",
      updatedAt: "2026-08-05 08:30",
      urgent: false,
      details: {
        origin: "São Paulo (CGH)",
        destination: "Porto Alegre (POA)",
        departureDate: "2026-09-22",
        returnDate: "2026-09-24",
        flightNumber: "AD-4120 / AD-4125",
        airline: "Azul Linhas Aéreas",
        hotelName: "Hotel Deville Prime Porto Alegre",
        reason: "Certificação em procedimento minimamente invasivo robótico DaVinci.",
        needsHotel: true,
        needsMobility: true,
        insuranceRequested: true,
        estimatedCost: 3120.00,
        nonFlownCreditUsed: null
      },
      history: [
        { date: "2026-08-04 11:15", action: "Solicitação criada.", user: "Fernanda Lima" },
        { date: "2026-08-05 08:30", action: "Cotação emitida pela agência Copastur.", user: "William Nunes" }
      ]
    },
    {
      id: "SOL-2026-007",
      serviceType: "mobilidade",
      title: "Solicitação de Voucher Extra para Plantão Noturno",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-3021",
      status: "PENDENTE_APROVACAO",
      createdAt: "2026-08-05 16:20",
      updatedAt: "2026-08-05 16:20",
      urgent: false,
      details: {
        actionType: "ajuste_limite",
        platform: "Uber for Business",
        monthlyLimit: 750.00,
        city: "São Paulo / SP",
        reason: "Cobertura de escala emergencial de plantões noturnos na UTI Geral (RN-MOB-001)."
      },
      history: [
        { date: "2026-08-05 16:20", action: "Solicitação enviada para aprovação do gestor.", user: "Carlos Andrade" }
      ]
    },
    {
      id: "SOL-2026-008",
      serviceType: "correios",
      title: "Envio de Lâminas e Amostras de Pesquisa Clínica",
      requesterId: "USR-002",
      requesterName: "Fernanda Lima",
      costCenter: "CC-7080",
      status: "PENDENTE_APROVACAO",
      createdAt: "2026-08-06 09:10",
      updatedAt: "2026-08-06 09:10",
      urgent: true,
      details: {
        usageType: "institucional",
        modality: "SEDEX",
        destinationZip: "30130-100",
        recipientName: "Laboratório Central UFMG - Belo Horizonte/MG",
        address: "Av. Alfredo Balena, 190 - Santa Efigênia",
        content: "Frascos lacrados com material biológico e termos do CEP.",
        urgencyRationale: "Material termo-sensível necessitando entrega em até 24h.",
        trackingCode: "BR-SEDEX-0008",
        estimatedCost: 89.20
      },
      history: [
        { date: "2026-08-06 09:10", action: "Solicitação enviada para aprovação de custos.", user: "Fernanda Lima" }
      ]
    },
    {
      id: "SOL-2026-009",
      serviceType: "xerox",
      title: "Impressão de Cartilhas de Orientação ao Paciente Oncológico",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-5020",
      status: "PENDENTE_APROVACAO",
      createdAt: "2026-08-06 14:00",
      updatedAt: "2026-08-06 14:00",
      urgent: false,
      details: {
        jobId: "JOB-DEMO-006",
        format: "A5",
        colorMode: "Colorido",
        paperType: "Reciclato 90g",
        copies: 200,
        pages: 32,
        finish: "Grampo canoa (revista)",
        fileName: "Cartilha_Oncologia_Cuidados.pdf"
      },
      history: [
        { date: "2026-08-06 14:00", action: "Solicitação submetida para alocação na gráfica.", user: "Carlos Andrade" }
      ]
    },
    {
      id: "SOL-2026-010",
      serviceType: "viagem",
      title: "Auditoria de Acreditação Hospitalar JCI em Curitiba",
      requesterId: "USR-009",
      requesterName: "Marcelo Alves",
      costCenter: "CC-6015",
      status: "CONCLUIDO",
      createdAt: "2026-07-10 08:00",
      updatedAt: "2026-07-16 18:00",
      urgent: false,
      details: {
        origin: "São Paulo (CGH)",
        destination: "Curitiba (CWB)",
        departureDate: "2026-07-14",
        returnDate: "2026-07-16",
        flightNumber: "LA-3110 / LA-3115",
        airline: "LATAM Airlines",
        hotelName: "Radisson Hotel Curitiba",
        reason: "Auditoria prévia de padrões de segurança e compliance.",
        needsHotel: true,
        needsMobility: true,
        insuranceRequested: true,
        estimatedCost: 1950.00,
        nonFlownCreditUsed: null
      },
      history: [
        { date: "2026-07-10 08:00", action: "Solicitação aprovada.", user: "Iramaia Rodrigues" },
        { date: "2026-07-16 18:00", action: "Viagem realizada e prestação de contas aprovada.", user: "Roberto Silva" }
      ]
    },
    {
      id: "SOL-2026-011",
      serviceType: "mobilidade",
      title: "Deslocamento de Equipe para Coleta Externa de Sangue",
      requesterId: "USR-002",
      requesterName: "Fernanda Lima",
      costCenter: "CC-1040",
      status: "CONCLUIDO",
      createdAt: "2026-07-29 07:30",
      updatedAt: "2026-07-29 17:00",
      urgent: false,
      details: {
        actionType: "corrida_avulsa",
        platform: "Táxi Digital 99",
        monthlyLimit: 180.00,
        city: "São Paulo / SP",
        reason: "Campanha externa de doação de sangue no Centro Universitário."
      },
      history: [
        { date: "2026-07-29 07:30", action: "Corrida solicitada e autorizada.", user: "Fernanda Lima" },
        { date: "2026-07-29 17:00", action: "Faturamento liquidado.", user: "Maria Catarina" }
      ]
    },
    {
      id: "SOL-2026-012",
      serviceType: "correios",
      title: "Envio de Malote Mensal de Notas Fiscais para Contabilidade",
      requesterId: "USR-004",
      requesterName: "Maria Catarina",
      costCenter: "CC-2055",
      status: "CONCLUIDO",
      createdAt: "2026-07-31 10:00",
      updatedAt: "2026-08-03 14:20",
      urgent: false,
      details: {
        usageType: "institucional",
        modality: "PAC",
        destinationZip: "01310-200",
        recipientName: "Escritório Central de Contabilidade - SP",
        address: "Av. Paulista, 1842 - 14º andar",
        content: "Malote de documentos fiscais e comprovantes de retenção.",
        trackingCode: "BR-PAC-0012",
        estimatedCost: 32.50
      },
      history: [
        { date: "2026-07-31 10:00", action: "Postado na agência dos Correios.", user: "Maria Catarina" },
        { date: "2026-08-03 14:20", action: "Entregue e assinado no destino.", user: "Correios Brasil" }
      ]
    },
    {
      id: "SOL-2026-013",
      serviceType: "xerox",
      title: "Banners Científicos para a Semana de Enfermagem",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-3021",
      status: "CONCLUIDO",
      createdAt: "2026-07-28 15:00",
      updatedAt: "2026-07-30 11:30",
      urgent: false,
      details: {
        jobId: "JOB-DEMO-003",
        format: "A0 / Lona 90x120cm",
        colorMode: "Colorido Alta Resolução",
        paperType: "Lona com ilhós",
        copies: 4,
        pages: 4,
        finish: "Bastão e cordão para suporte",
        fileName: "Banners_Semana_Enfermagem.pdf"
      },
      history: [
        { date: "2026-07-28 15:00", action: "Arquivo aprovado para impressão.", user: "Carlos Andrade" },
        { date: "2026-07-30 11:30", action: "Material entregue na recepção central.", user: "Gráfica Paulista" }
      ]
    },
    {
      id: "SOL-2026-014",
      serviceType: "viagem",
      title: "Simpósio Internacional de Cirurgia Cardíaca em Salvador",
      requesterId: "USR-002",
      requesterName: "Fernanda Lima",
      costCenter: "CC-4010",
      status: "REJEITADO",
      createdAt: "2026-07-15 09:30",
      updatedAt: "2026-07-16 11:00",
      urgent: false,
      details: {
        origin: "São Paulo (GRU)",
        destination: "Salvador (SSA)",
        departureDate: "2026-08-10",
        returnDate: "2026-08-12",
        reason: "Participação como ouvinte no simpósio de arritmias.",
        needsHotel: true,
        needsMobility: false,
        insuranceRequested: false,
        estimatedCost: 2800.00,
        nonFlownCreditUsed: null
      },
      history: [
        { date: "2026-07-15 09:30", action: "Solicitação submetida.", user: "Fernanda Lima" },
        { date: "2026-07-16 11:00", action: "Rejeitada pela Gerência. Motivo: Limite orçamentário trimestral atingido no CC-4010.", user: "Iramaia Rodrigues" }
      ]
    },
    {
      id: "SOL-2026-015",
      serviceType: "viagem",
      title: "Rascunho: Missão Médica Humanitária em Manaus",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-3021",
      status: "RASCUNHO",
      createdAt: "2026-08-07 11:00",
      updatedAt: "2026-08-07 11:00",
      urgent: false,
      details: {
        origin: "São Paulo (GRU)",
        destination: "Manaus (MAO)",
        departureDate: "2026-10-05",
        returnDate: "2026-10-12",
        reason: "Participação voluntária e treinamento de suporte avançado de vida.",
        needsHotel: true,
        needsMobility: true,
        insuranceRequested: true,
        estimatedCost: 4500.00
      },
      history: [
        { date: "2026-08-07 11:00", action: "Rascunho salvo pelo solicitante.", user: "Carlos Andrade" }
      ]
    },
    {
      id: "SOL-2026-016",
      serviceType: "transporte",
      title: "Transferência de Paciente Monitorado UTI -> Centro Cirúrgico",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-3021",
      status: "EM_ATENDIMENTO",
      createdAt: "2026-08-08 08:30",
      updatedAt: "2026-08-08 08:45",
      urgent: true,
      details: {
        transportType: "Pessoa",
        origin: "UTI Geral Adulto - Bloco A (3º Andar)",
        destination: "Centro Cirúrgico - Bloco B (2º Andar)",
        date: "2026-08-08",
        time: "09:00",
        priority: "Urgente",
        description: "Transferência de paciente leito 304 com acompanhamento de enfermagem.",
        notes: "Necessita maca com suporte duplo de soro e monitor multiparamétrico portátil."
      },
      history: [
        { date: "2026-08-08 08:30", action: "Solicitação de transporte interno aberta com prioridade urgente.", user: "Carlos Andrade" },
        { date: "2026-08-08 08:45", action: "Equipe de maqueiros alocada para o transporte.", user: "Central de Transporte Interno" }
      ]
    },
    {
      id: "SOL-2026-017",
      serviceType: "transporte",
      title: "Movimentação de Equipamento Ultrassom Portátil entre Blocos",
      requesterId: "USR-002",
      requesterName: "Fernanda Lima",
      costCenter: "CC-1040",
      status: "CONCLUIDO",
      createdAt: "2026-08-07 14:00",
      updatedAt: "2026-08-07 15:30",
      urgent: false,
      details: {
        transportType: "Equipamento",
        origin: "Engenharia Clínica - Subsolo Bloco C",
        destination: "Pronto Atendimento - Térreo Bloco A",
        date: "2026-08-07",
        time: "14:30",
        priority: "Normal",
        description: "Transporte de ultrassom calibrado para reforço de atendimento no PA.",
        notes: "Equipamento sensível com capa protetora antichoque."
      },
      history: [
        { date: "2026-08-07 14:00", action: "Solicitação de movimentação registrada.", user: "Fernanda Lima" },
        { date: "2026-08-07 15:30", action: "Equipamento entregue no destino e termo assinado.", user: "Transporte Interno" }
      ]
    },
    {
      id: "SOL-2026-018",
      serviceType: "estacionamento",
      title: "Vaga Reservada para Médico Palestrante Convidado",
      requesterId: "USR-002",
      requesterName: "Fernanda Lima",
      costCenter: "CC-7080",
      status: "APROVADO",
      createdAt: "2026-08-06 11:00",
      updatedAt: "2026-08-06 14:10",
      urgent: false,
      details: {
        parkingType: "Visitante",
        vehiclePlate: "ABC-4E88 (Simulado)",
        vehicleModel: "Corolla Prata",
        periodStart: "2026-08-12 07:30",
        periodEnd: "2026-08-12 18:00",
        location: "Edifício Garagem Bela Vista - Vagas VIP / Docentes",
        justification: "Palestrante internacional convidado do Simpósio de Pesquisa Clínica IEP.",
        notes: "Fluxo demonstrativo sujeito à validação institucional."
      },
      history: [
        { date: "2026-08-06 11:00", action: "Solicitação de vaga para visitante submetida.", user: "Fernanda Lima" },
        { date: "2026-08-06 14:10", action: "Vaga liberada e credencial temporária gerada na guarita.", user: "Controle de Estacionamento" }
      ]
    },
    {
      id: "SOL-2026-019",
      serviceType: "estacionamento",
      title: "Cadastro e Atualização de Veículo do Corpo Clínico",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-3021",
      status: "PENDENTE_APROVACAO",
      createdAt: "2026-08-08 09:20",
      updatedAt: "2026-08-08 09:20",
      urgent: false,
      details: {
        parkingType: "Cadastro/alteração de veículo",
        vehiclePlate: "XYZ-9K21 (Simulado)",
        vehicleModel: "Compass Branco",
        periodStart: "2026-08-15",
        periodEnd: "2027-08-15",
        location: "Garagem Subsolo 1 - Funcionários",
        justification: "Substituição de veículo cadastrado para acesso com TAG automática.",
        notes: "Fluxo demonstrativo sujeito à validação institucional."
      },
      history: [
        { date: "2026-08-08 09:20", action: "Solicitação de cadastro de veículo enviada para validação.", user: "Carlos Andrade" }
      ]
    },
    {
      id: "SOL-2026-020",
      serviceType: "entregas",
      title: "Malote de Medicamentos Especiais: Farmácia Central -> UTI Geral",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-3021",
      status: "EM_ATENDIMENTO",
      createdAt: "2026-08-08 10:00",
      updatedAt: "2026-08-08 10:20",
      urgent: true,
      details: {
        deliveryType: "Malote",
        origin: "Farmácia Central - Bloco C (1º Subsolo)",
        destination: "Farmácia Satélite UTI - Bloco A (3º Andar)",
        senderName: "Farmacêutico Responsável (Simulado)",
        recipientName: "Carlos Andrade (Enfermeiro Chefe)",
        dateTimeDesired: "2026-08-08 11:00",
        itemDescription: "Malote lacrado com antibióticos de reserva e insumos de emergência.",
        priority: "Alta",
        notes: "Entrega interna protocolada com conferência de lacre."
      },
      history: [
        { date: "2026-08-08 10:00", action: "Solicitação de entrega interna urgente aberta.", user: "Carlos Andrade" },
        { date: "2026-08-08 10:20", action: "Malote coletado pelo mensageiro interno.", user: "Central de Entregas Internas" }
      ]
    },
    {
      id: "SOL-2026-021",
      serviceType: "entregas",
      title: "Coleta de Dossiês Físicos de Pesquisa no Arquivo Médico",
      requesterId: "USR-002",
      requesterName: "Fernanda Lima",
      costCenter: "CC-7080",
      status: "CONCLUIDO",
      createdAt: "2026-08-05 09:30",
      updatedAt: "2026-08-05 14:00",
      urgent: false,
      details: {
        deliveryType: "Coleta",
        origin: "SAME / Arquivo Médico Central - Bloco D",
        destination: "Secretaria do IEP - Bloco E (5º Andar)",
        senderName: "Arquivo SAME",
        recipientName: "Secretaria IEP",
        dateTimeDesired: "2026-08-05 14:00",
        itemDescription: "2 caixas arquivo com termos de consentimento e históricos de ensaios clínicos.",
        priority: "Normal",
        notes: "Movimentação interna realizada conforme protocolo de custódia documental."
      },
      history: [
        { date: "2026-08-05 09:30", action: "Solicitação de coleta interna enviada.", user: "Fernanda Lima" },
        { date: "2026-08-05 14:00", action: "Caixas entregues e assinadas pelo destinatário.", user: "Central de Entregas Internas" }
      ]
    },
    {
      id: "SOL-2026-022",
      serviceType: "achados_perdidos",
      title: "Crachá de Acesso Médico Encontrado na Sala de Espera do PA",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-6015",
      status: "EM_ATENDIMENTO",
      createdAt: "2026-08-07 16:15",
      updatedAt: "2026-08-07 17:00",
      urgent: false,
      details: {
        occurrenceType: "ENCONTREI_ITEM",
        category: "Documentos/Crachás",
        description: "Crachá institucional magnético com cordão azul do Hospital Sírio-Libanês.",
        location: "Pronto Atendimento - Poltrona 12 da recepção externa",
        datetimeApprox: "2026-08-07 16:00",
        characteristics: "Nome do titular: Dr. Fernando M. (fictício), sem avarias visíveis.",
        contact: "Ramal 4021 - Recepção Central",
        stage: "ITEM_LOCALIZADO",
        notes: "Item guardado no cofre do setor de Achados e Perdidos aguardando retirada."
      },
      history: [
        { date: "2026-08-07 16:15", action: "Item encontrado registrado pelo colaborador.", user: "Carlos Andrade" },
        { date: "2026-08-07 17:00", action: "Item custodiado e catalogado no inventário de Achados e Perdidos.", user: "Atendente Achados e Perdidos" }
      ]
    },
    {
      id: "SOL-2026-023",
      serviceType: "achados_perdidos",
      title: "Estojo com Óculos de Grau Perdido no Auditório Principal",
      requesterId: "USR-002",
      requesterName: "Fernanda Lima",
      costCenter: "CC-1040",
      status: "PENDENTE_APROVACAO",
      createdAt: "2026-08-08 11:30",
      updatedAt: "2026-08-08 11:30",
      urgent: false,
      details: {
        occurrenceType: "PERDI_ITEM",
        category: "Óculos",
        description: "Óculos de grau armação tartaruga marrom em estojo de couro preto.",
        location: "Auditório IEP - Fileira G lado direito",
        datetimeApprox: "2026-08-08 10:30",
        characteristics: "Marca Ray-Ban (simulada), lente multifocal com proteção UV.",
        contact: "fernanda.lima@ficticio.org / Ramal 1040",
        stage: "EM_BUSCA",
        notes: "Solicitante relatou esquecimento logo após o término da reunião clínica."
      },
      history: [
        { date: "2026-08-08 11:30", action: "Registro de perda aberto pela colaboradora.", user: "Fernanda Lima" }
      ]
    },
    {
      id: "SOL-2026-024",
      serviceType: "solicitacao_imagens",
      title: "Verificação de CFTV: Avaria em Veículo na Garagem Subsolo 2",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-3021",
      status: "PENDENTE_APROVACAO",
      createdAt: "2026-08-07 18:00",
      updatedAt: "2026-08-07 18:00",
      urgent: false,
      details: {
        imageRequestType: "CFTV / Segurança Patrimonial",
        purpose: "Apuração de incidente patrimonial (pequeno arranhão em veículo estacionado)",
        sector: "Edifício Garagem - Subsolo 2 (Corredor D)",
        periodReference: "2026-08-07 das 14:00 às 17:30",
        description: "Solicitação de gravação das câmeras CAM-SS2-04 e CAM-SS2-05 para verificar passagem de carrinho de transporte.",
        justification: "Identificação de eventual contato com lateral de veículo operacional (simulação).",
        attachmentsMetadata: "croqui_posicao_veiculo_demo.pdf (Metadados apenas)",
        notice: "Fluxo demonstrativo. Regras de privacidade, autorização e retenção dependem de validação institucional."
      },
      history: [
        { date: "2026-08-07 18:00", action: "Solicitação de imagens submetida para avaliação da Segurança Patrimonial.", user: "Carlos Andrade" }
      ]
    },
    {
      id: "SOL-2026-025",
      serviceType: "solicitacao_imagens",
      title: "Registro Fotográfico Institucional da Inauguração de Nova Ala",
      requesterId: "USR-002",
      requesterName: "Fernanda Lima",
      costCenter: "CC-2055",
      status: "CONCLUIDO",
      createdAt: "2026-08-01 09:00",
      updatedAt: "2026-08-03 17:00",
      urgent: false,
      details: {
        imageRequestType: "Registro Institucional de Evento",
        purpose: "Divulgação em mural interno e newsletter corporativa da Infraestrutura",
        sector: "Ala de Internação - 6º Andar Bloco A",
        periodReference: "2026-08-02 das 10:00 às 12:00",
        description: "Cobertura fotográfica da cerimônia simbólica de entrega da reforma da ala.",
        justification: "Material institucional para arquivo histórico da Diretoria de Infraestrutura.",
        attachmentsMetadata: "termo_cessao_imagem_evento_demo.pdf",
        notice: "Fluxo demonstrativo. Regras de privacidade, autorização e retenção dependem de validação institucional."
      },
      history: [
        { date: "2026-08-01 09:00", action: "Solicitação criada e aprovada pela coordenação.", user: "Fernanda Lima" },
        { date: "2026-08-03 17:00", action: "Imagens tratadas e disponibilizadas no repositório institucional.", user: "Comunicação Corporativa" }
      ]
    },
    {
      id: "SOL-2026-026",
      serviceType: "autorizacao_excepcional",
      title: "Extrapolação Orçamentária Emergencial para Peça de Tomógrafo",
      requesterId: "USR-002",
      requesterName: "Fernanda Lima",
      costCenter: "CC-4010",
      status: "PENDENTE_APROVACAO",
      createdAt: "2026-08-08 07:45",
      updatedAt: "2026-08-08 07:45",
      urgent: true,
      details: {
        exceptionCategory: "Orçamentária / Custo",
        reason: "Aquisição em regime de urgência de tubo de raios-X para substituição preventiva imediata no Pronto Atendimento.",
        validityPeriod: "Agosto/2026 (Excepcionalidade única)",
        unitCostCenter: "CC-4010 - Centro Cirúrgico e Diagnóstico",
        mandatoryJustification: "Manutenção da capacidade assistencial ininterrupta do PA durante o fim de semana com alto volume de exames.",
        estimatedImpact: "Impacto financeiro estimado em R$ 42.000,00 sobre o teto mensal do CC-4010.",
        notes: "Encaminhado diretamente para deliberação da Diretoria de Operações."
      },
      history: [
        { date: "2026-08-08 07:45", action: "Autorização excepcional submetida para alçada da Diretoria.", user: "Fernanda Lima" }
      ]
    },
    {
      id: "SOL-2026-027",
      serviceType: "autorizacao_excepcional",
      title: "Acesso Fora do Expediente para Calibração de Equipamentos CME",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-2055",
      status: "APROVADO",
      createdAt: "2026-08-04 15:00",
      updatedAt: "2026-08-05 10:00",
      urgent: false,
      details: {
        exceptionCategory: "Operacional / Horário",
        reason: "Manutenção e validação termométrica de autoclaves fora do horário cirúrgico.",
        validityPeriod: "10/08/2026 a 12/08/2026 (das 22h às 05h)",
        unitCostCenter: "CC-2055 - Infraestrutura & Supply Chain",
        mandatoryJustification: "Evitar interrupção da rotina diurna de esterilização de instrumentais cirúrgicos.",
        estimatedImpact: "Sem custo adicional direto; escala de plantão técnico acordada.",
        notes: "Autorização concedida com ciência da coordenação de enfermagem e segurança."
      },
      history: [
        { date: "2026-08-04 15:00", action: "Solicitação de excepcionalidade aberta.", user: "Carlos Andrade" },
        { date: "2026-08-05 10:00", action: "Aprovada pela Gerência de Operações.", user: "Iramaia Rodrigues" }
      ]
    },
    {
      id: "SOL-2026-028",
      serviceType: "liberacao_acesso",
      title: "Acesso Temporário para Auditores de Acreditação Hospitalar",
      requesterId: "USR-009",
      requesterName: "Marcelo Alves",
      costCenter: "CC-6015",
      status: "APROVADO",
      createdAt: "2026-08-03 11:20",
      updatedAt: "2026-08-04 09:00",
      urgent: false,
      details: {
        accessType: "Acesso temporário (auditor/consultor)",
        targetResource: "Áreas Assistenciais, CME, Farmácia Central e Arquivo Médico",
        targetUser: "Auditor Líder - Equipe Externa de Certificação (3 pessoas)",
        justification: "Auditoria de conformidade com normas de qualidade hospitalar JCI.",
        validityPeriod: "15/08/2026 a 19/08/2026",
        managerResponsible: "Marcelo Alves (Auditoria Interna)",
        notes: "Fluxo demonstrativo. Não manipula credenciais reais nem integra com Active Directory."
      },
      history: [
        { date: "2026-08-03 11:20", action: "Solicitação de liberação de acesso temporário registrada.", user: "Marcelo Alves" },
        { date: "2026-08-04 09:00", action: "Aprovado pelo Gestor e crachás de visitante programados na recepção.", user: "Fernanda Lima" }
      ]
    },
    {
      id: "SOL-2026-029",
      serviceType: "liberacao_acesso",
      title: "Solicitação de Acesso Magnético à Sala Segura do Data Center",
      requesterId: "USR-008",
      requesterName: "Patrícia Souza",
      costCenter: "CC-5020",
      status: "PENDENTE_APROVACAO",
      createdAt: "2026-08-08 14:00",
      updatedAt: "2026-08-08 14:00",
      urgent: false,
      details: {
        accessType: "Solicitar acesso especial",
        targetResource: "Sala Segura TI / Racks de Servidores Principais (Bloco A - 2º Subsolo)",
        targetUser: "Patrícia Souza (Governança e TI)",
        justification: "Instalação física de novos switches de alta redundância da rede hospitalar.",
        validityPeriod: "Permanente com revisão semestral",
        managerResponsible: "Diretoria de Tecnologia e Governança",
        notes: "Fluxo demonstrativo sem alteração de permissões no IAM corporativo."
      },
      history: [
        { date: "2026-08-08 14:00", action: "Solicitação de acesso especial enviada para aprovação do gestor.", user: "Patrícia Souza" }
      ]
    },
    {
      id: "SOL-2026-030",
      serviceType: "investigacao_ocorrencia",
      title: "Registro de Ocorrência: Avaria em Equipamento de Monitorização",
      requesterId: "USR-001",
      requesterName: "Carlos Andrade",
      costCenter: "CC-3021",
      status: "EM_ATENDIMENTO",
      createdAt: "2026-08-07 10:15",
      updatedAt: "2026-08-07 11:30",
      urgent: false,
      details: {
        category: "Patrimonial / Operacional",
        location: "UTI Geral Adulto - Leito 14",
        dateOccurrence: "07/08/2026 08:30",
        description: "Cabo de sensor de oximetria danificado durante troca de turno.",
        statusLevantamento: "Campos e procedimento pendentes de levantamento no sistema atual.",
        isDemonstrative: true
      },
      history: [
        { date: "2026-08-07 10:15", action: "Ocorrência registrada no catálogo de serviços.", user: "Carlos Andrade" },
        { date: "2026-08-07 11:30", action: "Triagem iniciada pela equipe de Segurança / Facilities.", user: "Fernanda Lima" }
      ]
    },
  ],

  // Coleções Especializadas das 7 Novas Frentes Demonstrativas
  internalTransportJobs: [
    { id: "TRP-2026-001", reqId: "SOL-2026-016", transportType: "Pessoa", requester: "Carlos Andrade", origin: "UTI Geral Adulto - Bloco A (3º Andar)", destination: "Centro Cirúrgico - Bloco B (2º Andar)", date: "2026-08-08", time: "09:00", priority: "Urgente", status: "EM_EXECUCAO", attendant: "Equipe Maqueiros A (Simulada)", notes: "Paciente monitorado com oxigênio portátil." },
    { id: "TRP-2026-002", reqId: "SOL-2026-017", transportType: "Equipamento", requester: "Fernanda Lima", origin: "Engenharia Clínica - Bloco C", destination: "Pronto Atendimento - Bloco A", date: "2026-08-07", time: "14:30", priority: "Normal", status: "CONCLUIDO", attendant: "Logística Interna 02", notes: "Ultrassom calibrado entregue com termo assinado." },
    { id: "TRP-2026-003", reqId: null, transportType: "Material", requester: "Renata Monteiro", origin: "Almoxarifado Central", destination: "Unidade de Internação 5º Andar", date: "2026-08-08", time: "11:15", priority: "Alta", status: "AGUARDANDO_ACEITE", attendant: "Fila Geral", notes: "Caixas de EPI e insumos de enfermagem." },
    { id: "TRP-2026-004", reqId: null, transportType: "Pessoa", requester: "Dr. Ricardo Menezes", origin: "Pronto Atendimento", destination: "Ressonância Magnética - Bloco D", date: "2026-08-08", time: "10:30", priority: "Urgente", status: "EM_EXECUCAO", attendant: "Equipe Maqueiros B", notes: "Cadeira de rodas especial." },
    { id: "TRP-2026-005", reqId: null, transportType: "Equipamento", requester: "Dra. Juliana Prado", origin: "Centro Cirúrgico", destination: "CME - Esterilização", date: "2026-08-08", time: "13:00", priority: "Normal", status: "AGUARDANDO_ACEITE", attendant: "Fila Geral", notes: "Contêineres de instrumental cirúrgico lacrados." }
  ],

  parkingRecords: [
    { id: "EST-2026-001", reqId: "SOL-2026-018", parkingType: "Visitante", requester: "Fernanda Lima", vehiclePlate: "ABC-4E88", vehicleModel: "Corolla Prata", period: "12/08/2026 (07h30 - 18h00)", location: "Edifício Garagem Bela Vista - VIP", status: "AUTORIZADO", notes: "Médico palestrante IEP." },
    { id: "EST-2026-002", reqId: "SOL-2026-019", parkingType: "Cadastro/alteração de veículo", requester: "Carlos Andrade", vehiclePlate: "XYZ-9K21", vehicleModel: "Compass Branco", period: "Vigência Anual 2026/2027", location: "Garagem Subsolo 1 - Funcionários", status: "PENDENTE", notes: "Aguardando validação do crachá." },
    { id: "EST-2026-003", reqId: null, parkingType: "Solicitação de vaga", requester: "Dr. Eduardo Santos", vehiclePlate: "MED-1102", vehicleModel: "Civic Preto", period: "Permanente", location: "Garagem Médica Bloco B", status: "AUTORIZADO", notes: "Vaga corporativa corpo clínico." },
    { id: "EST-2026-004", reqId: null, parkingType: "Autorização temporária", requester: "Renata Monteiro", vehiclePlate: "LOG-5520", vehicleModel: "Furgão Ducato Branco", period: "09/08/2026 (08h00 - 14h00)", location: "Doca de Carga e Descarga", status: "AUTORIZADO", notes: "Entrega de mobiliário ambulatorial." },
    { id: "EST-2026-005", reqId: null, parkingType: "Ocorrência", requester: "Carlos Andrade", vehiclePlate: "XYZ-9K21", vehicleModel: "Compass Branco", period: "07/08/2026 16h00", location: "Subsolo 2 - Corredor D", status: "EM_ANALISE", notes: "Registro de verificação de avaria superficial." }
  ],

  internalDeliveries: [
    { id: "ENT-2026-001", reqId: "SOL-2026-020", deliveryType: "Malote", origin: "Farmácia Central (1º Subsolo)", destination: "Farmácia Satélite UTI (Bloco A - 3º Andar)", sender: "Farmácia Central", recipient: "Carlos Andrade", dateTime: "2026-08-08 11:00", priority: "Alta", status: "EM_TRANSITO", packageCode: "MAL-INT-0982", dimensions: "30x20x15 cm", weight: "2.5 kg", volumeCount: 1, declaredValue: 450.00, notes: "Antibióticos especiais lacrados." },
    { id: "ENT-2026-002", reqId: "SOL-2026-021", deliveryType: "Coleta", origin: "SAME / Arquivo Central - Bloco D", destination: "Secretaria IEP - Bloco E (5º Andar)", sender: "Arquivo SAME", recipient: "Secretaria IEP", dateTime: "2026-08-05 14:00", priority: "Normal", status: "ENTREGUE", packageCode: "COL-INT-0412", dimensions: "40x30x25 cm", weight: "8.0 kg", volumeCount: 2, declaredValue: 0.00, notes: "Caixas de dossiês de pesquisa." },
    { id: "ENT-2026-003", reqId: null, deliveryType: "Recebimento", origin: "Recepção Central de Mercadorias", destination: "Almoxarifado Geral", sender: "Fornecedor Externo", recipient: "Almoxarife Plantonista", dateTime: "2026-08-08 10:15", priority: "Normal", status: "COLETADO", packageCode: "REC-INT-1105", dimensions: "50x50x40 cm", weight: "14.2 kg", volumeCount: 3, declaredValue: 1200.00, notes: "Conferência de nota fiscal e volume." },
    { id: "ENT-2026-004", reqId: null, deliveryType: "Entrega", origin: "Laboratório de Análises - Bloco C", destination: "Posto de Coleta Ambulatorial", sender: "Bancada Central", recipient: "Enfermeira Chefe Ambulatório", dateTime: "2026-08-08 11:30", priority: "Alta", status: "AGUARDANDO_COLETA", packageCode: "ENT-INT-2201", dimensions: "25x20x10 cm", weight: "1.2 kg", volumeCount: 1, declaredValue: 350.00, notes: "Tubos de coleta a vácuo e frascos estéreis." },
    { id: "ENT-2026-005", reqId: null, deliveryType: "Malote", origin: "Faturamento & Contas Médicas", destination: "Auditoria Médica - 4º Andar", sender: "Maria Catarina", recipient: "Marcelo Alves", dateTime: "2026-08-08 14:00", priority: "Normal", status: "AGUARDANDO_COLETA", packageCode: "MAL-INT-3004", dimensions: "35x25x15 cm", weight: "3.0 kg", volumeCount: 1, declaredValue: 0.00, notes: "Prontuários físicos para revisão de glosas." }
  ],

  lostAndFoundItems: [
    { id: "ACH-2026-001", reqId: "SOL-2026-022", occurrenceType: "ENCONTREI_ITEM", category: "Documentos/Crachás", description: "Crachá magnético institucional com cordão azul HSL.", location: "Pronto Atendimento - Poltrona 12 recepção", date: "2026-08-07 16:00", status: "ITEM_LOCALIZADO", stage: "AGUARDANDO_RETIRADA", custodian: "Cofre Achados & Perdidos (Ramal 4021)", contact: "Recepção Central" },
    { id: "ACH-2026-002", reqId: "SOL-2026-023", occurrenceType: "PERDI_ITEM", category: "Óculos", description: "Óculos de grau armação tartaruga marrom em estojo de couro.", location: "Auditório IEP - Fileira G", date: "2026-08-08 10:30", status: "EM_BUSCA", stage: "EM_BUSCA", custodian: "Em averiguação com equipe de limpeza", contact: "fernanda.lima@ficticio.org" },
    { id: "ACH-2026-003", reqId: null, occurrenceType: "ENCONTREI_ITEM", category: "Eletrônicos", description: "Carregador de celular USB-C cor branca marca Samsung.", location: "Restaurante dos Funcionários - Mesa 14", date: "2026-08-06 13:20", status: "DEVOLVIDO", stage: "DEVOLVIDO", custodian: "Devolvido ao titular mediante identificação", contact: "Ramal 2055" },
    { id: "ACH-2026-004", reqId: null, occurrenceType: "PERDI_ITEM", category: "Chaves", description: "Molho de 3 chaves com chaveiro metálico de coração.", location: "Jardim interno / Espaço de convivência", date: "2026-08-07 18:45", status: "EM_BUSCA", stage: "EM_BUSCA", custodian: "Segurança Patrimonial informada", contact: "carlos.andrade@ficticio.org" },
    { id: "ACH-2026-005", reqId: null, occurrenceType: "ENCONTREI_ITEM", category: "Vestuário/Acessórios", description: "Casaco de lã cinza escuro tamanho M.", location: "Capela / Sala de Meditação", date: "2026-08-05 17:00", status: "ITEM_LOCALIZADO", stage: "AGUARDANDO_RETIRADA", custodian: "Armário de Achados & Perdidos", contact: "Recepção Central" }
  ],

  imageRequests: [
    { id: "IMG-2026-001", reqId: "SOL-2026-024", imageRequestType: "CFTV / Segurança Patrimonial", purpose: "Apuração de incidente patrimonial em vaga", sector: "Edifício Garagem - Subsolo 2 (Corredor D)", period: "2026-08-07 (14h00 - 17h30)", status: "EM_ANALISE", reviewer: "Coordenação de Segurança Patrimonial", notice: "Demonstrativo sujeito à validação institucional." },
    { id: "IMG-2026-002", reqId: "SOL-2026-025", imageRequestType: "Registro Institucional de Evento", purpose: "Cobertura fotográfica da inauguração de nova ala", sector: "Ala de Internação - 6º Andar Bloco A", period: "2026-08-02 (10h00 - 12h00)", status: "CONCLUIDO", reviewer: "Comunicação & Marketing", notice: "Demonstrativo sujeito à validação institucional." },
    { id: "IMG-2026-003", reqId: null, imageRequestType: "CFTV / Auditoria de Acesso", purpose: "Verificação de horário de passagem em catraca do IEP", sector: "Portaria IEP - Acesso Principal", period: "2026-08-06 (07h00 - 08h30)", status: "AUTORIZADO", reviewer: "Auditoria Interna", notice: "Demonstrativo sujeito à validação institucional." },
    { id: "IMG-2026-004", reqId: null, imageRequestType: "Registro Institucional de Evento", purpose: "Vídeo de treinamento de segurança contra incêndio", sector: "Pátio Técnico e Heliponto", period: "2026-08-04 (09h00 - 11h00)", status: "CONCLUIDO", reviewer: "Sesmt / Brigada de Incêndio", notice: "Demonstrativo sujeito à validação institucional." }
  ],

  exceptionalAuthorizations: [
    { id: "EXC-2026-001", reqId: "SOL-2026-026", category: "Orçamentária / Custo", reason: "Aquisição emergencial de tubo de raios-X Tomografia", validity: "Agosto/2026", costCenter: "CC-4010 - Centro Cirúrgico", impact: "R$ 42.000,00 sobre teto", status: "PENDENTE_APROVACAO", approverRequired: "Diretoria de Operações", justification: "Garantia de atendimento ininterrupto no PA." },
    { id: "EXC-2026-002", reqId: "SOL-2026-027", category: "Operacional / Horário", reason: "Manutenção noturna de autoclaves CME", validity: "10/08 a 12/08/2026 (22h - 05h)", costCenter: "CC-2055 - Infraestrutura", impact: "Sem custo extra direto", status: "APROVADO", approverRequired: "Gerência de Operações", justification: "Não interferir na rotina diurna do Centro Cirúrgico." },
    { id: "EXC-2026-003", reqId: null, category: "Recurso Especial", reason: "Uso emergencial de sala de conferência para comitê de crise", validity: "08/08/2026 (18h - 22h)", costCenter: "CC-1040 - Diretoria Médica", impact: "Bloqueio de agenda", status: "APROVADO", approverRequired: "Superintendência", justification: "Reunião extraordinária de alinhamento sanitário." },
    { id: "EXC-2026-004", reqId: null, category: "Orçamentária / Custo", reason: "Contratação de frete expresso de insumos termo-sensíveis", validity: "06/08/2026", costCenter: "CC-7080 - Pesquisa IEP", impact: "R$ 3.800,00", status: "CONCLUIDO", approverRequired: "Gerência Financeira", justification: "Preservação de amostras biológicas raras." }
  ],

  accessRequests: [
    { id: "ACS-2026-001", reqId: "SOL-2026-028", accessType: "Acesso temporário (auditor/consultor)", targetResource: "Áreas Assistenciais, CME, Farmácia Central", targetUser: "Equipe Externa de Certificação (3 auditores)", period: "15/08 a 19/08/2026", manager: "Marcelo Alves (Auditoria)", status: "AUTORIZADO", badgeType: "Crachá Visitante Auditor" },
    { id: "ACS-2026-002", reqId: "SOL-2026-029", accessType: "Solicitar acesso especial", targetResource: "Sala Segura TI / Data Center (2º Subsolo)", targetUser: "Patrícia Souza (Governança e TI)", period: "Permanente (Revisão Semestral)", manager: "Diretoria de TI", status: "PENDENTE_APROVACAO", badgeType: "Biometria + TAG Nível 5" },
    { id: "ACS-2026-003", reqId: null, accessType: "Recuperar / liberar acesso", targetResource: "Catracas do Bloco Cirúrgico e Vestiário Médico", targetUser: "Dr. Eduardo Santos", period: "Imediato", manager: "Diretoria Médica", status: "LIBERADO", badgeType: "Reativação de Crachá Médico" },
    { id: "ACS-2026-004", reqId: null, accessType: "Comunicar perda de acesso", targetResource: "Crachá funcional extraviado", targetUser: "Carlos Andrade", period: "07/08/2026", manager: "Coordenação UTI", status: "EM_ATENDIMENTO", badgeType: "Bloqueio e 2ª Via de Crachá" },
    { id: "ACS-2026-005", reqId: null, accessType: "Acesso temporário", targetResource: "Doca de Carga e Almoxarifado Central", targetUser: "Técnico de Instalação Ar Condicionado", period: "08/08 a 10/08/2026", manager: "Renata Monteiro (Infra)", status: "LIBERADO", badgeType: "Crachá Prestador de Serviços" }
  ],

  // Perfil Corporativo Mock (Conceito SAP RH - Futura Integração)
  employeeProfile: {
    matricula: "MAT-DEMO-01",
    nome: "Colaborador Demo",
    email: "colaborador.demo@hospital-demo.org",
    cargo: "Especialista Assistencial Demonstrativo",
    departamento: "Área Assistencial Demonstrativa",
    centroCusto: "CC-DEMO-01",
    gestor: "Gestor Demo",
    diretoria: "Diretoria de Operações Demonstrativa",
    unidade: "Complexo Demonstrativo Central"
  },

  // Escopos de Atendimento por Perfil Operador (serviceScopes)
  serviceScopes: {
    colaborador: [],
    gestor: [],
    viagens: ["viagem"],
    operador: ["entregas", "estacionamento", "achados_perdidos", "transporte"],
    faturamento: ["viagem", "mobilidade"],
    coordenadora: ["ALL"],
    administrador: ["ALL"]
  },

  // Políticas Documentadas por Vertical
  policyDocuments: [
    {
      id: "POL-VIA-001",
      title: "Diretriz de Viagens Corporativas e Hospedagem",
      service: "viagem",
      version: "v2.4",
      status: "VIGENTE", sourceType: "DEMONSTRATIVO", sourceDocument: null,
      effectiveFrom: "2026-01-01",
      effectiveTo: null, updatedAt: "2026-08-01",
      audience: "TODOS",
      content: "Antecedência mínima de 14 dias para voos nacionais. Tarifa preferencial corporativa."
    },
    {
      id: "POL-MOB-002",
      title: "Política de Mobilidade Urbana e Vouchers Noturnos",
      service: "mobilidade",
      version: "v1.8",
      status: "VIGENTE", sourceType: "DEMONSTRATIVO", sourceDocument: null,
      effectiveFrom: "2026-01-01",
      effectiveTo: null, updatedAt: "2026-08-01",
      audience: "TODOS",
      content: "Corridas entre 22h e 06h autorizadas para plantonistas. Uso exclusivo de voucher corporativo."
    },
    {
      id: "POL-COR-001",
      title: "Procedimento Operacional de Envios e Postagens",
      service: "correios",
      version: "v2.0",
      status: "VIGENTE", sourceType: "DEMONSTRATIVO", sourceDocument: null,
      effectiveFrom: "2026-01-01",
      effectiveTo: null, updatedAt: "2026-08-01",
      audience: "TODOS",
      content: "SEDEX 10 restrito a documentos e amostras com justificativa formal de urgência."
    },
    {
      id: "POL-XER-001",
      title: "Norma de Impressões Gráficas e Tiragens Especiais",
      service: "xerox",
      version: "v1.2",
      status: "VIGENTE", sourceType: "DEMONSTRATIVO", sourceDocument: null,
      effectiveFrom: "2026-01-01",
      effectiveTo: null, updatedAt: "2026-08-01",
      audience: "TODOS",
      content: "Tiragens superiores a 100 cópias demandam aprovação do centro de custo requisitante."
    },
    {
      id: "POL-ACS-001",
      title: "Norma de Controle de Acesso e Credenciamento Temporário",
      service: "liberacao_acesso",
      version: "v1.0",
      status: "VIGENTE", sourceType: "DEMONSTRATIVO", sourceDocument: null,
      effectiveFrom: "2026-01-01",
      effectiveTo: null, updatedAt: "2026-08-01",
      audience: "TODOS",
      content: "Credenciais de auditoria têm validade máxima de 5 dias úteis com assinatura de termo de sigilo."
    }
  ],

  // Investigação de Ocorrência (Status: Campos pendentes de levantamento no sistema atual)
  investigacaoOcorrencias: [
    {
      id: "OCO-2026-001",
      reqId: "SOL-2026-030",
      category: "Patrimonial / Operacional",
      title: "Registro de Ocorrência: Avaria em Equipamento de Monitorização",
      requesterName: "Carlos Andrade",
      location: "UTI Geral Adulto - Leito 14",
      date: "07/08/2026 08:30",
      status: "EM_ATENDIMENTO",
      statusLevantamento: "Campos e procedimento pendentes de levantamento no sistema atual",
      notes: "Aguardando tela interna da ferramenta de origem para mapeamento de dados."
    },
    {
      id: "OCO-2026-002",
      reqId: null,
      category: "Acesso / Segurança",
      title: "Registro de Ocorrência: Bloqueio Intermitente de Catraca",
      requesterName: "Renata Monteiro",
      location: "Catraca Bloco B (Entrada de Funcionários)",
      date: "08/08/2026 07:15",
      status: "PENDENTE",
      statusLevantamento: "Campos e procedimento pendentes de levantamento no sistema atual",
      notes: "Triagem preliminar registrada para averiguação de infraestrutura."
    }
  ],

  // Coleção de Fila de Impressões Gráficas (RN-XER)
  printJobs: [
    { id: "JOB-DEMO-001", reqId: "SOL-2026-005", title: "Manual de Protocolos de Enfermagem", requester: "Carlos Andrade", format: "A4", colorMode: "Colorido", copies: 50, pages: 150, finishing: "Espiral duplo com capa cristal", status: "EM_PRODUCAO", priority: "Normal", date: "2026-08-03 09:00", cost: 135.00 },
    { id: "JOB-DEMO-002", reqId: "SOL-2026-009", title: "Cartilhas de Cuidados Oncológicos", requester: "Carlos Andrade", format: "A5", colorMode: "Colorido", copies: 200, pages: 32, finishing: "Grampo canoa", status: "PENDENTE", priority: "Alta", date: "2026-08-06 14:00", cost: 240.00 },
    { id: "JOB-DEMO-003", reqId: "SOL-2026-013", title: "Banners Científicos Semana Enfermagem", requester: "Carlos Andrade", format: "A0 Lona", colorMode: "Colorido HD", copies: 4, pages: 4, finishing: "Bastão e cordão", status: "CONCLUIDO", priority: "Normal", date: "2026-07-28 15:00", cost: 320.00 },
    { id: "JOB-DEMO-004", reqId: "SOL-2026-016", title: "Blocos de Termos de Consentimento (TCLE)", requester: "Fernanda Lima", format: "A4", colorMode: "Preto e Branco", copies: 300, pages: 1, finishing: "Blocado 100 folhas", status: "CONCLUIDO", priority: "Normal", date: "2026-07-25 10:00", cost: 85.00 },
    { id: "JOB-DEMO-005", reqId: "SOL-2026-017", title: "Crachás de Identificação Evento IEP", requester: "Renata Monteiro", format: "PVC Card", colorMode: "Colorido", copies: 120, pages: 1, finishing: "Presilha tipo jacaré", status: "CONCLUIDO", priority: "Alta", date: "2026-08-02 11:30", cost: 190.00 },
    { id: "JOB-DEMO-006", reqId: "SOL-2026-018", title: "Formulários de segurança cirúrgica", requester: "Dr. Eduardo Santos", format: "A4", colorMode: "Preto e Branco", copies: 500, pages: 2, finishing: "Blocado 50 folhas", status: "EM_PRODUCAO", priority: "Alta", date: "2026-08-07 08:20", cost: 168.00 },
    { id: "JOB-DEMO-007", reqId: "SOL-2026-019", title: "Folder da campanha de vacinação", requester: "Ricardo Menezes", format: "A5", colorMode: "Colorido", copies: 350, pages: 2, finishing: "Dobra central", status: "PENDENTE", priority: "Normal", date: "2026-08-07 13:45", cost: 286.00 },
    { id: "JOB-DEMO-008", reqId: "SOL-2026-020", title: "Apostila do curso de cuidados paliativos", requester: "Juliana Prado", format: "A4", colorMode: "Colorido", copies: 80, pages: 96, finishing: "Espiral e capa fosca", status: "CONCLUIDO", priority: "Normal", date: "2026-08-01 09:10", cost: 412.00 },
    { id: "JOB-DEMO-009", reqId: "SOL-2026-021", title: "Etiquetas para amostras de pesquisa", requester: "Camila Vasconcelos", format: "Etiqueta 50x30", colorMode: "Preto e Branco", copies: 1000, pages: 1, finishing: "Adesivo térmico", status: "AGUARDANDO_ATENDIMENTO", priority: "Alta", date: "2026-08-08 10:30", cost: 225.00 },
    { id: "JOB-DEMO-010", reqId: "SOL-2026-022", title: "Placas de orientação temporária", requester: "Renata Monteiro", format: "A3", colorMode: "Colorido", copies: 24, pages: 1, finishing: "Laminação fosca", status: "EM_PRODUCAO", priority: "Normal", date: "2026-08-09 15:05", cost: 144.00 }
  ],

  // Coleção de Envios e Rastreamentos dos Correios (RN-COR)
  postalShipments: [
    { id: "SOL-2026-004", description: "Envio de Documentação de Convênio Médico", recipient: "Ministério da Saúde - Brasília/DF", modality: "SEDEX 10", usageType: "Institucional", trackingCode: "BR-SEDEX-0001", status: "EM_TRANSITO", cost: 58.40, date: "2026-08-02 08:30", lastUpdate: "Objeto em trânsito — Unidade de Tratamento BSB", eta: "Hoje até 10:00" },
    { id: "SOL-2026-008", description: "Lâminas e Amostras de Pesquisa Clínica", recipient: "Laboratório UFMG - Belo Horizonte/MG", modality: "SEDEX", usageType: "Institucional", trackingCode: "BR-SEDEX-0008", status: "PENDENTE", cost: 89.20, date: "2026-08-06 09:10", lastUpdate: "Solicitação aprovada — aguardando coleta expressa", eta: "Aguardando coleta" },
    { id: "COR-2026-003", description: "Peças de Reposição Equipamento Radiologia", recipient: "Siemens Healthineers - Curitiba/PR", modality: "SEDEX", usageType: "Institucional", trackingCode: "BR-SEDEX-0033", status: "EM_TRANSITO", cost: 74.50, date: "2026-08-05 14:15", lastUpdate: "Objeto saiu para entrega ao destinatário", eta: "Hoje até 17:00" },
    { id: "COR-2026-004", description: "Contratos de Fornecedores Assinados", recipient: "Copastur Viagens - São Paulo/SP", modality: "Carta Registrada", usageType: "Institucional", trackingCode: "BR-CR-0042", status: "ENTREGUE", cost: 14.80, date: "2026-07-28 10:00", lastUpdate: "Objeto entregue ao destinatário", eta: "Entregue em 30/07" },
    { id: "COR-2026-005", description: "Malote Mensal de Notas Fiscais Faturamento", recipient: "Auditoria Externa - Rio de Janeiro/RJ", modality: "PAC", usageType: "Institucional", trackingCode: "BR-PAC-0055", status: "ENTREGUE", cost: 42.10, date: "2026-07-20 16:00", lastUpdate: "Objeto entregue ao destinatário", eta: "Entregue em 24/07" },
    { id: "COR-2026-006", description: "Documentação para comitê de ética", recipient: "CONEP - Brasília/DF", modality: "SEDEX 10", usageType: "Pesquisa", trackingCode: "BR-SEDEX-0061", status: "EM_TRANSITO", cost: 63.90, date: "2026-08-07 11:25", lastUpdate: "Objeto encaminhado para unidade de distribuição", eta: "Amanhã até 10:00" },
    { id: "COR-2026-007", description: "Kit de treinamento assistencial", recipient: "Unidade Regional Campinas/SP", modality: "PAC", usageType: "Institucional", trackingCode: "BR-PAC-0074", status: "AGUARDANDO_POSTAGEM", cost: 31.70, date: "2026-08-08 09:40", lastUpdate: "Etiqueta emitida — aguardando coleta", eta: "Coleta hoje às 15:30" },
    { id: "COR-2026-008", description: "Termos de consentimento assinados", recipient: "Centro de Pesquisa Parceiro - Recife/PE", modality: "SEDEX", usageType: "Pesquisa", trackingCode: "BR-SEDEX-0088", status: "ENTREGUE", cost: 78.30, date: "2026-07-30 13:20", lastUpdate: "Objeto entregue ao responsável do protocolo", eta: "Entregue em 01/08" },
    { id: "COR-2026-009", description: "Pequeno equipamento para calibração", recipient: "Laboratório Metrológico - Sorocaba/SP", modality: "SEDEX", usageType: "Manutenção", trackingCode: "BR-SEDEX-0095", status: "EM_TRANSITO", cost: 46.60, date: "2026-08-09 08:15", lastUpdate: "Objeto em transferência para CDD Sorocaba", eta: "Hoje até 18:00" },
    { id: "COR-2026-010", description: "Correspondências administrativas", recipient: "Unidade Regional Salvador/BA", modality: "Carta Registrada", usageType: "Administrativo", trackingCode: "BR-CR-0102", status: "PENDENTE", cost: 18.40, date: "2026-08-09 14:50", lastUpdate: "Aguardando conferência de conteúdo", eta: "Aguardando postagem" }
  ],

  // Bilhetes Não Voados e Créditos de Passagens (RN-VIA-002)
  nonFlownTickets: [
    { id: "TKT-99420", passenger: "Carlos Andrade", airline: "LATAM Airlines", ticketNumber: "045-2345678901", originalDate: "2026-03-10", originalRoute: "GRU-BSB", originalAmount: 850.00, creditBalance: 450.00, expiresAt: "2026-11-30", status: "DISPONIVEL" },
    { id: "TKT-88112", passenger: "Fernanda Lima", airline: "GOL Linhas Aéreas", ticketNumber: "127-9876543210", originalDate: "2026-04-15", originalRoute: "CGH-SDU", originalAmount: 620.00, creditBalance: 620.00, expiresAt: "2026-10-15", status: "DISPONIVEL" },
    { id: "TKT-66524", passenger: "Dr. Eduardo Santos", airline: "Azul Linhas Aéreas", ticketNumber: "577-8899001122", originalDate: "2026-05-20", originalRoute: "VCP-CNF", originalAmount: 980.00, creditBalance: 980.00, expiresAt: "2026-12-31", status: "DISPONIVEL" },
    { id: "TKT-55419", passenger: "Dra. Juliana Prado", airline: "LATAM Airlines", ticketNumber: "045-9988776655", originalDate: "2026-02-18", originalRoute: "GRU-SSA", originalAmount: 1150.00, creditBalance: 350.00, expiresAt: "2026-09-30", status: "DISPONIVEL" },
    { id: "TKT-77341", passenger: "Marcelo Alves", airline: "Azul Linhas Aéreas", ticketNumber: "577-4561237890", originalDate: "2026-01-20", originalRoute: "VCP-CWB", originalAmount: 1100.00, creditBalance: 0.00, expiresAt: "2026-06-30", status: "UTILIZADO" },
    { id: "TKT-44218", passenger: "Camila Vasconcelos", airline: "GOL Linhas Aéreas", ticketNumber: "127-4455667788", originalDate: "2026-06-12", originalRoute: "CGH-REC", originalAmount: 1320.00, creditBalance: 890.00, expiresAt: "2027-01-15", status: "DISPONIVEL" },
    { id: "TKT-31876", passenger: "Ricardo Menezes", airline: "LATAM Airlines", ticketNumber: "045-1122334455", originalDate: "2026-05-08", originalRoute: "GRU-POA", originalAmount: 940.00, creditBalance: 940.00, expiresAt: "2026-12-20", status: "DISPONIVEL" },
    { id: "TKT-20745", passenger: "Renata Monteiro", airline: "Azul Linhas Aéreas", ticketNumber: "577-2233445566", originalDate: "2026-04-02", originalRoute: "VCP-BHZ", originalAmount: 710.00, creditBalance: 210.00, expiresAt: "2026-10-05", status: "PARCIALMENTE_UTILIZADO" }
  ],

  // Corridas de Mobilidade Simuladas (Uber / Táxi)
  mobilityRides: [
    { id: "RID-5501", passenger: "Carlos Andrade", date: "2026-08-01 22:45", origin: "Hospital Sírio-Libanês (Bela Vista)", destination: "Av. Paulista, 1500", cost: 48.50, provider: "Uber for Business", costCenter: "CC-3021", policyFlag: true, flagReason: "Corrida noturna pós 22h sem viagem ativa — justificada por escala de plantão de emergência." },
    { id: "RID-5502", passenger: "Fernanda Lima", date: "2026-07-28 14:10", origin: "Hospital Sírio-Libanês (Bela Vista)", destination: "Aeroporto de Congonhas", cost: 35.00, provider: "Táxi Digital 99", costCenter: "CC-1040", policyFlag: false, flagReason: null },
    { id: "RID-5503", passenger: "Marcelo Alves", date: "2026-07-25 09:30", origin: "Aeroporto Santos Dumont", destination: "Unidade Regional Rio de Janeiro", cost: 42.10, provider: "Uber for Business", costCenter: "CC-6015", policyFlag: false, flagReason: null },
    { id: "RID-5504", passenger: "Renata Monteiro", date: "2026-08-02 18:20", origin: "Unidade Jardins", destination: "Hospital Sírio-Libanês (Bela Vista)", cost: 28.00, provider: "Uber for Business", costCenter: "CC-2055", policyFlag: false, flagReason: null },
    { id: "RID-5505", passenger: "Dr. Eduardo Santos", date: "2026-08-04 23:15", origin: "Hospital Sírio-Libanês (Bela Vista)", destination: "Residência Médica - Pinheiros", cost: 62.00, provider: "Táxi Digital 99", costCenter: "CC-4010", policyFlag: true, flagReason: "Corrida noturna pós-cirurgia de emergência (RN-MOB-001 conforme)." },
    { id: "RID-5506", passenger: "Dra. Juliana Prado", date: "2026-08-05 12:35", origin: "Unidade Itaim", destination: "Centro de Oncologia", cost: 24.80, provider: "Uber for Business", costCenter: "CC-5020", policyFlag: false, flagReason: null },
    { id: "RID-5507", passenger: "Dra. Camila Vasconcelos", date: "2026-08-06 07:50", origin: "Instituto de Ensino e Pesquisa", destination: "Centro de Pesquisa Parceiro", cost: 39.60, provider: "Táxi Digital 99", costCenter: "CC-7080", policyFlag: false, flagReason: null },
    { id: "RID-5508", passenger: "Ricardo Menezes", date: "2026-08-06 23:40", origin: "Pronto Atendimento", destination: "Unidade Morumbi", cost: 91.40, provider: "Uber for Business", costCenter: "CC-6015", policyFlag: true, flagReason: "Valor acima de R$ 80 e horário noturno — justificativa em análise." },
    { id: "RID-5509", passenger: "Carlos Andrade", date: "2026-08-07 15:10", origin: "Hospital Sírio-Libanês", destination: "Centro de Distribuição", cost: 33.20, provider: "Uber for Business", costCenter: "CC-3021", policyFlag: false, flagReason: null },
    { id: "RID-5510", passenger: "Fernanda Lima", date: "2026-08-08 10:25", origin: "Diretoria Médica", destination: "Secretaria Municipal da Saúde", cost: 27.90, provider: "Táxi Digital 99", costCenter: "CC-1040", policyFlag: false, flagReason: null },
    { id: "RID-5511", passenger: "Renata Monteiro", date: "2026-08-09 19:05", origin: "Unidade Jardins", destination: "Almoxarifado Central", cost: 44.70, provider: "Uber for Business", costCenter: "CC-2055", policyFlag: false, flagReason: null },
    { id: "RID-5512", passenger: "Dr. Eduardo Santos", date: "2026-08-10 06:35", origin: "Residência Médica - Pinheiros", destination: "Centro Cirúrgico", cost: 52.30, provider: "Táxi Digital 99", costCenter: "CC-4010", policyFlag: false, flagReason: null }
  ],

  // Solicitações de Acesso e Ajuste de Limite de Mobilidade
  mobilityAccessRequests: [
    { id: "MOB-REQ-001", requester: "Carlos Andrade", role: "Enfermeiro Chefe", limitRequested: "R$ 750,00/mês", status: "PENDENTE", date: "2026-08-05", reason: "Cobertura de escalas noturnas de emergência na UTI." },
    { id: "MOB-REQ-002", requester: "Fernanda Lima", role: "Gestora Médica", limitRequested: "R$ 500,00/mês", status: "APROVADO", date: "2026-07-20", reason: "Deslocamentos entre campus Bela Vista e unidades de diagnóstico." },
    { id: "MOB-REQ-003", requester: "Dra. Camila Vasconcelos", role: "Pesquisadora IEP", limitRequested: "R$ 400,00/mês", status: "APROVADO", date: "2026-07-15", reason: "Visitas a centros parceiros de pesquisa clínica." },
    { id: "MOB-REQ-004", requester: "Ricardo Menezes", role: "Coordenador de Emergência", limitRequested: "R$ 650,00/mês", status: "PENDENTE", date: "2026-08-08", reason: "Cobertura de deslocamentos entre unidades no período noturno." },
    { id: "MOB-REQ-005", requester: "Juliana Prado", role: "Gestora de Oncologia", limitRequested: "R$ 450,00/mês", status: "APROVADO", date: "2026-08-02", reason: "Visitas assistenciais programadas entre unidades." }
  ],

  // Fornecedores & Contratos
  suppliers: [
    { id: "SUP-01", name: "Copastur Viagens e Turismo", category: "Agência de Viagens Corporativas", contract: "CT-2024-089", status: "Ativo", slaTarget: "Cotação em até 2h / Emissão em 4h", slaScore: 98.4, contact: "atendimento.corporativo@copastur.com.br" },
    { id: "SUP-02", name: "Uber for Business Brasil", category: "Mobilidade Urbana", contract: "CT-2023-112", status: "Ativo", slaTarget: "Disponibilidade de frota 99.9%", slaScore: 96.8, contact: "enterprise-support@uber.com" },
    { id: "SUP-03", name: "99 Tecnologia / Táxi Digital", category: "Mobilidade e Táxi Credenciado", contract: "CT-2024-045", status: "Ativo", slaTarget: "Tempo médio de resposta < 5 min", slaScore: 95.2, contact: "empresas@99app.com" },
    { id: "SUP-04", name: "Empresa Brasileira de Correios e Telégrafos", category: "Serviços Postais e SEDEX", contract: "CT-2022-045", status: "Ativo", slaTarget: "Coleta diária programada às 15h30", slaScore: 94.7, contact: "agencia.corporativa@correios.com.br" },
    { id: "SUP-05", name: "Gráfica & Soluções Digitais Paulista", category: "Xerox, Impressões e Banners", contract: "CT-2025-014", status: "Ativo", slaTarget: "Impressão Padrão 24h / Urgente 4h", slaScore: 97.1, contact: "pedidos@graficapaulista.com.br" },
    { id: "SUP-06", name: "Allianz Global Assistance", category: "Seguro Viagem Corporativo", contract: "CT-2024-098", status: "Ativo", slaTarget: "Emissão de Apólice Imediata (RN-VIA-003)", slaScore: 99.5, contact: "seguros.corporativos@allianz.com" }
  ],

  // Fila de Atendimento Humano (Chamados / Helpdesk Central 360)
  tickets: [
    { id: "TICK-101", title: "Solicitação de bagagem despachada adicional", requester: "Carlos Andrade", category: "Viagens", status: "EM_ABERTO", priority: "Média", createdAt: "2026-08-04 14:20", updatedAt: "2026-08-04 14:20", description: "Preciso incluir uma mala de 23kg para transportar protótipos de equipamentos médicos para Brasília.", assignedTo: "William Nunes", resolution: null },
    { id: "TICK-102", title: "Ajuste de centro de custo de corrida Uber", requester: "Fernanda Lima", category: "Mobilidade", status: "RESOLVIDO", priority: "Alta", createdAt: "2026-08-01 09:10", updatedAt: "2026-08-01 15:30", description: "Corrida RID-5502 foi alocada no CC-3021 por engano e deve ser transferida para CC-1040.", assignedTo: "Maria Catarina", resolution: "Ajuste de centro de custo efetuado no módulo financeiro." },
    { id: "TICK-103", title: "Rastreamento prioritário de material biológico", requester: "Carlos Andrade", category: "Correios", status: "EM_ABERTO", priority: "Alta", createdAt: "2026-08-05 10:15", updatedAt: "2026-08-05 10:15", description: "Amostra enviada para a UFMG precisa de confirmação de entrega com hora marcada.", assignedTo: null, resolution: null },
    { id: "TICK-104", title: "Revisão de acabamento em apostilas de treinamento", requester: "Renata Monteiro", category: "Xerox", status: "EM_ATENDIMENTO", priority: "Média", createdAt: "2026-08-03 11:00", updatedAt: "2026-08-05 09:30", description: "Ajustar capa frontal para acetato fosco transparente.", assignedTo: "Operador Gráfica", resolution: null },
    { id: "TICK-105", title: "Reemissão de seguro viagem com prorrogação de data", requester: "Marcelo Alves", category: "Viagens", status: "RESOLVIDO", priority: "Baixa", createdAt: "2026-07-28 16:45", updatedAt: "2026-07-29 10:00", description: "Prorrogar apólice de seguro viagem por mais 24h devido a escala de voo alterada.", assignedTo: "William Nunes", resolution: "Endosso de seguro emitido com sucesso junto à Allianz." },
    { id: "TICK-106", title: "Crédito de bilhete não aparece na nova solicitação", requester: "Camila Vasconcelos", category: "Viagens", status: "EM_ATENDIMENTO", priority: "Alta", createdAt: "2026-08-07 08:40", updatedAt: "2026-08-07 11:20", description: "Validar disponibilidade do crédito TKT-44218 para a rota Recife.", assignedTo: "William Nunes", resolution: null },
    { id: "TICK-107", title: "Dúvida sobre justificativa de corrida noturna", requester: "Ricardo Menezes", category: "Mobilidade", status: "EM_ABERTO", priority: "Média", createdAt: "2026-08-07 15:05", updatedAt: "2026-08-07 15:05", description: "Orientação para registrar o motivo da corrida RID-5508.", assignedTo: "Maria Catarina", resolution: null },
    { id: "TICK-108", title: "Coleta programada não confirmada", requester: "Renata Monteiro", category: "Correios", status: "EM_ATENDIMENTO", priority: "Alta", createdAt: "2026-08-08 10:10", updatedAt: "2026-08-08 13:30", description: "Confirmar coleta do envio COR-2026-007 antes do fechamento da unidade.", assignedTo: "Atendente Correios", resolution: null },
    { id: "TICK-109", title: "Alteração de tiragem de formulário cirúrgico", requester: "Eduardo Santos", category: "Xerox", status: "RESOLVIDO", priority: "Média", createdAt: "2026-08-08 11:45", updatedAt: "2026-08-08 14:15", description: "Ajustar o JOB-DEMO-006 de 400 para 500 cópias.", assignedTo: "Operador Gráfica", resolution: "Tiragem atualizada antes do início da impressão." },
    { id: "TICK-110", title: "Prazo de entrega de etiquetas de pesquisa", requester: "Camila Vasconcelos", category: "Xerox", status: "EM_ABERTO", priority: "Baixa", createdAt: "2026-08-09 09:25", updatedAt: "2026-08-09 09:25", description: "Consultar previsão do JOB-DEMO-009 para organização das amostras.", assignedTo: null, resolution: null }
  ],

  // Base de Conhecimento Oficial
  knowledgeArticles: [
    {
      id: "ART-01",
      title: "Diretriz de Viagens Corporativas (RN-VIA-001 / RN-VIA-003)",
      category: "Viagens",
      updatedAt: "2026-08-01",
      docRef: "POL-VIA-2026",
      content: "As solicitações de viagens nacionais devem ser abertas com no mínimo 14 dias de antecedência. Toda viagem corporativa emitida inclui compulsoriamente cobertura de Seguro Viagem Nacional/Internacional com assistência médica integral (RN-VIA-003). A aprovação do Gestor da área é mandatória antes da emissão dos bilhetes."
    },
    {
      id: "ART-02",
      title: "Política de Reutilização de Bilhetes Não Voados (RN-VIA-002)",
      category: "Viagens",
      updatedAt: "2026-07-25",
      docRef: "POL-VIA-CREDITOS",
      content: "Antes de emitir uma nova passagem aérea, o sistema verifica automaticamente a existência de créditos de bilhetes não voados do mesmo viajante ou centro de custo. Os créditos disponíveis são abatidos do valor total da cotação, evitando custos adicionais e perdas por expiração."
    },
    {
      id: "ART-03",
      title: "Diretrizes de Mobilidade Corporativa e Uber (RN-MOB-001 / RN-MOB-002)",
      category: "Mobilidade",
      updatedAt: "2026-07-20",
      docRef: "POL-MOB-2026",
      content: "O uso de veículos corporativos é exclusivo para deslocamentos a serviço institucional, visitas externas e plantões noturnos autorizados após as 22h. Corridas com valores superiores a R$ 80,00 ou realizadas em fins de semana geram alertas de auditoria e exigem justificativa formal no faturamento."
    },
    {
      id: "ART-04",
      title: "Regras para Envios Postais e SEDEX 10 (RN-COR-001 / RN-COR-002)",
      category: "Correios",
      updatedAt: "2026-06-15",
      docRef: "POL-COR-2026",
      content: "Envios convencionais devem priorizar o serviço SEDEX padrão ou PAC. O uso da modalidade expressa SEDEX 10 requer justificativa de urgência regulatória ou parecer da Diretoria. Todos os envios geram código de rastreamento com notificação automática ao solicitante."
    },
    {
      id: "ART-05",
      title: "Prazos e Normas para Serviços Gráficos e Xerox (RN-XER-001)",
      category: "Xerox",
      updatedAt: "2026-05-20",
      docRef: "POL-XER-2026",
      content: "O catálogo de serviços gráficos contempla impressões A4, A3, banners em lona e apostilas encadernadas. O prazo padrão de produção é de 24 horas úteis. Tiragens com mais de 500 páginas ou acabamentos especiais passam por validação de orçamento com Suprimentos."
    }
  ],

  // Dados Financeiros e de Faturamento
  financeiro: {
    orcamento: 520000,
    evolucaoMensal: {
      months: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago"],
      viagens: [42000, 38000, 45000, 51000, 48000, 52000, 55000, 58000],
      mobilidade: [16000, 18000, 17000, 19000, 21000, 23000, 22000, 24000],
      correios: [5500, 6200, 5800, 6100, 5900, 6500, 6300, 6800],
      xerox: [2800, 3100, 2900, 3300, 3000, 3400, 3200, 3500]
    },
    gastosPorFrente: [
      { name: "Viagens", value: 389000, color: "#2563eb", note: "sim." },
      { name: "Mobilidade", value: 156000, color: "#0ea5e9", note: "sim." },
      { name: "Correios", value: 43200, color: "#8b5cf6", note: "sim." },
      { name: "Xerox", value: 24300, color: "#f59e0b", note: "sim." }
    ],
    centrosCusto: [
      { code: "CC-3021", name: "UTI Geral Adulto", manager: "Fernanda Lima", gastoTotal: 84500, solicitacoes: 42, frentePrincipal: "Viagens", statusConciliacao: "Conciliado" },
      { code: "CC-1040", name: "Diretoria Médica", manager: "Fernanda Lima", gastoTotal: 62800, solicitacoes: 28, frentePrincipal: "Viagens", statusConciliacao: "Conciliado" },
      { code: "CC-2055", name: "Infraestrutura & Supply Chain", manager: "Iramaia Rodrigues", gastoTotal: 96100, solicitacoes: 54, frentePrincipal: "Mobilidade", statusConciliacao: "Conciliado" },
      { code: "CC-4010", name: "Centro Cirúrgico e CME", manager: "Dr. Eduardo Santos", gastoTotal: 112400, solicitacoes: 36, frentePrincipal: "Viagens", statusConciliacao: "Pendente" },
      { code: "CC-5020", name: "Oncologia e Hematologia", manager: "Dra. Juliana Prado", gastoTotal: 74200, solicitacoes: 31, frentePrincipal: "Xerox", statusConciliacao: "Conciliado" },
      { code: "CC-6015", name: "Pronto Atendimento", manager: "Dr. Ricardo Menezes", gastoTotal: 58900, solicitacoes: 26, frentePrincipal: "Mobilidade", statusConciliacao: "Pendente" },
      { code: "CC-7080", name: "Pesquisa Clínica e Ensino (IEP)", manager: "Dra. Camila Vasconcelos", gastoTotal: 63600, solicitacoes: 29, frentePrincipal: "Correios", statusConciliacao: "Conciliado" }
    ],
    conciliacao: {
      totalRegistros: 246,
      conciliados: 232,
      pendentes: 8,
      divergencias: 6,
      percentual: 94.3,
      ultimaConciliacao: "2026-08-06 18:00",
      nota: "sim."
    },
    alertas: [
      { id: "ALT-001", tipo: "divergencia", titulo: "Divergência de valor em passagem aérea", descricao: "SOL-2026-006: valor faturado R$ 3.120,00 vs aprovado R$ 3.050,00", prioridade: "alta", data: "2026-08-06 14:30" },
      { id: "ALT-002", tipo: "pendencia", titulo: "Fatura Copastur aguardando conferência", descricao: "NF-2026-0891 (Copastur) — R$ 24.450,00 pendente de conciliação fiscal", prioridade: "media", data: "2026-08-05 09:15" },
      { id: "ALT-003", tipo: "prazo", titulo: "Prazo de fechamento mensal do CC-4010", descricao: "Centro Cirúrgico possui 2 faturas pendentes com vencimento em 48h", prioridade: "media", data: "2026-08-04 16:00" }
    ]
  },

  // Dados do Dashboard Central
  dashboard: {
    kpis: {
      solicitacoesHoje: { value: 142, label: "Solicitações hoje", change: "+15% vs ontem", changeType: "up", note: "sim." },
      viagensAndamento: { value: 38, label: "Viagens em andamento", change: "+8% vs ontem", changeType: "up", note: "sim." },
      prazoVencido: { value: 4, label: "Itens com prazo vencido", change: "-3 vs ontem", changeType: "down", note: "sim." },
      economiaMes: { value: 148900, label: "Economia no mês (Créditos & Acordos)", change: "+22% vs mês anterior", changeType: "up", currency: "BRL", note: "sim." },
      bilhetesNaoVoados: { value: 8, label: "Bilhetes não voados disponíveis", change: "-2 reutilizados", changeType: "down", note: "sim." },
      atendimentosAbertos: { value: 19, label: "Chamados em atendimento", change: "-5 vs ontem", changeType: "down", note: "sim." }
    },
    solicitacoesPorDia: {
      days: ["01/ago", "02/ago", "03/ago", "04/ago", "05/ago", "06/ago", "07/ago"],
      values: [95, 115, 140, 105, 160, 135, 142]
    },
    solicitacoesPor30Dias: {
      days: ["09/jul", "13/jul", "17/jul", "21/jul", "25/jul", "29/jul", "02/ago", "07/ago"],
      values: [72, 88, 104, 91, 126, 118, 151, 142]
    },
    gastosPorCategoria: [
      { name: "Viagens", value: 286400, color: "#2563eb" },
      { name: "Mobilidade", value: 128750, color: "#059669" },
      { name: "Correios", value: 42680, color: "#9333ea" },
      { name: "Xerox", value: 78920, color: "#ea580c" }
    ],
    gastosPorCategoriaTrimestre: [
      { name: "Viagens", value: 824600, color: "#2563eb" },
      { name: "Mobilidade", value: 372450, color: "#059669" },
      { name: "Correios", value: 119840, color: "#9333ea" },
      { name: "Xerox", value: 224300, color: "#ea580c" }
    ],
    statusSolicitacoes: {
      total: 486,
      segments: [
        { label: "Concluídas", count: 248, pct: 51, color: "#059669" },
        { label: "Em atendimento", count: 112, pct: 23, color: "#2563eb" },
        { label: "Aguardando aprovação", count: 78, pct: 16, color: "#ea580c" },
        { label: "Outros", count: 48, pct: 10, color: "#9333ea" }
      ]
    },
    filaOperacional: {
      badge: "6 pendências prioritárias",
      items: [
        { icon: "✈️", title: "Viagem – Carlos Andrade", subtitle: "Brasília/DF – Congresso Sepse", badge: "Crítico", badgeClass: "critico", time: "Há 1h", type: "Aprovação pendente" },
        { icon: "🎫", title: "Bilhete Disponível – LATAM R$ 450,00", subtitle: "TKT-99420 expira em 30/nov", badge: "Alto", badgeClass: "alto", time: "Há 3h", type: "Crédito a utilizar" },
        { icon: "🚗", title: "Mobilidade – Ajuste Noturno", subtitle: "Carlos Andrade – Limite UTI", badge: "Alto", badgeClass: "alto", time: "Há 4h", type: "Aprovação gestor" },
        { icon: "📦", title: "Correios – Amostras UFMG", subtitle: "Envio prioritário SEDEX", badge: "Alto", badgeClass: "alto", time: "Há 5h", type: "Aprovação custos" },
        { icon: "🖨️", title: "Xerox – Cartilhas Oncologia", subtitle: "200 cartilhas A5 coloridas", badge: "Médio", badgeClass: "medio", time: "Há 6h", type: "Fila gráfica" },
        { icon: "✈️", title: "Viagem – Fernanda Lima", subtitle: "Porto Alegre/RS – Robótica", badge: "Médio", badgeClass: "medio", time: "Há 7h", type: "Cotação Copastur" },
        { icon: "📦", title: "Correios – Protocolo regulatório", subtitle: "Entrega prevista até 16h", badge: "Médio", badgeClass: "medio", time: "Há 8h", type: "Rastreamento" },
        { icon: "🚗", title: "Mobilidade – Centro Cirúrgico", subtitle: "Inclusão de três profissionais", badge: "Baixo", badgeClass: "baixo", time: "Ontem", type: "Cadastro de acesso" }
      ]
    },
    servicosRecentes: [
      { name: "Carlos Andrade", type: "✈️ Viagem", status: "Aguard. Aprovação", statusClass: "status-PENDENTE_APROVACAO", cc: "CC 3021 – UTI Geral", date: "Hoje 10:15" },
      { name: "Fernanda Lima", type: "📦 Correios", status: "Em trânsito", statusClass: "status-EM_ATENDIMENTO", cc: "CC 1040 – Diretoria Médica", date: "Hoje 08:30" },
      { name: "Carlos Andrade", type: "🖨️ Xerox", status: "Em produção", statusClass: "status-EM_ATENDIMENTO", cc: "CC 3021 – UTI Geral", date: "Ontem 14:00" },
      { name: "Fernanda Lima", type: "✈️ Viagem", status: "Em emissão", statusClass: "status-EM_ATENDIMENTO", cc: "CC 4010 – Centro Cirúrgico", date: "05/ago 11:15" },
      { name: "Carlos Andrade", type: "🚗 Mobilidade", status: "Concluído", statusClass: "status-CONCLUIDO", cc: "CC 3021 – UTI Geral", date: "04/ago 22:45" },
      { name: "Juliana Prado", type: "🖨️ Xerox", status: "Em produção", statusClass: "status-EM_ATENDIMENTO", cc: "CC 5020 – Oncologia", date: "04/ago 16:20" },
      { name: "Ricardo Menezes", type: "📦 Correios", status: "Entregue", statusClass: "status-CONCLUIDO", cc: "CC 6015 – Emergência", date: "03/ago 13:10" },
      { name: "Camila Vasconcelos", type: "✈️ Viagem", status: "Aprovado", statusClass: "status-APROVADO", cc: "CC 7080 – Ensino", date: "02/ago 09:35" }
    ],
    fornecedores: [
      { name: "Copastur", category: "Viagens corporativas", sla: 98.4, label: "SLA", status: "On time", color: "#2563eb", type: "real" },
      { name: "Uber for Business", category: "Mobilidade corporativa", sla: 96.8, label: "SLA", status: "On time", color: "#059669", type: "real" },
      { name: "Correios Brasil", category: "Serviços postais & SEDEX", sla: 94.7, label: "SLA", status: "On time", color: "#2563eb", type: "real" },
      { name: "Gráfica Paulista", category: "Impressões & Gráfica", sla: 97.1, label: "SLA", status: "On time", color: "#ea580c", type: "real" }
    ],
    ultimasAcoes: [
      { icon: "✅", text: "Solicitação Aprovada", detail: "Viagem Visita Rio de Janeiro – Carlos Andrade", time: "Há 15 min", color: "var(--success)" },
      { icon: "🎫", text: "Crédito Vinculado", detail: "TKT-99420 aplicado na cotação de viagem", time: "Há 40 min", color: "var(--accent)" },
      { icon: "📄", text: "Fatura Conciliada", detail: "Copastur Viagens — CC 3021 (R$ 18.450,00)", time: "Há 1h", color: "var(--text-muted)" },
      { icon: "📦", text: "Objeto Postado", detail: "BR-SEDEX-0001 a caminho de Brasília", time: "Há 2h", color: "var(--text-muted)" },
      { icon: "🖨️", text: "Produção Iniciada", detail: "200 cartilhas de orientação ao paciente", time: "Há 3h", color: "var(--accent)" },
      { icon: "🚗", text: "Limite Atualizado", detail: "Mobilidade noturna do Centro Cirúrgico", time: "Há 4h", color: "var(--success)" },
      { icon: "✈️", text: "Cotação Recebida", detail: "Três opções para Porto Alegre", time: "Há 5h", color: "var(--accent)" }
    ],
    servicosGerais: {
      totalAtendimentos: 72,
      pendentes: 14,
      concluidos: 53,
      tempoMedioMin: 32,
      frentes: [
        { id: "entregas", name: "Entregas", icon: "📦", pendentes: 3, total: 16, slaTarget: "1h", slaActual: "96.4%", evidenceStatus: "CONFIRMADO_SCREENSHOT", validationBadge: "Confirmado por Screenshot" },
        { id: "estacionamento", name: "Estacionamento", icon: "🅿️", pendentes: 1, total: 9, slaTarget: "4h", slaActual: "99.1%", evidenceStatus: "CONFIRMADO_SCREENSHOT", validationBadge: "Confirmado por Screenshot" },
        { id: "achados_perdidos", name: "Achados e Perdidos", icon: "🔍", pendentes: 2, total: 8, slaTarget: "24h", slaActual: "98.0%", evidenceStatus: "CONFIRMADO_SCREENSHOT", validationBadge: "Confirmado por Screenshot" },
        { id: "investigacao_ocorrencia", name: "Investigação de Ocorrência", icon: "📋", pendentes: 1, total: 2, slaTarget: "Pendente", slaActual: "Pendente", evidenceStatus: "CONFIRMADO_SCREENSHOT", validationBadge: "Pendente Levantamento de Campos" },
        { id: "autorizacao_excepcional", name: "Autorizações Excepcionais", icon: "🛡️", pendentes: 1, total: 6, slaTarget: "12h", slaActual: "98.9%", evidenceStatus: "CONFIRMADO_SCREENSHOT", validationBadge: "Confirmado por Screenshot" },
        { id: "liberacao_acesso", name: "Acessos (Especial / Perda)", icon: "🔑", pendentes: 2, total: 6, slaTarget: "4h", slaActual: "97.2%", evidenceStatus: "CONFIRMADO_SCREENSHOT", validationBadge: "Confirmado por Screenshot" },
        { id: "transporte", name: "Transporte Interno", icon: "🚐", pendentes: 2, total: 14, slaTarget: "30 min", slaActual: "97.8%", evidenceStatus: "IDENTIFICADO_BENCHMARK", validationBadge: "Benchmark (Pendente Validação)" },
        { id: "solicitacao_imagens", name: "Solicitação de Imagens", icon: "📷", pendentes: 1, total: 5, slaTarget: "48h", slaActual: "95.5%", evidenceStatus: "IDENTIFICADO_BENCHMARK", validationBadge: "Hipótese (Não Confirmado)" }
      ]
    }
  },

  // Trilha Auditável Inicial (RN-SEG-003)
  auditLogs: [
    { id: "AUD-1001", timestamp: "2026-08-07 08:00:00", user: "Patrícia Souza", role: "administrador", action: "SISTEMA_INICIALIZADO", resource: "CS360_CORE", ip: "10.20.0.1 (Intranet HSL)", details: "Sessão iniciada na Central de Serviços 360." },
    { id: "AUD-1002", timestamp: "2026-08-07 08:15:30", user: "Carlos Andrade", role: "colaborador", action: "SOLICITACAO_CRIADA", resource: "SOL-2026-001", ip: "10.20.14.88 (Estação UTI-3)", details: "Criada solicitação de viagem para o Congresso de Terapia Intensiva." },
    { id: "AUD-1003", timestamp: "2026-08-07 09:00:00", user: "Fernanda Lima", role: "gestor", action: "SOLICITACAO_APROVADA", resource: "SOL-2026-002", ip: "10.20.10.12 (Diretoria Médica)", details: "Aprovada solicitação de viagem técnica ao Rio de Janeiro com crédito vinculado." },
    { id: "AUD-1004", timestamp: "2026-08-07 09:45:10", user: "Maria Catarina", role: "faturamento", action: "CONCILIACAO_REALIZADA", resource: "FAT-2026-088", ip: "10.20.12.05 (Faturamento)", details: "Conciliada fatura de mobilidade Uber for Business de julho." },
    { id: "AUD-1005", timestamp: "2026-08-07 10:20:00", user: "William Nunes", role: "viagens", action: "BILHETE_COTADO", resource: "SOL-2026-006", ip: "10.20.12.18 (Central Viagens)", details: "Cotação aérea e reserva de hotel emitidas para Porto Alegre." }
  ]
};

// Inicialização segura no localStorage com prefixo cs360_
(function initializeMockStorage() {
  const STORAGE_KEY = "cs360_data";
  const USER_ROLE_KEY = "cs360_active_role";

  // Atualiza sempre para manter os dados enriquecidos disponíveis
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.CS360_INITIAL_MOCK));

  if (!localStorage.getItem(USER_ROLE_KEY)) {
    localStorage.setItem(USER_ROLE_KEY, "colaborador");
  }
})();
