# Estrutura Inicial do Projeto Node.js (Fase 1)

> **Projeto**: Central de Serviços 360  
> **Fase**: Fase 1 — Inicialização da Estrutura Node.js & Backend MVP  
> **Data**: 06/08/2026  
> **Status**: **Estrutura Base Criada com Sucesso**  
> **Nota de Acessibilidade**: Verificações de acessibilidade alinhadas a boas práticas, sem declaração de conformidade formal.

---

## 1. Visão Geral da Arquitetura Node.js (Fase 1)

A **Fase 1** marca o início da transição do protótipo estático para a aplicação real construída sobre o ambiente de execução **Node.js (v20+)** com **TypeScript**. `[Definida — Visão do Produto]`

---

## 2. Árvore de Diretórios Criada

```
Central de Serviços 360/
├── package.json               # Gerenciador de dependências e scripts de build/dev
├── tsconfig.json              # Configurações do compilador TypeScript (ES2022)
├── .env.example               # Variáveis de ambiente padrão
├── docs/                      # Documentação normativa e técnica das Fases 0.5, 0.6 e Fase 1
├── prototype/                 # Protótipo estático preservado (18 telas HTML/JS/CSS)
└── src/                       # Código-fonte da aplicação Node.js (Fase 1)
    ├── main.ts                # Ponto de entrada do servidor Express/Nest Core
    ├── config/
    │   └── env.config.ts      # Carregador e validador de variáveis de ambiente
    ├── common/
    │   └── interfaces/        # Contratos de tipos, solicitações e adaptadores
    │       ├── service-request.interface.ts
    │       └── adapter.interface.ts
    └── adapters/              # Implementação dos Adaptadores Simulados (Mocks)
        ├── mock-travel.adapter.ts
        └── mock-mobility.adapter.ts
```

---

## 3. Principais Mapeamentos e Funcionalidades Iniciais

1. **Healthcheck & Status**: `/health` retorna status `UP`, versão `1.0.0-alpha.1` e modo `MOCK_ACTIVE`.
2. **Adaptadores Simulados Ativos**:
   - `MockTravelAdapter`: Retorna bilhetes não voados e emite PNRs simulados (`ARGO-XXX`).
   - `MockMobilityAdapter`: Gera vouchers e QR Codes simulados de corridas.
3. **Modo de Operação Isolado**: Configurado para funcionar via `MOCK_MODE=true` sem conexões com APIs externas de produção.
