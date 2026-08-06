# Backlog Priorizado do MVP: Central de Serviços 360

## 1. Estrutura de Épicos

- **EP-01**: Plataforma, Portal e UX Unificada (RN-GER-001)
- **EP-02**: Identidade e RBAC de 9 Perfis (RN-SEG-002)
- **EP-03**: Módulo de Viagens Corporativas (RN-VIA)
- **EP-04**: Módulo de Mobilidade Urbana (RN-MOB)
- **EP-05**: Módulo de Correios e Postagens (RN-COR)
- **EP-06**: Módulo de Xerox e Impressões (RN-XER)
- **EP-07**: Motor Configurável de Aprovações (RN-GER-004)
- **EP-08**: Central de Atendimento & Chamados
- **EP-09**: Financeiro & Consolidação de Custos (RN-FIN)
- **EP-10**: Base de Conhecimento e Chatbot Determinístico (RN-CHAT-001)
- **EP-11**: Trilha de Auditoria & Segurança (RN-SEG-003)

---

## 2. Histórias de Usuário Priorizadas

### `US-01`: Alternância de Perfis Simulados (RBAC)
- **Épico**: EP-02 | **Prioridade**: Must Have (MoSCoW)
- **Descrição**: Como usuário da demonstração, quero alternar entre os 9 perfis para testar as permissões visuais do sistema.
- **Critérios de Aceite**:
  - `Given` que estou em qualquer página do protótipo, `When` altero o seletor no cabeçalho, `Then` o perfil ativo é gravado no `localStorage` (`cs360_active_role`) e a interface atualiza dinamicamente.
- **Status Documental**: `[Definida — Regra Funcional]` (RN-SEG-002)

---

### `US-02`: Jornada de Solicitação de Viagem com Créditos Não Voados
- **Épico**: EP-03 | **Prioridade**: Must Have
- **Descrição**: Como colaborador, quero abrir uma solicitação de viagem podendo consultar o saldo de bilhetes não voados.
- **Critérios de Aceite**:
  - `Given` que abro o formulário de viagem, `When` informo origem, destino e datas, `Then` o sistema permite salvar rascunho ou enviar para aprovação e exibe aviso de créditos disponíveis.
- **Status Documental**: `[Definida — Regra Funcional]` (RN-VIA-002)

---

### `US-03`: Aprovação de Gestor com Justificativa Obrigatória na Rejeição
- **Épico**: EP-07 | **Prioridade**: Must Have
- **Descrição**: Como gestor aprovador, quero aprovar ou rejeitar pedidos da minha equipe.
- **Critérios de Aceite**:
  - `Given` que seleciono rejeitar uma solicitação, `When` o modal de deliberação abre, `Then` o sistema exige o preenchimento de justificativa textual (RN-GER-005) antes de efetivar a rejeição.
- **Status Documental**: `[Definida — Regra Funcional]` (RN-GER-005)

---

### `US-04`: Assistente Determinístico com Citação de Fonte
- **Épico**: EP-10 | **Prioridade**: Must Have
- **Descrição**: Como colaborador, quero tirar dúvidas no chatbot e ver a fonte normativa oficial da resposta.
- **Critérios de Aceite**:
  - `Given` que digito uma pergunta no chatbot, `When` a resposta é exibida, `Then` o sistema inclui a citação do documento fonte cadastrado (RN-CHAT-001, RN-CHAT-002) e oferece abertura de chamado caso não haja resposta.
- **Status Documental**: `[Definida — Regra Funcional]` (RN-CHAT-001)

---

### `US-05`: Restauração dos Dados da Demonstração (Admin Reset)
- **Épico**: EP-11 | **Prioridade**: Must Have
- **Descrição**: Como administrador, quero um botão para restaurar os dados fictícios originais.
- **Critérios de Aceite**:
  - `Given` que estou com o perfil de Administrador, `When` clico em "Restaurar dados fictícios da demonstração" e confirmo, `Then` as chaves `cs360_` do localStorage são limpas e o mock original é recarregado.
- **Status Documental**: `[Definida — Regra Funcional]`
