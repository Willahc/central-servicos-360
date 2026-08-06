# Especificação dos Contratos de API REST (MVP)

> **Nota de Especificação**: Esta documentação descreve os endpoints REST futuros da Central de Serviços 360 CORE. Nenhuma API real está conectada no MVP estático.

---

## 1. Endpoints de Solicitações (`/api/v1/requests`)

### `GET /api/v1/requests`
- **Finalidade**: Listar solicitações com paginação e filtros.
- **Perfil Autorizado**: `colaborador`, `gestor`, `viagens`, `faturamento`, `coordenadora`, `gerencia`, `financeiro`, `administrador`, `auditoria`.
- **Query Parameters**:
  - `page` (integer, default: 1)
  - `limit` (integer, default: 20)
  - `status` (string, enum: `PENDENTE_APROVACAO`, `APROVADO`, `EM_ATENDIMENTO`, `CONCLUIDO`, `REJEITADO`)
  - `serviceType` (string, enum: `viagem`, `mobilidade`, `correios`, `xerox`)
- **Resposta Sucesso (200 OK)**:
```json
{
  "data": [
    {
      "id": "SOL-2026-001",
      "serviceType": "viagem",
      "title": "Participação no Congresso Nacional",
      "requesterName": "Carlos Andrade",
      "costCenter": "CC-3021",
      "status": "PENDENTE_APROVACAO",
      "createdAt": "2026-08-01T10:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

---

### `POST /api/v1/requests`
- **Finalidade**: Abertura de nova solicitação de serviço.
- **Perfil Autorizado**: `colaborador`, `administrador`.
- **Request Body**:
```json
{
  "serviceType": "viagem",
  "title": "Participação no Congresso de Hotelaria",
  "costCenter": "CC-3021",
  "details": {
    "origin": "São Paulo (GRU)",
    "destination": "Brasília (BSB)",
    "departureDate": "2026-09-15",
    "returnDate": "2026-09-18",
    "reason": "Apresentação de trabalho científico."
  }
}
```
- **Resposta Sucesso (201 Created)**:
```json
{
  "id": "SOL-2026-999",
  "status": "PENDENTE_APROVACAO",
  "message": "Solicitação criada com sucesso."
}
```

---

### `POST /api/v1/requests/{id}/approval`
- **Finalidade**: Aprovar ou Rejeitar solicitação.
- **Perfil Autorizado**: `gestor`, `coordenadora`, `administrador`.
- **Request Body**:
```json
{
  "decision": "REJEITADO",
  "rationale": "Viagem fora do orçamento aprovado para o trimestre (RN-GER-005)."
}
```
- **Resposta Sucesso (200 OK)**:
```json
{
  "id": "SOL-2026-001",
  "status": "REJEITADO",
  "updatedAt": "2026-08-06T10:00:00Z"
}
```

---

## 2. Códigos de Erro Padrão
- `400 Bad Request`: Dados obrigatórios ausentes.
- `401 Unauthorized`: Autenticação não informada.
- `403 Forbidden`: Perfil sem acesso à ação.
- `422 Unprocessable Entity`: Falha em regra de negócio (ex: Rejeição sem justificativa textual).
