# Arquitetura Conceitual: Central de Serviços 360

## 1. Visão Geral da Arquitetura Target vs. MVP

A **Central de Serviços 360** adota um padrão de arquitetura orientado a portas e adaptadores (Hexagonal / Clean Architecture). O objetivo principal é desacoplar completamente as regras de negócio centrais dos provedores e sistemas de execução externos (SAP, Senior, Argo, Uber, Copastur).

```mermaid
graph TD
    User[Colaborador / Gestor / Operador] -->|HTTPS / Browser| Portal[Portal do Colaborador - UI]
    Portal -->|REST APIs| Core[Central de Serviços 360 CORE]

    subgraph Core Engine
        Auth[Módulo de Identidade & RBAC]
        Orchestrator[Orquestrador de Processos & Estados]
        RulesEngine[Motor de Regras de Negócio]
        ApprovalEngine[Motor Configurável de Aprovações]
        AuditLog[Serviço de Auditoria & Trilha]
        KnowledgeBase[Base de Conhecimento & Chatbot]
    end

    Core --> Auth
    Core --> Orchestrator
    Core --> RulesEngine
    Core --> ApprovalEngine
    Core --> AuditLog
    Core --> KnowledgeBase

    Orchestrator -->|Camada de Adaptadores / Interfaces| Adapters[Adapter Abstraction Layer]

    subgraph Camada de Adaptadores (MOCK no MVP)
        Adapters --> TravelAdapter[Adapter Argo / Copastur]
        Adapters --> MobilityAdapter[Adapter Uber / Táxi Digital]
        Adapters --> PostalAdapter[Adapter Senior / Correios]
        Adapters --> ERPAdapter[Adapter SAP Financeiro]
    end

    subgraph Sistemas Legados Externos (Invisíveis)
        TravelAdapter -.->|Futuro REST/SOAP| Argo[Plataforma Argo]
        MobilityAdapter -.->|Futuro REST API| Uber[Uber for Business]
        PostalAdapter -.->|Futuro API| Senior[Sistema Senior]
        ERPAdapter -.->|Futuro RFC/REST| SAP[SAP ERP]
    end
```

---

## 2. Princípios Arquiteturais Aplicados

1. **Invisibilidade dos Sistemas de Bastidores (RN-GER-002)**: O colaborador interage exclusivamente com o Portal 360.
2. **Padrão de Adaptadores (RN-INT-001 / RN-INT-004)**: No MVP, todas as portas de integração utilizam conectores simulados (Mocks).
3. **Resiliência e Isolação de Falhas (RN-INT-002)**: Indisponibilidades em parceiros externos não afetam a persistência local da solicitação.
4. **Desacoplamento de Identidade (RN-SEG-002)**: Suporte flexível a SSO corporativo via abstração de IdP.
5. **Auditoria Centralizada (RN-SEG-003)**: Registro imutável de todas as transações e alterações de estado.
