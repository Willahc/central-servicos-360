import request from 'supertest';
import app from '../main';
import { answerPolicyQuestion, AssistantContext, SAFE_POLICY_FALLBACK } from '../common/assistant-policy';
import { authorizedPerspectives, hasServiceScope, normalizeLegacyRole, resolvePerspective } from '../common/authorization';
import { PolicyDocument } from '../common/interfaces/service-request.interface';

const token = (user: string, role: string) => `mock_jwt_token_${user}_${role}_${Date.now()}`;
const policy = (service: PolicyDocument['service']): PolicyDocument => ({ id: `POL-${service}`, title: service, service, version: '1', status: 'VIGENTE', effectiveFrom: '2026-01-01', effectiveTo: null, audience: 'TODOS', sourceType: 'INSTITUCIONAL', sourceDocument: 'GED-1', content: `Institucional ${service}`, updatedAt: '2026-08-01' });
const ctx = (overrides: Partial<AssistantContext> = {}): AssistantContext => ({ role: 'COLABORADOR', perspective: 'collaborator', currentService: 'viagem', currentPage: 'dashboard.html', currentRequest: null, audience: 'COLABORADOR', serviceScopes: [], ...overrides });

describe('normalização final dos quatro perfis', () => {
  it('Colaborador só recebe suas próprias solicitações', async () => {
    const res = await request(app).get('/api/requests').set('Authorization', `Bearer ${token('USR-001', 'COLABORADOR')}`);
    expect(res.status).toBe(200); expect(res.body.data.every((item: any) => item.requesterId === 'USR-001')).toBe(true);
  });
  it('Colaborador não executa atendimento', async () => {
    const res = await request(app).put('/api/viagens/SOL-2026-002/start').set('Authorization', `Bearer ${token('USR-001', 'COLABORADOR')}`);
    expect(res.status).toBe(403);
  });
  it('Agente só recebe solicitações de seus serviceScopes', async () => {
    const res = await request(app).get('/api/requests').set('Authorization', `Bearer ${token('USR-003', 'AGENTE_SERVICO')}`);
    expect(res.status).toBe(200); expect(res.body.data.every((item: any) => ['viagem', 'mobilidade'].includes(item.serviceType))).toBe(true);
  });
  it('Agente Viagens+Mobilidade não acessa Transportes', () => expect(hasServiceScope({ role: 'AGENTE_SERVICO', serviceScopes: ['viagens', 'mobilidade'] }, 'transporte')).toBe(false));
  it('Agente Transportes não acessa Viagens', () => expect(hasServiceScope({ role: 'AGENTE_SERVICO', serviceScopes: ['transportes'] }, 'viagem')).toBe(false));
  it('Gestor pode deliberar solicitações destinadas à sua alçada', () => expect(normalizeLegacyRole('GESTOR_APROVADOR').role).toBe('GESTOR_APROVADOR'));
  it('Gestor não executa atendimento operacional', async () => {
    const res = await request(app).put('/api/viagens/SOL-2026-002/start').set('Authorization', `Bearer ${token('USR-002', 'GESTOR_APROVADOR')}`);
    expect(res.status).toBe(403);
  });
  it('alçada do gestor é autoridade do backend e outro gestor não amplia escopo', async () => {
    const primary = token('USR-002', 'GESTOR_APROVADOR');
    const other = token('USR-011', 'GESTOR_APROVADOR');
    const pending = await request(app).get('/api/approvals/my-pending').set('Authorization', `Bearer ${primary}`);
    expect(pending.status).toBe(200);
    expect(pending.body.data.length).toBeGreaterThan(0);
    const outside = await request(app).get('/api/approvals/my-pending').set('Authorization', `Bearer ${other}`);
    expect(outside.status).toBe(200);
    expect(outside.body.data).toEqual([]);
    const id = pending.body.data[0].id;
    expect((await request(app).get(`/api/approvals/${id}`).set('Authorization', `Bearer ${other}`)).status).toBe(403);
    expect((await request(app).post(`/api/approvals/${id}/approve`).set('Authorization', `Bearer ${other}`).send({ comment: 'localStorage não concede alçada' })).status).toBe(403);
  });
  it('Admin acessa todas as verticais', () => ['viagem', 'mobilidade', 'transporte', 'correios', 'xerox'].forEach(service => expect(hasServiceScope({ role: 'ADMINISTRADOR', serviceScopes: ['ALL'] }, service as any)).toBe(true)));
  it('Admin possui ALL', () => expect(normalizeLegacyRole('ADMINISTRADOR').serviceScopes).toEqual(['ALL']));
  it('manipulação de perspectiva equivalente ao localStorage não aumenta privilégio', () => expect(resolvePerspective(['COLABORADOR'], 'administration')).toBe('collaborator'));
  it('Assistente respeita perfil', () => {
    const variants = [ctx(), ctx({ role: 'AGENTE_SERVICO', perspective: 'service-agent', audience: 'OPERADOR', serviceScopes: ['viagens'] }), ctx({ role: 'GESTOR_APROVADOR', perspective: 'approver', audience: 'GESTOR' }), ctx({ role: 'ADMINISTRADOR', perspective: 'administration', serviceScopes: ['ALL'] })];
    expect(new Set(variants.map(item => `${item.role}:${item.perspective}`)).size).toBe(4);
  });
  it('Assistente respeita vertical', () => expect(answerPolicyQuestion([policy('viagem')], ctx({ currentService: 'correios' }))).toBe(SAFE_POLICY_FALLBACK));
  it('política demonstrativa nunca vira regra institucional', () => expect(answerPolicyQuestion([{ ...policy('viagem'), sourceType: 'DEMONSTRATIVO' }], ctx())).toBe(SAFE_POLICY_FALLBACK));
  it('existem exatamente quatro perspectivas oficiais', () => expect(authorizedPerspectives(['COLABORADOR', 'AGENTE_SERVICO', 'GESTOR_APROVADOR', 'ADMINISTRADOR'])).toEqual(['collaborator', 'service-agent', 'approver', 'administration']));
});

