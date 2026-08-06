# Escopo Funcional: Central de Serviços 360

## 1. Experiência e Visão do Produto

A **Central de Serviços 360** é concebida como a **porta de entrada única** `[Definida — Visão do Produto]` (RN-GER-001) para os colaboradores do Hospital Sírio-Libanês realizarem solicitações de Viagens, Mobilidade, Correios e Impressões.

---

## 2. Perfis de Usuários (RBAC) `[Proposta de Produto]` (RN-SEG-002)

A estrutura abaixo representa uma **proposta de desenho de permissões** baseada nos papéis mapeados (RN-SEG-002). A matriz final de permissões e privilégios depende de homologação pela Coordenadora, Gerência, TI e Segurança da Informação `[Pendente de Validação Institucional]` (RN-SEG-005).

1. **Colaborador (Solicitante)**: Acesso ao catálogo, abertura/acompanhamento de solicitações próprias, histórico e chatbot.
2. **Gestor Aprovador**: Visualização e deliberação sobre solicitações de subordinados conforme alçadas.
3. **William / Gestão de Viagens**: Operacionalização de cotações, gestão de hotéis, companhias aéreas, seguro viagem e painel de bilhetes não voados (conforme atribuições operacionais conhecidas).
4. **Maria / Faturamento e Apoio Operacional**: Apoio na gestão de acessos de mobilidade, conferência de faturas, despesas de Correios e conciliação de créditos (conforme atribuições operacionais conhecidas).
5. **Coordenadora (Renata Monteiro)**: Acompanhamento tático de atendimento, SLA, exceções e aprovações superiores.
6. **Gerência (Iramaia Rodrigues)**: Acesso a relatórios consolidados e indicadores estratégicos da área.
7. **Financeiro**: Apoio à conciliação de centros de custo, faturas e relatórios para carga nos sistemas legados.
8. **Administrador Técnico**: Parametrizações do sistema, cadastro de serviços e manutenção do ambiente.
9. **Auditoria**: Visualização de registros de auditoria e relatórios de conformidade.

---

## 3. Detalhamento dos 12 Módulos Funcionais

### 3.1 Portal do Colaborador `[Definida — Visão do Produto]` (RN-GER-001)
- **Catálogo Unificado**: Apresentação das 4 frentes de serviços.
- **Formulários Dinâmicos**: Abertura de solicitações com campos contextuais.
- **Acompanhamento de Solicitações**: Painel "Meus Pedidos" com linha do tempo.
- **Central de Documentos & Notificações**: Visualização de bilhetes, vouchers, apólices e alertas.
- **Widget do Chatbot**: Acesso ao assistente virtual.

### 3.2 Viagens Corporativas `[Definida — Regra Funcional]`
- **Solicitações de Viagem**: Registro de voos, hospedagem e transfers para trechos nacionais e internacionais (corporativos ou acadêmicos) (RN-VIA-004).
- **Seguro Viagem**: Funcionalidade para solicitar, registrar, consultar e vincular apólices de seguro viagem `[Definida — Regra Funcional]` (RN-VIA-003). *Nota: A obrigatoriedade automática, cobertura e momento de emissão dependem de aprovação institucional `[Pendente de Validação Institucional]` (RN-VIA-006).*
- **Bilhetes Não Voados e Créditos**: Registro, acompanhamento e alertas sobre saldo de créditos de passagens `[Definida — Regra Funcional]` (RN-VIA-002). *Nota: A verificação automática prévia via API depende de viabilidade técnica `[Pendente de Validação Técnica]` (RN-VIA-007) e diretrizes operacionais `[Pendente de Validação Institucional]` (RN-VIA-008).*

