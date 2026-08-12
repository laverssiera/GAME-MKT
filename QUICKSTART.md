# GAME MKT - Guia de Início Rápido

**Bem-vindo ao GAME MKT Intelligence Engine!** 🚀

Este é um sistema completo de inteligência de marketing gamificado para o ecossistema imobiliário LICEU 6.0.

## 📋 O Que Você Tem Aqui

✅ **Frontend Vue 3** - SaaS com 7 componentes prontos  
✅ **Backend Node.js** - Intelligence Engine com 7 serviços  
✅ **10 EPICs** - Funcionalidades completas de marketing  
✅ **APIs RESTful** - 18+ endpoints de inteligência  
✅ **Documentação Completa** - Guias, exemplos, roadmap  

## 🚀 Quick Start (5 min)

### 1️⃣ Frontend

```bash
# Instalar
npm install

# Rodar desenvolvimento
npm run dev

# Acesso: http://localhost:5173
```

### 2️⃣ Backend

```bash
# Instalar
cd backend
npm install

# Rodar desenvolvimento
npm run dev

# Acesso: http://localhost:3001
```

### 3️⃣ Testar APIs

```bash
# Health check
curl http://localhost:3001/health

# Calcular KPIs
curl "http://localhost:3001/api/kpis/multi"

# Gerar mensagem John
curl -X POST http://localhost:3001/api/john/gerar-mensagem \
  -H "Content-Type: application/json" \
  -d '{"tipo":"conversao","valor":12,"tendencia":"subindo"}'
```

Veja `backend/EXAMPLES.sh` para exemplos completos.

### 4️⃣ ONDA 14 - Simulação Social

```bash
# Runtime de engajamento
/home/codespace/.python/current/bin/python runtime/civilization_engagement_runtime.py

# Runtime de comportamento
/home/codespace/.python/current/bin/python runtime/civilization_behavior_runtime.py

# Runtime de crescimento
/home/codespace/.python/current/bin/python runtime/civilization_growth_runtime.py

# Execução consolidada dos 3 runtimes
/home/codespace/.python/current/bin/python runtime/run_civilization_social_simulation.py

# Atalho via Makefile
make onda14

# Atalho via Makefile com parâmetros
make onda14 ARGS="--active-users 2100 --engagement-rate 0.79 --weeks 20"
```

Exemplo com parâmetros:

```bash
/home/codespace/.python/current/bin/python runtime/civilization_engagement_runtime.py \
  --active-users 1800 \
  --engagement-rate 0.74

/home/codespace/.python/current/bin/python runtime/civilization_behavior_runtime.py \
  --lead-id lead-social-999 \
  --profile-fit 0.9 \
  --intent-level 0.81 \
  --behavioral-score 0.88

/home/codespace/.python/current/bin/python runtime/civilization_growth_runtime.py \
  --baseline 400 \
  --target 680 \
  --budget 80000 \
  --expected-delta 180 \
  --observed-delta 150 \
  --weeks 16

# Atalho via Makefile para ONDA 15
make onda15

# Atalho via Makefile com parâmetros
make onda15 ARGS="--awareness-rate 0.74 --trial-rate 0.58 --repeat-rate 0.63 --reputation-score 0.86"
```

### 5️⃣ ONDA 15 - Adoção de Mercado Planetário

```bash
# Runtime de adoção e comportamento de mercado (P15)
/home/codespace/.python/current/bin/python runtime/earth_market_adoption_runtime.py

# Simulação consolidada (adoção + contexto de mercado)
/home/codespace/.python/current/bin/python runtime/run_earth_market_adoption_simulation.py

# Exemplo com parâmetros
/home/codespace/.python/current/bin/python runtime/earth_market_adoption_runtime.py \
  --population-size 2200000 \
  --reachable-population 1400000 \
  --awareness-rate 0.74 \
  --trial-rate 0.58 \
  --repeat-rate 0.63 \
  --campaign-reach 0.78 \
  --campaign-quality 0.72 \
  --base-demand 0.69 \
  --stakeholder-alignment 0.71

/home/codespace/.python/current/bin/python runtime/run_earth_market_adoption_simulation.py \
  --awareness-rate 0.74 \
  --trial-rate 0.58 \
  --repeat-rate 0.63 \
  --reputation-score 0.86 \
  --adoption-rate 0.7 \
  --engagement-rate 0.79
```

