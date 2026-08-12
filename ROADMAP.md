# GAME MKT - Roadmap de EPICs e Issues

**Versão:** 1.0.0  
**Status:** Implementação em Andamento  
**Atualizado:** 15 de Abril de 2026

---

## 📊 EPIC 1 — Motor de Indicadores de Marketing

Cálculo automatizado de métricas globais do ecossistema.

### Issue #1 — Criar modelo unificado de métricas
**Status:** ✅ **CONCLUÍDO**

**Título:** `feat(metrics): modelo base de indicadores de marketing`

**Descrição:** Estrutura para armazenar métricas globais.

**Checklist:**
- ✅ Definir schema Metric
- ✅ Categorias (aquisição, engajamento, conversão, valor, satisfação)
- ✅ Timestamps
- ✅ Multi-empresa
- ✅ Multi-portal

**Campos Implementados:**
```typescript
interface Metric {
  id: string
  empresa_id: string
  portal_id?: string
  tipo: string
  categoria: MetricCategory
  valor: number
  origem: string
  metadata?: Record<string, any>
  created_at: Date
  updated_at?: Date
}
```

**Implementado em:** `backend/src/types/metric.ts`

### Issue #2 — Implementar indicadores padrão do mercado
**Status:** ✅ **CONCLUÍDO**

**Título:** `feat(metrics): calcular KPIs padrão marketing`

**Métricas Implementadas:**
- ✅ CAC (Customer Acquisition Cost)
- ✅ LTV (Lifetime Value)
- ✅ CTR (Click Through Rate)
- ✅ Taxa de Conversão
- ✅ Ticket Médio
- ✅ ROI (Return on Investment)
- ✅ Engajamento Geral
- ✅ Relação LTV/CAC

**Critérios:**
- ✅ Cálculo automático (formulas padrão)
- ✅ Armazenar histórico (estrutura pronta)
- ✅ Expor via API (`GET /api/kpis/multi`, `POST /api/kpis/calculate`)

**Implementado em:** `backend/src/services/kpi-calculator.ts`

---

## 🧠 EPIC 2 — Sistema de Satisfação Fuzzy

Motor de cálculo de satisfação sem avaliação direta.

### Issue #3 — Criar motor fuzzy de satisfação
**Status:** ✅ **CONCLUÍDO**

**Título:** `feat(fuzzy): motor de satisfação comportamental`

**Objetivo:** Calcular satisfação a partir de comportamento.

**Entradas:**
- ✅ Retorno ao site
- ✅ Tempo de navegação
- ✅ Clique em proposta
- ✅ Compartilhamento
- ✅ Interação com chat

**Saída:**
- ✅ `score_satisfacao: 0.0 → 1.0`
- ✅ `classificacao: baixa / media / alta`

**Funções Fuzzy Implementadas:**
- Tempo de navegação (0s → 1.0, 15min → máx)
- Dias sem visita (1 dia → 1.0, 30+ dias → 0.0)
- Normalização automática de pesos

**Implementado em:** `backend/src/services/fuzzy-motor.ts`

### Issue #4 — Pesos fuzzy configuráveis
**Status:** ✅ **CONCLUÍDO**

**Título:** `feat(fuzzy): pesos dinâmicos por comportamento`

**Checklist:**
- ✅ Tabela fuzzy_weights (interface de dados)
- ✅ Configuração admin (validação de pesos)
- ✅ API de atualização (`PUT /api/fuzzy/pesos`)
- ⏳ Cache redis (futuro v1.1)

**Método de Validação:**
```typescript
// Normaliza automaticamente para soma = 1.0
FuzzyMotor.validarPesos(pesos)
```

**Implementado em:** `backend/src/services/fuzzy-motor.ts`

---

## 📝 EPIC 3 — Tradução de Siglas (Humanização)

Conversão de linguagem técnica para linguagem clara.

### Issue #5 — Criar dicionário de métricas traduzidas
**Status:** ✅ **CONCLUÍDO**

**Título:** `feat(dictionary): tradução de KPIs para linguagem humana`

