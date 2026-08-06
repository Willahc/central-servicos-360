# Dicionário de Dados do Protótipo

> **Projeto**: Central de Serviços 360  
> **Fase**: 0.6A — Documentação Normativa  
> **Status**: Especificação de Schemas de Dados Simulados em `localStorage`  
> **Nota de Acessibilidade**: Verificações de acessibilidade alinhadas a boas práticas, sem declaração de conformidade formal.

---

## 1. Estrutura do Estado Global (`cs360_data`)

Todo o estado de demonstração é persistido no `localStorage` sob a chave `cs360_data`. `[Definida — Regra Funcional]`

```json
{
  "systemInfo": { ... },
  "roles": [ ... ],
  "users": [ ... ],
  "costCenters": [ ... ],
  "requests": [ ... ],
  "nonFlownTickets": [ ... ],
  "mobilityRides": [ ... ],
  "suppliers": [ ... ],
  "tickets": [ ... ],
  "knowledgeArticles": [ ... ],
  "auditLogs": [ ... ]
}
```

---

## 2. Detalhamento das Entidades Principais

### 2.1. Entidade `ServiceRequest` (Solicitações de Serviço)

| Campo | Tipo | Obrigatoriedade | Descrição / Valores Possíveis | Status da Regra |
| :--- | :--- | :---: | :--- | :---: |
| `id` | String | Sim | Identificador único (Ex: `SOL-2026-001`). | `[Definida — Regra Funcional]` |
| `serviceType` | String | Sim | Frente de serviço: `viagem`, `mobilidade`, `correios`, `xerox`. | `[Definida — Regra Funcional]` |
| `title` | String | Sim | Título sintetizado da necessidade. | `[Definida — Regra Funcional]` |
| `requesterId` | String | Sim | ID do usuário solicitante (Ex: `USR-001`). | `[Definida — Regra Funcional]` |
| `costCenter` | String | Sim | Código do centro de custo pagador (Ex: `CC-3021`). | `[Definida — Regra Funcional]` |
| `status` | String | Sim | `RASCUNHO`, `PENDENTE_APROVACAO`, `APROVADO`, `EM_ATENDIMENTO`, `CONCLUIDO`, `REJEITADO`, `CANCELADO`. | `[Definida — Regra Funcional]` |
| `createdAt` | String | Sim | Data e hora ISO de criação (`YYYY-MM-DD HH:mm`). | `[Definida — Regra Funcional]` |
| `updatedAt` | String | Sim | Data e hora ISO de modificação. | `[Definida — Regra Funcional]` |
| `details` | Object | Sim | Objeto contendo os parâmetros específicos da frente. | `[Proposta de Produto]` |
| `history` | Array | Sim | Lista de eventos da linha do tempo (`date`, `action`, `user`). | `[Definida — Regra Funcional]` |

---

### 2.2. Entidade `NonFlownTicket` (Bilhetes Não Voados - RN-VIA-002)

| Campo | Tipo | Obrigatoriedade | Descrição / Valores Possíveis | Status da Regra |
| :--- | :--- | :---: | :--- | :---: |
| `id` | String | Sim | Identificador fictício do crédito (Ex: `TKT-99420`). | `[Definida — Regra Funcional]` |
| `passenger` | String | Sim | Nome do passageiro original. | `[Definida — Regra Funcional]` |
| `airline` | String | Sim | Companhia aérea responsável (Ex: `LATAM`, `GOL`, `AZUL`). | `[Definida — Regra Funcional]` |
| `creditBalance` | Number | Sim | Saldo monetário reutilizável em reais. | `[Definida — Regra Funcional]` |
| `expiresAt` | String | Sim | Data limite de validade do crédito (`YYYY-MM-DD`). | `[Definida — Regra Funcional]` |
| `status` | String | Sim | `DISPONIVEL` ou `UTILIZADO`. | `[Definida — Regra Funcional]` |

---

### 2.3. Entidade `MobilityRide` (Corridas de Mobilidade - RN-MOB-002)

| Campo | Tipo | Obrigatoriedade | Descrição / Valores Possíveis | Status da Regra |
| :--- | :--- | :---: | :--- | :---: |
| `id` | String | Sim | Código único da corrida (Ex: `RID-5501`). | `[Definida — Regra Funcional]` |
| `passenger` | String | Sim | Nome do passageiro fictício. | `[Definida — Regra Funcional]` |
| `date` | String | Sim | Data e hora do deslocamento. | `[Definida — Regra Funcional]` |
| `cost` | Number | Sim | Valor monetário em reais. | `[Definida — Regra Funcional]` |
| `policyFlag` | Boolean | Sim | Indica se a corrida fere a política (`true`/`false`). | `[Definida — Regra Funcional]` |
| `flagReason` | String | Não | Motivo detalhado da desconformidade. | `[Definida — Regra Funcional]` |

---

### 2.4. Entidade `AuditEvent` (Trilha de Auditoria - RN-SEG-003)

| Campo | Tipo | Obrigatoriedade | Descrição / Valores Possíveis | Status da Regra |
| :--- | :--- | :---: | :--- | :---: |
| `id` | String | Sim | Código de log (Ex: `AUD-1001`). | `[Definida — Regra Funcional]` |
| `timestamp` | String | Sim | Data e hora completa do evento. | `[Definida — Regra Funcional]` |
| `user` | String | Sim | Identificação do usuário/perfil executor. | `[Definida — Regra Funcional]` |
| `action` | String | Sim | Ação executada (Ex: `SOLICITACAO_CRIADA`, `SOLICITACAO_APROVADA`). | `[Definida — Regra Funcional]` |
| `resource` | String | Sim | Recurso afetado (Ex: `SOL-2026-001`). | `[Definida — Regra Funcional]` |
| `details` | String | Sim | Detalhamento descritivo da ação. | `[Definida — Regra Funcional]` |

---

## 3. Lacunas de Modelagem de Banco de Dados

- **Esquema de Banco Relacional (PostgreSQL)**: A transposição dessas estruturas em JSON para tabelas relacionais com chaves estrangeiras e índices será realizada no backend da Fase 1. `[Pendente de Validação Técnica]`
- **Tipagem Estrita em TypeScript**: Interfaces e DTOs tipados serão codificados na fundação NestJS da próxima etapa. `[Pendente de Validação Técnica]`
