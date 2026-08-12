# GAME MKT Backend - Intelligence Engine

[![Backend Federation Smoke](https://github.com/laverssiera/GAME-MKT/actions/workflows/backend-smoke-federation.yml/badge.svg?branch=main)](https://github.com/laverssiera/GAME-MKT/actions/workflows/backend-smoke-federation.yml)

![GAME MKT](https://img.shields.io/badge/GAME%20MKT-Intelligence%20Engine-blueviolet)
![Version](https://img.shields.io/badge/version-1.2.0-blue)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen)

Backend de inteligência para o GAME MKT - motor de indicadores de marketing gamificado para imobiliário brasileiro.

## 🎯 Objetivo

Prover um motor de inteligência de marketing capaz de:
- Calcular KPIs automáticos (CAC, LTV, CTR, ROI, etc)
- Aplicar lógica fuzzy para satisfação comportamental
- Humanizar métricas técnicas em linguagem clara
- Gerar mensagens contextualizadas do John Brasileiro
- Rastrear eventos comportamentais de usuários
- Calcular lead scores inteligentes
- Gerar insights automáticos com recomendações

## 📦 Stack

- **Node.js 18+** - Runtime JavaScript
- **Express.js 4.18** - Web framework
- **TypeScript 5** - Type safety
- **CORS** - Cross-origin resource sharing
- **dotenv** - Gerenciamento de variáveis de ambiente

## 📋 Estrutura de Pastas

```
backend/
├── src/
│   ├── index.ts                  # Server principal com rotas
│   ├── brain_lib/
│   │   ├── lead-scoring.ts       # Scoring fuzzy em FP (unificado)
│   │   └── core-dna-events.ts    # Emissão de eventos CORE-DNA
│   ├── types/
│   │   └── metric.ts             # Tipos de dados
│   └── services/
│       ├── kpi-calculator.ts     # EPIC 1: Cálculo de KPIs
│       ├── fuzzy-motor.ts        # EPIC 2: Sistema fuzzy
│       ├── dicionario-metricas.ts # EPIC 3: Tradução
│       ├── motor-mensagens-john.ts # EPIC 4: Mensagens John
│       ├── colesor-eventos.ts    # EPIC 5: Tracking
│       ├── lead-scorer.ts        # EPIC 6: Lead scoring
│       └── motor-insights.ts     # EPIC 8: Insights
├── dist/                          # Compilado (gerado em build)
├── package.json                   # Dependências
├── tsconfig.json                  # Config TypeScript
└── API-DOCUMENTATION.md          # Documentação detalhada de API
```

## 🚀 Quick Start

### Instalação

```bash
# Clonar repo
git clone <repo-url>
cd GAME-MKT/backend

# Instalar dependências
npm install

# Instalar tipos globais (opcional)
npm install -D @types/node @types/express
```

### Desenvolvimento

```bash
# Rodar com ts-node (hot reload)
npm run dev

# Servidor estará em http://localhost:3001
```

### Build & Produção

```bash
# Compilar TypeScript
npm run build

# Rodar compilado
npm start
```

## 📊 EPICs Implementados

### ✅ EPIC 1 - Motor de Indicadores de Marketing
Cálculos automáticos de KPIs padrão:
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- CTR (Click Through Rate)
- Taxa de Conversão
- Ticket Médio
- ROI (Return on Investment)
- Engajamento Geral
- Relação LTV/CAC

**API:** `POST /api/kpis/calculate` | `GET /api/kpis/multi`

### ✅ EPIC 2 - Sistema de Satisfação Fuzzy
Cálculo de satisfação sem avaliação direta usando:
- Retorno ao site
- Tempo de navegação
- Clique em proposta
- Compartilhamento
- Interação com chat

**API:** `POST /api/fuzzy/satisfacao` | `PUT /api/fuzzy/pesos`

### ✅ EPIC 3 - Tradução de Siglas (Humanização)
Dicionário de métricas traduzidas para linguagem clara:
- Descrições em português simples
- Mensagens contextualizadas do John
- Exemplos de uso prático

**API:** `GET /api/metricas/{tipo}/human` | `GET /api/metricas`

### ✅ EPIC 4 - Integração John Brasileiro
Motor de mensagens humanizadas:
- Análise de contexto métrico
- Geração de tom adequado
- Ações sugeridas
- Templates parametrizados

**API:** `POST /api/john/gerar-mensagem` | `GET /api/john/template`

### ✅ EPIC 5 - Coleta de Dados Comportamentais
Tracking de eventos do usuário:
- Registro individual de eventos
- Batch import de eventos
- Resumo comportamental por usuário
- Taxa de retorno

**API:** `POST /api/tracking/evento` | `POST /api/tracking/batch` | `GET /api/tracking/resumo/:user_id`

### ✅ EPIC 6 - Score de Lead Inteligente
Scoring fuzzy baseado em:
- Interações totais
- Tempo de navegação
- Origem do lead
- Engajamento
- Recência
- Qualidade de interação

Atualizações da unificação:
- Motor migrado para `brain_lib` em estilo funcional (FP)
- Emissão automática do evento `lead.created` em padrão CORE-DNA
- Handoff automático para John AI assumir atendimento

**API:** `POST /api/leads/score` | `POST /api/leads/ranking`

### ✅ EPIC 8 - Insights Automáticos
Geração automática de alertas:
- Detecção de anomalias (Z-score)
- Correlações entre métricas
- Padrões conhecidos
- Recomendações acionáveis

**API:** `POST /api/insights/analisar` | `POST /api/insights/anomalia`

## 📡 Exemplos de API

### Calcular todos os KPIs
```bash
curl "http://localhost:3001/api/kpis/multi?custo_campanha=5000&leads_gerados=250&clientes_convertidos=20"
```

### Traduzir métrica
```bash
curl http://localhost:3001/api/metricas/CAC/human
```

### Gerar mensagem John
```bash
curl -X POST http://localhost:3001/api/john/gerar-mensagem \
  -H "Content-Type: application/json" \
  -d '{"tipo":"conversao","valor":12,"tendencia":"subindo"}'
```

### Calcular lead score
```bash
curl -X POST http://localhost:3001/api/leads/score \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id":"lead_123",
    "total_interacoes":15,
    "tempo_navegacao":540,
    "origem":"organico",
    "engajamento_porcento":75,
    "dias_ultima_atividade":1,
    "clique_proposta":true,
    "compartilhamento":true,
    "interacao_chat":8
  }'
```

Resposta agora inclui:
- `core_dna_event` com envelope de evento padrão (`core-dna.v1`)
- `john_handoff` com a decisão de jornada para o John AI

### Gerar insights
```bash
curl -X POST http://localhost:3001/api/insights/analisar \
  -H "Content-Type: application/json" \
  -d '{
    "kpis":[
      {"tipo":"CAC","valor":250,"unidade":"R$","categoria":"aquisicao"},
      {"tipo":"conversao","valor":5,"unidade":"%","categoria":"conversao"}
    ],
    "historicosPorTipo":{"CAC":[200,220,250],"conversao":[6,5.5,5]}
  }'
```

Veja [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) para documentação completa.

## 🧮 Lógicas Principais

### Cálculo de KPIs
Utiliza fórmulas padrão de marketing:
- **CAC** = Custo da Campanha / Clientes Convertidos
- **LTV** = Receita Total / Clientes × Meses
- **CTR** = (Cliques / Impressões) × 100
- **ROI** = ((Ganho - Investimento) / Investimento) × 100

### Sistema Fuzzy
Mapeia valores contínuos (0-1) para classificações discretas:
- **Tempo:** 0s (0.1) → 15min (1.0)
- **Dias sem visita:** 1 dia (1.0) → 30+ dias (0.0)
- **Satisfação:** < 0.35 (baixa) | 0.35-0.65 (média) | > 0.65 (alta)

### Lead Scoring
Combina 6 fatores com pesos:
```
score = 
  (interações/50) × 0.15 +
  (fuzzy_tempo) × 0.15 +
  (fuzzy_origem) × 0.10 +
  (engajamento/100) × 0.25 +
  (fuzzy_recencia) × 0.20 +
  (qualidade_interacao) × 0.15
```

Resultado: 0-100 → {frio, morno, quente}

### Detecção de Anomalias
Usa Z-score para identificar desvios:
```
z_score = (valor_atual - média) / desvio_padrão
anomalia = |z_score| > 2.5
```

### Padrões de Insights
Correlações conhecidas:
- CAC alto + Conversão baixa = Funil compromitido
- ROI < 0 = Campanha em prejuízo
- LTV/CAC < 2 = Proporção insuficiente

## 🔌 Integrações

### Frontend Vue
```typescript
// Em src/store/john.store.ts
const kpis = await fetch('http://localhost:3001/api/kpis/multi').then(r => r.json())
const mensagem = await fetch('http://localhost:3001/api/john/gerar-mensagem', {...}).then(r => r.json())
```

### Databases (Futura)
```typescript
// Persistência em PostgreSQL
const metric = await db.metrics.create({
  empresa_id: 'emp_1',
  tipo: 'CAC',
  valor: 250,
  ...
})
```

### External APIs (Futura)
```typescript
// Integração com plataformas de marketing
const leads = await hubspot.crm.contacts.list()
const campaigns = await facebook.insights.get()
```

## 📊 Monitoramento

### Health Check
```bash
curl http://localhost:3001/health
```

Resposta:
```json
{
  "status": "ok",
  "version": "1.2.0",
  "epics": [...],
  "timestamp": "2026-04-15T10:30:00Z"
}
```

## 🧪 Testes (Futuro)

```bash
npm run test
```

Estrutura:
```
backend/
├── tests/
│   ├── kpi-calculator.test.ts
│   ├── fuzzy-motor.test.ts
│   ├── lead-scorer.test.ts
│   └── ...
└── jest.config.js
```

## 📝 Variáveis de Ambiente

Criar `.env`:
```
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug
```

## 🐛 Debugging

### Logs
```typescript
console.log(`[INFO] Calculando KPI: ${tipo}`)
console.warn(`[WARN] Anomalia detectada: ${metrica}`)
console.error(`[ERROR] Erro ao processar: ${error}`)
```

### DevTools
```bash
# Rodar com debugger
node --inspect dist/index.js

# Acessar em chrome://inspect
```

## 📚 Roadmap v1.1

- [ ] Persistência em PostgreSQL
- [ ] Cache Redis para KPIs históricos
- [ ] WebSocket para updates realtime
- [ ] Autenticação JWT
- [ ] Rate limiting
- [ ] Validação com Joi/Zod
- [ ] Logs estruturados (Winston)
- [ ] Testes unitários e E2E
- [ ] Docker & Kubernetes
- [ ] CI/CD GitHub Actions
- [ ] Documentação OpenAPI/Swagger

## 🤝 Contribuindo

1. Fork o repositório
2. Cria uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abre um Pull Request

## 📄 Licença

Proprietary - LICEU 6.0

## 👨‍💼 Suporte

Para dúvidas ou sugestões, abra uma issue ou entre em contato com o time de desenvolvimento.

---

**Documentação Versão:** 1.2.0  
**Última Atualização:** 22 de Abril de 2026  

**Made with ❤️ by LICEU 6.0 - GAME MKT Intelligence Team**