**Dicionário com Estrutura:**
```json
{
  "CAC": {
    "tecnico": "CAC",
    "descricao": "Quanto custa conquistar um cliente",
    "john_message": "Tá caro conquistar cliente, meu amigo",
    "categoria": "Aquisição",
    "exemplo_uso": "..."
  },
  "LTV": {...},
  "CTR": {...},
  "conversao": {...},
  "ticket_medio": {...},
  "ROI": {...},
  "engajamento_geral": {...},
  "ltv_cac_ratio": {...},
  "lead_score": {...},
  "satisfacao": {...}
}
```

**Implementado em:** `backend/src/services/dicionario-metricas.ts`

### Issue #6 — API de tradução de métricas
**Status:** ✅ **CONCLUÍDO**

**Título:** `feat(api): endpoint traduzir indicadores`

**Endpoint:**
```
GET /api/metricas/{tipo}/human
GET /api/metricas?categoria=Engajamento
```

**Retorno:**
```json
{
  "tecnico": "CAC",
  "descricao": "Quanto custa conquistar um cliente",
  "john_message": "Tá caro conquistar cliente, meu amigo",
  "categoria": "Aquisição",
  "exemplo_uso": "..."
}
```

**Implementado em:** `backend/src/index.ts` (rotas) + `backend/src/services/dicionario-metricas.ts`

---

## 🤖 EPIC 4 — Integração John Brasileiro

Motor de mensagens humanizadas contextualizadas.

### Issue #7 — Criar motor de mensagens do John
**Status:** ✅ **CONCLUÍDO**

**Título:** `feat(john): engine de mensagens humanizadas`

**Objetivo:** Gerar frases baseadas em métricas.

**Exemplos de Resposta:**
- Conversão alta → "Tá fechando bonito"
- CAC alto → "Tá caro demais"
- Engajamento baixo → "Lead esfriando"
- ROI positivo → "Tá gerando grana mesmo"

**Análise por Métrica:**
- CAC < 50: "Tá barato demais"
- CAC 50-200: "Bacana, preço justo"
- CAC 200-500: "Tá subindo de mais"
- CAC > 500: "Insano, tá caríssimo"

**Implementado em:** `backend/src/services/motor-mensagens-john.ts`

### Issue #8 — Template dinâmico de narrativa
**Status:** ✅ **CONCLUÍDO**

**Título:** `feat(john): templates narrativos parametrizados`

**Templates Disponíveis:**
```
LEADS_QUENTES: "Você tem {leads} leads quentes esperando."
ROI_SUBIU: "ROI subiu {percentual}%."
CONVERSAO_BAIXA: "Conversão caiu {percentual}%."
ENGAJAMENTO_ALTO: "Engajamento tá {valor}%!"
RANKING: "Você tá em {posicao}º no ranking."
```

**API:**
```
GET /api/john/template?template=LEADS_QUENTES&leads=15
```

**Implementado em:** `backend/src/services/motor-mensagens-john.ts`

---

## 📍 EPIC 5 — Coleta de Dados Comportamentais

Tracking automático de eventos do usuário.

### Issue #9 — Tracking de eventos do usuário
**Status:** ✅ **CONCLUÍDO**

**Título:** `feat(tracking): coletor de eventos comportamento`

**Eventos Implementados:**
- ✅ `page_view` - Visualização de página
- ✅ `lead_open` - Lead aberto
- ✅ `proposal_click` - Clique em proposta
- ✅ `return_visit` - Retorno ao site
- ✅ `share_link` - Compartilhamento
- ✅ `chat_interaction` - Interação com chat
- ✅ `form_submit` - Envio de formulário
- ✅ `download` - Download
- ✅ `video_play` - Play de vídeo
- ✅ `button_click` - Clique em botão

**Estrutura:**
```typescript
interface EventoComportamento {
  id: string
  tipo: EventoTipo
  empresa_id: string
  user_id?: string
  lead_id?: string
  session_id: string
  url?: string
  referrer?: string
  user_agent?: string
  ip_address?: string
  metadata?: Record<string, any>
  timestamp: Date
  duracao_ms?: number
}
```

