# Matriz de Regras de Negócio e Exceções Operacionais

> **Projeto**: Central de Serviços 360  
> **Fase**: 0.6A — Documentação Normativa  
> **Status**: Compilação Baseada no Documento Canônico `REGRAS_NEGOCIO.md`  
> **Nota de Acessibilidade**: Verificações de acessibilidade alinhadas a boas práticas, sem declaração de conformidade formal.

---

## 1. Mapeamento de Regras Gerais do Sistema (RN-GER)

| Código Regra | Descrição da Regra Canônica | Mecanismo de Controle no Protótipo | Status da Regra |
| :--- | :--- | :--- | :---: |
| `RN-GER-001` | Canal único centralizado para as 4 frentes operacionais. | Interface unificada no `dashboard.html`. | `[Definida — Visão do Produto]` |
| `RN-GER-002` | Autenticação baseada em perfis simulados sem senha (RBAC). | Seletor de perfil no cabeçalho. | `[Definida — Regra Funcional]` |
| `RN-GER-003` | Toda solicitação exige vinculação a um Centro de Custo válido. | Campo obrigatório no formulário `solicitacao-nova.html`. | `[Definida — Regra Funcional]` |
| `RN-GER-004` | Exigência de aprovação de gestor conforme hierarquia. | Central de Aprovações em `aprovacoes.html`. | `[Definida — Regra Funcional]` |
| `RN-GER-005` | **Justificativa obrigatória em caso de rejeição pelo gestor.** | Prompt/modal com validação de campo preenchido. | `[Definida — Regra Funcional]` |

---

## 2. Regras Específicas por Frente de Serviço

### 2.1. Viagens Corporativas (RN-VIA)
- `RN-VIA-001`: Solicitações de passagem aérea devem ser abertas com antecedência prévia. *(Parâmetro demonstrativo — pendente de validação institucional)*. `[Proposta de Produto]`
- `RN-VIA-002`: **Consulta e reaproveitamento obrigatório de créditos de bilhetes não voados.** Tabela de créditos ativos exposta no módulo de viagens. `[Definida — Regra Funcional]`
- `RN-VIA-003`: Emissão obrigatória de apólice de seguro viagem para trechos aéreos. `[Definida — Regra Funcional]`

### 2.2. Mobilidade Urbana (RN-MOB)
- `RN-MOB-001`: Uso de Uber/Táxi restrito a deslocamentos a trabalho ou plantões autorizados. `[Definida — Regra Funcional]`
- `RN-MOB-002`: **Sinalização visual de corridas em horário noturno fora de viagem ativa.** Tag `policyFlag` exibida na tabela de mobilidade. `[Definida — Regra Funcional]`

### 2.3. Correios e Envios (RN-COR)
- `RN-COR-001`: Indicação clara entre uso Institucional e uso Pessoal no cadastro do envio. `[Definida — Regra Funcional]`
- `RN-COR-002`: **Justificativa formal obrigatória para envios expressos na modalidade SEDEX 10.** `[Definida — Regra Funcional]`
- `RN-COR-003`: Associação de código de rastreamento fictício (`SIMULADO-COR-0001`) para acompanhamento. `[Proposta de Produto]`

### 2.4. Xerox e Impressões (RN-XER)
- `RN-XER-001`: Especificação obrigatória de formato (A4/A3), tiragem, cor e acabamento. `[Definida — Regra Funcional]`
- `RN-XER-002`: Impressões de alta tiragem pendem de autorização prévia da coordenação. `[Proposta de Produto]`

---

## 3. Matriz de Tratamento de Exceções Operacionais

| Código Exceção | Cenário de Exceção | Ação Automática / Tratamento | Responsável Proposto |
| :--- | :--- | :--- | :--- |
| `EXC-001` | Tentativa de rejeição pelo gestor sem preencher justificativa. | Bloqueio da ação e alerta informativo. `[Definida — Regra Funcional]` | Gestor Aprovador |
| `EXC-002` | Corrida Uber realizada em horário noturno não vinculada a viagem. | Aplicação do flag visual de auditoria em `mobilidade.html`. `[Definida — Regra Funcional]` | Faturamento / Apoio |
| `EXC-003` | Solicitação de SEDEX 10 sem justificativa regulatória. | Impedimento do envio e retenção em rascunho. `[Definida — Regra Funcional]` | Operador Correios |
| `EXC-004` | Solicitação de viagem em período com bilhete não voador compatível. | Alerta visual sugerindo reaproveitamento do crédito. `[Definida — Regra Funcional]` | Operador Viagens |

---

## 4. Pendências de Validação

- **Prazos Exatos de Antecedência de Viagem**: A definição da janela exata de dias úteis para compra antecedente pende de confirmação normativa. `[Pendente de Validação Institucional]`
- **Janela Horária Noturna para Mobilidade**: As horas exatas que caracterizam a restrição noturna pendem de alinhamento com a diretoria. `[Pendente de Validação Institucional]`
