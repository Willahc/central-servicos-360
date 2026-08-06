# Matriz de Perfis e Permissões (RBAC)

> **Projeto**: Central de Serviços 360  
> **Fase**: 0.6A — Documentação Normativa  
> **Status**: Proposta Baseada no Escopo Canônico  
> **Nota de Acessibilidade**: Verificações de acessibilidade alinhadas a boas práticas, sem declaração de conformidade formal.

---

## 1. Visão Geral dos Perfis Simulados

Com base na visão do produto `[Definida — Visão do Produto]` e nas regras de negócio canônicas `[Definida — Regra Funcional]`, o sistema contempla nove perfis de acesso simulados para controle de visibilidade e alçadas de deliberação.

| ID Perfil | Nome do Perfil | Descrição das Atribuições | Status da Definição |
| :--- | :--- | :--- | :---: |
| `colaborador` | Colaborador (Solicitante) | Abertura de solicitações próprias nas 4 frentes, consulta de status, histórico e interação com o chatbot. | `[Definida — Regra Funcional]` |
| `gestor` | Gestor Aprovador | Deliberação (aprovação/rejeição) sobre solicitações de subordinados vinculados aos seus centros de custo. | `[Definida — Regra Funcional]` |
| `viagens` | Gestão de Viagens | Operacionalização de cotações, voos, hotéis, seguro viagem e controle de bilhetes não voados. | `[Definida — Regra Funcional]` |
| `faturamento` | Faturamento e Apoio Operacional | Gestão de perfis de mobilidade, faturas de táxi/Uber, envios de correios e conciliações. | `[Definida — Regra Funcional]` |
| `coordenadora` | Coordenadora Operacional | Acompanhamento tático, gestão de filas de exceção, suporte a SLA e escalonamento. | `[Proposta de Produto]` |
| `gerencia` | Gerência de Infraestrutura | Visão executiva consolidada, relatórios estratégicos e acompanhamento de metas institucionais. | `[Proposta de Produto]` |
| `financeiro` | Financeiro / Controladoria | Consolidação de custos por Centro de Custo e pré-carga orçamentária. | `[Definida — Regra Funcional]` |
| `administrador` | Administrador do Sistema | Gestão de parâmetros, matriz de acessos, auditoria e restauração dos dados da demonstração. | `[Definida — Visão do Produto]` |
| `auditoria` | Auditoria & Compliance | Leitura ampla da trilha auditável (`AuditEvent`) e verificação de conformidade das regras. | `[Definida — Regra Funcional]` |

---

## 2. Matriz de Acesso por Tela e Funcionalidade

A tabela a seguir mapeia a permissão de cada perfil nas 18 páginas do protótipo estático:

| Tela / Módulo | Colaborador | Gestor | Viagens | Faturamento | Coordenadora | Gerência | Financeiro | Admin | Auditoria |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `dashboard.html` | Visualizar | Visualizar | Visualizar | Visualizar | Visualizar | Visualizar | Visualizar | Visualizar | Visualizar |
| `solicitacoes.html` | Próprias | Subordinados | Todas | Todas | Todas | Todas | Todas | Todas | Leitura |
| `solicitacao-nova.html` | Criar | Criar | Criar | Criar | Criar | Criar | Criar | Criar | Negado |
| `solicitacao-detalhe.html` | Próprias | Subordinados | Todas | Todas | Todas | Todas | Todas | Todas | Leitura |
| `aprovacoes.html` | Negado | Deliberar | Negado | Negado | Acompanhar | Acompanhar | Negado | Negado | Leitura |
| `viagens.html` | Solis. Próprias | Visualizar | Operar | Visualizar | Visualizar | Visualizar | Visualizar | Administrar | Leitura |
| `viagem-detalhe.html` | Próprias | Subordinados | Operar | Leitura | Leitura | Leitura | Leitura | Administrar | Leitura |
| `mobilidade.html` | Corridas | Visualizar | Visualizar | Operar | Visualizar | Visualizar | Visualizar | Administrar | Leitura |
| `correios.html` | Postagens | Visualizar | Visualizar | Operar | Visualizar | Visualizar | Visualizar | Administrar | Leitura |
| `xerox.html` | Jobs | Visualizar | Visualizar | Operar | Visualizar | Visualizar | Visualizar | Administrar | Leitura |
| `atendimentos.html` | Chamados | Visualizar | Atender | Atender | Gerenciar | Visualizar | Visualizar | Administrar | Leitura |
| `financeiro.html` | Negado | CC Próprio | Leitura | Conciliar | Visualizar | Consolidado | Operar | Administrar | Leitura |
| `fornecedores.html` | Negado | Negado | Leitura | Leitura | Acompanhar | Acompanhar | Leitura | Administrar | Leitura |
| `relatorios.html` | Negado | CC Próprio | Frente | Frente | Geral | Geral | Financeiro | Administrar | Leitura |
| `conhecimento.html` | Acessar | Acessar | Acessar | Acessar | Acessar | Acessar | Acessar | Administrar | Leitura |
| `administracao.html` | Negado | Negado | Negado | Negado | Negado | Negado | Negado | Administrar | Leitura |

---

## 3. Pendências de Validação Institucional e Técnica

- **Associação de Centros de Custo a Gestores**: A estrutura hierárquica completa de aprovação depende da extração da base de RH/ERP. `[Pendente de Validação Institucional]`
- **Alçadas Financeiras Dinâmicas**: Os limites de valor para aprovação automática vs. dupla aprovação pendem de definição formal. `[Pendente de Validação Institucional]`
- **Autenticação Única (SSO)**: Mecanismos de integração SAML 2.0 / OAuth2 pendem de especificação pela equipe de TI. `[Pendente de Validação Técnica]`
