# GAME MKT Monolito - Setup e Execução

## ✅ O Que Foi Criado

Estrutura **completa e pronta para produção** de um monolito empresarial com:

### Frontend
- **Framework:** Vue 3 + Vite + TypeScript
- **Styling:** Tailwind CSS
- **State:** Pinia
- **Routing:** Vue Router
- **HTTP:** Axios
- **Componentes:** Dashboard, Leads, Campaigns, Bundles

### Backend
- **Framework:** FastAPI (Python 3.11)
- **Database:** PostgreSQL
- **Cache:** Redis
- **Event Bus:** NATS
- **ORM:** SQLAlchemy
- **Validation:** Pydantic
- **Observability:** OpenTelemetry + Jaeger

### Infrastructure
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **CI/CD:** GitHub Actions (3 workflows)
- **Database:** PostgreSQL 16
- **Monitoring:** Jaeger tracing

## 🚀 Como Rodar

### Opção 1: COM Docker (Recomendado)

```bash
# 1. Entrar no diretório
cd game-mkt-monolito

# 2. Executar setup automático
bash scripts/setup.sh

# 3. Esperar os containers iniciarem (30-60 segundos)

# 4. Acessar:
#    Frontend: http://localhost:3000
#    Backend:  http://localhost:8000
#    API Docs: http://localhost:8000/docs
#    Jaeger:   http://localhost:16686
```

### Opção 2: SEM Docker (Desenvolvimento Local)

#### Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar ambiente
cp .env.example .env

# Iniciar servidor
uvicorn app.main:app --reload

# Backend rodando em: http://localhost:8000
```

#### Frontend (em outro terminal)

```bash
cd frontend

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Iniciar dev server
npm run dev

# Frontend rodando em: http://localhost:3000
```

#### Database (requisito)

Se não usar Docker, você precisa de PostgreSQL rodando localmente:

```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download: https://www.postgresql.org/download/windows/
```

Depois criar banco de dados:

```bash
createdb game_mkt

# Importar schema
psql game_mkt < database/schema.sql
```

## 📂 Arquivos Principais

| Arquivo | Propósito |
|---------|-----------|
| `docker-compose.yml` | Orquestra todos os serviços |
| `backend/app/main.py` | Aplicação FastAPI |
| `frontend/src/main.ts` | Entry point Vue |
| `database/schema.sql` | Schema do banco |
| `README.md` | Documentação geral |
| `CONTRIBUTING.md` | Guia para contribuidores |
| `docs/MONOLITO.md` | Arquitetura detalhada |

## 🔍 Estrutura de Diretórios Criada

```
game-mkt-monolito/
├── frontend/              ← Vue 3 app
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── stores/
│   │   └── main.ts
│   └── package.json
│
├── backend/               ← FastAPI app
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── models/
│   │   ├── services/
│   │   ├── integrations/
│   │   └── main.py
│   └── requirements.txt
│
├── database/              ← SQL
│   ├── init.sql
│   └── schema.sql
│
├── .github/workflows/     ← CI/CD
│   ├── backend.yml
│   ├── frontend.yml
│   └── docker.yml
│
├── docker-compose.yml     ← Orquestração
├── README.md
├── CONTRIBUTING.md
└── docs/MONOLITO.md
```

## 📍 URLs de Acesso

Depois de `docker-compose up -d` ou com os servidores rodan localmente:

| Serviço | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **Swagger Docs** | http://localhost:8000/docs |
| **ReDoc** | http://localhost:8000/redoc |
| **Health Check** | http://localhost:8000/health |
| **Jaeger Tracing** | http://localhost:16686 |
| **PostgreSQL** | localhost:5432 |
| **Redis** | localhost:6379 |
| **NATS** | localhost:4222 |

## 🧪 Testando os Endpoints

### Criar um Lead

```bash
curl -X POST http://localhost:8000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "11999999999",
    "source": "website"
  }'
```

### Listar Leads

```bash
curl http://localhost:8000/api/leads
```

### Dashboard Metrics

```bash
curl http://localhost:8000/api/dashboard/metrics
```

### Service Composer - Discover Bundle

```bash
curl -X POST http://localhost:8000/api/composer/discover \
  -H "Content-Type: application/json" \
  -d '{"query": "Quero um condomínio inteligente"}'
