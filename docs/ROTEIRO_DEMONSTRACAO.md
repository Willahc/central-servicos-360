# Roteiro de Demonstração (10 Minutos): Central de Serviços 360

Este roteiro orienta a apresentação executiva e técnica do protótipo estático da **Central de Serviços 360**.

---

## Cronograma do Roteiro (10 Minutos)

### Minuto 1: Login Simulado & Contexto Inicial (`login.html`)
- **Ação**: Abrir `prototype/login.html` por duplo clique.
- **Fala**: *"Apresentamos a Central de Serviços 360, canal unificado para as 4 frentes operacionais. Nesta demonstração estática, operamos com login simulado sem senha e aviso claro de protótipo de dados fictícios."*
- **Ação**: Selecionar perfil `Colaborador (Solicitante)` e clicar em "Acessar Demonstração 360".

---

### Minuto 2: Dashboard Principal 360 (`dashboard.html`)
- **Ação**: Navegar pelo `dashboard.html`.
- **Pontos de Destaque**:
  - Cards com dados operacionais derivados de `mock-data.js`.
  - Gráfico visual em CSS puro com distribuição por status.
  - Sinalização clara de **Modo MOCK / Adaptadores Simulados Ativos**.

---

### Minuto 3 a 4: Jornada de Viagem Corporativa (`solicitacao-nova.html` -> `aprovacoes.html`)
- **Ação**: Clicar em "Nova Solicitação", preencher uma solicitação de viagem para Brasília e enviar.
- **Ação**: No cabeçalho superior, alterar o perfil simulado para **"Gestor Aprovador"**.
- **Ação**: Acessar `aprovacoes.html`, clicar em "Rejeitar" (mostrar exigência de justificativa obrigatória conforme RN-GER-005) ou "Aprovar".
- **Fala**: *"Demonstramos a jornada persistente em localStorage. O gestor delibera com registro obrigatorio de justificativa e auditoria."*

---

### Minuto 5: Mobilidade Urbana & Alertas de Política (`mobilidade.html`)
- **Ação**: Acessar `mobilidade.html`.
- **Pontos de Destaque**:
  - Tabela de corridas simuladas.
  - Sinalização visual acessível de corridas fora da política para o faturamento (RN-MOB-002).

---

### Minuto 6: Correios & Xerox (`correios.html` e `xerox.html`)
- **Ação**: Acessar `correios.html` e `xerox.html`.
- **Pontos de Destaque**:
  - Distinção entre uso Pessoal vs. Institucional e código de rastreamento (RN-COR-003).
  - Opções de formatos A4/A3, tiragem e acabamentos na fila de produção gráfica (RN-XER-001).

---

### Minuto 7: Base de Conhecimento & Assistente Demonstrativo (`conhecimento.html`)
- **Ação**: Acessar `conhecimento.html` e interagir com o Chatbot.
- **Teste 1**: Digitar "Como solicitar uma viagem?" ➔ Exibe resposta com citação da fonte `POL-VIA-2026-V2.pdf` (RN-CHAT-001).
- **Teste 2**: Digitar pergunta sem cadastro ➔ Chatbot sugere abertura de chamado humano.

---

### Minuto 8: Indicadores & Relatórios de Economia (`relatorios.html`)
- **Ação**: Acessar `relatorios.html`.
- **Fala**: *"Apresentamos a consolidação de gastos por centro de custo e a métrica de economia gerada pelo reúso de bilhetes não voados (RN-VIA-002)."*

---

### Minuto 9: Integrações Futuras em Modo Mock & Auditoria (`administracao.html`)
- **Ação**: Acessar `administracao.html` com o perfil de Administrador.
- **Pontos de Destaque**:
  - Tabela da Trilha Auditável de Eventos (`AuditEvent`).
  - Explicação sobre a camada de adaptadores (Hexagonal Architecture).
  - Demonstração da função **"Restaurar dados fictícios da demonstração"**.

---

### Minuto 10: Benefícios & Limitações do Protótipo
- **Benefícios**: Navegação 100% autônoma por duplo clique em `index.html`, sem Node.js, sem CDN, sem chamadas de rede, totalmente aderente às regras canônicas.
- **Limitações Declaradas**: Ausência de backend real, ausência de banco de dados SQL/NoSQL, integração real com SAP/Uber mantida em adaptadores mock aguardando nova etapa.
