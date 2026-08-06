# Plano de Segurança, Ameaças e Controles (LGPD & STRIDE)

## 1. Classificação de Dados no Protótipo vs. Target

| Categoria de Dado | Trata Dado Real no MVP? | Classificação Target | Controles Aplicados no Protótipo |
| :--- | :--- | :--- | :--- |
| **Identidade de Colaborador** | **NÃO** (Apenas nomes fictícios) | Confidencial Interno | Isolamento 100% estático sem credenciais reais |
| **Dados de Pacientes** | **NÃO** (Proibido) | Altamente Confidencial | Ausência total de dados de saúde ou prontuários |
| **Centros de Custo & Gastos** | **NÃO** (Valores simulados) | Confidencial Interno | Valores fictícios para testes de interface |
| **Logs de Auditoria** | **SIM** (Na sessão local) | Auditável | Gravados no localStorage com prefixo `cs360_` |

---

## 2. Matriz de Ameaças (STRIDE) e Controles Propostos

1. **Spoofing (Falsificação de Identidade)**:
   - *Risco*: Acesso indevido a perfis administrativos.
   - *Controle Target*: Autenticação OAuth 2.0 / SAML 2.0 via IdP corporativo com MFA.
   - *Controle no MVP*: Aviso visual constante de "Autenticação simulada sem senha".

2. **Tampering (Adulteração de Dados)**:
   - *Risco*: Alteração não autorizada de requisições de viagem ou valores.
   - *Controle Target*: Assinatura de payload e verificação de hash.
   - *Controle no MVP*: Sanitização contra XSS usando `textContent` em todas as entradas.

3. **Repudiation (Repúdio de Ações)**:
   - *Risco*: Gestor negar ter aprovado solicitação.
   - *Controle Target / MVP*: Registro auditável obrigatório de eventos (`AuditEvent`) contendo timestamp, usuário, perfil e justificativa.

4. **Information Disclosure (Vazamento de Informação)**:
   - *Risco*: Exposição acidental de dados pessoais de colaboradores (LGPD).
   - *Controle no MVP*: Garantia total de uso exclusivo de dados fictícios sem conexão externa (RN-SEG-001).
