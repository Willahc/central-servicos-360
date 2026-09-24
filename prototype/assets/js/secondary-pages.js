(function () {
  "use strict";

  const demoData = {
    suppliers: [
      { id: "sup-001", initials: "CO", name: "Copastur Viagens", source: "Agência Corporativa HSL", type: "real", category: "Viagens corporativas", reference: "CTR-VIA-2024", indicator: "SLA Cotação 98.4%", indicatorNote: "Atendimento médio em 1h15", status: "active", statusLabel: "Ativo", contact: "corporativo@copastur.com.br" },
      { id: "sup-002", initials: "UB", name: "Uber for Business", source: "Mobilidade Corporativa", type: "real", category: "Mobilidade", reference: "CTR-MOB-2023", indicator: "Disponibilidade 99.9%", indicatorNote: "Frota ativa SP/RJ/DF", status: "active", statusLabel: "Ativo", contact: "empresas@uber.com" },
      { id: "sup-003", initials: "TX", name: "99 Táxi Digital", source: "Táxi Credenciado", type: "real", category: "Mobilidade", reference: "CTR-TAX-2024", indicator: "SLA Resposta 95.2%", indicatorNote: "Tempo médio 4.2 min", status: "active", statusLabel: "Ativo", contact: "empresas@99app.com" },
      { id: "sup-004", initials: "CR", name: "Correios Brasil", source: "Serviços Postais & SEDEX", type: "real", category: "Serviços postais", reference: "CTR-COR-2022", indicator: "SLA Entrega 94.7%", indicatorNote: "Coleta diária às 15h30", status: "attention", statusLabel: "Acompanhar", contact: "corporativo@correios.com.br" },
      { id: "sup-005", initials: "GP", name: "Gráfica Paulista", source: "Serviços Gráficos & Xerox", type: "real", category: "Impressão e documentos", reference: "CTR-XER-2025", indicator: "SLA Produção 97.1%", indicatorNote: "Prazo médio 18h", status: "active", statusLabel: "Ativo", contact: "pedidos@graficapaulista.com.br" },
      { id: "sup-006", initials: "AL", name: "Allianz Assistance", source: "Seguro Viagem Corporativo", type: "real", category: "Viagens corporativas", reference: "CTR-SEG-2024", indicator: "SLA Apólice 99.5%", indicatorNote: "Emissão imediata RN-VIA-003", status: "active", statusLabel: "Ativo", contact: "corporate@allianz.com" }
    ]
  };

  window.CS360_SECONDARY_DEMO = window.CS360_SECONDARY_DEMO || {};
  window.CS360_SECONDARY_DEMO.fornecedores = demoData;

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char];
    });
  }

  function renderSuppliers() {
    const tbody = document.getElementById("secondary-suppliers-tbody");
    if (!tbody) return;
    const category = document.getElementById("supplier-category-filter")?.value || "all";
    const status = document.getElementById("supplier-status-filter")?.value || "all";
    const visible = demoData.suppliers.filter(function (supplier) {
      return (category === "all" || supplier.category === category) && (status === "all" || supplier.status === status);
    });

    tbody.innerHTML = visible.map(function (supplier) {
      return `<tr data-supplier-row="${escapeHTML(supplier.id)}">
        <td><div class="supplier-name"><span class="supplier-avatar" aria-hidden="true">${escapeHTML(supplier.initials)}</span><div><strong>${escapeHTML(supplier.name)}</strong><small>${escapeHTML(supplier.source)}</small></div></div></td>
        <td>${escapeHTML(supplier.category)}</td>
        <td><span class="reference-code">${escapeHTML(supplier.reference)}</span><span class="reference-note">Contrato demonstrativo</span></td>
        <td><div class="indicator-cell"><strong>${escapeHTML(supplier.indicator)}</strong><span>${escapeHTML(supplier.indicatorNote)}</span></div></td>
        <td><span class="status-chip ${supplier.status === "attention" ? "attention" : ""}">${escapeHTML(supplier.statusLabel)}</span></td>
        <td><button class="row-action" type="button" data-supplier-id="${escapeHTML(supplier.id)}" aria-label="Ver detalhes de ${escapeHTML(supplier.name)}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg></button></td>
      </tr>`;
    }).join("");

    document.getElementById("supplier-empty").hidden = visible.length !== 0;
    document.getElementById("supplier-result-count").textContent = `${visible.length} ${visible.length === 1 ? "parceiro" : "parceiros"} no cenário demonstrativo`;
  }

  function openDetail(id) {
    const supplier = demoData.suppliers.find(function (item) { return item.id === id; });
    const detail = document.getElementById("supplier-detail");
    if (!supplier || !detail) return;
    detail.innerHTML = `<div class="detail-head"><div><h2>${escapeHTML(supplier.name)}</h2><p>${escapeHTML(supplier.source)} · dados exclusivamente demonstrativos</p></div><button type="button" class="detail-close" aria-label="Fechar detalhes">×</button></div><div class="detail-grid"><div><span>Categoria</span><strong>${escapeHTML(supplier.category)}</strong></div><div><span>Referência contratual demo</span><strong>${escapeHTML(supplier.reference)}</strong></div><div><span>Indicador</span><strong>${escapeHTML(supplier.indicator)}</strong></div><div><span>Status do cenário</span><strong>${escapeHTML(supplier.statusLabel)}</strong></div></div>`;
    detail.hidden = false;
    detail.querySelector(".detail-close").focus();
  }

  function initSuppliersPage() {
    if (document.body.dataset.page !== "fornecedores") return;
    renderSuppliers();
    const filterBar = document.getElementById("supplier-filter-bar");
    const filterToggle = document.getElementById("supplier-filter-toggle");
    filterToggle?.addEventListener("click", function () {
      const willOpen = filterBar.hidden;
      filterBar.hidden = !willOpen;
      filterToggle.setAttribute("aria-expanded", String(willOpen));
    });
    document.getElementById("supplier-category-filter")?.addEventListener("change", renderSuppliers);
    document.getElementById("supplier-status-filter")?.addEventListener("change", renderSuppliers);
    document.getElementById("supplier-filter-clear")?.addEventListener("click", function () {
      document.getElementById("supplier-category-filter").value = "all";
      document.getElementById("supplier-status-filter").value = "all";
      renderSuppliers();
    });
    document.addEventListener("click", function (event) {
      const trigger = event.target.closest("[data-supplier-id]");
      if (trigger) openDetail(trigger.dataset.supplierId);
      if (event.target.closest(".detail-close")) document.getElementById("supplier-detail").hidden = true;
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") document.getElementById("supplier-detail").hidden = true;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSuppliersPage);
  else initSuppliersPage();
})();

(function () {
  "use strict";

  const friendlyActions = {
    ALTERACAO_SIDEBAR: "Menu lateral alterado", ALTERACAO_TEMA: "Tema alterado",
    SOLICITACAO_CRIADA: "Solicitação criada", TROCA_PERFIL_SIMULADO: "Perfil demonstrativo alterado",
    SISTEMA_INICIALIZADO: "Demonstração iniciada", SOLICITACAO_ATUALIZADA: "Solicitação atualizada",
    CHAMADO_RESOLVIDO: "Atendimento concluído", DADOS_RESTAURADOS: "Dados demonstrativos restaurados"
  };
  const sampleEvents = [
    { id:"AUD-DEMO-008", timestamp:"2026-08-07 10:30:00", role:"administrador", action:"ALTERACAO_TEMA", details:"Tema escuro selecionado para esta sessão." },
    { id:"AUD-DEMO-007", timestamp:"2026-08-07 10:24:00", role:"colaborador", action:"ALTERACAO_SIDEBAR", details:"Menu lateral compactado no navegador local." },
    { id:"AUD-DEMO-006", timestamp:"2026-08-07 10:12:00", role:"colaborador", action:"SOLICITACAO_CRIADA", details:"Solicitação demonstrativa adicionada à jornada." },
    { id:"AUD-DEMO-005", timestamp:"2026-08-07 09:48:00", role:"auditoria", action:"TROCA_PERFIL_SIMULADO", details:"Perfil demonstrativo alterado durante a exploração." },
    { id:"AUD-DEMO-004", timestamp:"2026-08-07 09:30:00", role:"administrador", action:"SOLICITACAO_ATUALIZADA", details:"Registro de exemplo atualizado no dataset local." },
    { id:"AUD-DEMO-003", timestamp:"2026-08-07 09:05:00", role:"colaborador", action:"ALTERACAO_TEMA", details:"Preferência de tema atualizada nesta sessão." },
    { id:"AUD-DEMO-002", timestamp:"2026-08-07 08:40:00", role:"administrador", action:"CHAMADO_RESOLVIDO", details:"Atendimento de demonstração marcado como concluído." },
    { id:"AUD-DEMO-001", timestamp:"2026-08-07 08:00:00", role:"administrador", action:"SISTEMA_INICIALIZADO", details:"Ambiente local do protótipo inicializado." }
  ];

  window.CS360_SECONDARY_DEMO = window.CS360_SECONDARY_DEMO || {};
  window.CS360_SECONDARY_DEMO.administracao = { eventos:sampleEvents };
  const fullRoles = ["administrador", "auditoria"];
  const roleLabels = { colaborador:"Colaborador (Solicitante)", administrador:"Administrador", auditoria:"Auditoria", gestor:"Gestor Aprovador", viagens:"Operador de Viagens (Simulado)", faturamento:"Faturamento e Apoio Operacional (Simulado)", coordenadora:"Coordenadora (Simulado)", gerencia:"Gerência (Simulado)", financeiro:"Financeiro" };

  function readStoredData() {
    try { return JSON.parse(localStorage.getItem("cs360_data")) || window.CS360_INITIAL_MOCK || {}; }
    catch { return window.CS360_INITIAL_MOCK || {}; }
  }
  function getEvents() {
    const stored = readStoredData().auditLogs || [];
    const ids = new Set(stored.map(function(item){ return item.id; }));
    return stored.concat(sampleEvents.filter(function(item){ return !ids.has(item.id); }));
  }
  function escapeAdmin(value) { return String(value ?? "").replace(/[&<>'"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c];}); }
  function currentPrefs() {
    return { theme:localStorage.getItem("cs360_theme") || document.documentElement.dataset.theme || "claro", sidebar:localStorage.getItem("cs360_sidebar_collapsed") === "true" ? "Compacto" : "Expandido", role:localStorage.getItem("cs360_active_role") || "colaborador" };
  }
  function prefPanel(prefs) {
    return `<section class="panel" id="configuracoes" data-admin-section="configuracoes" tabindex="-1"><div class="panel-header"><div><h2 class="panel-title">Preferências</h2><p class="panel-caption">Ajustes salvos neste navegador</p></div><span class="soft-badge">Local</span></div><div class="panel-body settings-list">
      <div class="setting-row"><span class="setting-icon" aria-hidden="true">◐</span><div class="setting-copy"><strong>Tema</strong><span>Aparência atual da demonstração</span></div><div class="setting-value"><span id="admin-theme-value">${prefs.theme === "dark" ? "Escuro" : "Claro"}</span><button type="button" class="btn btn-secondary btn-sm" id="admin-theme-toggle">Alternar</button></div></div>
      <div class="setting-row"><span class="setting-icon" aria-hidden="true">☰</span><div class="setting-copy"><strong>Menu lateral</strong><span>Largura do menu de navegação</span></div><div class="setting-value"><span id="admin-sidebar-value">${prefs.sidebar}</span><button type="button" class="btn btn-secondary btn-sm" id="admin-sidebar-toggle">Alternar</button></div></div>
      <div class="setting-row"><span class="setting-icon" aria-hidden="true">○</span><div class="setting-copy"><strong>Perfil ativo</strong><span>Contexto atual do protótipo</span></div><div class="setting-value">${escapeAdmin(roleLabels[prefs.role] || prefs.role)}</div></div>
    </div></section>`;
  }
  function environmentPanel(role) {
    return `<section class="panel"><div class="panel-header"><div><h2 class="panel-title">Ambiente da Demonstração</h2><p class="panel-caption">Informações conceituais do molde local</p></div><span class="demo-badge">DEMO</span></div><div class="panel-body environment-list">
      <div class="environment-row"><span>API local</span><strong class="env-online" id="admin-api-state">Verificando...</strong></div><div class="environment-row"><span>Modo de dados</span><strong>Demonstrativo</strong></div>
      <div class="environment-row"><span>Autenticação</span><strong>Simulada</strong></div><div class="environment-row"><span>Persistência</span><strong>Navegador local</strong></div>
      <div class="environment-row"><span>Versão</span><strong>Molde / MVP local</strong></div><div class="environment-row"><span>Última atualização</span><strong>Hoje, 10:30 (demo)</strong></div>
    </div><div class="session-strip"><span aria-hidden="true">ⓘ</span><span>Sessão local · perfil <strong>${escapeAdmin(roleLabels[role] || role)}</strong> · nenhuma infraestrutura real é exibida.</span></div></section>`;
  }
  function activityRows(events) {
    if (!events.length) return `<div class="audit-empty">Nenhuma atividade registrada nesta sessão.</div>`;
    return events.map(function(event,index){ const name=friendlyActions[event.action] || "Atividade registrada"; const symbol=event.action.includes("TEMA") ? "◐" : event.action.includes("SOLICITACAO") ? "+" : event.action.includes("SISTEMA") ? "✓" : "↔"; return `<article class="activity-row"><span class="activity-symbol ${event.action.includes("SISTEMA") ? "success" : event.action.includes("PERFIL") ? "warning" : ""}" aria-hidden="true">${symbol}</span><div class="activity-main"><strong>${escapeAdmin(name)}</strong><span>${escapeAdmin(event.action)}</span></div><p class="activity-detail">${escapeAdmin(event.details)}</p><div class="activity-time"><strong>${escapeAdmin(event.timestamp.slice(11,16))}</strong>${escapeAdmin(event.timestamp.slice(0,10).split("-").reverse().join("/"))}</div></article>`; }).join("");
  }
  function auditTable(events) {
    if (!events.length) return `<div class="audit-empty">Nenhuma atividade registrada nesta sessão.</div>`;
    return `<div class="table-container audit-table-wrap"><table class="data-table audit-table"><thead><tr><th>Data e hora</th><th>Atividade</th><th>Perfil</th><th>Detalhes</th><th>Código técnico</th></tr></thead><tbody>${events.map(function(event){return `<tr><td>${escapeAdmin(event.timestamp)}</td><td><strong>${escapeAdmin(friendlyActions[event.action] || "Atividade registrada")}</strong></td><td>${escapeAdmin(roleLabels[event.role] || event.role)}</td><td>${escapeAdmin(event.details)}</td><td><code>${escapeAdmin(event.action)}</code></td></tr>`;}).join("")}</tbody></table></div>`;
  }
  function collaboratorTemplate(prefs, events) {
    const ownEvents=events.filter(function(item){return item.role === prefs.role;}).slice(0,5);
    return `<header class="admin-header"><div><h1 class="page-title">Configurações &amp; Auditoria</h1><p class="page-subtitle">Preferências da demonstração, informações do ambiente e histórico de atividades.</p></div><div class="admin-header-meta"><span class="demo-badge">Ambiente demonstrativo</span></div></header><div class="admin-summary-grid">${prefPanel(prefs)}${environmentPanel(prefs.role)}</div><section class="panel activity-panel"><div class="panel-header"><div><h2 class="panel-title">Minhas Atividades Recentes</h2><p class="panel-caption">Últimos eventos relacionados à sua sessão local</p></div><span class="demo-badge">Demonstrativo</span></div><div class="recent-activity-list">${activityRows(ownEvents)}</div></section>`;
  }
  function fullTemplate(prefs, events) {
    const data=readStoredData(); return `<header class="admin-header"><div><h1 class="page-title">Administração Central 360</h1><p class="page-subtitle">Governança de usuários, roles, serviceScopes, políticas, SLAs, auditoria e configurações.</p></div><div class="admin-header-meta"><span class="demo-badge">Visão administrativa demonstrativa · ALL</span></div></header><div class="admin-summary-grid">${prefPanel(prefs)}${environmentPanel(prefs.role)}</div>
      <section class="panel activity-panel" id="auditoria" data-admin-section="auditoria" tabindex="-1"><div class="panel-header"><div><h2 class="panel-title">Atividades Recentes</h2><p class="panel-caption">Histórico local do protótipo</p></div><div class="activity-head-actions"><span class="demo-badge">Demonstrativo</span><button class="btn btn-secondary btn-sm" type="button" id="audit-history-toggle" aria-expanded="false">Ver histórico completo</button></div></div><div class="audit-filters"><label>Tipo de evento<select id="audit-type-filter"><option value="all">Todos os eventos</option><option value="ALTERACAO">Preferências</option><option value="SOLICITACAO">Solicitações</option><option value="SISTEMA">Ambiente</option></select></label><label>Período<select id="audit-period-filter"><option value="all">Todo o período</option><option value="today">Hoje</option></select></label><label>Perfil<select id="audit-role-filter"><option value="all">Todos os perfis</option>${Object.keys(roleLabels).map(function(role){return `<option value="${role}">${escapeAdmin(roleLabels[role])}</option>`;}).join("")}</select></label></div><div id="admin-audit-content" class="recent-activity-list">${activityRows(events.slice(0,6))}</div></section>
      <div class="admin-bottom-grid"><section class="panel" id="usuarios" data-admin-section="usuarios" tabindex="-1"><div class="panel-header"><div><h2 class="panel-title">Usuários &amp; Acessos</h2><p class="panel-caption">Resumo dos perfis demonstrativos e seus escopos</p></div><span class="soft-badge">Navegador</span></div><div class="panel-body data-summary"><div class="data-stat"><strong>${(data.users||[]).length}</strong><span>Usuários demo</span></div><div class="data-stat"><strong>${new Set((data.users||[]).map(function(user){return user.role;})).size}</strong><span>Perfis</span></div><div class="data-stat"><strong>ALL</strong><span>Escopo administrador</span></div></div></section>
      <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Ações Administrativas</h2><p class="panel-caption">Controles exclusivos da demonstração</p></div></div><div class="panel-body admin-action-body"><div class="admin-action-copy"><strong>Restaurar dados demonstrativos</strong><p>Restaura apenas os dados locais do protótipo e não afeta qualquer sistema externo.</p><small>Ação limitada à chave <code>cs360_data</code>.</small></div><button class="btn btn-danger btn-sm" type="button" id="admin-reset-demo">Restaurar dados demonstrativos</button></div></section></div><div class="admin-toast" id="admin-toast" role="status" hidden>Dados demonstrativos restaurados.</div>`;
  }
  const adminSectionHashes = new Set(["#usuarios", "#auditoria", "#configuracoes"]);
  function syncAdminSection() {
    document.querySelectorAll("[data-admin-section]").forEach(function(section){ section.removeAttribute("aria-current"); });
    if (!adminSectionHashes.has(window.location.hash)) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    target.setAttribute("aria-current", "location");
    target.scrollIntoView({ block:"start", behavior:"auto" });
    target.focus({ preventScroll:true });
  }
  function bindPreferences() {
    document.getElementById("admin-theme-toggle")?.addEventListener("click",function(){window.toggleTheme();document.getElementById("admin-theme-value").textContent=document.documentElement.dataset.theme === "dark" ? "Escuro" : "Claro";});
    document.getElementById("admin-sidebar-toggle")?.addEventListener("click",function(){window.toggleSidebarCollapse();window.setTimeout(function(){document.getElementById("admin-sidebar-value").textContent=localStorage.getItem("cs360_sidebar_collapsed") === "true" ? "Compacto" : "Expandido";},220);});
  }
  function bindAudit(events) {
    let complete=false; const render=function(){const type=document.getElementById("audit-type-filter").value,period=document.getElementById("audit-period-filter").value,role=document.getElementById("audit-role-filter").value,today=new Date().toISOString().slice(0,10);const filtered=events.filter(function(event){return(type==="all"||event.action.includes(type))&&(period==="all"||event.timestamp.startsWith(today))&&(role==="all"||event.role===role)});document.getElementById("admin-audit-content").innerHTML=complete?auditTable(filtered):activityRows(filtered.slice(0,6));};
    ["audit-type-filter","audit-period-filter","audit-role-filter"].forEach(function(id){document.getElementById(id)?.addEventListener("change",render)});
    document.getElementById("audit-history-toggle")?.addEventListener("click",function(){complete=!complete;this.setAttribute("aria-expanded",String(complete));this.textContent=complete?"Ver atividades recentes":"Ver histórico completo";render()});
    document.getElementById("admin-reset-demo")?.addEventListener("click",function(){if(!window.confirm("Tem certeza? Isso restaurará todos os dados fictícios locais do protótipo."))return;localStorage.removeItem("cs360_data");localStorage.setItem("cs360_data",JSON.stringify(window.CS360_INITIAL_MOCK));const toast=document.getElementById("admin-toast");if(toast)toast.hidden=false;window.setTimeout(function(){window.location.reload();},1000)});
  }
  async function initAdminPage() {
    if(document.body.dataset.page!=="administracao-secondary")return; const view=document.getElementById("admin-secondary-view"),prefs=currentPrefs(),events=getEvents(),isFull=fullRoles.includes(prefs.role);view.innerHTML=isFull?fullTemplate(prefs,events):collaboratorTemplate(prefs,events);bindPreferences();if(isFull)bindAudit(events);
    window.addEventListener("hashchange", syncAdminSection);
    window.requestAnimationFrame(syncAdminSection);
    try{const available=window.CS360API?await CS360API.checkApiAvailability():false;const state=document.getElementById("admin-api-state");if(state){state.textContent=available?"Disponível":"Indisponível";state.classList.toggle("offline",!available)}}catch{const state=document.getElementById("admin-api-state");if(state){state.textContent="Indisponível";state.classList.add("offline")}}
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){window.setTimeout(initAdminPage,0)});else initAdminPage();
})();

(function () {
  "use strict";

  const reportsData = {
    periodo: "01 a 31 ago. 2026",
    kpis: { solicitacoes: 128, viagens: 12, atendimentos: 24, pendencias: 18, gasto: 93000, economiaPotencial: 18400 },
    evolucao: {
      labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
      series: { viagens: [8, 10, 11, 13], mobilidade: [7, 8, 10, 11], correios: [6, 7, 7, 8], xerox: [4, 5, 6, 7] }
    },
    porFrente: [
      { label: "Viagens", value: 42 }, { label: "Mobilidade", value: 36 },
      { label: "Correios", value: 28 }, { label: "Xerox", value: 22 }
    ],
    porStatus: [
      { label: "Aguardando aprovação", value: 18 }, { label: "Em atendimento", value: 27 },
      { label: "Concluído", value: 79 }, { label: "Cancelado", value: 4 }
    ],
    gastos: [
      { label: "Viagens", value: 68400 }, { label: "Mobilidade", value: 12800 },
      { label: "Correios", value: 4200 }, { label: "Xerox", value: 7600 }
    ],
    periods: {
      "Agosto 2026": {
        periodo: "01 a 31 ago. 2026",
        kpis: { solicitacoes: 128, viagens: 12, atendimentos: 24, pendencias: 18, gasto: 93000, economiaPotencial: 18400 },
        evolucao: { labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"], series: { viagens: [8, 10, 11, 13], mobilidade: [7, 8, 10, 11], correios: [6, 7, 7, 8], xerox: [4, 5, 6, 7] } },
        porFrente: [{ label: "Viagens", value: 42 }, { label: "Mobilidade", value: 36 }, { label: "Correios", value: 28 }, { label: "Xerox", value: 22 }],
        porStatus: [{ label: "Aguardando aprovação", value: 18 }, { label: "Em atendimento", value: 27 }, { label: "Concluído", value: 79 }, { label: "Cancelado", value: 4 }],
        gastos: [{ label: "Viagens", value: 68400 }, { label: "Mobilidade", value: 12800 }, { label: "Correios", value: 4200 }, { label: "Xerox", value: 7600 }]
      },
      "Julho 2026": {
        periodo: "01 a 31 jul. 2026",
        kpis: { solicitacoes: 109, viagens: 10, atendimentos: 21, pendencias: 14, gasto: 84700, economiaPotencial: 15200 },
        evolucao: { labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"], series: { viagens: [7, 8, 9, 10], mobilidade: [6, 7, 8, 9], correios: [5, 6, 6, 7], xerox: [3, 4, 5, 5] } },
        porFrente: [{ label: "Viagens", value: 34 }, { label: "Mobilidade", value: 31 }, { label: "Correios", value: 25 }, { label: "Xerox", value: 19 }],
        porStatus: [{ label: "Aguardando aprovação", value: 14 }, { label: "Em atendimento", value: 24 }, { label: "Concluído", value: 68 }, { label: "Cancelado", value: 3 }],
        gastos: [{ label: "Viagens", value: 61200 }, { label: "Mobilidade", value: 11900 }, { label: "Correios", value: 4900 }, { label: "Xerox", value: 6700 }]
      }
    }
  };

  window.CS360_SECONDARY_DEMO = window.CS360_SECONDARY_DEMO || {};
  window.CS360_SECONDARY_DEMO.relatorios = reportsData;

  const authorizedRoles = ["gestor", "viagens", "faturamento", "coordenadora", "gerencia", "financeiro", "administrador", "auditoria"];
  const roleLabels = { gestor:"Gestor Aprovador", viagens:"Operador de Viagens (Simulado)", faturamento:"Faturamento e Apoio Operacional (Simulado)", coordenadora:"Coordenadora (Simulado)", gerencia:"Gerência (Simulado)", financeiro:"Financeiro", administrador:"Administrador", auditoria:"Auditoria" };

  function money(value) { return `R$ ${value.toLocaleString("pt-BR")}`; }

  function restrictedTemplate() {
    return `<div class="restricted-wrap"><section class="restricted-state" aria-labelledby="restricted-title">
      <div class="restricted-icon" aria-hidden="true"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg></div>
      <div class="eyebrow"><span class="demo-dot" aria-hidden="true"></span> Acesso conforme perfil</div>
      <h1 id="restricted-title">Relatórios disponíveis para perfis autorizados</h1>
      <p>Seu perfil atual não possui acesso à visão consolidada de indicadores. Este é um estado funcional da demonstração, não uma falha da aplicação.</p>
      <div class="restricted-actions"><a class="btn btn-primary" href="dashboard.html">Voltar ao Dashboard</a><a class="btn btn-secondary" href="solicitacoes.html">Minhas Solicitações</a></div>
      <div class="restricted-hint"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></svg> O acesso segue o perfil selecionado no protótipo.</div>
    </section></div>`;
  }

  function lineChart() {
    const colors = ["travel", "mobility", "postal", "print"];
    const keys = ["viagens", "mobilidade", "correios", "xerox"];
    const paths = keys.map(function (key, index) {
      const points = reportsData.evolucao.series[key].map(function (value, pointIndex) { return `${42 + pointIndex * 130},${118 - value * 6}`; }).join(" ");
      const circles = reportsData.evolucao.series[key].map(function (value, pointIndex) { return `<circle class="chart-point ${colors[index]}" cx="${42 + pointIndex * 130}" cy="${118 - value * 6}" r="3"/>`; }).join("");
      return `<polyline class="chart-series ${index ? colors[index] : ""}" points="${points}"/>${circles}`;
    }).join("");
    return `<div class="line-chart-wrap"><svg class="line-chart" viewBox="0 0 450 140" role="img" aria-label="Evolução semanal demonstrativa das solicitações por frente">
      <line class="chart-grid-line" x1="42" y1="22" x2="432" y2="22"/><line class="chart-grid-line" x1="42" y1="58" x2="432" y2="58"/><line class="chart-grid-line" x1="42" y1="94" x2="432" y2="94"/><line class="chart-grid-line" x1="42" y1="118" x2="432" y2="118"/>
      <text class="chart-axis-label" x="18" y="25">16</text><text class="chart-axis-label" x="22" y="61">10</text><text class="chart-axis-label" x="27" y="97">4</text>
      ${paths}<text class="chart-axis-label" x="30" y="136">Sem 1</text><text class="chart-axis-label" x="160" y="136">Sem 2</text><text class="chart-axis-label" x="290" y="136">Sem 3</text><text class="chart-axis-label" x="410" y="136">Sem 4</text>
    </svg><div class="chart-legend"><span><i></i>Viagens</span><span><i class="lg-mob"></i>Mobilidade</span><span><i class="lg-post"></i>Correios</span><span><i class="lg-print"></i>Xerox</span></div></div>`;
  }

  function dashboardTemplate(role, apiStats) {
    const maxVolume = Math.max.apply(null, reportsData.porFrente.map(function (item) { return item.value; }));
    const maxExpense = Math.max.apply(null, reportsData.gastos.map(function (item) { return item.value; }));
    const apiSource = apiStats ? `${apiStats.length} centros demonstrativos autorizados pela API` : "Dataset local demonstrativo";
    return `<header class="reports-header"><div><div class="reports-heading-row"><h1 class="page-title">Relatórios &amp; Indicadores</h1><span class="demo-badge">Dados demonstrativos</span></div><p class="page-subtitle">Visão demonstrativa das atividades, volumes e tendências da Central 360.</p></div>
      <form class="reports-filters" aria-label="Filtros dos relatórios"><label>Período<select id="report-period"><option>Agosto 2026</option><option>Julho 2026</option></select></label><label>Frente<select id="report-front"><option value="all">Todas as frentes</option><option>Viagens</option><option>Mobilidade</option><option>Correios</option><option>Xerox</option></select></label><label>Status<select id="report-status"><option value="all">Todos os status</option><option>Aguardando aprovação</option><option>Em atendimento</option><option>Concluído</option><option>Cancelado</option></select></label></form></header>
      <section class="report-kpis" aria-label="Indicadores do período">
        <article class="kpi-card"><div class="kpi-icon accent" aria-hidden="true">▤</div><div class="kpi-content"><span class="kpi-label">Solicitações no período</span><strong class="kpi-value">${reportsData.kpis.solicitacoes}</strong><span class="kpi-note">4 frentes demonstrativas</span></div></article>
        <article class="kpi-card"><div class="kpi-icon info" aria-hidden="true">✈</div><div class="kpi-content"><span class="kpi-label">Viagens em andamento</span><strong class="kpi-value">${reportsData.kpis.viagens}</strong><span class="kpi-note">Cenário atual</span></div></article>
        <article class="kpi-card"><div class="kpi-icon success" aria-hidden="true">◉</div><div class="kpi-content"><span class="kpi-label">Atendimentos abertos</span><strong class="kpi-value">${reportsData.kpis.atendimentos}</strong><span class="kpi-note">Dados demonstrativos</span></div></article>
        <article class="kpi-card"><div class="kpi-icon warning" aria-hidden="true">!</div><div class="kpi-content"><span class="kpi-label">Pendências</span><strong class="kpi-value">${reportsData.kpis.pendencias}</strong><span class="kpi-note warning-text">Aguardando aprovação</span></div></article>
        <article class="kpi-card"><div class="kpi-icon accent" aria-hidden="true">$</div><div class="kpi-content"><span class="kpi-label">Gasto demonstrativo</span><strong class="kpi-value">${money(reportsData.kpis.gasto)} <small class="sim-label">sim.</small></strong><span class="kpi-note">Não representa valor real</span></div></article>
        <article class="kpi-card"><div class="kpi-icon success" aria-hidden="true">↗</div><div class="kpi-content"><span class="kpi-label">Economia potencial</span><strong class="kpi-value">${money(reportsData.kpis.economiaPotencial)} <small class="sim-label">sim.</small></strong><span class="kpi-note">Benefício não comprovado</span></div></article>
      </section>
      <div class="reports-analytics-grid">
        <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Evolução das Solicitações</h2><p class="panel-caption">Comparativo semanal por frente</p></div><span class="period-tag">${reportsData.periodo}</span></div><div class="panel-body">${lineChart()}</div></section>
        <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Volume por Frente</h2><p class="panel-caption">Participação no total demonstrativo</p></div><span class="soft-badge">${reportsData.kpis.solicitacoes} total</span></div><div class="panel-body volume-list">${reportsData.porFrente.map(function(item){return `<div class="volume-row"><span>${item.label}</span><div class="report-bar"><span style="width:${item.value/maxVolume*100}%"></span></div><strong>${item.value}</strong></div>`;}).join("")}<div class="volume-total"><span>Soma das frentes</span><strong>${reportsData.kpis.solicitacoes} solicitações</strong></div></div></section>
      </div>
      <div class="reports-secondary-grid">
        <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Status das Solicitações</h2><p class="panel-caption">Distribuição do período demonstrativo</p></div><span class="soft-badge">100%</span></div><div class="panel-body status-layout"><div class="donut" role="img" aria-label="18 aguardando aprovação, 27 em atendimento, 79 concluídas e 4 canceladas"><div class="donut-center"><strong>128</strong><span>solicitações</span></div></div><div class="status-list">${reportsData.porStatus.map(function(item){return `<div class="status-row"><i></i><span>${item.label}</span><strong>${item.value}</strong></div>`;}).join("")}</div></div></section>
        <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Gastos por Serviço — Demonstrativo</h2><p class="panel-caption">Valores exclusivamente simulados</p></div><span class="demo-badge">SIM.</span></div><div class="panel-body expense-list">${reportsData.gastos.map(function(item){return `<div class="expense-row"><span>${item.label}</span><div class="report-bar"><span style="width:${item.value/maxExpense*100}%"></span></div><strong>${money(item.value)} sim.</strong></div>`;}).join("")}<div class="expense-total"><span>Total demonstrativo</span><strong>${money(reportsData.kpis.gasto)} sim.</strong></div></div></section>
      </div>
      <div class="reports-secondary-grid">
        <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Indicadores Operacionais</h2><p class="panel-caption">Sinais de acompanhamento do cenário demo</p></div></div><div class="panel-body operational-grid"><div class="operational-item"><span>7</span><div><strong>Bilhetes disponíveis</strong><small>Não voados — demo</small></div></div><div class="operational-item"><span>18</span><div><strong>Aguardando aprovação</strong><small>Solicitações</small></div></div><div class="operational-item"><span>3</span><div><strong>Corridas sinalizadas</strong><small>Mobilidade</small></div></div><div class="operational-item"><span>14</span><div><strong>Rastreamentos ativos</strong><small>Correios</small></div></div><div class="operational-item"><span>9</span><div><strong>Impressões pendentes</strong><small>Documentos</small></div></div><div class="operational-item"><span>24</span><div><strong>Chamados em aberto</strong><small>Atendimentos</small></div></div></div></section>
        <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Tendências &amp; Destaques</h2><p class="panel-caption">Leituras demonstrativas do período</p></div></div><div class="panel-body trend-list"><div class="trend-item"><span class="trend-icon">↗</span><div><strong>Mobilidade com maior crescimento semanal</strong><p>Volume simulado passou de 7 para 11 registros entre a primeira e a quarta semana.</p></div></div><div class="trend-item"><span class="trend-icon">✓</span><div><strong>61,7% das solicitações concluídas</strong><p>79 de 128 itens encerrados no recorte demonstrativo.</p></div></div><div class="trend-item"><span class="trend-icon warning">!</span><div><strong>18 itens aguardando aprovação</strong><p>Ponto de atenção visual, sem representar meta institucional.</p></div></div></div></section>
      </div>
      <div class="reports-bottom-grid">
        <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Relatórios Disponíveis</h2><p class="panel-caption">Atalhos da demonstração</p></div><span class="period-tag">Atualização: Hoje</span></div><div class="panel-body report-shortcuts">${["Resumo Executivo","Viagens","Mobilidade","Correios","Impressões","Atendimentos"].map(function(label,index){return `<article class="report-shortcut" onclick="window.location.href='solicitacoes.html'" style="cursor:pointer;" title="Ver detalhes"><span class="shortcut-icon">${String(index+1).padStart(2,"0")}</span><div><strong>${label}</strong><small>Visão consolidada por frente</small></div><span class="shortcut-state">Ativo</span></article>`;}).join("")}</div></section>
        <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Exportação de Relatórios</h2><p class="panel-caption">Download consolidado</p></div></div><div class="panel-body export-panel-body"><p class="export-note">Exporte os dados consolidados do período selecionado para análise em planilha.</p><div class="export-buttons"><button class="btn btn-primary btn-sm" type="button" id="btn-export-reports-csv">📥 Baixar CSV</button><button class="btn btn-secondary btn-sm" type="button" id="btn-export-reports-xlsx">📊 Baixar Planilha</button></div><span class="export-foot">Perfil ativo: ${roleLabels[role] || role} · ${apiSource}</span></div></section>
      </div>`;
  }

  function emptyTemplate() { return `<div class="reports-empty">Nenhum registro encontrado para os filtros selecionados.</div>`; }

  function bindReportFilters(container, role, apiStats, selection) {
    const current = selection || { period: "Agosto 2026", front: "all", status: "all" };
    const periodSelect = container.querySelector("#report-period");
    const frontSelect = container.querySelector("#report-front");
    const statusSelect = container.querySelector("#report-status");
    if (periodSelect) periodSelect.value = current.period;
    if (frontSelect) frontSelect.value = current.front;
    if (statusSelect) statusSelect.value = current.status;

    function applyContextFilters() {
      container.querySelectorAll(".volume-row, .expense-row").forEach(function (row) {
        row.hidden = current.front !== "all" && row.querySelector("span")?.textContent.trim() !== current.front;
      });
      container.querySelectorAll(".status-row").forEach(function (row) {
        row.hidden = current.status !== "all" && row.querySelector("span")?.textContent.trim() !== current.status;
      });
      const fronts = ["Viagens", "Mobilidade", "Correios", "Xerox"];
      container.querySelectorAll(".chart-series").forEach(function (series, index) {
        series.style.opacity = current.front === "all" || fronts[index] === current.front ? "1" : "0.12";
      });
      container.querySelectorAll(".chart-legend span").forEach(function (item) {
        item.style.opacity = current.front === "all" || item.textContent.trim() === current.front ? "1" : "0.35";
      });
    }
    // Vincular botões de exportação
    const btnCsv = container.querySelector("#btn-export-reports-csv");
    const btnXlsx = container.querySelector("#btn-export-reports-xlsx");
    function downloadReportCsv() {
      const csvData = "\uFEFF" + [
        "Frente;Volume Solicitacoes;Gasto Simulado (R$);Economia Potencial (R$)",
        "Viagens;48;58000;12400",
        "Mobilidade;38;24000;3200",
        "Correios;24;6800;1500",
        "Xerox;18;3500;1300"
      ].join("\n");
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Central360_Relatorio_Consolidado_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    if (btnCsv) btnCsv.onclick = downloadReportCsv;
    if (btnXlsx) btnXlsx.onclick = downloadReportCsv;

    container.querySelectorAll("select").forEach(function(select){ select.addEventListener("change", function(){
      current.period = periodSelect.value;
      current.front = frontSelect.value;
      current.status = statusSelect.value;
      if (select === periodSelect) {
        const periodData = reportsData.periods[current.period];
        ["periodo", "kpis", "evolucao", "porFrente", "porStatus", "gastos"].forEach(function (key) { reportsData[key] = periodData[key]; });
        container.innerHTML = dashboardTemplate(role, apiStats);
        bindReportFilters(container, role, apiStats, current);
      } else {
        applyContextFilters();
      }
    }); });
    applyContextFilters();
  }

  function activateReportsNav() {
    const reportsNav = document.querySelector('.sidebar-nav a[href="relatorios.html"]');
    if (reportsNav) { reportsNav.classList.add("active"); return true; }
    return false;
  }

  async function initReportsPage() {
    if (document.body.dataset.page !== "relatorios-secondary") return;
    const container = document.getElementById("reports-view");
    if (!activateReportsNav()) {
      const shellObserver = new MutationObserver(function(){ if (activateReportsNav()) shellObserver.disconnect(); });
      shellObserver.observe(document.getElementById("app-layout-root"), { childList:true, subtree:true });
    }
    const localRole = localStorage.getItem("cs360_active_role") || "colaborador";
    if (!authorizedRoles.includes(localRole)) container.innerHTML = restrictedTemplate();
    else { container.innerHTML = dashboardTemplate(localRole, null); bindReportFilters(container, localRole, null); }

    if (!window.CS360API) return;
    try {
      const available = await CS360API.checkApiAvailability();
      if (!available) return;
      const session = await CS360API.getSession();
      if (!session || !session.success) return;
      const sessionRole = session.data.user.role;
      if (!authorizedRoles.includes(sessionRole)) { container.innerHTML = restrictedTemplate(); return; }
      const result = await CS360API.getCostCenters();
      container.innerHTML = dashboardTemplate(sessionRole, result.data || []);
      bindReportFilters(container, sessionRole, result.data || []);
    } catch (error) {
      const classified = error._classified || CS360API.classifyError(error, null);
      if (classified && classified.status === 403) { container.innerHTML = restrictedTemplate(); return; }
      if (classified && classified.status === 401) return;
      if (CS360API.isFallbackAllowed(classified)) return;
      container.innerHTML = `<section class="panel reports-empty">Não foi possível carregar os relatórios neste momento.</section>`;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ window.setTimeout(initReportsPage, 0); });
  else initReportsPage();
})();

(function () {
  "use strict";

  /* ==========================================================================
     Conhecimento — Base de Conhecimento & Assistente (módulo demonstrativo)
     Fonte local: window.CS360_SECONDARY_DEMO.conhecimento
     ========================================================================== */

  var CATEGORIAS = ["Todos", "Viagens", "Mobilidade", "Correios", "Impressões", "Aprovações"];

  var ARTIGOS = [
    {
      id: "DEMO-VIA-001", categoria: "Viagens", catClass: "",
      titulo: "Como solicitar uma viagem corporativa",
      descricao: "Orientação demonstrativa para criação e aprovação de uma solicitação de viagem.",
      conteudo: "Acesse Nova Solicitação → Viagens Corporativas, informe origem, destino, datas e centro de custo, e envie para aprovação do gestor. Após a aprovação, o módulo de Viagens realiza a cotação.",
      regra: "Regra demonstrativa do protótipo: solicitações com maior antecedência tendem a obter tarifas mais econômicas.",
      leitura: "2 min de leitura",
      atualizado: "Atualizado em 15/07/2026",
      cta: { rotulo: "Nova solicitação", href: "solicitacao-nova.html" }
    },
    {
      id: "DEMO-MOB-001", categoria: "Mobilidade", catClass: "mob",
      titulo: "Como solicitar acesso à mobilidade",
      descricao: "Passos demonstrativos para usar o serviço de mobilidade corporativa.",
      conteudo: "No módulo Mobilidade, solicite a inclusão do seu perfil no serviço corporativo de corridas. O acesso passa por validação antes de ficar disponível para deslocamentos a trabalho.",
      regra: "Regra demonstrativa do protótipo: o uso é restrito a deslocamentos a trabalho ou plantões autorizados.",
      leitura: "2 min de leitura",
      atualizado: "Atualizado em 20/07/2026",
      cta: { rotulo: "Ver mobilidade", href: "mobilidade.html" }
    },
    {
      id: "DEMO-COR-001", categoria: "Correios", catClass: "cor",
      titulo: "Como acompanhar uma postagem",
      descricao: "Orientação demonstrativa para consultar envios e rastreamentos.",
      conteudo: "Informe o código de rastreio no módulo Correios para acompanhar o envio. Postagens com urgência precisam de justificativa formal antes do encaminhamento.",
      regra: "Regra demonstrativa do protótipo: envios expressos como SEDEX 10 exigem justificativa formal de urgência.",
      leitura: "3 min de leitura",
      atualizado: "Atualizado em 10/06/2026",
      cta: { rotulo: "Ver correios", href: "correios.html" }
    },
    {
      id: "DEMO-XER-001", categoria: "Impressões", catClass: "xer",
      titulo: "Como pedir uma impressão",
      descricao: "Como solicitar impressões e serviços gráficos no protótipo.",
      conteudo: "No módulo Xerox, informe formato (A4/A3), tipo de papel, tiragem e acabamento desejado. Prazos padrão demonstrativos: 24h úteis para tiragens normais.",
      regra: "Regra demonstrativa do protótipo: pedidos com acabamento especial podem levar até 48h úteis.",
      leitura: "2 min de leitura",
      atualizado: "Atualizado em 18/05/2026",
      cta: { rotulo: "Ver xerox", href: "xerox.html" }
    },
    {
      id: "DEMO-APR-001", categoria: "Aprovações", catClass: "apr",
      titulo: "Como funciona uma aprovação",
      descricao: "Entenda o fluxo demonstrativo de aprovação de solicitações.",
      conteudo: "Após o envio, a solicitação entra na fila de aprovação do gestor. Aprovada, segue para atendimento da frente correspondente. Rejeições pedem um motivo.",
      regra: null,
      leitura: "1 min de leitura",
      atualizado: "Atualizado em 22/07/2026",
      cta: { rotulo: "Ver aprovações", href: "aprovacoes.html" }
    },
    {
      id: "DEMO-ACO-001", categoria: "Aprovações", catClass: "apr",
      titulo: "Como consultar o status de uma solicitação",
      descricao: "Onde acompanhar o andamento de cada solicitação.",
      conteudo: "Na página Minhas Solicitações, cada item exibe o status atual: rascunho, aguardando aprovação, em atendimento, concluído ou cancelado.",
      regra: null,
      leitura: "1 min de leitura",
      atualizado: "Atualizado em 22/07/2026",
      cta: { rotulo: "Minhas solicitações", href: "solicitacoes.html" }
    }
  ];

  var PERGUNTAS_RAPIDAS = [
    { rotulo: "✈ Como solicitar uma viagem?", pergunta: "Como solicitar uma viagem?" },
    { rotulo: "🚗 Como solicitar acesso à mobilidade?", pergunta: "Como solicitar acesso à mobilidade?" },
    { rotulo: "📦 Como acompanhar uma postagem?", pergunta: "Como acompanhar uma postagem?" },
    { rotulo: "🖨 Como pedir uma impressão?", pergunta: "Como pedir uma impressão?" },
    { rotulo: "✅ Como funciona uma aprovação?", pergunta: "Como funciona uma aprovação?" },
    { rotulo: "🎫 Como consultar o status de uma solicitação?", pergunta: "Como consultar o status de uma solicitação?" }
  ];

  var POPULARES = [
    { rotulo: "Como solicitar uma viagem", pergunta: "Como solicitar uma viagem?" },
    { rotulo: "Como acompanhar uma solicitação", pergunta: "Como consultar o status de uma solicitação?" },
    { rotulo: "Como pedir acesso à mobilidade", pergunta: "Como solicitar acesso à mobilidade?" },
    { rotulo: "Como consultar uma postagem", pergunta: "Como acompanhar uma postagem?" }
  ];

  var REGRAS_KEYWORDS = [
    { keys: ["viagem", "viajar", "voo", "passagem", "hotel", "cotação"], art: "DEMO-VIA-001" },
    { keys: ["mobilidade", "uber", "táxi", "taxi", "corrida", "carro"], art: "DEMO-MOB-001" },
    { keys: ["correio", "postagem", "encomenda", "sedex", "carta", "rastre"], art: "DEMO-COR-001" },
    { keys: ["xerox", "impressão", "imprimir", "gráfica", "cópia", "impressao"], art: "DEMO-XER-001" },
    { keys: ["aprovação", "aprovar", "gestor", "aprovado", "aprovacao"], art: "DEMO-APR-001" },
    { keys: ["status", "acompanhar", "andamento", "consultar", "consulta"], art: "DEMO-ACO-001" }
  ];

  var FALLBACK_MSG = "Não encontrei uma orientação institucional cadastrada para este caso. Consulte a política oficial ou a Central de Serviços.";

  window.CS360_SECONDARY_DEMO = window.CS360_SECONDARY_DEMO || {};
  window.CS360_SECONDARY_DEMO.conhecimento = {
    categorias: CATEGORIAS,
    artigos: ARTIGOS,
    perguntasRapidas: PERGUNTAS_RAPIDAS
  };

  var estado = { conversaAtiva: false, categoriaAtiva: "Todos", buscaAtiva: "" };

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char];
    });
  }

  function byId(id) { return document.getElementById(id); }

  function activateConhecimentoNav() {
    var nav = document.querySelector('.sidebar-nav a[href="conhecimento.html"]');
    if (nav) { nav.classList.add("active"); return true; }
    return false;
  }

  /* ---------------- ARTIGOS / FILTROS ---------------- */

  function artigoVisivel(art) {
    var catOk = estado.categoriaAtiva === "Todos" || art.categoria === estado.categoriaAtiva;
    if (!catOk) return false;
    if (!estado.buscaAtiva) return true;
    var q = estado.buscaAtiva.toLowerCase();
    return [art.titulo, art.descricao, art.conteudo, art.id, art.categoria].join(" ").toLowerCase().indexOf(q) !== -1;
  }

  function renderCategoriaChips() {
    var container = byId("kb-cat-chips");
    if (!container) return;
    container.innerHTML = CATEGORIAS.map(function (cat) {
      var pressed = estado.categoriaAtiva === cat;
      return `<button type="button" class="kb-cat" data-cat="${escapeHTML(cat)}" aria-pressed="${pressed}">${escapeHTML(cat)}</button>`;
    }).join("");
    container.querySelectorAll(".kb-cat").forEach(function (btn) {
      btn.addEventListener("click", function () {
        estado.categoriaAtiva = btn.dataset.cat;
        renderCategoriaChips();
        renderArtigos();
      });
    });
  }

  function renderArtigos() {
    var list = byId("kb-articles-list");
    var count = byId("kb-result-count");
    var empty = byId("kb-empty");
    if (!list) return;
    var visiveis = ARTIGOS.filter(artigoVisivel);
    list.innerHTML = visiveis.map(function (art) {
      var regraTag = art.regra ? `<span class="kb-rule-tag">${escapeHTML(art.regra)}</span>` : "";
      return `
        <article class="kb-article" data-cat="${escapeHTML(art.categoria)}">
          <span class="kb-article-cat ${art.catClass}">${escapeHTML(art.categoria)}</span>
          <h3>${escapeHTML(art.titulo)}</h3>
          <p class="kb-article-desc">${escapeHTML(art.descricao)}</p>
          <div class="kb-article-meta">
            <span>${escapeHTML(art.leitura)} · ${escapeHTML(art.atualizado)}</span>
            <span class="kb-article-ref">Ref. ${escapeHTML(art.id)}</span>
          </div>
          <details class="kb-more">
            <summary>Ver orientação</summary>
            <div class="kb-article-full">
              <p>${escapeHTML(art.conteudo)}</p>
              ${regraTag}
              <div class="kb-cta-row">
                <a class="btn btn-primary btn-sm" href="${escapeHTML(art.cta.href)}">${escapeHTML(art.cta.rotulo)}</a>
              </div>
            </div>
          </details>
        </article>`;
    }).join("");
    count.textContent = `${visiveis.length} de ${ARTIGOS.length} orientação(ões) demonstrativa(s)`;
    empty.hidden = visiveis.length !== 0;
  }

  function renderPopulares() {
    var list = byId("kb-popular-list");
    if (!list) return;
    list.innerHTML = POPULARES.map(function (item) {
      return `<li><button type="button" data-pergunta="${escapeHTML(item.pergunta)}">${escapeHTML(item.rotulo)}</button></li>`;
    }).join("");
    list.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        enviarPergunta(btn.dataset.pergunta);
        var chat = byId("kb-chat-input");
        if (chat) chat.focus();
      });
    });
  }

  /* ---------------- CHAT ---------------- */

  function appendBubble(sender, html, fonte) {
    var container = byId("kb-chat-messages");
    if (!container) return;
    var bubble = document.createElement("div");
    bubble.className = "chat-bubble " + sender;
    var label = document.createElement("span");
    label.className = "kb-bubble-label " + (sender === "bot" ? "bot-label" : "user-label");
    label.textContent = sender === "bot" ? "Assistente" : "Você";
    bubble.appendChild(label);
    var textDiv = document.createElement("div");
    textDiv.innerHTML = html;
    bubble.appendChild(textDiv);
    if (fonte) {
      var source = document.createElement("span");
      source.className = "chat-source-tag";
      source.textContent = "📌 " + fonte;
      bubble.appendChild(source);
    }
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  function respostaPara(pergunta) {
    var lower = pergunta.toLowerCase();
    for (var i = 0; i < REGRAS_KEYWORDS.length; i++) {
      var rule = REGRAS_KEYWORDS[i];
      for (var j = 0; j < rule.keys.length; j++) {
        if (lower.indexOf(rule.keys[j]) !== -1) {
          var art = ARTIGOS.find(function (a) { return a.id === rule.art; });
          if (art) return art;
        }
      }
    }
    return null;
  }

  function removeSugestoes() {
    var sugs = byId("kb-suggestions");
    if (sugs) sugs.remove();
  }

  function enviarPergunta(pergunta) {
    var input = byId("kb-chat-input");
    var container = byId("kb-chat-messages");
    if (!input || !container) return;
    var texto = (pergunta || input.value).trim();
    if (!texto) return;
    input.value = "";
    removeSugestoes();
    estado.conversaAtiva = true;
    appendBubble("user", escapeHTML(texto), null);
    var art = respostaPara(texto);
    window.setTimeout(function () {
      if (art && art.sourceType === "INSTITUCIONAL" && art.status === "VIGENTE") {
        var ctaHtml = `<div class="kb-cta-row"><a class="btn btn-primary btn-sm" href="${escapeHTML(art.cta.href)}">${escapeHTML(art.cta.rotulo)}</a></div>`;
        var regraHtml = art.regra ? `<p class="kb-rule-tag">${escapeHTML(art.regra)}</p>` : "";
        appendBubble("bot", escapeHTML(art.conteudo) + regraHtml + ctaHtml, `Fonte demonstrativa: ${art.id} · ${art.atualizado}`);
      } else {
        appendBubble("bot", escapeHTML(FALLBACK_MSG), null);
      }
    }, 350);
  }

  function renderWelcome() {
    var container = byId("kb-chat-messages");
    if (!container) return;
    container.innerHTML = "";
    appendBubble("bot", "Olá! Posso orientar você sobre viagens, mobilidade, Correios, impressões e outras solicitações da Central 360.", "Assistente demonstrativo");
    var sugs = document.createElement("div");
    sugs.className = "kb-suggestions";
    sugs.id = "kb-suggestions";
    sugs.innerHTML = PERGUNTAS_RAPIDAS.map(function (p) {
      return `<button type="button" class="kb-suggestion" data-pergunta="${escapeHTML(p.pergunta)}">${escapeHTML(p.rotulo)}</button>`;
    }).join("") + `<p class="kb-suggestion-caption">Escolha uma pergunta ou digite sua dúvida.</p>`;
    sugs.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () { enviarPergunta(btn.dataset.pergunta); });
    });
    container.appendChild(sugs);
    container.scrollTop = container.scrollHeight;
  }

  function bindChat() {
    var input = byId("kb-chat-input");
    var send = byId("kb-chat-send");
    if (!input || !send) return;
    send.addEventListener("click", function () { enviarPergunta(null); });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") { event.preventDefault(); enviarPergunta(null); }
    });
  }

  function bindSearch() {
    var search = byId("kb-search");
    var clear = byId("kb-clear-filters");
    if (!search) return;
    search.addEventListener("input", function () {
      estado.buscaAtiva = search.value.trim();
      renderArtigos();
    });
    if (clear) {
      clear.addEventListener("click", function () {
        search.value = "";
        estado.buscaAtiva = "";
        estado.categoriaAtiva = "Todos";
        renderCategoriaChips();
        renderArtigos();
        search.focus();
      });
    }
  }

  function initConhecimentoPage() {
    if (document.body.dataset.page !== "conhecimento-secondary") return;
    if (!activateConhecimentoNav()) {
      var observer = new MutationObserver(function () {
        if (activateConhecimentoNav()) observer.disconnect();
      });
      observer.observe(document.getElementById("app-layout-root"), { childList: true, subtree: true });
    }
    renderCategoriaChips();
    renderArtigos();
    renderPopulares();
    renderWelcome();
    bindChat();
    bindSearch();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initConhecimentoPage);
  else initConhecimentoPage();
})();
/* Aprovações: sincroniza a apresentação com a fonte global de perfil do shell. */
(function approvalsPageEnhancement(){
  "use strict";
  if(document.body.dataset.page!=="aprovacoes")return;
  const labels={colaborador:"Colaborador",gestor:"Gestor Aprovador",viagens:"Operador de Viagens",faturamento:"Faturamento",coordenadora:"Coordenadora",gerencia:"Gerência",financeiro:"Financeiro",administrador:"Administrador",auditoria:"Auditoria"};
  const decisionRoles=new Set(["gestor","coordenadora","administrador"]);
  let queued=false;
  function activeRole(){const selector=document.querySelector(".role-selector-select");return selector&&selector.value?selector.value:""}
  function normalizeWaitKpi(){const el=document.getElementById("kpi-aprov-espera");if(!el)return;const match=el.textContent.trim().match(/^Há\s+(\d+)\s+dia(s)?$/i);if(match)el.textContent=`${match[1]} dia${match[2]?"s":""}`}
  function syncApprovalRole(){
    queued=false;const role=activeRole();if(!role)return;const canDecide=decisionRoles.has(role);const page=document.querySelector(".approvals-page");const badge=document.getElementById("rbac-role-badge");const hint=document.getElementById("aprov-rbac-hint");const selector=document.querySelector(".role-selector-select");
    if(page){page.dataset.activeRole=role;page.dataset.canDecide=String(canDecide);page.classList.toggle("role-readonly",!canDecide)}
    if(selector)selector.dataset.approvalsRole=role;
    if(badge){const badgeText=canDecide?`Deliberação — ${labels[role]||role}`:`Visualização — ${labels[role]||role}`;if(badge.textContent!==badgeText)badge.textContent=badgeText;badge.className=`approvals-role-badge${canDecide?" can-decide":""}`;badge.dataset.role=role}
    if(hint){const hintText=canDecide?"Seu perfil possui alçada de decisão neste cenário demonstrativo. As decisões ficam registradas no histórico.":"Seu perfil possui acesso de consulta. A decisão é realizada por perfis com alçada de aprovação neste cenário demonstrativo.";if(hint.textContent!==hintText)hint.textContent=hintText}
    if(!canDecide)document.querySelectorAll("#aprovacoes-tbody button[disabled]").forEach(button=>button.remove());
    document.querySelectorAll("#aprovacoes-tbody .btn-view-details").forEach(button=>{if(button.textContent!=="Ver detalhes")button.textContent="Ver detalhes"});
    const visibleRows=document.querySelectorAll("#aprovacoes-tbody tr").length;const counter=document.getElementById("aprov-queue-counter");const footer=document.getElementById("aprovacoes-table-footer");
    if(counter){const value=`${visibleRows} pendência${visibleRows===1?"":"s"} ativa${visibleRows===1?"":"s"}`;if(counter.textContent!==value)counter.textContent=value}
    if(footer){const value=visibleRows===0?"Nenhuma solicitação na seleção":`Exibindo ${visibleRows} solicitaç${visibleRows===1?"ão":"ões"}`;if(footer.textContent!==value)footer.textContent=value}
    document.querySelectorAll("#alerts-container .status-badge").forEach(label=>{if(label.textContent.trim()!=="Prioridade alta")label.textContent="Prioridade alta"});
    normalizeWaitKpi();
  }
  function scheduleSync(){if(queued)return;queued=true;requestAnimationFrame(syncApprovalRole)}
  document.addEventListener("DOMContentLoaded",scheduleSync);
  const observer=new MutationObserver(scheduleSync);observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  window.addEventListener("load",scheduleSync);
})();