### 6️⃣ ONDA 31 - Simulação Earth (aliases)

Executar os quatro runtimes em sequência:

```bash
/workspaces/GAME-MKT/.venv-1/bin/python runtime/earth_market_simulation_runtime.py
/workspaces/GAME-MKT/.venv-1/bin/python runtime/earth_behavior_runtime.py
/workspaces/GAME-MKT/.venv-1/bin/python runtime/earth_demand_runtime.py
/workspaces/GAME-MKT/.venv-1/bin/python runtime/earth_marketplace_runtime.py
```

Execução em lote com saída salva para conferência:

```bash
cd /workspaces/GAME-MKT
/workspaces/GAME-MKT/.venv-1/bin/python runtime/earth_market_simulation_runtime.py > /tmp/wave31_market_simulation.json
/workspaces/GAME-MKT/.venv-1/bin/python runtime/earth_behavior_runtime.py > /tmp/wave31_behavior.json
/workspaces/GAME-MKT/.venv-1/bin/python runtime/earth_demand_runtime.py > /tmp/wave31_demand.json
/workspaces/GAME-MKT/.venv-1/bin/python runtime/earth_marketplace_runtime.py > /tmp/wave31_marketplace.json
```

Objetivos cobertos nesta onda:

- demanda
- consumo
- mercado
- precos
- adocao tecnologica
- comportamento
- crescimento

## 📚 Documentação

| Documento | Conteúdo |
|-----------|----------|
| [README.md](./README.md) | Visão geral do projeto |
| [backend/README.md](./backend/README.md) | Documentação backend |
| [backend/API-DOCUMENTATION.md](./backend/API-DOCUMENTATION.md) | APIs detalhadas |
| [ROADMAP.md](./ROADMAP.md) | EPICs e issues |
| [backend/EXAMPLES.sh](./backend/EXAMPLES.sh) | Exemplos de cURL |

## 🎯 10 EPICs Implementados

### ✅ EPIC 1: Motor de Indicadores
**Calcula:** CAC, LTV, CTR, Conversão, Ticket Médio, ROI  
**API:** `GET /api/kpis/multi` | `POST /api/kpis/calculate`

### ✅ EPIC 2: Sistema Fuzzy
**Calcula:** Satisfação comportamental (0-1)  
**API:** `POST /api/fuzzy/satisfacao` | `PUT /api/fuzzy/pesos`

### ✅ EPIC 3: Tradução de Siglas
**Traduz:** Métricas técnicas em linguagem clara  
**API:** `GET /api/metricas/{tipo}/human` | `GET /api/metricas`

### ✅ EPIC 4: John Brasileiro
**Gera:** Mensagens contextualizadas + templates  
**API:** `POST /api/john/gerar-mensagem` | `GET /api/john/template`

### ✅ EPIC 5: Tracking Comportamental
**Registra:** 10 tipos de eventos do usuário  
**API:** `POST /api/tracking/evento` | `POST /api/tracking/batch`

### ✅ EPIC 6: Lead Scoring
**Calcula:** Score 0-100 com status (frio/morno/quente)  
**API:** `POST /api/leads/score` | `POST /api/leads/ranking`

### ✅ EPIC 8: Insights Automáticos
**Detecta:** Anomalias, correlações, padrões  
**API:** `POST /api/insights/analisar` | `POST /api/insights/anomalia`

### 🚧 EPIC 7: Dashboard Humanizado
Próximas sprints: Implementar no Vue

### 🚧 EPIC 10: Integração Ecossistema
Próximas sprints: Multi-portal ETL

## 💻 Arquitetura

```
Frontend (Vue 3)                Backend (Node.js)
├── HeroSection.vue      →       ├── kpi-calculator
├── PortalGrid.vue       →       ├── fuzzy-motor
├── JohnChat.vue         →       ├── lead-scorer
├── JohnBrasileiro.vue   →       ├── motor-insights
└── ...                          └── ...
        ↕
    HTTP + JSON
   Port 5173 ↔ 3001
```

