# Central de Serviços 360 (Nome Provisório)

Plataforma interna unificada para a Central de Serviços da Diretoria de Infraestrutura & Supply Chain do Hospital Sírio-Libanês.

> **Status do Projeto**: Especificação da Arquitetura e Protótipo MVP Inicial.
> **Modo de Operação Atual**: O protótipo utilizará **exclusivamente dados fictícios e adaptadores simulados (mocks)**. Nenhuma API externa ou integração de produção está declarada como ativa nesta etapa.

---

## 📌 Visão Geral

A **Central de Serviços 360** `[Definida — Visão do Produto]` (RN-GER-001) tem como objetivo centralizar o atendimento e a gestão operacional das 4 frentes da Central de Serviços:

1. **Viagens Corporativas**
2. **Mobilidade Corporativa**
3. **Correios**
4. **Xerox e Impressões**

A plataforma atuará como **porta de entrada única** para os colaboradores. Na experiência final visada, os sistemas externos de execução (Argo, Uber, SAP, Senior, Copastur, etc.) deverão permanecer invisíveis nos bastidores `[Definida — Visão do Produto]` (RN-GER-002). A transição para esse modelo prevê uma fase intermediária com adaptadores simulados (RN-INT-004), sujeita à disponibilidade técnica (RN-GER-006) e contratual (RN-GER-007) das integrações.

---

## 🎯 Objetivos Principais

- **Unificação da Experiência** `[Definida — Visão do Produto]`: Oferecer um canal único para solicitação e acompanhamento de serviços (RN-GER-001).
- **Eficiência Operacional** `[Definida — Visão do Produto]`: Reduzir trabalhos manuais, retrabalhos e e-mails operacionais (RN-ECO-005).
- **Governança e Conformidade** `[Definida — Regra Funcional]`: Aplicar regras de negócio e pré-validação antes da contratação dos serviços (RN-GER-003, RN-GER-005).
- **Rastreabilidade e Auditoria** `[Definida — Regra Funcional]`: Garantir o registro de auditoria para ações críticas e alterações relevantes (RN-SEG-003).
- **Transparência de Gestão** `[Definida — Regra Funcional]`: Consolidar relatórios operacionais e financeiros das 4 frentes.
- **Autoatendimento Seguro** `[Definida — Regra Funcional]`: Disponibilizar chatbot de suporte ancorado exclusivamente na documentação oficial aprovada (RN-CHAT-001, RN-CHAT-002).

---

## 🗺️ Módulos Previstos

1. **Portal do Colaborador**: Catálogo de serviços, solicitações, acompanhamento, documentos e notificações.
2. **Viagens Corporativas**: Gestão de solicitações de voos, hospedagem, seguro viagem (RN-VIA-003) e acompanhamento de créditos/bilhetes não voados (RN-VIA-002).
3. **Mobilidade**: Gestão de solicitações de corridas, inclusão/exclusão de usuários (RN-MOB-001) e vinculação a centros de custo (RN-MOB-003).
4. **Correios**: Solicitações de envio, acompanhamento de rastreamento (RN-COR-003) e registro de modalidade.
5. **Xerox e Impressões**: Solicitação de impressões A4/A3, digitalizações e acabamentos gráficos (RN-XER-001).
6. **Aprovações**: Motor configurável de aprovações `[Proposta de Produto]` (RN-GER-004), com alçadas e limites pendentes `[Pendente de Validação Institucional]` (RN-GER-010).
7. **Atendimento**: Central de chamados e filas de suporte `[Proposta de Produto]` (RN-XER-002), com SLAs pendentes `[Pendente de Validação Institucional]` (RN-XER-003).
8. **Financeiro**: Consolidação de despesas por centro de custo, provisionamento e apoio à conciliação (RN-FIN-001, RN-FIN-004).
9. **Fornecedores**: Acompanhamento de contratos, SLAs e vigências.
10. **Indicadores e Relatórios**: Dashboards de consumo, bilhetes não voados e métricas de eficiência.
11. **Base de Conhecimento e Chatbot**: Autoatendimento fundado em documentos oficiais com citação de fonte (RN-CHAT-001).
12. **Administração e Auditoria**: Gestão de perfis `[Proposta de Produto]` (RN-SEG-002), logs de auditoria (RN-SEG-003) e parametrizações do sistema.

