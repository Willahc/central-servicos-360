# Especificação Técnica de Mocks, Adaptadores e Dados Simulados (Fase 0.6B)

> **Projeto**: Central de Serviços 360  
> **Fase**: 0.6B — Especificação Técnica de Mocks e Adaptadores  
> **Status**: Approved / Validados  
> **Nota de Acessibilidade**: Verificações de acessibilidade alinhadas a boas práticas, sem declaração de conformidade formal.

---

## 1. Visão Geral da Camada de Adaptadores Simulados

Para garantir o funcionamento 100% autônomo e isolado do protótipo e da transição para a Fase 1 sem dependências de ambientes externos ativos de produção ou homologação, a plataforma utiliza uma camada de **Adaptadores Simulados (Mock Adapters)**. `[Definida — Regra Funcional]` (RN-INT-004)

---

## 2. Arquitetura da Camada de Adaptadores

```
+-------------------------------------------------------------------------+
|                  CENTRAL DE SERVIÇOS 360 (CORE)                         |
|     (Gestão de Solicitações, Aprovações, Financeiro & Audit)            |
+-------------------------------------------------------------------------+
                                    |
                 [ Interface IExternalSystemAdapter ]
                                    |
    +-------------------+-----------+-----------+-------------------+
    |                   |                       |                   |
    v                   v                       v                   v
[MockArgoAdapter] [MockUberAdapter]     [MockCorreiosAdapter] [MockXeroxAdapter]
 - Cotador Voos    - Agendador Corridas   - Gerador Tracking   - Calculador Gráfico
 - Emissor Bilhete - Consulta Voucher     - Validador CEP      - Fila Impressão
```

---

## 3. Especificação dos 4 Adaptadores Principais

### 3.1. Adaptador 01: Viagens Corporativas (Argo / Copastur Mock)
- **Interface**: `IViagemAdapter`
- **Operações Simuladas**:
  - `consultarBilhetesNaoVoados(colaboradorCpf: string): Promise<BilheteNaoVoados[]>`
  - `cotarTrecho(origem: string, destino: string, data: string): Promise<OpcaoCotacao[]>`
  - `emitirVoucher(solicitacaoId: string): Promise<{ bilheteCode: string, pnr: string }>`
- **Comportamento Simulado**:
  - Retorna saldos pré-cadastrados (ex: bilhete de R$ 850,00 expirando em 30 dias para testes).
  - Gera localizador PNR fictício com padrão de 6 caracteres alfanuméricos (`ARGO-99X`).

### 3.2. Adaptador 02: Mobilidade Urbana (Uber for Business / Táxi Mock)
- **Interface**: `IMobilidadeAdapter`
- **Operações Simuladas**:
  - `associarCentroCusto(usuarioEmail: string, ccCode: string): Promise<boolean>`
  - `solicitarVoucherCorrida(origem: string, destino: string, motivo: string): Promise<VoucherCorrida>`
  - `importarFaturaMensal(periodo: string): Promise<ItemFaturaUber[]>`
- **Comportamento Simulado**:
  - Gera voucher virtual com QR Code estático e link de corrida simulado.
  - Aloca custo instantaneamente ao Centro de Custo especificado no perfil ativo.

### 3.3. Adaptador 03: Correios e Encomendas (Correios Mock)
- **Interface**: `ICorreiosAdapter`
- **Operações Simuladas**:
  - `gerarEtiquetaPostagem(remetente: string, destinatario: string, tipoModalidade: string): Promise<Etiqueta>`
  - `consultarRastreamento(codigoRastreio: string): Promise<HistoricoRastreio>`
- **Comportamento Simulado**:
  - Emite código no formato `BR123456789CS`.
  - Simula linha do tempo automática com 4 etapas: *Postado*, *Em Trânsito*, *Saiu para Entrega*, *Entregue*.

### 3.4. Adaptador 04: Xerox e Impressões Gráficas (Gráfica Interna / Parcial Mock)
- **Interface**: `IXeroxAdapter`
- **Operações Simuladas**:
  - `calcularOrcamentoGrafico(paginas: number, cor: boolean, acabamento: string): Promise<number>`
  - `enviarFilaImpressao(arquivoId: string, copias: number): Promise<StatusFila>`
- **Comportamento Simulado**:
  - Calcula custo estimado com base na tabela normativa: A4 P&B (R$ 0,10), A4 Color (R$ 0,50), Encadernação (R$ 5,00).

---

## 4. Matriz de Cobertura e Sementes de Dados (Seed Data)

| Entidade | Instâncias Iniciais | Chave Primária | Persistência Local |
| :--- | :---: | :--- | :--- |
| **Perfis (RBAC)** | 9 perfis | `roles[].id` | Constante em memória |
| **Usuários** | 9 usuários | `users[].id` | `localStorage:cs360_users` |
| **Centros de Custo** | 6 centros | `costCenters[].code` | `localStorage:cs360_cost_centers` |
| **Solicitações** | 5 solicitações | `requests[].id` | `localStorage:cs360_requests` |
| **Créditos Viagem** | 3 bilhetes | `nonFlownTickets[].id` | `localStorage:cs360_tickets` |
| **Atendimentos** | 3 chamados | `tickets[].id` | `localStorage:cs360_support_tickets` |
| **Trilha Auditoria** | Histórico dinâmico | `auditLogs[].id` | `localStorage:cs360_audit_log` |

---

## 5. Protocolo de Redefinição e Limpeza (Reset Admin)

O sistema deve disponibilizar o procedimento `resetDemoData()` acessível pelo perfil Administrador:
1. Remove todas as chaves iniciadas por `cs360_` no armazenamento local (`localStorage`).
2. Recarrega as sementes contidas no objeto global `window.CS360_INITIAL_MOCK`.
3. Registra evento de auditoria com timestamp atual: `[ADMIN_RESET] Dados fictícios restaurados`.