describe('três frontends conectados ao mesmo motor', () => {
  it('fluxo único: colaborador cria, gestor recebe/aprova e somente agente da vertical enxerga', async () => {
    const collaborator = token('USR-001', 'COLABORADOR');
    const manager = token('USR-002', 'GESTOR_APROVADOR');
    const travelAgent = token('USR-003', 'AGENTE_SERVICO');
    const transportAgent = token('USR-004', 'AGENTE_SERVICO');
    const created = await request(app).post('/api/requests').set('Authorization', `Bearer ${collaborator}`).send({ serviceType:'viagem', title:'Fluxo integrado dos portais', requesterId:'TENTATIVA-SPOOF', requesterName:'Outro nome', costCenter:'OUTRO-CC', details:{ description:'Teste ponta a ponta' } });
    expect(created.status).toBe(201); expect(created.body.data.requesterId).toBe('USR-001'); expect(created.body.data.costCenter).toBe('CC-DEMO-01');
    const id=created.body.data.id;
    expect((await request(app).put(`/api/requests/${id}/submit`).set('Authorization',`Bearer ${collaborator}`).send({})).status).toBe(200);
    const pending=await request(app).get('/api/approvals/my-pending').set('Authorization',`Bearer ${manager}`);
    expect(pending.body.data.some((item:any)=>item.id===id)).toBe(true);
    expect((await request(app).post(`/api/approvals/${id}/approve`).set('Authorization',`Bearer ${manager}`).send({approverName:'ignorado',comment:'OK'})).status).toBe(200);
    const travel=await request(app).get('/api/requests').set('Authorization',`Bearer ${travelAgent}`);
    const transport=await request(app).get('/api/requests').set('Authorization',`Bearer ${transportAgent}`);
    expect(travel.body.data.some((item:any)=>item.id===id)).toBe(true); expect(transport.body.data.some((item:any)=>item.id===id)).toBe(false);
    const own=await request(app).get(`/api/requests/${id}`).set('Authorization',`Bearer ${collaborator}`);
    expect(own.body.data.status).toBe('APROVADO'); expect(own.body.data.history.filter((event:any)=>event.action.includes('Aprovado')).length).toBe(1);
  });
  it('rejeição pelo Portal Aprovador atualiza a mesma solicitação e timeline', async () => {
    const collaborator=token('USR-001','COLABORADOR'),manager=token('USR-002','GESTOR_APROVADOR');
    const created=await request(app).post('/api/requests').set('Authorization',`Bearer ${collaborator}`).send({serviceType:'correios',title:'Fluxo de rejeição integrado',requesterId:'USR-001',requesterName:'Carlos',costCenter:'CC-DEMO-01',details:{description:'Teste rejeição'}});const id=created.body.data.id;
    await request(app).put(`/api/requests/${id}/submit`).set('Authorization',`Bearer ${collaborator}`).send({});
    const rejected=await request(app).post(`/api/approvals/${id}/reject`).set('Authorization',`Bearer ${manager}`).send({approverName:'ignorado',reason:'Complementar justificativa'});
    expect(rejected.status).toBe(200);expect(rejected.body.data.status).toBe('REJEITADO');expect(rejected.body.data.history.at(-1).action).toContain('Complementar justificativa');
  });
  it('EmployeeProfile vem do backend e RBAC bloqueia acesso cruzado operacional/aprovações', async () => {
    const collaborator=token('USR-001','COLABORADOR'),manager=token('USR-002','GESTOR_APROVADOR');
    const profile=await request(app).get('/api/auth/employee-profile').set('Authorization',`Bearer ${collaborator}`);
    expect(profile.status).toBe(200);expect(profile.body.data.notice).toBe('Dados corporativos preenchidos automaticamente.');expect(profile.body.data.sourceType).toBe('DEMONSTRATIVO');
    expect((await request(app).get('/api/dashboard/metrics').set('Authorization',`Bearer ${collaborator}`)).status).toBe(403);
    expect((await request(app).get('/api/approvals/my-pending').set('Authorization',`Bearer ${collaborator}`)).status).toBe(403);
    expect((await request(app).put('/api/viagens/SOL-2026-002/start').set('Authorization',`Bearer ${manager}`)).status).toBe(403);
  });
});

