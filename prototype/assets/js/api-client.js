/**
 * CENTRAL DE SERVIÇOS 360 - API CLIENT
 * Módulo de comunicação HTTP com o backend
 * Fallback automático para localStorage apenas quando servidor offline ou modo mock/demo
 */

window.CS360API = (function () {
  "use strict";

  const API_BASE = window.location.origin + "/api";
  const TOKEN_KEY = "cs360_api_token";
  const ROLE_KEY = "cs360_active_role";
  const USER_KEY = "cs360_current_user";

  let _apiAvailable = null;

  // --- UTILITÁRIOS ---
  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getActiveRole() {
    return localStorage.getItem(ROLE_KEY) || "colaborador";
  }

  function setActiveRole(roleId) {
    localStorage.setItem(ROLE_KEY, roleId);
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  }

  function setCurrentUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Classificar erro da API para decisão de fallback.
   *
   * Tipos:
   * - network: erro de conexão (servidor offline, DNS, CORS)
   * - timeout: requisição excedeu tempo limite
   * - client_error: 4xx (400, 401, 403, 404, 409, 422) — erro funcional do cliente
   * - server_error: 5xx — erro interno do servidor
   */
  function classifyError(err, response) {
    // Network error / timeout
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      return { type: "network", message: "Servidor indisponível" };
    }
    if (err.name === "AbortError" || err.message?.includes("timeout")) {
      return { type: "timeout", message: "Requisição excedeu tempo limite" };
    }

    if (!response) {
      return { type: "network", message: "Erro de conexão" };
    }

    const status = response.status;

    if (status === 401) return { type: "unauthorized", message: "Não autenticado", status };
    if (status === 403) return { type: "forbidden", message: "Acesso proibido", status };
    if (status === 404) return { type: "not_found", message: "Recurso não encontrado", status };
    if (status === 409) return { type: "conflict", message: "Conflito de estado", status };
    if (status >= 400 && status < 500) return { type: "client_error", message: `Erro do cliente (${status})`, status };
    if (status >= 500) return { type: "server_error", message: `Erro interno do servidor (${status})`, status };

    return { type: "unknown", message: `Erro desconhecido (${status})`, status };
  }

  /**
   * Determina se o erro permite fallback para localStorage.
   * Apenas network e timeout permitem fallback.
   * Erros funcionais (4xx, 5xx) NÃO devem ter fallback silencioso.
   */
  function isFallbackAllowed(classifiedError) {
    return classifiedError.type === "network" || classifiedError.type === "timeout";
  }

  // --- HTTP CLIENT GENÉRICO ---
  async function request(method, path, body = null, requiresAuth = true) {
    const url = API_BASE + path;
    const headers = { "Content-Type": "application/json" };

    if (requiresAuth) {
      const token = getToken();
      if (token) {
        headers["Authorization"] = "Bearer " + token;
      }
    }

    const config = { method, headers, signal: AbortSignal.timeout(10000) };
    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error?.message || `Erro HTTP ${response.status}`);
      error._classified = classifyError(error, response);
      throw error;
    }

    return data;
  }

  // --- TESTE DE DISPONIBILIDADE DA API ---
  async function checkApiAvailability() {
    try {
      const response = await fetch(window.location.origin + "/health", {
        method: "GET",
        signal: AbortSignal.timeout(3000)
      });
      const data = await response.json();
      _apiAvailable = data.status === "UP";
      return _apiAvailable;
    } catch {
      _apiAvailable = false;
      return false;
    }
  }

  function isApiAvailable() {
    return _apiAvailable;
  }

  // --- AUTH ---
  async function login(email) {
    const result = await request("POST", "/auth/login", { email }, false);
    if (result.success) {
      setToken(result.data.token);
      setCurrentUser(result.data.user);
      setActiveRole(result.data.user.role);
    }
    return result;
  }

  async function logout() {
    try {
      await request("POST", "/auth/logout");
    } finally {
      clearToken();
    }
  }

  async function getSession() {
    return await request("GET", "/auth/session");
  }

  async function getRoles() {
    return await request("GET", "/auth/roles", null, false);
  }

  // --- REQUESTS (SOLICITAÇÕES) ---
  async function getRequests(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.serviceType) params.append("serviceType", filters.serviceType);
    if (filters.requesterId) params.append("requesterId", filters.requesterId);

    const query = params.toString() ? "?" + params.toString() : "";
    return await request("GET", "/requests" + query);
  }

  async function getRequestById(id) {
    return await request("GET", "/requests/" + encodeURIComponent(id));
  }

  async function createRequest(data) {
    return await request("POST", "/requests", data);
  }

  async function submitRequest(id) {
    return await request("PUT", "/requests/" + encodeURIComponent(id) + "/submit");
  }

  async function getRequestHistory(id) {
    return await request("GET", "/requests/" + encodeURIComponent(id) + "/history");
  }

  // --- DASHBOARD ---
  async function getDashboardMetrics() {
    return await request("GET", "/dashboard/metrics");
  }

  async function getAdminUsers() { return await request("GET", "/admin/users"); }
  async function getAdminUser(id) { return await request("GET", "/admin/users/" + encodeURIComponent(id)); }
  async function createAdminUser(payload) { return await request("POST", "/admin/users", payload); }
  async function updateAdminUserAccess(id, payload) { return await request("PATCH", "/admin/users/" + encodeURIComponent(id) + "/access", payload); }
  async function updateAdminUserPermissions(id, payload) { return await request("PATCH", "/admin/users/" + encodeURIComponent(id) + "/permissions", payload); }
  async function getAdminAudit() { return await request("GET", "/admin/audit"); }

  async function getStatusDistribution() {
    return await request("GET", "/dashboard/status-distribution");
  }

  async function getRecentQueue() {
    return await request("GET", "/dashboard/recent-queue");
  }

  // --- APROVAÇÕES ---
  async function getPendingApprovals() {
    return await request("GET", "/approvals/pending");
  }

  async function approveRequest(id, approverName, comment) {
    return await request("PUT", "/approvals/" + encodeURIComponent(id) + "/approve", {
      approverName,
      comment
    });
  }

  async function rejectRequest(id, approverName, reason) {
    return await request("PUT", "/approvals/" + encodeURIComponent(id) + "/reject", {
      approverName,
      reason
    });
  }

  async function getApprovalHistory() {
    return await request("GET", "/approvals/history");
  }

  // --- VIAGENS ---
  async function getViagens() {
    return await request("GET", "/viagens");
  }

  async function getViagemById(id) {
    return await request("GET", "/viagens/" + encodeURIComponent(id));
  }

  async function getViagemItinerary(id) {
    return await request("GET", "/viagens/" + encodeURIComponent(id) + "/itinerary");
  }

  async function getNonFlownTickets() {
    return await request("GET", "/non-flown-tickets");
  }

  async function applyNonFlownCredit(ticketId, requestId) {
    return await request("PUT", "/non-flown-tickets/" + encodeURIComponent(ticketId) + "/apply", { requestId });
  }

  async function getViagemInsurance(id) {
    return await request("GET", "/viagens/" + encodeURIComponent(id) + "/insurance");
  }

  // --- MOBILIDADE ---
  async function getMobilidadeRides() {
    return await request("GET", "/mobilidade/rides");
  }

  async function getMobilidadeRideById(id) {
    return await request("GET", "/mobilidade/rides/" + encodeURIComponent(id));
  }

  async function createMobilidadeAccessRequest(data) {
    return await request("POST", "/mobilidade/access-requests", data);
  }

  async function getMobilidadeLimits() {
    return await request("GET", "/mobilidade/limits");
  }

  async function requestVoucher(data) {
    return await request("POST", "/mobilidade/voucher", data);
  }

  // --- CORREIOS ---
  async function getCorreios() {
    return await request("GET", "/correios");
  }

  async function getCorreioById(id) {
    return await request("GET", "/correios/" + encodeURIComponent(id));
  }

  async function createCorreioRequest(data) {
    return await request("POST", "/correios", data);
  }

  async function getCorreioTracking(id) {
    return await request("GET", "/correios/" + encodeURIComponent(id) + "/tracking");
  }

  async function updateCorreioUsageType(id, usageType) {
    return await request("PUT", "/correios/" + encodeURIComponent(id) + "/usage-type", { usageType });
  }

  // --- XEROX ---
  async function getXeroxJobs() {
    return await request("GET", "/xerox/jobs");
  }

  async function getXeroxJobById(id) {
    return await request("GET", "/xerox/jobs/" + encodeURIComponent(id));
  }

  async function createXeroxJob(data) {
    return await request("POST", "/xerox/jobs", data);
  }

  async function uploadXeroxFile(id, fileInfo) {
    return await request("POST", "/xerox/jobs/" + encodeURIComponent(id) + "/file", fileInfo);
  }

  async function getXeroxJobStatus(id) {
    return await request("GET", "/xerox/jobs/" + encodeURIComponent(id) + "/status");
  }

  // --- FINANCEIRO ---
  async function getCostCenters() {
    return await request("GET", "/finance/cost-centers");
  }

  async function getCostCenterSummary(code) {
    return await request("GET", "/finance/cost-centers/" + encodeURIComponent(code) + "/summary");
  }

  async function getCostCenterRequests(code) {
    return await request("GET", "/finance/cost-centers/" + encodeURIComponent(code) + "/requests");
  }

  async function getConciliation() {
    return await request("GET", "/finance/conciliation");
  }

  async function exportFinanceData(data) {
    return await request("POST", "/finance/export", data);
  }

  // --- FORNECEDORES ---
  async function getSuppliers() {
    return await request("GET", "/suppliers");
  }

  async function getSupplierById(id) {
    return await request("GET", "/suppliers/" + encodeURIComponent(id));
  }

  async function getSupplierSla(id) {
    return await request("GET", "/suppliers/" + encodeURIComponent(id) + "/sla");
  }

  // --- TICKETS (ATENDIMENTO) ---
  async function getTickets(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.category) params.append("category", filters.category);

    const query = params.toString() ? "?" + params.toString() : "";
    return await request("GET", "/tickets" + query);
  }

  async function getTicketById(id) {
    return await request("GET", "/tickets/" + encodeURIComponent(id));
  }

  async function createTicket(data) {
    return await request("POST", "/tickets", data);
  }

  async function resolveTicket(id, resolution, assignedTo) {
    return await request("PUT", "/tickets/" + encodeURIComponent(id) + "/resolve", { resolution, assignedTo });
  }

  async function escalateTicket(id, reason) {
    return await request("PUT", "/tickets/" + encodeURIComponent(id) + "/escalate", { reason });
  }

  // --- API PÚBLICA ---
  return {
    checkApiAvailability,
    isApiAvailable,
    classifyError,
    isFallbackAllowed,

    login,
    logout,
    getSession,
    getRoles,
    getActiveRole,
    setActiveRole,
    getCurrentUser,
    getToken,

    getRequests,
    getRequestById,
    createRequest,
    submitRequest,
    getRequestHistory,

    getDashboardMetrics,
    getAdminUsers,
    getAdminUser,
    createAdminUser,
    updateAdminUserAccess,
    updateAdminUserPermissions,
    getAdminAudit,
    getStatusDistribution,
    getRecentQueue,

    getPendingApprovals,
    approveRequest,
    rejectRequest,
    getApprovalHistory,

    getViagens,
    getViagemById,
    getViagemItinerary,
    getNonFlownTickets,
    applyNonFlownCredit,
    getViagemInsurance,

    getMobilidadeRides,
    getMobilidadeRideById,
    createMobilidadeAccessRequest,
    getMobilidadeLimits,
    requestVoucher,

    getCorreios,
    getCorreioById,
    createCorreioRequest,
    getCorreioTracking,
    updateCorreioUsageType,

    getXeroxJobs,
    getXeroxJobById,
    createXeroxJob,
    uploadXeroxFile,
    getXeroxJobStatus,

    getCostCenters,
    getCostCenterSummary,
    getCostCenterRequests,
    getConciliation,
    exportFinanceData,

    getSuppliers,
    getSupplierById,
    getSupplierSla,

    getTickets,
    getTicketById,
    createTicket,
    resolveTicket,
    escalateTicket
  };
})();
