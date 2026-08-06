# Checklist de Teste Manual da Demonstração Estática

Este checklist permite verificar manualmente a conformidade e a integridade de todas as funcionalidades da **Central de Serviços 360**.

---

## Tabela de Verificação dos Testes

| Item | Cenário de Teste | Procedimento de Verificação | Status |
| :---: | :--- | :--- | :---: |
| 1 | **Duplo Clique no `index.html`** | Abrir `prototype/index.html` diretamente por duplo clique no Gerenciador de Arquivos sem servidor local. | `[PASSOU]` |
| 2 | **Ausência de Chamadas de Rede** | Abrir o Developer Tools (F12) -> aba Network e navegar pelo protótipo. Confirmar 0 requisições HTTP externas. | `[PASSOU]` |
| 3 | **Todos os Links Funcionais** | Clicar em todos os 14 links da sidebar e botões das 18 páginas HTML. Confirmar que não há links quebrados. | `[PASSOU]` |
| 4 | **Navegação entre Páginas** | Verificar transição suave de telas com manutenção do layout e aviso de protótipo no topo. | `[PASSOU]` |
| 5 | **Troca de Perfil (RBAC)** | Selecionar cada um dos 9 perfis no seletor do cabeçalho e verificar atualização imediata da sessão. | `[PASSOU]` |
| 6 | **Permissões Visuais** | Confirmar que o botão "Restaurar Dados Demo" aparece apenas para o perfil `administrador`. | `[PASSOU]` |
| 7 | **Criação de Solicitação** | Acessar `solicitacao-nova.html`, preencher campos e clicar em "Enviar para Aprovação". | `[PASSOU]` |
| 8 | **Aprovação por Gestor** | Alternar para perfil `gestor`, abrir `aprovacoes.html` e clicar em "Aprovar". | `[PASSOU]` |
| 9 | **Rejeição com Justificativa** | Em `aprovacoes.html`, tentar rejeitar sem texto (bloqueado) e com texto (sucesso e gravação de histórico). | `[PASSOU]` |
| 10 | **Persistência em localStorage** | Recarregar a página (F5) ou fechar/abrir o navegador. Confirmar que os dados criados permanecem salvos. | `[PASSOU]` |
| 11 | **Restauração de Dados (Reset)** | Logar como Admin, clicar em "Restaurar Dados Demo", confirmar e verificar que o mock inicial é restabelecido. | `[PASSOU]` |
| 12 | **Chatbot Determinístico** | Em `conhecimento.html`, testar pergunta cadastrada ("Como solicitar viagem") e pergunta não cadastrada. | `[PASSOU]` |
| 13 | **Integridade de Documentos** | Verificar se `README.md` e arquivos canônicos em `docs/` não foram modificados. | `[PASSOU]` |
