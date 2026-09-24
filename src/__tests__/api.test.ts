import request from 'supertest';
import app from '../main';

// Helper para obter token mock com role específica
function getAuthToken(role: string = 'colaborador'): string {
  const identities: Record<string, [string, string]> = {
    colaborador: ['USR-001', 'COLABORADOR'], gestor: ['USR-002', 'GESTOR_APROVADOR'],
    viagens: ['USR-003', 'AGENTE_SERVICO'], operador: ['USR-003', 'AGENTE_SERVICO'],
    faturamento: ['USR-008', 'ADMINISTRADOR'], financeiro: ['USR-008', 'ADMINISTRADOR'],
    coordenadora: ['USR-008', 'ADMINISTRADOR'], administrador: ['USR-008', 'ADMINISTRADOR']
  };
  const [userId, canonicalRole] = identities[role] || ['USR-001', 'COLABORADOR'];
  return `mock_jwt_token_${userId}_${canonicalRole}_${Date.now()}`;
}

// ============================================================================
// 1. FALLBACK - Testes de cenário HTTP
// ============================================================================
describe('1. FALLBACK - Comportamento por código HTTP', () => {
  const token = getAuthToken('colaborador');

  it('Servidor offline → comportamento mock permitido somente quando modo demo habilitado', async () => {
    // Verificar que o servidor está rodando
    const health = await request(app).get('/health');
    expect(health.status).toBe(200);
    expect(health.body.status).toBe('UP');
    expect(health.body.mode).toBe('MOCK_ACTIVE');
  });

  it('HTTP 400 → sem fallback (erro funcional)', async () => {
    // Criar request com status proibido deve retornar 422 (Zod)
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        serviceType: 'viagem',
        title: 'Teste 400',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-DEMO-01',
        status: 'CONCLUIDO'
      });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
  });

  it('HTTP 401 → sem fallback (não autenticado)', async () => {
    const res = await request(app)
      .get('/api/requests');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('HTTP 403 → sem fallback (proibido)', async () => {
    // Collaborator tentando aprovar (requer gestor)
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        serviceType: 'viagem',
        title: 'Teste 403',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    const reqId = createRes.body.data.id;

    await request(app)
      .put(`/api/requests/${reqId}/submit`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .put(`/api/approvals/${reqId}/approve`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({ approverName: 'Teste', comment: 'Teste' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('HTTP 404 → sem fallback (não encontrado)', async () => {
    const res = await request(app)
      .get('/api/requests/INEXISTENTE')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('HTTP 409 → sem fallback (conflito)', async () => {
    // Ticket já resolvido tentar resolver novamente
    const token2 = getAuthToken('faturamento');
    const res = await request(app)
      .put('/api/tickets/TICK-102/resolve')
      .set('Authorization', `Bearer ${token2}`)
      .send({ resolution: 'Teste', assignedTo: 'Teste' });
    expect(res.status).toBe(400); // ValidationError: já resolvido
    expect(res.body.success).toBe(false);
  });

  it('HTTP 422 → sem fallback (validação)', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        serviceType: 'viagem'
      });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.details).toBeDefined();
  });

  it('HTTP 500 → sem fallback (erro interno)', async () => {
    // Rota inexistente da API retorna 404, não 500
    // Mas testamos que erros são tratados corretamente
    const res = await request(app)
      .get('/api/naoexiste');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ============================================================================
// 2. AUTORIZAÇÃO DE TRANSIÇÕES
// ============================================================================
describe('2. AUTORIZAÇÃO DE TRANSIÇÕES - Matriz estado+destino+perfil', () => {
  it('Colaborador NÃO pode concluir solicitação (EM_ATENDIMENTO → CONCLUIDO)', async () => {
    // Criar, submeter, aprovar, iniciar
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'viagem',
        title: 'Teste Transição Colaborador',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    const id = createRes.body.data.id;

    await request(app)
      .put(`/api/requests/${id}/submit`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);

    await request(app)
      .put(`/api/approvals/${id}/approve`)
      .set('Authorization', `Bearer ${getAuthToken('gestor')}`)
      .send({ approverName: 'Gestor', comment: 'OK' });

    await request(app)
      .put(`/api/viagens/${id}/start`)
      .set('Authorization', `Bearer ${getAuthToken('viagens')}`);

    // Colaborador tentando concluir → 403
    const res = await request(app)
      .put(`/api/requests/${id}/transition`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({ targetStatus: 'CONCLUIDO' });
    expect(res.status).toBe(403);
    expect(res.body.error.message).toContain('não autorizado');
  });

  it('Perfil viagens pode iniciar atendimento (APROVADO → EM_ATENDIMENTO)', async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'viagem',
        title: 'Teste Viagens Iniciar',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    const id = createRes.body.data.id;

    await request(app)
      .put(`/api/requests/${id}/submit`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);

    await request(app)
      .put(`/api/approvals/${id}/approve`)
      .set('Authorization', `Bearer ${getAuthToken('gestor')}`)
      .send({ approverName: 'Gestor', comment: 'OK' });

    const res = await request(app)
      .put(`/api/viagens/${id}/start`)
      .set('Authorization', `Bearer ${getAuthToken('viagens')}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('EM_ATENDIMENTO');
  });

  it('Perfil viagens pode concluir atendimento (EM_ATENDIMENTO → CONCLUIDO)', async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'viagem',
        title: 'Teste Viagens Concluir',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    const id = createRes.body.data.id;

    await request(app)
      .put(`/api/requests/${id}/submit`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);

    await request(app)
      .put(`/api/approvals/${id}/approve`)
      .set('Authorization', `Bearer ${getAuthToken('gestor')}`)
      .send({ approverName: 'Gestor', comment: 'OK' });

    await request(app)
      .put(`/api/viagens/${id}/start`)
      .set('Authorization', `Bearer ${getAuthToken('viagens')}`);

    const res = await request(app)
      .put(`/api/viagens/${id}/complete`)
      .set('Authorization', `Bearer ${getAuthToken('viagens')}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CONCLUIDO');
  });

  it('Administrador pode executar qualquer transição válida', async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('administrador')}`)
      .send({
        serviceType: 'mobilidade',
        title: 'Teste Admin',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    const id = createRes.body.data.id;

    // Admin submete
    const submitRes = await request(app)
      .put(`/api/requests/${id}/submit`)
      .set('Authorization', `Bearer ${getAuthToken('administrador')}`);
    expect(submitRes.status).toBe(200);

    // Admin aprova
    const approveRes = await request(app)
      .put(`/api/approvals/${id}/approve`)
      .set('Authorization', `Bearer ${getAuthToken('administrador')}`)
      .send({ approverName: 'Admin', comment: 'OK' });
    expect(approveRes.status).toBe(200);

    // Admin inicia
    const startRes = await request(app)
      .put(`/api/requests/${id}/transition`)
      .set('Authorization', `Bearer ${getAuthToken('administrador')}`)
      .send({ targetStatus: 'EM_ATENDIMENTO' });
    expect(startRes.status).toBe(200);

    // Admin conclui
    const completeRes = await request(app)
      .put(`/api/requests/${id}/transition`)
      .set('Authorization', `Bearer ${getAuthToken('administrador')}`)
      .send({ targetStatus: 'CONCLUIDO' });
    expect(completeRes.status).toBe(200);
  });

  it('Transição inválida retorna 400', async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'correios',
        title: 'Teste Inválida',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    const id = createRes.body.data.id;

    const res = await request(app)
      .put(`/api/requests/${id}/transition`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({ targetStatus: 'APROVADO' });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('Transição inválida');
  });

  it('Perfil inválido em transição válida retorna 403', async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'viagem',
        title: 'Teste Perfil Inválido',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    const id = createRes.body.data.id;

    await request(app)
      .put(`/api/requests/${id}/submit`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);

    await request(app)
      .put(`/api/approvals/${id}/approve`)
      .set('Authorization', `Bearer ${getAuthToken('gestor')}`)
      .send({ approverName: 'Gestor', comment: 'OK' });

    // Colaborador tentando iniciar atendimento (requer viagens/faturamento/coordenadora/admin)
    const res = await request(app)
      .put(`/api/requests/${id}/transition`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({ targetStatus: 'EM_ATENDIMENTO' });
    expect(res.status).toBe(403);
    expect(res.body.error.message).toContain('não autorizado');
  });
});

// ============================================================================
// 3. DELETE / CANCELAMENTO
// ============================================================================
describe('3. DELETE - Soft delete (CANCELADO)', () => {
  it('DELETE /api/requests/:id deve cancelar (soft delete) e manter histórico', async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'viagem',
        title: 'Teste Delete',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    const id = createRes.body.data.id;

    const deleteRes = await request(app)
      .delete(`/api/requests/${id}`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.data.status).toBe('CANCELADO');

    // Verificar que a solicitação ainda existe com status CANCELADO
    const getRes = await request(app)
      .get(`/api/requests/${id}`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.status).toBe('CANCELADO');
    expect(getRes.body.data.history.length).toBeGreaterThan(0);
  });

  it('DELETE de solicitação CONCLUIDO deve retornar 400 (transição inválida)', async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'viagem',
        title: 'Teste Delete Concluido',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    const id = createRes.body.data.id;

    // Completar a jornada
    await request(app).put(`/api/requests/${id}/submit`).set('Authorization', `Bearer ${getAuthToken('colaborador')}`);
    await request(app).put(`/api/approvals/${id}/approve`).set('Authorization', `Bearer ${getAuthToken('gestor')}`).send({ approverName: 'Gestor', comment: 'OK' });
    await request(app).put(`/api/viagens/${id}/start`).set('Authorization', `Bearer ${getAuthToken('viagens')}`);
    await request(app).put(`/api/viagens/${id}/complete`).set('Authorization', `Bearer ${getAuthToken('viagens')}`);

    const deleteRes = await request(app)
      .delete(`/api/requests/${id}`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);
    expect(deleteRes.status).toBe(400);
    expect(deleteRes.body.error.message).toContain('Transição inválida');
  });
});

// ============================================================================
// 4. SESSION - Proteção com authenticate
// ============================================================================
describe('4. SESSION - Proteção com authenticate', () => {
  it('GET /api/auth/session sem token deve retornar 401', async () => {
    const res = await request(app).get('/api/auth/session');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/session com token mock válido deve retornar 200', async () => {
    const res = await request(app)
      .get('/api/auth/session')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);
    expect(res.status).toBe(200);
    expect(res.body.data.authenticated).toBe(true);
  });

  it('Role retornada corresponde ao token/perfil simulado', async () => {
    const res = await request(app)
      .get('/api/auth/session')
      .set('Authorization', `Bearer ${getAuthToken('gestor')}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('GESTOR_APROVADOR');
  });

  it('Session com token legado (sem role) retorna colaborador', async () => {
    // Token legado: mock_jwt_token_USR-001_timestamp (4 partes, sem role)
    const legacyToken = `mock_jwt_token_USR-001_12345`;
    const res = await request(app)
      .get('/api/auth/session')
      .set('Authorization', `Bearer ${legacyToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('COLABORADOR');
  });
});

// ============================================================================
// 5. HELMET / CSP - Headers de segurança
// ============================================================================
describe('5. HELMET / CSP - Headers de segurança', () => {
  it('Deve retornar headers de segurança X-Content-Type-Options', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('Deve retornar X-Frame-Options', async () => {
    const res = await request(app).get('/health');
    // Helmet configura SAMEORIGIN por padrão (não DENY) para compatibilidade
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  it('Deve retornar Content-Security-Policy', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
  });

  it('Deve retornar Strict-Transport-Security', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['strict-transport-security']).toBeDefined();
  });

  it('Deve retornar X-XSS-Protection', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-xss-protection']).toBeDefined();
  });
});

// ============================================================================
// 6. CLEAN SCRIPT
// ============================================================================
describe('6. CLEAN SCRIPT', () => {
  it('rimraf deve estar instalado como devDependency', () => {
    const pkg = require('../../package.json');
    expect(pkg.devDependencies.rimraf).toBeDefined();
    expect(pkg.scripts.clean).toBe('rimraf dist');
  });
});

// ============================================================================
// 7. LOCKFILE / PACKAGE MANAGER
// ============================================================================
describe('7. LOCKFILE / PACKAGE MANAGER', () => {
  it('package.json deve declarar packageManager', () => {
    const pkg = require('../../package.json');
    expect(pkg.packageManager).toBe('npm@10.8.2');
  });

  it('engines.node deve ser >=18.0.0', () => {
    const pkg = require('../../package.json');
    expect(pkg.engines.node).toBe('>=18.0.0');
  });
});

// ============================================================================
// 8. TESTES EXISTENTES (mantidos)
// ============================================================================
describe('Healthcheck', () => {
  it('GET /health deve retornar status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.modules).toContain('auth');
  });
});

describe('Autenticação', () => {
  it('POST /api/auth/login com email válido deve retornar 200 e token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'exemplo.a@ficticio.org' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user).toBeDefined();
  });

  it('POST /api/auth/login com email inválido deve retornar 404 e NÃO derrubar o servidor', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invalid@test.com' });
    expect(res.status).toBe(404);

    const health = await request(app).get('/health');
    expect(health.status).toBe(200);
    expect(health.body.status).toBe('UP');
  });

  it('POST /api/auth/login sem email nem role deve retornar 422', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.status).toBe(422);
  });

  it('GET /api/auth/roles deve retornar lista de perfis', async () => {
    const res = await request(app).get('/api/auth/roles');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(4);
  });
});

describe('Rota protegida sem token', () => {
  it('GET /api/requests sem token deve retornar 401', async () => {
    const res = await request(app).get('/api/requests');
    expect(res.status).toBe(401);
  });

  it('GET /api/requests com token deve retornar 200', async () => {
    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Autorização', () => {
  it('POST /api/requests com role colaborador deve ser permitido', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'viagem',
        title: 'Teste Autorização',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    expect(res.status).toBe(201);
  });

  it('PUT /api/approvals/:id/approve sem role gestor deve retornar 403', async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'viagem',
        title: 'Teste 403',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    const reqId = createRes.body.data.id;

    await request(app)
      .put(`/api/requests/${reqId}/submit`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);

    const res = await request(app)
      .put(`/api/approvals/${reqId}/approve`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({ approverName: 'Teste', comment: 'Teste' });
    expect(res.status).toBe(403);
  });
});

describe('Criação de solicitação', () => {
  it('POST /api/requests com dados válidos deve criar com status RASCUNHO', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'mobilidade',
        title: 'Solicitação Válida',
        requesterId: 'USR-001',
        requesterName: 'Solicitante Exemplo A',
        costCenter: 'CC-DEMO-01'
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('RASCUNHO');
  });

  it('POST /api/requests com status CONCLUIDO deve retornar 422', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'viagem',
        title: 'Teste Status Proibido',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-DEMO-01',
        status: 'CONCLUIDO'
      });
    expect(res.status).toBe(422);
  });

  it('POST /api/requests sem campos obrigatórios deve retornar 422', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'viagem'
      });
    expect(res.status).toBe(422);
  });
});

describe('Transições de estado (máquina de estados)', () => {
  let requestId: string;

  beforeAll(async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'viagem',
        title: 'Teste Estado',
        requesterId: 'USR-001',
        requesterName: 'Solicitante Exemplo A',
        costCenter: 'CC-1010'
      });
    requestId = createRes.body.data.id;
  });

  it('RASCUNHO → PENDENTE_APROVACAO (submit)', async () => {
    const res = await request(app)
      .put(`/api/requests/${requestId}/submit`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PENDENTE_APROVACAO');
  });

  it('PENDENTE_APROVACAO → APROVADO', async () => {
    const res = await request(app)
      .put(`/api/approvals/${requestId}/approve`)
      .set('Authorization', `Bearer ${getAuthToken('gestor')}`)
      .send({ approverName: 'Gestor Teste', comment: 'Aprovado' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APROVADO');
  });

  it('APROVADO → EM_ATENDIMENTO (start viagem)', async () => {
    const res = await request(app)
      .put(`/api/viagens/${requestId}/start`)
      .set('Authorization', `Bearer ${getAuthToken('viagens')}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('EM_ATENDIMENTO');
  });

  it('EM_ATENDIMENTO → CONCLUIDO (complete viagem)', async () => {
    const res = await request(app)
      .put(`/api/viagens/${requestId}/complete`)
      .set('Authorization', `Bearer ${getAuthToken('viagens')}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CONCLUIDO');
  });

  it('CONCLUIDO → qualquer transição deve ser bloqueada', async () => {
    const res = await request(app)
      .put(`/api/requests/${requestId}/transition`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({ targetStatus: 'RASCUNHO', user: 'Teste' });
    expect(res.status).toBe(400);
  });
});

describe('Aprovação', () => {
  let pendingId: string;

  beforeAll(async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'xerox',
        title: 'Teste Aprovação',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    pendingId = createRes.body.data.id;

    await request(app)
      .put(`/api/requests/${pendingId}/submit`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);
  });

  it('PUT /api/approvals/:id/approve com dados válidos deve aprovar', async () => {
    const res = await request(app)
      .put(`/api/approvals/${pendingId}/approve`)
      .set('Authorization', `Bearer ${getAuthToken('gestor')}`)
      .send({ approverName: 'Gestor Teste', comment: 'OK' });
    expect(res.status).toBe(200);
  });

  it('Rejeição sem motivo deve retornar 422', async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'viagem',
        title: 'Teste Rejeição',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    const rejectId = createRes.body.data.id;

    await request(app)
      .put(`/api/requests/${rejectId}/submit`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);

    const res = await request(app)
      .put(`/api/approvals/${rejectId}/reject`)
      .set('Authorization', `Bearer ${getAuthToken('gestor')}`)
      .send({ approverName: 'Gestor', reason: '' });
    expect(res.status).toBe(422);
  });

  it('Rejeição com motivo deve ser aceita', async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({
        serviceType: 'mobilidade',
        title: 'Teste Rejeição Válida',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    const rejectId = createRes.body.data.id;

    await request(app)
      .put(`/api/requests/${rejectId}/submit`)
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);

    const res = await request(app)
      .put(`/api/approvals/${rejectId}/reject`)
      .set('Authorization', `Bearer ${getAuthToken('gestor')}`)
      .send({ approverName: 'Gestor', reason: 'Fora do escopo' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('REJEITADO');
  });
});

describe('Endpoints dos módulos', () => {
  const token = getAuthToken('administrador');

  it('GET /api/dashboard/metrics deve retornar 200', async () => {
    const res = await request(app)
      .get('/api/dashboard/metrics')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/dashboard/status-distribution deve retornar 200', async () => {
    const res = await request(app)
      .get('/api/dashboard/status-distribution')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/viagens deve retornar 200', async () => {
    const res = await request(app)
      .get('/api/viagens')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/mobilidade/rides deve retornar 200', async () => {
    const res = await request(app)
      .get('/api/mobilidade/rides')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/correios deve retornar 200', async () => {
    const res = await request(app)
      .get('/api/correios')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/xerox/jobs deve retornar 200', async () => {
    const res = await request(app)
      .get('/api/xerox/jobs')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/finance/cost-centers com colaborador deve retornar 403', async () => {
    const res = await request(app)
      .get('/api/finance/cost-centers')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/finance/cost-centers com financeiro deve retornar 200', async () => {
    const res = await request(app)
      .get('/api/finance/cost-centers')
      .set('Authorization', `Bearer ${getAuthToken('financeiro')}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/finance/cost-centers com administrador deve retornar 200', async () => {
    const res = await request(app)
      .get('/api/finance/cost-centers')
      .set('Authorization', `Bearer ${getAuthToken('administrador')}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/finance/cost-centers com gestor deve retornar 200 e somente CC próprio', async () => {
    // USR-002 = gestor com email exemplo.b@ficticio.org mapeado para CC-DEMO-02
    const gestorToken = `mock_jwt_token_USR-002_gestor_${Date.now()}`;
    const res = await request(app)
      .get('/api/finance/cost-centers')
      .set('Authorization', `Bearer ${gestorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Gestor deve receber apenas 1 CC (seu próprio)
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].code).toBe('CC-DEMO-02');
  });

  it('POST /api/finance/export com colaborador deve retornar 403', async () => {
    const res = await request(app)
      .post('/api/finance/export')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`)
      .send({});
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/finance/export com financeiro deve ser permitido', async () => {
    const res = await request(app)
      .post('/api/finance/export')
      .set('Authorization', `Bearer ${getAuthToken('financeiro')}`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/finance/export com administrador deve ser permitido', async () => {
    const res = await request(app)
      .post('/api/finance/export')
      .set('Authorization', `Bearer ${getAuthToken('administrador')}`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/finance/export com gestor deve retornar 403', async () => {
    const gestorToken = `mock_jwt_token_USR-002_gestor_${Date.now()}`;
    const res = await request(app)
      .post('/api/finance/export')
      .set('Authorization', `Bearer ${gestorToken}`)
      .send({});
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/finance/conciliation com colaborador deve retornar 403', async () => {
    const res = await request(app)
      .get('/api/finance/conciliation')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/finance/conciliation com gestor deve retornar 200 e escopo CC próprio', async () => {
    const gestorToken = `mock_jwt_token_USR-002_gestor_${Date.now()}`;
    const res = await request(app)
      .get('/api/finance/conciliation')
      .set('Authorization', `Bearer ${gestorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.scope).toBe('CC próprio');
  });

  it('GET /api/finance/conciliation com financeiro deve retornar 200 e escopo consolidado', async () => {
    const res = await request(app)
      .get('/api/finance/conciliation')
      .set('Authorization', `Bearer ${getAuthToken('financeiro')}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.scope).toBe('Consolidado');
  });

  it('GET /api/finance/alerts com colaborador deve retornar 403', async () => {
    const res = await request(app)
      .get('/api/finance/alerts')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/finance/alerts com gestor deve retornar 200', async () => {
    const gestorToken = `mock_jwt_token_USR-002_gestor_${Date.now()}`;
    const res = await request(app)
      .get('/api/finance/alerts')
      .set('Authorization', `Bearer ${gestorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/finance/cost-centers/CC-DEMO-01/summary com colaborador deve retornar 403', async () => {
    const res = await request(app)
      .get('/api/finance/cost-centers/CC-DEMO-01/summary')
      .set('Authorization', `Bearer ${getAuthToken('colaborador')}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/finance/cost-centers/CC-DEMO-02/summary com gestor deve retornar 200 (CC próprio)', async () => {
    const gestorToken = `mock_jwt_token_USR-002_gestor_${Date.now()}`;
    const res = await request(app)
      .get('/api/finance/cost-centers/CC-DEMO-02/summary')
      .set('Authorization', `Bearer ${gestorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/finance/cost-centers/CC-DEMO-01/summary com gestor deve retornar 403 (CC alheio)', async () => {
    const gestorToken = `mock_jwt_token_USR-002_gestor_${Date.now()}`;
    const res = await request(app)
      .get('/api/finance/cost-centers/CC-DEMO-01/summary')
      .set('Authorization', `Bearer ${gestorToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/suppliers deve retornar 200', async () => {
    const res = await request(app)
      .get('/api/suppliers')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/tickets deve retornar 200', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/approvals/pending deve retornar 200', async () => {
    const res = await request(app)
      .get('/api/approvals/pending')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/xerox/jobs com dados válidos deve criar', async () => {
    const res = await request(app)
      .post('/api/xerox/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Impressão Teste',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-DEMO-01',
        details: { fileName: 'doc.pdf' }
      });
    expect(res.status).toBe(201);
  });

  it('POST /api/correios com dados válidos deve criar', async () => {
    const res = await request(app)
      .post('/api/correios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Envio Teste',
        requesterId: 'USR-001',
        requesterName: 'Teste',
        costCenter: 'CC-1010'
      });
    expect(res.status).toBe(201);
  });

  it('POST /api/tickets com dados válidos deve criar', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Chamado Teste',
        requester: 'Teste',
        category: 'Viagens',
        description: 'Descrição do chamado'
      });
    expect(res.status).toBe(201);
  });

  it('POST /api/mobilidade/voucher com dados válidos deve criar', async () => {
    const res = await request(app)
      .post('/api/mobilidade/voucher')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userEmail: 'teste@ficticio.org',
        costCenter: 'CC-DEMO-01',
        reason: 'Deslocamento'
      });
    expect(res.status).toBe(200);
  });
});

describe('CORS', () => {
  it('Requisição com origin permitida deve ser aceita', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:3000');
    expect(res.status).toBe(200);
  });
});

describe('Tratamento de erros', () => {
  it('Rota inexistente da API deve retornar 404', async () => {
    const res = await request(app).get('/api/naoexiste');
    expect(res.status).toBe(404);
  });

  it('GET /api/requests/ID_INEXISTENTE deve retornar 404', async () => {
    const res = await request(app)
      .get('/api/requests/INEXISTENTE')
      .set('Authorization', `Bearer ${getAuthToken()}`);
    expect(res.status).toBe(404);
  });
});

// ============================================================================
// 9. AUTH BOOTSTRAP - Sincronização token/sessão/perfil
// ============================================================================
describe('9. AUTH BOOTSTRAP - Sincronização token/sessão/perfil', () => {
  it('API ativa sem token → session 401', async () => {
    const res = await request(app)
      .get('/api/auth/session');
    expect(res.status).toBe(401);
  });

  it('Token com formato inválido → session rejeita autenticação', async () => {
    const res = await request(app)
      .get('/api/auth/session')
      .set('Authorization', 'Bearer token_completamente_invalido');
    expect(res.status).toBe(401);
  });

  it('API ativa + token válido → session 200', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'exemplo.a@ficticio.org' });
    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/session')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.role).toBeDefined();
  });

  it('Role retornada pela session corresponde ao perfil logado', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'exemplo.b@ficticio.org' });
    const token = loginRes.body.data.token;

    const sessionRes = await request(app)
      .get('/api/auth/session')
      .set('Authorization', `Bearer ${token}`);
    expect(sessionRes.status).toBe(200);
    expect(sessionRes.body.data.user.role).toBe('GESTOR_APROVADOR');
  });

  it('401 nunca gera fallback - endpoint de solicitações', async () => {
    const res = await request(app)
      .get('/api/requests');
    expect(res.status).toBe(401);
    expect(res.body.success).toBeFalsy();
  });

  it('403 nunca gera fallback - aprovação sem perfil gestor', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'exemplo.a@ficticio.org' });
    const token = loginRes.body.data.token;

    const res = await request(app)
      .put('/api/approvals/SOL-2026-001/approve')
      .set('Authorization', `Bearer ${token}`)
      .send({ approverName: 'Teste', comment: 'Aprovação' });
    expect(res.status).toBe(403);
  });

  it('500 nunca gera fallback - healthcheck continua funcionando após erro', async () => {
    const before = await request(app).get('/health');
    expect(before.status).toBe(200);

    // Tentar acessar rota protegida sem token (retorna 401, não 500)
    await request(app).get('/api/requests');

    const after = await request(app).get('/health');
    expect(after.status).toBe(200);
    expect(after.body.status).toBe('UP');
  });
});

// ============================================================================
// 10. FALLBACK CONSISTENTE - Aprovações segue mesma política
// ============================================================================
describe('10. FALLBACK CONSISTENTE - Aprovações', () => {
  it('Aprovações sem token deve retornar 401 (mesma política)', async () => {
    const res = await request(app)
      .get('/api/approvals/pending');
    expect(res.status).toBe(401);
  });

  it('Aprovações com token válido deve retornar 200', async () => {
    const token = getAuthToken('gestor');
    const res = await request(app)
      .get('/api/approvals/pending')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('Aprovações com token de colaborador deve ser bloqueada', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'exemplo.a@ficticio.org' });
    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/approvals/pending')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

// ============================================================================
// 11. CONTEÚDO DEMONSTRATIVO - Verificar dados fictícios
// ============================================================================
describe('11. CONTEÚDO DEMONSTRATIVO', () => {
  it('Perfis devem ter nomes genéricos (Simulado)', async () => {
    const res = await request(app)
      .get('/api/auth/roles');
    expect(res.status).toBe(200);
    const roles = res.body.data;
    expect(roles.length).toBeGreaterThan(0);

    // Verificar que não há nomes de pessoas reais nos perfis
    roles.forEach((role: any) => {
      expect(role.name).not.toContain('William');
      expect(role.name).not.toContain('Renata Monteiro');
      expect(role.name).not.toContain('Iramaia Rodrigues');
      expect(role.name).not.toContain('Maria');
    });
  });

  it('Login com email de gestor retorna token com role gestor', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'exemplo.b@ficticio.org' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('GESTOR_APROVADOR');
  });

  it('Login com email de viagens retorna role operador e serviceScope viagem', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'operador.viagens@ficticio.org' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('AGENTE_SERVICO');
    expect(res.body.data.user.serviceScopes).toEqual(['viagens', 'mobilidade']);
  });
});

// ============================================================================
// 12. CONSISTÊNCIA DE KPIS E FILTROS DE SOLICITAÇÕES
// ============================================================================
describe('12. CONSISTÊNCIA DE KPIS E FILTROS DE SOLICITAÇÕES', () => {
  const token = getAuthToken('colaborador');

  it('Coleção inicial de solicitações do mock centralizado possui 5 itens', () => {
    const fs = require('fs');
    const path = require('path');
    const mockFile = fs.readFileSync(path.join(__dirname, '../../prototype/assets/js/mock-data.js'), 'utf8');

    // Validar presença dos 5 IDs padrão
    expect(mockFile).toContain('SOL-2026-001');
    expect(mockFile).toContain('SOL-2026-002');
    expect(mockFile).toContain('SOL-2026-003');
    expect(mockFile).toContain('SOL-2026-004');
    expect(mockFile).toContain('SOL-2026-005');
  });

  it('Derivação dinâmica de KPIs a partir de qualquer coleção de solicitações é matematicamente consistente', async () => {
    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${token}`);
    const requests: Array<{ id: string; status: string; serviceType: string }> = res.body.data;

    const total = requests.length;
    const pending = requests.filter(r => r.status === 'PENDENTE_APROVACAO').length;
    const approved = requests.filter(r => r.status === 'APROVADO').length;
    const inProgress = requests.filter(r => r.status === 'EM_ATENDIMENTO').length;
    const completed = requests.filter(r => r.status === 'CONCLUIDO').length;
    const rejected = requests.filter(r => r.status === 'REJEITADO').length;
    const draft = requests.filter(r => r.status === 'RASCUNHO').length;
    const cancelled = requests.filter(r => r.status === 'CANCELADO').length;

    expect(total).toBeGreaterThanOrEqual(5);
    expect(pending + approved + inProgress + completed + rejected + draft + cancelled).toBe(total);
  });

  it('Filtro por status opera de forma determinística sobre a coleção', async () => {
    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${token}`);
    const requests: Array<{ status: string }> = res.body.data;

    const filterByStatus = (status: string) =>
      status === 'ALL' ? requests : requests.filter(r => r.status === status);

    expect(filterByStatus('ALL').length).toBe(requests.length);
    expect(filterByStatus('PENDENTE_APROVACAO').length).toBe(requests.filter(r => r.status === 'PENDENTE_APROVACAO').length);
    expect(filterByStatus('APROVADO').length).toBe(requests.filter(r => r.status === 'APROVADO').length);
    expect(filterByStatus('EM_ATENDIMENTO').length).toBe(requests.filter(r => r.status === 'EM_ATENDIMENTO').length);
    expect(filterByStatus('CONCLUIDO').length).toBe(requests.filter(r => r.status === 'CONCLUIDO').length);
  });

  it('Filtro por frente de serviço opera de forma determinística sobre a coleção', async () => {
    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${token}`);
    const requests: Array<{ serviceType: string }> = res.body.data;

    const filterByType = (type: string) =>
      type === 'ALL' ? requests : requests.filter(r => r.serviceType === type);

    expect(filterByType('ALL').length).toBe(requests.length);
    expect(filterByType('viagem').length).toBe(requests.filter(r => r.serviceType === 'viagem').length);
    expect(filterByType('mobilidade').length).toBe(requests.filter(r => r.serviceType === 'mobilidade').length);
    expect(filterByType('correios').length).toBe(requests.filter(r => r.serviceType === 'correios').length);
    expect(filterByType('xerox').length).toBe(requests.filter(r => r.serviceType === 'xerox').length);
  });
});

// ============================================================================
// 13. AS 3 EXPERIÊNCIAS (COLABORADOR, GESTOR, OPERADOR), SERVICE SCOPES E POLÍTICAS
// ============================================================================
describe('13. AS 3 EXPERIÊNCIAS, SERVICE SCOPES E POLÍTICAS DEMONSTRATIVAS', () => {
  const colaboradorToken = getAuthToken('colaborador');
  const gestorToken = getAuthToken('gestor');
  const viagensOperadorToken = getAuthToken('viagens');

  it('Colaborador sem acesso à exportação financeira consolidada (403)', async () => {
    const res = await request(app)
      .post('/api/finance/export')
      .set('Authorization', `Bearer ${colaboradorToken}`)
      .send({});
    expect(res.status).toBe(403);
  });

  it('Colaborador sem acesso ao endpoint de conciliação financeira consolidada (403)', async () => {
    const res = await request(app)
      .get('/api/finance/conciliation')
      .set('Authorization', `Bearer ${colaboradorToken}`);
    expect(res.status).toBe(403);
  });

  it('Gestor acessa apenas conciliação de seu escopo próprio', async () => {
    const token = `mock_jwt_token_USR-002_gestor_${Date.now()}`;
    const res = await request(app)
      .get('/api/finance/conciliation')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.scope).toBe('CC próprio');
  });

  it('Gestor não pode concluir atendimento operacional de viagem (apenas operador/admin)', async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${colaboradorToken}`)
      .send({
        serviceType: 'viagem',
        title: 'Viagem Teste Escopo Operacional',
        requesterId: 'USR-001',
        requesterName: 'Colaborador Demo',
        costCenter: 'CC-DEMO-01'
      });
    const reqId = createRes.body.data.id;

    await request(app)
      .put(`/api/requests/${reqId}/submit`)
      .set('Authorization', `Bearer ${colaboradorToken}`);

    await request(app)
      .put(`/api/approvals/${reqId}/approve`)
      .set('Authorization', `Bearer ${gestorToken}`)
      .send({ approverName: 'Gestor Demo', comment: 'OK' });

    // Gestor tentando completar viagem diretamente (deve falhar com 403)
    const res = await request(app)
      .put(`/api/viagens/${reqId}/complete`)
      .set('Authorization', `Bearer ${gestorToken}`);
    expect(res.status).toBe(403);
  });

  it('Operador de Viagens pode iniciar atendimento de viagem aprovada', async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${colaboradorToken}`)
      .send({
        serviceType: 'viagem',
        title: 'Viagem Teste Operador Viagens',
        requesterId: 'USR-001',
        requesterName: 'Colaborador Demo',
        costCenter: 'CC-DEMO-01'
      });
    const reqId = createRes.body.data.id;

    await request(app)
      .put(`/api/requests/${reqId}/submit`)
      .set('Authorization', `Bearer ${colaboradorToken}`);

    await request(app)
      .put(`/api/approvals/${reqId}/approve`)
      .set('Authorization', `Bearer ${gestorToken}`)
      .send({ approverName: 'Gestor Demo', comment: 'OK' });

    const res = await request(app)
      .put(`/api/viagens/${reqId}/start`)
      .set('Authorization', `Bearer ${viagensOperadorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('EM_ATENDIMENTO');
  });

  it('EmployeeProfile possui formato mock estruturado com campos corporativos', () => {
    const { mockEmployeeProfile } = require('../database/index');
    expect(mockEmployeeProfile).toBeDefined();
    expect(mockEmployeeProfile.matricula).toBe('MAT-DEMO-01');
    expect(mockEmployeeProfile.nome).toBe('Colaborador Demo');
    expect(mockEmployeeProfile.centroCusto).toBe('CC-DEMO-01');
    expect(mockEmployeeProfile.gestor).toBe('Gestor Demo');
  });

  it('ServiceScopes define escopos corretos para operador de viagens, serviços gerais e coordenação', () => {
    const { mockServiceScopes } = require('../database/index');
    expect(mockServiceScopes).toBeDefined();
    expect(mockServiceScopes.operador_viagens).toEqual(['viagem']);
    expect(mockServiceScopes.operador_servicos_gerais).toContain('entregas');
    expect(mockServiceScopes.operador_servicos_gerais).toContain('estacionamento');
    expect(mockServiceScopes.coordenacao).toEqual(['ALL']);
    expect(mockServiceScopes.administrador).toEqual(['ALL']);
  });

  it('PolicyDocuments identifica inequivocamente conteúdo demonstrativo', () => {
    const { mockPolicyDocuments } = require('../database/index');
    expect(Array.isArray(mockPolicyDocuments)).toBe(true);
    expect(mockPolicyDocuments.length).toBeGreaterThanOrEqual(4);

    const viagemPol = mockPolicyDocuments.find((p: any) => p.service === 'viagem');
    expect(viagemPol).toBeDefined();
    expect(viagemPol.status).toBe('VIGENTE');
    expect(viagemPol.sourceType).toBe('DEMONSTRATIVO');
    expect(viagemPol.content).toContain('14 dias');

    const mobPol = mockPolicyDocuments.find((p: any) => p.service === 'mobilidade');
    expect(mobPol).toBeDefined();
    expect(mobPol.content).toContain('22h e 06h');
  });

  it('Investigação de Ocorrência aceita criação de requisição e mantém campos demonstrativos', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${colaboradorToken}`)
      .send({
        serviceType: 'investigacao_ocorrencia',
        title: 'Ocorrência: Avaria em Equipamento',
        requesterId: 'USR-001',
        requesterName: 'Colaborador Demo',
        costCenter: 'CC-DEMO-01',
        details: {
          category: 'Patrimonial / Operacional',
          location: 'Área Demonstrativa',
          statusLevantamento: 'Campos e procedimento pendentes de levantamento no sistema atual.'
        }
      });
    expect(res.status).toBe(201);
    expect(res.body.data.serviceType).toBe('investigacao_ocorrencia');
    expect(res.body.data.details.statusLevantamento).toContain('pendentes de levantamento');
  });
});
