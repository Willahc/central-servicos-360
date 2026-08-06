# Contexto do Projeto: Central de Serviços 360

## 1. Problema Atual

A Central de Serviços da Diretoria de Infraestrutura & Supply Chain do Hospital Sírio-Libanês opera quatro frentes de atendimento aos colaboradores:

1. **Viagens Corporativas**
2. **Mobilidade Corporativa**
3. **Correios**
4. **Xerox e Impressões**

A operação atual envolve a utilização de múltiplas plataformas externas, sistemas legados, e-mails operacionais, formulários avulsos e planilhas de controle. Isso gera dispersão na experiência do colaborador, elevado trabalho manual de conciliação e suporte, além de dificuldades na consolidação de indicadores e custos.

---

## 2. Visão do Produto e Objetivos

### Visão do Produto `[Definida — Visão do Produto]` (RN-GER-001)
A **Central de Serviços 360** (nome provisório) será a **plataforma interna unificada** para os colaboradores do Hospital Sírio-Libanês realizarem e acompanharem solicitações de Viagens, Mobilidade, Correios e Impressões. A plataforma atuará como porta de entrada única, orquestrador de processos, motor de regras, base de conhecimento e central de indicadores.

### Objetivos Estratégicos
- **Canal Único** `[Definida — Visão do Produto]`: Oferecer uma interface centralizada para o colaborador (RN-GER-001).
- **Automação de Validações** `[Definida — Regra Funcional]`: Aplicar pré-validação de regras e políticas antes da contratação (RN-GER-003).
- **Rastreabilidade e Governança** `[Definida — Regra Funcional]`: Manter histórico auditável de decisões e solicitações (RN-SEG-003).
- **Visão de Custos** `[Definida — Regra Funcional]`: Consolidar informações financeiras das 4 frentes por centro de custo/unidade (RN-GER-003).
- **Autoatendimento Orientado** `[Definida — Regra Funcional]`: Oferecer suporte via chatbot ancorado estritamente na documentação oficial aprovada (RN-CHAT-001).

---

## 3. Equipe e Atribuições Conhecidas

### 3.1 Liderança
- **Renata Monteiro**: Coordenadora da Central de Serviços.
- **Iramaia Rodrigues**: Gerente de Hotelaria.

### 3.2 Atribuições Atuais Conhecidas da Equipe Operacional

#### William Nunes (Assistente Administrativo — Foco em Viagens)
- Gerenciamento operacional das demandas de viagens corporativas.
- Apoio na atualização e aplicação da política institucional de viagens.
- Gestão e operacionalização de acordos com hotéis e relacionamento com agências.
- Suporte consultivo aos colaboradores em dúvidas sobre viagens e seguro viagem (RN-VIA-003).
- Acompanhamento de indicadores de viagens e fornecedores.

#### Maria Catarina (Auxiliar Administrativo — Foco em Faturamento e Apoio Operacional)
- Operacionalização de acessos e desligamentos de colaboradores em plataformas de mobilidade (RN-MOB-001).
- Suporte operacional aos colaboradores.
- Apoio na administração operacional das demandas de Argo e SAP (no escopo da área).
- Acompanhamento de faturas, notas fiscais e conferência de despesas de mobilidade e Correios.
- Controle e acompanhamento operacional de bilhetes não voados (RN-VIA-002).

> *Nota de Governança*: As atribuições operacionais conhecidas de William e Maria não incluem prerrogativas autônomas para alterar políticas institucionais, cancelar transações financeiras consolidadas ou administrar integrações tecnológicas sem aprovação da liderança e da TI.

---

## 4. Sistemas Conhecidos e Papel no Ecossistema

Abaixo estão listados os sistemas conhecidos que transacionam ou registram dados das frentes de serviço. A definição formal das fontes mestres de dados é `[Pendente de Validação Institucional]` (RN-FIN-004) e a integração técnica é `[Pendente de Validação Técnica]` (RN-FIN-003).

