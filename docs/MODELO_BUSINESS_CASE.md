# Modelo de Business Case e Hipóteses de Economia

> **Projeto**: Central de Serviços 360  
> **Fase**: 0.6A — Documentação Normativa  
> **Status**: Estrutura Financeira Baseada em Hipóteses de Eficiência  
> **Nota de Acessibilidade**: Verificações de acessibilidade alinhadas a boas práticas, sem declaração de conformidade formal.

---

## 1. Diretriz Mandatória do Business Case

Todo benefício financeiro ou estimativa de redução de custos neste documento é categorizado estritamente como `[Hipótese de Economia]`.
Não são informados valores monetários projetados sem fonte institucional comprovada e homologação da controladoria. `[Pendente de Validação Institucional]`

---

## 2. Estrutura de Modelagem por Alavanca de Valor

### 2.1. Alavanca 1: Reúso de Bilhetes Não Voados (RN-VIA-002)
- **Definição**: Redução do desembolso em novas passagens aéreas pela identificação e reaproveitamento de créditos de bilhetes cancelados antes do vencimento. `[Definida — Regra Funcional]`
- **Fórmula de Cálculo**: $\text{Economia Aérea} = \sum \text{Valor do Crédito Reutilizado}$.
- **Classificação**: `[Hipótese de Economia]`
- **Fonte de Dados Necessária**: Relatório de bilhetes não voados da agência corporativa de viagens. `[Pendente de Validação Contratual]`
- **Baseline Pendente**: Levantamento histórico dos últimos 12 meses pendente de apuração. `[Pendente de Validação Institucional]`
- **Período de Medição**: Apuração mensal.
- **Premissas e Limitações**: Sujeito a taxas de remarcação cobradas pelas companhias aéreas.
- **Validações Necessárias**: Regras de transferência de titularidade de bilhetes por cia aérea.

---

### 2.2. Alavanca 2: Redução de Corridas Noturnas Fora da Política (RN-MOB-002)
- **Definição**: Diminuição de gastos indevidos com mobilidade urbana através da auditoria e sinalização visual de corridas noturnas sem viagem corporativa vinculada. `[Definida — Regra Funcional]`
- **Fórmula de Cálculo**: $\text{Redução Desvio} = \sum \text{Valor das Corridas Não Conformes Glosadas}$.
- **Classificação**: `[Hipótese de Economia]`
- **Fonte de Dados Necessária**: Faturas detalhadas da plataforma de mobilidade corporativa. `[Pendente de Validação Técnica]`
- **Baseline Pendente**: Percentual atual de corridas em horário noturno pendente de auditoria. `[Pendente de Validação Institucional]`
- **Período de Medição**: Apuração quinzenal.
- **Premissas e Limitações**: Depende da definição formal da janela horária noturna autorizada.

---

### 2.3. Alavanca 3: Racionalização de Envios Expressos (RN-COR-002)
- **Definição**: Economia gerada pela substituição da modalidade SEDEX 10 por SEDEX tradicional ou PAC quando não houver urgência regulatória comprovada. `[Definida — Regra Funcional]`
- **Fórmula de Cálculo**: $\text{Economia Envios} = \sum (\text{Custo SEDEX 10} - \text{Custo SEDEX Padrão})$.
- **Classificação**: `[Hipótese de Economia]`
- **Fonte de Dados Necessária**: Extrato de postagens dos Correios. `[Pendente de Validação Contratual]`
- **Baseline Pendente**: Proporção de envios por modalidade pendente de medição. `[Pendente de Validação Institucional]`

---

## 3. Matriz de Aprovação da Modelagem Financeira

| Alavanca de Economia | Tipo de Benefício | Fonte de Validação | Status da Aprovação |
| :--- | :--- | :--- | :---: |
| Reúso de Bilhetes Aéreos | Redução de Custo Direto | Agência de Viagens / ERP | `[Hipótese de Economia]` |
| Auditoria de Mobilidade | Evitamento de Custos (Avoidance) | Faturamento / Controladoria | `[Hipótese de Economia]` |
| Racionalização de Correios | Redução de Custo Direto | Suprimentos / Correios | `[Hipótese de Economia]` |