### 3.3 Mobilidade Corporativa `[Definida — Regra Funcional]`
- **Gestão de Solicitações de Corridas**: Interface para solicitar transporte (Uber, Táxi Digital, locadoras).
- **Gestão de Acessos**: Solicitações de inclusão/desligamento de colaboradores em plataformas de mobilidade `[Definida — Regra Funcional]` (RN-MOB-001). *Nota: Automação via API pendente técnica `[Pendente de Validação Técnica]` (RN-MOB-004) e contratual `[Pendente de Validação Contratual]` (RN-MOB-005).*
- **Sinalização de Corridas Fora da Política**: Mecanismo de alerta visual para análise do faturamento `[Proposta de Produto]` (RN-MOB-002).
- **Vinculação a Viagens e Centros de Custo**: Associação de deslocamentos urbanos à viagem mãe `[Definida — Regra Funcional]` (RN-MOB-003).

### 3.4 Correios `[Definida — Regra Funcional]`
- **Solicitação de Postagem**: Formulário de envio com peso, dimensões e grau de urgência.
- **Distinção Uso Institucional vs. Pessoal**: Campos no formulário para separar a natureza do envio `[Proposta de Produto]` (RN-COR-001). *Nota: A liberação de uso pessoal depende de decisão institucional `[Pendente de Validação Institucional]` (RN-COR-004).*
- **Código de Rastreamento**: Funcionalidade para associar o código de rastreamento à solicitação `[Definida — Regra Funcional]` (RN-COR-003). *Nota: A captura automática vs. manual depende de viabilidade técnica `[Pendente de Validação Técnica]` (RN-COR-005).*

### 3.5 Xerox e Impressões `[Definida — Regra Funcional]`
- **Solicitação Gráfica**: Upload de arquivos, seleção de formatos (A4/A3), cor (P&B/Colorido), tipo de papel e acabamentos `[Definida — Regra Funcional]` (RN-XER-001).
- **Fila de Produção & Priorização**: Gestão do status de impressão e fila de atendimento `[Proposta de Produto]` (RN-XER-002). *Nota: Prazos e SLAs formais dependem de validação institucional `[Pendente de Validação Institucional]` (RN-XER-003).*

### 3.6 Aprovações `[Proposta de Produto]` (RN-GER-004)
- **Motor Configurável de Aprovações**: Estrutura flexível para roteamento de pedidos `[Proposta de Produto]` (RN-GER-004).
- **Alçadas e Limites**: *Nota: A definição das alçadas financeiras, cargos aprovadores e regras de exceção é ponto pendente `[Pendente de Validação Institucional]` (RN-GER-010).*

### 3.7 Atendimento `[Proposta de Produto]`
- **Central de Chamados & Escalonamento**: Fila de dúvidas e incidentes encaminhados pela equipe ou pelo chatbot `[Proposta de Produto]`.
- **Medição de SLAs**: *Nota: As metas formais e prazos de SLA dependem de definição institucional `[Pendente de Validação Institucional]` (RN-XER-003).*

### 3.8 Financeiro `[Definida — Regra Funcional]`
- **Consolidação por Centro de Custo**: Agrupamento de despesas das 4 frentes `[Definida — Regra Funcional]` (RN-GER-003).
- **Cobrança / Desconto em Folha para Serviços Pessoais**: *Nota: Depende de regra institucional `[Pendente de Validação Institucional]` (RN-FIN-001) e integração técnica `[Pendente de Validação Técnica]` (RN-FIN-002).*
- **Integração SAP**: *Nota: Mecanismo técnico `[Pendente de Validação Técnica]` (RN-FIN-003) e definição de fonte mestre `[Pendente de Validação Institucional]` (RN-FIN-004).*

### 3.9 Fornecedores `[Definida — Regra Funcional]`
- **Cadastro & Acompanhamento Contratual**: Registro de parceiros, vigências, acordos de tarifas e SLAs.

### 3.10 Indicadores e Relatórios `[Definida — Regra Funcional]`
- **Dashboards Consolidado**: Visões de consumo por área, centro de custo, bilhetes não voados e uso do chatbot.

