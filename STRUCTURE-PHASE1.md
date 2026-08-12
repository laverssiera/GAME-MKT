# GAME MKT Directory Structure - FASE 1 (v2.0)

**Estrutura de diretórios esperada após implementação dos 4 módulos críticos da FASE 1**

---

## 📂 Raiz do Projeto

```
GAME-MKT/
├── 📖 Documentation/
│   ├── README.md                          # Start here
│   ├── ENTERPRISE-ARCHITECTURE.md          # Visão estratégica
│   ├── MODULES-STATUS.md                   # Rastreamento de módulos
│   ├── STRUCTURE-PHASE1.md                 # Este arquivo
│   ├── API-DOCUMENTATION.md                # API reference
│   ├── DEPLOYMENT.md                       # Guia de deploy
│   ├── CONTRIBUTING.md                     # Guia de contribuição
│   ├── SECURITY.md                         # Política de segurança
│   └── CHANGELOG.md                        # Histórico de versões
│
├── 📱 frontend/                             # Vue 3 + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Common/                     # Componentes básicos
│   │   │   ├── Layout/                     # Header, sidebar, footer
│   │   │   ├── Dashboard/
│   │   │   │   ├── ExecutiveBoard.vue      # Overview KPIs
│   │   │   │   ├── RevenueCards.vue        # CAC, LTV, ROI
│   │   │   │   ├── ForecastChart.vue       # Revenue forecast
│   │   │   │   └── CohortAnalysis.vue      # Retenção
│   │   │   ├── CRM/
│   │   │   │   ├── CrmSelector.vue         # Escolher qual CRM
│   │   │   │   ├── LeadList.vue            # Lista unified
│   │   │   │   ├── LeadDetail.vue          # Lead profile
│   │   │   │   └── JourneyMap.vue          # Jornada visual
│   │   │   ├── Omnichannel/
│   │   │   │   ├── MessageComposer.vue     # Escrever mensagem
│   │   │   │   ├── ChannelSelector.vue     # Escolher canal
│   │   │   │   ├── TemplateLibrary.vue     # Gerenciar templates
│   │   │   │   └── Analytics.vue           # Delivery, open rate
│   │   │   ├── John/
│   │   │   │   ├── JohnSDR.vue             # Painel do John
│   │   │   │   ├── QualifyFlow.vue         # BANT questions
│   │   │   │   ├── Proposalgen.vue         # Gerar proposta
│   │   │   │   └── NegotiationUI.vue       # Negociação
│   │   │   └── Analytics/
│   │   │       ├── KpiDashboard.vue        # KPIs gerais
│   │   │       ├── RevenueMetrics.vue      # Revenue analytics
│   │   │       ├── MarketIntel.vue         # Market trends
│   │   │       └── CustomReports.vue       # Report builder
│   │   │
│   │   ├── composables/
│   │   │   ├── useCRMFederation.ts         # Multi-CRM client
│   │   │   ├── useOmnichannel.ts           # Channel router
│   │   │   ├── useJohnSDR.ts               # AI SDR logic
│   │   │   ├── useRevenueAnalytics.ts      # KPI + forecast
│   │   │   ├── useMarketIntel.ts           # Market trends
│   │   │   └── [existing composables]
│   │   │
│   │   ├── lib/
│   │   │   ├── crm/
│   │   │   │   ├── federationClient.ts     # Federation API client
│   │   │   │   └── mappers.ts              # Schema mapping
│   │   │   ├── omnichannel/
│   │   │   │   ├── channelRouter.ts
│   │   │   │   └── templateEngine.ts
│   │   │   ├── analytics/
│   │   │   │   ├── kpiCalculator.ts
│   │   │   │   └── forecastClient.ts
│   │   │   └── [existing lib]
│   │   │
│   │   ├── store/
│   │   │   ├── crm.store.ts                # CRM federation state
│   │   │   ├── omnichannel.store.ts        # Canais + templates
│   │   │   ├── analytics.store.ts          # KPIs + forecast
│   │   │   ├── marketIntel.store.ts        # Market trends
│   │   │   └── [existing stores]
│   │   │
│   │   ├── types/
│   │   │   ├── crm.ts                      # CRM types
│   │   │   ├── omnichannel.ts              # Channel types
│   │   │   ├── analytics.ts                # KPI types
│   │   │   └── [existing types]
│   │   │
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── style.css
│   │
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
├── 🧠 backend/                             # Node.js + Express
│   ├── src/
│   │   ├── index.ts                        # Main entry point
│   │   │
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── crm.routes.ts           # CRM Federation routes
│   │   │   │   ├── omnichannel.routes.ts   # Channel router routes
│   │   │   │   ├── analytics.routes.ts     # KPI + forecast routes
│   │   │   │   ├── marketIntel.routes.ts   # Market intel routes
│   │   │   │   ├── composer.routes.ts      # SERVICE COMPOSER routes (NEW)
│   │   │   │   └── [existing routes]
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   ├── crmValidator.ts
│   │   │   │   ├── omniValidator.ts
│   │   │   │   ├── composerValidator.ts    # (NEW)
│   │   │   │   └── [existing middleware]
│   │   │   │
│   │   │   └── schemas/
│   │   │       ├── crm.schema.ts
│   │   │       ├── omnichannel.schema.ts
│   │   │       ├── composer.schema.ts      # (NEW)
│   │   │       └── [existing schemas]
│   │   │
│   │   ├── crm/
│   │   │   ├── [existing CRM structure]
│   │   │
│   │   ├── omnichannel/
│   │   │   ├── [existing omnichannel structure]
│   │   │
│   │   ├── analytics/
│   │   │   ├── [existing analytics structure]
│   │   │
│   │   ├── market-intel/
│   │   │   ├── [existing market intel structure]
│   │   │
│   │   ├── composer/                       # SERVICE COMPOSER (NEW MODULE)
│   │   │   ├── service-composer.ts         # Main orchestrator
│   │   │   ├── discovery-engine.ts         # NLP intent parsing
│   │   │   ├── composition-engine.ts       # Bundle composition algorithm
│   │   │   ├── compatibility-engine.ts     # Product integration validation
│   │   │   ├── pricing-engine.ts           # Aggregated pricing
│   │   │   ├── sla-coordinator.ts          # SLA multi-product
│   │   │   ├── execution-orchestrator.ts   # Project management
│   │   │   ├── catalog/
│   │   │   │   ├── product-catalog.ts      # Catálogo unificado
│   │   │   │   ├── bundle-templates.ts     # Pre-built solutions
│   │   │   │   └── integration-matrix.ts   # Compatibilidade
│   │   │   ├── models/
│   │   │   │   ├── bundle.model.ts
│   │   │   │   ├── composition.model.ts
│   │   │   │   └── execution.model.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── services/
│   │   │   ├── [existing services]
│   │   │   ├── crm-sync-scheduler.ts       # Background job
│   │   │   ├── analytics-compute.ts        # Batch jobs
│   │   │   └── product-catalog-sync.ts     # Keep catalog updated (NEW)
│   │   │
│   │   ├── models/
│   │   │   ├── crm.model.ts
│   │   │   ├── omnichannel.model.ts
│   │   │   ├── analytics.model.ts
│   │   │   ├── composer.model.ts           # (NEW)
│   │   │   └── [existing models]
│   │   │
│   │   ├── types/
│   │   │   ├── crm.ts
│   │   │   ├── omnichannel.ts
│   │   │   ├── analytics.ts
│   │   │   ├── composer.ts                 # (NEW)
│   │   │   └── [existing types]
│   │   │
│   │   └── [existing src structure]
│   │
│   ├── migrations/
│   │   ├── 001_create_crm_federation_tables.sql
│   │   ├── 002_create_omnichannel_tables.sql
│   │   ├── 003_create_analytics_tables.sql
│   │   ├── 004_create_market_intel_tables.sql
│   │   └── 005_create_composer_tables.sql   # (NEW)
│   │
│   ├── .env.example
│   ├── .env.local
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── README.md
│
├── 🧪 tests/
│   ├── integration/
│   │   ├── crm-federation.test.ts
│   │   ├── omnichannel.test.ts
│   │   └── analytics.test.ts
│   ├── e2e/
│   │   ├── crm-flow.test.ts
│   │   ├── message-routing.test.ts
│   │   └── revenue-tracking.test.ts
│   └── fixtures/
│       ├── crm-data.json
│       ├── leads.json
│       └── messages.json
│
├── 📊 infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   └── docker-compose.yml
│   ├── kubernetes/
│   │   ├── backend-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── postgres-statefulset.yaml
│   │   ├── redis-statefulset.yaml
│   │   └── nats-deployment.yaml
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── scripts/
│       ├── deploy.sh
│       ├── migrate.sh
│       └── rollback.sh
│
├── 📚 docs/
│   ├── API.md                              # API documentation
│   ├── ARCHITECTURE.md                     # System design
│   ├── DEPLOYMENT.md                       # Deploy guide
│   ├── CONTRIBUTING.md                     # Dev guide
│   ├── TESTING.md                          # Test guide
│   ├── schemas/
│   │   ├── crm-unified.schema.json
│   │   ├── omnichannel.schema.json
│   │   └── analytics.schema.json
│   └── diagrams/
│       ├── crm-federation.puml
│       ├── omnichannel-flow.puml
│       ├── analytics-pipeline.puml
│       └── architecture.puml
│
├── .github/
│   └── workflows/
│       ├── ci.yml                         # Tests on PR
│       ├── deploy.yml                     # Deploy to prod
│       └── security.yml                   # Security scan
│
├── .gitignore
├── .env.example
├── docker-compose.yml
├── package.json                            # Root monorepo
├── tsconfig.json
├── pnpm-workspace.yaml                     # monorepo config
└── ROADMAP.md                              # This roadmap

```

