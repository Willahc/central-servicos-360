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
- [ ] Mapeamento aprovado das integrações com ERP/SAP e parceiros externos. `[Pendente de Validação Técnica]`

### 2.2. Segurança e Arquitetura
- [x] Ausência de chamadas de rede externas e ausência de credenciais/senhas no código. `[Definida — Regra Funcional]`
- [x] Sanitização de entradas contra injeção de HTML/XSS. `[Definida — Regra Funcional]`
- [ ] Especificação da arquitetura de autenticação SSO (SAML 2.0 / OAuth2). `[Pendente de Validação Técnica]`

### 2.3. Governança e Regras de Negócio
- [x] 4 documentos canônicos preservados com hashes SHA256 verificados. `[Definida — Visão do Produto]`
- [ ] Homologação oficial da matriz de alçadas e aprovação dos Centros de Custo. `[Pendente de Validação Institucional]`
- [ ] Validação jurídica/suprimentos dos contratos com fornecedores. `[Pendente de Validação Contratual]`

---

## 3. Matriz de Decisão Go / No-Go para a Fase 1

| Pilar de Avaliação | Requisito Mandatório | Status da Avaliação |
| :--- | :--- | :---: |
| **Escopo Estático (Fase 0)** | Protótipo 100% aprovado pela governança do projeto. | `Aprovado (Fase 0.5)` |
| **Documentação Normativa (Fase 0.6A)** | 10 documentos em `docs/` finalizados, auditados e validados com sucesso. | `Aprovado (Fase 0.6A)` |
| **Aprovação Institucional** | Assinatura do sponsor institucional para início da Fase 1. | `[Pendente de Validação Institucional]` |
| **Infraestrutura de TI** | Homologação do ambiente de hospedagem Next.js/NestJS. | `[Pendente de Validação Técnica]` |
