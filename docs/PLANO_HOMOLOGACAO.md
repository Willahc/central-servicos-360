# Plano de Homologação e Testes de Aceitação (UAT)

## 1. Cenários de Teste de Aceitação do Usuário

### Cenário 01: Abertura e Salvação de Rascunho de Viagem
- **Objetivo**: Validar a criação de solicitação e persistência no `localStorage`.
- **Passos**:
  1. Abrir `solicitacao-nova.html` com o perfil `colaborador`.
  2. Selecionar "Viagens Corporativas", preencher título "Viagem de Teste UAT" e clicar em "Salvar Rascunho".
  3. Navegar para `solicitacoes.html`.
- **Resultado Esperado**: A solicitação é listada com status `RASCUNHO`.

---

### Cenário 02: Ciclo de Aprovação por Gestor com Justificativa
- **Objetivo**: Validar aprovação e rejeição de solicitações (RN-GER-005).
- **Passos**:
  1. Alterar o perfil para `gestor` no cabeçalho.
  2. Acessar `aprovacoes.html`.
  3. Selecionar "Rejeitar" em uma solicitação pendente.
  4. Deixar a justificativa em branco na primeira tentativa e confirmar.
  5. Preencher a justificativa "Fora de orçamento" na segunda tentativa e confirmar.
- **Resultado Esperado**:
  - O sistema impede a rejeição sem justificativa.
  - Com justificativa preenchida, o status muda para `REJEITADO`, a linha do tempo atualiza e o evento de auditoria é registrado.

---

### Cenário 03: Teste de Chatbot Determinístico e Fallback
- **Objetivo**: Validar autoatendimento ancorado e oferta de chamado humano (RN-CHAT-001).
- **Passos**:
  1. Acessar `conhecimento.html`.
  2. Digitar "Como solicitar uma viagem?" no chatbot.
  3. Digitar uma pergunta não cadastrada, como "Qual o cardápio do restaurante?".
- **Resultado Esperado**:
  - A primeira pergunta retorna resposta com a fonte normativa `POL-VIA-2026-V2.pdf`.
  - A segunda pergunta aciona a mensagem de ausência de resposta e sugere abertura de chamado fictício.

---

### Cenário 04: Restauração de Dados Fictícios (Admin Reset)
- **Objetivo**: Garantir a reinicialização da demonstração.
- **Passos**:
  1. Alterar o perfil para `administrador`.
  2. Acessar `administracao.html` e clicar em "Restaurar dados fictícios da demonstração".
  3. Confirmar no alerta.
- **Resultado Esperado**: As chaves `cs360_` são resetadas para o estado inicial sem afetar outros dados do navegador.
