# Mapeamento de Jornadas Ponta a Ponta

> **Projeto**: Central de Serviços 360  
> **Fase**: 0.6A — Documentação Normativa  
> **Status**: Mapeamento Sequencial Baseado nos Documentos Canônicos  
> **Nota de Acessibilidade**: Verificações de acessibilidade alinhadas a boas práticas, sem declaração de conformidade formal.

---

## 1. Visão Geral dos Fluxos Operacionais

A Central de Serviços 360 integra quatro frentes de serviço corporativo (Viagens, Mobilidade, Correios e Xerox) sob uma jornada unificada de solicitação, aprovação, atendimento e auditoria. `[Definida — Visão do Produto]`

---

## 2. Detalhamento Sequencial por Frente de Serviço

### 2.1. Jornada de Viagens Corporativas (RN-VIA)
1. **Solicitação**: O Colaborador (`USR-001`) seleciona a frente de viagens e preenche origem, destino, datas, motivo e indica a necessidade de hotel/seguro. `[Definida — Regra Funcional]`
2. **Validação de Créditos**: O sistema consulta bilhetes não voados disponíveis (`RN-VIA-002`) para reaproveitamento antes da emissão. `[Definida — Regra Funcional]`
3. **Aprovação**: O Gestor Aprovador (`USR-002`) recebe o pedido no painel de aprovações. Em caso de rejeição, digita a justificativa textual obrigatória (`RN-GER-005`). `[Definida — Regra Funcional]`
4. **Atendimento Operacional**: A equipe de viagens efetua a cotação simulada junto à agência de viagens. `[Proposta de Produto]`
5. **Encerramento & Seguro**: O voucher de hospedagem e a apólice de seguro viagem (`RN-VIA-003`) são anexados ao pedido e a solicitação é concluída. `[Definida — Regra Funcional]`

---

### 2.2. Jornada de Mobilidade Urbana (RN-MOB)
1. **Abertura de Pedido**: Solicitante registra pedido de acesso ao Uber for Business ou ressarcimento de táxi. `[Definida — Regra Funcional]`
2. **Análise de Faturamento**: A equipe de faturamento (`USR-004`) valida a elegibilidade e a inclusão no perfil corporativo. `[Definida — Regra Funcional]`
3. **Auditoria de Corridas**: Corridas efetuadas em horário noturno fora de período de viagem ativa são sinalizadas com alerta de política (`policyFlag: true`). `[Definida — Regra Funcional]`
4. **Conciliação**: Lançamento no centro de custo do solicitante. `[Proposta de Produto]`

---

### 2.3. Jornada de Correios e Envios (RN-COR)
1. **Abertura de Postagem**: Informação de CEP de destino, modalidade e classificação de uso (Institucional vs. Pessoal). `[Definida — Regra Funcional]`
2. **Validação de Urgência**: Envios na modalidade SEDEX 10 exigem justificativa formal de urgência no cadastro. `[Definida — Regra Funcional]`
3. **Despacho & Rastreio**: Geração de código de rastreamento fictício (`SIMULADO-COR-0001`) e atualização de status para `EM_TRANSITO`. `[Proposta de Produto]`
4. **Acerto de Uso Pessoal**: Envios pessoais passam por fluxo de autorização e indicação de forma de ressarcimento. `[Definida — Regra Funcional]`

---

### 2.4. Jornada de Xerox e Impressões (RN-XER)
1. **Cadastro do Job Gráfico**: Envio de especificação (formato A4/A3, tiragem, modo de cor, acabamento espiral/capa). `[Definida — Regra Funcional]`
2. **Triagem da Fila**: O operador aloca o job na fila de impressão padrão ou urgente. `[Proposta de Produto]`
3. **Aprovação Específica**: Impressões de alta tiragem pendem de autorização da coordenação de infraestrutura. `[Pendente de Validação Institucional]`
4. **Conclusão & Retirada**: Notificação visual para retirada na gráfica interna. `[Proposta de Produto]`

---

### 2.5. Jornada de Atendimento e Escalamento (RN-CHAT)
1. **Interação com Chatbot**: Consulta à base normativo-oficial no autoatendimento. `[Definida — Visão do Produto]`
2. **Transbordo Humano**: Caso o artigo não resolva, abertura automática de chamado na fila de atendimento humano. `[Definida — Regra Funcional]`
3. **Resolução**: Acompanhamento pelo código `SIMULADO-TICK-0001` até encerramento. `[Proposta de Produto]`

---

### 2.6. Jornada Financeira e Carga Orçamentária (RN-FIN)
1. **Consolidação de Custos**: Apuração mensal dos gastos acumulados por Centro de Custo nas 4 frentes. `[Definida — Regra Funcional]`
2. **Análise de Variância**: Identificação de desvios e pré-reserva orçamentária. `[Proposta de Produto]`
3. **Pré-carga ERP**: Exportação de dados para conciliação no sistema SAP/Senior. `[Pendente de Validação Técnica]`

---

## 3. Lacunas e Dependências de Homologação

- **Integrações de APIs Operacionais**: Comunicação real com APIs de parceiros (Argo, Copastur, Uber, Correios) depende da fase de desenvolvimento de backend. `[Pendente de Validação Técnica]`
- **Contratos e SLAs Vigentes**: A definição de prazos garantidos por contrato exige validação jurídica/suprimentos. `[Pendente de Validação Contratual]`
