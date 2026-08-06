# Regras de Negócio: Central de Serviços 360

Este documento consolida as regras de negócio organizadas por categorias, identificadores únicos e formalmente normalizadas com **exatamente um status por regra**.

---

## 1. Taxonomia Oficial de Status

Cada regra ou sub-regra deste documento possui estritamente **um único status**, pertencente à taxonomia oficial:

- **`[Definida — Visão do Produto]`**: Objetivo ou direcionamento estratégico aprovado para a experiência do produto final.
- **`[Definida — Regra Funcional]`**: Comportamento funcional ou requisito operacional estabelecido.
- **`[Proposta de Produto]`**: Desenho funcional ou fluxo sugerido, sujeito a validação no detalhamento.
- **`[Pendente de Validação Institucional]`**: Requisito dependente de deliberação da liderança, RH, Finanças ou política oficial.
- **`[Pendente de Validação Técnica]`**: Requisito dependente de viabilidade técnica, arquitetura de TI ou integração de sistemas.
- **`[Pendente de Validação Contratual]`**: Condição dependente de contratos, convênios ou APIs disponibilizadas por fornecedores externos.
- **`[Hipótese de Economia]`**: Premissa de otimização de custos a ser validada financeira e operacionalmente.

---

## 2. Regras Gerais (RN-GER)

### RN-GER-001 `[Definida — Visão do Produto]`
Todos os colaboradores do Hospital Sírio-Libanês utilizarão a Central de Serviços 360 como canal unificado para solicitações de Viagens, Mobilidade, Correios e Impressões.

### RN-GER-002 `[Definida — Visão do Produto]`
Os sistemas de execução de bastidores (Argo, Uber, SAP, Senior, Copastur, etc.) deverão ficar invisíveis na experiência final do colaborador.

### RN-GER-006 `[Pendente de Validação Técnica]`
A viabilidade técnica de desacoplamento completo dos sistemas externos via APIs para garantir a invisibilidade final depende da arquitetura de TI.

### RN-GER-007 `[Pendente de Validação Contratual]`
A permissão contratual para integração via APIs com parceiros externos (Argo, Copastur, Uber, Senior, Neonpass) depende dos contratos vigentes.

### RN-GER-003 `[Definida — Regra Funcional]`
As solicitações institucionais concluídas deverão possuir um centro de custo associado quando isso for aplicável ao serviço.

### RN-GER-008 `[Pendente de Validação Institucional]`
A identificação das exceções de centro de custo, incluindo solicitações para uso pessoal, rascunhos ou serviços isentos, depende de definição institucional.

### RN-GER-009 `[Pendente de Validação Técnica]`
O método de consulta e validação dos centros de custo (se via API em tempo real, carga periódica ou cadastro local sincronizado) depende da arquitetura de TI.

### RN-GER-004 `[Proposta de Produto]`
O produto contará com um motor configurável de aprovação para roteamento dinâmico de solicitações.

### RN-GER-010 `[Pendente de Validação Institucional]`
As alçadas formais de aprovação, limites financeiros por cargo, aprovadores responsáveis, fluxos de exceção e regras por serviço dependem da Política Oficial.

### RN-GER-005 `[Definida — Regra Funcional]`
Toda rejeição de solicitação efetuada por um gestor aprovador deve obrigatoriamente conter uma justificativa textual registrada no sistema.

---

## 3. Viagens Corporativas (RN-VIA)

### RN-VIA-001 `[Pendente de Validação Institucional]`
Os prazos mínimos de antecedência para reservas de voos e hotéis dependem dos parâmetros definidos na Política Oficial de Viagens.

### RN-VIA-002 `[Definida — Regra Funcional]`
O produto deverá permitir registrar, acompanhar e emitir alertas sobre bilhetes não voados e saldo de créditos de passagens.

### RN-VIA-007 `[Pendente de Validação Técnica]`
A verificação automática prévia de bilhetes não voados via API do Argo ou Copastur antes da emissão depende de viabilidade técnica de integração.

### RN-VIA-008 `[Pendente de Validação Institucional]`
As regras de prioridade de uso, expiração e responsabilidade operacional sobre créditos de passagens aéreas dependem da gestão de viagens.

