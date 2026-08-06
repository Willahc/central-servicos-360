# Catálogo de Indicadores Operacionais e Estratégicos

> **Projeto**: Central de Serviços 360  
> **Fase**: 0.6A — Documentação Normativa  
> **Status**: Proposta de Métricas Baseada no Dashboard Estático  
> **Nota de Acessibilidade**: Verificações de acessibilidade alinhadas a boas práticas, sem declaração de conformidade formal.

---

## 1. Visão Geral das Métricas

O catálogo de indicadores define os parâmetros de medição de eficiência, volume, SLA e economia das quatro frentes operacionais. `[Definida — Visão do Produto]`

---

## 2. Ficha Técnica dos Indicadores

### 2.1. Indicador: Total de Solicitações Registradas (IND-001)
- **Definição**: Volume consolidado de pedidos de serviço abertos no portal no período. `[Definida — Regra Funcional]`
- **Fórmula de Cálculo**: $\text{Total} = \sum \text{requests}$.
- **Fonte de Dados Necessária**: Entidade `ServiceRequest` no `cs360_data`.
- **Baseline Pendente**: Pendente de apuração do histórico prévio. `[Pendente de Validação Institucional]`
- **Período de Medição**: Mensal / Acumulado.
- **Premissas e Limitações**: Considera todas as 4 frentes de serviço.

---

### 2.2. Indicador: Taxa de Aprovação Pendente (IND-002)
- **Definição**: Percentual de solicitações aguardando deliberação de gestor em relação ao total. `[Definida — Regra Funcional]`
- **Fórmula de Cálculo**: $\text{Taxa} = \left(\frac{\text{requests}_{\text{PENDENTE}}}{\text{Total}}\right) \times 100$.
- **Fonte de Dados Necessária**: Entidade `ServiceRequest` (`status == 'PENDENTE_APROVACAO'`).
- **Baseline Pendente**: Pendente de validação operacional. `[Pendente de Validação Institucional]`
- **Período de Medição**: Tempo real / Diário.

---

### 2.3. Indicador: Economia por Reúso de Bilhetes Não Voados (IND-003)
- **Definição**: Valor monetário acumulado recuperado através da utilização de créditos aéreos pré-existentes (`RN-VIA-002`). `[Definida — Regra Funcional]`
- **Fórmula de Cálculo**: $\text{Economia} = \sum (\text{originalAmount} - \text{creditBalance})_{\text{UTILIZADO}}$.
- **Classificação Financeira**: `[Hipótese de Economia]`
- **Fonte de Dados Necessária**: Entidade `NonFlownTicket`.
- **Baseline Pendente**: Pendente de levantamento histórico de bilhetes cancelados. `[Pendente de Validação Contratual]`
- **Período de Medição**: Mensal / Anual.

---

### 2.4. Indicador: Íncidência de Corridas Fora da Política (IND-004)
- **Definição**: Percentual de deslocamentos de mobilidade urbana sinalizados com alerta de regra noturna (`RN-MOB-002`). `[Definida — Regra Funcional]`
- **Fórmula de Cálculo**: $\text{Incidência} = \left(\frac{\text{rides}_{\text{flag}=true}}{\text{Total Rides}}\right) \times 100$.
- **Fonte de Dados Necessária**: Entidade `MobilityRide`.
- **Baseline Pendente**: Pendente de auditoria inicial de faturas. `[Pendente de Validação Institucional]`

---

### 2.5. Indicador: Taxa de Retenção do Chatbot (IND-005)
- **Definição**: Percentual de dúvidas resolvidas diretamente pela base normativo-oficial sem transbordo para chamado humano. `[Proposta de Produto]`
- **Fórmula de Cálculo**: $\text{Retenção} = \left(1 - \frac{\text{Chamados Abertos}}{\text{Total Consultas Chatbot}}\right) \times 100$.
- **Fonte de Dados Necessária**: Logs da base de conhecimento e entidade `Ticket`.
- **Baseline Pendente**: Pendente de medição inicial. `[Pendente de Validação Técnica]`

---

## 3. Pendências de Validação de Metas

- **Metas Institucionais de SLA**: A fixação de metas percentuais de atendimento para os fornecedores depende de repactuação contratual. `[Pendente de Validação Contratual]`
