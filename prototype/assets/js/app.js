/**
 * CENTRAL DE SERVIÇOS 360 - CORE APPLICATION ENGINE
 * JavaScript puro | Execução em file:// | Persistência localStorage (cs360_)
 */

(function () {
  "use strict";

  const STORAGE_KEY = "cs360_data";
  const ROLE_KEY = "cs360_active_role";

  // --- 1. MÉTODOS DE PERSISTÊNCIA & ESTADO ---
  function getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return window.CS360_INITIAL_MOCK;
      return JSON.parse(raw);
    } catch (e) {
      console.error("Erro ao ler localStorage cs360_data:", e);
      return window.CS360_INITIAL_MOCK;
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Erro ao salvar localStorage cs360_data:", e);
    }
  }

  function getActiveRole() {
    return localStorage.getItem(ROLE_KEY) || "colaborador";
  }

  function setActiveRole(roleId) {
    localStorage.setItem(ROLE_KEY, roleId);
    logAuditEvent("TROCA_PERFIL_SIMULADO", `Perfil alternado para: ${roleId}`);
    window.location.reload();
  }

  function logAuditEvent(action, details) {
    const data = getData();
    const roleId = getActiveRole();
    const roleObj = data.roles.find(r => r.id === roleId) || { name: roleId };

    const newLog = {
      id: "AUD-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: `Usuário (${roleObj.name})`,
      role: roleId,
      action: action,
      resource: "SESSAO_PROTOTIPO",
      ip: "127.0.0.1 (Local Mock)",
      details: details
    };

    data.auditLogs.unshift(newLog);
    saveData(data);
  }

  // Function: Restaurar Dados da Demonstração (Exclusivo Administrador)
  window.resetPrototypeData = function () {
    if (confirm("ATENÇÃO (ADMIN): Deseja restaurar os dados fictícios originais da demonstração? Quaisquer alterações locais serão desfeitas.")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.CS360_INITIAL_MOCK));
      alert("Dados da demonstração restaurados com sucesso!");
      window.location.reload();
    }
  };

  // --- 2. INJEÇÃO DE COMPONENTES COMPARTILHADOS ---
  document.addEventListener("DOMContentLoaded", () => {
    injectTopNoticeBar();
    injectAppLayout();
    renderPageSpecificContent();
  });

  function injectTopNoticeBar() {
    const noticeBar = document.createElement("div");
    noticeBar.className = "prototype-notice-bar";

    const textSpan = document.createElement("span");
    textSpan.textContent = "⚠️ PROTÓTIPO INTERNO — DADOS FICTÍCIOS. Autenticação simulada. Não representa o futuro login corporativo.";

    const badgeSpan = document.createElement("span");
    badgeSpan.className = "badge-mock";
    badgeSpan.textContent = "MODO MOCK ATIVO";

    noticeBar.appendChild(textSpan);
    noticeBar.appendChild(badgeSpan);
    document.body.prepend(noticeBar);
  }

  function injectAppLayout() {
    const activePage = document.body.getAttribute("data-page") || "dashboard";
    const activeRole = getActiveRole();
    const data = getData();

    // Se estiver na página de login, layout customizado
    if (activePage === "login") return;

    const layoutContainer = document.getElementById("app-layout-root");
    if (!layoutContainer) return;
    layoutContainer.classList.add("app-layout");

    // Sidebar Links Definição
    const navItems = [
      { id: "dashboard", label: "Dashboard 360", icon: "📊", href: "dashboard.html" },
      { id: "solicitacoes", label: "Minhas Solicitações", icon: "📋", href: "solicitacoes.html" },
      { id: "solicitacao-nova", label: "Nova Solicitação", icon: "➕", href: "solicitacao-nova.html" },
      { id: "viagens", label: "Viagens Corporativas", icon: "✈️", href: "viagens.html" },
      { id: "mobilidade", label: "Mobilidade Urbana", icon: "🚗", href: "mobilidade.html" },
      { id: "correios", label: "Correios e Envios", icon: "📦", href: "correios.html" },
      { id: "xerox", label: "Xerox e Impressões", icon: "🖨️", href: "xerox.html" },
      { id: "aprovacoes", label: "Central de Aprovações", icon: "✅", href: "aprovacoes.html" },
      { id: "atendimentos", label: "Atendimento & Chamados", icon: "🎧", href: "atendimentos.html" },
      { id: "financeiro", label: "Financeiro & Custos", icon: "💰", href: "financeiro.html" },
      { id: "fornecedores", label: "Fornecedores & SLAs", icon: "🏢", href: "fornecedores.html" },
      { id: "relatorios", label: "Relatórios & BI", icon: "📈", href: "relatorios.html" },
      { id: "conhecimento", label: "Base & Chatbot", icon: "🤖", href: "conhecimento.html" },
      { id: "administracao", label: "Administração & Audit", icon: "⚙️", href: "administracao.html" }
    ];

    // Montar HTML Sidebar dinamicamente com segurança
    const sidebar = document.createElement("aside");
    sidebar.className = "app-sidebar";

    const sidebarHeader = document.createElement("div");
    sidebarHeader.className = "sidebar-header";
    sidebarHeader.innerHTML = `
      <div class="brand-title">
        <span>Central 360</span>
      </div>
    `;
    sidebar.appendChild(sidebarHeader);

    const navList = document.createElement("nav");
    navList.className = "sidebar-nav";

    const sectionTitle = document.createElement("div");
    sectionTitle.className = "nav-section-title";
    sectionTitle.textContent = "Módulos de Serviço";
    navList.appendChild(sectionTitle);

    navItems.forEach(item => {
      const link = document.createElement("a");
      link.href = item.href;
      link.className = `nav-link ${activePage === item.id ? "active" : ""}`;

      const iconSpan = document.createElement("span");
      iconSpan.className = "nav-icon";
      iconSpan.textContent = item.icon;

      const labelSpan = document.createElement("span");
      labelSpan.textContent = item.label;

      link.appendChild(iconSpan);
      link.appendChild(labelSpan);
      navList.appendChild(link);
    });

    sidebar.appendChild(navList);

    // Montar Topbar Header
    const mainWrapper = document.createElement("div");
    mainWrapper.className = "app-main";

    const topbar = document.createElement("header");
    topbar.className = "app-topbar";

    const topbarLeft = document.createElement("div");
    topbarLeft.className = "topbar-left";

    // Breadcrumb
    const detailLabels = { "solicitacao-detalhe": "Detalhes da Solicitação", "viagem-detalhe": "Itinerário de Viagem" };
    const pageObj = navItems.find(n => n.id === activePage) || { label: detailLabels[activePage] || "Início" };
    topbarLeft.innerHTML = `
      <nav class="breadcrumbs" aria-label="Navegação em migalhas">
        <a href="dashboard.html">Portal 360</a>
        <span class="separator">/</span>
        <span class="current">${escapeHTML(pageObj.label)}</span>
      </nav>
    `;

    const topbarRight = document.createElement("div");
    topbarRight.className = "topbar-right";

    // Seletor de Perfil Simulado
    const roleContainer = document.createElement("div");
    roleContainer.className = "role-selector-container";

    const roleLabel = document.createElement("span");
    roleLabel.className = "role-selector-label";
    roleLabel.textContent = "Perfil Simulado:";

    const roleSelect = document.createElement("select");
    roleSelect.className = "role-selector-select";
    roleSelect.ariaLabel = "Selecione o perfil de demonstração";

    data.roles.forEach(r => {
      const opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = r.name;
      if (r.id === activeRole) opt.selected = true;
      roleSelect.appendChild(opt);
    });

    roleSelect.addEventListener("change", (e) => {
      setActiveRole(e.target.value);
    });

    roleContainer.appendChild(roleLabel);
    roleContainer.appendChild(roleSelect);
    topbarRight.appendChild(roleContainer);

    // Se perfil = administrador, injetar botão de reset de dados da demonstração
    if (activeRole === "administrador") {
      const btnReset = document.createElement("button");
      btnReset.className = "btn btn-danger";
      btnReset.style.fontSize = "0.75rem";
      btnReset.style.padding = "4px 10px";
      btnReset.textContent = "🔄 Restaurar Dados Demo";
      btnReset.onclick = window.resetPrototypeData;
      topbarRight.appendChild(btnReset);
    }

    topbar.appendChild(topbarLeft);
    topbar.appendChild(topbarRight);

    mainWrapper.appendChild(topbar);

    // Mover o conteúdo da página para dentro de mainWrapper
    const contentSlot = document.getElementById("page-content-slot");
    if (contentSlot) {
      mainWrapper.appendChild(contentSlot);
    }

    layoutContainer.appendChild(sidebar);
    layoutContainer.appendChild(mainWrapper);
  }

  // --- 3. LÓGICAS DE PÁGINAS ESPECÍFICAS ---
  function renderPageSpecificContent() {
    const activePage = document.body.getAttribute("data-page");
    const data = getData();
    const role = getActiveRole();

    switch (activePage) {
      case "dashboard":
        renderDashboard(data);
        break;
      case "solicitacoes":
        renderSolicitacoesList(data);
        break;
      case "solicitacao-nova":
        setupNovaSolicitacaoForm(data);
        break;
      case "solicitacao-detalhe":
        renderSolicitacaoDetalhe(data);
        break;
      case "aprovacoes":
        renderAprovacoesList(data, role);
        break;
      case "viagens":
        renderViagensList(data);
        break;
      case "mobilidade":
        renderMobilidadeList(data);
        break;
      case "correios":
        renderCorreiosList(data);
        break;
      case "xerox":
        renderXeroxList(data);
        break;
      case "conhecimento":
        setupChatbotAndKnowledge(data);
        break;
      case "administracao":
        renderAdministracao(data);
        break;
      case "fornecedores":
        renderFornecedoresList(data);
        break;
      case "atendimentos":
        renderAtendimentosList(data);
        break;
      case "relatorios":
        renderRelatorios(data);
        break;
      default:
        break;
    }
  }

  // --- DASHBOARD RENDERING ---
  function renderDashboard(data) {
    const totalRequests = data.requests.length;
    const pendingApprovals = data.requests.filter(r => r.status === "PENDENTE_APROVACAO").length;
    const activeTrips = data.requests.filter(r => r.serviceType === "viagem" && (r.status === "APROVADO" || r.status === "EM_ATENDIMENTO")).length;
    const nonFlownCount = data.nonFlownTickets.filter(t => t.status === "DISPONIVEL").length;

    setText("metric-total-requests", totalRequests);
    setText("metric-pending-approvals", pendingApprovals);
    setText("metric-active-trips", activeTrips);
    setText("metric-non-flown", nonFlownCount);

    // Renderizar gráfico de barras em CSS puro
    const chartContainer = document.getElementById("chart-status-distribution");
    if (chartContainer) {
      const counts = {
        PENDENTE_APROVACAO: 0,
        APROVADO: 0,
        EM_ATENDIMENTO: 0,
        CONCLUIDO: 0,
        REJEITADO: 0
      };
      data.requests.forEach(r => {
        if (counts[r.status] !== undefined) counts[r.status]++;
      });

      chartContainer.innerHTML = "";
      const labels = {
        PENDENTE_APROVACAO: "Pendente Aprovação",
        APROVADO: "Aprovado",
        EM_ATENDIMENTO: "Em Atendimento",
        CONCLUIDO: "Concluído",
        REJEITADO: "Rejeitado"
      };

      Object.keys(counts).forEach(st => {
        const row = document.createElement("div");
        row.className = "chart-bar-row";
        const val = counts[st];
        const pct = totalRequests > 0 ? Math.round((val / totalRequests) * 100) : 0;

        row.innerHTML = `
          <div class="chart-bar-label">${labels[st]}</div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width: ${pct}%;"></div>
          </div>
          <div class="chart-bar-value">${val} (${pct}%)</div>
        `;
        chartContainer.appendChild(row);
      });
    }

    // Renderizar Fila Operacional Recente
    const tableBody = document.getElementById("dashboard-queue-tbody");
    if (tableBody) {
      tableBody.innerHTML = "";
      data.requests.slice(0, 5).forEach(req => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${escapeHTML(req.id)}</strong></td>
          <td>${escapeHTML(req.title)}</td>
          <td>${escapeHTML(req.requesterName)}</td>
          <td><span class="status-badge status-${req.status}">${formatStatus(req.status)}</span></td>
          <td><a href="solicitacao-detalhe.html?id=${req.id}" class="btn btn-secondary" style="padding: 2px 8px; font-size:0.8rem;">Ver</a></td>
        `;
        tableBody.appendChild(tr);
      });
    }
  }

  // --- SOLICITAÇÕES LIST RENDERING ---
  function renderSolicitacoesList(data) {
    const tbody = document.getElementById("requests-tbody");
    if (!tbody) return;

    const filterStatus = document.getElementById("filter-status");
    const filterType = document.getElementById("filter-type");

    function updateTable() {
      tbody.innerHTML = "";
      const sVal = filterStatus ? filterStatus.value : "ALL";
      const tVal = filterType ? filterType.value : "ALL";

      const filtered = data.requests.filter(r => {
        if (sVal !== "ALL" && r.status !== sVal) return false;
        if (tVal !== "ALL" && r.serviceType !== tVal) return false;
        return true;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">Nenhuma solicitação encontrada para os filtros selecionados.</td></tr>`;
        return;
      }

      filtered.forEach(req => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${escapeHTML(req.id)}</strong></td>
          <td><span style="text-transform: capitalize; font-weight: 600;">${escapeHTML(req.serviceType)}</span></td>
          <td>${escapeHTML(req.title)}</td>
          <td>${escapeHTML(req.costCenter)}</td>
          <td><span class="status-badge status-${req.status}">${formatStatus(req.status)}</span></td>
          <td><a href="solicitacao-detalhe.html?id=${req.id}" class="btn btn-secondary" style="padding: 4px 10px; font-size:0.85rem;">Detalhes</a></td>
        `;
        tbody.appendChild(tr);
      });
    }

    if (filterStatus) filterStatus.addEventListener("change", updateTable);
    if (filterType) filterType.addEventListener("change", updateTable);
    updateTable();
  }

  // --- NOVA SOLICITAÇÃO FORM (JORNADA DE VIAGEM COMPLETA) ---
  function setupNovaSolicitacaoForm(data) {
    const form = document.getElementById("form-nova-solicitacao");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = document.getElementById("req-title").value.trim();
      const type = document.getElementById("req-type").value;
      const costCenter = document.getElementById("req-cost-center").value;
      const actionSubmit = e.submitter ? e.submitter.getAttribute("data-action") : "send";

      if (!title) {
        alert("Por favor, informe o título da solicitação.");
        return;
      }

      const newId = "SOL-2026-" + Math.floor(100 + Math.random() * 900);
      const isDraft = actionSubmit === "draft";
      const status = isDraft ? "RASCUNHO" : "PENDENTE_APROVACAO";

      const newRequest = {
        id: newId,
        serviceType: type,
        title: title,
        requesterId: "USR-001",
        requesterName: "Carlos Andrade",
        costCenter: costCenter,
        status: status,
        createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        urgent: false,
        details: {
          origin: document.getElementById("req-origin") ? document.getElementById("req-origin").value : "São Paulo (GRU)",
          destination: document.getElementById("req-destination") ? document.getElementById("req-destination").value : "Brasília (BSB)",
          departureDate: document.getElementById("req-dep-date") ? document.getElementById("req-dep-date").value : "2026-09-20",
          reason: document.getElementById("req-reason") ? document.getElementById("req-reason").value : "Treinamento institucional.",
          needsHotel: true,
          insuranceRequested: true
        },
        history: [
          { date: new Date().toISOString().replace("T", " ").substring(0, 16), action: isDraft ? "Criado rascunho da solicitação." : "Enviado para aprovação do gestor.", user: "Carlos Andrade" }
        ]
      };

      data.requests.unshift(newRequest);
      saveData(data);

      logAuditEvent(isDraft ? "SOLICITACAO_RASCUNHO" : "SOLICITACAO_ENVIADA", `Solicitação ${newId} (${title}) criada com status ${status}.`);

      alert(isDraft ? `Rascunho ${newId} salvo com sucesso!` : `Solicitação ${newId} enviada para aprovação com sucesso!`);
      window.location.href = "solicitacoes.html";
    });
  }

  // --- SOLICITAÇÃO DETALHE ---
  function renderSolicitacaoDetalhe(data) {
    const urlParams = new URLSearchParams(window.location.search);
    const reqId = urlParams.get("id") || "SOL-2026-001";
    const req = data.requests.find(r => r.id === reqId);

    if (!req) {
      setText("detail-id", "Não encontrada");
      return;
    }

    setText("detail-id", req.id);
    setText("detail-title", req.title);
    setText("detail-status-badge", formatStatus(req.status));

    const badgeEl = document.getElementById("detail-status-badge");
    if (badgeEl) badgeEl.className = `status-badge status-${req.status}`;

    setText("detail-requester", req.requesterName);
    setText("detail-cost-center", req.costCenter);
    setText("detail-type", req.serviceType.toUpperCase());
    setText("detail-created", req.createdAt);

    // Linha do Tempo
    const timelineEl = document.getElementById("detail-timeline");
    if (timelineEl) {
      timelineEl.innerHTML = "";
      req.history.forEach(hist => {
        const item = document.createElement("li");
        item.className = "timeline-item";
        item.innerHTML = `
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-date">${escapeHTML(hist.date)} — ${escapeHTML(hist.user)}</div>
            <div>${escapeHTML(hist.action)}</div>
          </div>
        `;
        timelineEl.appendChild(item);
      });
    }
  }

  // --- CENTRAL DE APROVAÇÕES (GESTOR APROVADOR JOURNEY) ---
  function renderAprovacoesList(data, role) {
    const tbody = document.getElementById("aprovacoes-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const pending = data.requests.filter(r => r.status === "PENDENTE_APROVACAO");

    if (pending.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--text-muted);">Não há pendências de aprovação aguardando sua deliberação.</td></tr>`;
      return;
    }

    pending.forEach(req => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHTML(req.id)}</strong></td>
        <td>${escapeHTML(req.requesterName)}</td>
        <td>${escapeHTML(req.title)}</td>
        <td>${escapeHTML(req.costCenter)}</td>
        <td>
          <button class="btn btn-success btn-aprov-action" data-id="${req.id}" data-action="approve" style="padding:4px 8px; font-size:0.8rem;">Aprovar</button>
          <button class="btn btn-danger btn-aprov-action" data-id="${req.id}" data-action="reject" style="padding:4px 8px; font-size:0.8rem;">Rejeitar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Event listeners para botões de aprovação/rejeição
    document.querySelectorAll(".btn-aprov-action").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        const action = e.target.getAttribute("data-action");
        handleAprovacaoDecision(data, id, action);
      });
    });
  }

  function handleAprovacaoDecision(data, reqId, action) {
    const req = data.requests.find(r => r.id === reqId);
    if (!req) return;

    if (action === "approve") {
      req.status = "APROVADO";
      req.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
      req.history.push({
        date: req.updatedAt,
        action: "Solicitação APROVADA pelo gestor autorizador.",
        user: "Fernanda Lima (Gestor)"
      });

      logAuditEvent("SOLICITACAO_APROVADA", `Solicitação ${reqId} aprovada pelo gestor.`);
      saveData(data);
      alert(`Solicitação ${reqId} APROVADA com sucesso!`);
      window.location.reload();
    } else if (action === "reject") {
      const rationale = prompt("REJEIÇÃO DE SOLICITAÇÃO (OBRIGATÓRIO): Por favor, digite a justificativa formal da rejeição:");
      if (!rationale || !rationale.trim()) {
        alert("A justificativa de rejeição é OBRIGATÓRIA (RN-GER-005). Nenhuma alteração realizada.");
        return;
      }

      req.status = "REJEITADO";
      req.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
      req.history.push({
        date: req.updatedAt,
        action: `Solicitação REJEITADA pelo gestor. Justificativa: "${rationale.trim()}"`,
        user: "Fernanda Lima (Gestor)"
      });

      logAuditEvent("SOLICITACAO_REJEITADA", `Solicitação ${reqId} rejeitada. Rationale: ${rationale.trim()}`);
      saveData(data);
      alert(`Solicitação ${reqId} REJEITADA e registrada no histórico.`);
      window.location.reload();
    }
  }

  // --- VIAGENS LIST & CREDITS ---
  function renderViagensList(data) {
    const tbody = document.getElementById("viagens-tbody");
    if (tbody) {
      tbody.innerHTML = "";
      const trips = data.requests.filter(r => r.serviceType === "viagem");
      trips.forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${escapeHTML(t.id)}</strong></td>
          <td>${escapeHTML(t.title)}</td>
          <td>${escapeHTML(t.details ? t.details.origin + " ➔ " + t.details.destination : "N/D")}</td>
          <td><span class="status-badge status-${t.status}">${formatStatus(t.status)}</span></td>
          <td><a href="viagem-detalhe.html?id=${t.id}" class="btn btn-secondary" style="padding:2px 8px; font-size:0.8rem;">Ver Itinerário</a></td>
        `;
        tbody.appendChild(tr);
      });
    }

    const tktTbody = document.getElementById("non-flown-tbody");
    if (tktTbody) {
      tktTbody.innerHTML = "";
      data.nonFlownTickets.forEach(tkt => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${escapeHTML(tkt.id)}</strong></td>
          <td>${escapeHTML(tkt.passenger)}</td>
          <td>${escapeHTML(tkt.airline)} (${escapeHTML(tkt.originalRoute)})</td>
          <td>R$ ${tkt.creditBalance.toFixed(2)}</td>
          <td>${escapeHTML(tkt.expiresAt)}</td>
          <td><span class="status-badge ${tkt.status === 'DISPONIVEL' ? 'status-APROVADO' : 'status-REJEITADO'}">${escapeHTML(tkt.status)}</span></td>
        `;
        tktTbody.appendChild(tr);
      });
    }
  }

  // --- MOBILIDADE LIST ---
  function renderMobilidadeList(data) {
    const tbody = document.getElementById("rides-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    data.mobilityRides.forEach(ride => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHTML(ride.id)}</strong></td>
        <td>${escapeHTML(ride.passenger)}</td>
        <td>${escapeHTML(ride.date)}</td>
        <td>${escapeHTML(ride.origin)} ➔ ${escapeHTML(ride.destination)}</td>
        <td>R$ ${ride.cost.toFixed(2)}</td>
        <td>${ride.policyFlag ? '<span class="status-badge status-REJEITADO">⚠️ Fora da Política</span>' : '<span class="status-badge status-APROVADO">Conforme</span>'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- CORREIOS LIST ---
  function renderCorreiosList(data) {
    const tbody = document.getElementById("correios-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    const mailReqs = data.requests.filter(r => r.serviceType === "correios");
    mailReqs.forEach(m => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHTML(m.id)}</strong></td>
        <td>${escapeHTML(m.title)}</td>
        <td>${escapeHTML(m.details ? m.details.modality : "N/D")}</td>
        <td><code>${escapeHTML(m.details ? m.details.trackingCode || "Pendente" : "Pendente")}</code></td>
        <td><span class="status-badge status-${m.status}">${formatStatus(m.status)}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- XEROX LIST ---
  function renderXeroxList(data) {
    const tbody = document.getElementById("xerox-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    const printReqs = data.requests.filter(r => r.serviceType === "xerox");
    printReqs.forEach(x => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHTML(x.id)}</strong></td>
        <td>${escapeHTML(x.title)}</td>
        <td>${escapeHTML(x.details ? `${x.details.format} | ${x.details.colorMode} | ${x.details.copies} ex.` : "N/D")}</td>
        <td><span class="status-badge status-${x.status}">${formatStatus(x.status)}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- ASSISTENTE DEMONSTRATIVO & CHATBOT DETERMINÍSTICO ---
  function setupChatbotAndKnowledge(data) {
    const chatInput = document.getElementById("chat-input");
    const chatBtn = document.getElementById("chat-btn-send");
    const chatContainer = document.getElementById("chat-messages-container");

    if (!chatInput || !chatBtn || !chatContainer) return;

    function appendMessage(sender, text, sourceDoc) {
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble ${sender}`;

      const textDiv = document.createElement("div");
      textDiv.textContent = text;
      bubble.appendChild(textDiv);

      if (sourceDoc) {
        const sourceSpan = document.createElement("span");
        sourceSpan.className = "chat-source-tag";
        sourceSpan.textContent = `📌 Fonte Oficial: ${sourceDoc}`;
        bubble.appendChild(sourceSpan);
      }

      chatContainer.appendChild(bubble);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function handleUserQuestion() {
      const q = chatInput.value.trim();
      if (!q) return;

      appendMessage("user", q, null);
      chatInput.value = "";

      const lowerQ = q.toLowerCase();
      let match = null;

      if (lowerQ.includes("viagem") || lowerQ.includes("viajar") || lowerQ.includes("voo")) {
        match = data.knowledgeArticles.find(a => a.id === "ART-01");
      } else if (lowerQ.includes("mobilidade") || lowerQ.includes("uber") || lowerQ.includes("táxi")) {
        match = data.knowledgeArticles.find(a => a.id === "ART-02");
      } else if (lowerQ.includes("correio") || lowerQ.includes("encomenda") || lowerQ.includes("postagem")) {
        match = data.knowledgeArticles.find(a => a.id === "ART-03");
      } else if (lowerQ.includes("impressão") || lowerQ.includes("xerox") || lowerQ.includes("gráfica")) {
        match = data.knowledgeArticles.find(a => a.id === "ART-04");
      }

      setTimeout(() => {
        if (match) {
          appendMessage("bot", match.content, `${match.docRef} (Atualizado em ${match.updatedAt})`);
        } else {
          appendMessage("bot", "Desculpe, não encontrei uma resposta direta na base oficial para essa dúvida. Deseja abrir um chamado fictício para atendimento humano com a equipe da Central?", null);
        }
      }, 300);
    }

    // Renderizar lista de artigos normativos
    const articlesContainer = document.getElementById("knowledge-articles-container");
    if (articlesContainer) {
      articlesContainer.innerHTML = "";
      (data.knowledgeArticles || []).forEach(art => {
        const card = document.createElement("div");
        card.style.cssText = "background: var(--surface); padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);";
        card.innerHTML = `
          <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--primary);">${escapeHTML(art.docRef)}: ${escapeHTML(art.title)}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${escapeHTML(art.content)}</p>
        `;
        articlesContainer.appendChild(card);
      });
    }

    chatBtn.addEventListener("click", handleUserQuestion);
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleUserQuestion();
    });
  }

  // --- FORNECEDORES RENDERING ---
  function renderFornecedoresList(data) {
    const tbody = document.getElementById("fornecedores-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    (data.suppliers || []).forEach(sup => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHTML(sup.id)}</strong></td>
        <td>${escapeHTML(sup.name)}</td>
        <td>${escapeHTML(sup.category)}</td>
        <td>${escapeHTML(sup.contract)}</td>
        <td>${escapeHTML(sup.slaTarget)}</td>
        <td><span class="status-badge status-APROVADO">${escapeHTML(sup.status)}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- ATENDIMENTOS RENDERING ---
  function renderAtendimentosList(data) {
    const tbody = document.getElementById("atendimentos-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    (data.tickets || []).forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHTML(t.id)}</strong></td>
        <td>${escapeHTML(t.title)}</td>
        <td>${escapeHTML(t.requester)}</td>
        <td>${escapeHTML(t.category)}</td>
        <td>${escapeHTML(t.priority)}</td>
        <td><span class="status-badge status-${t.status === 'RESOLVIDO' ? 'CONCLUIDO' : 'EM_ATENDIMENTO'}">${escapeHTML(t.status === 'RESOLVIDO' ? 'Resolvido' : 'Em Aberto')}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- ADMINISTRAÇÃO & TRILHA DE AUDITORIA ---
  function renderAdministracao(data) {
    const tbody = document.getElementById("audit-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    data.auditLogs.forEach(log => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHTML(log.id)}</strong></td>
        <td>${escapeHTML(log.timestamp)}</td>
        <td>${escapeHTML(log.user)}</td>
        <td><code>${escapeHTML(log.action)}</code></td>
        <td>${escapeHTML(log.details)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- FINANCEIRO & CONSOLIDAÇÃO ---
  function renderFinanceiro(data) {
    const tbody = document.getElementById("fin-cost-centers-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    data.costCenters.forEach(cc => {
      const ccRequests = data.requests.filter(r => r.costCenter === cc.code);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHTML(cc.code)}</strong></td>
        <td>${escapeHTML(cc.name)}</td>
        <td>${escapeHTML(cc.manager)}</td>
        <td>${ccRequests.length} solicitações</td>
        <td><span class="status-badge status-APROVADO">Consolidado (Mock)</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- RELATÓRIOS & BI ---
  function renderRelatorios(data) {
    const totalEst = data.requests.reduce((acc, r) => acc + (r.details && r.details.estimatedCost ? r.details.estimatedCost : 0), 0) +
                     data.mobilityRides.reduce((acc, r) => acc + (r.cost || 0), 0);
    const nonFlownSavings = 450.00;

    setText("report-total-cost", `R$ ${totalEst.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
    setText("report-non-flown-savings", `R$ ${nonFlownSavings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} reutilizados`);

    const chartContainer = document.getElementById("report-cost-by-area-chart");
    if (chartContainer) {
      chartContainer.innerHTML = "";
      const ccCosts = {};
      data.costCenters.forEach(cc => { ccCosts[cc.name] = 0; });
      data.requests.forEach(r => {
        const ccObj = data.costCenters.find(c => c.code === r.costCenter);
        const name = ccObj ? ccObj.name : r.costCenter;
        const val = (r.details && r.details.estimatedCost) ? r.details.estimatedCost : 500;
        ccCosts[name] = (ccCosts[name] || 0) + val;
      });

      const maxCost = Math.max(...Object.values(ccCosts), 1);
      Object.keys(ccCosts).forEach(area => {
        const cost = ccCosts[area];
        const pct = Math.round((cost / maxCost) * 100);
        const row = document.createElement("div");
        row.className = "chart-bar-row";
        row.innerHTML = `
          <div class="chart-bar-label">${escapeHTML(area)}</div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width: ${pct}%;"></div>
          </div>
          <div class="chart-bar-value">R$ ${cost.toLocaleString("pt-BR")}</div>
        `;
        chartContainer.appendChild(row);
      });
    }
  }

  // --- HELPER UTILITIES ---
  function escapeHTML(str) {
    if (typeof str !== "string") return str;
    return str.replace(/[&<>"']/g, function (m) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[m];
    });
  }

  function formatStatus(status) {
    const map = {
      PENDENTE_APROVACAO: "Pendente Aprovação",
      APROVADO: "Aprovado",
      EM_ATENDIMENTO: "Em Atendimento",
      CONCLUIDO: "Concluído",
      REJEITADO: "Rejeitado",
      RASCUNHO: "Rascunho",
      CANCELADO: "Cancelado"
    };
    return map[status] || status;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

})();