### RN-VIA-003 `[Definida — Regra Funcional]`
O sistema deve permitir solicitar, registrar, consultar e vincular seguro viagem à solicitação de viagem corporativa.

### RN-VIA-006 `[Pendente de Validação Institucional]`
A obrigatoriedade, cobertura, momento de emissão e exceções do seguro viagem internacional dependem da política institucional vigente.

### RN-VIA-004 `[Definida — Regra Funcional]`
O sistema permitirá vincular a solicitação de viagem a congressos, simpósios ou eventos institucionais com anexo de comprovantes.

### RN-VIA-005 `[Pendente de Validação Institucional]`
As diretrizes para escolha de classes de voo e limite de tarifas negociadas dependem da Política Oficial de Viagens.

---

## 4. Mobilidade Corporativa (RN-MOB)

### RN-MOB-001 `[Definida — Regra Funcional]`
O sistema permitirá registrar solicitações de inclusão, alteração de limites ou exclusão de colaboradores nas plataformas de mobilidade (ex: Uber for Business).

### RN-MOB-004 `[Pendente de Validação Técnica]`
A automação técnica do provisionamento de usuários e alteração de limites via API em plataformas de mobilidade depende de viabilidade de integração.

### RN-MOB-005 `[Pendente de Validação Contratual]`
Os termos contratuais e convênios com provedores de mobilidade para autorização de gestão de acessos dependem de validação contratual.

### RN-MOB-002 `[Proposta de Produto]`
Mecanismo visual de sinalização de corridas realizadas fora dos horários ou rotas habituais para análise da equipe de faturamento.

### RN-MOB-003 `[Definida — Regra Funcional]`
Deslocamentos urbanos vinculados a uma viagem corporativa aprovada deverão ser associados à solicitação mãe para consolidação do custo.

---

## 5. Correios (RN-COR)

### RN-COR-001 `[Proposta de Produto]`
O formulário de solicitação de postagem apresentará campos específicos para distinguir visualmente o envio de uso pessoal do uso institucional.

### RN-COR-004 `[Pendente de Validação Institucional]`
A autorização institucional e as regras para que a Central de Serviços processe solicitações de Correios de caráter pessoal dependem de decisão da diretoria.

### RN-COR-002 `[Proposta de Produto]`
Solicitações de postagem por modalidades expressas de alto custo (ex: SEDEX 10) deverão exigir justificativa no momento da abertura.

### RN-COR-003 `[Definida — Regra Funcional]`
Para serviços postais rastreáveis, o produto deverá permitir associar o código de rastreamento à solicitação original.

### RN-COR-005 `[Pendente de Validação Técnica]`
A captura automática do código de rastreamento via API da Senior/Correios versus a inserção manual pela equipe depende de definição técnica.

---

## 6. Xerox e Impressões (RN-XER)

### RN-XER-001 `[Definida — Regra Funcional]`
Solicitações de impressão devem registrar arquivo, formato (A4/A3), cor (P&B/Colorido), tipo de papel, tiragem e acabamentos.

### RN-XER-002 `[Proposta de Produto]`
A organização visual de filas e níveis de prioridade gráfica constitui um desenho funcional do produto.

### RN-XER-003 `[Pendente de Validação Institucional]`
Os prazos formais de entrega, metas de produção e SLAs de atendimento da gráfica interna dependem de validação institucional.

---

## 7. Financeiro (RN-FIN)

### RN-FIN-001 `[Pendente de Validação Institucional]`
A possibilidade de cobrança ou desconto em folha para solicitações de caráter pessoal depende de confirmação da política institucional, das autorizações necessárias e do fluxo financeiro.

### RN-FIN-002 `[Pendente de Validação Técnica]`
A eventual integração técnica com Senior, SAP ou outro sistema de RH/Folha para efetivação do desconto em folha depende de análise técnica.

### RN-FIN-003 `[Pendente de Validação Técnica]`
A definição dos mecanismos técnicos de integração e sincronização de dados financeiros e centros de custo com o SAP depende da TI.

### RN-FIN-004 `[Pendente de Validação Institucional]`
A definição formal do SAP como fonte mestre de dados contábeis e financeiros para todas as frentes depende de alinhamento institucional.

