/**
 * CENTRAL DE SERVIÇOS 360 - CORE APPLICATION ENGINE
 * JavaScript puro | API backend + fallback localStorage | Dark Mode + Sidebar
 */

(function () {
  "use strict";

  const STORAGE_KEY = "cs360_data";
  const ROLE_KEY = "cs360_active_role";
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
    document.documentElement.setAttribute("data-theme", effective);
    if (document.body) {
      document.body.setAttribute("data-theme", effective);
    }

    updateTopbarThemeToggle(effective);

    try {
      window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: effective } }));
    } catch (e) {}

    return effective;
  }

  function toggleTheme() {
    const current = getThemePreference();
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
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

    const label = isDark ? "Ativar modo claro" : "Ativar modo escuro";
    toggleBtn.setAttribute("title", label);
    toggleBtn.setAttribute("aria-label", label);
  }

  // --- 0.1 MOTOR DA SIDEBAR RECOLHÍVEL & HAMBÚRGUER ---
  function isSidebarCollapsed() {
    return localStorage.getItem(SIDEBAR_KEY) === "true";
  }

  function applySidebarState(collapsed, save = false) {
    if (save) {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? "true" : "false");
    }
    const layout = document.getElementById("app-layout-root");
    const sidebar = document.querySelector(".app-sidebar");
    const toggleBtn = document.getElementById("btn-sidebar-toggle");

    if (layout) {
      if (collapsed) {
        layout.classList.add("sidebar-collapsed");
      } else {
        layout.classList.remove("sidebar-collapsed");
      }
    }
    if (sidebar) {
      if (collapsed) {
        sidebar.classList.add("collapsed");
      } else {
        sidebar.classList.remove("collapsed");
      }
    }
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
    }
  }

  function toggleSidebarCollapse() {
    if (window.innerWidth < 1024) {
      // Mobile Drawer Mode
      const sidebar = document.querySelector(".app-sidebar");
      const overlay = document.getElementById("sidebar-overlay");
      if (sidebar) {
        const isOpen = sidebar.classList.contains("drawer-open");
        if (isOpen) {
          sidebar.classList.remove("drawer-open");
          if (overlay) overlay.classList.remove("active");
        } else {
          sidebar.classList.add("drawer-open");
          if (overlay) overlay.classList.add("active");
        }
      }
    } else {
      // Desktop Collapse Mode
      const currentlyCollapsed = isSidebarCollapsed();
      applySidebarState(!currentlyCollapsed, true);
    }
  }

  window.toggleSidebarCollapse = toggleSidebarCollapse;
  window.toggleTheme = toggleTheme;

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
    if (_authState.authenticated && _authState.sessionRole) {
      return _authState.sessionRole;
    }
    if (!_authState.apiAvailable && _authState.demoMode) {
      return localStorage.getItem(ROLE_KEY) || "colaborador";
    }
    return localStorage.getItem(ROLE_KEY) || "colaborador";
  }

  const roleEmailMap = {
    colaborador: "carlos.andrade@ficticio.org",
    gestor: "fernanda.lima@ficticio.org",
    viagens: "william.nunes@ficticio.org",
    faturamento: "maria.catarina@ficticio.org",
    coordenadora: "renata.monteiro@ficticio.org",
    gerencia: "iramaia.rodrigues@ficticio.org",
    financeiro: "roberto.silva@ficticio.org",
    administrador: "patricia.souza@ficticio.org",
    auditoria: "marcelo.alves@ficticio.org"
  };

  async function switchRoleViaApi(roleId) {
    const email = roleEmailMap[roleId];
    if (!email) {
      console.error("[CS360] Papel desconhecido:", roleId);
      return;
    }
    try {
      await CS360API.login(email);
      const sessionResult = await CS360API.getSession();
      if (sessionResult && sessionResult.success) {
        _authState.authenticated = true;
        _authState.sessionUser = sessionResult.data.user;
        _authState.sessionRole = sessionResult.data.user.role;
        localStorage.setItem(ROLE_KEY, roleId);
        window.location.reload();
      } else {
        console.error("[CS360] Sessão inválida após login");
        CS360API.clearToken();
        _authState.authenticated = false;
        _authState.sessionUser = null;
        _authState.sessionRole = null;
      }
    } catch (err) {
      console.error("[CS360] Erro ao trocar papel via API:", err);
      showApiError("Troca de Perfil", err.message);
    }
  }

  function setActiveRole(roleId) {
    if (_authState.apiAvailable && _authState.authenticated) {
      switchRoleViaApi(roleId);
    } else {
      localStorage.setItem(ROLE_KEY, roleId);
      logAuditEvent("TROCA_PERFIL_SIMULADO", `Perfil alternado para: ${roleId}`);
      window.location.reload();
    }
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
    // Aplicar tema salvo imediatamente
    applyTheme(getThemePreference(), false);

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
                console.log("[CS360] Sessão verificada. Usuário autenticado:", _authState.sessionUser.name);
              } else {
                CS360API.clearToken();
                _authState.authenticated = false;
                _authState.sessionUser = null;
                _authState.sessionRole = null;
              }
            } catch {
              CS360API.clearToken();
              _authState.authenticated = false;
              _authState.sessionUser = null;
              _authState.sessionRole = null;
            }
          } else {
            _authState.authenticated = false;
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

    const activePage = document.body.getAttribute("data-page");
    if (_authState.apiAvailable && !_authState.authenticated && activePage !== "login") {
      window.location.href = "login.html";
      return;
    }

    injectAppLayout();
    applySidebarState(isSidebarCollapsed(), false);
    await renderPageSpecificContent();
  }

  // --- 3. INJEÇÃO DE COMPONENTES COMPARTILHADOS ---
  document.addEventListener("DOMContentLoaded", () => {
    initApp();

    // Fechar drawer no mobile ao pressionar ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const sidebar = document.querySelector(".app-sidebar");
        const overlay = document.getElementById("sidebar-overlay");
        if (sidebar && sidebar.classList.contains("drawer-open")) {
          sidebar.classList.remove("drawer-open");
          if (overlay) overlay.classList.remove("active");
        }
      }
    });
  });

  function injectAppLayout() {
    const activePage = document.body.getAttribute("data-page") || "dashboard";
    const activeRole = getActiveRole();
    const data = getData();

    if (activePage === "login") return;

    const layoutContainer = document.getElementById("app-layout-root");
    if (!layoutContainer) return;
    layoutContainer.classList.add("app-layout");

    const navItems = [
      { id: "dashboard", label: "Dashboard", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`, href: "dashboard.html" },
      { id: "solicitacoes", label: "Solicitações", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`, href: "solicitacoes.html" },
      { id: "solicitacao-nova", label: "Nova Solicitação", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`, href: "solicitacao-nova.html" },
      { id: "viagens", label: "Viagens", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`, href: "viagens.html" },
      { id: "mobilidade", label: "Mobilidade", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>`, href: "mobilidade.html" },
      { id: "correios", label: "Correios", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`, href: "correios.html" },
      { id: "xerox", label: "Xerox", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`, href: "xerox.html" },
      { id: "aprovacoes", label: "Aprovações", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`, href: "aprovacoes.html" },
      { id: "atendimentos", label: "Atendimentos", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`, href: "atendimentos.html" },
      { id: "financeiro", label: "Financeiro", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`, href: "financeiro.html" },
      { id: "fornecedores", label: "Fornecedores", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`, href: "fornecedores.html" },
      { id: "relatorios", label: "Relatórios", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`, href: "relatorios.html" },
      { id: "conhecimento", label: "Chatbot", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`, href: "conhecimento.html" },
      { id: "administracao", label: "Configurações", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`, href: "administracao.html" }
    ];

    const sidebar = document.createElement("aside");
    sidebar.className = "app-sidebar";
    sidebar.id = "app-sidebar";

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="brand-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" style="flex-shrink:0;"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          <div>
            <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">Central 360</div>
            <div style="font-size:0.65rem;color:var(--text-muted);font-weight:400;">Central de Serviços</div>
          </div>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${navItems.map(item => `
          <a href="${item.href}" class="nav-link ${activePage === item.id ? 'active' : ''}" data-tooltip="${item.label}">
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-text">${item.label}</span>
          </a>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <a href="#" class="nav-link sidebar-collapse-link" onclick="toggleSidebarCollapse(); return false;" data-tooltip="Recolher menu lateral">
          <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg></span>
          <span class="nav-text">Recolher menu</span>
        </a>
      </div>
    `;

    // Overlay Mobile
    let overlay = document.getElementById("sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "sidebar-overlay";
      overlay.className = "sidebar-overlay";
      overlay.onclick = () => {
        sidebar.classList.remove("drawer-open");
        overlay.classList.remove("active");
      };
      document.body.appendChild(overlay);
    }

    const mainWrapper = document.createElement("div");
    mainWrapper.className = "app-main";

    const topbar = document.createElement("header");
    topbar.className = "app-topbar";

    const currentRole = data.roles.find(r => r.id === activeRole) || { name: activeRole };

    topbar.innerHTML = `
      <div class="topbar-left">
        <button class="topbar-icon sidebar-toggle" id="btn-sidebar-toggle" onclick="toggleSidebarCollapse()" aria-label="Alternar menu lateral" aria-controls="app-sidebar" aria-expanded="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
      <div class="topbar-center">
        <div class="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar na Central 360" style="border:none;background:none;outline:none;flex:1;font-size:0.875rem;color:var(--text-primary);">
        </div>
      </div>
      <div class="topbar-right">
        <div class="role-selector-container">
          <select class="role-selector-select" aria-label="Perfil de demonstração">
            ${data.roles.map(r => `<option value="${r.id}" ${r.id === activeRole ? 'selected' : ''}>${r.name}</option>`).join('')}
          </select>
        </div>
        ${_authState.apiAvailable && _authState.authenticated
          ? '<span title="Dados simulados para demonstração" style="display:inline-flex;align-items:center;gap:4px;font-size:0.7rem;color:var(--success);background:var(--success-bg);padding:3px 8px;border-radius:var(--radius-full);font-weight:500;cursor:default;white-space:nowrap;"><span style="width:6px;height:6px;border-radius:50%;background:var(--success);display:inline-block;"></span>API local</span>'
          : !_authState.apiAvailable && _authState.demoMode
            ? '<span title="Dados locais simulados — servidor indisponível" style="display:inline-flex;align-items:center;gap:4px;font-size:0.7rem;color:var(--warning);background:var(--warning-bg);padding:3px 8px;border-radius:var(--radius-full);font-weight:500;cursor:default;white-space:nowrap;"><span style="width:6px;height:6px;border-radius:50%;background:var(--warning);display:inline-block;"></span>Mock offline</span>'
            : '<span title="Autenticação necessária" style="display:inline-flex;align-items:center;gap:4px;font-size:0.7rem;color:var(--danger);background:var(--danger-bg);padding:3px 8px;border-radius:var(--radius-full);font-weight:500;cursor:default;white-space:nowrap;"><span style="width:6px;height:6px;border-radius:50%;background:var(--danger);display:inline-block;"></span>Sem auth</span>'
        }
        <button class="topbar-icon" id="topbar-theme-toggle" onclick="toggleTheme()" aria-label="Ativar modo escuro" title="Ativar modo escuro">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button class="topbar-icon" aria-label="Notificações" style="position:relative;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style="position:absolute;top:-2px;right:-2px;background:var(--danger);color:#fff;font-size:0.6rem;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">6</span>
        </button>
        <button class="topbar-icon" aria-label="Ajuda">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </button>
        <div class="user-avatar">
          <div style="width:32px;height:32px;border-radius:50%;background:var(--accent-light);display:flex;align-items:center;justify-content:center;color:var(--accent);font-weight:700;font-size:0.8rem;">
            ${activeRole === 'colaborador' ? 'CA' : activeRole === 'gestor' ? 'FL' : activeRole === 'viagens' ? 'WN' : activeRole === 'administrador' ? 'PS' : 'US'}
          </div>
        </div>
        <div class="user-info">
          <div style="font-size:0.8rem;font-weight:600;color:var(--text-primary);">${escapeHTML(currentRole.name)}</div>
          <div style="font-size:0.65rem;color:var(--text-muted);">${activeRole}</div>
        </div>
        ${activeRole === 'administrador' ? '<button class="btn btn-ghost btn-sm" onclick="window.resetPrototypeData()" title="Restaurar dados demo" style="font-size:0.7rem;">🔄 Reset</button>' : ''}
      </div>
    `;

    // Bind role selector change
    const roleSelect = topbar.querySelector('.role-selector-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => setActiveRole(e.target.value));
    }

    mainWrapper.appendChild(topbar);

    const contentSlot = document.getElementById("page-content-slot");
    if (contentSlot) {
      mainWrapper.appendChild(contentSlot);
    }

    layoutContainer.appendChild(sidebar);
    layoutContainer.appendChild(mainWrapper);

    updateTopbarThemeToggle(getThemePreference());
  }

  // --- 4. RENDERIZAÇÃO DE PÁGINAS (COM API OU LOCAL) ---
  async function renderPageSpecificContent() {
    const activePage = document.body.getAttribute("data-page");
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
      default:
        break;
    }
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

    let allRequests = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getRequests();
        allRequests = result.data || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            allRequests = data.requests;
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
      allRequests = data.requests;
    }

    function updateTable() {
      tbody.innerHTML = "";
      const sVal = filterStatus ? filterStatus.value : "ALL";
      const tVal = filterType ? filterType.value : "ALL";

      const filtered = allRequests.filter(r => {
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

  // --- NOVA SOLICITAÇÃO ---
  function setupNovaSolicitacaoForm(data) {
    const form = document.getElementById("form-nova-solicitacao");
    if (!form) return;

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

      const requestData = {
        serviceType: type,
        title: title,
        requesterId: "USR-001",
        requesterName: "Carlos Andrade",
        costCenter: costCenter,
        status: status,
        urgent: false,
        details: {
          origin: document.getElementById("req-origin") ? document.getElementById("req-origin").value : "São Paulo (GRU)",
          destination: document.getElementById("req-destination") ? document.getElementById("req-destination").value : "Brasília (BSB)",
          departureDate: document.getElementById("req-dep-date") ? document.getElementById("req-dep-date").value : "2026-09-20",
          reason: document.getElementById("req-reason") ? document.getElementById("req-reason").value : "Treinamento institucional.",
          needsHotel: true,
          insuranceRequested: true
        }
      };

      if (_authState.apiAvailable && _authState.authenticated) {
        try {
          const result = await CS360API.createRequest(requestData);
          if (result.success) {
            logAuditEvent(isDraft ? "SOLICITACAO_RASCUNHO" : "SOLICITACAO_ENVIADA", `Solicitação ${result.data.id} criada via API.`);
            alert(isDraft ? `Rascunho ${result.data.id} salvo com sucesso!` : `Solicitação ${result.data.id} enviada para aprovação com sucesso!`);
            window.location.href = "solicitacoes.html";
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
            { date: new Date().toISOString().replace("T", " ").substring(0, 16), action: isDraft ? "Criado rascunho da solicitação." : "Enviado para aprovação do gestor.", user: "Carlos Andrade" }
          ]
        };
        data.requests.unshift(newRequest);
        saveData(data);
        logAuditEvent(isDraft ? "SOLICITACAO_RASCUNHO" : "SOLICITACAO_ENVIADA", `Solicitação ${newId} criada localmente.`);
        alert(isDraft ? `Rascunho ${newId} salvo!` : `Solicitação ${newId} enviada!`);
        window.location.href = "solicitacoes.html";
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

    const timelineEl = document.getElementById("detail-timeline");
    if (timelineEl) {
      timelineEl.innerHTML = "";
      (req.history || []).forEach(hist => {
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

  // --- APROVAÇÕES ---
  async function renderAprovacoesList(data, role) {
    const tbody = document.getElementById("aprovacoes-tbody");
    if (!tbody) return;

    let pending = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getPendingApprovals();
        pending = result.data || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            pending = data.requests.filter(r => r.status === "PENDENTE_APROVACAO");
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
      pending = data.requests.filter(r => r.status === "PENDENTE_APROVACAO");
    }

    tbody.innerHTML = "";

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

    document.querySelectorAll(".btn-aprov-action").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        const action = e.target.getAttribute("data-action");
        await handleAprovacaoDecision(data, id, action);
      });
    });
  }

  async function handleAprovacaoDecision(data, reqId, action) {
    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        if (action === "approve") {
          await CS360API.approveRequest(reqId, "Gestor Simulado", "Aprovado via portal");
          alert(`Solicitação ${reqId} APROVADA com sucesso!`);
        } else {
          const rationale = prompt("REJEIÇÃO DE SOLICITAÇÃO (OBRIGATÓRIO): Por favor, digite a justificativa formal da rejeição:");
          if (!rationale || !rationale.trim()) {
            alert("A justificativa de rejeição é OBRIGATÓRIA (RN-GER-005). Nenhuma alteração realizada.");
            return;
          }
          await CS360API.rejectRequest(reqId, "Gestor Simulado", rationale.trim());
          alert(`Solicitação ${reqId} REJEITADA e registrada no histórico.`);
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
        req.history.push({ date: req.updatedAt, action: "Solicitação APROVADA pelo gestor autorizador.", user: "Fernanda Lima (Gestor)" });
        logAuditEvent("SOLICITACAO_APROVADA", `Solicitação ${reqId} aprovada.`);
        saveData(data);
        alert(`Solicitação ${reqId} APROVADA!`);
        window.location.reload();
      } else {
        const rationale = prompt("REJEIÇÃO DE SOLICITAÇÃO (OBRIGATÓRIO): Justificativa:");
        if (!rationale || !rationale.trim()) {
          alert("Justificativa obrigatória (RN-GER-005).");
          return;
        }
        req.status = "REJEITADO";
        req.updatedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
        req.history.push({ date: req.updatedAt, action: `REJEITADA. Justificativa: "${rationale.trim()}"`, user: "Fernanda Lima (Gestor)" });
        logAuditEvent("SOLICITACAO_REJEITADA", `Solicitação ${reqId} rejeitada.`);
        saveData(data);
        alert(`Solicitação ${reqId} REJEITADA.`);
        window.location.reload();
      }
    }
  }

  // --- VIAGENS ---
  async function renderViagensList(data) {
    let trips = [];
    let tickets = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const [tripsRes, ticketsRes] = await Promise.all([
          CS360API.getViagens(),
          CS360API.getNonFlownTickets()
        ]);
        trips = tripsRes.data || [];
        tickets = ticketsRes.data || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            trips = data.requests.filter(r => r.serviceType === "viagem");
            tickets = data.nonFlownTickets;
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
      trips = data.requests.filter(r => r.serviceType === "viagem");
      tickets = data.nonFlownTickets;
    }

    const tbody = document.getElementById("viagens-tbody");
    if (tbody) {
      tbody.innerHTML = "";
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
      tickets.forEach(tkt => {
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

  // --- MOBILIDADE ---
  async function renderMobilidadeList(data) {
    let rides = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getMobilidadeRides();
        rides = result.data || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            rides = data.mobilityRides;
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
      rides = data.mobilityRides;
    }

    const tbody = document.getElementById("rides-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    rides.forEach(ride => {
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

  // --- CORREIOS ---
  async function renderCorreiosList(data) {
    let mailReqs = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getCorreios();
        mailReqs = result.data || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            mailReqs = data.requests.filter(r => r.serviceType === "correios");
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
      mailReqs = data.requests.filter(r => r.serviceType === "correios");
    }

    const tbody = document.getElementById("correios-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
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

  // --- XEROX ---
  async function renderXeroxList(data) {
    let printReqs = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getXeroxJobs();
        printReqs = result.data || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            printReqs = data.requests.filter(r => r.serviceType === "xerox");
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
      printReqs = data.requests.filter(r => r.serviceType === "xerox");
    }

    const tbody = document.getElementById("xerox-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
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
        if (match) {
          appendMessage("bot", match.content, `${match.docRef} (Atualizado em ${match.updatedAt})`);
        } else {
          appendMessage("bot", "Desculpe, não encontrei uma resposta direta na base oficial para essa dúvida. Deseja abrir um chamado fictício para atendimento humano com a equipe da Central?", null);
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
    let tickets = [];

    if (_authState.apiAvailable && _authState.authenticated) {
      try {
        const result = await CS360API.getTickets();
        tickets = result.data || [];
      } catch (err) {
        const classified = err._classified || CS360API.classifyError(err, null);
        if (CS360API.isFallbackAllowed(classified)) {
          if (_authState.demoMode) {
            tickets = data.tickets || [];
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
      tickets = data.tickets || [];
    }

    const tbody = document.getElementById("atendimentos-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    tickets.forEach(t => {
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
            showApiError("Financeiro", classified.message);
            return;
          }
        } else {
          showApiError("Financeiro", classified.message);
          return;
        }
      }
    } else {
      costCenters = data.costCenters || [];
    }

    const tbody = document.getElementById("fin-cost-centers-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    costCenters.forEach(cc => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHTML(cc.code)}</strong></td>
        <td>${escapeHTML(cc.name)}</td>
        <td>${escapeHTML(cc.manager)}</td>
        <td>${cc.requestCount || 0} solicitações</td>
        <td><span class="status-badge status-APROVADO">${escapeHTML(cc.status || "Consolidado")}</span></td>
      `;
      tbody.appendChild(tr);
    });
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
      CANCELADO: "Cancelado"
    };
    return map[status] || status;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

})();
