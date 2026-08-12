# GAME MKT

[![Backend Federation Smoke](https://github.com/laverssiera/GAME-MKT/actions/workflows/backend-smoke-federation.yml/badge.svg?branch=main)](https://github.com/laverssiera/GAME-MKT/actions/workflows/backend-smoke-federation.yml)

Plataforma de Revenue Operations e Marketing Intelligence do ecossistema LICEU 6.0.

Este repositório concentra:
- Frontend em Vue 3 + Vite para operação, visualização e interação com IA.
- Backend em Node.js + Express + TypeScript com serviços de KPI, tracking, scoring, editorial e bem-estar.
- Documentação estratégica e operacional de módulos, roadmap e arquitetura enterprise.

## Stack principal

- Frontend: Vue 3, TypeScript, Vite, Pinia, Three.js, Tailwind CSS.
- Backend: Node.js, Express, TypeScript, Zod, PostgreSQL client, Redis client, JWT.

## Estrutura do repositório

```text
GAME-MKT/
├── src/                         # Frontend Vue (app principal)
├── backend/                     # Backend TypeScript (APIs e serviços)
├── game-mkt-monolito/           # Estrutura monolítica complementar (frontend/backend/db/docs)
├── public/                      # Assets públicos frontend
├── README.md                    # Este guia
├── QUICKSTART.md                # Início rápido resumido
├── ROADMAP.md                   # Planejamento por fases
└── API-V2-ENDPOINTS.md          # Referência de endpoints v2
```

## Pré-requisitos

- Node.js 18+
- npm 9+
- Opcional para algumas integrações: Redis e PostgreSQL

## Execução local

### 1. Frontend

Na raiz do projeto:

```bash
npm install
npm run dev
```

A aplicação sobe em http://localhost:5173 (porta padrão do Vite).

Comandos úteis:

```bash
npm run build
npm run preview
```

### 2. Backend

No diretório backend:

```bash
cd backend
npm install
npm run dev
```

API disponível em http://localhost:3001.

Comandos úteis:

```bash
npm run build
npm start
npm test
```

## Variáveis de ambiente (backend)

Variáveis mais relevantes lidas pelo servidor:

- PORT: porta HTTP da API. Padrão 3001.
- MAX_JSON_BODY: limite do payload JSON. Padrão 200kb.
- RATE_LIMIT_WINDOW_MS: janela do rate limit em ms. Padrão 60000.
- RATE_LIMIT_MAX_REQUESTS: máximo de requisições por janela. Padrão 120.
- REDIS_URL: conexão para rate limit distribuído.
- JWT_SECRET: segredo para assinatura/verificação de tokens.
- JWT_EXPIRES_IN: expiração do token. Padrão 8h.

Sugestão de arquivo local em backend/.env:

```env
PORT=3001
MAX_JSON_BODY=200kb
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=120
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=8h
```

## Endpoints iniciais para validação

Com o backend rodando:

```bash
curl http://localhost:3001/health
curl "http://localhost:3001/api/kpis/multi"
```

Para exemplos completos de chamadas:
- backend/EXAMPLES.sh
- backend/EDITORIAL-EXAMPLES.sh
- backend/WELLBEING-EXAMPLES.sh

Para testes e fluxo completo do monolito enterprise:
- game-mkt-monolito/README.md (seção "🧪 Testing")

## Documentação importante

- QUICKSTART.md
- INDEX.md
- ROADMAP.md
- MODULES-STATUS.md
- SERVICE-COMPOSER-ENGINE.md
- ENTERPRISE-ARCHITECTURE.md
- backend/README.md
- backend/API-DOCUMENTATION.md
- API-V2-ENDPOINTS.md
- game-mkt-monolito/README.md

## Situação do projeto

O repositório está organizado em duas frentes:
- Entrega operacional atual (frontend + backend APIs).
- Evolução arquitetural enterprise (documentos, módulos e monolito de referência).

Para priorização de próximos incrementos, consulte ROADMAP.md e MODULES-STATUS.md.

## Arquitetura alvo

O GAME MKT evolui para uma camada central de operação comercial cognitiva do ecossistema LICEU 6.0.

Nessa arquitetura, o núcleo da plataforma coordena:
- unificação de identidade de leads
- comunicação omnichannel com orquestração em runtime
- precificação dinâmica orientada por margem e risco
- execução comercial autônoma com John SDR

### Módulos estratégicos

#### 1. Pricing Engine

Motor de inteligência comercial responsável por:
- preço dinâmico
- margem
- risco
- elasticidade
- ROI
- contexto regional
- perfil do cliente
- bundle pricing
- pricing por comportamento

Capacidades previstas:
- calcular preço final com base em regras, margem e risco
- simular cenários por produto, canal, perfil e região
- sugerir bundles inteligentes e impacto financeiro
- apoiar John na decisão de aumentar preço, reduzir preço, proteger margem ou aprovar negociação

Endpoints alvo:
- POST /api/pricing/calculate
- POST /api/pricing/simulate
- POST /api/pricing/bundle
- POST /api/pricing/discount/check
- GET /api/pricing/history/:product
- GET /api/pricing/market
- POST /api/pricing/forecast

Estrutura proposta:

```text
services/pricing-engine/
├── calculators/
├── policies/
├── ai/
├── events/
└── services/
```

#### 2. Omnichannel Runtime

Camada nervosa de comunicação responsável por:
- selecionar o melhor canal
- decidir o melhor horário
- adaptar narrativa e contexto
- executar fallback automático
- manter continuidade de conversa
- escalar para humano ou John quando necessário

Fluxo esperado:
- WhatsApp sem resposta
- fallback para email
- fallback para push
- ativação de voice AI
- atualização de CRM e continuidade da jornada

Endpoints alvo:
- POST /api/omnichannel/send
- POST /api/omnichannel/broadcast
- POST /api/omnichannel/router
- POST /api/omnichannel/escalate
- GET /api/omnichannel/session/:id
- POST /api/omnichannel/consent

Estrutura proposta:

```text
services/omnichannel-runtime/
├── channels/
├── routing/
├── sessions/
├── ai/
└── compliance/
```

#### 3. Sales Orchestration

Motor executivo comercial responsável por:
- SDR IA
- pipeline
- follow-up
- negociação
- SLA
- forecast
- comissionamento
- aprovação
- contratos
- pós-venda
- expansão
- cross-sell
- renovações

Papel do John SDR:
- conversar
- negociar
- identificar objeções
- calcular risco
- gerar proposta
- prever fechamento
- fazer follow-up
- detectar abandono
- reativar pipeline

Endpoints alvo:
- POST /api/sales/opportunity
- POST /api/sales/proposal
- POST /api/sales/negotiate
- POST /api/sales/close
- POST /api/sales/forecast
- POST /api/sales/renewal
- POST /api/sales/cross-sell

Estrutura proposta:

```text
services/sales-orchestration/
├── pipeline/
├── negotiation/
├── ai/
├── sla/
└── integrations/
```

#### 4. Lead Federation

Módulo de identidade única do ecossistema responsável por:
- deduplicação
- resolução de identidade
- merge de perfis
- score de confiança e qualidade
- vínculo entre canais, empresas, ativos e eventos

Este módulo resolve o problema central de contexto distribuído. Quando um usuário interage por anúncio, WhatsApp, email, portal, corretor e visita física, o sistema entende que é a mesma pessoa.

Endpoints alvo:
- POST /api/federation/ingest
- POST /api/federation/merge
- POST /api/federation/resolve
- GET /api/federation/profile/:id
- POST /api/federation/relationship
- POST /api/federation/trust-score

Estrutura proposta:

```text
services/lead-federation/
├── identity/
├── ingestion/
├── scoring/
├── graph/
└── storage/
```

## Fluxo integrado alvo

```text
Lead entra
↓
Lead Federation identifica origem e identidade
↓
Sales Orchestration cria oportunidade
↓
John SDR conduz a conversa
↓
Pricing Engine calcula bundle e margem
↓
Proposal Generator monta proposta
↓
MAE aprova
↓
Contrato é gerado
↓
Operação recebe handoff
↓
GAME MKT inicia retenção e expansão
```

## Estrutura alvo do repositório

```text
game-mkt/
├── frontend/
├── backend/
├── services/
│   ├── pricing-engine/
│   ├── omnichannel-runtime/
│   ├── sales-orchestration/
│   ├── lead-federation/
│   ├── campaign-engine/
│   ├── crm-federation/
│   └── market-intelligence/
├── shared/
│   ├── core-dna/
│   ├── contracts/
│   ├── event-bus/
│   ├── auth/
│   ├── observability/
│   └── ai-sdk/
└── infrastructure/
    ├── docker/
    ├── kubernetes/
    ├── terraform/
    └── github-actions/
```

## Visão final

O objetivo do GAME MKT deixa de ser apenas CRM, automação, chatbot ou BI isolados. A direção arquitetural passa a ser um sistema operacional cognitivo de receita, onde:
- marketing pensa
- IA conversa
- pricing negocia
- vendas executam
- observabilidade monitora
- MAE governa
- monólitos produzem

Tudo conectado por CORE-DNA, event bus, John e GAME MKT Core.

## Nova diretriz estratégica (2026)

### Missão do GAME MKT

Transformar atenção em:
- educação
- desenvolvimento econômico
- moradia
- infraestrutura
- ciência
- dignidade humana

### Camada interplanetária

Nova camada de runtime:
- /game-mkt-interplanetary-runtime

Responsável por:
- expansão global da marca LICEU
- experiências holográficas comerciais
- venda imersiva
- campanhas cognitivas
- marketplaces civilizacionais
- propaganda ética orientada a impacto humano
- treinamento de vendas interplanetárias
- marketing baseado em simulações futuras

## Novos domínios

### 1. Interplanetary Experience Engine

Objetivo:
- criar experiências holográficas vendáveis

Estrutura:

```text
services/interplanetary-experience-engine/
├── mars/
├── moon/
├── oceanic-cities/
├── orbital-stations/
├── immersive-commerce/
├── holographic-runtime/
└── emotional-ai/
```

Capacidades:
- simulações vendáveis de moradia em Marte
- condomínio lunar
- cidade submarina
- colônia orbital
- mineração espacial
- agricultura extrema
- vida pós-colapso climático
- cidades autossustentáveis

APIs alvo:
- POST /api/interplanetary/experience/create
- POST /api/interplanetary/experience/simulate
- POST /api/interplanetary/experience/purchase
- GET /api/interplanetary/experience/catalog

### 2. Civilizational Marketing Engine

O sistema evolui de publicidade para expansão de civilização, vendendo:
- propósito
- educação
- ciência
- infraestrutura
- habitação
- sobrevivência climática
- futuro humano

Estrutura:

```text
services/civilizational-marketing/
├── narrative-engine/
├── social-dynamics/
├── emotional-intelligence/
├── future-scenarios/
├── ethics-engine/
└── civilization-branding/
```

Exemplo de narrativa:
- de: "Compre um apartamento"
- para: "Participe da reconstrução da próxima geração de cidades resilientes"

### 3. Holographic Sales Engine

Missão:
- transformar vendas em experiência sensorial

Estrutura:

```text
services/holographic-sales/
├── xr-commerce/
├── holographic-room/
├── realtime-avatar/
├── ai-sales-host/
├── spatial-audio/
└── sensory-engine/
```

Experiências-alvo:
- apartamento em Marte
- cidade sustentável
- condomínio oceânico
- laboratório espacial
- universidade holográfica

Com suporte de:
- IA
- holografia
- narrativa dinâmica
- clima simulado
- interação emocional

### 4. John SDR Interplanetário

Especializações:
- negociação emocional
- venda técnica
- diplomacia corporativa
- storytelling científico
- captação institucional
- turismo imersivo
- onboarding educacional

Estrutura:

```text
services/john-interplanetary-sdr/
├── persuasion/
├── educational-sales/
├── investor-relations/
├── diplomatic-ai/
├── psychology/
└── adaptive-language/
```

### 5. Planetary Brand Engine

Missão:
- criar marcas capazes de sobreviver séculos

Capacidades:
- identidade cultural
- identidade científica
- identidade habitacional
- reputação planetária
- governança reputacional

Estrutura:

```text
services/planetary-brand-engine/
├── reputation/
├── civilization-memory/
├── public-trust/
├── institutional-identity/
└── long-term-branding/
```

### 6. Market Simulation Engine

Missão:
- simular economias futuras

Cenários prioritários:
- colapso climático
- escassez energética
- mineração espacial
- cidades oceânicas
- inflação global
- novos materiais
- terras raras
- economia de Marte

Estrutura:

```text
services/market-simulation/
├── planetary-economics/
├── resource-scarcity/
├── civilization-growth/
├── climate-economy/
└── future-pricing/
```

Runtime operacional (WAVE P15):
- avaliação de market adoption
- resposta da população
- impacto de campanha
- demanda
- comportamento do consumidor
- engajamento de stakeholders

Comandos úteis:

```bash
/home/codespace/.python/current/bin/python runtime/earth_market_adoption_runtime.py
/home/codespace/.python/current/bin/python runtime/run_earth_market_adoption_simulation.py
make onda15
```

Endpoint backend (monólito Python):
- `POST /api/earth-market-adoption/evaluate`
- `POST /api/earth-market-adoption/simulate`

### 7. Gamified Human Development Engine

Missão:
- transformar crescimento humano em progressão gamificada

Exemplo de jornada:
- aprende física
- resolve problema real
- ajuda o ecossistema
- ganha reputação
- desbloqueia acesso
- participa de projetos reais

Estrutura:

```text
services/human-development/
├── missions/
├── rankings/
├── impact-score/
├── scientific-achievements/
├── ecosystem-reputation/
└── education-economy/
```

## Novas interfaces entre monólitos

### Com P&D

Integrações:
- pd.experimental.breakthrough
- pd.material.discovered
- pd.simulation.completed

O GAME MKT converte eventos em:
- narrativa
- campanha
- educação
- produto
- demonstração holográfica

### Com Archimedes

Integração para venda de:
- cidades futuras
- habitações extremas
- experiências imobiliárias holográficas
- condomínios resilientes

### Com Academia do Saber

Transformação de cursos em:
- missões
- competições
- desafios
- realidade holográfica
- laboratórios imersivos

### Com Econotech

Entrada de sinais:
- tendências econômicas
- escassez de recursos
- mudanças globais
- projeções de comportamento

Ajustes no GAME MKT:
- preço
- narrativa
- campanhas
- distribuição

### Com CEA Investimentos

Transformação de campanhas em:
- funding
- captação
- crowdfunding
- RWA
- tokenização
- experiências premium

### Com Juridicotech

Garantias:
- propaganda ética
- LGPD
- governança
- compliance
- direitos autorais
- licenciamento holográfico

## Novos eventos NATS

- game.interplanetary.experience.started
- game.interplanetary.experience.completed
- game.holographic.sale.closed
- game.market.future.predicted
- game.civilization.campaign.launched
- game.educational.mission.completed
- game.brand.global.shift
- game.xr.user.engaged
- game.future.city.visited
- game.planetary.market.alert

## Novos frontends

### 1. Civilization Control Center

Diretório:
- frontend/civilization-control-center

Painel global com:
- expansão do ecossistema
- reputação
- crescimento
- impacto social
- campanhas planetárias
- adoção educacional
- evolução urbana

### 2. Holographic Sales Room

Diretório:
- frontend/holographic-sales-room

Ambiente 3D para:
- venda imobiliária
- experiências educacionais
- turismo virtual
- investimentos
- apresentações institucionais

### 3. Planetary Campaign Studio

Diretório:
- frontend/planetary-campaign-studio

Criação de campanhas orientadas por:
- IA
- comportamento coletivo
- economia
- clima
- cultura
- infraestrutura

## Novas camadas de IA

### Ethical Influence Engine

Missão:
- evitar manipulação destrutiva

Funções:
- detectar propaganda abusiva
- limitar engenharia emocional extrema
- impedir vício
- proteger menores
- validar transparência

### Collective Intelligence Engine

Missão:
- entender tendências sociais globais

Analisa:
- comportamento
- medo
- desejo
- educação
- consumo
- mobilidade
- habitação
- sustentabilidade

## Visão final ampliada

O GAME MKT deixa de ser:
- marketing + CRM

E passa a ser:
- sistema operacional cognitivo de expansão civilizacional

Capaz de:
- vender
- educar
- inspirar
- financiar
- organizar
- conectar
- simular
- transformar comportamento coletivo
- acelerar infraestrutura humana
