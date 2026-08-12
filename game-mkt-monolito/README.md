# GAME MKT - Enterprise Monolito

Monolito enterprise pronto para produção, com integração total ao ecossistema LICEU 6.0.

## 🏗️ Arquitetura

```
GAME MKT Monolito
├── Frontend (Vue 3 + Vite)
├── Backend (FastAPI + Python)
├── Database (PostgreSQL)
├── Cache (Redis)
├── Event Bus (NATS)
├── Observability (Jaeger + OpenTelemetry)
└── Docker Compose (orquestração)
```

## 📦 Stack Completo

### Frontend
- **Vue 3** - Framework UI reativo
- **Vite** - Build tool ultrarrápido
- **TypeScript** - Type safety
- **Pinia** - State management
- **Tailwind CSS** - Styling
- **Router** - SPA routing

### Backend
- **FastAPI** - Framework web assíncrono
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e cache de sessão
- **SQLAlchemy** - ORM
- **Pydantic** - Validação de dados
- **NATS** - Event bus distribuído
- **OpenTelemetry** - Observabilidade
- **Jaeger** - Distributed tracing

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+

### 1. Clone e configure

```bash
cd game-mkt-monolito
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Inicie os serviços

```bash
docker-compose up -d
```

Serviços disponíveis:
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **Docs**: http://localhost:8000/docs
- **Jaeger Tracing**: http://localhost:16686

### 3. Acesse a aplicação

```
Dashboard: http://localhost:3000
Swagger UI: http://localhost:8000/docs
Redoc: http://localhost:8000/redoc
```

## 📂 Estrutura

### Backend

```
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── leads.py
│   │       ├── dashboard.py
│   │       └── composer.py
│   ├── core/
│   │   ├── config.py
│   │   └── exceptions.py
│   ├── db/
│   │   └── session.py
│   ├── models/
│   │   └── __init__.py (Lead, Campaign, Product, Bundle)
│   ├── schemas/
│   │   └── __init__.py (Pydantic schemas)
│   ├── repositories/
│   │   └── __init__.py (Data access layer)
│   ├── services/
│   │   └── __init__.py (Business logic)
│   ├── integrations/
│   │   └── __init__.py (John, Cefeida, Archimedes)
│   ├── events/
│   │   └── bus.py (NATS event bus)
│   ├── observability/
│   │   ├── logger.py
│   │   └── tracing.py
│   └── main.py
├── requirements.txt
├── Dockerfile
└── .env.example
```

### Frontend

```
frontend/
├── src/
│   ├── app/
│   │   └── App.vue
│   ├── pages/
│   │   ├── DashboardPage.vue
│   │   ├── LeadsPage.vue
│   │   ├── CampaignsPage.vue
│   │   └── BundlesPage.vue
│   ├── components/
│   │   └── (componentes reutilizáveis)
│   ├── stores/
│   │   └── game-mkt.store.ts
│   ├── services/
│   │   ├── http.ts
│   │   └── api.ts
│   ├── router/
│   │   └── index.ts
│   ├── styles/
│   │   └── main.css
│   └── main.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── Dockerfile
```

## 🔧 Desenvolvimento

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload

# Run tests
pytest

# Run linting
flake8 app
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## 📡 API Endpoints

### Leads
- `POST /api/leads` - Create lead
- `GET /api/leads` - List leads
- `GET /api/leads/{id}` - Get lead
- `PATCH /api/leads/{id}` - Update lead
- `DELETE /api/leads/{id}` - Delete lead
- `POST /api/leads/{id}/qualify` - Qualify lead

### Dashboard
- `GET /api/dashboard/metrics` - Get metrics
- `GET /api/dashboard/realtime` - Get realtime data

### Service Composer
- `POST /api/composer/discover` - NLP intent discovery
- `POST /api/composer/suggest` - Suggest bundles
- `GET /api/composer/bundles/templates` - Pre-built templates
- `POST /api/composer/price` - Calculate pricing
- `POST /api/composer/compatibility/check` - Check compatibility
- `POST /api/composer/execute` - Execute bundle
- `GET /api/composer/executions/{id}` - Track execution

### Campaign Contracts
- `POST /api/campaign-contracts/draft` - Criar minuta de contrato da campanha
- `POST /api/campaign-contracts/validate` - Validar clausulas obrigatorias
- `POST /api/campaign-contracts/sign` - Assinar contrato (ou marcar board approval)

### Growth Runtime
- `POST /api/growth-runtime/plan` - Priorizar experimentos com ICE
- `POST /api/growth-runtime/cycle/evaluate` - Decidir scale/iterate/stop
- `POST /api/growth-runtime/forecast` - Projecao de metrica por semanas

### Predictive Lead AI
- `POST /api/predictive-lead-ai/score` - Scoring preditivo individual
- `POST /api/predictive-lead-ai/rank` - Ranking de lista de leads
- `POST /api/predictive-lead-ai/conversion-window` - Janela prevista de conversao

### Interplanetary Experience
- `POST /api/interplanetary/experience/create` - Criar experiencia imersiva
- `POST /api/interplanetary/experience/simulate` - Simular conversao e imersao
- `POST /api/interplanetary/experience/purchase` - Fechar venda holografica
- `GET /api/interplanetary/experience/catalog` - Listar catalogo-base
- `GET /api/interplanetary/experience/telemetry` - Snapshot de auditoria e receita

### Earth Market Adoption Runtime (WAVE P15)
- `POST /api/earth-market-adoption/evaluate` - Avaliar adocao, resposta populacional, impacto de campanha, demanda, comportamento e engajamento
- `POST /api/earth-market-adoption/simulate` - Consolidar readiness de adocao com contexto macro de mercado

## 🧩 Exemplos dos Novos Endpoints

### 1) Campaign Contracts

Teste rapido com curl:

```bash
curl -X POST "http://localhost:8000/api/campaign-contracts/draft" \
	-H "Content-Type: application/json" \
	-d '{
		"campaign_id": "camp-2026-001",
		"name": "Contrato Campanha Condominio Inteligente",
		"budget": 250000,
		"duration_days": 90,
		"channels": ["ads", "email", "whatsapp"],
		"objectives": ["mql", "sql"],
		"north_star_metric": "pipeline_qualificado",
		"brand_policy": "manual_padrao_v1"
	}'
