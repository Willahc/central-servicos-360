import request from 'supertest';
import app from '../main';

const token = (id:string, role:string) => `mock_jwt_token_${id}_${role}_${Date.now()}`;
const admin = () => token('USR-DEMO-06','ADMINISTRADOR');

describe('Administração de usuários, permissões e auditoria', () => {
  let createdId = '';
  let createdEmail = '';

  it('somente Admin lista usuários', async () => {
    const ok=await request(app).get('/api/admin/users').set('Authorization',`Bearer ${admin()}`);
    expect(ok.status).toBe(200); expect(ok.body.data.length).toBeGreaterThanOrEqual(4); expect(ok.body.data.every((u:any)=>u.id.startsWith('USR-DEMO'))).toBe(true);
    for(const [id,role] of [['USR-DEMO-01','COLABORADOR'],['USR-DEMO-03','AGENTE_SERVICO'],['USR-DEMO-02','GESTOR_APROVADOR']]) expect((await request(app).get('/api/admin/users').set('Authorization',`Bearer ${token(id,role)}`)).status).toBe(403);
  });

  it('Admin cria usuário demonstrativo e administra scope canônico', async () => {
    createdEmail=`agente.criado.${Date.now()}@hospital-demo.org`;
    const created=await request(app).post('/api/admin/users').set('Authorization',`Bearer ${admin()}`).send({employeeId:'MAT-DEMO-TEST',name:'Agente Demo Teste',email:createdEmail,role:'AGENTE_SERVICO',status:'ATIVO',serviceScopes:['viagem']});
    expect(created.status).toBe(201); createdId=created.body.data.id;
    const changed=await request(app).patch(`/api/admin/users/${createdId}/permissions`).set('Authorization',`Bearer ${admin()}`).send({role:'AGENTE_SERVICO',serviceScopes:['transporte'],approvalScopes:[]});
    expect(changed.status).toBe(200); expect(changed.body.data.serviceScopes).toEqual(['transporte']);
    const agentRequests=await request(app).get('/api/requests').set('Authorization',`Bearer ${token(createdId,'AGENTE_SERVICO')}`);
    expect(agentRequests.status).toBe(200); expect(agentRequests.body.data.every((item:any)=>item.serviceType==='transporte')).toBe(true);
  });

  it('mudanças de role e scope geram auditoria imutável', async () => {
    await request(app).patch(`/api/admin/users/${createdId}/permissions`).set('Authorization',`Bearer ${admin()}`).send({role:'GESTOR_APROVADOR',serviceScopes:[],approvalScopes:['CC-DEMO-01']});
    const history=await request(app).get('/api/admin/audit').set('Authorization',`Bearer ${admin()}`);
    expect(history.status).toBe(200); expect(history.body.data.some((e:any)=>e.resourceId===createdId&&e.action==='SERVICE_SCOPE_ALTERADO')).toBe(true); expect(history.body.data.some((e:any)=>e.resourceId===createdId&&e.action==='ROLE_ALTERADA')).toBe(true);
    expect((await request(app).patch('/api/admin/audit/AUD-DEMO-001').set('Authorization',`Bearer ${admin()}`).send({action:'EDITADO'})).status).toBe(404);
    expect((await request(app).delete('/api/admin/audit/AUD-DEMO-001').set('Authorization',`Bearer ${admin()}`)).status).toBe(404);
  });

  it('soft disable bloqueia autenticação e preserva histórico', async () => {
    const disabled=await request(app).patch(`/api/admin/users/${createdId}/access`).set('Authorization',`Bearer ${admin()}`).send({accessStatus:'DESATIVADO'});
    expect(disabled.status).toBe(200); expect(disabled.body.data.accessStatus).toBe('DESATIVADO');
    expect((await request(app).post('/api/auth/login').send({email:createdEmail})).status).toBe(401);
    const history=await request(app).get('/api/admin/audit').set('Authorization',`Bearer ${admin()}`);
    expect(history.body.data.some((e:any)=>e.resourceId===createdId&&e.action==='USUARIO_DESATIVADO')).toBe(true);
  });

  it('Admin mantém serviceScopes ALL', async () => {
    const user=await request(app).get('/api/admin/users/USR-DEMO-06').set('Authorization',`Bearer ${admin()}`);
    expect(user.status).toBe(200); expect(user.body.data.role).toBe('ADMINISTRADOR'); expect(user.body.data.serviceScopes).toEqual(['ALL']);
  });
});