---

## 8. Segurança, Privacidade e Auditoria (RN-SEG)

### RN-SEG-001 `[Definida — Regra Funcional]`
O protótipo inicial utilizará exclusivamente dados fictícios e adaptadores simulados, garantindo isolamento total dos sistemas de produção.

### RN-SEG-002 `[Proposta de Produto]`
A estrutura dos 9 perfis de usuários (Colaborador, Gestor, Viagens, Faturamento, Coordenadora, Gerência, Financeiro, Admin, Auditoria) constitui uma proposta de produto.

### RN-SEG-005 `[Pendente de Validação Institucional]`
A matriz final de privilégios e permissões de cada perfil depende de homologação pela liderança, TI e Segurança da Informação.

### RN-SEG-003 `[Definida — Regra Funcional]`
Ações críticas e alterações relevantes no sistema deverão gerar registro de auditoria.

### RN-SEG-006 `[Pendente de Validação Técnica]`
A arquitetura tecnológica de suporte aos logs, mecanismo de imutabilidade e estrutura de dados de auditoria dependem da TI.

### RN-SEG-007 `[Pendente de Validação Institucional]`
O tempo de retenção dos logs, política de privacidade, LGPD e escopo de campos registrados (como registro de IP) dependem do DPO/Segurança.

### RN-SEG-004 `[Definida — Regra Funcional]`
Nenhuma credencial ou chave de API constará no código-fonte versionado, sendo gerenciadas via variáveis de ambiente (`.env`).

---

## 9. Integrações e Arquitetura (RN-INT)

### RN-INT-001 `[Definida — Visão do Produto]`
A utilização do padrão de adaptadores para desacoplar o core da aplicação dos sistemas externos é um direcionamento arquitetural aprovado.

### RN-INT-004 `[Definida — Regra Funcional]`
O MVP inicial utilizará obrigatoriamente adaptadores simulados (mocks) para todas as integrações externas.

### RN-INT-002 `[Definida — Regra Funcional]`
Falhas de comunicação ou indisponibilidades de sistemas externos não podem corromper nem apagar solicitações criadas no portal.

### RN-INT-003 `[Pendente de Validação Contratual]`
Nenhuma integração definitiva será ativada sem a confirmação contratual e técnica da disponibilidade das APIs dos parceiros externos.

---

## 10. Chatbot e Base de Conhecimento (RN-CHAT)

### RN-CHAT-001 `[Definida — Regra Funcional]`
O chatbot responderá estritamente com base em conteúdo oficial aprovado cadastrado na base de conhecimento.

### RN-CHAT-002 `[Definida — Regra Funcional]`
Toda resposta fornecida pelo chatbot exibirá obrigatoriamente a fonte documental e a data da última atualização.

### RN-CHAT-003 `[Definida — Regra Funcional]`
Casos não resolvidos pelo chatbot ou solicitados pelo usuário serão encaminhados para a fila de atendimento humano, registrando as lacunas não atendidas.

### RN-CHAT-004 `[Pendente de Validação Técnica]`
Definir modelo de linguagem, infraestrutura de hospedagem, integração e arquitetura técnica do motor de IA do chatbot.

### RN-CHAT-005 `[Pendente de Validação Institucional]`
Definir fornecedores autorizados, tratamento de dados, tempo de retenção e requisitos de Segurança da Informação para uso de IA corporativa.

---

## 11. Matriz de Hipóteses de Economia (RN-ECO)

### RN-ECO-001 `[Hipótese de Economia]`
Substituição ou otimização da Neonpass caso atue estritamente como middleware sem agregação de valor exclusivo.

### RN-ECO-002 `[Hipótese de Economia]`
Consolidação de dashboards internos próprios em substituição a ferramentas externas de BI (ex: Copastur Analytics).

### RN-ECO-003 `[Hipótese de Economia]`
Otimização ou redução de etapas na Senior para despesas de Correios.

### RN-ECO-004 `[Hipótese de Economia]`
Manutenção inicial do Argo como motor invisível de reservas de viagens.

### RN-ECO-005 `[Hipótese de Economia]`
Redução de processos manuais, formulários físicos, planilhas avulsas e e-mails operacionais.