---

## 📊 Módulos por Diretório

### CRM Federation (`/backend/src/crm/`)

```
crm/
├── crm-federation.ts              # Orquestrador principal
├── types.ts                        # CRM types compartilhados
├── mapper.ts                       # Schema unification
├── deduplication.ts                # Fuzzy matching + merge
├── sync-engine.ts                  # Bi-directional sync
├── connectors/                     # Um por CRM
│   ├── salesforce-connector.ts
│   ├── hubspot-connector.ts
│   ├── rdstation-connector.ts
│   ├── pipedrive-connector.ts
│   ├── dynamics-connector.ts
│   ├── zoho-connector.ts
│   └── liceu-connector.ts
└── [future] multi-crm-query.ts     # GraphQL federation
```

### Omnichannel Router (`/backend/src/omnichannel/`)

```
omnichannel/
├── omnichannel-router.ts           # Orquestrador principal
├── channel-selector.ts             # Routing logic
├── template-engine.ts              # Template rendering
├── channels/                       # Provedores por canal
│   ├── whatsapp-channel.ts
│   ├── sms-channel.ts
│   ├── email-channel.ts
│   ├── push-channel.ts
│   ├── voice-channel.ts
│   └── avatar-channel.ts
└── analytics/
    ├── delivery-tracker.ts
    ├── engagement-tracker.ts
    └── metrics.ts
```

