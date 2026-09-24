/**
 * CENTRAL DE SERVIÇOS 360 - CORE APPLICATION ENGINE
 * JavaScript puro | API backend + fallback localStorage | Dark Mode + Sidebar
 */

(function () {
  "use strict";

  const STORAGE_KEY = "cs360_data";
  const ROLE_KEY = "cs360_active_role";
  // --- 1.1 PERSPECTIVAS E EXPERIÊNCIAS DE USUÁRIO (3 EXPERIÊNCIAS) ---
  const PERSPECTIVE_KEY = "cs360_active_perspective";
  const DEMO_IDENTITIES = Object.freeze({
    agente_viagens_mobilidade: { role: "AGENTE_SERVICO", serviceScopes: ["viagens", "mobilidade"], label: "Agente Viagens + Mobilidade" },
    agente_transportes: { role: "AGENTE_SERVICO", serviceScopes: ["transportes"], label: "Agente Transportes" },
    agente_servicos_gerais: { role: "AGENTE_SERVICO", serviceScopes: ["correios", "entregas", "xerox", "estacionamento", "achados_perdidos"], label: "Agente Serviços Gerais" },
    administrador: { role: "ADMINISTRADOR", serviceScopes: ["ALL"], label: "Administrador" }
  });
  const PERSPECTIVES_BY_ROLE = Object.freeze({ COLABORADOR: ["collaborator"], AGENTE_SERVICO: ["service-agent"], GESTOR_APROVADOR: ["approver"], ADMINISTRADOR: ["administration"] });

  function getAuthorizationContext() {
    if (_authState.authenticated && _authState.sessionUser) {
      return { role: _authState.sessionUser.role, serviceScopes: _authState.sessionUser.serviceScopes || [] };
    }
    const demoId = localStorage.getItem(ROLE_KEY) || "agente_viagens_mobilidade";
    return DEMO_IDENTITIES[demoId] || DEMO_IDENTITIES.agente_viagens_mobilidade;
  }

  function getAuthorizedPerspectives() {
    return PERSPECTIVES_BY_ROLE[getAuthorizationContext().role] || ["collaborator"];
  }

  function getActivePerspective() {
    const saved = localStorage.getItem(PERSPECTIVE_KEY);
    const allowed = getAuthorizedPerspectives();
    return allowed.includes(saved) ? saved : (allowed[0] || "collaborator");
  }

  function setActivePerspective(p) {
    if (!getAuthorizedPerspectives().includes(p)) return false;
    localStorage.setItem(PERSPECTIVE_KEY, p);
    logAuditEvent("TROCA_PERSPECTIVA_EXPERIENCIA", `Perspectiva alternada para: ${p}`);
    // Redireciona para a home correta de cada perspectiva se necessário
    if (p === "approver" && window.location.pathname.endsWith("dashboard.html")) {
      window.location.href = "aprovacoes.html";
      return;
    }
    if (p === "service-agent" && window.location.pathname.endsWith("dashboard.html")) {
      window.location.href = "atendimentos.html";
      return;
    }
    window.location.reload();
    return true;
  }

  function getActiveServiceScopes(role) {
    return getAuthorizationContext().serviceScopes.slice();
  }

  const THEME_KEY = "cs360_theme";
  const SIDEBAR_KEY = "cs360_sidebar_collapsed";

  let _authState = {
    apiAvailable: false,
    authenticated: false,
    sessionUser: null,
    sessionRole: null,
    demoMode: true
  };

  // --- 0. MOTOR DE DARK MODE & PREFERÊNCIAS ---
  function getThemePreference() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function applyTheme(themeName, save = false) {
    if (save) {
      localStorage.setItem(THEME_KEY, themeName);
    }
    const effective = themeName === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = effective;
    document.documentElement.setAttribute("data-theme", effective);
    if (document.body) {
      document.body.dataset.theme = effective;
      document.body.setAttribute("data-theme", effective);
    }

    updateTopbarThemeToggle(effective);

    try {
      window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: effective } }));
    } catch (e) {}

    return effective;
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme || document.documentElement.getAttribute("data-theme") || getThemePreference();
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next, true);
    logAuditEvent("ALTERACAO_TEMA", `Tema alternado para: ${next.toUpperCase()}`);
    return next;
  }

  function updateTopbarThemeToggle(effective) {
    const toggleBtn = document.getElementById("topbar-theme-toggle");
    if (!toggleBtn) return;

    const isDark = effective === "dark";
    toggleBtn.innerHTML = isDark
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="12" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

    const label = isDark ? "Ativar modo claro" : "Ativar modo escuro";
    toggleBtn.setAttribute("title", label);
    toggleBtn.setAttribute("aria-label", label);
  }

  // --- 0.1 MOTOR DA SIDEBAR RECOLHÍVEL & HAMBÚRGUER ---
  function isSidebarCollapsed() {
    return localStorage.getItem(SIDEBAR_KEY) === "true";
  }

  function updateSidebarToggle(collapsed) {
    const expanded = !collapsed;
    const actionLabel = collapsed ? "Expandir menu lateral" : "Recolher menu lateral";
    const toggleBtn = document.getElementById("btn-sidebar-toggle");

    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", String(expanded));
      toggleBtn.setAttribute("aria-label", actionLabel);
      toggleBtn.setAttribute("title", actionLabel);
    }
  }

  function setSidebarCollapsed(collapsed, save = false) {
    const nextCollapsed = Boolean(collapsed);
    document.documentElement.dataset.sidebarCollapsed = String(nextCollapsed);
    if (save) {
      localStorage.setItem(SIDEBAR_KEY, nextCollapsed ? "true" : "false");
    }
    const layout = document.getElementById("app-layout-root") || document.querySelector(".app-layout");
    const sidebar = document.getElementById("app-sidebar") || document.querySelector(".app-sidebar");
    const desktopCollapsed = window.innerWidth >= 1024 && nextCollapsed;
    if (layout) layout.classList.toggle("sidebar-collapsed", desktopCollapsed);
    if (sidebar) sidebar.classList.toggle("collapsed", desktopCollapsed);
    if (window.innerWidth < 1024) {
      setMobileDrawerOpen(Boolean(sidebar && sidebar.classList.contains("drawer-open")));
    } else {
      updateSidebarToggle(nextCollapsed);
    }
    return nextCollapsed;
  }

  function setMobileDrawerOpen(open) {
    const sidebar = document.getElementById("app-sidebar") || document.querySelector(".app-sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    const toggleBtn = document.getElementById("btn-sidebar-toggle");
    const isOpen = Boolean(open);
    if (sidebar) sidebar.classList.toggle("drawer-open", isOpen);
    if (overlay) overlay.classList.toggle("active", isOpen);
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
      toggleBtn.setAttribute("aria-label", isOpen ? "Fechar menu lateral" : "Abrir menu lateral");
      toggleBtn.setAttribute("title", isOpen ? "Fechar menu lateral" : "Abrir menu lateral");
    }
  }

  function toggleSidebar() {
    if (window.innerWidth < 1024) {
      const sidebar = document.getElementById("app-sidebar") || document.querySelector(".app-sidebar");
      setMobileDrawerOpen(!(sidebar && sidebar.classList.contains("drawer-open")));
    } else {
      // Desktop Collapse Mode
      const layout = document.getElementById("app-layout-root") || document.querySelector(".app-layout");
      const sidebar = document.getElementById("app-sidebar") || document.querySelector(".app-sidebar");
      const isCollapsedNow = layout
        ? layout.classList.contains("sidebar-collapsed")
        : (sidebar ? sidebar.classList.contains("collapsed") : false);
      const nextCollapsed = !isCollapsedNow;

      setSidebarCollapsed(nextCollapsed, true);
      logAuditEvent("ALTERACAO_SIDEBAR", `Sidebar ${nextCollapsed ? "recolhida (68px)" : "expandida (240px)"}`);
    }
  }

  function bindShellInteractions() {
    const themeBtn = document.getElementById("topbar-theme-toggle");
    if (themeBtn && !themeBtn._bound) {
      themeBtn._bound = true;
      themeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      });
    }

    const sidebarBtn = document.getElementById("btn-sidebar-toggle");
    if (sidebarBtn && !sidebarBtn._bound) {
      sidebarBtn._bound = true;
      sidebarBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
      });
    }

    const overlay = document.getElementById("sidebar-overlay");
    if (overlay && !overlay._bound) {
      overlay._bound = true;
      overlay.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setMobileDrawerOpen(false);
      });
    }

    const topbarMenus = [
      {
        button: document.getElementById("topbar-notifications-toggle"),
        panel: document.getElementById("topbar-notifications-panel")
      },
      {
        button: document.getElementById("topbar-help-toggle"),
        panel: document.getElementById("topbar-help-panel")
      }
    ].filter(menu => menu.button && menu.panel);

    const closeTopbarMenus = (exceptButton = null) => {
      topbarMenus.forEach(({ button, panel }) => {
        if (button === exceptButton) return;
        button.setAttribute("aria-expanded", "false");
        panel.hidden = true;
      });
    };

    topbarMenus.forEach(({ button, panel }) => {
      if (button._bound) return;
      button._bound = true;
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const willOpen = button.getAttribute("aria-expanded") !== "true";
        closeTopbarMenus(button);
        button.setAttribute("aria-expanded", String(willOpen));
        panel.hidden = !willOpen;
      });
      panel.addEventListener("click", event => event.stopPropagation());
    });

    if (topbarMenus.length && !document._topbarMenusBound) {
      document._topbarMenusBound = true;
      document.addEventListener("click", () => closeTopbarMenus());
      document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          const openMenu = topbarMenus.find(({ button }) => button.getAttribute("aria-expanded") === "true");
          closeTopbarMenus();
          openMenu?.button.focus();
        }
      });
    }
  }

  window.setSidebarCollapsed = setSidebarCollapsed;
  window.toggleSidebar = toggleSidebar;
  window.toggleSidebarCollapse = toggleSidebar;
  window.toggleTheme = toggleTheme;
  window.bindShellInteractions = bindShellInteractions;

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
    const candidate = localStorage.getItem(ROLE_KEY) || "agente_viagens_mobilidade";
    return DEMO_IDENTITIES[candidate] ? candidate : "agente_viagens_mobilidade";
  }

  const roleEmailMap = {
    agente_viagens_mobilidade: "william.nunes@ficticio.org",
    agente_transportes: "maria.catarina@ficticio.org",
    agente_servicos_gerais: "agente.servicos.gerais@ficticio.org",
    gestor: "fernanda.lima@ficticio.org",
    administrador: "patricia.souza@ficticio.org",
  };

  async function switchRoleViaApi(roleId) {
    const email = roleEmailMap[roleId] || roleEmailMap.agente_viagens_mobilidade;
    try {
      const loginResult = await CS360API.login(email);
      if (loginResult && loginResult.success) {
        _authState.authenticated = true;
        _authState.sessionUser = loginResult.data.user;
        _authState.sessionRole = loginResult.data.user.role;
        localStorage.setItem(ROLE_KEY, roleId);
        logAuditEvent("TROCA_PERFIL_SIMULADO", `Perfil alternado para: ${roleId}`);
        window.location.href = demoHome(roleId);
      } else {
        localStorage.setItem(ROLE_KEY, roleId);
        window.location.href = demoHome(roleId);
      }
    } catch (err) {
      console.warn("[CS360] Fallback local para troca de perfil:", err);
      localStorage.setItem(ROLE_KEY, roleId);
      window.location.reload();
    }
  }

  function setActiveRole(roleId) {
    if (!DEMO_IDENTITIES[roleId]) return false;
    localStorage.setItem(ROLE_KEY, roleId);
    if (_authState.apiAvailable) {
      switchRoleViaApi(roleId);
    } else {
      logAuditEvent("TROCA_PERFIL_SIMULADO", `Perfil alternado para: ${roleId}`);
      window.location.href = demoHome(roleId);
    }
    return true;
  }

  function demoHome(roleId) {
    if (roleId.startsWith("agente_")) return "atendimentos.html";
    if (roleId === "gestor") return "aprovacoes.html";
    if (roleId === "administrador") return "administracao.html";
    return "atendimentos.html";
  }

  function logAuditEvent(action, details) {
    const data = getData();
    const roleId = getActiveRole();
    const roleObj = data.roles.find(r => r.id === roleId) || { name: roleId };

    const newLog = {
      id: "AUD-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: `Usuário Simulado (${roleObj.name})`,
      role: roleId,
      action: action,
      resource: "SESSAO_PROTOTIPO",
      ip: "127.0.0.1 (Local Mock)",
      details: details
    };

    data.auditLogs.unshift(newLog);
    saveData(data);
  }

  window.resetPrototypeData = function () {
    if (confirm("ATENÇÃO (ADMIN): Deseja restaurar os dados fictícios originais da demonstração? Quaisquer alterações locais serão desfeitas.")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.CS360_INITIAL_MOCK));
      alert("Dados da demonstração restaurados com sucesso!");
      window.location.reload();
    }
  };

  // --- 2. BOOTSTRAP DE AUTENTICAÇÃO ---
  async function initApp() {
    // O head já aplica estes estados antes do primeiro paint; esta chamada mantém
    // compatibilidade e sincroniza body/controles assim que o DOM está disponível.
    applyTheme(getThemePreference(), false);

    const activeRole = getActiveRole();

    // O shell estrutural não depende da API e precisa existir antes de qualquer await.
    injectAppLayout();
    setSidebarCollapsed(isSidebarCollapsed(), false);
    requestAnimationFrame(() => document.documentElement.classList.remove("cs360-booting"));

    if (window.CS360API) {
      try {
        _authState.apiAvailable = await CS360API.checkApiAvailability();
        if (_authState.apiAvailable) {
          const token = CS360API.getToken();
          if (token) {
            try {
              const sessionResult = await CS360API.getSession();
              if (sessionResult && sessionResult.success) {
                _authState.authenticated = true;
                _authState.sessionUser = sessionResult.data.user;
                _authState.sessionRole = sessionResult.data.user.role;
                _authState.demoMode = false;
              } else {
                // Tentativa de auto-login com o papel atual
                const email = roleEmailMap[activeRole] || roleEmailMap.agente_viagens_mobilidade;
                const autoLogin = await CS360API.login(email);
                if (autoLogin && autoLogin.success) {
                  _authState.authenticated = true;
                  _authState.sessionUser = autoLogin.data.user;
                  _authState.sessionRole = autoLogin.data.user.role;
                  _authState.demoMode = false;
                }
              }
            } catch {
              _authState.demoMode = true;
            }
          } else {
            // Auto-login automático em ambiente de demonstração
            try {
              const email = roleEmailMap[activeRole] || roleEmailMap.agente_viagens_mobilidade;
              const autoLogin = await CS360API.login(email);
              if (autoLogin && autoLogin.success) {
                _authState.authenticated = true;
                _authState.sessionUser = autoLogin.data.user;
                _authState.sessionRole = autoLogin.data.user.role;
                _authState.demoMode = false;
              }
            } catch {
              _authState.demoMode = true;
            }
          }
        } else {
          _authState.demoMode = true;
        }
      } catch {
        _authState.apiAvailable = false;
        _authState.demoMode = true;
      }
    } else {
      _authState.apiAvailable = false;
      _authState.demoMode = true;
    }

    updateShellConnectionBadge();
    await renderPageSpecificContent();
    initializeGlobalCardInteractions();
  }

  // --- 2.1 INTERAÇÕES GLOBAIS DE CARDS E PAINÉIS DEMONSTRATIVOS ---
  function initializeGlobalCardInteractions() {
    const page = (document.body.getAttribute("data-page") || "dashboard").replace("-secondary", "");
    if (page === "login") return;

    const isNestedControl = (target, surface) => {
      const control = target.closest("a, button, input, select, textarea, [role='button']");
      return control && control !== surface;
    };

    const activateSurface = (surface, handler, label) => {
      if (!surface || surface.dataset.interactiveBound === "true") return;
      surface.dataset.interactiveBound = "true";
      surface.classList.add("interactive-card");
      if (!surface.matches("a, button")) {
        surface.setAttribute("role", "button");
        surface.setAttribute("tabindex", "0");
      }
      if (label) surface.setAttribute("aria-label", label);
      surface.addEventListener("click", event => {
        if (isNestedControl(event.target, surface)) return;
        handler(event);
      });
      surface.addEventListener("keydown", event => {
        if (event.target !== surface || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        handler(event);
      });
    };

    const upgradeExistingSurface = (surface, label) => {
      if (!surface || surface.dataset.interactiveBound === "true") return;
      surface.dataset.interactiveBound = "true";
      surface.classList.add("interactive-card");
      if (!surface.matches("a, button")) {
        surface.setAttribute("role", "button");
        surface.setAttribute("tabindex", "0");
      }
      if (label) surface.setAttribute("aria-label", label);
      surface.addEventListener("keydown", event => {
        if (event.target !== surface || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        surface.click();
      });
    };

    const navigate = href => { window.location.href = href; };
    const setFilter = (id, value) => {
      const control = document.getElementById(id);
      if (!control) return false;
      control.value = value;
      control.dispatchEvent(new Event("change", { bubbles: true }));
      control.scrollIntoView({ behavior: "smooth", block: "center" });
      return true;
    };
    const focusTarget = selector => {
      const target = document.querySelector(selector);
      if (!target) return false;
      target.classList.add("interaction-highlight");
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => target.classList.remove("interaction-highlight"), 1400);
      return true;
    };

    const ensureDetailModal = () => {
      let modal = document.getElementById("global-card-detail-modal");
      if (modal) return modal;
      modal = document.createElement("div");
      modal.id = "global-card-detail-modal";
      modal.className = "modal-overlay global-card-detail-modal";
      modal.setAttribute("aria-hidden", "true");
      modal.innerHTML = `
        <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="global-card-detail-title">
          <div class="modal-header">
            <div><div class="modal-title" id="global-card-detail-title">Detalhes demonstrativos</div><div class="global-card-detail-subtitle">Molde local, sem integração real</div></div>
            <button type="button" class="btn-icon global-card-detail-close" aria-label="Fechar">×</button>
          </div>
          <div class="panel-body global-card-detail-content"></div>
          <div class="modal-footer"><button type="button" class="btn btn-secondary global-card-detail-close">Fechar</button></div>
        </div>`;
      document.body.appendChild(modal);
      const close = () => {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
      };
      modal.querySelectorAll(".global-card-detail-close").forEach(button => button.addEventListener("click", close));
      modal.addEventListener("click", event => { if (event.target === modal) close(); });
      document.addEventListener("keydown", event => { if (event.key === "Escape" && modal.classList.contains("active")) close(); });
      return modal;
    };

    const openDetail = (title, rows) => {
      const modal = ensureDetailModal();
      modal.querySelector("#global-card-detail-title").textContent = title || "Detalhes demonstrativos";
      modal.querySelector(".global-card-detail-content").innerHTML = rows.map(([label, value]) => `
        <div class="global-card-detail-row"><span>${escapeHTML(String(label || "Informação"))}</span><strong>${escapeHTML(String(value || "—"))}</strong></div>
      `).join("");
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      modal.querySelector(".global-card-detail-close").focus();
    };
    const focusOrDetail = (selector, title) => focusTarget(selector) || openDetail(title, [["Contexto", "Indicador demonstrativo da página atual"], ["Dados", "Sem integração ou efeito operacional real"]]);

    const detailFromElement = (element, fallbackTitle) => {
      const cells = [...element.querySelectorAll("td")].map(cell => cell.innerText.trim()).filter(Boolean);
      const title = cells[0] || element.querySelector("strong, .panel-title")?.textContent.trim() || fallbackTitle;
      const values = cells.length > 1
        ? cells.slice(1).map((value, index) => [`Campo ${index + 1}`, value])
        : [["Resumo", element.innerText.trim().replace(/\s+/g, " ").slice(0, 280)]];
      openDetail(title, values);
    };

    const kpis = [...document.querySelectorAll(".kpi-card, .kpi-mini-card")];
    const kpiActions = {
      solicitacoes: [
        () => { setFilter("filter-status", "ALL"); document.getElementById("filter-search")?.focus(); },
        () => setFilter("filter-status", "PENDENTE_APROVACAO"),
        () => setFilter("filter-status", "APROVADO"),
        () => setFilter("filter-status", "EM_ATENDIMENTO"),
        () => setFilter("filter-status", "CONCLUIDO")
      ],
      aprovacoes: [
        () => focusTarget(".approvals-queue-panel"),
        () => setFilter("filter-aprov-prioridade", "ALTA"),
        () => focusTarget(".approvals-alerts"),
        () => focusTarget(".approvals-history-panel"),
        () => focusTarget(".approvals-history-panel"),
        () => openDetail("Tempo médio demonstrativo", [["Métrica", "Tempo médio entre envio e decisão"], ["Escopo", "Cenário local simulado"]])
      ],
      atendimentos: [
        () => setFilter("filter-atend-status", "TODOS"),
        () => setFilter("filter-atend-status", "EM_ABERTO"),
        () => setFilter("filter-atend-status", "EM_ATENDIMENTO"),
        () => setFilter("filter-atend-status", "RESOLVIDO"),
        () => setFilter("filter-atend-prioridade", "Alta"),
        () => openDetail("Tempo médio demonstrativo", [["Tempo", "3 horas simuladas"], ["Fonte", "Chamados do cenário local"]])
      ],
      viagens: [
        () => focusTarget("#viagens-active-cards"),
        () => focusTarget("#viagens-active-cards"),
        () => navigate("aprovacoes.html"),
        () => focusTarget("#non-flown-list"),
        () => focusTarget("#non-flown-list"),
        () => focusOrDetail("#viagens-alerts-container", "Alertas operacionais")
      ],
      mobilidade: [
        () => focusTarget("#rides-tbody"), () => focusTarget("#rides-tbody"),
        () => focusOrDetail("#mobility-cost-summary", "Gasto demonstrativo"), () => focusTarget("#mobility-access-tbody"),
        () => focusOrDetail("#mobility-policy-summary", "Exceções de política"), () => focusOrDetail("#mobility-cc-corrections", "Correções de centro de custo")
      ],
      correios: [
        () => focusTarget("#correios-tbody"), () => focusTarget("#correios-tbody"),
        () => focusTarget("#correios-tbody"), () => focusOrDetail("#correios-alerts", "Pendências de postagem"),
        () => focusTarget("#tracking-active-cards"), () => openDetail("Custo demonstrativo", [["Natureza", "Valores simulados"], ["Uso", "Validação visual do molde"]])
      ],
      xerox: [
        () => focusTarget("#xerox-tbody"), () => focusTarget("#xerox-active-cards"),
        () => focusTarget("#xerox-tbody"), () => focusTarget("#xerox-tbody"),
        () => focusTarget("#xerox-tbody"), () => openDetail("Volume de páginas", [["Natureza", "Volume demonstrativo"], ["Escopo", "Jobs do cenário local"]])
      ],
      fornecedores: [
        () => focusTarget("#secondary-suppliers-tbody"), () => focusTarget(".category-panel"),
        () => setFilter("supplier-status-filter", "active"), () => focusTarget(".indicators-panel"),
        () => setFilter("supplier-status-filter", "attention"), () => focusTarget(".followup-panel")
      ],
      relatorios: [
        () => focusTarget(".reports-analytics-grid"), () => focusTarget(".volume-list"),
        () => focusTarget(".operational-grid"), () => focusTarget(".status-layout"),
        () => focusTarget(".expense-list"), () => focusTarget(".trend-list")
      ],
      financeiro: [
        () => openDetail("Total do período", [["Composição", "Centros de custo autorizados"], ["Natureza", "Valores demonstrativos"]]),
        () => openDetail("Média por solicitação", [["Cálculo", "Total demonstrativo dividido pelas solicitações"], ["Escopo", "Perfil autorizado"]]),
        () => focusTarget("#fin-cc-tbody"), () => focusOrDetail(".finance-alerts, #finance-alerts", "Pendências de conciliação"),
        () => focusTarget("#fin-cc-tbody"), () => openDetail("Economia gerada", [["Origem", "Créditos e acordos simulados"], ["Natureza", "Referência demonstrativa"]])
      ]
    };

    const hasVisibleRestrictedState = [...document.querySelectorAll(".restricted-state")].some(element => !element.hidden && getComputedStyle(element).display !== "none");
    if (page !== "dashboard" && page !== "index" && !hasVisibleRestrictedState) {
      (kpiActions[page] || []).forEach((handler, index) => {
        const card = kpis[index];
        if (card && handler) activateSurface(card, handler, `Ativar indicador ${card.innerText.trim().replace(/\s+/g, " ")}`);
      });
    }

    const rowConfigs = {
      solicitacoes: ["#requests-tbody tr", row => navigate(`solicitacao-detalhe.html?id=${encodeURIComponent(row.cells[0]?.innerText.trim())}`)],
      viagens: ["#viagens-tbody tr", row => navigate(`viagem-detalhe.html?id=${encodeURIComponent(row.cells[0]?.innerText.trim())}`)],
      mobilidade: ["#rides-tbody tr", row => detailFromElement(row, "Detalhe da corrida")],
      correios: ["#correios-tbody tr", row => detailFromElement(row, "Detalhe da postagem")],
      xerox: ["#xerox-tbody tr", row => detailFromElement(row, "Detalhe do job")],
      aprovacoes: ["#aprovacoes-tbody tr", row => detailFromElement(row, "Detalhe da aprovação")],
      atendimentos: ["#atendimentos-tbody tr", row => detailFromElement(row, "Detalhe do chamado")],
      financeiro: ["#fin-cc-tbody tr", row => detailFromElement(row, "Resumo do centro de custo")],
      fornecedores: ["#secondary-suppliers-tbody tr", row => {
        const button = row.querySelector(".row-action, button[data-supplier-id]");
        if (button) button.click(); else detailFromElement(row, "Detalhe do fornecedor");
      }]
    };
    if (!hasVisibleRestrictedState && rowConfigs[page]) {
      const [selector, handler] = rowConfigs[page];
      document.querySelectorAll(selector).forEach(row => activateSurface(row, () => handler(row), `Abrir ${row.cells?.[0]?.innerText.trim() || "detalhes"}`));
    }

    if (page === "viagens") {
      document.querySelectorAll(".trip-card").forEach((card, index) => activateSurface(card, () => {
        const link = card.querySelector("a[href*='viagem-detalhe']");
        if (link) navigate(link.getAttribute("href"));
        else detailFromElement(card, `Viagem ${index + 1}`);
      }, "Abrir detalhe da viagem"));
    }
    if (page === "xerox") {
      document.querySelectorAll(".trip-card").forEach(card => activateSurface(card, () => detailFromElement(card, "Detalhe do job gráfico"), "Abrir detalhe do job"));
    }

    if (page === "dashboard" || page === "index") {
      document.querySelectorAll(".kpi-card[role='button'], .dashboard-supplier-card[onclick]").forEach(card => {
        upgradeExistingSurface(card, card.getAttribute("aria-label") || `Abrir ${card.innerText.trim().replace(/\s+/g, " ")}`);
      });
    }

    document.querySelectorAll(".report-shortcut[onclick]").forEach(card => upgradeExistingSurface(card, `Abrir relatório ${card.innerText.trim().replace(/\s+/g, " ")}`));
    document.querySelectorAll(".kb-article").forEach(article => activateSurface(article, () => {
      const details = article.querySelector("details.kb-more");
      if (details) details.open = !details.open;
    }, `Expandir artigo ${article.querySelector("h3")?.textContent.trim() || "da base de conhecimento"}`));
    document.querySelectorAll(".operational-item, .activity-row").forEach(item => activateSurface(item, () => detailFromElement(item, "Detalhe demonstrativo"), `Abrir detalhe de ${item.innerText.trim().replace(/\s+/g, " ").slice(0, 80)}`));

    document.querySelectorAll(".panel").forEach(panel => {
      const header = panel.querySelector(":scope > .panel-header");
      const body = panel.querySelector(":scope > .panel-body");
      if (!header || !body || header.querySelector("a,button,input,select") || panel.classList.contains("approvals-queue-panel")) return;
      if (panel.querySelector("a[href],button:not([disabled]),input,select,textarea") && !panel.matches(".activity-panel")) return;
      header.classList.add("interactive-panel-header");
      header.setAttribute("aria-expanded", "true");
      activateSurface(header, () => {
        const expanded = header.getAttribute("aria-expanded") === "true";
        header.setAttribute("aria-expanded", String(!expanded));
        body.hidden = expanded;
      }, `${header.innerText.trim()}: expandir ou recolher`);
    });

    if (!document._interactiveCardsObserver) {
      let scheduled = false;
      document._interactiveCardsObserver = new MutationObserver(mutations => {
        if (!mutations.some(mutation => mutation.addedNodes.length)) return;
        if (scheduled) return;
        scheduled = true;
        queueMicrotask(() => {
          scheduled = false;
          initializeGlobalCardInteractions();
        });
      });
      document._interactiveCardsObserver.observe(document.getElementById("page-content-slot") || document.body, { childList: true, subtree: true });
    }
  }

  function getShellConnectionBadgeMarkup() {
    const common = 'id="shell-connection-badge" class="shell-connection-badge"';
    if (_authState.apiAvailable && _authState.authenticated) {
      return `<span ${common} data-state="online" title="Dados sincronizados com a API local"><i></i>API local</span>`;
    }
    if (!_authState.apiAvailable && _authState.demoMode) {
      return `<span ${common} data-state="offline" title="Dados locais simulados — servidor indisponível"><i></i>Mock offline</span>`;
    }
    return `<span ${common} data-state="restricted" title="Autenticação necessária"><i></i>Sem auth</span>`;
  }

  function updateShellConnectionBadge() {
    const current = document.getElementById("shell-connection-badge");
    if (current) current.outerHTML = getShellConnectionBadgeMarkup();
  }

  // --- 3. INJEÇÃO DE COMPONENTES COMPARTILHADOS ---
  document.addEventListener("DOMContentLoaded", () => {
    initApp();

    window.addEventListener("resize", () => {
      if (window.innerWidth < 1024) {
        const layout = document.getElementById("app-layout-root") || document.querySelector(".app-layout");
        const sidebar = document.getElementById("app-sidebar") || document.querySelector(".app-sidebar");
        if (layout) layout.classList.remove("sidebar-collapsed");
        if (sidebar) sidebar.classList.remove("collapsed");
        setMobileDrawerOpen(false);
      } else {
        setMobileDrawerOpen(false);
        setSidebarCollapsed(isSidebarCollapsed(), false);
      }
    });

    // Fechar drawer no mobile ao pressionar ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const sidebar = document.querySelector(".app-sidebar");
        if (sidebar && sidebar.classList.contains("drawer-open")) {
          setMobileDrawerOpen(false);
        }
      }
    });
  });

  function injectAppLayout() {
    let activePage = document.body.getAttribute("data-page") || "dashboard";
    if (activePage.endsWith("-secondary")) {
      activePage = activePage.replace("-secondary", "");
    }
    const activeRole = getActiveRole();
    const data = getData();

    if (activePage === "login") return;

    const isCurrentNavigationTarget = (href) => {
      try {
        const target = new URL(href, window.location.href);
        const currentPath = window.location.pathname.replace(/\/+$/, "");
        const targetPath = target.pathname.replace(/\/+$/, "");
        return targetPath === currentPath && target.hash === window.location.hash;
      } catch (_) {
        return false;
      }
    };

    const layoutContainer = document.getElementById("app-layout-root");
    if (!layoutContainer) return;
    layoutContainer.classList.add("app-layout");

    const sidebar = document.createElement("aside");
    sidebar.className = "app-sidebar";
    sidebar.id = "app-sidebar";

    const currentPerspective = getActivePerspective();
    const activeScopes = getActiveServiceScopes(activeRole);
    layoutContainer.dataset.activePerspective = currentPerspective;
    layoutContainer.dataset.authorizedRole = getAuthorizationContext().role;

    let navSections = [];

    if (currentPerspective === "collaborator") {
      // EXPERIÊNCIA A: COLABORADOR ("O que você precisa?")
      navSections = [
        {
          title: "Minhas Demandas",
          items: [
            { id: "dashboard", label: "Meu Portal", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`, href: "dashboard.html" },
            { id: "solicitacoes", label: "Minhas Solicitações", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`, href: "solicitacoes.html" },
            { id: "solicitacao-nova", label: "Nova Solicitação", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`, href: "solicitacao-nova.html" }
          ]
        },
        {
          title: "Serviços Disponíveis",
          items: [
            { id: "viagens", label: "Viagens", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`, href: "viagens.html" },
            { id: "mobilidade", label: "Mobilidade", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>`, href: "mobilidade.html" },
            { id: "entregas", label: "Entregas", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`, href: "entregas.html" },
            { id: "estacionamento", label: "Estacionamento", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`, href: "estacionamento.html" },
            { id: "achados-perdidos", label: "Achados e Perdidos", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><circle cx="11" cy="11" r="3"/></svg>`, href: "achados-perdidos.html" },
            { id: "investigacao-ocorrencia", label: "Investigação Ocorrência", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="12" y1="9" x2="12.01" y2="9"/></svg>`, href: "investigacao-ocorrencia.html" },
            { id: "acessos", label: "Acessos & Credenciais", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>`, href: "acessos.html" },
            { id: "correios", label: "Correios", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`, href: "correios.html" },
            { id: "xerox", label: "Xerox", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`, href: "xerox.html" }
          ]
        },
        {
          title: "Suporte & Dúvidas",
          items: [
            { id: "conhecimento", label: "Base de Ajuda / Chatbot", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`, href: "conhecimento.html" }
          ]
        }
      ];
    } else if (currentPerspective === "approver") {
      // EXPERIÊNCIA C: GESTOR / APROVADOR ("O que precisa da minha decisão?")
      navSections = [
        {
          title: "Decisão & Equipe",
          items: [
            { id: "aprovacoes", label: "Central de Aprovações", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`, href: "aprovacoes.html" },
            { id: "solicitacoes", label: "Solicitações da Equipe", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`, href: "solicitacoes.html" },
            { id: "solicitacao-nova", label: "Nova Solicitação", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`, href: "solicitacao-nova.html" }
          ]
        },
        {
          title: "Gestão do Centro de Custo",
          items: [
            { id: "financeiro", label: "Orçamento do CC", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`, href: "financeiro.html" },
            { id: "relatorios", label: "Relatórios Gerenciais", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`, href: "relatorios.html" }
          ]
        },
        {
          title: "Serviços Institucionais",
          items: [
            { id: "autorizacoes", label: "Autorizações Excepcionais", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`, href: "autorizacoes.html" },
            { id: "acessos", label: "Acessos da Equipe", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>`, href: "acessos.html" },
            { id: "viagens", label: "Viagens Corporativas", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`, href: "viagens.html" }
          ]
        },
        {
          title: "Políticas & Regras",
          items: [
            { id: "conhecimento", label: "Diretrizes & Alçadas", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`, href: "conhecimento.html" }
          ]
        }
      ];
    } else {
      // EXPERIÊNCIA B: OPERADOR / TIME DE SERVIÇOS / ADMIN ("O que precisa ser executado?")
      const allServiceItems = [
        { id: "viagens", scopeKey: "viagens", label: "Viagens", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`, href: "viagens.html" },
        { id: "mobilidade", scopeKey: "mobilidade", label: "Mobilidade", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>`, href: "mobilidade.html" },
        { id: "transporte", scopeKey: "transportes", label: "Transportes", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`, href: "transporte.html" },
        { id: "entregas", scopeKey: "entregas", label: "Entregas", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`, href: "entregas.html" },
        { id: "estacionamento", scopeKey: "estacionamento", label: "Estacionamento", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`, href: "estacionamento.html" },
        { id: "achados-perdidos", scopeKey: "achados_perdidos", label: "Achados e Perdidos", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><circle cx="11" cy="11" r="3"/></svg>`, href: "achados-perdidos.html" },
        { id: "investigacao-ocorrencia", scopeKey: "investigacao_ocorrencia", label: "Investigação Ocorrência", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="12" y1="9" x2="12.01" y2="9"/></svg>`, href: "investigacao-ocorrencia.html" },
        { id: "acessos", scopeKey: "liberacao_acesso", label: "Acessos & Credenciais", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>`, href: "acessos.html" },
        { id: "correios", scopeKey: "correios", label: "Correios", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`, href: "correios.html" },
        { id: "xerox", scopeKey: "xerox", label: "Xerox", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`, href: "xerox.html" }
      ];

      const scopedItems = activeScopes.includes("ALL")
        ? allServiceItems
        : allServiceItems.filter(item => activeScopes.includes(item.scopeKey));

      navSections = [
        {
          title: "Minha Operação",
          items: [
            { id: "atendimentos", label: "Minha Operação", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`, href: "atendimentos.html" },
            { id: "dashboard", label: "Visão Central 360", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`, href: "dashboard.html" },
            { id: "solicitacoes", label: "Fila de Solicitações", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`, href: "solicitacoes.html" }
          ]
        },
        {
          title: "Minhas Verticais",
          items: scopedItems
        },
        {
          title: "Indicadores Operacionais",
          items: [
            { id: "fornecedores", label: "Fornecedores & SLA", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`, href: "fornecedores.html" },
            { id: "relatorios", label: "Relatórios de SLA", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`, href: "relatorios.html" },
            { id: "conhecimento", label: "Manuais Operacionais", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`, href: "conhecimento.html" }
          ]
        }
      ];
    }

    if (currentPerspective === "service-agent") {
      const agentIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>`;
      const scopedAgentItems = activeScopes.includes("ALL") ? [
        ["viagens","Viagens","viagens.html"],["mobilidade","Mobilidade","mobilidade.html"],["transporte","Transportes","transporte.html"],["correios","Correios","correios.html"],["entregas","Entregas","entregas.html"],["xerox","Xerox","xerox.html"]
      ] : [["viagens","Viagens","viagens.html","viagens"],["mobilidade","Mobilidade","mobilidade.html","mobilidade"],["transporte","Transportes","transporte.html","transportes"],["correios","Correios","correios.html","correios"],["entregas","Entregas","entregas.html","entregas"],["xerox","Xerox","xerox.html","xerox"]].filter(item=>activeScopes.includes(item[3]));
      navSections=[{title:"Minha Operação",items:[{id:"atendimentos",label:"Minha Operação",icon:agentIcon,href:"atendimentos.html"},{id:"solicitacoes",label:"Fila",icon:agentIcon,href:"solicitacoes.html"}]},{title:"Minhas Verticais",items:scopedAgentItems.map(item=>({id:item[0],label:item[1],icon:agentIcon,href:item[2]}))},{title:"Apoio Operacional",items:[{id:"relatorios",label:"Indicadores Operacionais",icon:agentIcon,href:"relatorios.html"},{id:"conhecimento",label:"Procedimentos / Assistente",icon:agentIcon,href:"conhecimento.html"}]}];
    }

    if (currentPerspective === "approver") {
      const approverIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>`;
      navSections=[{title:"Decisão",items:[{id:"aprovacoes",label:"Aprovações",icon:approverIcon,href:"aprovacoes.html"},{id:"solicitacoes",label:"Solicitações da Equipe",icon:approverIcon,href:"solicitacoes.html"},{id:"aprovacoes",label:"Histórico",icon:approverIcon,href:"aprovacoes.html#historico"},{id:"conhecimento",label:"Diretrizes / Assistente",icon:approverIcon,href:"conhecimento.html"}]}];
    }

    if (currentPerspective === "administration") {
      const adminIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M12 8v8"/></svg>`;
      navSections = [
        { title: "Administração Central 360", items: [
          { id: "dashboard", label: "Visão Geral", icon: adminIcon, href: "dashboard.html" },
          { id: "solicitacoes", label: "Solicitações", icon: adminIcon, href: "solicitacoes.html" },
          { id: "atendimentos", label: "Operação", icon: adminIcon, href: "atendimentos.html" },
          { id: "aprovacoes", label: "Aprovações", icon: adminIcon, href: "aprovacoes.html" }
        ]},
        { title: "Governança", items: [
          { id: "financeiro", label: "Financeiro", icon: adminIcon, href: "financeiro.html" },
          { id: "fornecedores", label: "Fornecedores", icon: adminIcon, href: "fornecedores.html" },
          { id: "relatorios", label: "Relatórios", icon: adminIcon, href: "relatorios.html" },
          { id: "conhecimento", label: "Políticas", icon: adminIcon, href: "conhecimento.html" },
          { id: "administracao", label: "Usuários & Permissões", icon: adminIcon, href: "administracao.html#usuarios" },
          { id: "administracao", label: "Auditoria", icon: adminIcon, href: "administracao.html#auditoria" },
          { id: "administracao", label: "Configurações", icon: adminIcon, href: "administracao.html#configuracoes" }
        ]},
        { title: "Todas as Verticais", items: [
          { id: "viagens", label: "Viagens", icon: adminIcon, href: "viagens.html" },
          { id: "mobilidade", label: "Mobilidade", icon: adminIcon, href: "mobilidade.html" },
          { id: "transporte", label: "Transportes", icon: adminIcon, href: "transporte.html" },
          { id: "correios", label: "Correios", icon: adminIcon, href: "correios.html" },
          { id: "entregas", label: "Entregas", icon: adminIcon, href: "entregas.html" },
          { id: "xerox", label: "Xerox", icon: adminIcon, href: "xerox.html" }
        ] }
      ];
    }
sidebar.innerHTML = `
      <div class="sidebar-header">
        <a href="dashboard.html" style="text-decoration:none;display:flex;align-items:center;gap:10px;">
          <div class="brand-title">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" style="flex-shrink:0;"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <div>
              <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Central 360</div>
              <div style="font-size:0.65rem;color:var(--text-muted);font-weight:400;">Central de Serviços</div>
            </div>
          </div>
        </a>
      </div>
      <nav class="sidebar-nav">
        ${navSections.map((sec, sIdx) => `
          <div class="sidebar-section-title">${sec.title}</div>
          ${sec.items.map(item => `
            <a href="${item.href}" class="nav-link ${isCurrentNavigationTarget(item.href) ? 'active' : ''}" data-tooltip="${item.label}">
              <span class="nav-icon">${item.icon}</span>
              <span class="nav-text">${item.label}</span>
            </a>
          `).join('')}
          ${sIdx < navSections.length - 1 ? '<div class="sidebar-section-divider"></div>' : ''}
        `).join('')}</nav>
    `;

    const syncSidebarActiveState = () => {
      sidebar.querySelectorAll(".nav-link[href]").forEach(link => {
        const isActive = isCurrentNavigationTarget(link.getAttribute("href"));
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    };
    syncSidebarActiveState();
    window.addEventListener("hashchange", syncSidebarActiveState);

    // Overlay Mobile
    let overlay = document.getElementById("sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "sidebar-overlay";
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);
    }

    const mainWrapper = document.createElement("div");
    mainWrapper.className = "app-main";

    const topbar = document.createElement("header");
    topbar.className = "app-topbar";

    const currentRole = { name: DEMO_IDENTITIES[activeRole]?.label || "Colaborador" };

    topbar.innerHTML = `
      <div class="topbar-left">
        <button type="button" class="topbar-icon sidebar-toggle" id="btn-sidebar-toggle" aria-label="Alternar menu lateral" aria-controls="app-sidebar" aria-expanded="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
      <div class="topbar-center">
        <div class="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="topbar-search-input" placeholder="Buscar na Central 360 (pressione Enter)" style="border:none;background:none;outline:none;flex:1;font-size:0.875rem;color:var(--text-primary);">
        </div>
      </div>
      <div class="topbar-right">
        <div class="role-selector-container" title="Em produção, roles vêm da identidade/RBAC">
          <span style="font-size:.6rem;font-weight:700;color:var(--warning);white-space:nowrap;">MODO DEMONSTRAÇÃO</span>
          <label for="demo-profile-selector" class="sr-only">MODO DEMONSTRAÇÃO — Simular perfil</label>
          <select id="demo-profile-selector" class="role-selector-select" aria-label="MODO DEMONSTRAÇÃO — Simular perfil">
            <optgroup label="MODO DEMONSTRAÇÃO — Simular perfil">
            ${Object.entries(DEMO_IDENTITIES).map(([id, item]) => `<option value="${id}" ${id === activeRole ? 'selected' : ''}>${item.label}</option>`).join('')}
            </optgroup>
          </select>
        </div>
        ${getShellConnectionBadgeMarkup()}
        <button type="button" class="topbar-icon" id="topbar-theme-toggle" aria-label="Alternar tema claro/escuro" title="Alternar tema">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <div class="topbar-menu">
          <button type="button" class="topbar-icon" id="topbar-notifications-toggle" aria-label="Abrir notificações" aria-expanded="false" aria-controls="topbar-notifications-panel" title="Notificações" style="position:relative;cursor:pointer;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="topbar-notification-badge" aria-hidden="true">5</span>
          </button>
          <section class="topbar-dropdown" id="topbar-notifications-panel" aria-label="Notificações demonstrativas" hidden>
            <div class="topbar-dropdown-header"><strong>Notificações</strong><span>Demonstrativo</span></div>
            <div class="topbar-dropdown-list">
              <a href="aprovacoes.html"><i class="topbar-dropdown-dot danger"></i><span><strong>Solicitação SOL-2026-001</strong><small>Aguardando aprovação</small></span></a>
              <a href="viagens.html"><i class="topbar-dropdown-dot warning"></i><span><strong>Bilhete não voado disponível</strong><small>Crédito disponível para reutilização</small></span></a>
              <a href="atendimentos.html"><i class="topbar-dropdown-dot info"></i><span><strong>Atendimento TICK-102</strong><small>Chamado demonstrativo atualizado</small></span></a>
              <a href="correios.html"><i class="topbar-dropdown-dot success"></i><span><strong>Postagem SEDEX 10</strong><small>Objeto em atendimento</small></span></a>
            </div>
            <a class="topbar-dropdown-footer" href="aprovacoes.html">Ver todas as notificações</a>
          </section>
        </div>
        <div class="topbar-menu">
          <button type="button" class="topbar-icon" id="topbar-help-toggle" aria-label="Abrir ajuda" aria-expanded="false" aria-controls="topbar-help-panel" title="Ajuda">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
          <section class="topbar-dropdown topbar-help-dropdown" id="topbar-help-panel" aria-label="Atalhos de ajuda" hidden>
            <div class="topbar-dropdown-header"><strong>Ajuda rápida</strong><span>Central 360</span></div>
            <nav class="topbar-help-links" aria-label="Tópicos de ajuda">
              <a href="solicitacao-nova.html"><span>＋</span>Como abrir uma nova solicitação</a>
              <a href="aprovacoes.html"><span>✓</span>Como acompanhar aprovações</a>
              <a href="viagens.html"><span>✈</span>Como usar viagens corporativas</a>
              <a href="conhecimento.html"><span>?</span>Abrir base de conhecimento</a>
              <a href="conhecimento.html#chat"><span>◌</span>Falar com assistente demonstrativo</a>
            </nav>
          </section>
        </div>
        <div class="user-avatar" onclick="window.location.href='login.html'" style="cursor:pointer;" title="Trocar perfil ou sair">
          <div style="width:32px;height:32px;border-radius:50%;background:var(--accent-light);display:flex;align-items:center;justify-content:center;color:var(--accent);font-weight:700;font-size:0.8rem;">
            ${activeRole === 'colaborador' ? 'CA' : activeRole === 'gestor' ? 'FL' : activeRole === 'viagens' ? 'WN' : activeRole === 'administrador' ? 'PS' : 'US'}
          </div>
        </div>
        <div class="user-info" onclick="window.location.href='login.html'" style="cursor:pointer;" title="Trocar perfil ou sair">
          <div style="font-size:0.8rem;font-weight:600;color:var(--text-primary);">${escapeHTML(currentRole.name)}</div>
          <div style="font-size:0.65rem;color:var(--text-muted);">${activeRole} · <span style="color:var(--accent);">Trocar</span></div>
        </div>
        <a href="login.html" class="btn btn-ghost btn-sm" title="Trocar perfil ou encerrar sessão" style="font-size:0.75rem;padding:4px 8px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sair
        </a>
      </div>
    `;

    // Bind role selector change
    const roleSelect = topbar.querySelector('.role-selector-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => setActiveRole(e.target.value));
    }

    // Topbar Search handler
    const searchInput = topbar.querySelector('#topbar-search-input');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const q = searchInput.value.trim();
          if (q) {
            window.location.href = `solicitacoes.html?search=${encodeURIComponent(q)}`;
          }
        }
      });
    }

    mainWrapper.appendChild(topbar);

    const contentSlot = document.getElementById("page-content-slot");
    if (contentSlot) {
      mainWrapper.appendChild(contentSlot);
    }

    layoutContainer.appendChild(sidebar);
    layoutContainer.appendChild(mainWrapper);

    updateTopbarThemeToggle(document.documentElement.dataset.theme || document.documentElement.getAttribute("data-theme") || getThemePreference());
    bindShellInteractions();
  }

  // --- 4. RENDERIZAÇÃO DE PÁGINAS (COM API OU LOCAL) ---
  async function renderPageSpecificContent() {
    let activePage = document.body.getAttribute("data-page") || "dashboard";
    if (activePage.endsWith("-secondary")) {
      activePage = activePage.replace("-secondary", "");
    }
    const data = getData();
    const role = getActiveRole();

    switch (activePage) {
      case "dashboard":
        await renderDashboard(data);
        break;
      case "solicitacoes":
        await renderSolicitacoesList(data);
        break;
      case "solicitacao-nova":
        setupNovaSolicitacaoForm(data);
        break;
      case "solicitacao-detalhe":
        await renderSolicitacaoDetalhe(data);
        break;
      case "viagem-detalhe":
        await renderViagemDetalhe(data);
        break;
      case "aprovacoes":
        await renderAprovacoesList(data, role);
        break;
      case "viagens":
        await renderViagensList(data);
        break;
      case "mobilidade":
        await renderMobilidadeList(data);
        break;
      case "correios":
        await renderCorreiosList(data);
        break;
      case "xerox":
        await renderXeroxList(data);
        break;
      case "conhecimento":
        setupChatbotAndKnowledge(data);
        break;
      case "administracao":
        renderAdministracao(data);
        break;
      case "fornecedores":
        await renderFornecedoresList(data);
        break;
      case "atendimentos":
        await renderAtendimentosList(data);
        break;
      case "relatorios":
        await renderRelatorios(data);
        break;
      case "financeiro":
        await renderFinanceiro(data);
        break;
      case "transporte":
        await renderTransporteList(data);
        break;
      case "estacionamento":
        await renderEstacionamentoList(data);
        break;
      case "entregas":
        await renderEntregasList(data);
        break;
      case "achados-perdidos":
        await renderAchadosPerdidosList(data);
        break;
      case "imagens":
        await renderImagensList(data);
        break;
      case "investigacao-ocorrencia":
        await renderInvestigacaoOcorrenciaList(data);
        break;
      case "autorizacoes":
        await renderAutorizacoesList(data);
        break;
      case "acessos":
        await renderAcessosList(data);
        break;
      default:
        break;
    }
    if (["dashboard", "atendimentos", "aprovacoes", "administracao"].includes(activePage)) injectContextualAssistant(activePage);
  }

  function injectContextualAssistant(page) {
    if (document.getElementById("role-context-assistant") || document.getElementById("assistant-chat")) return;
    const slot = document.getElementById("page-content-slot");
    if (!slot) return;
    const context = getAuthorizationContext();
    const purpose = { COLABORADOR:"dúvidas e políticas", AGENTE_SERVICO:"procedimentos de execução", GESTOR_APROVADOR:"diretrizes para decisão", ADMINISTRADOR:"políticas, governança e administração" }[context.role];
    const panel = document.createElement("section"); panel.id="role-context-assistant"; panel.className="panel"; panel.style.marginTop="16px";
    panel.innerHTML=`<div class="panel-header"><h2 class="panel-title">Assistente Central</h2><span class="badge-demo">${context.role}</span></div><div class="panel-body"><p style="margin:0 0 10px;color:var(--text-secondary)">Contexto: ${purpose}. Página atual: ${page}. Escopos: ${context.serviceScopes.join(", ") || "não aplicável"}.</p><div class="alert-box alert-info">Não encontrei uma orientação institucional cadastrada para este caso. Consulte a política oficial ou a Central de Serviços.</div></div>`;
    const homeHeader = slot.querySelector("header,.page-header,.dashboard-header,.admin-header");
    if (homeHeader) homeHeader.after(panel); else slot.prepend(panel);
  }

  // --- DASHBOARD ---
  async function renderDashboard(data) {
    let metrics, distribution, recentQueue;

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const [metricsRes, distRes, queueRes] = await Promise.all([
          CS360API.getDashboardMetrics(),
          CS360API.getStatusDistribution(),
          CS360API.getRecentQueue()
        ]);
        metrics = metricsRes.data;
        distribution = distRes.data;
        recentQueue = queueRes.data;
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            // API failed but demo mode: use centralized dashboard data
            const db = data.dashboard || {};
            const kpis = db.kpis || {};
            metrics = {
              totalRequests: kpis.solicitacoesHoje?.value ?? 0,
              pendingApprovals: kpis.prazoVencido?.value ?? 0,
              activeTrips: kpis.viagensAndamento?.value ?? 0,
              nonFlownTickets: kpis.bilhetesNaoVoados?.value ?? 0
            };
            distribution = db.statusSolicitacoes || {};
            recentQueue = db.servicosRecentes || data.requests.slice(0, 5);
          } else {
            showApiError("Dashboard", classified.message);
            return;
          }
        } else {
          showApiError("Dashboard", classified.message);
          return;
        }
      }
    } else {
      // Offline / Demo mode: use centralized dashboard data (aggregated demonstrative)
      const db = data.dashboard || {};
      const kpis = db.kpis || {};
      metrics = {
        totalRequests: kpis.solicitacoesHoje?.value ?? 0,
        pendingApprovals: kpis.prazoVencido?.value ?? 0,
        activeTrips: kpis.viagensAndamento?.value ?? 0,
        nonFlownTickets: kpis.bilhetesNaoVoados?.value ?? 0
      };
      distribution = db.statusSolicitacoes || {};
      recentQueue = db.servicosRecentes || data.requests.slice(0, 5);
    }

    setText("metric-total-requests", metrics.totalRequests);
    setText("metric-pending-approvals", metrics.pendingApprovals);
    setText("metric-active-trips", metrics.activeTrips);
    setText("metric-non-flown", metrics.nonFlownTickets);

    const chartContainer = document.getElementById("chart-status-distribution");
    if (chartContainer) {
      const total = metrics.totalRequests || 1;
      const counts = (_authState.apiAvailable && _authState.authenticated && distribution) ? distribution : {
        PENDENTE_APROVACAO: data.requests.filter(r => r.status === "PENDENTE_APROVACAO").length,
        APROVADO: data.requests.filter(r => r.status === "APROVADO").length,
        EM_ATENDIMENTO: data.requests.filter(r => r.status === "EM_ATENDIMENTO").length,
        CONCLUIDO: data.requests.filter(r => r.status === "CONCLUIDO").length,
        REJEITADO: data.requests.filter(r => r.status === "REJEITADO").length
      };

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
        const pct = total > 0 ? Math.round((val / total) * 100) : 0;

        row.innerHTML = `
          <div class="chart-bar-label">${labels[st] || st}</div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width: ${pct}%;"></div>
          </div>
          <div class="chart-bar-value">${val} (${pct}%)</div>
        `;
        chartContainer.appendChild(row);
      });
    }

    const tableBody = document.getElementById("dashboard-queue-tbody");
    if (tableBody) {
      tableBody.innerHTML = "";
      const queue = Array.isArray(recentQueue) ? recentQueue : [];
      queue.forEach(req => {
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

  function showApiError(context, message) {
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = "background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; padding: 12px 16px; border-radius: 6px; margin: 12px 0; font-size: 0.9rem;";
    errorDiv.textContent = `Erro ao carregar ${context}: ${message}`;
    const content = document.getElementById("page-content-slot") || document.body;
    content.prepend(errorDiv);
  }

  // --- SOLICITAÇÕES ---
  async function renderSolicitacoesList(data) {
    const tbody = document.getElementById("requests-tbody");
    if (!tbody) return;

    const filterStatus = document.getElementById("filter-status");
    const filterType = document.getElementById("filter-type");
    const footerInfo = document.getElementById("requests-footer-info");

    const filterSearch = document.getElementById("filter-search");
    const btnExportCsv = document.getElementById("btn-export-csv");
    const btnClearFilters = document.getElementById("btn-clear-filters");

    const urlParams = new URLSearchParams(window.location.search);
    const paramStatus = urlParams.get("status");
    const paramType = urlParams.get("type");
    const paramSearch = urlParams.get("search");

    if (filterStatus && paramStatus) {
      filterStatus.value = paramStatus;
    }
    if (filterType && paramType) {
      filterType.value = paramType;
    }
    if (filterSearch && paramSearch) {
      filterSearch.value = paramSearch;
    }

    let allRequests = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getRequests();
        allRequests = result.data || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            allRequests = data.requests || [];
          } else {
            showApiError("Solicitações", classified.message);
            return;
          }
        } else {
          showApiError("Solicitações", classified.message);
          return;
        }
      }
    } else {
      allRequests = data.requests || [];
    }

    // 1. Atualizar KPIs derivados EXCLUSIVAMENTE da mesma coleção da tabela
    function updateKPIs() {
      const total = allRequests.length;
      const pending = allRequests.filter(r => r.status === "PENDENTE_APROVACAO").length;
      const approved = allRequests.filter(r => r.status === "APROVADO").length;
      const inProgress = allRequests.filter(r => r.status === "EM_ATENDIMENTO").length;
      const completed = allRequests.filter(r => r.status === "CONCLUIDO").length;

      setText("kpi-total-pedidos", total);
      setText("kpi-pendentes-pedidos", pending);
      setText("kpi-aprovados-pedidos", approved);
      setText("kpi-atendimento-pedidos", inProgress);
      setText("kpi-concluidos-pedidos", completed);

      // Tornar os mini cards clicáveis para filtrar a tabela
      const kpiCards = document.querySelectorAll('.kpi-mini-card');
      if (kpiCards.length >= 5) {
        const statuses = ["ALL", "PENDENTE_APROVACAO", "APROVADO", "EM_ATENDIMENTO", "CONCLUIDO"];
        kpiCards.forEach((card, idx) => {
          card.style.cursor = "pointer";
          card.title = `Filtrar por: ${statuses[idx] || 'ALL'}`;
          card.onclick = () => {
            if (filterStatus) {
              filterStatus.value = statuses[idx] || "ALL";
              updateTable();
            }
          };
        });
      }
    }

    function getFilteredList() {
      const sVal = filterStatus ? filterStatus.value : "ALL";
      const tVal = filterType ? filterType.value : "ALL";
      const qVal = (filterSearch ? filterSearch.value : (paramSearch || "")).trim().toLowerCase();

      return allRequests.filter(r => {
        if (sVal !== "ALL" && r.status !== sVal) return false;
        if (tVal !== "ALL" && r.serviceType !== tVal) return false;
        if (qVal) {
          const matchTitle = (r.title || "").toLowerCase().includes(qVal);
          const matchId = (r.id || "").toLowerCase().includes(qVal);
          const matchRequester = (r.requesterName || "").toLowerCase().includes(qVal);
          const matchCc = (r.costCenter || "").toLowerCase().includes(qVal);
          if (!matchTitle && !matchId && !matchRequester && !matchCc) return false;
        }
        return true;
      });
    }

    function updateTable() {
      tbody.innerHTML = "";
      const filtered = getFilteredList();

      if (footerInfo) {
        footerInfo.textContent = filtered.length === allRequests.length
          ? `Exibindo todas as ${allRequests.length} solicitações (simuladas para validação)`
          : `Exibindo ${filtered.length} de ${allRequests.length} solicitações filtradas`;
      }

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">Nenhuma solicitação encontrada para os filtros selecionados.</td></tr>`;
        return;
      }

      filtered.forEach(req => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${escapeHTML(req.id)}</strong></td>
          <td><span style="text-transform: capitalize; font-weight: 600;">${escapeHTML(req.serviceType)}</span></td>
          <td><div class="request-title-cell" title="${escapeHTML(req.title)}">${escapeHTML(req.title)}</div></td>
          <td>${escapeHTML(req.costCenter)}</td>
          <td><span class="status-badge status-${req.status}">${formatStatus(req.status)}</span></td>
          <td style="text-align: right;"><a href="solicitacao-detalhe.html?id=${req.id}" class="btn btn-secondary" style="padding: 4px 10px; font-size:0.85rem;">Detalhes</a></td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Exportar CSV
    if (btnExportCsv) {
      btnExportCsv.onclick = () => {
        const list = getFilteredList();
        if (!list || list.length === 0) {
          alert("Nenhuma solicitação disponível para exportação com os filtros atuais.");
          return;
        }

        const headers = ["ID", "Frente", "Titulo", "Solicitante", "Centro de Custo", "Status", "Data Criacao"];
        const rows = list.map(r => [
          `"${r.id}"`,
          `"${r.serviceType}"`,
          `"${(r.title || "").replace(/"/g, '""')}"`,
          `"${r.requesterName || ""}"`,
          `"${r.costCenter || ""}"`,
          `"${r.status}"`,
          `"${r.createdAt || ""}"`
        ]);

        const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Central360_Solicitacoes_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
    }

    if (btnClearFilters) {
      btnClearFilters.onclick = () => {
        if (filterSearch) filterSearch.value = "";
        if (filterStatus) filterStatus.value = "ALL";
        if (filterType) filterType.value = "ALL";
        updateTable();
      };
    }

    updateKPIs();
    if (filterStatus) filterStatus.addEventListener("change", updateTable);
    if (filterType) filterType.addEventListener("change", updateTable);
    if (filterSearch) filterSearch.addEventListener("input", updateTable);
    updateTable();
  }

  // --- NOVA SOLICITAÇÃO ---
  function setupNovaSolicitacaoForm(data) {
    const form = document.getElementById("form-nova-solicitacao");
    if (!form) return;

    const reqTypeSelect = document.getElementById("req-type");
    const summaryType = document.getElementById("form-summary-type");
    const summarySla = document.getElementById("form-summary-sla");
    const summaryApproval = document.getElementById("form-summary-approval");
    const titleInput = document.getElementById("req-title");

    const sections = {
      viagem: document.getElementById("section-viagem-fields"),
      mobilidade: document.getElementById("section-mobilidade-fields"),
      transporte: document.getElementById("section-transporte-fields"),
      estacionamento: document.getElementById("section-estacionamento-fields"),
      entregas: document.getElementById("section-entregas-fields"),
      correios: document.getElementById("section-correios-fields"),
      xerox: document.getElementById("section-xerox-fields"),
      achados_perdidos: document.getElementById("section-achados_perdidos-fields"),
      investigacao_ocorrencia: document.getElementById("section-investigacao_ocorrencia-fields"),
      solicitacao_imagens: document.getElementById("section-solicitacao_imagens-fields"),
      autorizacao_excepcional: document.getElementById("section-autorizacao_excepcional-fields"),
      liberacao_acesso: document.getElementById("section-liberacao_acesso-fields")
    };

    const serviceMeta = {
      viagem: { label: "Viagens Corporativas", sla: "24 a 48 horas", approval: "Gestor Imediato (RN-GER-004)", placeholder: "Ex: Viagem para Congresso Científico em Brasília" },
      mobilidade: { label: "Mobilidade Urbana", sla: "Até 4 horas", approval: "Gestor Imediato (RN-MOB-002)", placeholder: "Ex: Deslocamento para visita técnica no campus parceiro" },
      transporte: { label: "Transporte Interno", sla: "30 a 60 minutos", approval: "Coordenação de Maqueiros / Facilities", placeholder: "Ex: Transferência de paciente monitorado UTI para Centro Cirúrgico" },
      estacionamento: { label: "Estacionamento & Veículos", sla: "Até 4 horas", approval: "Segurança Patrimonial & Acessos", placeholder: "Ex: Reserva de vaga para médico convidado IEP" },
      entregas: { label: "Entregas Internas", sla: "1 a 2 horas", approval: "Logística e Malotes Internos", placeholder: "Ex: Envio urgente de malote de medicamentos para UTI" },
      correios: { label: "Correios e Envios", sla: "Mesmo dia (até 14h)", approval: "Gestor Imediato (RN-COR-001)", placeholder: "Ex: Envio de documentação de convênio para Brasília" },
      xerox: { label: "Xerox e Impressões", sla: "24 a 48 horas", approval: "Gestor de Centro de Custo (RN-XER-001)", placeholder: "Ex: Impressão de 200 cartilhas de orientação ao paciente" },
      achados_perdidos: { label: "Achados e Perdidos", sla: "Atendimento imediato", approval: "Custódia Portaria Central", placeholder: "Ex: Crachá funcional magnético encontrado no ambulatório" },
      investigacao_ocorrencia: { label: "Investigação de Ocorrência", sla: "Pendente de levantamento", approval: "Segurança / Facilities", placeholder: "Ex: Registro de avaria em equipamento na UTI" },
      solicitacao_imagens: { label: "Solicitação de Imagens", sla: "24 a 48 horas", approval: "Segurança Patrimonial & Compliance", placeholder: "Ex: Gravação de câmera de segurança na garagem subsolo 2" },
      autorizacao_excepcional: { label: "Autorizações Excepcionais", sla: "12 a 24 horas", approval: "Central de Aprovações (Alçadas)", placeholder: "Ex: Extrapolação emergencial de verba para peça de tomógrafo" },
      liberacao_acesso: { label: "Liberação de Acesso", sla: "Até 4 horas", approval: "Gestor da Área / Segurança da Informação", placeholder: "Ex: Acesso temporário para auditores de qualidade JCI" }
    };

    function updateFormSections(val) {
      Object.keys(sections).forEach(key => {
        if (sections[key]) {
          sections[key].style.display = key === val ? "block" : "none";
        }
      });

      const meta = serviceMeta[val] || { label: val, sla: "24 a 48 horas", approval: "Gestor Imediato", placeholder: "Descreva o título da solicitação" };
      if (summaryType) summaryType.textContent = meta.label;
      if (summarySla) summarySla.textContent = meta.sla;
      if (summaryApproval) summaryApproval.textContent = meta.approval;
      if (titleInput && (!titleInput.value || titleInput.value.startsWith("Ex:"))) {
        titleInput.placeholder = meta.placeholder;
      }
      const parityEl = document.getElementById("form-summary-parity");
      if (parityEl) {
        if (val === "transporte") parityEl.textContent = "Identificado no benchmark — pendente de validação";
        else if (val === "solicitacao_imagens") parityEl.textContent = "Hipótese / Não confirmado";
        else if (val === "investigacao_ocorrencia") parityEl.textContent = "Confirmado no catálogo — campos pendentes";
        else parityEl.textContent = "Confirmado no screenshot — implementado no molde";
      }

      // Highlight selected catalog card
      document.querySelectorAll(".service-card").forEach(card => {
        const cType = card.getAttribute("data-service-card");
        if (cType === val) {
          card.classList.add("selected");
        } else {
          card.classList.remove("selected");
        }
      });
    }

    // Catalog card click listeners
    document.querySelectorAll(".service-card").forEach(card => {
      card.addEventListener("click", () => {
        const selectedType = card.getAttribute("data-service-card");
        if (selectedType && reqTypeSelect) {
          reqTypeSelect.value = selectedType;
          updateFormSections(selectedType);
          const scrollTarget = document.getElementById("form-scroll-target");
          if (scrollTarget) {
            scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
    });

    // Read URL params (e.g. ?type=transporte / ?journey=PERDI_ITEM / ?credit=TKT-...)
    const urlParams = new URLSearchParams(window.location.search);
    const paramType = urlParams.get("type");
    const paramJourney = urlParams.get("journey");
    const paramCredit = urlParams.get("credit");

    if (paramType && reqTypeSelect) {
      let normalized = paramType;
      if (paramType.startsWith("viagem")) normalized = "viagem";
      if (paramType.startsWith("mobil")) normalized = "mobilidade";
      if (paramType.startsWith("transp")) normalized = "transporte";
      if (paramType.startsWith("estac")) normalized = "estacionamento";
      if (paramType.startsWith("entreg")) normalized = "entregas";
      if (paramType.startsWith("achad")) normalized = "achados_perdidos";
      if (paramType.startsWith("imag")) normalized = "solicitacao_imagens";
      if (paramType.startsWith("autoriz")) normalized = "autorizacao_excepcional";
      if (paramType.startsWith("acess")) normalized = "liberacao_acesso";

      reqTypeSelect.value = normalized;
      updateFormSections(normalized);
    }

    if (paramJourney && typeof window.switchLostFoundJourney === "function") {
      window.switchLostFoundJourney(paramJourney);
    }

    if (paramCredit && titleInput) {
      titleInput.value = `Reutilização de Crédito ${paramCredit}`;
    }

    if (reqTypeSelect) {
      reqTypeSelect.addEventListener("change", (e) => updateFormSections(e.target.value));
      updateFormSections(reqTypeSelect.value);
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("req-title").value.trim();
      const type = document.getElementById("req-type").value;
      const costCenter = document.getElementById("req-cost-center").value;
      const actionSubmit = e.submitter ? e.submitter.getAttribute("data-action") : "send";

      if (!title) {
        alert("Por favor, informe o título da solicitação.");
        return;
      }

      const isDraft = actionSubmit === "draft";
      const status = isDraft ? "RASCUNHO" : "PENDENTE_APROVACAO";

      let specificDetails = {};
      if (type === "viagem") {
        specificDetails = {
          origin: document.getElementById("req-origin")?.value || "São Paulo (GRU)",
          destination: document.getElementById("req-destination")?.value || "Brasília (BSB)",
          departureDate: document.getElementById("req-dep-date")?.value || "2026-09-20",
          returnDate: document.getElementById("req-ret-date")?.value || "2026-09-23",
          reason: document.getElementById("req-reason")?.value || "Viagem a serviço.",
          needsHotel: document.getElementById("req-hotel-check")?.value === "sim",
          insuranceRequested: document.getElementById("req-insurance-check")?.value === "sim"
        };
      } else if (type === "mobilidade") {
        specificDetails = {
          provider: document.getElementById("req-mob-provider")?.value || "uber",
          city: document.getElementById("req-mob-city")?.value || "São Paulo / SP",
          origin: document.getElementById("req-mob-origin")?.value || "Hospital Sírio-Libanês",
          destination: document.getElementById("req-mob-dest")?.value || "Unidade Externa",
          reason: document.getElementById("req-mob-reason")?.value || "Deslocamento a serviço."
        };
      } else if (type === "transporte") {
        specificDetails = {
          transportType: document.getElementById("req-trp-type")?.value || "Pessoa",
          priority: document.getElementById("req-trp-priority")?.value || "Normal",
          origin: document.getElementById("req-trp-origin")?.value || "UTI Geral Adulto",
          destination: document.getElementById("req-trp-destination")?.value || "Centro Cirúrgico",
          scheduledDate: document.getElementById("req-trp-date")?.value || "2026-08-08",
          scheduledTime: document.getElementById("req-trp-time")?.value || "10:00",
          specialRequirements: document.getElementById("req-trp-notes")?.value || "Sem requisitos especiais."
        };
      } else if (type === "estacionamento") {
        specificDetails = {
          requestType: document.getElementById("req-est-type")?.value || "Solicitação de vaga",
          location: document.getElementById("req-est-location")?.value || "Edifício Garagem Bela Vista",
          vehiclePlate: document.getElementById("req-est-plate")?.value || "ABC-4E88",
          vehicleModel: document.getElementById("req-est-model")?.value || "Corolla Prata",
          periodStart: document.getElementById("req-est-period-start")?.value || "12/08/2026 07:30",
          periodEnd: document.getElementById("req-est-period-end")?.value || "12/08/2026 18:00",
          justification: document.getElementById("req-est-justification")?.value || "Acesso institucional ao estacionamento.",
          isDemonstrative: true
        };
      } else if (type === "entregas") {
        specificDetails = {
          deliveryType: document.getElementById("req-ent-type")?.value || "Malote",
          priority: document.getElementById("req-ent-priority")?.value || "Normal",
          origin: document.getElementById("req-ent-origin")?.value || "Farmácia Central",
          destination: document.getElementById("req-ent-dest")?.value || "Farmácia Satélite UTI",
          sender: document.getElementById("req-ent-sender")?.value || "Remetente Responsável",
          recipient: document.getElementById("req-ent-recipient")?.value || "Destinatário Responsável",
          itemDescription: document.getElementById("req-ent-desc")?.value || "Malote lacrado de insumos."
        };
      } else if (type === "correios") {
        specificDetails = {
          mode: document.getElementById("req-cor-mode")?.value || "SEDEX",
          recipient: document.getElementById("req-cor-recipient")?.value || "Destinatário",
          cep: document.getElementById("req-cor-cep")?.value || "01308-050",
          address: document.getElementById("req-cor-address")?.value || "São Paulo - SP",
          content: document.getElementById("req-cor-content")?.value || "Documentos operacionais."
        };
      } else if (type === "xerox") {
        specificDetails = {
          format: document.getElementById("req-xer-format")?.value || "A4",
          copies: document.getElementById("req-xer-copies")?.value || "50",
          color: document.getElementById("req-xer-color")?.value || "COLOR",
          finish: document.getElementById("req-xer-finish")?.value || "GRAMPO",
          notes: document.getElementById("req-xer-notes")?.value || "Sem observações adicionais."
        };
      } else if (type === "achados_perdidos") {
        specificDetails = {
          occurrenceType: document.getElementById("req-ach-occurrence-type")?.value || "ENCONTREI_ITEM",
          category: document.getElementById("req-ach-category")?.value || "Documentos/Crachás",
          location: document.getElementById("req-ach-location")?.value || "Recepção Central",
          dateTime: document.getElementById("req-ach-datetime")?.value || "Hoje pela manhã",
          contact: document.getElementById("req-ach-contact")?.value || "Ramal 3021",
          details: document.getElementById("req-ach-details")?.value || "Objeto recolhido para custódia segura."
        };
      } else if (type === "solicitacao_imagens") {
        specificDetails = {
          requestType: document.getElementById("req-img-type")?.value || "CFTV / Segurança Patrimonial",
          sector: document.getElementById("req-img-sector")?.value || "Edifício Garagem - Subsolo 2",
          period: document.getElementById("req-img-period")?.value || "07/08/2026 das 14:00 às 17:30",
          purpose: document.getElementById("req-img-purpose")?.value || "Apuração de incidente patrimonial",
          justification: document.getElementById("req-img-justification")?.value || "Auditoria interna autorizada.",
          isDemonstrative: true
        };
      } else if (type === "autorizacao_excepcional") {
        specificDetails = {
          category: document.getElementById("req-exc-category")?.value || "Orçamentária / Custo",
          validity: document.getElementById("req-exc-validity")?.value || "10/08 a 12/08/2026",
          reason: document.getElementById("req-exc-reason")?.value || "Procedimento em regime de exceção.",
          justification: document.getElementById("req-exc-justification")?.value || "Excepcionalidade emergencial justificada."
        };
      } else if (type === "liberacao_acesso") {
        specificDetails = {
          accessType: document.getElementById("req-acs-type")?.value || "Solicitar acesso especial",
          resource: document.getElementById("req-acs-resource")?.value || "Sala Segura TI",
          userTarget: document.getElementById("req-acs-user")?.value || "Carlos Andrade (Solicitante)",
          period: document.getElementById("req-acs-period")?.value || "15/08 a 19/08/2026",
          justification: document.getElementById("req-acs-justification")?.value || "Auditoria técnica autorizada.",
          isDemonstrative: true
        };
      }

      // Coletor compartilhado com o Portal do Colaborador: a regra final de payload
      // permanece única, enquanto cada shell controla somente sua apresentação.
      if (window.CS360RequestForm) {
        specificDetails = { ...specificDetails, ...window.CS360RequestForm.collectLegacy(type, document) };
      }

      const requestData = {
        serviceType: type,
        title: title,
        requesterId: "USR-001",
        requesterName: "Carlos Andrade (Solicitante)",
        costCenter: costCenter,
        status: status,
        urgent: false,
        details: specificDetails
      };

      if (_authState.apiAvailable && _authState.authenticated) {
        try {
          const result = await CS360API.createRequest(requestData);
          if (result.success) {
            logAuditEvent(isDraft ? "SOLICITACAO_RASCUNHO" : "SOLICITACAO_ENVIADA", `Solicitação ${result.data.id} criada via API.`);
            alert(isDraft ? `Rascunho ${result.data.id} salvo com sucesso!` : `Solicitação ${result.data.id} enviada para aprovação com sucesso!`);
            window.location.href = `solicitacao-detalhe.html?id=${result.data.id}`;
          }
        } catch (err) {
          alert("Erro ao criar solicitação: " + err.message);
        }
      } else {
        const newId = "SOL-2026-" + Math.floor(100 + Math.random() * 900);
        const newRequest = {
          id: newId,
          ...requestData,
          createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          history: [
            { date: new Date().toISOString().replace("T", " ").substring(0, 16), action: isDraft ? "Criado rascunho da solicitação." : "Enviado para aprovação do gestor.", user: "Carlos Andrade (Solicitante)" }
          ]
        };
        data.requests.unshift(newRequest);
        saveData(data);
        logAuditEvent(isDraft ? "SOLICITACAO_RASCUNHO" : "SOLICITACAO_ENVIADA", `Solicitação ${newId} criada localmente.`);
        alert(isDraft ? `Rascunho ${newId} salvo com sucesso!` : `Solicitação ${newId} enviada para aprovação com sucesso!`);
        window.location.href = `solicitacao-detalhe.html?id=${newId}`;
      }
    });
  }

// --- SOLICITAÇÃO DETALHE ---
  async function renderSolicitacaoDetalhe(data) {
    const urlParams = new URLSearchParams(window.location.search);
    const reqId = urlParams.get("id") || "SOL-2026-001";
    let req;

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getRequestById(reqId);
        req = result.data;
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            req = data.requests.find(r => r.id === reqId);
          } else {
            showApiError("Solicitação", classified.message);
            return;
          }
        } else {
          showApiError("Solicitação", classified.message);
          return;
        }
      }
    } else {
      req = data.requests.find(r => r.id === reqId);
    }

    if (!req) {
      req = (data.requests && data.requests.length > 0) ? data.requests[0] : {
        id: reqId,
        title: "Solicitação Geral",
        serviceType: "viagem",
        requesterName: "Carlos Andrade",
        costCenter: "CC-3021",
        status: "PENDENTE_APROVACAO",
        createdAt: "2026-08-01 10:15"
      };
    }

    setText("detail-id", req.id);
    setText("breadcrumb-req-id", req.id);
    setText("detail-title", req.title);
    setText("detail-status-badge", formatStatus(req.status));

    const badgeEl = document.getElementById("detail-status-badge");
    if (badgeEl) badgeEl.className = `status-badge status-${req.status}`;

    setText("detail-requester", req.requesterName || "Carlos Andrade");
    setText("detail-cost-center", req.costCenter || "CC-3021");
    setText("detail-type", (req.serviceType || "viagem").toUpperCase());
    setText("detail-created", req.createdAt || "2026-08-01 10:15");

    // Detalhes Específicos da Frente Operacional
    const specificContainer = document.getElementById("detail-service-specific-content");
    if (specificContainer) {
      const d = req.details || {};
      if (req.serviceType === "viagem") {
        specificContainer.innerHTML = `
          <div><strong>Origem / Destino:</strong> <span>${escapeHTML(d.origin || "São Paulo (GRU)")} ➔ ${escapeHTML(d.destination || "Brasília (BSB)")}</span></div>
          <div><strong>Datas:</strong> <span>${escapeHTML(d.departureDate || "15/09/2026")} a ${escapeHTML(d.returnDate || "18/09/2026")}</span></div>
          <div><strong>Hospedagem:</strong> <span>${d.needsHotel !== false ? "Sim (Standard Individual)" : "Não"}</span></div>
          <div><strong>Seguro Viagem:</strong> <span style="color:var(--success);font-weight:600;">✓ Apólice Simulado Emitido (RN-VIA-003)</span></div>
          <div><strong>Motivo:</strong> <p style="margin:4px 0 0 0;color:var(--text-secondary);font-size:0.85rem;">${escapeHTML(d.reason || req.title)}</p></div>
        `;
      } else if (req.serviceType === "mobilidade") {
        specificContainer.innerHTML = `
          <div><strong>Provedor:</strong> <span>${escapeHTML(d.provider || "Uber for Business")}</span></div>
          <div><strong>Cidade / Região:</strong> <span>${escapeHTML(d.city || "São Paulo / SP")}</span></div>
          <div><strong>Origem / Destino:</strong> <span>${escapeHTML(d.origin || "Hospital Sírio-Libanês")} ➔ ${escapeHTML(d.destination || "Unidade Externa")}</span></div>
          <div><strong>Justificativa (RN-MOB-002):</strong> <p style="margin:4px 0 0 0;color:var(--text-secondary);font-size:0.85rem;">${escapeHTML(d.reason || "Deslocamento institucional a serviço.")}</p></div>
        `;
      } else if (req.serviceType === "correios") {
        specificContainer.innerHTML = `
          <div><strong>Modalidade:</strong> <span>${escapeHTML(d.mode || "SEDEX Convencional")}</span></div>
          <div><strong>Destinatário:</strong> <span>${escapeHTML(d.recipient || "Secretaria / Protocolo")}</span></div>
          <div><strong>Endereço / CEP:</strong> <span>${escapeHTML(d.address || "São Paulo - SP")} (CEP: ${escapeHTML(d.cep || "01308-050")})</span></div>
          <div><strong>Conteúdo Declarado:</strong> <p style="margin:4px 0 0 0;color:var(--text-secondary);font-size:0.85rem;">${escapeHTML(d.content || "Documentos operacionais.")}</p></div>
        `;
      } else if (req.serviceType === "xerox") {
        specificContainer.innerHTML = `
          <div><strong>Formato / Papel:</strong> <span>${escapeHTML(d.format || "A4")} · ${escapeHTML(d.color || "Colorida")}</span></div>
          <div><strong>Tiragem / Cópias:</strong> <span>${escapeHTML(d.copies || "50")} exemplares</span></div>
          <div><strong>Acabamento:</strong> <span>${escapeHTML(d.finish || "Grampeado no canto")}</span></div>
          <div><strong>Observações:</strong> <p style="margin:4px 0 0 0;color:var(--text-secondary);font-size:0.85rem;">${escapeHTML(d.notes || "Entregar no setor requisitante.")}</p></div>
        `;
      } else if (req.serviceType === "transporte") {
        specificContainer.innerHTML = `
          <div><strong>Tipo de Movimentação:</strong> <span>${escapeHTML(d.transportType || "Pessoa / Paciente")}</span></div>
          <div><strong>Trajeto:</strong> <span>${escapeHTML(d.origin || "Origem")} ➔ ${escapeHTML(d.destination || "Destino")}</span></div>
          <div><strong>Data & Horário:</strong> <span>${escapeHTML(d.scheduledDate || "Hoje")} às ${escapeHTML(d.scheduledTime || "Imediato")}</span></div>
          <div><strong>Prioridade:</strong> <span class="status-badge status-${d.priority === 'Urgente' ? 'REJEITADO' : 'APROVADO'}">${escapeHTML(d.priority || "Normal")}</span></div>
          <div><strong>Requisitos / Recomendações:</strong> <p style="margin:4px 0 0 0;color:var(--text-secondary);font-size:0.85rem;">${escapeHTML(d.specialRequirements || "Sem requisitos especiais.")}</p></div>
        `;
      } else if (req.serviceType === "estacionamento") {
        specificContainer.innerHTML = `
          <div><strong>Tipo de Solicitação:</strong> <span>${escapeHTML(d.requestType || "Solicitação de vaga")}</span></div>
          <div><strong>Veículo (Simulado):</strong> <span>${escapeHTML(d.vehicleModel || "Veículo")} · Placa: <strong>${escapeHTML(d.vehiclePlate || "ABC-1234")}</strong></span></div>
          <div><strong>Local / Garagem:</strong> <span>${escapeHTML(d.location || "Garagem Central")}</span></div>
          <div><strong>Período:</strong> <span>${escapeHTML(d.periodStart || "Início")} até ${escapeHTML(d.periodEnd || "Fim")}</span></div>
          <div><strong>Justificativa:</strong> <p style="margin:4px 0 0 0;color:var(--text-secondary);font-size:0.85rem;">${escapeHTML(d.justification || "Acesso a serviço.")}</p></div>
          <div class="notice-box-demo" style="margin-top:6px;"><span>⚠️</span><div><strong>Aviso Demonstrativo:</strong> Fluxo demonstrativo sujeito à validação institucional.</div></div>
        `;
      } else if (req.serviceType === "entregas") {
        specificContainer.innerHTML = `
          <div><strong>Tipo de Movimentação:</strong> <span>${escapeHTML(d.deliveryType || "Malote")}</span></div>
          <div><strong>Trajeto Intersetorial:</strong> <span>${escapeHTML(d.origin || "Origem")} ➔ ${escapeHTML(d.destination || "Destino")}</span></div>
          <div><strong>Remetente / Destinatário:</strong> <span>${escapeHTML(d.sender || "Remetente")} / ${escapeHTML(d.recipient || "Destinatário")}</span></div>
          <div><strong>Prioridade:</strong> <span class="status-badge status-${d.priority === 'Urgente' ? 'REJEITADO' : 'APROVADO'}">${escapeHTML(d.priority || "Normal")}</span></div>
          <div><strong>Descrição & Custódia:</strong> <p style="margin:4px 0 0 0;color:var(--text-secondary);font-size:0.85rem;">${escapeHTML(d.itemDescription || "Malote com protocolo.")}</p></div>
        `;
      } else if (req.serviceType === "achados_perdidos") {
        specificContainer.innerHTML = `
          <div><strong>Jornada:</strong> <span class="status-badge ${d.occurrenceType === 'ENCONTREI_ITEM' ? 'status-CONCLUIDO' : 'status-APROVADO'}">${d.occurrenceType === 'ENCONTREI_ITEM' ? '🟢 Encontrei um Item' : '🔵 Perdi um Item'}</span></div>
          <div><strong>Categoria do Objeto:</strong> <span>${escapeHTML(d.category || "Outros")}</span></div>
          <div><strong>Local & Data da Ocorrência:</strong> <span>${escapeHTML(d.location || "Dependências")} · ${escapeHTML(d.dateTime || "Hoje")}</span></div>
          <div><strong>Contato do Solicitante:</strong> <span>${escapeHTML(d.contact || "Ramal interno")}</span></div>
          <div><strong>Detalhes Distintivos:</strong> <p style="margin:4px 0 0 0;color:var(--text-secondary);font-size:0.85rem;">${escapeHTML(d.details || "Objeto sob custódia na Portaria Central.")}</p></div>
        `;
      } else if (req.serviceType === "investigacao_ocorrencia") {
        specificContainer.innerHTML = `
          <div><strong>Categoria da Ocorrência:</strong> <span>${escapeHTML(d.category || "Patrimonial / Operacional")}</span></div>
          <div><strong>Local do Fato / Setor:</strong> <span>${escapeHTML(d.location || "Dependências")}</span></div>
          <div><strong>Data & Horário:</strong> <span>${escapeHTML(d.datetime || d.dateOccurrence || "07/08/2026 08:30")}</span></div>
          <div><strong>Pessoas / Testemunhas:</strong> <span>${escapeHTML(d.people || "Equipe de plantão")}</span></div>
          <div><strong>Relato dos Fatos:</strong> <p style="margin:4px 0 0 0;color:var(--text-secondary);font-size:0.85rem;">${escapeHTML(d.description || req.title)}</p></div>
          <div class="notice-box-demo" style="margin-top:6px;"><span>⚠️</span><div><strong>Status do Levantamento:</strong> Campos e procedimento pendentes de levantamento no sistema atual. Exibindo estrutura demonstrativa inicial.</div></div>
        `;
      } else if (req.serviceType === "solicitacao_imagens") {
        specificContainer.innerHTML = `
          <div><strong>Tipo de Solicitação:</strong> <span>${escapeHTML(d.requestType || "CFTV / Segurança Patrimonial")}</span></div>
          <div><strong>Setor / Câmeras de Referência:</strong> <span>${escapeHTML(d.sector || "Edifício Garagem")}</span></div>
          <div><strong>Intervalo de Data & Hora:</strong> <span>${escapeHTML(d.period || "Intervalo de referência")}</span></div>
          <div><strong>Finalidade:</strong> <span>${escapeHTML(d.purpose || "Apuração")}</span></div>
          <div><strong>Justificativa Formal:</strong> <p style="margin:4px 0 0 0;color:var(--text-secondary);font-size:0.85rem;">${escapeHTML(d.justification || "Auditoria interna autorizada.")}</p></div>
          <div class="notice-box-demo" style="margin-top:6px;"><span>🔒</span><div><strong>Privacidade & Retenção:</strong> Fluxo demonstrativo. Regras de privacidade, autorização e retenção dependem de validação institucional.</div></div>
        `;
      } else if (req.serviceType === "autorizacao_excepcional") {
        specificContainer.innerHTML = `
          <div><strong>Categoria da Exceção:</strong> <span>${escapeHTML(d.category || "Orçamentária / Custo")}</span></div>
          <div><strong>Vigência da Autorização:</strong> <span>${escapeHTML(d.validity || "Vigência determinada")}</span></div>
          <div><strong>Motivo Declarado:</strong> <span>${escapeHTML(d.reason || req.title)}</span></div>
          <div><strong>Justificativa & Impacto:</strong> <p style="margin:4px 0 0 0;color:var(--text-secondary);font-size:0.85rem;">${escapeHTML(d.justification || "Excepcionalidade emergencial.")}</p></div>
          <div class="notice-box-demo" style="margin-top:6px;"><span>⚖️</span><div><strong>Central de Aprovações:</strong> Encaminhado para deliberação de alçadas executivas.</div></div>
        `;
      } else if (req.serviceType === "liberacao_acesso") {
        specificContainer.innerHTML = `
          <div><strong>Tipo de Acesso:</strong> <span>${escapeHTML(d.accessType || "Solicitar acesso especial")}</span></div>
          <div><strong>Recurso / Local Restrito:</strong> <span>${escapeHTML(d.resource || "Área Restrita")}</span></div>
          <div><strong>Usuário / Titular:</strong> <span>${escapeHTML(d.userTarget || req.requesterName)}</span></div>
          <div><strong>Vigência:</strong> <span>${escapeHTML(d.period || "Vigência temporária")}</span></div>
          <div><strong>Justificativa Institucional:</strong> <p style="margin:4px 0 0 0;color:var(--text-secondary);font-size:0.85rem;">${escapeHTML(d.justification || "Acesso a serviço.")}</p></div>
          <div class="notice-box-demo" style="margin-top:6px;"><span>🛡️</span><div><strong>Aviso Demonstrativo:</strong> Sem alteração de credenciais no IAM corporativo nesta fase.</div></div>
        `;
      } else {
        specificContainer.innerHTML = `<div><strong>Descrição Geral:</strong> <p style="margin:4px 0 0 0;color:var(--text-secondary);">${escapeHTML(req.title)}</p></div>`;
      }
    }

    // Ações contextuais de aprovação / itinerário
    const actionsBar = document.getElementById("detail-actions-bar");
    if (actionsBar) {
      actionsBar.innerHTML = "";
      const currentRole = getActiveRole();
      const isApprover = ["gestor", "administrador", "gerencia"].includes(currentRole);

      if (req.serviceType === "viagem") {
        const btnItinerary = document.createElement("a");
        btnItinerary.href = `viagem-detalhe.html?id=${req.id}`;
        btnItinerary.className = "btn btn-secondary btn-sm";
        btnItinerary.style.cssText = "display:inline-flex;align-items:center;gap:6px;";
        btnItinerary.innerHTML = `✈️ Ver Itinerário`;
        actionsBar.appendChild(btnItinerary);
      }

      if (req.status === "PENDENTE_APROVACAO" && isApprover) {
        const btnApprove = document.createElement("button");
        btnApprove.type = "button";
        btnApprove.className = "btn btn-success btn-sm";
        btnApprove.style.cssText = "display:inline-flex;align-items:center;gap:6px;background:var(--success);color:#fff;border:none;padding:6px 12px;border-radius:var(--radius-sm);cursor:pointer;font-weight:600;";
        btnApprove.innerHTML = `👍 Aprovar Solicitação`;
        btnApprove.onclick = async () => {
          if (!confirm(`Confirma a aprovação da solicitação ${req.id}?`)) return;
          if (_authState.apiAvailable && _authState.authenticated) {
            try {
              await CS360API.approveRequest(req.id, "Aprovado via interface de detalhes.");
            } catch (err) {
              console.warn("API approve failed, falling back to local storage:", err);
            }
          }
          req.status = "APROVADO";
          req.history = req.history || [];
          req.history.unshift({
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            user: `${currentRole.toUpperCase()} (Simulado)`,
            action: "Solicitação aprovada pelo gestor responsável."
          });
          saveData(data);
          logAuditEvent("SOLICITACAO_APROVADA", `Solicitação ${req.id} aprovada.`);
          alert(`Solicitação ${req.id} aprovada com sucesso!`);
          window.location.reload();
        };
        actionsBar.appendChild(btnApprove);

        const btnReject = document.createElement("button");
        btnReject.type = "button";
        btnReject.className = "btn btn-danger btn-sm";
        btnReject.style.cssText = "display:inline-flex;align-items:center;gap:6px;background:var(--danger);color:#fff;border:none;padding:6px 12px;border-radius:var(--radius-sm);cursor:pointer;font-weight:600;";
        btnReject.innerHTML = `❌ Rejeitar Solicitação`;
        btnReject.onclick = async () => {
          const reason = prompt("Informe o motivo da rejeição (obrigatório):");
          if (!reason) return;
          if (_authState.apiAvailable && _authState.authenticated) {
            try {
              await CS360API.rejectRequest(req.id, reason);
            } catch (err) {
              console.warn("API reject failed, falling back to local storage:", err);
            }
          }
          req.status = "REJEITADO";
          req.history = req.history || [];
          req.history.unshift({
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            user: `${currentRole.toUpperCase()} (Simulado)`,
            action: `Solicitação rejeitada. Motivo: ${reason}`
          });
          saveData(data);
          logAuditEvent("SOLICITACAO_REJEITADA", `Solicitação ${req.id} rejeitada: ${reason}`);
          alert(`Solicitação ${req.id} foi rejeitada.`);
          window.location.reload();
        };
        actionsBar.appendChild(btnReject);
      }
    }

    // Timeline auditável
    const timelineEl = document.getElementById("detail-timeline");
    if (timelineEl) {
      timelineEl.innerHTML = "";
      const historyItems = req.history && req.history.length > 0 ? req.history : [
        { date: req.createdAt || "2026-08-01 10:15", user: req.requesterName || "Carlos Andrade", action: "Solicitação aberta no catálogo de serviços 360." }
      ];
      historyItems.forEach(hist => {
        const item = document.createElement("li");
        item.className = "timeline-item";
        item.innerHTML = `
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-date">${escapeHTML(hist.date)} — <strong>${escapeHTML(hist.user || "Sistema")}</strong></div>
            <div>${escapeHTML(hist.action)}</div>
          </div>
        `;
        timelineEl.appendChild(item);
      });
    }
  }

  // --- VIAGEM DETALHE ---
  async function renderViagemDetalhe(data) {
    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get("id") || "SOL-2026-001";
    let trip = (data.requests || []).find(r => r.id === tripId);
    if (!trip) {
      trip = (data.requests || []).find(r => r.serviceType === "viagem") || {
        id: tripId,
        title: "Viagem para Congresso Científico em Brasília",
        status: "EM_ATENDIMENTO",
        requesterName: "Carlos Andrade",
        costCenter: "CC-3021",
        details: {
          origin: "São Paulo (GRU)",
          destination: "Brasília (BSB)",
          departureDate: "15/09/2026",
          returnDate: "18/09/2026"
        }
      };
    }

    const d = trip.details || {};
    setText("viagem-breadcrumb-id", trip.id);
    setText("viagem-det-id", trip.id);
    setText("viagem-det-title", trip.title);
    setText("viagem-det-status", formatStatus(trip.status));

    const statusBadge = document.getElementById("viagem-det-status");
    if (statusBadge) statusBadge.className = `status-badge status-${trip.status}`;

    setText("viagem-det-origin-dest", `${d.origin || "São Paulo (GRU)"} ➔ ${d.destination || "Brasília (BSB)"}`);
    setText("viagem-det-dates", `${d.departureDate || "15/09/2026"} a ${d.returnDate || "18/09/2026"}`);
    setText("viagem-det-passenger", trip.requesterName || "Carlos Andrade");
    setText("viagem-det-cc", trip.costCenter || "CC-3021");
    setText("viagem-det-pnr", `Localizador: ARGO-${trip.id.replace(/\D/g, '') || '8921'}-X`);

    const linkSol = document.getElementById("viagem-link-solicitacao");
    if (linkSol) {
      linkSol.href = `solicitacao-detalhe.html?id=${trip.id}`;
    }
  }

  // --- APROVAÇÕES ---
  async function renderAprovacoesList(data, role) {
    const tbody = document.getElementById("aprovacoes-tbody");
    if (!tbody) return;

    const currentRole = role || getActiveRole();
    const isGestorOrAdmin = currentRole === "gestor" || currentRole === "administrador" || currentRole === "gerencia" || currentRole === "coordenadora";

    // 1. Atualizar visualização RBAC
    const rbacBadge = document.getElementById("rbac-role-badge");
    const rbacCallout = document.getElementById("aprov-rbac-callout");
    const rbacHint = document.getElementById("aprov-rbac-hint");

    if (rbacBadge) {
      rbacBadge.textContent = isGestorOrAdmin ? "Perfil: Gestor Aprovador" : "Perfil: Colaborador";
      rbacBadge.className = isGestorOrAdmin ? "badge-demo" : "status-badge status-PENDENTE_APROVACAO";
    }

    if (rbacCallout && rbacHint) {
      if (isGestorOrAdmin) {
        rbacHint.innerHTML = ' — Você possui <strong>permissão de deliberação</strong>. Decisões serão registradas na trilha de auditoria.';
      } else {
        rbacHint.innerHTML = ' — <strong>Sem permissão de aprovação.</strong> Alterne para "Gestor Aprovador" para deliberar.';
      }
    }

    let allRequests = data.requests || [];
    let pending = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getPendingApprovals();
        pending = result.data || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            pending = allRequests.filter(r => r.status === "PENDENTE_APROVACAO");
          } else {
            showApiError("Aprovações", classified.message);
            return;
          }
        } else {
          showApiError("Aprovações", classified.message);
          return;
        }
      }
    } else {
      pending = allRequests.filter(r => r.status === "PENDENTE_APROVACAO");
    }

    // 2. Cálculos dos 6 KPIs (fonte única: pending)
    const totalPendentes = pending.length;
    const prioridadeAlta = pending.filter(r => r.urgent || r.serviceType === "viagem").length;
    const aprovadas = allRequests.filter(r => r.status === "APROVADO").length;
    const rejeitadas = allRequests.filter(r => r.status === "REJEITADO").length;

    // Calcular tempo de espera mais longo
    let maxWait = "Em dia";
    if (pending.length > 0) {
      const now = new Date();
      let maxDays = 0;
      pending.forEach(r => {
        const created = new Date(r.createdAt);
        const diffMs = now - created;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > maxDays) maxDays = diffDays;
      });
      maxWait = maxDays > 0 ? `Há ${maxDays} dia${maxDays > 1 ? 's' : ''}` : "Hoje";
    }

    setText("kpi-aprov-pendentes", totalPendentes);
    setText("kpi-aprov-prioridade", prioridadeAlta);
    setText("kpi-aprov-espera", maxWait);
    setText("kpi-aprov-aprovadas", aprovadas);
    setText("kpi-aprov-rejeitadas", rejeitadas);
    setText("kpi-aprov-tempo", "4h sim.");

    // 3. Resumo de Pendências por Frente
    const pendViagem = pending.filter(r => r.serviceType === "viagem").length;
    const pendMob = pending.filter(r => r.serviceType === "mobilidade").length;
    const pendCor = pending.filter(r => r.serviceType === "correios").length;
    const pendXer = pending.filter(r => r.serviceType === "xerox").length;

    const pctViagem = totalPendentes > 0 ? ((pendViagem / totalPendentes) * 100).toFixed(0) : 0;
    const pctMob = totalPendentes > 0 ? ((pendMob / totalPendentes) * 100).toFixed(0) : 0;
    const pctCor = totalPendentes > 0 ? ((pendCor / totalPendentes) * 100).toFixed(0) : 0;
    const pctXer = totalPendentes > 0 ? ((pendXer / totalPendentes) * 100).toFixed(0) : 0;

    setText("pend-frente-viagem", `${pendViagem} (${pctViagem}%)`);
    setText("pend-frente-mob", `${pendMob} (${pctMob}%)`);
    setText("pend-frente-cor", `${pendCor} (${pctCor}%)`);
    setText("pend-frente-xer", `${pendXer} (${pctXer}%)`);

    const barViagem = document.getElementById("bar-frente-viagem");
    const barMob = document.getElementById("bar-frente-mob");
    const barCor = document.getElementById("bar-frente-cor");
    const barXer = document.getElementById("bar-frente-xer");
    if (barViagem) barViagem.style.width = `${pctViagem}%`;
    if (barMob) barMob.style.width = `${pctMob}%`;
    if (barCor) barCor.style.width = `${pctCor}%`;
    if (barXer) barXer.style.width = `${pctXer}%`;

    // 4. Alertas
    const alertsContainer = document.getElementById("alerts-container");
    const alertBadge = document.getElementById("alert-count-badge");
    if (alertsContainer) {
      alertsContainer.innerHTML = "";
      const oldAlerts = pending.filter(r => {
        const created = new Date(r.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        return diffDays >= 2;
      });

      if (alertBadge) alertBadge.textContent = oldAlerts.length;

      if (oldAlerts.length === 0) {
        alertsContainer.innerHTML = `
          <div style="text-align: center; padding: 12px; color: var(--text-muted); font-size: var(--font-xs);">
            Nenhum alerta ativo neste momento.
          </div>
        `;
      } else {
        oldAlerts.forEach(r => {
          const created = new Date(r.createdAt);
          const now = new Date();
          const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
          const alert = document.createElement("div");
          alert.style.cssText = "display: flex; gap: 10px; padding: 10px; background: var(--surface-muted); border: 1px solid var(--border); border-radius: var(--radius-sm);";
          alert.innerHTML = `
            <span style="font-size: 1.1rem;">⏳</span>
            <div style="flex: 1;">
              <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${escapeHTML(r.id)} aguardando há ${diffDays} dia${diffDays > 1 ? 's' : ''}</div>
              <div style="color: var(--text-secondary);">${escapeHTML(r.title)}</div>
              <span class="status-badge status-PENDENTE_APROVACAO" style="font-size: 0.6rem; margin-top: 4px;">Atenção</span>
            </div>
          `;
          alertsContainer.appendChild(alert);
        });
      }
    }

    // 5. Renderização da Tabela de Fila com Filtros
    function renderTableRows(items) {
      tbody.innerHTML = "";
      const tableFooter = document.getElementById("aprovacoes-table-footer");
      const queueCounter = document.getElementById("aprov-queue-counter");

      if (queueCounter) {
        queueCounter.textContent = `${items.length} pendência(s) ativa(s)`;
      }

      if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 32px; color: var(--text-muted);">
          <div style="font-size: 1.5rem; margin-bottom: 8px;">✅</div>
          <div style="font-weight: 600; color: var(--text-secondary);">Nenhuma solicitação aguardando aprovação</div>
          <div style="font-size: 0.75rem; margin-top: 4px;">Neste cenário demonstrativo, todas as solicitações foram processadas.</div>
        </td></tr>`;
      } else {
        items.forEach(req => {
          const isHighPriority = req.urgent || req.serviceType === "viagem";
          const passenger = req.requesterName || "Solicitante Exemplo";
          const costCenter = req.costCenter || "CC-DEMO-01";

          // Calcular tempo de espera
          const created = new Date(req.createdAt);
          const now = new Date();
          const diffMs = now - created;
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          let waitTime = "";
          if (diffDays > 0) waitTime = `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
          else if (diffHours > 0) waitTime = `Há ${diffHours}h`;
          else waitTime = "Hoje";

          const frenteLabel = {
            viagem: "✈️ Viagem",
            mobilidade: "🚗 Mobilidade",
            correios: "📦 Correios",
            xerox: "🖨️ Xerox"
          }[req.serviceType] || req.serviceType;

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong>${escapeHTML(req.id)}</strong></td>
            <td>${escapeHTML(passenger)}</td>
            <td>
              <div style="font-weight: 600; color: var(--text-primary);">${escapeHTML(req.title)}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${frenteLabel}</div>
            </td>
            <td>${escapeHTML(costCenter)}</td>
            <td><span style="font-size: 0.75rem; color: var(--text-secondary);">${waitTime}</span></td>
            <td>
              <span class="status-badge ${isHighPriority ? 'status-PENDENTE_APROVACAO' : 'status-EM_ATENDIMENTO'}" style="font-size: 0.65rem;">
                ${isHighPriority ? '🔥 Alta' : 'Normal'}
              </span>
            </td>
            <td style="text-align: right; white-space: nowrap;">
              <button class="btn btn-secondary btn-sm btn-view-details" data-id="${req.id}" style="padding: 3px 8px; font-size: 0.75rem;">Ver Detalhes</button>
              ${isGestorOrAdmin ? `
                <button class="btn btn-success btn-sm btn-aprov-action" data-id="${req.id}" data-action="approve" style="padding: 3px 8px; font-size: 0.75rem;">Aprovar</button>
                <button class="btn btn-danger btn-sm btn-aprov-action" data-id="${req.id}" data-action="reject" style="padding: 3px 8px; font-size: 0.75rem;">Rejeitar</button>
              ` : `
                <button class="btn btn-secondary btn-sm" disabled title="Requer perfil Gestor Aprovador" style="padding: 3px 8px; font-size: 0.75rem; opacity: 0.5; cursor: not-allowed;">Aprovar</button>
                <button class="btn btn-secondary btn-sm" disabled title="Requer perfil Gestor Aprovador" style="padding: 3px 8px; font-size: 0.75rem; opacity: 0.5; cursor: not-allowed;">Rejeitar</button>
              `}
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      if (tableFooter) {
        tableFooter.textContent = items.length === allRequests.filter(r => r.status === "PENDENTE_APROVACAO").length
          ? `Exibindo todas as ${items.length} solicitações pendentes`
          : `Exibindo ${items.length} de ${allRequests.filter(r => r.status === "PENDENTE_APROVACAO").length} solicitações filtradas`;
      }

      // Eventos de Ação
      document.querySelectorAll(".btn-view-details").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          openDetailsModal(allRequests.find(r => r.id === id));
        });
      });

      if (isGestorOrAdmin) {
        document.querySelectorAll(".btn-aprov-action").forEach(btn => {
          btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            const action = btn.getAttribute("data-action");
            if (action === "approve") {
              const req = allRequests.find(r => r.id === id);
              const confirmMsg = `Aprovar esta solicitação?\n\nID: ${id}\nFrente: ${req ? req.serviceType : '-'}\nSolicitante: ${req ? req.requesterName : '-'}`;
              if (confirm(confirmMsg)) {
                await handleAprovacaoDecision(data, id, "approve", "Aprovado pelo gestor");
              }
            } else if (action === "reject") {
              openRejectModal(data, id);
            }
          });
        });
      }
    }

    renderTableRows(pending);

    // Filtros
    const filterFrente = document.getElementById("filter-aprov-frente");
    const filterPrioridade = document.getElementById("filter-aprov-prioridade");
    const filterCC = document.getElementById("filter-aprov-cc");

    function applyFilters() {
      let filtered = [...pending];
      if (filterFrente && filterFrente.value !== "TODOS") {
        filtered = filtered.filter(r => r.serviceType === filterFrente.value);
      }
      if (filterPrioridade && filterPrioridade.value !== "TODOS") {
        if (filterPrioridade.value === "ALTA") {
          filtered = filtered.filter(r => r.urgent || r.serviceType === "viagem");
        } else {
          filtered = filtered.filter(r => !r.urgent && r.serviceType !== "viagem");
        }
      }
      if (filterCC && filterCC.value !== "TODOS") {
        filtered = filtered.filter(r => r.costCenter === filterCC.value);
      }
      renderTableRows(filtered);
    }

    if (filterFrente) filterFrente.onchange = applyFilters;
    if (filterPrioridade) filterPrioridade.onchange = applyFilters;
    if (filterCC) filterCC.onchange = applyFilters;

    // 6. Histórico Recente de Decisões
    const histTbody = document.getElementById("aprovacoes-history-tbody");
    if (histTbody) {
      histTbody.innerHTML = "";
      const decided = allRequests.filter(r => r.status === "APROVADO" || r.status === "REJEITADO" || r.status === "CONCLUIDO");
      if (decided.length === 0) {
        histTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 16px; color: var(--text-muted);">Nenhuma deliberação registrada recentemente.</td></tr>`;
      } else {
        decided.forEach(r => {
          const isApp = r.status === "APROVADO" || r.status === "CONCLUIDO";
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong>${escapeHTML(r.id)}</strong></td>
            <td><div class="request-title-cell" title="${escapeHTML(r.title)}">${escapeHTML(r.title)}</div></td>
            <td><span class="status-badge ${isApp ? 'status-APROVADO' : 'status-REJEITADO'}">${isApp ? 'Aprovada' : 'Rejeitada'}</span></td>
            <td>Gestor (Simulado)</td>
            <td style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(r.updatedAt || r.createdAt)}</td>
          `;
          histTbody.appendChild(tr);
        });
      }
    }
  }

  // Modal de Detalhes
  function openDetailsModal(req) {
    if (!req) return;
    const modal = document.getElementById("modal-details");
    const content = document.getElementById("modal-details-content");
    if (!modal || !content) return;

    const passenger = req.requesterName || "Solicitante Exemplo";
    const costCenter = req.costCenter || "CC-DEMO-01";
    const frenteLabel = {
      viagem: "✈️ Viagem Corporativa",
      mobilidade: "🚗 Mobilidade Urbana",
      correios: "📦 Correios e Envios",
      xerox: "🖨️ Xerox e Impressões"
    }[req.serviceType] || req.serviceType;

    let detailsHtml = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div><strong>ID:</strong> ${escapeHTML(req.id)}</div>
        <div><strong>Status:</strong> <span class="status-badge status-${req.status}">${formatStatus(req.status)}</span></div>
        <div><strong>Solicitante:</strong> ${escapeHTML(passenger)}</div>
        <div><strong>Centro de Custo:</strong> ${escapeHTML(costCenter)}</div>
        <div><strong>Frente:</strong> ${escapeHTML(frenteLabel)}</div>
        <div><strong>Data:</strong> ${escapeHTML(req.createdAt)}</div>
      </div>
      <div style="margin-top: 6px; padding: 8px; background: var(--surface-muted); border-radius: var(--radius-sm);">
        <strong>Título:</strong>
        <div style="color: var(--text-primary); margin-top: 2px;">${escapeHTML(req.title)}</div>
      </div>
    `;

    // Adicionar detalhes específicos por tipo
    if (req.details) {
      if (req.serviceType === "viagem") {
        detailsHtml += `
          <div style="padding: 8px; background: var(--surface-muted); border-radius: var(--radius-sm);">
            <strong>Detalhes da Viagem:</strong>
            <div style="margin-top: 4px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.7rem;">
              <div>Origem: ${escapeHTML(req.details.origin || '-')}</div>
              <div>Destino: ${escapeHTML(req.details.destination || '-')}</div>
              <div>Ida: ${escapeHTML(req.details.departureDate || '-')}</div>
              <div>Volta: ${escapeHTML(req.details.returnDate || '-')}</div>
              <div>Hotel: ${req.details.needsHotel ? 'Sim' : 'Não'}</div>
              <div>Seguro: ${req.details.insuranceRequested ? 'Sim' : 'Não'}</div>
            </div>
            ${req.details.estimatedCost ? `<div style="margin-top: 4px; font-weight: 600;">Custo estimado: R$ ${req.details.estimatedCost.toFixed(2)} (sim.)</div>` : ''}
          </div>
        `;
      } else if (req.serviceType === "mobilidade") {
        detailsHtml += `
          <div style="padding: 8px; background: var(--surface-muted); border-radius: var(--radius-sm);">
            <strong>Detalhes da Mobilidade:</strong>
            <div style="margin-top: 4px; font-size: 0.7rem;">
              <div>Plataforma: ${escapeHTML(req.details.platform || '-')}</div>
              <div>Limite mensal: R$ ${(req.details.monthlyLimit || 0).toFixed(2)} (sim.)</div>
              <div>Motivo: ${escapeHTML(req.details.reason || '-')}</div>
            </div>
          </div>
        `;
      } else if (req.serviceType === "correios") {
        detailsHtml += `
          <div style="padding: 8px; background: var(--surface-muted); border-radius: var(--radius-sm);">
            <strong>Detalhes do Envio:</strong>
            <div style="margin-top: 4px; font-size: 0.7rem;">
              <div>Modalidade: ${escapeHTML(req.details.modality || '-')}</div>
              <div>Destinatário: ${escapeHTML(req.details.recipientName || '-')}</div>
              <div>CEP: ${escapeHTML(req.details.destinationZip || '-')}</div>
              <div>Rastreamento: ${escapeHTML(req.details.trackingCode || 'Aguardando')}</div>
            </div>
          </div>
        `;
      } else if (req.serviceType === "xerox") {
        detailsHtml += `
          <div style="padding: 8px; background: var(--surface-muted); border-radius: var(--radius-sm);">
            <strong>Detalhes da Impressão:</strong>
            <div style="margin-top: 4px; font-size: 0.7rem;">
              <div>Formato: ${escapeHTML(req.details.format || '-')} | Cor: ${escapeHTML(req.details.colorMode || '-')}</div>
              <div>Cópias: ${req.details.copies || 0} | Páginas: ${req.details.pages || 0}</div>
              <div>Acabamento: ${escapeHTML(req.details.finishing || '-')}</div>
              <div>Arquivo: ${escapeHTML(req.details.fileName || '-')}</div>
            </div>
          </div>
        `;
      }
    }

    // Adicionar histórico
    if (req.history && req.history.length > 0) {
      detailsHtml += `
        <div>
          <strong>Histórico:</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 0.7rem;">
            ${req.history.map(h => `<li>${escapeHTML(h.date)} — ${escapeHTML(h.action)} (${escapeHTML(h.user)})</li>`).join('')}
          </ul>
        </div>
      `;
    }

    detailsHtml += `
      <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end;">
        <a href="solicitacao-detalhe.html?id=${req.id}" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
          📄 Abrir Página Completa da Solicitação ➔
        </a>
      </div>
    `;

    content.innerHTML = detailsHtml;
    modal.style.display = "flex";

    const closeBtn = document.getElementById("btn-close-details-modal");
    const closeBtn2 = document.getElementById("btn-close-details");
    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    if (closeBtn2) closeBtn2.onclick = () => modal.style.display = "none";
  }

  // Modal Acessível de Rejeição (RN-GER-005)
  function openRejectModal(data, reqId) {
    const modal = document.getElementById("modal-reject");
    const idEl = document.getElementById("reject-req-id");
    const rationaleText = document.getElementById("reject-rationale-text");
    const errorMsg = document.getElementById("reject-error-msg");
    const confirmBtn = document.getElementById("btn-confirm-reject");
    const cancelBtn = document.getElementById("btn-cancel-reject");
    const closeBtn = document.getElementById("btn-close-reject-modal");

    if (!modal || !rationaleText || !confirmBtn) return;

    // Mostrar contexto da solicitação
    const req = data.requests.find(r => r.id === reqId);
    if (idEl && req) {
      idEl.textContent = `${reqId} — ${req.title}`;
    } else if (idEl) {
      idEl.textContent = reqId;
    }

    rationaleText.value = "";
    if (errorMsg) errorMsg.style.display = "none";

    modal.style.display = "flex";
    rationaleText.focus();

    function closeModal() {
      modal.style.display = "none";
    }

    if (cancelBtn) cancelBtn.onclick = closeModal;
    if (closeBtn) closeBtn.onclick = closeModal;

    confirmBtn.onclick = async () => {
      const reason = rationaleText.value.trim();
      if (!reason) {
        if (errorMsg) errorMsg.style.display = "block";
        rationaleText.focus();
        return;
      }
      closeModal();
      await handleAprovacaoDecision(data, reqId, "reject", reason);
    };

    modal.onkeydown = (e) => {
      if (e.key === "Escape") closeModal();
    };
  }

  async function handleAprovacaoDecision(data, reqId, action, rationale) {
    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        if (action === "approve") {
          await CS360API.approveRequest(reqId, "Gestor (Simulado)", rationale || "Aprovado via portal");
          alert(`Solicitação ${reqId} APROVADA com sucesso!`);
        } else {
          await CS360API.rejectRequest(reqId, "Gestor (Simulado)", rationale);
          alert(`Solicitação ${reqId} REJEITADA com justificativa.`);
        }
        window.location.reload();
      } catch (err) {
        alert("Erro ao processar: " + err.message);
      }
    } else {
      const req = data.requests.find(r => r.id === reqId);
      if (!req) return;

      if (action === "approve") {
        req.status = "APROVADO";
        req.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
        req.history.push({ date: req.updatedAt, action: "Solicitação APROVADA pelo gestor autorizador.", user: "Gestor (Simulado)" });
        logAuditEvent("SOLICITACAO_APROVADA", `Solicitação ${reqId} aprovada.`);
        saveData(data);
        alert(`Solicitação ${reqId} APROVADA com sucesso!`);
        window.location.reload();
      } else {
        req.status = "REJEITADO";
        req.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
        req.history.push({ date: req.updatedAt, action: `REJEITADA. Justificativa: "${rationale}"`, user: "Gestor (Simulado)" });
        logAuditEvent("SOLICITACAO_REJEITADA", `Solicitação ${reqId} rejeitada.`);
        saveData(data);
        alert(`Solicitação ${reqId} REJEITADA.`);
        window.location.reload();
      }
    }
  }

  // --- VIAGENS ---
  function installOperationalFilters(tbody, config) {
    if (!tbody || tbody.dataset.filtersReady === "true") return;
    const table = tbody.closest("table");
    const wrap = table?.parentElement;
    if (!table || !wrap) return;
    const isolatedTableWrap = wrap.matches(".mobility-table-scroll, .service-table-scroll");
    const filterHost = isolatedTableWrap ? wrap.parentElement : wrap;

    const bar = document.createElement("div");
    bar.className = "operational-filter-bar";
    bar.setAttribute("aria-label", `Filtros de ${config.label}`);
    const controls = config.filters.map((filter, index) => {
      const id = `${tbody.id}-filter-${index}`;
      return `<label for="${id}">${filter.label}<select id="${id}"><option value="ALL">Todos</option>${filter.options.map(option => `<option value="${escapeHTML(option)}">${escapeHTML(option)}</option>`).join("")}</select></label>`;
    }).join("");
    bar.innerHTML = `${controls}<button type="button" class="btn btn-ghost btn-sm">Limpar</button><span class="operational-filter-count" aria-live="polite"></span>`;
    filterHost.insertBefore(bar, isolatedTableWrap ? wrap : table);

    const selects = [...bar.querySelectorAll("select")];
    const count = bar.querySelector(".operational-filter-count");
    const apply = () => {
      const rows = [...tbody.querySelectorAll("tr")].filter(row => !row.querySelector("td[colspan]"));
      let visible = 0;
      rows.forEach(row => {
        const matches = config.filters.every((filter, index) => selects[index].value === "ALL" || filter.value(row) === selects[index].value);
        row.hidden = !matches;
        if (matches) visible += 1;
      });
      count.textContent = `${visible} de ${rows.length} registros`;
    };
    selects.forEach(select => select.addEventListener("change", apply));
    bar.querySelector("button").addEventListener("click", () => { selects.forEach(select => { select.value = "ALL"; }); apply(); });
    tbody.dataset.filtersReady = "true";
    apply();
  }

  function mergeDemonstrativeRecords(primary, samples) {
    const combined = [...(primary || [])];
    const ids = new Set(combined.map(item => item.id));
    (samples || []).forEach(item => { if (!ids.has(item.id)) combined.push(item); });
    return combined;
  }

  async function renderViagensList(data) {
    let trips = [];
    let tickets = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const [tripsRes, ticketsRes] = await Promise.all([
          CS360API.getViagens(),
          CS360API.getNonFlownTickets()
        ]);
        trips = mergeDemonstrativeRecords(tripsRes.data, (data.requests || []).filter(r => r.serviceType === "viagem"));
        tickets = mergeDemonstrativeRecords(ticketsRes.data, data.nonFlownTickets);
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            trips = (data.requests || []).filter(r => r.serviceType === "viagem");
            tickets = data.nonFlownTickets || [];
          } else {
            showApiError("Viagens", classified.message);
            return;
          }
        } else {
          showApiError("Viagens", classified.message);
          return;
        }
      }
    } else {
      trips = (data.requests || []).filter(r => r.serviceType === "viagem");
      tickets = data.nonFlownTickets || [];
    }

    // 1. Cálculos dos 6 KPIs da tela de Viagens
    const emAndamento = trips.filter(t => t.status === "EM_ATENDIMENTO").length;
    const proximas = trips.filter(t => t.status === "APROVADO" || t.status === "EM_ATENDIMENTO").length;
    const pendentes = trips.filter(t => t.status === "PENDENTE_APROVACAO").length;
    const bilhetesDisponiveis = tickets.filter(t => t.status === "DISPONIVEL");
    const bilhetesQtd = bilhetesDisponiveis.length;
    const creditosTotal = bilhetesDisponiveis.reduce((sum, t) => sum + (t.creditBalance || 0), 0);
    const alertasQtd = 2; // Alertas operacionais ativos (demonstrativo)

    setText("kpi-viagens-andamento", emAndamento);
    setText("kpi-viagens-proximas", proximas);
    setText("kpi-viagens-pendentes", pendentes);
    setText("kpi-bilhetes-qtd", bilhetesQtd);
    setText("kpi-creditos-valor", `R$ ${creditosTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} sim.`);
    setText("kpi-viagens-alertas", alertasQtd);
    setText("credits-total-balance", `R$ ${creditosTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} sim.`);

    // 2. Renderizar Cards de Próximas Viagens & Viagens Ativas
    const activeCardsContainer = document.getElementById("viagens-active-cards");
    const cardsCounter = document.getElementById("viagens-cards-counter");
    if (activeCardsContainer) {
      activeCardsContainer.innerHTML = "";
      const activeTrips = trips.filter(t => t.status === "APROVADO" || t.status === "EM_ATENDIMENTO");

      if (cardsCounter) {
        cardsCounter.textContent = `${activeTrips.length} viagem(ns) ativa(s) ou programada(s)`;
      }

      if (activeTrips.length === 0) {
        activeCardsContainer.innerHTML = `
          <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: var(--font-sm);">
            Nenhuma viagem em andamento ou próxima programada no momento.
          </div>
        `;
      } else {
        activeTrips.forEach(t => {
          const origin = t.details?.origin || "São Paulo (GRU)";
          const destination = t.details?.destination || "Brasília (BSB)";
          const depDate = t.details?.departureDate || t.createdAt;
          const retDate = t.details?.returnDate ? ` a ${t.details.returnDate}` : "";
          const costCenter = t.costCenter || "CC-DEMO-01";
          const passenger = t.requesterName || "Solicitante Exemplo";

          const card = document.createElement("div");
          card.className = "trip-card";
          card.innerHTML = `
            <div class="trip-header">
              <div class="trip-route">
                <span>✈️</span>
                <span>${escapeHTML(origin)} ➔ ${escapeHTML(destination)}</span>
              </div>
              <span class="status-badge status-${t.status}">${formatStatus(t.status)}</span>
            </div>
            <div class="trip-meta-row">
              <div class="trip-meta-item">
                <span>Viajante / Solicitante</span>
                <strong style="color: var(--text-primary);">${escapeHTML(passenger)}</strong>
              </div>
              <div class="trip-meta-item">
                <span>Período Programado</span>
                <span>${escapeHTML(depDate)}${escapeHTML(retDate)}</span>
              </div>
              <div class="trip-meta-item">
                <span>Centro de Custo</span>
                <span>${escapeHTML(costCenter)}</span>
              </div>
              <div class="trip-meta-item" style="text-align: right; justify-content: center;">
                <a href="viagem-detalhe.html?id=${t.id}" class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">
                  Ver Itinerário ➔
                </a>
              </div>
            </div>
          `;
          activeCardsContainer.appendChild(card);
        });
      }
    }

    // 3. Renderizar Tabela de Solicitações de Viagem Registradas
    const tbody = document.getElementById("viagens-tbody");
    const tableFooter = document.getElementById("viagens-table-footer");
    if (tbody) {
      tbody.innerHTML = "";
      if (trips.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">Nenhuma solicitação de viagem encontrada.</td></tr>`;
      } else {
        trips.forEach(t => {
          const origin = t.details?.origin || "São Paulo (GRU)";
          const destination = t.details?.destination || "Brasília (BSB)";
          const period = t.details?.departureDate ? `${t.details.departureDate}${t.details.returnDate ? ' a ' + t.details.returnDate : ''}` : t.createdAt;
          const costCenter = t.costCenter || "CC-DEMO-01";
          const passenger = t.requesterName || "Solicitante Exemplo";

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong>${escapeHTML(t.id)}</strong></td>
            <td>${escapeHTML(passenger)}</td>
            <td>
              <div style="font-weight: 600; color: var(--text-primary);">${escapeHTML(origin)} ➔ ${escapeHTML(destination)}</div>
              <div class="request-title-cell" style="font-size: 0.75rem; color: var(--text-muted);" title="${escapeHTML(t.title)}">${escapeHTML(t.title)}</div>
            </td>
            <td>${escapeHTML(costCenter)}</td>
            <td><span class="status-badge status-${t.status}">${formatStatus(t.status)}</span></td>
            <td style="text-align: right;">
              <a href="viagem-detalhe.html?id=${t.id}" class="btn btn-secondary btn-sm" style="padding: 3px 8px; font-size: 0.8rem;">Ver Itinerário</a>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      if (tableFooter) {
        tableFooter.textContent = `Exibindo todas as ${trips.length} solicitações de viagem (simuladas para validação)`;
      }
      installOperationalFilters(tbody, {
        label: "viagens",
        filters: [
          { label: "Status", options: [...new Set(trips.map(item => item.status))], value: row => [...row.cells[4].querySelector("span").classList].find(name => name.startsWith("status-") && name !== "status-badge")?.replace("status-", "") || "" },
          { label: "Centro de custo", options: [...new Set(trips.map(item => item.costCenter).filter(Boolean))], value: row => row.cells[3].textContent.trim() }
        ]
      });
    }

    // 4. Renderizar Lista de Bilhetes Não Voados & Créditos
    const nonFlownList = document.getElementById("non-flown-list");
    if (nonFlownList) {
      nonFlownList.innerHTML = "";
      if (tickets.length === 0) {
        nonFlownList.innerHTML = `
          <div style="text-align: center; padding: 16px; color: var(--text-muted); font-size: var(--font-xs);">
            Não há créditos disponíveis neste cenário demonstrativo.
          </div>
        `;
      } else {
        tickets.forEach(tkt => {
          const isAvail = tkt.status === "DISPONIVEL";
          const passenger = tkt.passenger || "Viajante Simulado";
          const item = document.createElement("div");
          item.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--surface-muted); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: var(--font-xs); gap: 8px;";
          item.innerHTML = `
            <div style="flex: 1;">
              <div style="font-weight: 700; color: var(--text-primary);">${escapeHTML(tkt.id)} • ${escapeHTML(tkt.airline)} (${escapeHTML(tkt.originalRoute)})</div>
              <div style="color: var(--text-muted); font-size: 0.65rem;">${escapeHTML(passenger)} • Expira: ${escapeHTML(tkt.expiresAt)}</div>
            </div>
            <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
              <div style="font-weight: 700; color: ${isAvail ? 'var(--success)' : 'var(--text-muted)'};">R$ ${Number(tkt.creditBalance || 0).toFixed(2)}</div>
              ${isAvail ? `<a href="solicitacao-nova.html?type=viagens&credit=${tkt.id}" class="btn btn-secondary btn-sm" style="font-size: 0.65rem; padding: 2px 6px; text-decoration: none;">Reutilizar ➔</a>` : `<span class="status-badge status-REJEITADO" style="font-size: 0.6rem; padding: 1px 5px;">${escapeHTML(tkt.status)}</span>`}
            </div>
          `;
          nonFlownList.appendChild(item);
        });
      }
    }
  }

  // --- MOBILIDADE ---
  async function renderMobilidadeList(data) {
    let rides = [];
    let accessRequests = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getMobilidadeRides();
        rides = mergeDemonstrativeRecords(result.data, data.mobilityRides);
        accessRequests = data.mobilityAccessRequests || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            rides = data.mobilityRides || [];
            accessRequests = data.mobilityAccessRequests || [];
          } else {
            showApiError("Mobilidade", classified.message);
            return;
          }
        } else {
          showApiError("Mobilidade", classified.message);
          return;
        }
      }
    } else {
      rides = data.mobilityRides || [];
      accessRequests = data.mobilityAccessRequests || [];
    }

    // 1. Cálculos dos 6 KPIs de Mobilidade
    const usuariosAtivos = "18 sim.";
    const totalCorridas = rides.length;
    const gastoTotal = rides.reduce((sum, r) => sum + (r.cost || 0), 0);
    const pendentesAcesso = accessRequests.filter(r => r.status === "PENDENTE").length;
    const totalExcecoes = rides.filter(r => r.policyFlag).length;
    const totalConformes = totalCorridas - totalExcecoes;
    const totalCorrecoes = 1; // Ajuste pendente de centro de custo (RID-5501)

    setText("kpi-mob-usuarios", usuariosAtivos);
    setText("kpi-mob-corridas", totalCorridas);
    setText("kpi-mob-gasto", `R$ ${gastoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} sim.`);
    setText("kpi-mob-acessos", `${pendentesAcesso} pendente`);
    setText("kpi-mob-excecoes", `${totalExcecoes} demonstrativa`);
    setText("kpi-mob-correcoes", `${totalCorrecoes} pendente`);

    setText("mob-total-side", `R$ ${gastoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} sim.`);
    const conformityRate = totalCorridas > 0 ? ((totalConformes / totalCorridas) * 100).toFixed(1) : 100;
    setText("mob-conformity-rate", `${conformityRate}% conforme`);
    setText("mob-conform-count", `${totalConformes} corrida${totalConformes === 1 ? '' : 's'}`);
    setText("mob-exception-count", `${totalExcecoes} corrida${totalExcecoes === 1 ? '' : 's'}`);

    // 2. Tabela de Corridas Recentes
    const tbody = document.getElementById("rides-tbody");
    const tableFooter = document.getElementById("rides-table-footer");
    if (tbody) {
      tbody.innerHTML = "";
      if (rides.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">Nenhuma corrida registrada neste cenário demonstrativo.</td></tr>`;
      } else {
        rides.forEach(ride => {
          const isException = ride.policyFlag;
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong>${escapeHTML(ride.id)}</strong></td>
            <td>${escapeHTML(ride.passenger)}</td>
            <td>${escapeHTML(ride.date)}</td>
            <td>
              <div style="font-weight: 600; color: var(--text-primary);">${escapeHTML(ride.origin)} ➔ ${escapeHTML(ride.destination)}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${escapeHTML(ride.provider || 'Uber for Business')}</div>
            </td>
            <td>${escapeHTML(ride.costCenter || 'CC-DEMO-01')}</td>
            <td>R$ ${ride.cost.toFixed(2)}</td>
            <td>
              ${isException
                ? '<span class="status-badge status-REJEITADO" style="font-size: 0.7rem;">⚠️ Exceção demonstrativa</span>'
                : '<span class="status-badge status-APROVADO" style="font-size: 0.7rem;">✅ Conforme</span>'}
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      if (tableFooter) {
        tableFooter.textContent = `Exibindo todas as ${rides.length} corridas recentes (simuladas para validação)`;
      }
      installOperationalFilters(tbody, {
        label: "mobilidade",
        filters: [
          { label: "Fornecedor", options: [...new Set(rides.map(item => item.provider).filter(Boolean))], value: row => row.cells[3].querySelector("div:last-child")?.textContent.trim() || "" },
          { label: "Política", options: ["Conforme", "Exceção"], value: row => row.cells[6].textContent.includes("Exceção") ? "Exceção" : "Conforme" }
        ]
      });
    }

    // 3. Tabela de Acessos e Ajustes de Limite
    const accessTbody = document.getElementById("mobility-access-tbody");
    if (accessTbody) {
      accessTbody.innerHTML = "";
      if (accessRequests.length === 0) {
        accessTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 16px; color: var(--text-muted);">Nenhuma solicitação pendente neste cenário demonstrativo.</td></tr>`;
      } else {
        accessRequests.forEach(req => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong>${escapeHTML(req.id)}</strong></td>
            <td>${escapeHTML(req.requester)}</td>
            <td><span class="status-badge status-APROVADO" style="font-size: 0.65rem;">${escapeHTML(req.role)}</span></td>
            <td><strong>${escapeHTML(req.limitRequested)}</strong></td>
            <td><span class="status-badge status-${req.status === 'PENDENTE' ? 'PENDENTE_APROVACAO' : 'APROVADO'}">${escapeHTML(req.status)}</span></td>
            <td style="text-align: right;">
              <a href="aprovacoes.html" class="btn btn-secondary btn-sm" style="padding: 3px 8px; font-size: 0.8rem;">Ver Parecer</a>
            </td>
          `;
          accessTbody.appendChild(tr);
        });
      }
    }
  }

  // --- CORREIOS ---
  async function renderCorreiosList(data) {
    let shipments = data.postalShipments || [];
    let mailReqs = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getCorreios();
        mailReqs = result.data || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            mailReqs = (data.requests || []).filter(r => r.serviceType === "correios");
          } else {
            showApiError("Correios", classified.message);
            return;
          }
        } else {
          showApiError("Correios", classified.message);
          return;
        }
      }
    } else {
      mailReqs = (data.requests || []).filter(r => r.serviceType === "correios");
    }

    // 1. Cálculos dos 6 KPIs de Correios e Envios
    const totalShipments = shipments.length;
    const emTransito = shipments.filter(s => s.status === "EM_TRANSITO").length;
    const entregues = shipments.filter(s => s.status === "ENTREGUE").length;
    const pendentes = shipments.filter(s => s.status === "PENDENTE" || s.status === "AGUARDANDO_POSTAGEM").length;
    const rastreamentosAtivos = shipments.filter(s => s.trackingCode && s.trackingCode.startsWith("BR-DEMO")).length;
    const custoTotal = shipments.reduce((sum, s) => sum + (s.cost || 0), 0);

    setText("kpi-cor-total", totalShipments);
    setText("kpi-cor-transito", emTransito);
    setText("kpi-cor-entregues", entregues);
    setText("kpi-cor-pendentes", `${pendentes} pendência`);
    setText("kpi-cor-rastreamentos", `${rastreamentosAtivos} ativos`);
    setText("kpi-cor-custo", `R$ ${custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} sim.`);
    setText("cor-total-side", `R$ ${custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} sim.`);

    // 2. Tabela de Postagens Recentes
    const tbody = document.getElementById("correios-tbody");
    const tableFooter = document.getElementById("correios-table-footer");
    if (tbody) {
      tbody.innerHTML = "";
      if (shipments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">Nenhuma postagem encontrada neste cenário demonstrativo.</td></tr>`;
      } else {
        shipments.forEach(m => {
          const isPending = m.status === "PENDENTE";
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong>${escapeHTML(m.id)}</strong></td>
            <td>
              <div style="font-weight: 600; color: var(--text-primary);">${escapeHTML(m.description)}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${escapeHTML(m.date)}</div>
            </td>
            <td>${escapeHTML(m.recipient)}</td>
            <td><span class="status-badge status-${m.modality === 'SEDEX 10' ? 'REJEITADO' : 'APROVADO'}" style="font-size: 0.65rem;">${escapeHTML(m.modality)}</span></td>
            <td><span style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHTML(m.usageType)}</span></td>
            <td><button type="button" class="btn-tracking-code" data-code="${escapeHTML(m.trackingCode)}" data-desc="${escapeHTML(m.description)}" data-status="${escapeHTML(m.status)}" data-recipient="${escapeHTML(m.recipient)}" data-modality="${escapeHTML(m.modality)}" style="background: var(--surface-muted); border: 1px solid var(--border); border-radius: var(--radius-xs); padding: 2px 6px; font-family: monospace; font-size: 0.75rem; cursor: pointer; color: var(--accent); font-weight: 600;">${escapeHTML(m.trackingCode)} 🔍</button></td>
            <td><span class="status-badge status-${m.status === 'ENTREGUE' ? 'CONCLUIDO' : (isPending ? 'PENDENTE_APROVACAO' : 'EM_ATENDIMENTO')}">${formatStatus(m.status)}</span></td>
          `;
          tbody.appendChild(tr);
        });
      }

      if (tableFooter) {
        tableFooter.textContent = `Exibindo todas as ${shipments.length} postagens registradas (simuladas para validação)`;
      }
      installOperationalFilters(tbody, {
        label: "postagens",
        filters: [
          { label: "Status", options: [...new Set(shipments.map(item => item.status))], value: row => shipments.find(item => item.id === row.cells[0].textContent.trim())?.status || "" },
          { label: "Modalidade", options: [...new Set(shipments.map(item => item.modality))], value: row => row.cells[3].textContent.trim() }
        ]
      });
    }

    // 3. Painel de Rastreamentos Ativos
    const trackingContainer = document.getElementById("tracking-active-cards");
    if (trackingContainer) {
      trackingContainer.innerHTML = "";
      const activeTracking = shipments.filter(s => s.trackingCode);
      if (activeTracking.length === 0) {
        trackingContainer.innerHTML = `
          <div style="text-align: center; padding: 16px; color: var(--text-muted); font-size: var(--font-xs);">
            Nenhum rastreamento ativo.
          </div>
        `;
      } else {
        activeTracking.forEach(t => {
          const card = document.createElement("div");
          card.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: var(--surface-muted); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: var(--font-xs); cursor: pointer;";
          card.title = "Clique para ver histórico de rastreamento completo";
          card.innerHTML = `
            <div>
              <div style="font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                <span>🚚</span>
                <span style="color: var(--accent);">${escapeHTML(t.trackingCode)}</span>
                <span style="font-size: 0.65rem; color: var(--text-muted);">(${escapeHTML(t.modality)})</span>
              </div>
              <div style="color: var(--text-secondary); font-size: 0.7rem; margin-top: 2px;">${escapeHTML(t.lastUpdate || 'Em triagem no CEE')}</div>
            </div>
            <div style="text-align: right;">
              <span class="status-badge status-${t.status === 'ENTREGUE' ? 'CONCLUIDO' : 'EM_ATENDIMENTO'}" style="font-size: 0.6rem; padding: 1px 6px;">${escapeHTML(t.eta || (t.status === 'ENTREGUE' ? 'Entregue' : 'Previsão 24h'))}</span>
            </div>
          `;
          card.onclick = () => openTrackingModal(t);
          trackingContainer.appendChild(card);
        });
      }
    }

    // Modal de Rastreamento
    function openTrackingModal(item) {
      const modal = document.getElementById("modal-tracking-detail");
      const body = document.getElementById("modal-tracking-body");
      if (!modal || !body) return;

      const isDelivered = item.status === "ENTREGUE";
      const isSedex10 = item.modality === "SEDEX 10";

      body.innerHTML = `
        <div style="background: var(--surface-muted); padding: 12px 16px; border-radius: var(--radius-sm); display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem;">
          <div><strong style="color: var(--text-muted);">Código:</strong> <span style="font-family: monospace; font-weight: 700; color: var(--accent);">${escapeHTML(item.trackingCode)}</span></div>
          <div><strong style="color: var(--text-muted);">Modalidade:</strong> <span class="status-badge ${isSedex10 ? 'status-REJEITADO' : 'status-APROVADO'}" style="font-size: 0.65rem;">${escapeHTML(item.modality)}</span></div>
          <div><strong style="color: var(--text-muted);">Destinatário:</strong> ${escapeHTML(item.recipient)}</div>
          <div><strong style="color: var(--text-muted);">Status:</strong> <span class="status-badge status-${isDelivered ? 'CONCLUIDO' : 'EM_ATENDIMENTO'}">${formatStatus(item.status)}</span></div>
        </div>

        <div style="margin-top: 8px;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">Histórico de Movimentação</h4>
          <div style="display: flex; flex-direction: column; gap: 14px; padding-left: 8px; border-left: 2px solid var(--accent); margin-left: 8px;">
            <div style="position: relative; padding-left: 12px;">
              <span style="position: absolute; left: -18px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: ${isDelivered ? 'var(--success)' : 'var(--accent)'}; border: 2px solid var(--surface);"></span>
              <div style="font-weight: 700; font-size: 0.8rem; color: var(--text-primary);">${isDelivered ? '✅ Objeto Entregue ao Destinatário' : '🚚 Objeto em Trânsito'}</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">${escapeHTML(item.lastUpdate || 'Centro de Tratamento e Distribuição')}</div>
              <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">Hoje, 09:40</div>
            </div>
            <div style="position: relative; padding-left: 12px;">
              <span style="position: absolute; left: -18px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); border: 2px solid var(--surface);"></span>
              <div style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary);">Encaminhado para Centro Operacional</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">CTE São Paulo ➔ CDD Regional</div>
              <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">Ontem, 18:20</div>
            </div>
            <div style="position: relative; padding-left: 12px;">
              <span style="position: absolute; left: -18px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); border: 2px solid var(--surface);"></span>
              <div style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary);">Objeto Postado na Agência Hospital Sírio-Libanês</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">Postagem com protocolo de faturamento institucional</div>
              <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">${escapeHTML(item.date)}</div>
            </div>
          </div>
        </div>
      `;

      modal.style.display = "flex";
    }

    document.querySelectorAll(".btn-tracking-code").forEach(btn => {
      btn.onclick = () => {
        const item = {
          trackingCode: btn.getAttribute("data-code"),
          description: btn.getAttribute("data-desc"),
          status: btn.getAttribute("data-status"),
          recipient: btn.getAttribute("data-recipient"),
          modality: btn.getAttribute("data-modality"),
          date: "06/08/2026",
          lastUpdate: "Em rota de entrega final ao destinatário"
        };
        openTrackingModal(item);
      };
    });

    const closeBtn = document.getElementById("btn-close-tracking-modal");
    const closeBtnFooter = document.getElementById("btn-close-tracking-footer");
    if (closeBtn) closeBtn.onclick = () => { const m = document.getElementById("modal-tracking-detail"); if (m) m.style.display = "none"; };
    if (closeBtnFooter) closeBtnFooter.onclick = () => { const m = document.getElementById("modal-tracking-detail"); if (m) m.style.display = "none"; };
  }

  // --- XEROX ---
  async function renderXeroxList(data) {
    let jobs = data.printJobs || [];
    let printReqs = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getXeroxJobs();
        printReqs = result.data || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            printReqs = (data.requests || []).filter(r => r.serviceType === "xerox");
          } else {
            showApiError("Xerox", classified.message);
            return;
          }
        } else {
          showApiError("Xerox", classified.message);
          return;
        }
      }
    } else {
      printReqs = (data.requests || []).filter(r => r.serviceType === "xerox");
    }

    // 1. Cálculos dos 6 KPIs de Xerox e Impressões
    const totalJobs = jobs.length;
    const emProducao = jobs.filter(j => j.status === "EM_PRODUCAO" || j.status === "EM_ATENDIMENTO").length;
    const aguardando = jobs.filter(j => j.status === "PENDENTE" || j.status === "AGUARDANDO_ATENDIMENTO").length;
    const concluidas = jobs.filter(j => j.status === "CONCLUIDO").length;
    const pendentes = jobs.filter(j => j.status === "PENDENTE").length;
    const volumePaginas = jobs.reduce((sum, j) => sum + (j.pages || (j.copies ? j.copies * 3 : 50)), 0);

    setText("kpi-xer-total", totalJobs);
    setText("kpi-xer-producao", emProducao);
    setText("kpi-xer-aguardando", aguardando);
    setText("kpi-xer-concluidas", concluidas);
    setText("kpi-xer-pendentes", `${pendentes} pendente`);
    setText("kpi-xer-volume", `${volumePaginas} pág. sim.`);

    // 2. Renderizar Cards da Fila de Produção Ativa
    const activeCardsContainer = document.getElementById("xerox-active-cards");
    const queueCounter = document.getElementById("xerox-queue-counter");
    if (activeCardsContainer) {
      activeCardsContainer.innerHTML = "";
      const activeJobs = jobs.filter(j => j.status === "EM_PRODUCAO" || j.status === "PENDENTE");

      if (queueCounter) {
        queueCounter.textContent = `${activeJobs.length} job(s) em fila operacional`;
      }

      if (activeJobs.length === 0) {
        activeCardsContainer.innerHTML = `
          <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: var(--font-sm);">
            Nenhum job em produção neste cenário demonstrativo.
          </div>
        `;
      } else {
        activeJobs.forEach(j => {
          const isPending = j.status === "PENDENTE";
          const card = document.createElement("div");
          card.className = "trip-card";
          card.innerHTML = `
            <div class="trip-header">
              <div class="trip-route">
                <span>🖨️</span>
                <span>${escapeHTML(j.id)} • ${escapeHTML(j.title)}</span>
              </div>
              <span class="status-badge status-${isPending ? 'PENDENTE_APROVACAO' : 'EM_ATENDIMENTO'}">${isPending ? 'Aguardando Fila' : 'Em Produção'}</span>
            </div>
            <div class="trip-meta-row">
              <div class="trip-meta-item">
                <span>Formato & Cor</span>
                <strong style="color: var(--text-primary);">${escapeHTML(j.format)} • ${escapeHTML(j.colorMode)}</strong>
              </div>
              <div class="trip-meta-item">
                <span>Tiragem / Cópias</span>
                <span>${escapeHTML(j.copies)} cópias (${escapeHTML(j.pages)} págs)</span>
              </div>
              <div class="trip-meta-item">
                <span>Acabamento</span>
                <span>${escapeHTML(j.finishing)}</span>
              </div>
              <div class="trip-meta-item" style="text-align: right; justify-content: center;">
                <span class="status-badge status-APROVADO" style="font-size: 0.7rem; padding: 2px 6px;">Prioridade ${escapeHTML(j.priority)}</span>
              </div>
            </div>
          `;
          activeCardsContainer.appendChild(card);
        });
      }
    }

    // 3. Renderizar Tabela de Histórico e Jobs Recentes
    const tbody = document.getElementById("xerox-tbody");
    const tableFooter = document.getElementById("xerox-table-footer");
    if (tbody) {
      tbody.innerHTML = "";
      if (jobs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">Nenhum job gráfico registrado neste cenário demonstrativo.</td></tr>`;
      } else {
        jobs.forEach(x => {
          const isPending = x.status === "PENDENTE";
          const isDone = x.status === "CONCLUIDO";
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong>${escapeHTML(x.id)}</strong></td>
            <td>
              <div style="font-weight: 600; color: var(--text-primary);">${escapeHTML(x.title)}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${escapeHTML(x.requester)} • ${escapeHTML(x.date)}</div>
            </td>
            <td><span class="status-badge status-APROVADO" style="font-size: 0.65rem;">${escapeHTML(x.format)}</span></td>
            <td><span style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHTML(x.colorMode)}</span></td>
            <td><strong>${escapeHTML(x.copies)} ex.</strong></td>
            <td><span style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHTML(x.finishing)}</span></td>
            <td><span class="status-badge status-${isDone ? 'CONCLUIDO' : (isPending ? 'PENDENTE_APROVACAO' : 'EM_ATENDIMENTO')}">${isDone ? 'Pronto p/ Retirada' : (isPending ? 'Aguardando' : 'Em Produção')}</span></td>
          `;
          tbody.appendChild(tr);
        });
      }

      if (tableFooter) {
        tableFooter.textContent = `Exibindo todos os ${jobs.length} jobs gráficos registrados (simulados para validação)`;
      }
      installOperationalFilters(tbody, {
        label: "jobs gráficos",
        filters: [
          { label: "Status", options: [...new Set(jobs.map(item => item.status))], value: row => jobs.find(item => item.id === row.cells[0].textContent.trim())?.status || "" },
          { label: "Formato", options: [...new Set(jobs.map(item => item.format))], value: row => row.cells[2].textContent.trim() }
        ]
      });
    }
  }

  // --- CHATBOT ---
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
        sourceSpan.textContent = `📌 Fonte Demonstrativa: ${sourceDoc}`;
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
        if (match && match.sourceType === "INSTITUCIONAL" && match.status === "VIGENTE") {
          appendMessage("bot", match.content, `${match.docRef} (Atualizado em ${match.updatedAt})`);
        } else {
          appendMessage("bot", "Não encontrei uma orientação institucional cadastrada para este caso. Consulte a política oficial ou a Central de Serviços.", null);
        }
      }, 300);
    }

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
    chatInput.addEventListener("keypress", (e) => { if (e.key === "Enter") handleUserQuestion(); });
  }

  // --- FORNECEDORES ---
  async function renderFornecedoresList(data) {
    let suppliers = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getSuppliers();
        suppliers = result.data || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            suppliers = data.suppliers || [];
          } else {
            showApiError("Fornecedores", classified.message);
            return;
          }
        } else {
          showApiError("Fornecedores", classified.message);
          return;
        }
      }
    } else {
      suppliers = data.suppliers || [];
    }

    const tbody = document.getElementById("fornecedores-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    suppliers.forEach(sup => {
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

  // --- ATENDIMENTOS ---
  async function renderAtendimentosList(data) {
    const tbody = document.getElementById("atendimentos-tbody");
    if (!tbody) return;

    const currentRole = getActiveRole();
    const authContext = getAuthorizationContext();
    const isOperational = authContext.role === "AGENTE_SERVICO" || authContext.role === "ADMINISTRADOR";

    // 1. Atualizar RBAC e título
    const rbacBadge = document.getElementById("atend-rbac-badge");
    const rbacHint = document.getElementById("atend-rbac-hint");
    const pageTitle = document.getElementById("atend-page-title");
    const pageSubtitle = document.getElementById("atend-page-subtitle");
    const queueTitle = document.getElementById("atend-queue-title");
    const thSolicitante = document.getElementById("th-solicitante");
    const btnNovoChamado = document.getElementById("btn-novo-chamado");

    // Perfis que podem criar chamados
    const canCreate = authContext.role === "COLABORADOR" || authContext.role === "ADMINISTRADOR";
    // Perfis que podem resolver
    const canResolve = authContext.role === "AGENTE_SERVICO" || authContext.role === "ADMINISTRADOR";

    if (btnNovoChamado) {
      btnNovoChamado.style.display = canCreate ? "inline-flex" : "none";
      btnNovoChamado.onclick = () => openNovoChamadoModal(data);
    }

    if (isOperational) {
      if (pageTitle) pageTitle.textContent = authContext.role === "ADMINISTRADOR" ? "Operação — Visão Administrativa" : "Minha Operação";
      if (pageSubtitle) pageSubtitle.textContent = "Solicitações, triagem, aceite, atendimento, SLA e alertas das suas verticais.";
      if (queueTitle) queueTitle.textContent = "📋 Fila de Atendimento";
      if (rbacBadge) { rbacBadge.textContent = authContext.role === "ADMINISTRADOR" ? "Administrador · ALL" : "Agente de Serviço"; rbacBadge.className = "badge-demo"; }
      if (rbacHint) rbacHint.innerHTML = ` — Verticais autorizadas: <strong>${authContext.serviceScopes.join(", ")}</strong>.`;
      if (thSolicitante) thSolicitante.style.display = authContext.role === "ADMINISTRADOR" ? "" : "none";
    } else {
      if (pageTitle) pageTitle.textContent = "Meus Atendimentos";
      if (pageSubtitle) pageSubtitle.textContent = "Acompanhe dúvidas, solicitações de suporte e chamados em andamento.";
      if (queueTitle) queueTitle.textContent = "📋 Meus Chamados";
      if (rbacBadge) { rbacBadge.textContent = "Perfil: Colaborador"; rbacBadge.className = "status-badge status-PENDENTE_APROVACAO"; }
      if (rbacHint) rbacHint.innerHTML = " — Visualizando chamados do <strong>cenário demonstrativo</strong>. Em produção, apenas seus chamados.";
      if (thSolicitante) thSolicitante.style.display = "none";
    }

    // 2. Buscar tickets
    let allTickets = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getTickets();
        allTickets = result.data || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            allTickets = data.tickets || [];
          } else {
            showApiError("Atendimentos", classified.message);
            return;
          }
        } else {
          showApiError("Atendimentos", classified.message);
          return;
        }
      }
    } else {
      allTickets = data.tickets || [];
    }

    if (authContext.role === "AGENTE_SERVICO" && !authContext.serviceScopes.includes("ALL")) {
      const categoryScope = { Viagens: "viagens", Mobilidade: "mobilidade", Transporte: "transportes", Correios: "correios", Entregas: "entregas", Xerox: "xerox" };
      allTickets = allTickets.filter(ticket => authContext.serviceScopes.includes(categoryScope[ticket.category]));
    }

    // 3. Calcular KPIs (fonte única: allTickets)
    const total = allTickets.length;
    const emAberto = allTickets.filter(t => t.status === "EM_ABERTO").length;
    const emAtendimento = allTickets.filter(t => t.status === "EM_ATENDIMENTO").length;
    const resolvidos = allTickets.filter(t => t.status === "RESOLVIDO").length;
    const altaPri = allTickets.filter(t => t.priority === "Alta" || t.priority === "Urgente").length;

    // KPI labels dinâmicos
    const kpiLabel1 = document.getElementById("kpi-atend-label-1");
    const kpiLabel2 = document.getElementById("kpi-atend-label-2");
    if (kpiLabel1) kpiLabel1.textContent = isOperational ? "Total Chamados" : "Meus Chamados";
    if (kpiLabel2) kpiLabel2.textContent = "Em Aberto";

    setText("kpi-atend-1", total);
    setText("kpi-atend-2", emAberto);
    setText("kpi-atend-3", emAtendimento);
    setText("kpi-atend-4", resolvidos);
    setText("kpi-atend-5", altaPri);
    setText("kpi-atend-6", "3h sim.");

    // 4. Distribuição por frente (fonte única)
    const catViagens = allTickets.filter(t => t.category === "Viagens").length;
    const catMobilidade = allTickets.filter(t => t.category === "Mobilidade").length;
    const catCorreios = allTickets.filter(t => t.category === "Correios").length;
    const catXerox = allTickets.filter(t => t.category === "Xerox").length;

    const pctV = total > 0 ? ((catViagens / total) * 100).toFixed(0) : 0;
    const pctM = total > 0 ? ((catMobilidade / total) * 100).toFixed(0) : 0;
    const pctC = total > 0 ? ((catCorreios / total) * 100).toFixed(0) : 0;
    const pctX = total > 0 ? ((catXerox / total) * 100).toFixed(0) : 0;

    setText("cat-viagens", `${catViagens} (${pctV}%)`);
    setText("cat-mobilidade", `${catMobilidade} (${pctM}%)`);
    setText("cat-correios", `${catCorreios} (${pctC}%)`);
    setText("cat-xerox", `${catXerox} (${pctX}%)`);

    const barV = document.getElementById("bar-viagens");
    const barM = document.getElementById("bar-mobilidade");
    const barC = document.getElementById("bar-correios");
    const barX = document.getElementById("bar-xerox");
    if (barV) barV.style.width = `${pctV}%`;
    if (barM) barM.style.width = `${pctM}%`;
    if (barC) barC.style.width = `${pctC}%`;
    if (barX) barX.style.width = `${pctX}%`;

    // 5. Prioridades
    const priUrgente = allTickets.filter(t => t.priority === "Urgente").length;
    const priAlta = allTickets.filter(t => t.priority === "Alta").length;
    const priMedia = allTickets.filter(t => t.priority === "Média").length;
    const priBaixa = allTickets.filter(t => t.priority === "Baixa").length;

    setText("pri-urgente", priUrgente);
    setText("pri-alta", priAlta);
    setText("pri-media", priMedia);
    setText("pri-baixa", priBaixa);

    // 6. Escalonamentos (chamados com prioridade Alta/Urgente em aberto)
    const escalContainer = document.getElementById("escal-container");
    const escalBadge = document.getElementById("escal-count-badge");
    if (escalContainer) {
      escalContainer.innerHTML = "";
      const escalados = allTickets.filter(t => (t.priority === "Alta" || t.priority === "Urgente") && t.status === "EM_ABERTO");

      if (escalBadge) escalBadge.textContent = escalados.length;

      if (escalados.length === 0) {
        escalContainer.innerHTML = `
          <div style="text-align: center; padding: 12px; color: var(--text-muted); font-size: var(--font-xs);">
            Nenhum escalonamento pendente.
          </div>
        `;
      } else {
        escalados.forEach(t => {
          const created = new Date(t.createdAt);
          const now = new Date();
          const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
          const waitTime = diffDays > 0 ? `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}` : "Hoje";

          const item = document.createElement("div");
          item.style.cssText = "display: flex; gap: 10px; padding: 10px; background: var(--surface-muted); border: 1px solid var(--border); border-radius: var(--radius-sm);";
          item.innerHTML = `
            <span style="font-size: 1.1rem;">${t.priority === 'Urgente' ? '🚨' : '⚠️'}</span>
            <div style="flex: 1;">
              <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${escapeHTML(t.id)} — ${escapeHTML(t.title)}</div>
              <div style="color: var(--text-secondary); font-size: 0.65rem;">${escapeHTML(t.category)} • ${waitTime}</div>
              <span class="status-badge ${t.priority === 'Urgente' ? 'status-PENDENTE_APROVACAO' : 'status-EM_ATENDIMENTO'}" style="font-size: 0.6rem; margin-top: 4px;">Prioridade ${escapeHTML(t.priority)}</span>
            </div>
          `;
          escalContainer.appendChild(item);
        });
      }
    }

    // 7. Renderizar tabela com filtros
    function renderTableRows(items) {
      tbody.innerHTML = "";
      const tableFooter = document.getElementById("atend-table-footer");
      const queueCounter = document.getElementById("atend-queue-counter");

      if (queueCounter) queueCounter.textContent = `${items.length} chamado(s)`;

      if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 32px; color: var(--text-muted);">
          <div style="font-size: 1.5rem; margin-bottom: 8px;">📭</div>
          <div style="font-weight: 600; color: var(--text-secondary);">Nenhum chamado encontrado</div>
          <div style="font-size: 0.75rem; margin-top: 4px;">Com os filtros selecionados ou nenhum chamado registrado.</div>
        </td></tr>`;
      } else {
        items.forEach(t => {
          const created = new Date(t.updatedAt || t.createdAt);
          const now = new Date();
          const diffMs = now - created;
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          let waitTime = "";
          if (diffDays > 0) waitTime = `Há ${diffDays}d`;
          else if (diffHours > 0) waitTime = `Há ${diffHours}h`;
          else waitTime = "Hoje";

          const statusClass = t.status === "RESOLVIDO" ? "status-CONCLUIDO" : (t.status === "EM_ATENDIMENTO" ? "status-EM_ATENDIMENTO" : "status-PENDENTE_APROVACAO");
          const statusLabel = t.status === "RESOLVIDO" ? "Resolvido" : (t.status === "EM_ATENDIMENTO" ? "Em Atendimento" : "Em Aberto");

          const priClass = t.priority === "Urgente" ? "status-PENDENTE_APROVACAO" : (t.priority === "Alta" ? "status-EM_ATENDIMENTO" : (t.priority === "Média" ? "status-EM_ATENDIMENTO" : "status-APROVADO"));

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong>${escapeHTML(t.id)}</strong></td>
            <td><div class="request-title-cell" title="${escapeHTML(t.title)}">${escapeHTML(t.title)}</div></td>
            ${authContext.role === "ADMINISTRADOR" ? `<td>${escapeHTML(t.requester)}</td>` : ''}
            <td>${escapeHTML(t.category)}</td>
            <td><span class="status-badge ${priClass}" style="font-size: 0.65rem;">${escapeHTML(t.priority)}</span></td>
            <td><span style="font-size: 0.75rem; color: var(--text-secondary);">${waitTime}</span></td>
            <td><span class="status-badge ${statusClass}" style="font-size: 0.65rem;">${statusLabel}</span></td>
            <td style="text-align: right; white-space: nowrap;">
              <button class="btn btn-secondary btn-sm btn-view-ticket" data-id="${t.id}" style="padding: 3px 8px; font-size: 0.75rem;">Ver Detalhes</button>
              ${canResolve && t.status !== "RESOLVIDO" ? `<button class="btn btn-success btn-sm btn-resolve-ticket" data-id="${t.id}" style="padding: 3px 8px; font-size: 0.75rem;">Resolver</button>` : ''}
            </td>
          `;
          [...tr.children].forEach((cell, index) => { if (index !== 1) cell.style.whiteSpace = "nowrap"; });
          tbody.appendChild(tr);
        });
      }

      if (tableFooter) {
        tableFooter.textContent = items.length === total
          ? `Exibindo todos os ${items.length} chamados`
          : `Exibindo ${items.length} de ${total} chamados filtrados`;
      }

      // Eventos de ação
      document.querySelectorAll(".btn-view-ticket").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          openTicketDetailModal(allTickets.find(t => t.id === id));
        });
      });

      if (canResolve) {
        document.querySelectorAll(".btn-resolve-ticket").forEach(btn => {
          btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            const t = allTickets.find(t => t.id === id);
            if (t && confirm(`Resolver o chamado ${id}?\n\n${t.title}`)) {
              await handleResolveTicket(data, id);
            }
          });
        });
      }
    }

    renderTableRows(allTickets);

    // Filtros
    const filterStatus = document.getElementById("filter-atend-status");
    const filterCategoria = document.getElementById("filter-atend-categoria");
    const filterPrioridade = document.getElementById("filter-atend-prioridade");

    function applyFilters() {
      let filtered = [...allTickets];
      if (filterStatus && filterStatus.value !== "TODOS") {
        filtered = filtered.filter(t => t.status === filterStatus.value);
      }
      if (filterCategoria && filterCategoria.value !== "TODOS") {
        filtered = filtered.filter(t => t.category === filterCategoria.value);
      }
      if (filterPrioridade && filterPrioridade.value !== "TODOS") {
        filtered = filtered.filter(t => t.priority === filterPrioridade.value);
      }
      renderTableRows(filtered);
    }

    if (filterStatus) filterStatus.onchange = applyFilters;
    if (filterCategoria) filterCategoria.onchange = applyFilters;
    if (filterPrioridade) filterPrioridade.onchange = applyFilters;

    // 8. Atividade recente
    const activityList = document.getElementById("atend-activity-list");
    if (activityList) {
      activityList.innerHTML = "";
      const recentTickets = [...allTickets].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5);

      if (recentTickets.length === 0) {
        activityList.innerHTML = `<div style="text-align: center; padding: 16px; color: var(--text-muted); font-size: var(--font-xs);">Nenhuma atividade recente.</div>`;
      } else {
        recentTickets.forEach(t => {
          const statusIcon = t.status === "RESOLVIDO" ? "✅" : (t.status === "EM_ATENDIMENTO" ? "⚙️" : "📬");
          const statusLabel = t.status === "RESOLVIDO" ? "Resolvido" : (t.status === "EM_ATENDIMENTO" ? "Em atendimento" : "Aberto");

          const item = document.createElement("div");
          item.style.cssText = "display: flex; gap: 10px; padding: 10px 16px; border-bottom: 1px solid var(--border-light);";
          item.innerHTML = `
            <span style="font-size: 1.1rem;">${statusIcon}</span>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary);">${escapeHTML(t.id)} — ${escapeHTML(t.title)}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${escapeHTML(t.category)} • ${statusLabel} • ${escapeHTML(t.updatedAt || t.createdAt)}</div>
            </div>
          `;
          activityList.appendChild(item);
        });
      }
    }
  }

  // Modal de Detalhes do Chamado
  function openTicketDetailModal(ticket) {
    if (!ticket) return;
    const modal = document.getElementById("modal-ticket-detail");
    const content = document.getElementById("modal-ticket-detail-content");
    if (!modal || !content) return;

    const statusClass = ticket.status === "RESOLVIDO" ? "status-CONCLUIDO" : (ticket.status === "EM_ATENDIMENTO" ? "status-EM_ATENDIMENTO" : "status-PENDENTE_APROVACAO");
    const statusLabel = ticket.status === "RESOLVIDO" ? "Resolvido" : (ticket.status === "EM_ATENDIMENTO" ? "Em Atendimento" : "Em Aberto");

    let html = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div><strong>ID:</strong> ${escapeHTML(ticket.id)}</div>
        <div><strong>Status:</strong> <span class="status-badge ${statusClass}">${statusLabel}</span></div>
        <div><strong>Solicitante:</strong> ${escapeHTML(ticket.requester)}</div>
        <div><strong>Categoria:</strong> ${escapeHTML(ticket.category)}</div>
        <div><strong>Prioridade:</strong> ${escapeHTML(ticket.priority)}</div>
        <div><strong>Aberto em:</strong> ${escapeHTML(ticket.createdAt)}</div>
      </div>
      <div style="padding: 8px; background: var(--surface-muted); border-radius: var(--radius-sm);">
        <strong>Assunto:</strong>
        <div style="color: var(--text-primary); margin-top: 2px; font-weight: 600;">${escapeHTML(ticket.title)}</div>
      </div>
      <div style="padding: 8px; background: var(--surface-muted); border-radius: var(--radius-sm);">
        <strong>Descrição:</strong>
        <div style="color: var(--text-primary); margin-top: 2px;">${escapeHTML(ticket.description || 'Sem descrição.')}</div>
      </div>
    `;

    if (ticket.assignedTo) {
      html += `<div><strong>Atendente:</strong> ${escapeHTML(ticket.assignedTo)}</div>`;
    }
    if (ticket.resolution) {
      html += `
        <div style="padding: 8px; background: var(--success-bg); border: 1px solid var(--success); border-radius: var(--radius-sm);">
          <strong style="color: var(--success);">Resolução:</strong>
          <div style="color: var(--text-primary); margin-top: 2px;">${escapeHTML(ticket.resolution)}</div>
        </div>
      `;
    }
    if (ticket.updatedAt && ticket.updatedAt !== ticket.createdAt) {
      html += `<div><strong>Última atualização:</strong> ${escapeHTML(ticket.updatedAt)}</div>`;
    }

    content.innerHTML = html;
    modal.style.display = "flex";

    const closeBtn = document.getElementById("btn-close-ticket-detail");
    const closeBtn2 = document.getElementById("btn-close-ticket-detail-2");
    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    if (closeBtn2) closeBtn2.onclick = () => modal.style.display = "none";
  }

  // Modal de Novo Chamado
  function openNovoChamadoModal(data) {
    const modal = document.getElementById("modal-novo-chamado");
    const form = document.getElementById("form-novo-chamado");
    if (!modal || !form) return;

    form.reset();
    modal.style.display = "flex";

    const closeBtn = document.getElementById("btn-close-novo-chamado");
    const cancelBtn = document.getElementById("btn-cancel-novo-chamado");
    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    if (cancelBtn) cancelBtn.onclick = () => modal.style.display = "none";

    form.onsubmit = async (e) => {
      e.preventDefault();
      const title = document.getElementById("ticket-title").value.trim();
      const category = document.getElementById("ticket-category").value;
      const description = document.getElementById("ticket-description").value.trim();
      const priority = document.getElementById("ticket-priority").value;

      if (!title || !category || !description) {
        alert("Preencha todos os campos obrigatórios.");
        return;
      }

      const currentRole = getActiveRole();
      const roleUserMap = {
        colaborador: "Solicitante Exemplo A",
        gestor: "Solicitante Exemplo B",
        viagens: "Operador (Simulado)",
        faturamento: "Faturamento (Simulado)",
        coordenadora: "Coordenadora (Simulado)",
        gerencia: "Gerência (Simulado)",
        financeiro: "Financeiro (Simulado)",
        administrador: "Administrador (Simulado)",
        auditoria: "Auditoria (Simulado)"
      };
      const requesterName = roleUserMap[currentRole] || "Solicitante (Simulado)";

      if (_authState.apiAvailable && _authState.authenticated) {
        try {
          const result = await CS360API.createTicket({ title, requester: requesterName, category, description, priority });
          if (result.success) {
            logAuditEvent("CHAMADO_CRIADO", `Chamado ${result.data.id} criado via API.`);
            alert(`Chamado criado com sucesso!`);
            modal.style.display = "none";
            window.location.reload();
          }
        } catch (err) {
          alert("Erro ao criar chamado: " + err.message);
        }
      } else {
        // Fallback local
        const newId = "TICK-" + Math.floor(100 + Math.random() * 900);
        const newTicket = {
          id: newId,
          title,
          requester: requesterName,
          category,
          status: "EM_ABERTO",
          priority,
          createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          description,
          assignedTo: null,
          resolution: null
        };
        data.tickets.unshift(newTicket);
        saveData(data);
        logAuditEvent("CHAMADO_CRIADO", `Chamado ${newId} criado localmente.`);
        alert(`Chamado ${newId} criado com sucesso!`);
        modal.style.display = "none";
        window.location.reload();
      }
    };
  }

  // Resolver chamado
  async function handleResolveTicket(data, ticketId) {
    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.resolveTicket(ticketId, "Atendente (Simulado)", "Chamado resolvido via portal.");
        if (result.success) {
          logAuditEvent("CHAMADO_RESOLVIDO", `Chamado ${ticketId} resolvido.`);
          alert(`Chamado ${ticketId} resolvido com sucesso!`);
          window.location.reload();
        }
      } catch (err) {
        alert("Erro ao resolver: " + err.message);
      }
    } else {
      const ticket = data.tickets.find(t => t.id === ticketId);
      if (!ticket) return;
      ticket.status = "RESOLVIDO";
      ticket.assignedTo = "Atendente (Simulado)";
      ticket.resolution = "Resolvido via portal demonstrativo.";
      ticket.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
      logAuditEvent("CHAMADO_RESOLVIDO", `Chamado ${ticketId} resolvido.`);
      saveData(data);
      alert(`Chamado ${ticketId} resolvido!`);
      window.location.reload();
    }
  }

  // --- ADMINISTRAÇÃO ---
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

  // --- FINANCEIRO ---
  async function renderFinanceiro(data) {
    const rbacBadge = document.getElementById('fin-rbac-role');
    const activeRole = getActiveRole();

    // RBAC visualization
    if (rbacBadge) {
      rbacBadge.textContent = activeRole;
    }

    // Check RBAC access (collaborator should not see finance)
    const hasAccess = ['financeiro', 'administrador', 'gestor'].includes(activeRole);
    if (!hasAccess) {
      const content = document.getElementById('page-content-slot');
      if (content) {
        content.innerHTML = `
          <div class="dashboard-header">
            <div>
              <h1 style="font-size:1.375rem;font-weight:700;color:var(--text-primary);margin:0;">Financeiro & Consolidação de Custos</h1>
              <p style="font-size:0.8rem;color:var(--text-secondary);margin:2px 0 0 0;">Consolidação de custos e pré-carga demonstrativa para ERP.</p>
            </div>
          </div>
          <div class="panel" style="text-align:center;padding:48px;">
            <div style="font-size:2rem;margin-bottom:12px;">🔒</div>
            <div style="font-size:1rem;font-weight:700;color:var(--text-primary);margin-bottom:4px;">Acesso restrito</div>
            <div style="font-size:0.85rem;color:var(--text-muted);">Seu perfil não possui acesso à visão financeira consolidada.</div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:8px;">Esta funcionalidade está disponível apenas para perfis autorizados, conforme o escopo de acesso definido.</div>
            <div style="margin-top:16px;">
              <a href="solicitacoes.html" class="btn btn-secondary">Voltar para Minhas Solicitações</a>
            </div>
          </div>
        `;
      }
      return;
    }

    // The page-specific script in financeiro.html handles the rest
    // This function only ensures RBAC gate and badge
  }

  // --- RELATÓRIOS ---
  async function renderRelatorios(data) {
    let costCenters = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getCostCenters();
        costCenters = result.data || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            costCenters = data.costCenters || [];
          } else {
            showApiError("Relatórios", classified.message);
            return;
          }
        } else {
          showApiError("Relatórios", classified.message);
          return;
        }
      }
    } else {
      costCenters = data.costCenters || [];
    }

    const totalEst = data.requests.reduce((acc, r) => acc + (r.details && r.details.estimatedCost ? r.details.estimatedCost : 0), 0) +
                     data.mobilityRides.reduce((acc, r) => acc + (r.cost || 0), 0);
    const nonFlownSavings = 450.00;

    setText("report-total-cost", `R$ ${totalEst.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
    setText("report-non-flown-savings", `R$ ${nonFlownSavings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} reutilizados`);

    const chartContainer = document.getElementById("report-cost-by-area-chart");
    if (chartContainer) {
      chartContainer.innerHTML = "";
      const ccCosts = {};
      costCenters.forEach(cc => { ccCosts[cc.name] = cc.totalEstimatedCost || 0; });

      if (Object.values(ccCosts).every(v => v === 0)) {
        data.requests.forEach(r => {
          const ccObj = costCenters.find(c => c.code === r.costCenter);
          const name = ccObj ? ccObj.name : r.costCenter;
          const val = (r.details && r.details.estimatedCost) ? r.details.estimatedCost : 500;
          ccCosts[name] = (ccCosts[name] || 0) + val;
        });
      }

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

  
  // --- 1. TRANSPORTE INTERNO ---
  async function renderTransporteList(data) {
    let jobs = data.internalTransportJobs || [];
    const requests = (data.requests || []).filter(r => r.serviceType === "transporte");

    const total = jobs.length || requests.length;
    const pendentes = jobs.filter(j => j.status === "AGUARDANDO_ACEITE" || j.status === "PENDENTE_APROVACAO").length;
    const execucao = jobs.filter(j => j.status === "EM_EXECUCAO" || j.status === "EM_ATENDIMENTO").length;
    const concluidos = jobs.filter(j => j.status === "CONCLUIDO").length;
    const urgentes = jobs.filter(j => j.priority === "Urgente").length;

    setText("kpi-trp-total", total);
    setText("kpi-trp-pendentes", pendentes);
    setText("kpi-trp-execucao", execucao);
    setText("kpi-trp-concluidos", concluidos);
    setText("kpi-trp-urgentes", urgentes);

    const tbody = document.getElementById("transporte-tbody");
    const footerInfo = document.getElementById("transporte-footer-info");

    function renderRows(items) {
      if (!tbody) return;
      tbody.innerHTML = "";
      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">Nenhum transporte interno encontrado.</td></tr>';
        return;
      }
      items.forEach(j => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${escapeHTML(j.id)}</strong></td>
          <td><span class="status-badge status-APROVADO">${escapeHTML(j.type || 'Pessoa')}</span></td>
          <td>
            <div style="font-weight:600;color:var(--text-primary);">${escapeHTML(j.origin)} ➔ ${escapeHTML(j.destination)}</div>
            <div style="font-size:0.7rem;color:var(--text-secondary);">${escapeHTML(j.specialRequirements || j.patientName || 'Transporte padrão')}</div>
          </td>
          <td><span style="font-size:0.78rem;color:var(--text-secondary);">${escapeHTML(j.scheduledTime || j.date || 'Hoje')}</span></td>
          <td><span class="status-badge ${j.priority === 'Urgente' ? 'status-REJEITADO' : 'status-APROVADO'}">${escapeHTML(j.priority || 'Normal')}</span></td>
          <td><span class="status-badge status-${j.status === 'CONCLUIDO' ? 'CONCLUIDO' : (j.status === 'EM_EXECUCAO' ? 'EM_ATENDIMENTO' : 'PENDENTE_APROVACAO')}">${formatStatus(j.status)}</span></td>
          <td style="text-align:right;">
            <a href="solicitacao-detalhe.html?id=${escapeHTML(j.requestId || j.id)}" class="btn btn-ghost btn-sm">Ver Detalhes →</a>
          </td>
        `;
        tbody.appendChild(tr);
      });
      if (footerInfo) footerInfo.textContent = `Exibindo ${items.length} registros de transporte interno`;
    }

    renderRows(jobs);

    const searchInput = document.getElementById("filter-trp-search");
    const statusSelect = document.getElementById("filter-trp-status");
    const typeSelect = document.getElementById("filter-trp-type");
    const btnClear = document.getElementById("btn-trp-clear");
    const btnExport = document.getElementById("btn-trp-export");

    function applyFilters() {
      const q = (searchInput?.value || "").toLowerCase();
      const st = statusSelect?.value || "ALL";
      const tp = typeSelect?.value || "ALL";

      const filtered = jobs.filter(j => {
        const matchesQ = !q || (j.id && j.id.toLowerCase().includes(q)) ||
          (j.origin && j.origin.toLowerCase().includes(q)) ||
          (j.destination && j.destination.toLowerCase().includes(q)) ||
          (j.patientName && j.patientName.toLowerCase().includes(q));
        const matchesSt = st === "ALL" || j.status === st;
        const matchesTp = tp === "ALL" || j.type === tp;
        return matchesQ && matchesSt && matchesTp;
      });
      renderRows(filtered);
    }

    searchInput?.addEventListener("input", applyFilters);
    statusSelect?.addEventListener("change", applyFilters);
    typeSelect?.addEventListener("change", applyFilters);
    btnClear?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (statusSelect) statusSelect.value = "ALL";
      if (typeSelect) typeSelect.value = "ALL";
      renderRows(jobs);
    });

    btnExport?.addEventListener("click", () => {
      exportTableToCSV(jobs, "transporte_interno.csv", ["id", "type", "origin", "destination", "priority", "status", "scheduledTime"]);
    });
  }

  // --- 2. ESTACIONAMENTO ---
  async function renderEstacionamentoList(data) {
    let records = data.parkingRecords || [];
    const requests = (data.requests || []).filter(r => r.serviceType === "estacionamento");

    const total = records.length || requests.length;
    const autorizadas = records.filter(r => r.status === "AUTORIZADO").length;
    const pendentes = records.filter(r => r.status === "PENDENTE" || r.status === "EM_ANALISE").length;

    setText("kpi-est-total", total);
    setText("kpi-est-autorizadas", autorizadas);
    setText("kpi-est-pendentes", pendentes);

    const tbody = document.getElementById("estacionamento-tbody");
    const footerInfo = document.getElementById("estacionamento-footer-info");

    function renderRows(items) {
      if (!tbody) return;
      tbody.innerHTML = "";
      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">Nenhum registro de estacionamento encontrado.</td></tr>';
        return;
      }
      items.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${escapeHTML(p.id)}</strong></td>
          <td><span class="status-badge status-APROVADO">${escapeHTML(p.requestType)}</span></td>
          <td>
            <div style="font-weight:600;color:var(--text-primary);">${escapeHTML(p.vehicleModel || 'Veículo')} · <span style="font-family:monospace;color:var(--accent);">${escapeHTML(p.vehiclePlate || 'ABC-1234')}</span></div>
            <div style="font-size:0.7rem;color:var(--text-secondary);">Solicitante: ${escapeHTML(p.requesterName || 'Carlos Andrade')}</div>
          </td>
          <td><span style="font-size:0.78rem;color:var(--text-secondary);">${escapeHTML(p.location)}</span></td>
          <td><span style="font-size:0.75rem;color:var(--text-muted);">${escapeHTML(p.validityPeriod || p.date || 'Ativo')}</span></td>
          <td><span class="status-badge status-${p.status === 'AUTORIZADO' ? 'CONCLUIDO' : 'PENDENTE_APROVACAO'}">${formatStatus(p.status)}</span></td>
          <td style="text-align:right;">
            <a href="solicitacao-detalhe.html?id=${escapeHTML(p.requestId || p.id)}" class="btn btn-ghost btn-sm">Ver Detalhes →</a>
          </td>
        `;
        tbody.appendChild(tr);
      });
      if (footerInfo) footerInfo.textContent = `Exibindo ${items.length} registros (demonstrativo sujeito à validação institucional)`;
    }

    renderRows(records);

    const searchInput = document.getElementById("filter-est-search");
    const statusSelect = document.getElementById("filter-est-status");
    const typeSelect = document.getElementById("filter-est-type");
    const btnClear = document.getElementById("btn-est-clear");
    const btnExport = document.getElementById("btn-est-export");

    function applyFilters() {
      const q = (searchInput?.value || "").toLowerCase();
      const st = statusSelect?.value || "ALL";
      const tp = typeSelect?.value || "ALL";

      const filtered = records.filter(p => {
        const matchesQ = !q || (p.id && p.id.toLowerCase().includes(q)) ||
          (p.vehiclePlate && p.vehiclePlate.toLowerCase().includes(q)) ||
          (p.vehicleModel && p.vehicleModel.toLowerCase().includes(q)) ||
          (p.requesterName && p.requesterName.toLowerCase().includes(q));
        const matchesSt = st === "ALL" || p.status === st;
        const matchesTp = tp === "ALL" || p.requestType === tp;
        return matchesQ && matchesSt && matchesTp;
      });
      renderRows(filtered);
    }

    searchInput?.addEventListener("input", applyFilters);
    statusSelect?.addEventListener("change", applyFilters);
    typeSelect?.addEventListener("change", applyFilters);
    btnClear?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (statusSelect) statusSelect.value = "ALL";
      if (typeSelect) typeSelect.value = "ALL";
      renderRows(records);
    });

    btnExport?.addEventListener("click", () => {
      exportTableToCSV(records, "estacionamento.csv", ["id", "requestType", "vehiclePlate", "vehicleModel", "location", "validityPeriod", "status"]);
    });
  }

  // --- 3. ENTREGAS ---
  async function renderEntregasList(data) {
    let deliveries = data.internalDeliveries || [];
    const total = deliveries.length;
    const coleta = deliveries.filter(d => d.status === "AGUARDANDO_COLETA").length;
    const transito = deliveries.filter(d => d.status === "EM_TRANSITO" || d.status === "COLETADO").length;
    const entregues = deliveries.filter(d => d.status === "ENTREGUE").length;
    const urgentes = deliveries.filter(d => d.priority === "Urgente" || d.priority === "Alta").length;

    setText("kpi-ent-total", total);
    setText("kpi-ent-coleta", coleta);
    setText("kpi-ent-transito", transito);
    setText("kpi-ent-entregues", entregues);
    setText("kpi-ent-urgentes", urgentes);

    const tbody = document.getElementById("entregas-tbody");
    const footerInfo = document.getElementById("entregas-footer-info");

    function renderRows(items) {
      if (!tbody) return;
      tbody.innerHTML = "";
      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">Nenhuma entrega encontrada.</td></tr>';
        return;
      }
      items.forEach(d => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${escapeHTML(d.id)}</strong></td>
          <td><span class="status-badge status-APROVADO">${escapeHTML(d.deliveryType || d.type || 'Entrega')}</span></td>
          <td>
            <div style="font-weight:600;color:var(--text-primary);">${escapeHTML(d.origin)} ➔ ${escapeHTML(d.destination)}</div>
            <div style="font-size:0.7rem;color:var(--text-secondary);">${escapeHTML(d.notes || d.itemDescription || 'Sem detalhes')}</div>
          </td>
          <td>
            <div style="font-size:0.78rem;color:var(--text-primary);">De: ${escapeHTML(d.sender)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Para: ${escapeHTML(d.recipient)}</div>
          </td>
          <td><span class="status-badge ${d.priority === 'Urgente' ? 'status-REJEITADO' : (d.priority === 'Alta' ? 'status-PENDENTE_APROVACAO' : 'status-APROVADO')}">${escapeHTML(d.priority)}</span></td>
          <td><span class="status-badge status-${d.status === 'ENTREGUE' ? 'CONCLUIDO' : (d.status === 'EM_TRANSITO' ? 'EM_ATENDIMENTO' : 'PENDENTE_APROVACAO')}">${formatStatus(d.status)}</span></td>
          <td style="text-align:right;">
            <a href="solicitacao-detalhe.html?id=${escapeHTML(d.reqId || d.requestId || d.id)}" class="btn btn-ghost btn-sm">Ver Detalhes →</a>
          </td>
        `;
        tbody.appendChild(tr);
      });
      if (footerInfo) footerInfo.textContent = `Exibindo ${items.length} entregas registradas`;
    }

    renderRows(deliveries);

    const searchInput = document.getElementById("filter-ent-search");
    const statusSelect = document.getElementById("filter-ent-status");
    const typeSelect = document.getElementById("filter-ent-type");
    const btnClear = document.getElementById("btn-ent-clear");
    const btnExport = document.getElementById("btn-ent-export");

    function applyFilters() {
      const q = (searchInput?.value || "").toLowerCase();
      const st = statusSelect?.value || "ALL";
      const tp = typeSelect?.value || "ALL";

      const filtered = deliveries.filter(d => {
        const matchesQ = !q || (d.id && d.id.toLowerCase().includes(q)) ||
          (d.sender && d.sender.toLowerCase().includes(q)) ||
          (d.recipient && d.recipient.toLowerCase().includes(q)) ||
          (d.notes && d.notes.toLowerCase().includes(q));
        const matchesSt = st === "ALL" || d.status === st;
        const matchesTp = tp === "ALL" || (d.deliveryType || d.type) === tp;
        return matchesQ && matchesSt && matchesTp;
      });
      renderRows(filtered);
    }

    searchInput?.addEventListener("input", applyFilters);
    statusSelect?.addEventListener("change", applyFilters);
    typeSelect?.addEventListener("change", applyFilters);
    btnClear?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (statusSelect) statusSelect.value = "ALL";
      if (typeSelect) typeSelect.value = "ALL";
      renderRows(deliveries);
    });

    btnExport?.addEventListener("click", () => {
      exportTableToCSV(deliveries, "entregas.csv", ["id", "deliveryType", "origin", "destination", "sender", "recipient", "priority", "status"]);
    });
  }

  // --- 4. ACHADOS E PERDIDOS ---
  async function renderAchadosPerdidosList(data) {
    let items = data.lostAndFoundItems || [];
    const total = items.length;
    const busca = items.filter(i => i.status === "EM_BUSCA").length;
    const retirada = items.filter(i => i.status === "ITEM_LOCALIZADO" || i.status === "AGUARDANDO_RETIRADA").length;
    const devolvidos = items.filter(i => i.status === "DEVOLVIDO").length;

    setText("kpi-ach-total", total);
    setText("kpi-ach-busca", busca);
    setText("kpi-ach-retirada", retirada);
    setText("kpi-ach-devolvidos", devolvidos);

    const tbody = document.getElementById("achados-tbody");
    const footerInfo = document.getElementById("achados-footer-info");

    function renderRows(list) {
      if (!tbody) return;
      tbody.innerHTML = "";
      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">Nenhum item de achados e perdidos encontrado.</td></tr>';
        return;
      }
      list.forEach(item => {
        const isFound = item.occurrenceType === "ENCONTREI_ITEM";
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${escapeHTML(item.id)}</strong></td>
          <td><span class="status-badge ${isFound ? 'status-CONCLUIDO' : 'status-APROVADO'}">${isFound ? '🟢 Encontrado' : '🔵 Perdido'}</span></td>
          <td><span style="font-size:0.78rem;font-weight:600;">${escapeHTML(item.category)}</span></td>
          <td>
            <div style="font-weight:600;color:var(--text-primary);">${escapeHTML(item.description)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">${escapeHTML(item.custodyLocation || 'Custódia Portaria')}</div>
          </td>
          <td><span style="font-size:0.78rem;color:var(--text-secondary);">${escapeHTML(item.location)} (${escapeHTML(item.date)})</span></td>
          <td><span class="status-badge status-${item.status === 'DEVOLVIDO' ? 'CONCLUIDO' : (item.status === 'ITEM_LOCALIZADO' ? 'APROVADO' : 'PENDENTE_APROVACAO')}">${formatStatus(item.status)}</span></td>
          <td style="text-align:right;">
            <a href="solicitacao-detalhe.html?id=${escapeHTML(item.requestId || item.id)}" class="btn btn-ghost btn-sm">Ver Detalhes →</a>
          </td>
        `;
        tbody.appendChild(tr);
      });
      if (footerInfo) footerInfo.textContent = `Exibindo ${list.length} itens catalogados no inventário`;
    }

    renderRows(items);

    window.CS360_UPDATE_ACHADOS_TABLE = function() {
      applyFilters();
    };

    const searchInput = document.getElementById("filter-ach-search");
    const categorySelect = document.getElementById("filter-ach-category");
    const statusSelect = document.getElementById("filter-ach-status");
    const btnClear = document.getElementById("btn-ach-clear");
    const btnExport = document.getElementById("btn-ach-export");

    function applyFilters() {
      const q = (searchInput?.value || "").toLowerCase();
      const cat = categorySelect?.value || "ALL";
      const st = statusSelect?.value || "ALL";
      const journey = window._activeAchadosJourney || "ALL";

      const filtered = items.filter(item => {
        const matchesQ = !q || (item.id && item.id.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.location && item.location.toLowerCase().includes(q));
        const matchesCat = cat === "ALL" || item.category === cat;
        const matchesSt = st === "ALL" || item.status === st;
        const matchesJourney = journey === "ALL" || item.occurrenceType === journey;
        return matchesQ && matchesCat && matchesSt && matchesJourney;
      });
      renderRows(filtered);
    }

    searchInput?.addEventListener("input", applyFilters);
    categorySelect?.addEventListener("change", applyFilters);
    statusSelect?.addEventListener("change", applyFilters);
    btnClear?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (categorySelect) categorySelect.value = "ALL";
      if (statusSelect) statusSelect.value = "ALL";
      if (typeof window.setAchadosJourneyFilter === "function") window.setAchadosJourneyFilter("ALL");
      renderRows(items);
    });

    btnExport?.addEventListener("click", () => {
      exportTableToCSV(items, "achados_e_perdidos.csv", ["id", "occurrenceType", "category", "description", "location", "date", "status"]);
    });
  }

  // --- 5. SOLICITAÇÃO DE IMAGENS ---
  async function renderImagensList(data) {
    let images = data.imageRequests || [];
    const total = images.length;
    const analise = images.filter(i => i.status === "EM_ANALISE" || i.status === "PENDENTE_APROVACAO").length;
    const autorizadas = images.filter(i => i.status === "AUTORIZADO").length;
    const concluidas = images.filter(i => i.status === "CONCLUIDO").length;

    setText("kpi-img-total", total);
    setText("kpi-img-analise", analise);
    setText("kpi-img-autorizadas", autorizadas);
    setText("kpi-img-concluidas", concluidas);

    const tbody = document.getElementById("imagens-tbody");
    const footerInfo = document.getElementById("imagens-footer-info");

    function renderRows(list) {
      if (!tbody) return;
      tbody.innerHTML = "";
      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">Nenhuma solicitação de imagens encontrada.</td></tr>';
        return;
      }
      list.forEach(img => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${escapeHTML(img.id)}</strong></td>
          <td><span class="status-badge status-APROVADO">${escapeHTML(img.type)}</span></td>
          <td>
            <div style="font-weight:600;color:var(--text-primary);">${escapeHTML(img.purpose)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Solicitante: ${escapeHTML(img.requesterName || 'Carlos Andrade')}</div>
          </td>
          <td>
            <div style="font-size:0.78rem;color:var(--text-secondary);">${escapeHTML(img.sector)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">${escapeHTML(img.period)}</div>
          </td>
          <td><span style="font-size:0.75rem;color:var(--text-secondary);">${escapeHTML(img.securityValidation || 'Em conformidade')}</span></td>
          <td><span class="status-badge status-${img.status === 'CONCLUIDO' ? 'CONCLUIDO' : (img.status === 'AUTORIZADO' ? 'APROVADO' : 'PENDENTE_APROVACAO')}">${formatStatus(img.status)}</span></td>
          <td style="text-align:right;">
            <a href="solicitacao-detalhe.html?id=${escapeHTML(img.requestId || img.id)}" class="btn btn-ghost btn-sm">Ver Detalhes →</a>
          </td>
        `;
        tbody.appendChild(tr);
      });
      if (footerInfo) footerInfo.textContent = `Exibindo ${list.length} solicitações de imagens (demonstrativo CFTV)`;
    }

    renderRows(images);

    const searchInput = document.getElementById("filter-img-search");
    const typeSelect = document.getElementById("filter-img-type");
    const statusSelect = document.getElementById("filter-img-status");
    const btnClear = document.getElementById("btn-img-clear");
    const btnExport = document.getElementById("btn-img-export");

    function applyFilters() {
      const q = (searchInput?.value || "").toLowerCase();
      const tp = typeSelect?.value || "ALL";
      const st = statusSelect?.value || "ALL";

      const filtered = images.filter(img => {
        const matchesQ = !q || (img.id && img.id.toLowerCase().includes(q)) ||
          (img.purpose && img.purpose.toLowerCase().includes(q)) ||
          (img.sector && img.sector.toLowerCase().includes(q)) ||
          (img.requesterName && img.requesterName.toLowerCase().includes(q));
        const matchesTp = tp === "ALL" || img.type === tp;
        const matchesSt = st === "ALL" || img.status === st;
        return matchesQ && matchesTp && matchesSt;
      });
      renderRows(filtered);
    }

    searchInput?.addEventListener("input", applyFilters);
    typeSelect?.addEventListener("change", applyFilters);
    statusSelect?.addEventListener("change", applyFilters);
    btnClear?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (typeSelect) typeSelect.value = "ALL";
      if (statusSelect) statusSelect.value = "ALL";
      renderRows(images);
    });

    btnExport?.addEventListener("click", () => {
      exportTableToCSV(images, "solicitacoes_imagens.csv", ["id", "type", "purpose", "sector", "period", "status"]);
    });
  }

  // --- 6. AUTORIZAÇÕES EXCEPCIONAIS ---
  async function renderAutorizacoesList(data) {
    let auths = data.exceptionalAuthorizations || [];
    const total = auths.length;
    const pendentes = auths.filter(a => a.status === "PENDENTE_APROVACAO").length;
    const aprovadas = auths.filter(a => a.status === "APROVADO" || a.status === "CONCLUIDO").length;

    setText("kpi-exc-total", total);
    setText("kpi-exc-pendentes", pendentes);
    setText("kpi-exc-aprovadas", aprovadas);

    const tbody = document.getElementById("autorizacoes-tbody");
    const footerInfo = document.getElementById("autorizacoes-footer-info");

    function renderRows(list) {
      if (!tbody) return;
      tbody.innerHTML = "";
      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">Nenhuma autorização excepcional encontrada.</td></tr>';
        return;
      }
      list.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${escapeHTML(a.id)}</strong></td>
          <td><span class="status-badge status-APROVADO">${escapeHTML(a.category)}</span></td>
          <td>
            <div style="font-weight:600;color:var(--text-primary);">${escapeHTML(a.reason)}</div>
            <div style="font-size:0.7rem;color:var(--text-secondary);">${escapeHTML(a.justification || 'Justificativa anexada')}</div>
          </td>
          <td>
            <div style="font-size:0.78rem;color:var(--text-primary);">${escapeHTML(a.costCenter || 'Geral')}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">${escapeHTML(a.validity || 'Pontual')}</div>
          </td>
          <td><span style="font-size:0.75rem;font-weight:600;color:var(--text-primary);">${escapeHTML(a.estimatedImpact || 'Operacional')}</span></td>
          <td><span class="status-badge status-${a.status === 'APROVADO' || a.status === 'CONCLUIDO' ? 'CONCLUIDO' : 'PENDENTE_APROVACAO'}">${formatStatus(a.status)}</span></td>
          <td style="text-align:right;">
            <a href="solicitacao-detalhe.html?id=${escapeHTML(a.requestId || a.id)}" class="btn btn-ghost btn-sm">Ver Detalhes →</a>
          </td>
        `;
        tbody.appendChild(tr);
      });
      if (footerInfo) footerInfo.textContent = `Exibindo ${list.length} autorizações excepcionais integradas ao motor de aprovações`;
    }

    renderRows(auths);

    const searchInput = document.getElementById("filter-exc-search");
    const categorySelect = document.getElementById("filter-exc-category");
    const statusSelect = document.getElementById("filter-exc-status");
    const btnClear = document.getElementById("btn-exc-clear");
    const btnExport = document.getElementById("btn-exc-export");

    function applyFilters() {
      const q = (searchInput?.value || "").toLowerCase();
      const cat = categorySelect?.value || "ALL";
      const st = statusSelect?.value || "ALL";

      const filtered = auths.filter(a => {
        const matchesQ = !q || (a.id && a.id.toLowerCase().includes(q)) ||
          (a.reason && a.reason.toLowerCase().includes(q)) ||
          (a.justification && a.justification.toLowerCase().includes(q)) ||
          (a.costCenter && a.costCenter.toLowerCase().includes(q));
        const matchesCat = cat === "ALL" || a.category === cat;
        const matchesSt = st === "ALL" || a.status === st;
        return matchesQ && matchesCat && matchesSt;
      });
      renderRows(filtered);
    }

    searchInput?.addEventListener("input", applyFilters);
    categorySelect?.addEventListener("change", applyFilters);
    statusSelect?.addEventListener("change", applyFilters);
    btnClear?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (categorySelect) categorySelect.value = "ALL";
      if (statusSelect) statusSelect.value = "ALL";
      renderRows(auths);
    });

    btnExport?.addEventListener("click", () => {
      exportTableToCSV(auths, "autorizacoes_excepcionais.csv", ["id", "category", "reason", "costCenter", "validity", "estimatedImpact", "status"]);
    });
  }

  // --- 7. LIBERAÇÃO DE ACESSO ---
  async function renderAcessosList(data) {
    let accesses = data.accessRequests || [];
    const total = accesses.length;
    const liberados = accesses.filter(a => a.status === "LIBERADO" || a.status === "AUTORIZADO" || a.status === "CONCLUIDO").length;
    const pendentes = accesses.filter(a => a.status === "PENDENTE_APROVACAO" || a.status === "EM_ATENDIMENTO").length;

    setText("kpi-acs-total", total);
    setText("kpi-acs-liberados", liberados);
    setText("kpi-acs-pendentes", pendentes);

    const tbody = document.getElementById("acessos-tbody");
    const footerInfo = document.getElementById("acessos-footer-info");

    function renderRows(list) {
      if (!tbody) return;
      tbody.innerHTML = "";
      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">Nenhuma solicitação de acesso encontrada.</td></tr>';
        return;
      }
      list.forEach(a => {
        const isGranted = a.status === "LIBERADO" || a.status === "AUTORIZADO" || a.status === "CONCLUIDO";
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${escapeHTML(a.id)}</strong></td>
          <td><span class="status-badge status-APROVADO">${escapeHTML(a.accessType || a.type || 'Acesso')}</span></td>
          <td>
            <div style="font-weight:600;color:var(--text-primary);">${escapeHTML(a.targetResource || a.resource || 'Recurso')}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">${escapeHTML(a.badgeType || a.justification || 'Acesso institucional')}</div>
          </td>
          <td><span style="font-size:0.78rem;color:var(--text-secondary);">${escapeHTML(a.targetUser || a.userTarget || 'Colaborador')}</span></td>
          <td><span style="font-size:0.75rem;color:var(--text-muted);">${escapeHTML(a.period || 'Permanente')}</span></td>
          <td><span class="status-badge status-${isGranted ? 'CONCLUIDO' : 'PENDENTE_APROVACAO'}">${formatStatus(a.status)}</span></td>
          <td style="text-align:right;">
            <a href="solicitacao-detalhe.html?id=${escapeHTML(a.reqId || a.requestId || a.id)}" class="btn btn-ghost btn-sm">Ver Detalhes →</a>
          </td>
        `;
        tbody.appendChild(tr);
      });
      if (footerInfo) footerInfo.textContent = `Exibindo ${list.length} solicitações de liberação de acesso (demonstrativo sem integração IAM)`;
    }

    renderRows(accesses);

    const searchInput = document.getElementById("filter-acs-search");
    const typeSelect = document.getElementById("filter-acs-type");
    const statusSelect = document.getElementById("filter-acs-status");
    const btnClear = document.getElementById("btn-acs-clear");
    const btnExport = document.getElementById("btn-acs-export");

    function applyFilters() {
      const q = (searchInput?.value || "").toLowerCase();
      const tp = typeSelect?.value || "ALL";
      const st = statusSelect?.value || "ALL";

      const filtered = accesses.filter(a => {
        const matchesQ = !q || (a.id && a.id.toLowerCase().includes(q)) ||
          ((a.targetResource || a.resource) && (a.targetResource || a.resource).toLowerCase().includes(q)) ||
          ((a.targetUser || a.userTarget) && (a.targetUser || a.userTarget).toLowerCase().includes(q));
        const matchesTp = tp === "ALL" || (a.accessType || a.type) === tp;
        const matchesSt = st === "ALL" || a.status === st;
        return matchesQ && matchesTp && matchesSt;
      });
      renderRows(filtered);
    }

    searchInput?.addEventListener("input", applyFilters);
    typeSelect?.addEventListener("change", applyFilters);
    statusSelect?.addEventListener("change", applyFilters);
    btnClear?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (typeSelect) typeSelect.value = "ALL";
      if (statusSelect) statusSelect.value = "ALL";
      renderRows(accesses);
    });

    btnExport?.addEventListener("click", () => {
      exportTableToCSV(accesses, "liberacao_acesso.csv", ["id", "accessType", "targetResource", "targetUser", "period", "status"]);
    });
  }

  // --- 8. INVESTIGAÇÃO DE OCORRÊNCIA ---
  async function renderInvestigacaoOcorrenciaList(data) {
    const tbody = document.getElementById("investigacao-ocorrencia-tbody");
    if (!tbody) return;

    const ocoItems = data.investigacaoOcorrencias || [
      {
        id: "OCO-2026-001",
        reqId: "SOL-2026-030",
        category: "Patrimonial / Operacional",
        title: "Registro de Ocorrência: Avaria em Equipamento de Monitorização",
        requesterName: "Carlos Andrade",
        location: "UTI Geral Adulto - Leito 14",
        date: "07/08/2026 08:30",
        status: "EM_ATENDIMENTO",
        statusLevantamento: "Campos pendentes de levantamento",
        notes: "Aguardando tela interna da ferramenta de origem."
      },
      {
        id: "OCO-2026-002",
        reqId: null,
        category: "Acesso / Segurança",
        title: "Registro de Ocorrência: Bloqueio Intermitente de Catraca",
        requesterName: "Renata Monteiro",
        location: "Catraca Bloco B (Entrada Funcionários)",
        date: "08/08/2026 07:15",
        status: "PENDENTE",
        statusLevantamento: "Campos pendentes de levantamento",
        notes: "Triagem preliminar registrada para averiguação de infraestrutura."
      }
    ];

    const searchInput = document.getElementById("filter-oco-search");
    const catSelect = document.getElementById("filter-oco-category");
    const statusSelect = document.getElementById("filter-oco-status");
    const btnExport = document.getElementById("btn-oco-export");
    const btnClear = document.getElementById("btn-oco-clear");
    const footerInfo = document.getElementById("investigacao-ocorrencia-footer-info");

    function renderTable() {
      const q = (searchInput?.value || "").toLowerCase().trim();
      const cat = catSelect?.value || "ALL";
      const st = statusSelect?.value || "ALL";

      const filtered = ocoItems.filter(item => {
        const matchQ = !q ||
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.requesterName.toLowerCase().includes(q);
        const matchCat = cat === "ALL" || item.category === cat;
        const matchSt = st === "ALL" || item.status === st;
        return matchQ && matchCat && matchSt;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">
              Nenhuma ocorrência encontrada para os filtros selecionados.
            </td>
          </tr>`;
      } else {
        tbody.innerHTML = filtered.map(item => {
          const link = item.reqId ? `solicitacao-detalhe.html?id=${item.reqId}` : `solicitacao-nova.html?type=investigacao_ocorrencia`;
          return `
            <tr>
              <td><a href="${link}" style="font-weight:700;color:var(--accent);text-decoration:none;">${item.id}</a></td>
              <td><span class="badge-demo" style="font-size:0.7rem;">${item.category}</span></td>
              <td>
                <strong style="color:var(--text-primary);display:block;">${item.title}</strong>
                <small style="color:var(--text-muted);">📍 ${item.location}</small>
              </td>
              <td>
                <div style="font-size:0.8rem;color:var(--text-primary);">${item.requesterName}</div>
                <small style="color:var(--text-muted);">📅 ${item.date}</small>
              </td>
              <td>
                <span class="service-card-badge" style="background:var(--warning-bg);color:var(--warning);font-size:0.65rem;">
                  Pendente Levantamento
                </span>
              </td>
              <td>${formatStatus(item.status)}</td>
              <td style="text-align:right;">
                <a href="${link}" class="btn btn-secondary btn-sm" style="padding:4px 8px;font-size:0.75rem;">Detalhes</a>
              </td>
            </tr>`;
        }).join("");
      }

      if (footerInfo) {
        footerInfo.textContent = `Exibindo ${filtered.length} de ${ocoItems.length} registros de ocorrência (estrutura demonstrativa inicial)`;
      }
    }

    searchInput?.addEventListener("input", renderTable);
    catSelect?.addEventListener("change", renderTable);
    statusSelect?.addEventListener("change", renderTable);

    btnClear?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (catSelect) catSelect.value = "ALL";
      if (statusSelect) statusSelect.value = "ALL";
      renderTable();
    });

    btnExport?.addEventListener("click", () => {
      exportTableToCSV(ocoItems, "investigacao_ocorrencias.csv", ["id", "category", "title", "location", "requesterName", "date", "status"]);
    });

    renderTable();
  }

  // Utilitário de exportação CSV genérico
  function exportTableToCSV(items, filename, headers) {
    if (!items || items.length === 0) {
      alert("Nenhum dado para exportar.");
      return;
    }
    const csvRows = [];
    csvRows.push(headers.join(","));
    items.forEach(item => {
      const row = headers.map(h => {
        const val = item[h] !== undefined && item[h] !== null ? String(item[h]).replace(/"/g, '""') : "";
        return `"${val}"`;
      });
      csvRows.push(row.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  // --- HELPERS ---
  function escapeHTML(str) {
    if (typeof str !== "string") return str;
    return str.replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m];
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
      CANCELADO: "Cancelado",
      EM_TRANSITO: "Em Trânsito",
      AGUARDANDO_POSTAGEM: "Aguardando Postagem",
      PENDENTE: "Pendente",
      ENTREGUE: "Entregue",
      AGUARDANDO_ACEITE: "Aguardando Aceite",
      EM_EXECUCAO: "Em Execução",
      AUTORIZADO: "Autorizado",
      ITEM_LOCALIZADO: "Item Localizado",
      AGUARDANDO_RETIRADA: "Aguardando Retirada",
      DEVOLVIDO: "Devolvido",
      ENCERRADO: "Encerrado",
      LIBERADO: "Liberado",
      AGUARDANDO_COLETA: "Aguardando Coleta",
      COLETADO: "Coletado",
      EM_ANALISE: "Em Análise",
      EM_BUSCA: "Em Busca Ativa"
    };
    return map[status] || status;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value !== undefined && value !== null ? value : "";
  }
  window.setText = setText;

  // Delegador global de segurança para cliques no shell
  document.addEventListener("click", function (e) {
    const themeTarget = e.target.closest("#topbar-theme-toggle");
    if (themeTarget) {
      e.preventDefault();
      toggleTheme();
      return;
    }

  });


})();