---

## 🏗️ Arquitetura Conceitual

```
+-----------------------------------------------------------------------+
|                       PORTAL DO COLABORADOR                           |
|       (Solicitações, Acompanhamento, Chatbot, Visualização)           |
+-----------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                    CENTRAL DE SERVIÇOS 360 (CORE)                     |
|  - Orquestrador de Processos & Regras de Negócio                      |
|  - Motor de Aprovações (Proposta - RN-GER-004)                        |
|  - Central de Chamados & Atendimento (Proposta - RN-XER-002)          |
|  - Base de Conhecimento Oficial (RN-CHAT-001)                         |
|  - Relatórios, BI & Trilha de Auditoria (RN-SEG-003)                  |
+-----------------------------------------------------------------------+
                                    |
            (Camada de Adaptadores / Interfaces - RN-INT-001)
                                    |
     +------------------------------+------------------------------+
     |                              |                              |
     v                              v                              v
[Sistemas de Viagem]        [Sistemas de Mobilidade]      [Sistemas Corporativos]
- Argo / My Argo (Simulado) - Uber for Business (Sim.)    - SAP (Simulado)
- Copastur (Simulado)       - Táxi Digital (Simulado)     - Senior (Simulado)
- Hotéis / Locadoras        - Neonpass (Simulado)         - Identity Provider (Sim.)
```

---

## 🚦 Visão Target vs. MVP Inicial

| Aspecto | Visão Target `[Definida — Visão do Produto]` | MVP Inicial `[Definida — Regra Funcional]` |
| :--- | :--- | :--- |
| **Experiência** | Portal único com sistemas de bastidores totalmente invisíveis (RN-GER-002). | Portal funcional operando com 100% de dados e perfis simulados (RN-SEG-001). |
| **Integrações** | APIs reais conectadas (RN-GER-006, RN-GER-007, RN-INT-003). | Adaptadores simulados (mocks) sem chamadas externas (RN-INT-004). |
| **Identidade** | Single Sign-On corporativo `[Pendente de Validação Técnica]`. | Login simulado com alternância entre os 9 perfis propostos (RN-SEG-002). |
| **Chatbot** | Motor de IA homologado `[Pendente de Validação Técnica]` (RN-CHAT-004). | Chatbot local respondendo com base em arquivos Markdown (RN-CHAT-001). |

---

## 📂 Organização da Documentação

- [`README.md`](file:///C:/Users/winsilva/Documents/Central%20de%20Servi%C3%A7os%20360/README.md): Visão geral do produto, módulos, arquitetura conceitual e escopo do MVP.
- [`docs/CONTEXTO_PROJETO.md`](file:///C:/Users/winsilva/Documents/Central%20de%20Servi%C3%A7os%20360/docs/CONTEXTO_PROJETO.md): Contexto institucional, equipe, sistemas envolvidos, hipóteses de economia e pendências.
- [`docs/ESCOPO_FUNCIONAL.md`](file:///C:/Users/winsilva/Documents/Central%20de%20Servi%C3%A7os%20360/docs/ESCOPO_FUNCIONAL.md): Detalhamento dos 12 módulos, propostas de RBAC, máquina de estados e jornadas funcionais.
- [`docs/REGRAS_NEGOCIO.md`](file:///C:/Users/winsilva/Documents/Central%20de%20Servi%C3%A7os%20360/docs/REGRAS_NEGOCIO.md): Regras de negócio codificadas (RN-GER, RN-VIA, RN-MOB, RN-COR, RN-XER, RN-FIN, RN-SEG, RN-INT, RN-CHAT, RN-ECO) normalizadas com status único.