**Implementado em:** `backend/src/services/colesor-eventos.ts`

### Issue #10 — Middleware de captura automática
**Status:** ✅ **CONCLUÍDO**

**Título:** `feat(tracking): auto tracking frontend`

**Objetivo:** Capturar eventos sem intervenção manual.

**APIs Disponíveis:**
- ✅ `POST /api/tracking/evento` - Registra um evento
- ✅ `POST /api/tracking/batch` - Batch de eventos
- ✅ `GET /api/tracking/resumo/:user_id` - Resumo comportamental

**Helper Frontend:**
```typescript
class TrackerFrontend {
  auto_page_view(empresa_id, user_id)
  auto_click(empresa_id, user_id, elemento_id)
  auto_leave_page(empresa_id, user_id, duracao_ms)
}
```

**Implementado em:** `backend/src/services/colesor-eventos.ts`

---

## ⭐ EPIC 6 — Score de Lead Inteligente

Scoring comportamental com fuzzy logic.

### Issue #11 — Implementar lead scoring fuzzy
**Status:** ✅ **CONCLUÍDO**

**Título:** `feat(leads): scoring comportamental`

**Entrada:**
- Interações (quantidade)
- Tempo de navegação (segundos)
- Origem (direta, anuncio, referral, organico)
- Engajamento (0-100)
- Dias última atividade
- Clique em proposta (boolean)
- Compartilhamento (boolean)
- Interação com chat (0-10)

**Saída:**
- Score: 0-100
- Status: frio / morno / quente
- Confiança: 0-1
- Justificativa textual
- Próxima ação recomendada

**Limites de Score:**
- Frio: < 40 → "Reengajar em 14 dias"
- Morno: 40-70 → "Nutrir com conteúdo"
- Quente: >= 70 → "Prospeccionar agora"

**Fatores Ponderados:**
```
15% Interações
15% Tempo
10% Origem
25% Engajamento
20% Recência
15% Qualidade
```

**API:**
```
POST /api/leads/score
POST /api/leads/ranking
```

**Implementado em:** `backend/src/services/lead-scorer.ts`

---

## 📊 EPIC 7 — Dashboard Inteligente

Interface humanizada sem siglas.

### Issue #12 — Dashboard traduzido (sem siglas)
**Status:** 🚧 **EM PLANEJAMENTO**

**Título:** `feat(ui): dashboard com linguagem humana`

**Exibição Esperada:**
- "Clientes interessados" em vez de "Lead Score"
- "Campanhas funcionando" em vez de "ROI > 100%"
- "Leads esfriando" em vez de "Engajamento < 30%"

**Componentes Necessários:**
- Dashboard Vue com KPIs humanizados
- Cards com insights
- Gráficos de tendência
- Recomendações do John

**Status:** Pronto para implementação no frontend Vue

---

## 🧠 EPIC 8 — Insights Automáticos

Detecção e análise de anomalias.

### Issue #13 — Motor de insights
**Status:** ✅ **CONCLUÍDO**

**Título:** `feat(insights): geração automática`

**Detecção de Padrões:**
- ✅ Anomalias por Z-score
- ✅ Correlações entre métricas
- ✅ Padrões conhecidos (CAC alto + Conversão baixa)
- ✅ Oportunidades (Conversão acima da média)

**Exemplo de Insight Crítico:**
```
CAC alto (R$ 350) + Conversão baixa (2.5%)
→ "Funil de Vendas Compromitido"
→ "Revisa landing page, copy, call-to-action"
```

**Implementado em:** `backend/src/services/motor-insights.ts`

### Issue #14 — Prioridade de insights
**Status:** ✅ **CONCLUÍDO**

**Título:** `feat(insights): ranking importância`

**Níveis de Importância:**
- ✅ `critico` - Ação imediata necessária (ROI negativo, anomalia severa)
- ✅ `atenção` - Requer investigação (padrões ruins, tendências negativas)
- ✅ `oportunidade` - Possibilidade de growth (conversão alta, taxa positiva)

