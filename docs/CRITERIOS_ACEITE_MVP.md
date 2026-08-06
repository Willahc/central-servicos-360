# Critérios de Aceite para Prontidão do MVP (Fase 1)

> **Projeto**: Central de Serviços 360  
> **Fase**: 0.6A — Documentação Normativa  
> **Status**: Requisitos de Transição do Protótipo Estático para a Fase 1  
> **Nota de Acessibilidade**: Verificações de acessibilidade alinhadas a boas práticas, sem declaração de conformidade formal.

---

## 1. Visão Geral da Prontidão

Para que o projeto avance da fase de protótipo estático (Fase 0) para o desenvolvimento funcional em código de produção (Fase 1 com Next.js / NestJS), os critérios de aceite estruturados a seguir devem ser validados. `[Definida — Visão do Produto]`

---

## 2. Checklist de Critérios de Aceite

### 2.1. Funcionalidades e Escopo
- [x] 18 páginas estáticas cobrindo todas as frentes operacionais ativas e funcionais via `file://`. `[Definida — Regra Funcional]`
- [x] Jornada persistente de solicitação, aprovação com justificativa e auditoria simulada. `[Definida — Regra Funcional]`
- [x] Mapeamento aprovado das integrações com ERP/SAP e parceiros externos (Fase 0.6C). `[Definida — Regra Funcional]`

### 2.2. Segurança e Arquitetura
- [x] Ausência de chamadas de rede externas e ausência de credenciais/senhas no código. `[Definida — Regra Funcional]`
- [x] Sanitização de entradas contra injeção de HTML/XSS. `[Definida — Regra Funcional]`
- [x] Especificação da arquitetura de autenticação SSO (SAML 2.0 / OAuth2) (Fase 0.6C). `[Definida — Regra Funcional]`

### 2.3. Governança e Regras de Negócio
- [x] 4 documentos canônicos preservados com hashes SHA256 verificados. `[Definida — Visão do Produto]`
- [x] Especificação técnica de adaptadores, mocks e regras de exceção (Fase 0.6B). `[Definida — Regra Funcional]`
- [x] Matriz de prontidão Go/No-Go homologada para início da Fase 1 (Fase 0.6D). `[Definida — Visão do Produto]`

---

## 3. Matriz de Decisão Go / No-Go para a Fase 1

| Pilar de Avaliação | Requisito Mandatório | Status da Avaliação |
| :--- | :--- | :---: |
| **Escopo Estático (Fase 0)** | Protótipo 100% aprovado pela governança do projeto. | `Aprovado (Fase 0.5)` |
| **Documentação Normativa (Fase 0.6A)** | 10 documentos em `docs/` finalizados, auditados e validados. | `Aprovado (Fase 0.6A)` |
| **Mocks e Adaptadores (Fase 0.6B)** | Especificação de adaptadores e dados simulados concluída. | `Aprovado (Fase 0.6B)` |
| **Arquitetura & SSO (Fase 0.6C)** | Mapeamento de integrações, OIDC/OAuth2 e RBAC definido. | `Aprovado (Fase 0.6C)` |
| **Matriz Go / No-Go (Fase 0.6D)** | Homologação final e autorização de início da Fase 1. | `Aprovado (Fase 0.6D)` |

