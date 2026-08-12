# 📚 GAME MKT - Índice de Documentação

**Bem-vindo ao GAME MKT Intelligence Engine!**

Aqui você encontra toda a documentação do projeto. Comece por onde faz mais sentido para você.

---

## 🚀 Começar Agora

### Sou um novo desenvolvedor
👉 Comece aqui: **[QUICKSTART.md](./QUICKSTART.md)**
- Como rodar o projeto em 5 minutos
- Estrutura básica
- Primeiros testes

### Sou um gerente/stakeholder
👉 Leia isto: **[EXECUTIVE-SUMMARY.md](./EXECUTIVE-SUMMARY.md)**
- Visão executiva
- O que foi entregue
- Métricas de qualidade
- Status de produção

### Sou um arquiteto/tech lead
👉 Estude isto: **[README.md](./README.md)**
- Arquitetura completa
- Stack tecnológico
- Padrões de design
- Roadmap

---

## 📖 Documentação por Tópico

### Frontend Vue 3

| Documento | Para Quem | Conteúdo |
|-----------|-----------|----------|
| [src/components/](./src/components/) | Devs Frontend | 7 componentes Vue |
| [src/store/john.store.ts](./src/store/john.store.ts) | State Management | Pinia store |
| [src/composables/useJohnIA.ts](./src/composables/useJohnIA.ts) | Lógica IA | Respostas contextualizadas |
| [src/style.css](./src/style.css) | UI/Design | LICEU 6.0 theme |

### Backend Node.js

| Documento | Para Quem | Conteúdo |
|-----------|-----------|----------|
| [backend/README.md](./backend/README.md) | Devs Backend | Visão geral backend |
| [backend/API-DOCUMENTATION.md](./backend/API-DOCUMENTATION.md) | API Consumers | 16+ endpoints detalhados |
| [backend/src/services/](./backend/src/services/) | Devs Backend | 7 serviços de IA |
| [backend/EXAMPLES.sh](./backend/EXAMPLES.sh) | Testers | Exemplos de cURL |

### Arquitetura & Roadmap

| Documento | Para Quem | Conteúdo |
|-----------|-----------|----------|
| [ROADMAP.md](./ROADMAP.md) | Planejamento | 10 EPICs + issues |
| [EXECUTIVE-SUMMARY.md](./EXECUTIVE-SUMMARY.md) | Stakeholders | Status & entrega |
| [QUICKSTART.md](./QUICKSTART.md) | Iniciantes | Como começar |
| [README.md](./README.md) | Todos | Overview completo |

### Configuração

| Arquivo | Propósito |
|---------|----------|
| [backend/.env.example](./backend/.env.example) | Variáveis de ambiente |
| [package.json](./package.json) | Dependências frontend |
| [backend/package.json](./backend/package.json) | Dependências backend |
| [tsconfig.json](./tsconfig.json) | Config TypeScript |
| [vite.config.ts](./vite.config.ts) | Config Vite |
| [backend/tsconfig.json](./backend/tsconfig.json) | Config Backend TS |

---

## 🎯 Guias por Caso de Uso

### ✅ "Quero rodar o projeto localmente"
1. Leia: [QUICKSTART.md](./QUICKSTART.md)
2. Execute:
   ```bash
   npm install
   npm run dev
   
   cd backend
   npm install
   npm run dev
   ```