- **SAP**: Sistema participante do fluxo de notas fiscais, pagamentos, despesas e centros de custo (RN-FIN-003, RN-FIN-004).
- **Senior**: Sistema atualmente envolvido no registro de despesas de Correios (RN-FIN-002, RN-COR-005).
- **Argo / My Argo**: Plataforma de reservas e gestão de viagens (RN-VIA-007, RN-ECO-004).
- **Copastur & Copastur Analytics**: Agência corporativa de viagens e sua plataforma de relatórios (RN-VIA-007, RN-ECO-002).
- **Uber for Business**: Plataforma de mobilidade corporativa (RN-MOB-004, RN-MOB-005).
- **Neonpass**: Plataforma/middleware de gestão de vouchers/mobilidade (RN-ECO-001).
- **Táxi Digital**: Plataforma de táxis credenciados (RN-MOB-001).
- **Ecossistema Google**: O Hospital utiliza soluções Google no seu ambiente corporativo, porém a arquitetura final de autenticação (IdP, SSO, protocolos OAuth/SAML) para a Central de Serviços depende de validação da TI `[Pendente de Validação Técnica]`.

---

## 5. Hipóteses de Economia `[Hipótese de Economia]`

As premissas abaixo constituem hipóteses de otimização sujeitas a validação financeira, técnica e operacional:

- **Substituição ou Otimização da Neonpass** `[Hipótese de Economia]` (RN-ECO-001): Avaliar a necessidade da ferramenta caso atue estritamente como middleware.
- **Consolidação de Dashboards Próprios** `[Hipótese de Economia]` (RN-ECO-002): Substituir relatórios externos (ex: Copastur Analytics) por indicadores internos.
- **Racionalização do Fluxo de Correios** `[Hipótese de Economia]` (RN-ECO-003): Avaliar a redução de etapas na Senior para despesas de correio.
- **Manutenção Inicial do Argo** `[Hipótese de Economia]` (RN-ECO-004): Manter o Argo como engine invisível de reservas.
- **Redução de Processos Manuais** `[Hipótese de Economia]` (RN-ECO-005): Diminuir horas operacionais gastas em planilhas e e-mails.

---

## 6. Pontos Pendentes de Validação

1. **Nome Oficial do Produto** `[Pendente de Validação Institucional]`.
2. **Política Oficial de Viagens** (regras, antecedência, classes) `[Pendente de Validação Institucional]` (RN-VIA-001, RN-VIA-005, RN-VIA-006, RN-VIA-008).
3. **Alçadas e Fluxos de Aprovação** por valor/serviço `[Pendente de Validação Institucional]` (RN-GER-010).
4. **Acordos de Nível de Serviço (SLAs)** internos e de fornecedores `[Pendente de Validação Institucional]` (RN-XER-003).
5. **Provedor e Protocolo de Identidade Corporativa (SSO)** `[Pendente de Validação Técnica]`.
6. **Definição de Fontes Mestres de Dados (SAP, Senior, etc.)** `[Pendente de Validação Institucional]` (RN-FIN-004) e `[Pendente de Validação Técnica]` (RN-FIN-003).
7. **Disponibilidade e Licenciamento de APIs (Argo, Copastur, Uber, Senior, Neonpass)** `[Pendente de Validação Técnica]` (RN-GER-006, RN-VIA-007, RN-MOB-004, RN-COR-005) e `[Pendente de Validação Contratual]` (RN-GER-007, RN-MOB-005, RN-INT-003).
8. **Regras de Cobrança / Desconto em Folha para Serviços Pessoais** `[Pendente de Validação Institucional]` (RN-FIN-001) e `[Pendente de Validação Técnica]` (RN-FIN-002).
9. **Diretrizes de Retenção de Logs e LGPD** `[Pendente de Validação Institucional]` (RN-SEG-007) e `[Pendente de Validação Técnica]` (RN-SEG-006).
10. **Homologação do Motor/Fornecedor de Inteligência Artificial para Chatbot** `[Pendente de Validação Técnica]` (RN-CHAT-004) e `[Pendente de Validação Institucional]` (RN-CHAT-005).