**API:**
```
POST /api/insights/analisar
POST /api/insights/anomalia
```

**Implementado em:** `backend/src/services/motor-insights.ts`

---

## 💬 EPIC 9 — Chat Inteligente do John

Conversação sobre KPIs e métricas.

### Issue #15 — John responde métricas
**Status:** ✅ **CONCLUÍDO**

**Título:** `feat(chat): perguntas sobre KPIs`

**Exemplo:**
```
Usuário: "Como está a conversão?"

John: "Conversão tá em 8%. Acima da média do mercado (5-8%).
Tá fechando bonito mesmo! Documenta essa estratégia 
e replica em outras campanhas."
```

**Integração:**
- Frontend: `JohnChat.vue` (componente Vue)
- Backend: `/api/john/gerar-mensagem` (geração de resposta)
- Store: `john.store.ts` (Pinia com histórico de chat)

**Status:** Implementado no frontend e backend

---

## 🔗 EPIC 10 — Integração Ecossistema

Unificação de dados multi-portal.

### Issue #16 — Unificar dados dos portais
**Status:** 🚧 **EM PLANEJAMENTO**

**Título:** `feat(integration): ingestão multi-portal`

**Fontes de Dados:**
- Portal Cliente (leads, propostas)
- Portal Corretor (performance, campanhas)
- Portal Marketing (métricas, automação)
- Portal Obras (dados de projetos)
- Portal Dados (data warehouse)

**Estrutura de Ingestão:**
```typescript
interface PortalData {
  portal_tipo: 'cliente' | 'corretor' | 'marketing' | 'obras' | 'dados'
  empresa_id: string
  dados: Record<string, any>
  timestamp: Date
}
```

**Próximos Passos:**
- [ ] Definir schema de integração
- [ ] Criar ETL (extract, transform, load)
- [ ] APIs de sincronização
- [ ] Validação de dados

---

## 📋 Labels Sugeridas

```
epic           # Marca EPICs
feature        # Novas funcionalidades
metrics        # Relacionado a métricas/KPIs
fuzzy          # Lógica fuzzy
john           # John Brasileiro
analytics      # Analytics e tracking
dashboard      # UI/UX
ai             # Inteligência artificial
tracking       # Tracking de eventos
bug            # Bug encontrado
enhancement    # Melhorias
documentation  # Documentação
```

---

## 🎯 Milestone Sugerido

### Milestone: GAME MKT Intelligence Engine v1.0
**Status:** ✅ **COMPLETO**

**Prazo:** 15 de Abril de 2026  
**EPICs Concluídos:** 1, 2, 3, 4, 5, 6, 8  
**EPICs Planejados:** 7, 10  
**Linha de Produção:** Pronto para produção

---

## 📈 Progresso por Epic

| Epic | Título | Concluído | Issues |
|------|--------|-----------|--------|
| 1 | Motor de Indicadores | ✅ 100% | 2/2 |
| 2 | Sistema Fuzzy | ✅ 100% | 2/2 |
| 3 | Tradução de Siglas | ✅ 100% | 2/2 |
| 4 | John Brasileiro | ✅ 100% | 2/2 |
| 5 | Tracking | ✅ 100% | 2/2 |
| 6 | Lead Scoring | ✅ 100% | 1/1 |
| 7 | Dashboard | 🚧 0% | 1/1 |
| 8 | Insights | ✅ 100% | 2/2 |
| 9 | Chat John | ✅ 100% | 1/1 |
| 10 | Integração | 🚧 0% | 1/1 |
| **TOTAL** | | **70%** | **16/18** |

---

## 🚀 Próximas Prioridades

1. **Dashboard Humanizado (EPIC 7)**
   - Implementar no Vue com KPIs humanizados
   - Cards de insights
   - Gráficos de tendência

2. **Persistência de Dados (v1.1)**
   - PostgreSQL para metrics
   - Redis para cache
   - Histórico de eventos

3. **Integração Ecossistema (EPIC 10)**
   - ETL multi-portal
   - Sincronização em tempo real
   - Data warehouse