### Revenue Analytics (`/backend/src/analytics/`)

```
analytics/
├── revenue-analytics.ts            # Orquestrador principal
├── kpi-engine.ts                   # KPI calculations
│   ├── acquisition-kpis.ts         # CAC, CPL, ROAS
│   ├── retention-kpis.ts           # Churn, health, NPS
│   ├── growth-kpis.ts              # MRR, ARR, NRR
│   └── profitability-kpis.ts       # LTV, margin, payback
├── forecast-engine.ts              # ML predictions
│   ├── arima-model.ts
│   ├── prophet-model.ts
│   ├── xgboost-model.ts
│   ├── feature-engineering.ts      # Feature preparation
│   └── ensemble.ts                 # Combine models
├── cohort-analysis.ts              # Retenção por cohort
├── attribution-model.ts            # Multi-touch attribution
└── types.ts
```

### Market Intelligence (`/backend/src/market-intel/`)

```
market-intel/
├── market-intelligence.ts          # Orquestrador principal
├── price-monitor.ts                # Preço de concorrentes
├── demand-tracker.ts               # Trending + seasonality
├── sentiment-analyzer.ts           # Social listening
├── opportunity-detector.ts         # Anomalias + alertas
├── data-sources/
│   ├── competitor-api.ts
│   ├── market-feeds.ts
│   ├── social-media.ts
│   └── external-data.ts
└── types.ts
```

---

## 🔄 Fluxos Entre Módulos

### De CRM Federation para outros

```
Lead criado em Salesforce
    ↓
CRM Federation sincroniza para LICEU
    ↓
Omnichannel Router escolhe melhor canal
    ↓
Revenue Analytics atualiza pipeline
    ↓
Market Intel informa sobre oportunidade
```

### De Omnichannel para Analytics

```
Mensagem enviada (WhatsApp)
    ↓
Omnichannel rastreia delivery + opens
    ↓
Analytics agrega para engagement KPI
    ↓
Forecast atualiza previsão (lead responder?)
```

### De Analytics para Decisões

```
KPIs calculados
    ↓
Forecast pronto
    ↓
GAME MKT usa para decidir próxima ação
    ↓
John SDR ajusta estratégia de conversão
```

---

## 🧪 Arquivos de Configuração

### `.env.backend` (FASE 1)

```
# CRM Federation
SALESFORCE_CLIENT_ID=...
SALESFORCE_CLIENT_SECRET=...
HUBSPOT_API_KEY=...
RDSTATION_API_KEY=...
PIPEDRIVE_API_TOKEN=...
DYNAMICS_CLIENT_ID=...
ZOHO_CLIENT_ID=...

# Omnichannel
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
SENDGRID_API_KEY=...
FIREBASE_PROJECT_ID=...
META_BUSINESS_ACCOUNT_ID=...
META_ACCESS_TOKEN=...

# Analytics
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ELASTICSEARCH_URL=http://...
ML_MODEL_SERVER=http://...

# Market Intel
COMPETITOR_DATA_API=...
SOCIAL_MEDIA_API_KEY=...
NEWS_API_KEY=...
```