### ✅ "Quero entender os KPIs"
1. Leia: [backend/README.md](./backend/README.md#cálculos-de-kpis)
2. Estude: [backend/src/services/kpi-calculator.ts](./backend/src/services/kpi-calculator.ts)
3. Teste: `curl http://localhost:3001/api/kpis/multi`

### ✅ "Quero integrar com meu frontend"
1. Leia: [backend/API-DOCUMENTATION.md](./backend/API-DOCUMENTATION.md)
2. Use exemplos: [backend/EXAMPLES.sh](./backend/EXAMPLES.sh)
3. Implemente em Vue usando axios ou fetch

### ✅ "Quero entender o Lead Scoring"
1. Leia: [ROADMAP.md](./ROADMAP.md#-epic-6--score-de-lead-inteligente) (Issue #11)
2. Estude: [backend/src/services/lead-scorer.ts](./backend/src/services/lead-scorer.ts)
3. Teste: `curl -X POST http://localhost:3001/api/leads/score`

### ✅ "Quero gerar insights automáticos"
1. Leia: [ROADMAP.md](./ROADMAP.md#-epic-8--insights-automáticos) (Issue #13-14)
2. Estude: [backend/src/services/motor-insights.ts](./backend/src/services/motor-insights.ts)
3. Teste: `curl -X POST http://localhost:3001/api/insights/analisar`

### ✅ "Quero implementar o John Brasileiro"
1. Leia: [ROADMAP.md](./ROADMAP.md#-epic-4--integração-john-brasileiro) (Issue #7-8)
2. Frontend: [src/components/JohnBrasileiro.vue](./src/components/JohnBrasileiro.vue)
3. Backend: [backend/src/services/motor-mensagens-john.ts](./backend/src/services/motor-mensagens-john.ts)

### ✅ "Quero rastrear comportamento de usuários"
1. Leia: [ROADMAP.md](./ROADMAP.md#-epic-5--coleta-de-dados-comportamentais) (Issue #9-10)
2. Backend: [backend/src/services/colesor-eventos.ts](./backend/src/services/colesor-eventos.ts)
3. API: POST `/api/tracking/evento` ou `/api/tracking/batch`

### ✅ "Quero o status de produção"
1. Leia: [EXECUTIVE-SUMMARY.md](./EXECUTIVE-SUMMARY.md)
2. Procure por: "Status de Produção" e "Validações"

### ✅ "Quero saber o que vem a seguir"
1. Leia: [ROADMAP.md](./ROADMAP.md#-próximas-prioridades)
2. Procure por: "EPIC 7" e "EPIC 10"
3. Roadmap v1.1: Persistência, WebSocket, Dashboard

---

## 📊 Estrutura de Pasta

```
GAME-MKT/
├── 📱 Frontend Vue 3
│   ├── src/
│   │   ├── components/ ..................... 7 componentes Vue
│   │   ├── composables/useJohnIA.ts ...... Lógica IA
│   │   ├── store/john.store.ts ........... Pinia store
│   │   ├── style.css ..................... LICEU 6.0 theme
│   │   └── main.ts ....................... Bootstrap
│   ├── package.json ....................... Deps frontend
│   ├── vite.config.ts .................... Config Vite
│   └── README.md (neste nível)
│
├── 🧠 Backend Node.js
│   ├── src/
│   │   ├── index.ts ...................... Server + rotas
│   │   ├── types/metric.ts ............... Tipos
│   │   └── services/
│   │       ├── kpi-calculator.ts ......... EPIC 1
│   │       ├── fuzzy-motor.ts ............ EPIC 2
│   │       ├── dicionario-metricas.ts .... EPIC 3
│   │       ├── motor-mensagens-john.ts ... EPIC 4
│   │       ├── colesor-eventos.ts ........ EPIC 5
│   │       ├── lead-scorer.ts ............ EPIC 6
│   │       └── motor-insights.ts ......... EPIC 8
│   ├── dist/ ............................ Compilado
│   ├── package.json ....................... Deps backend
│   ├── tsconfig.json ...................... Config TS
│   ├── README.md .......................... Docs backend
│   ├── API-DOCUMENTATION.md ............... APIs detalhadas
│   ├── EXAMPLES.sh ....................... Exemplos cURL
│   ├── .env.example ...................... Variáveis env
│   └── .env ............................ (gitignored)
│
├── 📚 Documentação Raiz
│   ├── README.md .......................... Overview
│   ├── QUICKSTART.md ...................... Início rápido
│   ├── ROADMAP.md ......................... EPICs & issues
│   ├── EXECUTIVE-SUMMARY.md .............. Status entrega
│   └── INDEX.md ........................... Este arquivo
│
├── 📦 Configuração
│   ├── package.json ....................... Deps frontend
│   ├── tsconfig.json ...................... Config TS
│   ├── vite.config.ts .................... Config Vite
│   └── .gitignore ......................... Git exclude
│
└── 🔧 Build Output
    └── dist/ ............................ Frontend build
```

---

## 🔄 Fluxo de Desenvolvimento

```
1. COMEÇO RÁPIDO
   ↓
   QUICKSTART.md → npm install → npm run dev
   
2. ENTENDIMENTO
   ↓
   README.md → Overview do projeto
   
3. EXPLORAÇÃO
   ↓
   Escolha um tópico:
   - Frontend? → src/components/
   - Backend? → backend/src/services/
   - APIs? → backend/API-DOCUMENTATION.md
   - Roadmap? → ROADMAP.md
   
4. APROFUNDAMENTO
   ↓
   Leia o código dos serviços
   
5. TESTES
   ↓
   backend/EXAMPLES.sh (cURL)
   npm run dev (local)
   
6. DEPLOY
   ↓
   npm run build
   backend/npm run build
```

---

## 🔍 Buscar Informação

### Por Tecnologia
- **Vue 3**: src/components/, QUICKSTART.md
- **Express**: backend/src/index.ts
- **TypeScript**: tsconfig.json, backend/src/
- **Pinia**: src/store/john.store.ts
- **Three.js**: src/components/HeroSection.vue
- **Tailwind**: src/style.css

### Por Funcionalidade
- **KPIs**: backend/src/services/kpi-calculator.ts
- **Fuzzy Logic**: backend/src/services/fuzzy-motor.ts
- **Lead Scoring**: backend/src/services/lead-scorer.ts
- **Chat IA**: src/components/JohnChat.vue
- **Tracking**: backend/src/services/colesor-eventos.ts
- **Insights**: backend/src/services/motor-insights.ts

### Por Epic
- Epic #1: ROADMAP.md + backend/src/services/kpi-calculator.ts
- Epic #2: ROADMAP.md + backend/src/services/fuzzy-motor.ts
- Epic #3: ROADMAP.md + backend/src/services/dicionario-metricas.ts
- ... (ver ROADMAP.md para todos)

---

## 🚀 Links Rápidos

| Link | Descrição |
|------|-----------|
| [QuickStart](./QUICKSTART.md) | 5 minutos para rodar |
| [README](./README.md) | Overview completo |
| [Roadmap](./ROADMAP.md) | EPICs e issues |
| [Executive Summary](./EXECUTIVE-SUMMARY.md) | Status & métricas |
| [API Docs](./backend/API-DOCUMENTATION.md) | 16+ endpoints |
| [Backend Readme](./backend/README.md) | Docs backend |
| [Exemplos cURL](./backend/EXAMPLES.sh) | Testar APIs |

---

## 📞 Suporte & Contribuição

### Encontrou um problema?
1. Verifique [QUICKSTART.md#troubleshooting](./QUICKSTART.md#-troubleshooting)
2. Procure em [ROADMAP.md](./ROADMAP.md)
3. Abra uma Issue no GitHub

### Quer contribuir?
1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/seu-feature`)
3. Faça commit (`git commit -m 'Add feature'`)
4. Push (`git push origin feature/seu-feature`)
5. Abra um Pull Request

### Tem sugestões?
- Abre uma Issue com label "enhancement"
- Compartilha em discussões
- Contribui com código

---

## 📄 Versionamento

| Versão | Data | Status | Notas |
|--------|------|--------|-------|
| 1.0.0 | 15/04/2026 | ✅ Production | 7 EPICs concluídos |
| 1.1 | Próx. | 🚧 Planejado | DB + WebSocket + Dashboard |
| 1.2 | Próx. | 🚧 Roadmap | ML + Integrações |

---

## 🎓 Recursos de Aprendizado

### Para Iniciantes em Vue/Node
- [Vue 3 Docs](https://vuejs.org/)
- [Express Docs](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/)

### Para Inteligência de Marketing
- Leia EXECUTIVE-SUMMARY.md
- Estude backend/src/services/
- Consulte ROADMAP.md

### Para APIs RESTful
- Leia backend/API-DOCUMENTATION.md
- Execute backend/EXAMPLES.sh
- Teste em Postman

---

**Última Atualização:** 15 de Abril de 2026  
**Mantido por:** LICEU 6.0 - GAME MKT Intelligence Team  
**Status:** ✅ Production Ready v1.0.0

---

**Bem-vindo ao GAME MKT! Boa exploração! 🚀**