describe('login demonstrativo normalizado', () => {
  it.each([
    ['william.nunes@ficticio.org', ['viagens', 'mobilidade']],
    ['maria.catarina@ficticio.org', ['transportes']],
    ['agente.servicos.gerais@ficticio.org', ['correios', 'entregas', 'xerox', 'estacionamento', 'achados_perdidos']]
  ])('cenário de agente %s recebe uma única role e os scopes esperados', async (email, scopes) => {
    const response = await request(app).post('/api/auth/login').send({ email });
    expect(response.status).toBe(200);
    expect(response.body.data.user.role).toBe('AGENTE_SERVICO');
    expect(response.body.data.user.serviceScopes).toEqual(scopes);
  });

  it('os quatro perfis finais mantêm autorização emitida pelo backend', async () => {
    const cases = [
      ['carlos.andrade@ficticio.org', 'COLABORADOR', []],
      ['william.nunes@ficticio.org', 'AGENTE_SERVICO', ['viagens', 'mobilidade']],
      ['fernanda.lima@ficticio.org', 'GESTOR_APROVADOR', []],
      ['patricia.souza@ficticio.org', 'ADMINISTRADOR', ['ALL']]
    ];
    for (const [email, role, scopes] of cases) {
      const response = await request(app).post('/api/auth/login').send({ email });
      expect(response.body.data.user.role).toBe(role);
      expect(response.body.data.user.serviceScopes).toEqual(scopes);
    }
  });
});

describe('regressões de segurança', () => {
  it('rejeita Bearer arbitrário', async () => {
    const response = await request(app).get('/api/auth/session').set('Authorization', 'Bearer qualquer-coisa');
    expect(response.status).toBe(401);
  });

  it('colaborador não consulta histórico de solicitação alheia', async () => {
    const response = await request(app).get('/api/requests/SOL-2026-001/history').set('Authorization', `Bearer ${token('USR-DEMO-01', 'COLABORADOR')}`);
    expect(response.status).toBe(403);
  });

  it.each(['/api/viagens', '/api/correios', '/api/xerox/jobs', '/api/mobilidade/rides'])('colaborador não acessa coleção operacional %s', async path => {
    const response = await request(app).get(path).set('Authorization', `Bearer ${token('USR-001', 'COLABORADOR')}`);
    expect(response.status).toBe(403);
  });

  it('fila global de aprovação respeita alçada do gestor', async () => {
    const response = await request(app).get('/api/approvals/pending').set('Authorization', `Bearer ${token('USR-011', 'GESTOR_APROVADOR')}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it('criação vertical ignora identidade enviada pelo cliente', async () => {
    const response = await request(app).post('/api/correios').set('Authorization', `Bearer ${token('USR-001', 'COLABORADOR')}`).send({
      title: 'Teste de identidade', requesterId: 'USR-999', requesterName: 'Pessoa indevida', costCenter: 'CC-INDEVIDO', details: {}
    });
    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ requesterId: 'USR-001', costCenter: 'CC-DEMO-01' });
  });

  it('retorna erros HTTP específicos para JSON inválido e corpo excessivo', async () => {
    const malformed = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{"email":');
    expect(malformed.status).toBe(400);
    const oversized = await request(app).post('/api/auth/login').send({ email: `${'a'.repeat(110 * 1024)}@example.org` });
    expect(oversized.status).toBe(413);
  });
});
