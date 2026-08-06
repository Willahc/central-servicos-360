# Modelo de Dados Conceitual: Central de Serviços 360

## 1. Diagrama Entidade-Relacionamento (Mermaid ER)

```mermaid
erDiagram
    User ||--o{ ServiceRequest : "abre"
    User }|--|| Role : "possui papel"
    ServiceRequest ||--o{ RequestEvent : "gera histórico"
    ServiceRequest ||--o{ Approval : "requer"
    ServiceRequest ||--o| Trip : "detalha viagem"
    ServiceRequest ||--o| MobilityRide : "detalha corrida"
    ServiceRequest ||--o| PostalRequest : "detalha postagem"
    ServiceRequest ||--o| PrintingRequest : "detalha impressão"
    User ||--o{ AuditEvent : "executa ação"
    Supplier ||--o{ ServiceRequest : "atende"
    User ||--o{ Ticket : "abre chamado"
    KnowledgeArticle ||--o{ Ticket : "embasa"

    User {
        string id PK
        string name
        string email
        string roleId FK
        string department
        string costCenter
    }

    Role {
        string id PK
        string name
        string description
    }

    ServiceRequest {
        string id PK
        string serviceType
        string title
        string requesterId FK
        string costCenter
        string status
        datetime createdAt
        datetime updatedAt
        boolean urgent
    }

    Trip {
        string id PK
        string requestId FK
        string origin
        string destination
        date departureDate
        date returnDate
        string reason
        boolean needsHotel
        boolean needsMobility
        boolean insuranceRequested
        decimal estimatedCost
        string nonFlownCreditUsed
    }

    MobilityRide {
        string id PK
        string requestId FK
        string passenger
        datetime date
        string origin
        string destination
        decimal cost
        string provider
        boolean policyFlag
        string flagReason
    }

    PostalRequest {
        string id PK
        string requestId FK
        string usageType
        string modality
        string destinationZip
        string urgencyRationale
        string trackingCode
    }

    PrintingRequest {
        string id PK
        string requestId FK
        string format
        string colorMode
        string paperType
        int copies
        string finishing
        string fileName
    }

    Approval {
        string id PK
        string requestId FK
        string approverId FK
        string decision
        string rationale
        datetime decidedAt
    }

    AuditEvent {
        string id PK
        datetime timestamp
        string userId FK
        string role
        string action
        string resource
        string ip
        string details
    }
```

---

## 2. Dicionário das 13 Entidades Principais

1. **User**: Cadastro de colaboradores e operadores.
2. **Role**: Papel RBAC de permissões (9 perfis).
3. **ServiceRequest**: Entidade central de solicitação de serviço.
4. **RequestEvent**: Registro histórico de alteração de estados da solicitação.
5. **Trip**: Detalhamento de trechos, voos, hotéis e seguro viagem.
6. **MobilityRide**: Registro de viagens de mobilidade urbana (Uber/Táxi).
7. **PostalRequest**: Detalhes de envio postal e rastreamento.
8. **PrintingRequest**: Especificações gráficas para a central de cópias.
9. **Approval**: Registro de deliberações de gestores e justificativas.
10. **Ticket**: Chamados de atendimento humano da central.
11. **Supplier**: Cadastro de prestadores de serviço e SLAs.
12. **KnowledgeArticle**: Artigos normativos para autoatendimento e chatbot.
13. **AuditEvent**: Trilha imutável de eventos de auditoria e conformidade.