```

Request (`POST /api/campaign-contracts/draft`):

```json
{
	"campaign_id": "camp-2026-001",
	"name": "Contrato Campanha Condominio Inteligente",
	"budget": 250000,
	"duration_days": 90,
	"channels": ["ads", "email", "whatsapp"],
	"objectives": ["mql", "sql"],
	"north_star_metric": "pipeline_qualificado",
	"brand_policy": "manual_padrao_v1"
}
```

Response (resumo):

```json
{
	"contract_id": "...",
	"tier": "scale",
	"status": "draft",
	"clauses": [
		{"name": "escopo", "value": "..."},
		{"name": "sla_operacao", "value": "..."}
	]
}
```

### 2) Growth Runtime

Teste rapido com curl:

```bash
curl -X POST "http://localhost:8000/api/growth-runtime/plan" \
	-H "Content-Type: application/json" \
	-d '{
		"north_star_metric": "pipeline_qualificado",
		"baseline": 120,
		"target": 240,
		"horizon_days": 90,
		"budget": 100000,
		"experiments": [
			{"name": "Lookalike", "channel": "ads", "impact": 8, "confidence": 0.7, "effort": 2},
			{"name": "SEO cluster", "channel": "seo", "impact": 6, "confidence": 0.8, "effort": 3}
		]
	}'