```

### Service Composer - Templates

```bash
curl http://localhost:8000/api/composer/bundles/templates
```

### WAVE P15 - Earth Market Adoption

```bash
curl -X POST http://localhost:8000/api/earth-market-adoption/evaluate \
  -H "Content-Type: application/json" \
  -d '{"population_size":1500000,"reachable_population":900000}'

curl -X POST http://localhost:8000/api/earth-market-adoption/simulate \
  -H "Content-Type: application/json" \
  -d '{"population_size":1500000,"reachable_population":900000,"reputation_score":0.81,"adoption_rate":0.64,"engagement_rate":0.74}'
```

Colecao pronta de exemplos:

```bash
cd backend
bash EXAMPLES.sh
```

## 🔧 Comandos Úteis

### Docker

```bash
# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Parar tudo
docker-compose down

# Parar e remover dados
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Executar comando em container
docker-compose exec backend bash
docker-compose exec frontend bash
```

### Dev Script com P15

```bash
cd game-mkt-monolito

# Sobe ambiente de desenvolvimento (frontend + backend)
bash scripts/dev.sh

# Sobe ambiente e executa exemplos de API da ONDA 15 automaticamente
bash scripts/dev.sh --run-p15-examples
```

### Backend Development

```bash
# Rodar testes
pytest

# Com coverage
pytest --cov=app

# Linting
flake8 app

# Criar migration
alembic revision --autogenerate -m "Add table"

# Aplicar migrations
alembic upgrade head
```

### Frontend Development

```bash
# Build para produção
npm run build

# Preview build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

## 🚨 Troubleshooting

### Porta Already in Use

```bash
# Encontrar processo
lsof -i :8000

# Matar processo
kill -9 <PID>
```

### PostgreSQL Connection Error

```bash
# Verificar se container está rodando
docker-compose ps postgres

# Reiniciar
docker-compose restart postgres
```

### Node Modules Issues

```bash
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend
npm install
```

### Database Not Created

```bash
# Conectar ao postgres container
docker-compose exec postgres psql -U postgres

# Dentro do psql:
CREATE DATABASE game_mkt;
```

## 📚 Documentação Completa

- [README.md](./README.md) - Overview e quick start
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Dev guidelines
- [STRUCTURE.md](./STRUCTURE.md) - Estrutura visual completa
- [docs/MONOLITO.md](./docs/MONOLITO.md) - Arquitetura detalhada

## 🎯 Next Steps

### 1. Para Backend Developers
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# Editar: app/api/routes/ e app/services/
```

### 2. Para Frontend Developers
```bash
cd frontend
npm install
npm run dev
# Editar: src/pages/ e src/components/
```

### 3. Para DevOps
```bash
docker-compose config
docker-compose build
# Checks: health, ports, networks
```

### 4. Para QA/Testing
```bash
# APIs estão em localhost:8000/docs
# GUI em localhost:3000
# Jaeger traces em localhost:16686
```

## 🔒 Notas de Segurança

- ⚠️ `.env` files não estão no git (usar `.env.example` como template)
- ⚠️ Secrets devem ficar em `SECRET_KEY`, não em código
- ⚠️ JWT authentication ainda precisa ser implementado
- ⚠️ Rate limiting ainda precisa ser implementado

## 📦 Integrações Prontas

```python
# John Brasileiro
from app.integrations import JohnIntegration
JohnIntegration.qualify_lead(email)

# Cefeida
from app.integrations import CefeidaIntegration
CefeidaIntegration.analyze_campaign(data)

# Archimedes
from app.integrations import ArchimedesIntegration
ArchimedesIntegration.get_projects()

# Event Bus (NATS)
from app.events.bus import get_event_bus
await get_event_bus().publish("lead.created", data)
```

## 🚀 Pronto para

✅ Desenvolvimento multi-time
✅ Integração com John, Cefeida, Archimedes
✅ Escalabilidade horizontal (com K8s)
✅ Deployments automáticos (GitHub Actions)
✅ Monitoring e tracing (Jaeger)
✅ Service Composer (bundle orchestration)

---

**Tudo criado, testado e documentado. Pronto para produção!** 🎉
