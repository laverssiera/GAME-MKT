# GAME MKT API v2.0 Endpoints Reference

**Todos os endpoints que serão implementados na FASE 1 (v2.0 - Julho-Setembro 2026)**

---

## 📋 Índice

1. [Monolito Implementado (MVP Atual)](#-monolito-implementado-mvp-atual)
2. [CRM Federation](#crm-federation)
3. [Omnichannel Router](#omnichannel-router)
4. [Revenue Analytics](#revenue-analytics)
5. [Market Intelligence](#market-intelligence)
6. [Integrações](#integrações)

---

## 🚀 Monolito Implementado (MVP Atual)

Base URL: `/api/`

### Leads

- `POST /leads`
- `GET /leads`
- `GET /leads/{lead_id}`
- `PATCH /leads/{lead_id}`
- `DELETE /leads/{lead_id}`
- `POST /leads/{lead_id}/qualify`
- `GET /leads/by-status/{status}`

### Campaigns

- `POST /campaigns`
- `GET /campaigns`
- `GET /campaigns/{campaign_id}`

### Dashboard

- `GET /dashboard/metrics`
- `GET /dashboard/realtime`

### Service Composer

- `POST /composer/discover`
- `POST /composer/suggest`
- `GET /composer/bundles/templates`
- `POST /composer/bundles`
- `GET /composer/bundles`
- `GET /composer/bundles/{bundle_id}`
- `POST /composer/price`
- `POST /composer/compatibility/check`
- `POST /composer/execute`
- `GET /composer/executions/{execution_id}`
- `PUT /composer/executions/{execution_id}/reschedule`
- `GET /composer/customers/{customer_id}/opportunities`
- `POST /composer/catalog`
- `GET /composer/catalog`

### Sistema

- `GET /health`
- `GET /`

---

## 🔗 CRM Federation

Base URL: `/api/crm/`

### Lead Management

#### GET `/leads/:lead_id`
Buscar lead unificado de qualquer CRM.

**Query Params:**
- `include_history` (boolean) - incluir histórico de interações

**Resposta (200):**
```json
{
  "id": "lead_unified_123",
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "+55 11 99999-9999",
  "company": "Acme Corp",
  "source_crm": {
    "type": "salesforce",
    "crm_id": "00Q1100001c0Dsx",
    "last_sync": "2026-05-08T14:30:00Z"
  },
  "status": "lead",
  "score": 75,
  "tags": ["hot", "finance"],
  "addresses": [
    {
      "type": "billing",
      "street": "Rua A",
      "city": "São Paulo",
      "country": "BR",
      "postal_code": "01310-100"
    }
  ],
  "interactions": [
    {
      "date": "2026-05-08T10:00:00Z",
      "type": "email_open",
      "details": "Onboarding sequence"
    }
  ],
  "custom_fields": {
    "budget": "50000",
    "decision_timeline": "30_days"
  }
}
```

---

#### POST `/leads`
Criar novo lead (sincroniza em todos os CRMs selecionados).

**Request:**
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "+55 11 98888-8888",
  "company": "Tech Startup",
  "crms": ["salesforce", "hubspot"],
  "source": "google_ads",
  "campaign_id": "camp_001",
  "custom_fields": {
    "product_interest": "archimedes",
    "budget": "100000"
  }
}
```

**Resposta (201):**
```json
{
  "id": "lead_unified_456",
  "sync_status": {
    "salesforce": "synced",
    "hubspot": "synced"
  }
}
```

---

#### PUT `/leads/:lead_id`
Atualizar lead (propaga em todos CRMs).

**Request:**
```json
{
  "status": "qualified",
  "score": 85,
  "custom_fields": {
    "decision_timeline": "15_days"
  }
}
```

---

#### POST `/leads/:lead_id/merge`
Merguear dois leads duplicados.

**Request:**
```json
{
  "primary_lead_id": "lead_unified_123",
  "duplicate_lead_id": "lead_unified_456",
  "conflict_resolution": {
    "email": "primary",
    "phone": "duplicate"
  }
}
```

---

#### GET `/leads`
Listar leads unificados (com paginação + filtros).

**Query Params:**
- `filter` (string) - JSON filter `{"status": "qualified", "score": {">": 70}}`
- `sort` (string) - `score:desc,created_at:asc`
- `limit` (number) - default 20, max 100
- `offset` (number) - pagination

**Resposta (200):**
```json
{
  "data": [...],
  "total": 1500,
  "limit": 20,
  "offset": 0
}
```

---

### CRM Configuration

#### GET `/crms`
Listar CRMs conectados.

**Resposta (200):**
```json
{
  "connected_crms": [
    {
      "type": "salesforce",
      "account_id": "...",
      "name": "Salesforce Prod",
      "status": "connected",
      "sync_status": {
        "last_sync": "2026-05-08T14:30:00Z",
        "next_sync": "2026-05-08T15:00:00Z",
        "error_count": 0,
        "synced_leads": 1200
      },
      "rate_limit": {
        "limit": 10000,
        "used": 8500,
        "reset_at": "2026-05-09T00:00:00Z"
      }
    },
    {
      "type": "hubspot",
      "api_key": "***",
      "name": "HubSpot Main",
      "status": "connected",
      "sync_status": {...}
    }
  ]
}
```

---

#### POST `/crms/:crm_type/connect`
Conectar novo CRM.

**Request:**
```json
{
  "type": "salesforce",
  "credentials": {
    "instance_url": "https://my.salesforce.com",
    "client_id": "...",
    "client_secret": "..."
  }
}
```

---

#### DELETE `/crms/:crm_id`
Desconectar CRM.

---

#### GET `/crms/:crm_id/sync/status`
Status de sincronização.

---

#### POST `/crms/:crm_id/sync/trigger`
Forçar sincronização imediata.

---

### Field Mapping

#### GET `/field-mapping`
Visualizar mapeamento de campos (schema unificado vs. cada CRM).

**Resposta (200):**
```json
{
  "mappings": [
    {
      "unified_field": "name",
      "salesforce_field": "Name",
      "hubspot_field": "firstname + lastname",
      "rdstation_field": "name",
      "data_type": "string"
    },
    {
      "unified_field": "status",
      "salesforce_field": "StageName",
      "hubspot_field": "lifecyclestage",
      "mapping_rule": "custom_transformer"
    }
  ]
}
```

---

#### PUT `/field-mapping/:field_id`
Atualizar mapeamento de campo.

---

## 📨 Omnichannel Router

Base URL: `/api/omnichannel/`

### Message Sending

#### POST `/messages/send`
Enviar mensagem (router escolhe melhor canal).

**Request:**
```json
{
  "lead_id": "lead_unified_123",
  "content": "Olá João! Temos uma oportunidade especial para você.",
  "content_type": "text",
  "channels": ["auto"],
  "payload": {
    "template_id": "onboarding_001",
    "variables": {
      "lead_name": "João",
      "offer_value": "$5000"
    }
  },
  "priority": "high",
  "schedule_at": "2026-05-08T18:00:00Z"
}
```

**Resposta (202):**
```json
{
  "message_id": "msg_001",
  "scheduled": false,
  "routing_decision": {
    "selected_channel": "whatsapp",
    "reason": "high_engagement_history",
    "alternative_channels": ["email", "sms"],
    "fallback_sequence": ["sms", "email"]
  },
  "status": "sent",
  "timestamps": {
    "sent_at": "2026-05-08T15:30:00Z",
    "delivery_confirmed_at": "2026-05-08T15:30:05Z"
  }
}
```

---

#### POST `/messages/bulk-send`
Enviar para múltiplos leads.

**Request:**
```json
{
  "lead_ids": ["lead_001", "lead_002", "lead_003"],
  "content": "...",
  "channels": ["auto"],
  "send_at": "2026-05-08T18:00:00Z"
}
```

---

#### GET `/messages/:message_id`
Buscar status de mensagem.

**Resposta (200):**
```json
{
  "message_id": "msg_001",
  "lead_id": "lead_unified_123",
  "channel": "whatsapp",
  "status": "delivered",
  "content": "...",
  "timestamps": {
    "sent_at": "2026-05-08T15:30:00Z",
    "delivered_at": "2026-05-08T15:30:05Z",
    "read_at": "2026-05-08T15:32:00Z"
  },
  "engagement": {
    "opened": true,
    "clicked": false,
    "replied": true,
    "reply_at": "2026-05-08T15:33:00Z",
    "reply_content": "Sim, estou interessado!"
  }
}
```

---

### Templates

#### GET `/templates`
Listar templates por canal.

#### POST `/templates`
Criar novo template.

#### PUT `/templates/:template_id`
Atualizar template.

---

### Channel Configuration

#### GET `/channels/status`
Status de todos os canais.

**Resposta (200):**
```json
{
  "channels": {
    "whatsapp": {
      "status": "connected",
      "rate_limit": "1000/sec",
      "queue_length": 250
    },
    "email": {
      "status": "connected",
      "provider": "sendgrid",
      "daily_limit": 100000,
      "sent_today": 45000
    },
    "sms": {
      "status": "connected",
      "provider": "twilio",
      "credits": 5000
    },
    "push": {
      "status": "connected",
      "provider": "firebase",
      "devices_registered": 12500
    }
  }
}
```

---

#### POST `/channels/:channel_type/test`
Enviar mensagem de teste.

---

### Analytics

#### GET `/analytics/channels`
Performance por canal.

**Query Params:**
- `period` - `7d`, `30d`, `90d`
- `breakdown` - por `channel`, `template`, `lead_segment`

**Resposta (200):**
```json
{
  "period": "7d",
  "channels": {
    "whatsapp": {
      "sent": 5000,
      "delivered": 4950,
      "delivery_rate": 0.99,
      "open_rate": 0.85,
      "click_rate": 0.15,
      "reply_rate": 0.30,
      "cost": 50,
      "cost_per_message": 0.01
    },
    "email": {
      "sent": 10000,
      "delivered": 9500,
      "delivery_rate": 0.95,
      "open_rate": 0.25,
      "click_rate": 0.08,
      "reply_rate": 0.02,
      "cost": 0,
      "cost_per_message": 0
    }
  }
}
```

---

#### POST `/analytics/a-b-test`
Criar teste A/B de canais/templates.

---

## 📊 Revenue Analytics

Base URL: `/api/analytics/`

### KPI Dashboard

#### GET `/kpis`
Todos os KPIs.

**Query Params:**
- `period` - `7d`, `30d`, `90d`, `1y`
- `breakdown` - `product`, `channel`, `region`, `segment`

**Resposta (200):**
```json
{
  "period": "30d",
  "summary": {
    "revenue": 500000,
    "revenue_growth": 0.15,
    "leads_generated": 1200,
    "leads_converted": 150,
    "conversion_rate": 0.125
  },
  "acquisition": {
    "cac": 500,
    "cac_trend": -0.05,
    "cpl": 50,
    "roas": 2.5,
    "channels": {
      "google_ads": {
        "cac": 400,
        "leads": 300,
        "conversions": 45
      },
      "instagram": {
        "cac": 600,
        "leads": 200,
        "conversions": 25
      }
    }
  },
  "retention": {
    "churn_rate": 0.05,
    "repeat_purchase_rate": 0.30,
    "health_score": 72,
    "nps": 45
  },
  "growth": {
    "mrr": 50000,
    "arr": 600000,
    "mrr_growth": 0.08,
    "net_revenue_retention": 1.10
  },
  "profitability": {
    "ltv": 2500,
    "ltv_cac_ratio": 5.0,
    "gross_margin": 0.70,
    "payback_period_months": 2
  }
}
```

---

### Forecasts

#### GET `/forecast`
Previsão de receita.

**Query Params:**
- `horizon` - `30d`, `90d`, `365d`, `5y`
- `model` - `auto`, `arima`, `prophet`, `xgboost`
- `include_confidence` - boolean

**Resposta (200):**
```json
{
  "forecast": [
    {
      "date": "2026-05-15",
      "predicted_revenue": 520000,
      "confidence_interval": {
        "lower": 480000,
        "upper": 560000
      }
    },
    {
      "date": "2026-05-22",
      "predicted_revenue": 550000,
      "confidence_interval": {
        "lower": 500000,
        "upper": 600000
      }
    }
  ],
  "model_accuracy": 0.92,
  "last_updated": "2026-05-08T14:30:00Z"
}
```

---

#### GET `/forecast/leads`
Previsão de conversão de leads.

#### GET `/forecast/churn`
Previsão de churn.

---

### Cohort Analysis

#### GET `/cohorts/:cohort_id`
Análise de retenção de um cohort.

**Resposta (200):**
```json
{
  "cohort_id": "2026_04",
  "cohort_month": "2026-04",
  "size": 300,
  "retention_weeks": {
    "w0": 300,
    "w1": 285,
    "w2": 270,
    "w4": 240,
    "w8": 180,
    "w12": 120
  },
  "retention_rates": {
    "w1": 0.95,
    "w2": 0.90,
    "w4": 0.80,
    "w12": 0.40
  }
}
```

---

### Custom Reports

#### POST `/reports`
Criar relatório customizado.

**Request:**
```json
{
  "name": "Q2 Revenue Report",
  "metrics": ["revenue", "cac", "ltv", "churn_rate"],
  "dimensions": ["month", "product", "region"],
  "filters": {
    "date_range": ["2026-04-01", "2026-06-30"],
    "product": "archimedes"
  },
  "format": "pdf"
}
```

---

## 🌎 Market Intelligence

Base URL: `/api/market-intel/`

### Price Monitoring

#### GET `/competitors/prices`
Preços de concorrentes.

**Query Params:**
- `product` - tipo de produto a monitorar
- `region` - região geográfica

**Resposta (200):**
```json
{
  "product": "residential_property",
  "region": "sao_paulo",
  "competitors": [
    {
      "competitor": "Competitor A",
      "price": 250000,
      "price_trend": -0.05,
      "market_share": 0.15
    },
    {
      "competitor": "Competitor B",
      "price": 280000,
      "price_trend": 0.02,
      "market_share": 0.12
    }
  ],
  "market_average": 265000,
  "our_price": 270000,
  "our_position": "premium",
  "recommendation": "consider_price_reduction"
}
```

---

### Demand Signals

#### GET `/trends/:product`
Tendências de demanda.

**Resposta (200):**
```json
{
  "product": "residential_property",
  "trend": "increasing",
  "growth_rate": 0.12,
  "seasonality": {
    "peak_months": ["01", "02", "07", "12"],
    "low_months": ["04", "08"]
  },
  "forecast_next_30d": 1500,
  "forecast_next_90d": 4500
}
```

---

### Sentiment Analysis

#### GET `/sentiment`
Análise de sentimento (social + news).

**Query Params:**
- `keywords` - termos a monitorar

**Resposta (200):**
```json
{
  "overall_sentiment": 0.65,
  "positive": 0.55,
  "neutral": 0.30,
  "negative": 0.15,
  "sources": {
    "twitter": 0.60,
    "instagram": 0.70,
    "news": 0.55,
    "forums": 0.50
  },
  "trending_topics": [
    "sustainability",
    "smart_home",
    "affordable_housing"
  ]
}
```

---

### Opportunities

#### GET `/opportunities`
Anomalias e oportunidades detectadas.

**Resposta (200):**
```json
{
  "opportunities": [
    {
      "id": "opp_001",
      "type": "price_gap",
      "description": "Competitor A baixou preço em 10%",
      "regions_affected": ["sao_paulo", "rio_janeiro"],
      "estimated_impact": -0.08,
      "recommended_action": "investigate_cost_reduction",
      "urgency": "high"
    },
    {
      "id": "opp_002",
      "type": "demand_spike",
      "description": "Busca por financiamento residencial +25%",
      "seasons": ["q2", "q3"],
      "estimated_opportunity": 500000,
      "recommended_action": "increase_budget_cea",
      "urgency": "medium"
    }
  ]
}
```

---

## � Service Composer Engine

Base URL: `/api/composer/`

### Discovery (NLP-powered)

#### POST `/discover`
Analisar necessidade expressed pelo cliente in natural language.

**Request:**
```json
{
  "query": "Quero construir um condomínio inteligente com 100 unidades",
  "context": {
    "customer_segment": "DEVELOPER",
    "budget_range_millions": [3, 5],
    "timeline_months": 12
  }
}
```

**Response (200):**
```json
{
  "primary_need": "smart_residential_construction",
  "secondary_needs": ["automation", "analytics", "facilities_ops"],
  "extracted_constraints": {
    "budget_max": 5000000,
    "timeline_months": 12,
    "unit_count": 100
  },
  "confidence": 0.92,
  "clarifying_questions": [
    "Qual é o nível esperado de automação?",
    "Precisa de financiamento integrado?"
  ]
}
```

---

### Bundle Suggestion

#### POST `/suggest`
Sugerir bundles pré-configurados ou customizados.

**Request:**
```json
{
  "discovered_needs": ["smart_residential_construction", "automation"],
  "constraints": {
    "budget_max": 5000000,
    "timeline_months": 12,
    "must_have": ["archimedes", "john"],
    "excluded": []
  },
  "optimize_for": "MARGIN"
}
```

**Response (200):**
```json
{
  "suggestions": [
    {
      "rank": 1,
      "name": "Smart Residential Complete",
      "products": [
        { "product": "Archimedes", "price": 2000000, "weeks": 52 },
        { "product": "CEA", "price": 0, "weeks": 0 },
        { "product": "John", "price": 300000, "weeks": 2 },
        { "product": "Cefeida", "price": 150000, "weeks": 4 },
        { "product": "LICEU HARDWARE", "price": 400000, "weeks": 8 },
        { "product": "Anchor", "price": 500000, "weeks": 2 },
        { "product": "Observabilidade", "price": 100000, "weeks": 4 }
      ],
      "total_price": 3450000,
      "bundle_discount_percent": 12,
      "margin_realized": 0.45,
      "timeline_weeks": 52,
      "compatibility_score": 0.98,
      "success_probability": 0.92
    },
    {
      "rank": 2,
      "name": "Smart Residential Essential",
      "products": [...],
      "total_price": 2800000,
      "margin_realized": 0.50
    },
    {
      "rank": 3,
      "name": "Smart Residential Lite",
      "products": [...],
      "total_price": 1500000,
      "margin_realized": 0.48
    }
  ]
}
```

---

#### GET `/bundles/templates`
Listar bundles pré-configurados.

**Query Params:**
- `category` - `residential`, `commercial`, `industrial`
- `budget_max` - em milhões
- `timeline_max_weeks`

**Response (200):**
```json
{
  "templates": [
    {
      "id": "bundle_smart_residential",
      "name": "Smart Residential Complete",
      "description": "Condomínio inteligente com construção, automação, analytics",
      "typical_price": 3450000,
      "typical_timeline_weeks": 52,
      "success_rate": 0.92,
      "ideal_for": "Large residential developers"
    },
    {
      "id": "bundle_retrofit",
      "name": "Retrofit Inteligente",
      "description": "Adicionar automação a construção existente",
      "typical_price": 200000,
      "typical_timeline_weeks": 8,
      "success_rate": 0.88,
      "ideal_for": "Property owners"
    }
  ]
}
```

---

### Pricing & Configuration

#### POST `/price`
Calcular preço aggregado de bundle.

**Request:**
```json
{
  "bundle_id": "bundle_smart_residential",
  "customer_segment": "ENTERPRISE",
  "add_customizations": {
    "archimedes_extra_units": 50,
    "john_premium_support": true
  }
}
```

**Response (200):**
```json
{
  "line_items": [
    { "product": "Archimedes", "quantity": 1, "unit_price": 2000000, "discount_percent": 10, "line_total": 1800000 },
    { "product": "John", "quantity": 1, "unit_price": 300000, "discount_percent": 10, "line_total": 270000 }
  ],
  "subtotal": 3450000,
  "bundle_discount_percent": 12,
  "bundle_discount_value": 414000,
  "total_price": 3036000,
  "margin_realized": 0.45,
  "gross_margin_percent": 45,
  "payment_terms": "NET_30",
  "valid_until": "2026-06-30"
}
```

---

#### POST `/compatibility/check`
Validar que produtos integram bem.

**Request:**
```json
{
  "bundle": {
    "products": ["archimedes", "john", "cefeida", "hardware"],
    "integrations": [...]
  }
}
```

**Response (200):**
```json
{
  "is_compatible": true,
  "compatibility_score": 0.98,
  "issues": [],
  "integration_testing_required": false,
  "estimated_integration_days": 0
}
```

---

### Execution

#### POST `/execute`
Iniciar execução de um bundle (criar projeto).

**Request:**
```json
{
  "bundle_id": "bundle_smart_residential",
  "customer_id": "cust_001",
  "team_lead": "user_456",
  "kickoff_date": "2026-06-15"
}
```

**Response (202):**
```json
{
  "execution_id": "exec_001",
  "status": "IN_PLANNING",
  "phases": [
    {
      "phase": 1,
      "name": "Architecture & Planning",
      "duration_weeks": 2,
      "lead": "Archimedes team",
      "start_date": "2026-06-15"
    },
    {
      "phase": 2,
      "name": "Construction",
      "duration_weeks": 48,
      "lead": "Archimedes team",
      "start_date": "2026-06-29"
    },
    {
      "phase": 3,
      "name": "Automation & Systems",
      "duration_weeks": 4,
      "lead": "LICEU HARDWARE team",
      "start_date": "2026-08-24"
    }
  ],
  "critical_path": ["Construction", "Automation", "Testing"],
  "go_live_date": "2027-05-31"
}
```

---

#### GET `/executions/:execution_id`
Status de execução.

**Response (200):**
```json
{
  "execution_id": "exec_001",
  "status": "IN_PROGRESS",
  "progress_percent": 35,
  "phases": [
    {
      "name": "Architecture & Planning",
      "status": "COMPLETED",
      "actual_weeks": 2,
      "planned_weeks": 2
    },
    {
      "name": "Construction",
      "status": "IN_PROGRESS",
      "progress_percent": 45,
      "actual_weeks": 21,
      "planned_weeks": 48
    }
  ],
  "risks": [
    {
      "risk": "Material shortage",
      "impact": "HIGH",
      "mitigation": "Sourcing from backup supplier"
    }
  ],
  "blockers": [],
  "next_milestone": "Foundation completion",
  "scheduled_date": "2026-08-15"
}
```

---

#### PUT `/executions/:execution_id/reschedule`
Ajustar timeline de execução.

---

### Post-Sale Opportunities

#### GET `/customers/:customer_id/opportunities`
Detectar upsell opportunities baseado no que cliente já tem.

**Response (200):**
```json
{
  "opportunities": [
    {
      "type": "ADD_ON",
      "current_product": "archimedes",
      "opportunity": "smart_home_retrofit",
      "suggested_bundle": "retrofit_inteligente",
      "estimated_value": 150000,
      "margin": 0.50,
      "urgency": "HIGH",
      "reason": "Retrofits complement residential sales"
    },
    {
      "type": "UPGRADE",
      "current": "cefeida_basic",
      "opportunity": "cefeida_enterprise",
      "estimated_value": 50000,
      "recurring": true,
      "urgency": "MEDIUM"
    }
  ]
}
```

---

### Catalog Management

#### GET `/catalog/products`
Listar todos os produtos disponíveis.

#### POST `/catalog/products`
**Admin only** - Adicionar novo produto ao catálogo.

#### PUT `/catalog/products/:product_id`
**Admin only** - Atualizar metadados do produto.

---

## 🔌 Integrações

### Business Intelligence

#### POST `/integration/cefeida/intelligence`
Receber insights de Cefeida.

---

### John Brasil

#### POST `/integration/john/lead-handoff`
Handoff de lead para John qualificar.

#### POST `/integration/john/decision`
Decisão de jornada do John.

---

### Monolitos

#### POST `/integration/archimedes/lead`
Nova leads do Archimedes.

#### POST `/integration/cea/finance-approval`
Aprovação de financiamento da CEA.

#### POST `/integration/composer/execution-handoff`
Service Composer entrega projeto para time de execução.

---

## 🔐 General

### Health Check

#### GET `/health`
Status da plataforma.

**Resposta (200):**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "uptime": 999999,
  "dependencies": {
    "database": "healthy",
    "redis": "healthy",
    "elasticsearch": "healthy",
    "nats": "healthy"
  }
}
```

---

### Rate Limiting

Todos os endpoints respeitam rate limits:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1620000000
```

---

### Error Handling

Todos os erros seguem padrão:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Lead email is required",
    "details": {
      "field": "email",
      "issue": "missing_required_field"
    }
  }
}
```

---

**Total de Endpoints v2.0:** ~75 novos endpoints  
**Compatibilidade:** v1.2.0 endpoints continuam funcionando  
**Documentação Completa:** /docs/API.md