```

Request (`POST /api/growth-runtime/plan`):

```json

	### 4) Earth Market Adoption Runtime (WAVE P15)

	Teste rapido com curl:

	```bash
	curl -X POST "http://localhost:8000/api/earth-market-adoption/evaluate" \
		-H "Content-Type: application/json" \
		-d '{
			"population_size": 1500000,
			"reachable_population": 900000,
			"awareness_rate": 0.62,
			"trial_rate": 0.49,
			"repeat_rate": 0.57,
			"organic_growth": 0.45,
			"trust_index": 0.64,
			"utility_score": 0.70,
			"price_accessibility": 0.58,
			"social_proof": 0.52,
			"campaign_reach": 0.66,
			"campaign_quality": 0.60,
			"campaign_frequency": 5,
			"base_demand": 0.61,
			"seasonality": 0.54,
			"supply_friction": 0.26,
			"basket_growth": 0.46,
			"churn_rate": 0.29,
			"stakeholder_alignment": 0.63,
			"partner_activation": 0.55,
			"regulator_support": 0.48,
			"community_advocacy": 0.60
		}'
	```

	Simulacao consolidada:

	```bash
	curl -X POST "http://localhost:8000/api/earth-market-adoption/simulate" \
		-H "Content-Type: application/json" \
		-d '{
			"population_size": 1500000,
			"reachable_population": 900000,
			"awareness_rate": 0.62,
			"trial_rate": 0.49,
			"repeat_rate": 0.57,
			"reputation_score": 0.81,
			"adoption_rate": 0.64,
			"engagement_rate": 0.74
		}'
	```
{
	"north_star_metric": "pipeline_qualificado",
	"baseline": 120,
	"target": 240,
	"horizon_days": 90,
	"budget": 100000,
	"experiments": [
		{"name": "Lookalike", "channel": "ads", "impact": 8, "confidence": 0.7, "effort": 2},
		{"name": "SEO cluster", "channel": "seo", "impact": 6, "confidence": 0.8, "effort": 3}
	]
}
```

Response (resumo):

```json
{
	"north_star_metric": "pipeline_qualificado",
	"delta": 120,
	"experiments": [
		{"name": "Lookalike", "ice_score": 2.8, "recommended_budget": 63636.36},
		{"name": "SEO cluster", "ice_score": 1.6, "recommended_budget": 36363.64}
	]
}
```

### 3) Predictive Lead AI

Teste rapido com curl:

```bash
curl -X POST "http://localhost:8000/api/predictive-lead-ai/score" \
	-H "Content-Type: application/json" \
	-d '{
		"lead_id": "lead-001",
		"fit_score": 0.9,
		"intent_score": 0.8,
		"engagement_score": 0.7,
		"recency_score": 0.9
	}'
```

Colecao executavel de exemplos (inclui P15):

```bash
cd backend
bash EXAMPLES.sh
```

Request (`POST /api/predictive-lead-ai/score`):

```json
{
	"lead_id": "lead-001",
	"fit_score": 0.9,
	"intent_score": 0.8,
	"engagement_score": 0.7,
	"recency_score": 0.9
}
```

Response (resumo):

```json
{
	"lead_id": "lead-001",
	"propensity": 0.835,
	"score": 84,
	"band": "hot",
	"recommended_action": "encaminhar_para_vendas_imediatamente"
}
```

## 🔄 Fluxo ponta a ponta (curl)

Objetivo: criar contrato, validar clausulas, assinar, gerar plano de growth, pontuar lead e ranquear lote.

Passo 0 - Variavel base:

```bash
export BASE_URL="http://localhost:8000"
```

Passo 1 - Criar minuta de contrato:

```bash
curl -s -X POST "$BASE_URL/api/campaign-contracts/draft" \
	-H "Content-Type: application/json" \
	-d '{
		"campaign_id": "camp-2026-001",
		"name": "Contrato Campanha Condominio Inteligente",
		"budget": 250000,
		"duration_days": 90,
		"channels": ["ads", "email", "whatsapp"],
		"objectives": ["mql", "sql"],
		"north_star_metric": "pipeline_qualificado",
		"brand_policy": "manual_padrao_v1"
	}'