### 3.11 Base de Conhecimento e Chatbot `[Definida — Regra Funcional]`
- **Autoatendimento Guiado**: Chatbot respondendo somente com base em documentação oficial aprovada, indicando a fonte e gerenciando transições `[Definida — Regra Funcional]` (RN-CHAT-001, RN-CHAT-002, RN-CHAT-003). *Nota: Arquitetura técnica de IA `[Pendente de Validação Técnica]` (RN-CHAT-004) e fornecedores/segurança `[Pendente de Validação Institucional]` (RN-CHAT-005).*

### 3.12 Administração e Auditoria `[Definida — Regra Funcional]`
- **Registros de Auditoria**: Registro de histórico para ações críticas e alterações no sistema `[Definida — Regra Funcional]` (RN-SEG-003). *Nota: Arquitetura técnica de logs `[Pendente de Validação Técnica]` (RN-SEG-006) e prazos de retenção/LGPD `[Pendente de Validação Institucional]` (RN-SEG-007).*

---

## 4. Ciclo de Vida e Estados das Solicitações `[Proposta de Produto]`

A máquina de estados abaixo constitui uma **proposta de produto configurável**, podendo ser adaptada com estados adicionais conforme as necessidades específicas de cada módulo.

```
[Rascunho] ──► [Pendente de Aprovação] ──► [Aprovado] ──► [Em Atendimento] ──► [Concluído]
                     │                       │                  │
                     ▼                       ▼                  ▼
                [Rejeitado]             [Cancelado]        [Cancelado]
```

---

## 5. Escopo do MVP Inicial (Com Adaptadores Simulados) `[Definida — Regra Funcional]` (RN-INT-004)

O MVP inicial funcionará de forma isolada, sem chamadas a APIs de produção e sem dados reais de colaboradores ou pacientes (RN-SEG-001):

1. **Login Simulado**: Alternância entre os 9 perfis propostos (RN-SEG-002).
2. **Controle de Acesso (RBAC Simulado)**: Exibição dinâmica de menus.
3. **Dashboard Geral**: Painel com dados e gráficos simulados.
4. **Portal do Colaborador**: Interface com catálogo dos 4 serviços (RN-GER-001).
5. **Catálogo de Serviços**: Formulários interativos das 4 frentes.
6. **Solicitação de Viagem**: Formulário simulado de voo, hotel e seguro (RN-VIA-003).
7. **Motor de Aprovação Simulado**: Interface para aprovar/rejeitar solicitações fictícias (RN-GER-004, RN-GER-005).
8. **Lista e Detalhes de Viagens**: Painel de acompanhamento.
9. **Módulo de Mobilidade Simulado**: Visualização de corridas fictícias (RN-MOB-001).
10. **Módulo de Correios Simulado**: Formulário de envio e rastreamento simulado (RN-COR-003).
11. **Módulo de Xerox Simulado**: Upload fictício e opções gráficas (RN-XER-001).
12. **Central de Atendimento Simulatória**: Fila de chamados simulada.
13. **Chatbot Local**: Assistente baseado em arquivos Markdown locais (RN-CHAT-001).
14. **Indicadores Básicos**: Gráficos fictícios de consumo.
15. **Registros de Auditoria Simulares**: Exibição da trilha da sessão (RN-SEG-003).
16. **Adaptadores Simulados (Mocks)**: Emulação de respostas de sistemas externos (RN-INT-004).

---

## 6. Critérios Gerais de Aceite

1. **Facilidade de Uso**: Formulários claros e linha do tempo de acompanhamento.
2. **Transparência de Status**: Estado visível em tempo real para o solicitante.
3. **Isolamento e Segurança**: Adaptadores simulados garantem testes sem impacto em sistemas legados (RN-INT-002, RN-INT-004).
4. **Trilha de Ações**: Alterações relevantes registradas na sessão (RN-SEG-003).
5. **Fidelidade do Chatbot**: Chatbot responde citando documento fonte cadastrado (RN-CHAT-001, RN-CHAT-002).