## 🔗 Fluxo de Dados

```
1. Usuário interage no Vue
2. Frontend registra evento via API
3. Backend processa com FuzzyMotor + LeadScorer
4. Retorna insights + mensagens John
5. Vue renderiza em tempo real
```

## 📊 Exemplos Reais

### Cenário 1: Análise de Campanha

```bash
# Dados da campanha
CUSTO=10000
LEADS=500
CONVERTIDOS=40
RECEITA=200000

# Calcular KPIs
curl "http://localhost:3001/api/kpis/multi?\
custo_campanha=$CUSTO&\
leads_gerados=$LEADS&\
clientes_convertidos=$CONVERTIDOS&\
receita_total=$RECEITA"

# Resultado:
# CAC: R$ 250
# LTV: R$ 1.875
# Conversão: 8%
# ROI: 1900%
```

### Cenário 2: Qualificação de Lead

```bash
# Dados do lead
curl -X POST http://localhost:3001/api/leads/score \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "lead_123",
    "total_interacoes": 15,
    "tempo_navegacao": 540,
    "origem": "organico",
    "engajamento_porcento": 75,
    "dias_ultima_atividade": 1,
    "clique_proposta": true,
    "compartilhamento": true,
    "interacao_chat": 8
  }'

# Resultado:
# score: 87
# status: "quente"
# proxima_acao: "Prospeccionar agora via ligação"
```

### Cenário 3: Gerar Insights

```bash
# Analisar portfólio
curl -X POST http://localhost:3001/api/insights/analisar \
  -H "Content-Type: application/json" \
  -d '{
    "kpis": [{tipo:"CAC",valor:350}, ...],
    "historicosPorTipo": {"CAC":[...]}
  }'

# Resultado:
# - "Funil de Vendas Comprometido" (crítico)
# - Ação recomendada: Revisar landing + copy
# - Mensagem John: "Ó, seu funil tá entupido!"
```

## 🧪 Stack Utilizado

**Frontend:**
- Vue 3 (Composition API)
- Vite (build moderno)
- TypeScript (type safety)
- Tailwind CSS v4
- Pinia (state management)
- Three.js (3D graphics)

**Backend:**
- Node.js 18+
- Express 4
- TypeScript 5
- CORS (cross-origin)

## 📦 Build Produção

```bash
# Frontend
npm run build
# Output: dist/ (pronto para deploy)

# Backend
cd backend
npm run build
npm start
# Output: dist/ (server rodando)
```

## 🐛 Troubleshooting

### Frontend não conecta com backend
```bash
# Verifique se backend está rodando
curl http://localhost:3001/health

# Verifique CORS em backend/src/index.ts
# Deve ter: app.use(cors())
```

### Erro de TypeScript no build
```bash
# Limpe e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Porta 3001 já em uso
```bash
# Mude em backend/.env ou backend/src/index.ts
PORT=3002

# Ou mate o processo anterior
lsof -i :3001
kill -9 <PID>
```

## 🚀 Próximos Passos

1. **Rodar o projeto** - `npm run dev` (frontend) + `cd backend && npm run dev` (backend)
2. **Testar APIs** - `bash backend/EXAMPLES.sh`
3. **Ler documentação** - Comece por `README.md`
4. **Explorar código** - Veja os 7 serviços em `backend/src/services/`
5. **Integrar com dados reais** - Conecte seus portais

## 📞 Suporte

- **Dúvidas?** Veja `ROADMAP.md` e `backend/API-DOCUMENTATION.md`
- **Bugs?** Abra uma Issue no GitHub
- **Sugestões?** Contribua com Pull Request

## 📜 Licença

Proprietary - LICEU 6.0 Ecossistema

---

**🎉 Bem-vindo ao GAME MKT Intelligence Engine!**

Made with ❤️ by LICEU 6.0 - GAME MKT Intelligence Team

**Status:** ✅ Production Ready  
**Versão:** 1.0.0  
**Data:** 15 de Abril de 2026