```

Copie o valor de contract_id retornado na resposta e use no passo 3.

Passo 2 - Validar clausulas obrigatorias:

```bash
curl -s -X POST "$BASE_URL/api/campaign-contracts/validate" \
	-H "Content-Type: application/json" \
	-d '{
		"clauses": [
			{"name": "escopo", "value": "Ativar canais"},
			{"name": "sla_operacao", "value": "Resposta em ate 8h"},
			{"name": "metrica_sucesso", "value": "pipeline_qualificado"},
			{"name": "compliance_marca", "value": "manual_padrao_v1"},
			{"name": "politica_orcamento", "value": "Cap mensal BRL 83333"}
		]
	}'
```

Passo 3 - Assinar contrato:

```bash
curl -s -X POST "$BASE_URL/api/campaign-contracts/sign" \
	-H "Content-Type: application/json" \
	-d '{
		"contract_id": "SUBSTITUIR_PELO_CONTRACT_ID",
		"budget": 250000,
		"delegated_limit": 300000
	}'
```

Passo 4 - Gerar plano de growth:

```bash
curl -s -X POST "$BASE_URL/api/growth-runtime/plan" \
	-H "Content-Type: application/json" \
	-d '{
		"north_star_metric": "pipeline_qualificado",
		"baseline": 120,
		"target": 240,
		"horizon_days": 90,
		"budget": 100000,
		"experiments": [
			{"name": "Lookalike", "channel": "ads", "impact": 8, "confidence": 0.7, "effort": 2},
			{"name": "SEO cluster", "channel": "seo", "impact": 6, "confidence": 0.8, "effort": 3}
		]
	}'
```

Passo 5 - Pontuar lead individual:

```bash
curl -s -X POST "$BASE_URL/api/predictive-lead-ai/score" \
	-H "Content-Type: application/json" \
	-d '{
		"lead_id": "lead-001",
		"fit_score": 0.9,
		"intent_score": 0.8,
		"engagement_score": 0.7,
		"recency_score": 0.9
	}'
```

Passo 6 - Ranquear lote de leads:

```bash
curl -s -X POST "$BASE_URL/api/predictive-lead-ai/rank" \
	-H "Content-Type: application/json" \
	-d '{
		"leads": [
			{"lead_id": "lead-001", "fit_score": 0.9, "intent_score": 0.8, "engagement_score": 0.7, "recency_score": 0.9},
			{"lead_id": "lead-002", "fit_score": 0.6, "intent_score": 0.5, "engagement_score": 0.6, "recency_score": 0.4},
			{"lead_id": "lead-003", "fit_score": 0.3, "intent_score": 0.2, "engagement_score": 0.4, "recency_score": 0.3}
		]
	}'
```

Passo 7 - Prever janela de conversao:

```bash
curl -s -X POST "$BASE_URL/api/predictive-lead-ai/conversion-window" \
	-H "Content-Type: application/json" \
	-d '{
		"lead_id": "lead-001",
		"propensity": 0.83,
		"velocity": 0.75,
		"friction": 0.2
	}'
```

Executar tudo automaticamente via script:

```bash
cd game-mkt-monolito
bash scripts/run_growth_contracts_flow.sh
```

Para usar outra URL de API:

```bash
cd game-mkt-monolito
BASE_URL="http://localhost:8001" bash scripts/run_growth_contracts_flow.sh
```

## 🔌 Integrações

### John Brasileiro
- Qualificação de leads
- Concierge IA 24/7
- Negociação automática

### Cefeida
- Analytics e BI
- Forecasting
- Market intelligence

### Archimedes
- Catálogo de imóveis
- Integração de projetos
- Orçamentos

### Observabilidade
- Logs: stdout + JSON estruturado
- Tracing: Jaeger (localhost:16686)
- Métricas: Prometheus (exposed on backend)

## 📊 Banco de Dados

### Tabelas
- `leads` - Contatos qualificados
- `campaigns` - Campanhas de marketing
- `products` - Catálogo de produtos/serviços
- `bundles` - Service Composer bundles

### Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head
```

## 🐳 Docker

### Build images