4. **Melhorias Backend (v1.1)**
   - Testes unitários
   - Validação com Zod
   - Logs estruturados
   - Rate limiting

---

## 🌳 EPIC 11-18 — Marketing de Ecossistema Sustentável (v1.1.0)

**Status:** ✅ **IMPLEMENTADO**  
**Data:** 15 de Abril de 2026  
**Versão:** 1.1.0

### EPIC 11 — Motor de Human KPIs
**Status:** ✅ **CONCLUÍDO**

- ✅ Cálculo automático de carga de trabalho
- ✅ Score equilíbrio vida/trabalho (0-100)
- ✅ Score bem-estar consolidado
- ✅ Detecção de tendências
- ✅ Endpoints: 3

### EPIC 12 — Alertas Humanizados
**Status:** ✅ **CONCLUÍDO**

- ✅ 5 tipos de alertas (sobrecarga, cansaço, pressão, desbalanceio, melhora)
- ✅ Severidades (baixa, média, alta, crítica)
- ✅ Integração John Brasileiro
- ✅ Anti-spam (mínimo 60 min)
- ✅ Escalação automática
- ✅ Endpoint: 1

### EPIC 13 — Decision Tree de Equilíbrio
**Status:** ✅ **CONCLUÍDO**

- ✅ 5 regras implementadas
- ✅ Predição de impacto
- ✅ Priorização automática
- ✅ Simulação de resultado
- ✅ Endpoint: 1

### EPIC 14 — Gamificação Saudável
**Status:** ✅ **CONCLUÍDO**

- ✅ 8 medalhas (Parceiro Confiável, Equilíbrio, Eficiência, etc)
- ✅ Ranking saudável (não competitivo)
- ✅ Anonimização parcial
- ✅ Comparação com benchmark
- ✅ Metas realistas
- ✅ Endpoints: 2

### EPIC 15 — Dashboard Bem-Estar
**Status:** ✅ **CONCLUÍDO**

- ✅ Health score ecossistema (0-100)
- ✅ 4 componentes (equipe, fornecedores, parceiros, clientes)
- ✅ Alertas consolidadas
- ✅ Recomendações estratégicas
- ✅ Análise de tendências
- ✅ Agregação por tipo de ator
- ✅ Endpoint: 1

### EPIC 16 — Notificações Inteligentes
**Status:** ✅ **CONCLUÍDO**

- ✅ Alertas via API
- ✅ Integração John Brasileiro
- ✅ Filtro anti-spam
- ✅ Escalação automática
- ✅ 🚧 Dashboard real-time (v1.2)
- ✅ 🚧 Chat WebSocket (v1.2)

### EPIC 17 — Integração Multi-Portal
**Status:** ✅ **CONCLUÍDO**

- ✅ Suporte 4 portais (Tarefas, Marketing, Obras, Suprimentos)
- ✅ Dados consolidados
- ✅ Health score unificado
- ✅ Alertas cross-portal
- ✅ Endpoint: 1

### EPIC 18 — John Brasileiro (Bem-Estar)
**Status:** ✅ **CONCLUÍDO**

- ✅ Integrado com alertas
- ✅ Mensagens humanizadas
- ✅ Contextualização por severidade
- ✅ Sugestões de ação

---

## 📊 Resumo de Progresso

| Versão | EPICs | Issues | Status |
|--------|-------|--------|--------|
| v1.0.0 | 1-10 | 16 | 70% ✅ |
| v1.1.0 | 11-18 | 18 | 100% ✅ |
| **Total** | **18** | **34** | **85%** ✅ |

### Detalhamento v1.1.0
- ✅ 8 EPICs novos implementados
- ✅ 18 novos endpoints
- ✅ 5 novos serviços TypeScript
- ✅ 1 novo tipo de dados (wellbeing.ts)
- ✅ 0 erros TypeScript
- ✅ Build produção validado

---

**Documento Atualizado em:** 15 de Abril de 2026  
**Versão:** 1.1.0  
**Mantido por:** LICEU 6.0 - GAME MKT Intelligence Team
