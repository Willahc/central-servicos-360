# Especificação de Arquitetura de Autenticação SSO, RBAC e Integrações (Fase 0.6C)

> **Projeto**: Central de Serviços 360  
> **Fase**: 0.6C — Mapeamento de Integrações, Autenticação SSO e RBAC  
> **Status**: Approved / Validados  
> **Nota de Acessibilidade**: Verificações de acessibilidade alinhadas a boas práticas, sem declaração de conformidade formal.

---

## 1. Visão Geral da Arquitetura de Identidade e Segurança

Para a Fase 1 (desenvolvimento em código de produção com Node.js / NestJS e Next.js), a **Central de Serviços 360** adota um modelo de autenticação federada via **Single Sign-On (SSO)** alinhado às diretrizes de TI corporativa do Hospital Sírio-Libanês. `[Definida — Visão do Produto]`

---

## 2. Protocolo de Autenticação SSO (OIDC / OAuth 2.0 / SAML 2.0)

### 2.1. Fluxo de Autenticação Corporativa (OpenID Connect / OAuth 2.0)

```
+--------------+               +----------------------+               +-----------------------+
| Colaborador  |               | Central 360 (Client) |               | Azure AD / Okta (IdP) |
+--------------+               +----------------------+               +-----------------------+
       |                                  |                                       |
       | 1. Acessa Portal                 |                                       |
       |--------------------------------->|                                       |
       |                                  | 2. Redireciona /authorize             |
       |                                  |-------------------------------------->|
       |                                  |                                       |
       | 3. Login e MFA no IdP            |                                       |
       |<-------------------------------------------------------------------------|
       |                                  |                                       |
       | 4. Callback com Auth Code        |                                       |
       |--------------------------------->|                                       |
       |                                  | 5. Troca Code por Tokens (/token)     |
       |                                  |-------------------------------------->|
       |                                  | 6. Retorna Access Token + ID Token    |
       |                                  |<--------------------------------------|
       | 7. Sessão Autenticada (JWT)      |                                       |
       |<---------------------------------|                                       |
```

### 2.2. Payload Canônico do JSON Web Token (JWT)

```json
{
  "iss": "https://identity.siriolibanes.org.br/auth/realms/hsl",
  "sub": "USR-001928",
  "aud": "cs360-core-api",
  "exp": 1786041600,
  "iat": "2026-08-06T15:50:00Z",
  "name": "Carlos Andrade",
  "email": "carlos.andrade@hsl.org.br",
  "cpf": "123.456.789-00",
  "department": "Enfermagem Assistencial",
  "cost_center": "CC-3021",
  "roles": [
    "cs360_colaborador",
    "cs360_solicitante"
  ],
  "permissions": [
    "requests:create",
    "requests:read:own",
    "tickets:read:own"
  ]
}
```

---

## 3. Mapeamento das 9 Roles do RBAC para a Fase 1

| Identificador no JWT | Perfil de Acesso | Permissões Granulares |
| :--- | :--- | :--- |
| `cs360_colaborador` | Colaborador / Solicitante | `requests:create`, `requests:read:own`, `kb:query` |
| `cs360_gestor` | Gestor Aprovador | `approvals:read:subordinates`, `approvals:decide` |
| `cs360_viagens` | Gestão de Viagens | `travel:manage`, `non_flown_tickets:manage` |
| `cs360_faturamento` | Faturamento / Apoio | `mobility:manage`, `invoices:import`, `mail:manage` |
| `cs360_coordenadora` | Coordenadora Operacional | `dashboards:tactical`, `exceptions:manage`, `sla:monitor` |
| `cs360_gerencia` | Gerência | `dashboards:strategic`, `reports:export` |
| `cs360_financeiro` | Financeiro | `cost_centers:reconcile`, `financial:export` |
| `cs360_administrador` | Administrador | `system:config`, `users:manage`, `demo:reset` |
| `cs360_auditoria` | Auditoria | `audit:read`, `compliance:export` |

---

## 4. Matriz de Segurança e Proteção de Dados (LGPD & OWASP)

- **Sanitização de Inputs**: Todos os parâmetros e textos enviados nas requisições passam por tratamento contra XSS (cross-site scripting) e SQL Injection.
- **Proteção CSRF**: Tokens de proteção SameSite Strict e verificação de cabeçalhos origin/referer em rotas mutáveis (POST, PUT, DELETE).
- **Trilha de Auditoria Imutável**: Registro compulsório dos campos `user_id`, `action`, `resource`, `ip_address`, `timestamp` e `payload_hash` na tabela `audit_logs` para todas as ações de escrita e deliberação.
- **Isolamento de Tenant e Centros de Custo**: A validação de escopo proíbe que um gestor visualize solicitações fora dos seus centros de custo autorizados.