```bash
# Backend
docker build -t game-mkt-backend:latest ./backend

# Frontend
docker build -t game-mkt-frontend:latest ./frontend
```

### Compose

```bash
# Up
docker-compose up -d

# Down
docker-compose down

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🧪 Testing

### Backend

```bash
# Run all backend tests
cd backend
pytest tests -q

# With coverage
pytest tests --cov=app --cov-report=term-missing

# Composer route logic
pytest tests/test_composer_routes_logic.py -q

# Execution status transitions
pytest tests/test_execution_status_transitions.py -q

# Growth, predictive and contract routes
pytest tests/test_growth_predictive_contracts_routes.py -q

# Earth market adoption routes
pytest tests/test_earth_market_adoption_routes.py -q

# Revenue runtime routes
pytest tests/test_revenue_runtime_routes.py -q
```

### Frontend

```bash
# Not yet implemented (add vitest)
```

Observacao:
- Os testes de backend ficam em `backend/tests`.
- Ignore arquivos em `backend/tests/__pycache__` (artefatos locais do Python).

## 📋 CI/CD

### GitHub Actions

Workflows automáticos:
- **backend.yml** - Tests, build, lint
- **frontend.yml** - Build, type check, lint
- **docker.yml** - Build and push Docker images

## 🔐 Segurança

- JWT authentication (implementar)
- CORS configurado
- Validação Pydantic
- SQL injection prevention (via SQLAlchemy)
- HTTPS ready

## 📈 Monitoramento

### Health operacional

Endpoint:

```text
GET /health
```

Exemplo de resposta:

```json
{
	"status": "healthy",
	"app": "GAME MKT",
	"version": "2.0.0",
	"interplanetary_subscribers": {
		"enabled": true,
		"reason": "running",
		"subjects": [
			"game.interplanetary.experience.started",
			"game.interplanetary.experience.completed",
			"game.holographic.sale.closed"
		]
	}
}
```

Observacao:
- `enabled=false` com `reason=event_bus_unavailable` indica API operante sem NATS disponivel.

Teste rapido com curl:

```bash
curl -s http://localhost:8000/health | cat
curl -s http://localhost:8000/api/interplanetary/experience/telemetry | cat
```

### Jaeger Tracing
```
http://localhost:16686
```

### Prometheus Metrics
```
http://localhost:8000/metrics
```

### Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🚢 Deployment

### Kubernetes (ready)
```bash
kubectl apply -f infrastructure/k8s/
```

### Docker Swarm
```bash
docker stack deploy -c docker-compose.yml game-mkt
```

## 📚 Documentação

- [API Docs](http://localhost:8000/docs)
- [API Schema](http://localhost:8000/redoc)
- [ENTERPRISE-ARCHITECTURE.md](../ENTERPRISE-ARCHITECTURE.md)
- [SERVICE-COMPOSER-ENGINE.md](../SERVICE-COMPOSER-ENGINE.md)

## 🤝 Contribuindo

1. Create feature branch: `git checkout -b feature/nova-feature`
2. Commit: `git commit -m 'Add nova-feature'`
3. Push: `git push origin feature/nova-feature`
4. Open Pull Request

## 📝 Changelog

### v2.0.2 (2026-05-10)
- Inclusao dos endpoints de Interplanetary Experience na secao de API
- Documentacao do contrato operacional de `GET /health`
- Exemplo de payload com estado dos subscribers interplanetarios

### v2.0.1 (2026-05-10)
- README atualizado com comandos reais da suite de testes backend
- Caminhos de testes ajustados para `backend/tests`
- Inclusao de comandos de validacao por dominio (composer, growth, revenue)

### v2.0.0 (2026-05-08)
- Monolito enterprise inicial
- Frontend Vue 3 + Vite
- Backend FastAPI + PostgreSQL
- Service Composer preliminary support
- Docker Compose orquestração
- GitHub Actions CI/CD

## 📞 Support

- Issues: GitHub Issues
- Email: dev@game-mkt.local
- Slack: #game-mkt-monolito

## 📄 License

Proprietary - LICEU 6.0
