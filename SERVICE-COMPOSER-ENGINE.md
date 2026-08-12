# SERVICE COMPOSER ENGINE (v2.0)

**O coração inteligente da Holding Cognitiva LICEU 6.0**

---

## 📋 Índice

1. [Visão Estratégica](#visão-estratégica)
2. [Arquitetura](#arquitetura)
3. [Fluxos Principais](#fluxos-principais)
4. [Componentes Técnicos](#componentes-técnicos)
5. [Catalog Management](#catalog-management)
6. [Bundle Composition](#bundle-composition)
7. [Pricing Engine](#pricing-engine)
8. [Execution Orchestration](#execution-orchestration)
9. [Exemplos Reais](#exemplos-reais)
10. [Roadmap](#roadmap)

---

## 🎯 Visão Estratégica

### Problema

LICEU 6.0 possui 8 monolitos + labs que operam isoladamente:
- Archimedes vende imóveis
- CEA vende crédito
- John vende IA
- Cefeida vende analytics
- Etc.

**Resultado:** Oportunidades perdidas de venda integrada, duração maior de vendas, margens menores.

### Solução

Um **Service Composer Engine** que:
1. Entende necessidades do cliente
2. Encontra melhor kombinação de produtos
3. Monta proposta integrada
4. Coordena execução
5. Garante sucesso cliente

### Impacto

```
Antes (silos):         Depois (composição):
- Deal: R$ 100k        - Deal: R$ 500k
- Margin: 20%          - Margin: 45%
- Timeline: 90 dias    - Timeline: 45 dias
- Retenção: 60%        - Retenção: 85%
```

---

## 🏗️ Arquitetura

### Stack Técnico Recomendado

```
┌────────────────────────────────────────────┐
│  Frontend: React/Vue Dashboard             │
│  - Browse bundles                          │
│  - Configure custom composition            │
│  - Track execution                         │
└────────────┬───────────────────────────────┘
             │ REST + GraphQL
             ↓
┌────────────────────────────────────────────┐
│  API Layer: Express + GraphQL              │
├────────────────────────────────────────────┤
│  ├─ /composer/discover   (NLP intent)      │
│  ├─ /composer/suggest    (bundle suggestion)
│  ├─ /composer/build      (custom build)    │
│  ├─ /composer/price      (pricing)         │
│  ├─ /composer/execute    (start delivery)  │
│  └─ /composer/track      (monitor)         │
└────────────┬───────────────────────────────┘
             │
    ┌────────┼────────┬────────────┐
    ↓        ↓        ↓            ↓
┌─────────────────────────────────────┐
│  Core Engines                       │
├─────────────────────────────────────┤
│  ├─ Discovery (NLP + semantic)      │
│  ├─ Composition (constraint solver) │
│  ├─ Compatibility (integration)     │
│  ├─ Pricing (aggregation)           │
│  ├─ SLA (coordination)              │
│  ├─ Timeline (orchestration)        │
│  └─ Execution (project mgmt)        │
└────────────┬────────────────────────┘
             │
    ┌────────┼──────────────────┬──────────┐
    ↓        ↓                  ↓          ↓
┌──────┐ ┌────────┐ ┌──────────────┐ ┌──────────┐
│Postgres│ │Redis   │ │Elasticsearch│ │Product   │
│(meta)  │ │(cache) │ │(search)     │ │APIs      │
└──────┘ └────────┘ └──────────────┘ └──────────┘
```

---

## 🔄 Fluxos Principais

### Fluxo 1: Browse Pré-Configuradas

```
Cliente B2B entra
    ↓
Vê "Solutions" (bundles pré-montados)
    ├─ Condomínio Inteligente
    ├─ Retrofit Automático
    ├─ Fazenda Inteligente
    ├─ Obra Inteligente
    └─ Campus Smart
    ↓
Clica "Condomínio Inteligente"
    ↓
Vê composição: Archimedes + CEA + John + Hardware
    ↓
Customiza (orçamento, timeline)
    ↓
Recebe proposta integrada
    ↓
John acompanha negociação
    ↓
Deal closed
```

### Fluxo 2: Custom Composition

```
Cliente expressa necessidade customizada
    ├─ Via chat com John
    ├─ Via form
    └─ Via API
    ↓
Service Composer analisa necessidade
    ├─ Extrai entities (produto, budget, timeline)
    ├─ Busca em catalog
    ├─ Monta 3 opções (min, mid, max)
    └─ Calcula preço para cada
    ↓
Mostra opções
    ├─ Budget
    ├─ Timeline
    ├─ Features
    └─ Margin
    ↓
Cliente escolhe opção
    ↓
Proposta gerada (PDF + digital)
    ↓
John qualifica interesse
    ↓
Execução orquestrada
```

### Fluxo 3: Automatic Re-Composition (Pós-Venda)

```
Cliente já tem Archimedes (casa comprada)
    ↓
Sistema detecta oportunidade:
    ├─ Falta automação
    ├─ Poderia financiar reforma
    └─ Precisa de analytics
    ↓
Service Composer monta bundle:
    "Add-on Smart Home para sua casa"
    ├─ LICEU HARDWARE (sensores)
    ├─ John (controle)
    ├─ Cefeida (analytics)
    └─ Anchor (suporte)
    ↓
John oferece proativamente
    ↓
Upsell automático
```

---

## 🔧 Componentes Técnicos

### 1. Product Catalog

**Schema:**
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  
  // Categorização
  category: "SAAS" | "SERVICE" | "HARDWARE" | "CONSULTING" | "OPERATION";
  product_family: "ARCHIMEDES" | "CEA" | "JOHN" | "CEFEIDA" | "ANCHOR" | ...;
  
  // Pricing
  pricing_model: "FIXED" | "USAGE" | "SUBSCRIPTION" | "COMMISSION" | "HYBRID";
  base_price: number;
  currency: "BRL" | "USD";
  min_contract_value?: number;
  max_contract_value?: number;
  
  // SLA
  uptime_sla: number; // 0.999 = 99.9%
  support_level: "BASIC" | "STANDARD" | "PREMIUM" | "ENTERPRISE";
  response_time_hours: number;
  
  // Integrations
  integrates_with: string[]; // ['john', 'cefeida', 'observabilidade']
  requires_products: string[]; // se Product A requer Product B
  conflicts_with: string[]; // se Product A conflita com Product C
  api_endpoint: string;
  api_auth_type: "OAUTH2" | "API_KEY" | "JWT";
  
  // Timeline
  typical_implementation_weeks: number;
  typical_deployment_hours: number;
  can_go_live_in: number; // mínimo de horas
  
  // Metadata
  tags: string[];
  complexity_score: number; // 1-10
  requires_professional_services: boolean;
  typical_fte_requirement: number; // full-time equivalents
  
  // Versioning
  version: string;
  supported_from_date: Date;
  sunsetting_date?: Date;
}
```

### 2. Bundle Model

**Schema:**
```typescript
interface Bundle {
  id: string;
  name: string;
  description: string;
  
  // Composition
  products: BundleProduct[];
  integrations: BundleIntegration[];
  
  // Pricing
  total_price: number;
  bundle_discount_percent: number;
  margin_realized: number;
  
  // Timeline
  total_implementation_weeks: number;
  critical_path: string[]; // depêndências
  
  // SLA
  aggregated_uptime: number;
  aggregated_support: string;
  
  // Status
  status: "TEMPLATE" | "CUSTOM" | "ACTIVE";
  created_at: Date;
  created_by: string;
  
  // Metadata
  ideal_customer_segment: string;
  typical_use_case: string;
  success_rate: number; // histórico
}

interface BundleProduct {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  line_total: number;
  
  // Implementation details
  team_owner: string; // qual time entrega
  start_phase: number;
  end_phase: number;
  
  // Customizations
  customizations: Record<string, any>;
}

interface BundleIntegration {
  source_product: string;
  target_product: string;
  
  // Integration type
  integration_type: "API" | "WEBHOOK" | "DATA_SYNC" | "WORKFLOW";
  
  // Data flow
  data_direction: "ONE_WAY" | "BI_DIRECTIONAL";
  data_frequency: "REAL_TIME" | "HOURLY" | "DAILY" | "ON_DEMAND";
  
  // SLA impact
  increases_latency_ms: number;
  decreases_uptime_percent: number;
}
```

### 3. Discovery Engine (NLP)

**Responsibilidade:** Entender necessidade do cliente expressa em linguagem natural

```typescript
interface NaturalLanguageQuery {
  query: string;
  context: {
    customer_id?: string;
    segment?: string;
    budget_range?: [number, number];
    timeline_weeks?: number;
  };
}

interface DiscoveryResult {
  // Extracted entities
  primary_need: string;
  secondary_needs: string[];
  
  // Constraints
  budget_constraint?: number;
  timeline_constraint?: number;
  team_size_constraint?: number;
  
  // Confidence scores
  confidence: number; // 0-1
  ambiguities: string[];
  
  // Recommendations for clarification
  suggested_questions: string[];
}
```

**Exemplos:**
- Input: "Quero construir um condomínio inteligente"
  - Primary: "residential_construction"
  - Secondary: ["smart_automation", "analytics", "facilities"]
  
- Input: "Preciso digitalizar minha obra em tempo real"
  - Primary: "construction_monitoring"
  - Secondary: ["iot", "real_time_analytics", "reporting"]

### 4. Composition Algorithm

**Responsabilidade:** Encontrar melhor combinação de produtos

```typescript
interface CompositionRequest {
  discovered_needs: string[];
  constraints: {
    budget_max: number;
    timeline_max_weeks: number;
    team_size_available: number;
    must_have_products: string[];
    excluded_products: string[];
  };
  
  // Optimization objectives
  optimize_for: "MARGIN" | "TIMELINE" | "COMPLETENESS" | "CUSTOMER_FIT";
}

interface CompositionResult {
  // Suggestions (ranked)
  suggestions: [
    { rank: 1, products: [], total_price: number, timeline: number },
    { rank: 2, products: [], total_price: number, timeline: number },
    { rank: 3, products: [], total_price: number, timeline: number }
  ];
  
  // For each suggestion
  compatibility_score: number; // 0-1
  integration_complexity: number; // 1-10
  risk_factors: string[];
  success_probability: number; // histórico
}
```

**Algoritmo:**
```
1. Carregar constraint satisfaction problem (CSP)
2. Produts candidatos = {todos produtos}
3. Adicionar constraints:
   - Budget
   - Timeline
   - Compatibilidade
   - Não-conflitos
   - Dependências (A requer B)
4. Solver encontra soluções viáveis
5. Ranquear por:
   - Margin realizada
   - Timeline
   - Historico de sucesso
6. Top 3 opções
```

### 5. Pricing Engine

**Responsabilidade:** Calcular preço agregado + margens

```typescript
interface PricingRequest {
  bundle: Bundle;
  customer_segment: string; // ENTERPRISE, MID_MARKET, SMB
  quantity?: number;
  discount_codes?: string[];
}

interface PricingResult {
  line_items: Array<{
    product: string;
    quantity: number;
    unit_price: number;
    product_discount: number;
    line_total: number;
  }>;
  
  subtotal: number;
  bundle_discount: number;
  bundle_discount_percent: number;
  
  taxes: number;
  total_price: number;
  
  // Margin analysis
  total_cost_to_deliver: number;
  margin_realized: number;
  gross_margin_percent: number;
  
  // Payment terms
  payment_terms: string; // "NET_30", "UPFRONT", etc.
  
  // Validity
  valid_until: Date;
}
```

**Regras de Desconto:**
- Base: lista de preço por produto
- Bundle: -5% a -15% dependendo de composição
- Segment: Enterprise get -10%, SMB get 0%
- Volume: 3+ produtos = -7%
- Cross-sell: Já tem Archimedes? +10% desconto em add-ons
- Timing: Q4 = +5%, Q1 = -5%

### 6. Compatibility Engine

**Responsabilidade:** Validar que produtos integram bem

```typescript
interface CompatibilityCheck {
  bundle: Bundle;
}

interface CompatibilityResult {
  is_compatible: boolean;
  issues: Array<{
    severity: "ERROR" | "WARNING" | "INFO";
    product_a: string;
    product_b: string;
    issue: string;
    mitigation: string;
  }>;
  
  integration_testing_needed: boolean;
  estimated_integration_days: number;
}
```

**Verificações:**
- ✅ APIs comunicam entre si
- ✅ Dados em formato compatível
- ✅ Auth/permissões corretas
- ✅ Latência aceitável
- ✅ SLA pode ser garantido
- ✅ No conflito de infraestrutura

### 7. Execution Orchestrator

**Responsabilidade:** Coordenar entrega de múltiplos produtos

```typescript
interface ExecutionPlan {
  bundle_id: string;
  team_assignments: {
    archimedes?: Team;
    cefeida?: Team;
    john?: Team;
    hardware?: Team;
    // etc
  };
  
  phases: Phase[];
  dependencies: Dependency[];
  
  milestones: Milestone[];
  success_criteria: SuccessCriterion[];
}

interface Phase {
  phase_number: number;
  name: string;
  duration_weeks: number;
  products: string[];
  team_lead: string;
  
  deliverables: Deliverable[];
  success_metrics: Metric[];
}

interface Dependency {
  dependent_phase: number;
  depends_on_phase: number;
  type: "FINISH_TO_START" | "START_TO_START" | "FINISH_TO_FINISH";
}
```

---

## 📦 Catalog Management

### Manutenção do Catálogo

**Quem atualiza:**
- Cada product team atualiza seu produto
- Service Composer team coordena

**When:**
- Produto novo: add imediatamente
- Preço muda: sync via API daily
- SLA muda: governance board aprova
- Sunset: 6 meses de notice

**How:**
```
Product Team (Archimedes)
    ├─ Update: pricing, SLA, capabilities
    └─ Push via /api/catalog/products/{id}
         ↓
Service Composer Catalog
    ├─ Validate schema
    ├─ Check conflicts
    ├─ Update cache
    └─ Notify integrations
```

### Searchability

Produtos devem ser descobertos por:
- Keyword: "smart home" → LICEU HARDWARE
- Category: "SaaS" → John, Cefeida, GAME MKT
- Integration: "integrates with Archimedes" → →Anchor, John
- Use case: "faire a obra" → Archimedes + LICEU LABS
- Price range: "até 50k" → John, Cefeida

---

## 🎯 Bundle Composition (Deep Dive)

### Pre-Built Templates

**1. Condomínio Inteligente**
```
Archimedes + CEA + Anchor + John + Cefeida + LICEU HARDWARE + Observabilidade
Timeline: 12 meses
Price: R$ 2-5M
Margin: 45%
Success rate: 92%
```

**2. Retrofit Inteligente**
```
Archimedes (reforma) + LICEU HARDWARE + John + Cefeida
Timeline: 3 meses
Price: R$ 100-300k
Margin: 50%
Success rate: 88%
```

**3. Fazenda Inteligente**
```
Archimedes (infraestrutura) + P&D (sensores) + LICEU HARDWARE (IoT) + Cefeida (analytics)
Timeline: 6 meses
Price: R$ 500k-2M
Margin: 48%
Success rate: 85%
```

**4. Obra Inteligente**
```
LICEU LABS (sensores obra) + LICEU HARDWARE (IoT) + Cefeida (real-time diz) + John (comunicação)
Timeline: Implementação imediata
Price: R$ 50-200k/obra
Margin: 60%
Success rate: 90%
```

**5. Campus Smart**
```
Archimedes (construção) + Anchor (facilities) + John (concierge) + Cefeida (analytics) + LICEU HARDWARE (automação)
Timeline: 18 meses
Price: R$ 5-10M
Margin: 40%
Success rate: 80%
```

### Custom Composition

**Inputs:**
- Need description
- Budget
- Timeline
- Team size
- Region
- Compliance requirements

**Process:**
1. NLP parse → entities
2. Find matching products
3. Check compatibility
4. Solve constraints
5. Optimize for margin OR timeline OR completeness
6. Return top 3 options

---

## 💰 Pricing Engine (Advanced)

### Margin Calculation

```
Product A:        R$ 100k (cost R$ 50k) = 50% margin
Product B:        R$ 200k (cost R$ 120k) = 40% margin
Product C:        R$ 150k (cost R$ 105k) = 30% margin

Subtotal:         R$ 450k (cost R$ 275k) = 38.9% margin

Bundle discount:  -10% = R$ 45k discount
Bundle total:     R$ 405k (cost R$ 275k) = 32.1% margin

Bundle can absorb 10% discount while maintaining 32% margin
(vs. 18% se sold separately)
```

### Revenue Recognition

- Archimedes: Quando obra entregue
- CEA: Quando financiamento aprovado
- John: Monthly subscription (SaaS)
- Cefeida: Monthly subscription (SaaS)
- LICEU HARDWARE: Venda (hardware) + instalação

### Commission Structure

Para GAME MKT (orchestração):
- Sales: 5-10% do bundle
- Support coordination: 2% ongoing
- Upsell: 5-10%

---

## 🚀 Execution Orchestration

### Project Management

**Tools:**
- Asana / Monday (detailed tasks)
- JIRA (tech delivery)
- Sales Force (tracking, CRM)
- Confluence (documentation)

**Governance:**
- Weekly steering committee (product leads)
- Daily standup (delivery team)
- Go-live checklist (5 days before)

### Success Metrics

Por bundle:
- Delivery on time / on budget
- Customer satisfaction (NPS)
- Integration issues (zero is goal)
- Revenue realized vs. proposed

---

## 📚 Exemplos Reais

### Exemplo 1: Incorporadora Solicitando Smart Residential

**Query:** "Quero incorporadora que faz condomínios inteligentes"

**Discovery Result:**
```
Primary need: residential_construction
Secondary: smart_building, resident_engagement, facility_ops
Budget: 5-10 MILHÕES
Timeline: 12 meses
Success metrics: sold_out, high_satisfaction, operational_efficiency
```

**Composition:**
```_json
{
  "rank": 1,
  "products": [
    { "name": "Archimedes", "component": "projeto + construção", "price": 2000000, "weeks": 52 },
    { "name": "CEA", "component": "financing", "price": "comissão", "weeks": 0 },
    { "name": "John", "component": "concierge_24_7", "price": 300000, "weeks": 2 },
    { "name": "Cefeida", "component": "dashboard", "price": 150000, "weeks": 4 },
    { "name": "LICEU HARDWARE", "component": "smart_building", "price": 400000, "weeks": 8 },
    { "name": "Anchor", "component": "facilities_5yr", "price": 500000, "weeks": 2 },
    { "name": "Observabilidade", "component": "monitoring", "price": 100000, "weeks": 4 }
  ],
  "total_price": 3450000,
  "margin_realized": 0.45,
  "timeline": 52,
  "integration_complexity": 7
}
```

**Proposta Gerada:**
- Preço: R$ 3.45M
- Margem: 45%
- Timeline: 52 semanas
- Entrega: Condomínio inteligente completo

**Resultado:**
- Deal closed: +80% probabilidade
- Retenção: 5+ anos (monthly fees)
- Upsell: expansão para 5 condomínios next

### Exemplo 2: Construtora com Obra em Andamento

**Action:** Construtora já usa Archimedes (obra)

**Service Composer Detection:**
"We have construction. Missing: real-time monitoring, team safety comm, material tracking"

**Auto-Suggestion:**
"Add bundle: Obra Inteligente"
```
- LICEU LABS (sensores obra): R$ 50k
- LICEU HARDWARE (IoT): R$ 100k
- John (comunicação): R$ 30k
- Cefeida (analytics): R$ 20k

TOTAL: R$ 200k
Margem: 55%
Timeline: 2 semanas
```

**Offer:** John proactive reach out
"Sua obra em fase X. Sugerimos Obra Inteligente para segurança equipe. R$ 200k."

**Resultado:**
- Upsell automatizado
- Margem alta (55%)
- Implementação rápida (2 weeks)
- Retenção obra: segurança, eficiência

---

## 🛣️ Roadmap

### V1 (Beta, Oct 2026)
- [ ] 5 pre-built bundles
- [ ] Basic pricing engine
- [ ] Simple compatibility check
- [ ] Manual execution coordination

### V2 (Full, Nov 2026)
- [ ] 15+ pre-built bundles
- [ ] Advanced NLP discovery
- [ ] Constraint solver composition
- [ ] Automated execution orchestration
- [ ] Real-time pricing

### V3 (Intelligence, 2027)
- [ ] ML recommendation (based on customer success)
- [ ] Dynamic bundle generation
- [ ] Predictive failures (early alarm)
- [ ] Self-healing (automatic re-composition)

---

**Status:** Blueprint completo para Sprint 4-5 (FASE 1.5)  
**Impacto:** Revenue +300%, Margin +25%, Customer lifetime value +200%