### `docker-compose.yml` (FASE 1)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: game_mkt
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine

  elasticsearch:
    image: elasticsearch:8-alpine
    environment:
      discovery.type: single-node

  nats:
    image: nats:alpine

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
      - elasticsearch
      - nats
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres/game_mkt
      - REDIS_URL=redis://redis:6379
      - ELASTICSEARCH_URL=http://elasticsearch:9200

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 📝 Naming Conventions

### Arquivos

- **Services:** `{feature}-service.ts` ou `{feature}-engine.ts`
- **Connectors:** `{provider}-connector.ts`
- **Types:** `{feature}-types.ts` ou `{feature}.ts` (no `/types`)
- **Utils:** `{feature}-utils.ts`
- **Helpers:** `{feature}-helpers.ts`
- **Models:** `{entity}.model.ts`
- **Routes:** `{feature}.routes.ts`

### Classes/Interfaces

- **Services:** `{Feature}Service` ou `{Feature}Engine`
- **Connectors:** `{Provider}Connector`
- **Types:** `I{Entity}` para interfaces, `{Entity}` para tipos
- **Models:** `{Entity}Model`

### Variáveis/Funções

- **Camelcase:** `getLeadById()`, `crmFederation`, `emailTemplate`
- **Constants:** `UPPERCASE_WITH_SNAKE`: `MAX_RETRIES`, `API_TIMEOUT`

---

## 🏗️ Diagrama de Dependências

```
┌─────────────────────────────────────────┐
│         Frontend (Vue 3)                │
├─────────────────────────────────────────┤
│ ├─ CRM Module (Seletor + List + Detail) │
│ ├─ Omnichannel Module                   │
│ ├─ Analytics Module (Dashboards)        │
│ └─ Market Intel Module                  │
└────────────┬────────────────────────────┘
             │ REST/GraphQL
             ↓
┌─────────────────────────────────────────────────────┐
│         Backend (Node.js + Express)                 │
├─────────────────────────────────────────────────────┤
│ ├─ CRM Federation (Salesforce, HubSpot, etc)       │
│ ├─ Omnichannel Router (WhatsApp, SMS, Email, etc)  │
│ ├─ Revenue Analytics (KPIs + Forecast)             │
│ └─ Market Intelligence (Trends + Anomalies)        │
└────────────┬────────────────────────────────────────┘
             │
    ┌────────┼────────┬─────────────┬──────────────┐
    ↓        ↓        ↓             ↓              ↓
┌────────┐ ┌─────┐ ┌──────────┐ ┌────┐       ┌──────────┐
│ Postgres│ │Redis│ │Elasticsearch│ │NATS│       │External  │
│(Primary)│ │(Cache)│ │(Search)    │ │(Bus)│       │APIs      │
└────────┘ └─────┘ └──────────┘ └────┘       └──────────┘
```

---

## ✅ Checklist de Implementação

### Sprint 1 (Semanas 1-2)
- [ ] Setup inicial (git, branches, CI/CD)
- [ ] Database migrations
- [ ] CRM Federation POC (Salesforce + HubSpot)
- [ ] Omnichannel Router Proof of Concept
- [ ] Initial test suite
- [ ] Documentation

### Sprint 2 (Semanas 3-4)
- [ ] Outros connectores CRM (4 remaining)
- [ ] Deduplicação e sync engine
- [ ] Omnichannel channels (WhatsApp, SMS, Email)
- [ ] Analytics KPI engine base
- [ ] Market Intel POC

### Sprint 3 (Semanas 5-6)
- [ ] CRM Federation v1 produção
- [ ] Omnichannel v1 produção
- [ ] Revenue Analytics v1 (KPIs básicos)
- [ ] AI SDR (John) iniciando

### Sprint 4 (Semanas 7-8)
- [ ] Revenue Analytics completo (Forecast)
- [ ] Market Intelligence v1
- [ ] Testes E2E
- [ ] Alpha testing com early customers

---

## 🚀 Deploy FASE 1

### Desenvolvimento
```bash
# Root
pnpm install
pnpm dev          # Roda frontend + backend simultaneamente
```

### CI/CD
- PR: tests + linting
- Merge to main: build + deploy to staging
- Tag release: deploy to production

### Rollback
```bash
./infrastructure/scripts/rollback.sh --version=v1.2.0
```

---

**Versão:** 1.0  
**Data:** Maio 2026  
**Próxima atualização:** Junho 2026 (após Sprint 1)

