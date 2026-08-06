# Guia de Execução do Protótipo Estático: Central de Serviços 360

## 1. Como Abrir e Navegar no Protótipo

> **Sem Necessidade de Servidor Local ou Node.js**: O protótipo foi projetado para funcionar 100% autônomo.

1. Navegue até a pasta do projeto: `prototype/`.
2. Dê um **duplo clique no arquivo `index.html`** (ou `login.html`).
3. O arquivo abrirá diretamente em qualquer navegador web moderno (Chrome, Edge, Firefox, Safari) via protocolo `file://`.

---

## 2. Estrutura de Arquivos da Pasta `prototype/`

```
prototype/
├── index.html                  # Landing e redirecionamento inicial
├── login.html                  # Seletor de perfil inicial simulado
├── dashboard.html              # Visão geral 360 e métricas
├── solicitacoes.html           # Minhas solicitações e filtros
├── solicitacao-nova.html       # Abertura de novos pedidos (4 frentes)
├── solicitacao-detalhe.html     # Detalhamento e histórico do pedido
├── viagens.html                # Módulo de viagens e bilhetes não voados
├── viagem-detalhe.html         # Detalhe do itinerário e seguro
├── mobilidade.html             # Módulo de mobilidade (Uber/Táxi)
├── correios.html               # Módulo de postagens e rastreamento
├── xerox.html                  # Módulo gráfica e impressões
├── aprovacoes.html             # Central de aprovações para gestores
├── atendimentos.html           # Central de chamados humanos
├── financeiro.html             # Consolidação por centro de custo
├── fornecedores.html           # Gestão de fornecedores e SLAs
├── relatorios.html             # BI e relatórios consolidados
├── conhecimento.html           # Base de conhecimento e Chatbot
├── administracao.html          # Logs de auditoria e Reset da demonstração
└── assets/
    ├── css/app.css             # Design System e estilos CSS puro
    └── js/
        ├── mock-data.js        # Dataset centralizado de dados fictícios
        └── app.js              # Lógica de interface e persistência
```

---

## 3. Principais Recursos para Demonstrar

- **Seletor de Perfis no Cabeçalho**: Alterne instantaneamente entre os 9 perfis (Colaborador, Gestor, Viagens, Faturamento, Coordenadora, Gerência, Financeiro, Administrador, Auditoria).
- **Jornada de Viagem Completa**: Crie um pedido como Colaborador ➔ Alterne para Gestor ➔ Aprovado/Rejeitado com justificativa ➔ Veja o histórico em tempo real no Dashboard e na Trilha de Auditoria.
- **Assistente Determinístico**: Acesse `conhecimento.html` e faça perguntas sobre solicitações de viagem ou mobilidade.
- **Restauração de Dados (Admin Reset)**: Em `administracao.html` ou no cabeçalho (quando logado como Administrador), clique em "Restaurar Dados Demo" para resetar todas as alterações.
