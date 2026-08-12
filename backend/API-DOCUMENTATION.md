# GAME MKT Intelligence Engine - Documentação de API

**Versão:** 1.2.0  
**Status:** Production Ready  
**Base URL:** `http://localhost:3001`

---

## 📊 EPIC 1 & 2 - Motor de Indicadores de Marketing + Sistema Fuzzy

### GET `/api/kpis/multi`
Calcula todos os KPIs padrão em um único request.

**Query Parameters:**
```
- custo_campanha (default: 5000)
- leads_gerados (default: 250)
- clientes_convertidos (default: 20)
- receita_total (default: 120000)
- cliques (default: 750)
- impressoes (default: 25000)
```

**Exemplo:**
```bash
curl "http://localhost:3001/api/kpis/multi?custo_campanha=8000&clientes_convertidos=32"
```

**Resposta:**
```json
{
  "kpis": [
    {
      "tipo": "CAC",
      "valor": 250,
      "unidade": "R$",
      "categoria": "aquisicao",
      "timestamp": "2026-04-15T10:30:00Z",
      "empresa_id": "default"
    },
    {
      "tipo": "LTV",
      "valor": 45000,
      "unidade": "R$",
      "categoria": "valor",
      "timestamp": "2026-04-15T10:30:00Z",
      "empresa_id": "default"
    },
    {
      "tipo": "CTR",
      "valor": 3.0,
      "unidade": "%",
      "categoria": "engajamento",
      "timestamp": "2026-04-15T10:30:00Z",
      "empresa_id": "default"
    },
    {
      "tipo": "conversao",
      "valor": 12.8,
      "unidade": "%",
      "categoria": "conversao",
      "timestamp": "2026-04-15T10:30:00Z",
      "empresa_id": "default"
    },
    {
      "tipo": "ticket_medio",
      "valor": 3750,
      "unidade": "R$",
      "categoria": "valor",
      "timestamp": "2026-04-15T10:30:00Z",
      "empresa_id": "default"
    },
    {
      "tipo": "ROI",
      "valor": 1400,
      "unidade": "%",
      "categoria": "valor",
      "timestamp": "2026-04-15T10:30:00Z",
      "empresa_id": "default"
    }
  ],
  "timestamp": "2026-04-15T10:30:00Z"
}
```

### POST `/api/kpis/calculate`
Calcula um KPI específico.

**Body:**
```json
{
  "tipo": "CAC",
  "custo_campanha": 5000,
  "clientes_convertidos": 20
}
```

**Resposta:**
```json
{
  "tipo": "CAC",
  "valor": 250,
  "unidade": "R$",
  "categoria": "aquisicao",
  "timestamp": "2026-04-15T10:30:00Z",
  "empresa_id": "default"
}
```

### POST `/api/fuzzy/satisfacao`
Calcula score de satisfação baseado em comportamento fuzzy.

**Body:**
```json
{
  "retorno_site": true,
  "tempo_navegacao": 420,
  "clique_proposta": true,
  "compartilhamento": true,
  "interacao_chat": 7
}
```

**Resposta:**
```json
{
  "score_satisfacao": 0.78,
  "classificacao": "alta",
  "timestamp": "2026-04-15T10:30:00Z",
  "empresa_id": "default"
}
```

### PUT `/api/fuzzy/pesos`
Atualiza pesos do modelo fuzzy (validação e normalização automática).

**Body:**
```json
{
  "retorno_site": 0.2,
  "tempo_navegacao": 0.25,
  "clique_proposta": 0.3,
  "compartilhamento": 0.15,
  "interacao_chat": 0.1
}
```

**Resposta:**
```json
{
  "message": "Pesos validados e normalizados",
  "pesos": {
    "retorno_site": 0.16,
    "tempo_navegacao": 0.2,
    "clique_proposta": 0.24,
    "compartilhamento": 0.12,
    "interacao_chat": 0.08
  }
}
```

---

## 📝 EPIC 3 - Tradução de Siglas (Humanização)

### GET `/api/metricas/{tipo}/human`
Traduz uma métrica para linguagem clara e humana.

**Exemplo:**
```bash
curl http://localhost:3001/api/metricas/CAC/human
```

**Resposta:**
```json
{
  "tecnico": "CAC",
  "descricao": "Quanto custa conquistar um cliente",
  "john_message": "Tá caro conquistar cliente, meu amigo",
  "categoria": "Aquisição",
  "exemplo_uso": "CAC atual: R$ 150. Isso significa que cada cliente novo te custa esse dinheiro."
}
```

### GET `/api/metricas`
Lista todas as métricas ou filtra por categoria.

**Query Parameters:**
```
- categoria (opcional): "Aquisição", "Valor", "Engajamento", "Conversão", etc
```

**Exemplo:**
```bash
curl "http://localhost:3001/api/metricas?categoria=Engajamento"
```

**Resposta:**
```json
[
  {
    "tecnico": "CTR",
    "descricao": "Quantos se interessaram de verdade",
    "john_message": "Seu anúncio tá chamando atenção",
    "categoria": "Engajamento",
    "exemplo_uso": "CTR: 3.5%. Significa que 3.5 de cada 100 pessoas que viram seu anúncio clicaram."
  }
]
```

---

## 🤖 EPIC 4 - Integração John Brasileiro

### POST `/api/john/gerar-mensagem`
Gera uma mensagem humanizada do John baseada em contexto de métrica.

**Body:**
```json
{
  "tipo": "conversao",
  "valor": 12,
  "unidade": "%",
  "tendencia": "subindo"
}
```

**Resposta:**
```json
{
  "mensagem": "Tá fechando muito bem mesmo. Bola de ouro!",
  "tom": "motivador",
  "emoji": "🎉",
  "acao_sugerida": "Documenta essa estratégia pra replicar em outras campanhas."
}
```

### GET `/api/john/template`
Renderiza templates parametrizados da narrativa do John.

**Query Parameters:**
```
- template: nome do template (ex: LEADS_QUENTES, ROI_SUBIU, etc)
- leads: número de leads (ex: 20)
- percentual: percentual (ex: 25)
- valor: valor (ex: 3500)
```

**Exemplo:**
```bash
curl "http://localhost:3001/api/john/template?template=LEADS_QUENTES&leads=15"
```

**Resposta:**
```json
{
  "resultado": "Você tem 15 leads quentes esperando no Portal do Corretor. Bora fechar?"
}
```

**Templates Disponíveis:**
- `LEADS_QUENTES`: "Você tem {leads} leads quentes esperando no Portal do Corretor. Bora fechar?"
- `ROI_SUBIU`: "ROI subiu {percentual}%! Tá gerando grana mesmo."
- `CONVERSAO_BAIXA`: "Conversão caiu {percentual}%. Bora revisar o funil."
- `ENGAJAMENTO_ALTO`: "Engajamento tá {valor}%! Galera tá muito interessada."
- `RANKING`: "Você tá em {posicao}º no ranking. {proximo_step}"

---

## 📚 EPIC 16 - Editorial Engine LICEU 6.0

### POST `/api/editorial/inteligencia/capturar`
Captura inteligência operacional do GAME MKT e converte em contexto editorial.

### POST `/api/editorial/obras`
Cria obra editorial no pipeline.

### GET `/api/editorial/obras`
Lista obras editoriais com filtros opcionais (`status`, `categoria`, `nivel`).

### PUT `/api/editorial/obras/:obra_id/pipeline`
Avança ou ajusta etapa do pipeline editorial.

### POST `/api/editorial/obras/:obra_id/ia-john/estruturar`
IA John gera estrutura de capítulos, quizzes e narrativa pedagógica.

### POST `/api/editorial/obras/:obra_id/colaboracao-global`
Adiciona uma origem colaborativa global (`india`, `china`, `mundo_arabe`, `ia_john`).

### POST `/api/editorial/obras/:obra_id/colaboracao-global/lote`
Adiciona múltiplas origens colaborativas em uma única operação.

**Body exemplo:**
```json
{
  "origens": ["india", "china", "mundo_arabe", "ia_john"]
}
```

### POST `/api/editorial/trilhas/gerar`
Gera trilha educacional certificável para a Academia do Saber.

### POST `/api/editorial/obras/:obra_id/publicar`
Publica obra (somente quando estiver em `diagramacao`) e incrementa versão.

### POST `/api/editorial/obras/:obra_id/distribuicao/exportar`
Gera artefatos de distribuição para biblioteca digital (PDF/EPUB/Web/Impressão).

**Body exemplo:**
```json
{
  "formatos": ["pdf", "epub", "web", "impressao_sob_demanda"]
}
```

### GET `/api/editorial/academia/biblioteca`
Retorna o catálogo de obras publicadas da Academia do Saber.

### POST `/api/editorial/analytics/aprendizado`
Retorna analytics educacional (retenção, conclusão, engajamento, evolução por turma e melhorias sugeridas por IA).

### GET `/api/editorial/resumo`
Resumo operacional editorial com ciclo do sistema e modo de persistência.

**Observação de persistência:**
- `storage_mode = "memory"` quando sem `POSTGRES_URL`/`DATABASE_URL`
- `storage_mode = "postgres"` quando banco configurado

---

## 📍 EPIC 5 - Coleta de Dados Comportamentais

### POST `/api/tracking/evento`
Registra um evento comportamental.

**Body:**
```json
{
  "tipo": "page_view",
  "empresa_id": "empresa_123",
  "user_id": "user_456",
  "session_id": "sess_123456",
  "url": "https://game-mkt.app/portals",
  "duracao_ms": 45000,
  "metadata": {
    "portal": "Portal do Corretor",
    "action": "view_leads"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "evento": {
    "id": "evt_1681234567890_abc123def",
    "tipo": "page_view",
    "empresa_id": "empresa_123",
    "user_id": "user_456",
    "session_id": "sess_123456",
    "url": "https://game-mkt.app/portals",
    "duracao_ms": 45000,
    "timestamp": "2026-04-15T10:30:00Z"
  }
}
```

**Tipos de Evento Disponíveis:**
- `page_view` - Visualização de página
- `lead_open` - Lead aberto
- `proposal_click` - Clique em proposta
- `return_visit` - Retorno ao site
- `share_link` - Compartilhamento de link
- `chat_interaction` - Interação com chat
- `form_submit` - Envio de formulário
- `download` - Download
- `video_play` - Play de vídeo
- `button_click` - Clique em botão

### POST `/api/tracking/batch`
Registra múltiplos eventos em batch.

**Body:**
```json
{
  "eventos": [
    {
      "tipo": "page_view",
      "empresa_id": "empresa_123",
      "user_id": "user_456",
      "session_id": "sess_123456",
      "url": "https://game-mkt.app",
      "timestamp": "2026-04-15T10:25:00Z"
    },
    {
      "tipo": "button_click",
      "empresa_id": "empresa_123",
      "user_id": "user_456",
      "session_id": "sess_123456",
      "metadata": { "button_id": "btn_contact" },
      "timestamp": "2026-04-15T10:26:00Z"
    }
  ]
}
```

**Resposta:**
```json
{
  "success": true,
  "total": 2,
  "eventos": [...]
}
```

### GET `/api/tracking/resumo/:user_id`
Retorna resumo comportamental consolidado de um usuário.

**Exemplo:**
```bash
curl http://localhost:3001/api/tracking/resumo/user_456
```

**Resposta:**
```json
{
  "user_id": "user_456",
  "total_eventos": 25,
  "eventos_por_tipo": {
    "page_view": 12,
    "button_click": 8,
    "chat_interaction": 3,
    "lead_open": 2,
    "proposal_click": 0,
    "return_visit": 0,
    "share_link": 0,
    "form_submit": 0,
    "download": 0,
    "video_play": 0
  },
  "tempo_total_navegacao": 2340000,
  "ultima_atividade": "2026-04-15T10:30:00Z",
  "taxa_retorno": 8.0
}
```

---

## ⭐ EPIC 6 - Score de Lead Inteligente

### POST `/api/leads/score`
Calcula o score inteligente de um lead.

**Observações da v1.2+:**
- O motor de scoring foi unificado na `brain_lib` com implementação funcional (FP).
- Após o cálculo, o backend emite o evento `lead.created` no padrão CORE-DNA.
- O fluxo retorna `john_handoff` para o John AI assumir o atendimento.

**Body:**
```json
{
  "lead_id": "lead_789",
  "total_interacoes": 12,
  "tempo_navegacao": 540,
  "origem": "organico",
  "engajamento_porcento": 75,
  "dias_ultima_atividade": 1,
  "clique_proposta": true,
  "compartilhamento": true,
  "interacao_chat": 8
}
```

**Resposta:**
```json
{
  "lead_id": "lead_789",
  "score": 87,
  "status": "quente",
  "confianca": 0.92,
  "timestamp": "2026-04-15T10:30:00Z",
  "justificativa": "Muitas interações, Tempo longo de navegação, Lead orgânico (qualidade alta), Engajamento alto, Atividade recente, Clicou na proposta, Compartilhou o conteúdo, Interagiu bastante no chat",
  "proxima_acao": "Prospeccionar agora via ligação ou Whatsapp",
  "core_dna_event": {
    "id": "evt_lh2ojmb2_y8k2m3az",
    "event_type": "lead.created",
    "version": "core-dna.v1",
    "source": "game-mkt.backend",
    "occurred_at": "2026-04-22T15:21:00.000Z",
    "trace_id": "trace_lh2ojmb2_f3n8a1ze",
    "payload": {
      "lead_id": "lead_789",
      "origem": "organico",
      "score": 87,
      "status": "quente",
      "confianca": 0.92,
      "metadata": {
        "total_interacoes": 12,
        "tempo_navegacao": 540,
        "engajamento_porcento": 75,
        "dias_ultima_atividade": 1,
        "clique_proposta": true,
        "compartilhamento": true,
        "interacao_chat": 8
      }
    }
  },
  "john_handoff": {
    "decision": {
      "action": "start_journey",
      "lead_id": "lead_789",
      "steps": ["enviar_artigo", "enviar_case", "enviar_convite", "oferta"]
    },
    "escalation": null
  }
}
```

**Status Retornados:**
- `quente` (score >= 70): Pronto para prospecção imediata
- `morno` (40 <= score < 70): Em fase de nurturing
- `frio` (score < 40): Requer reengajamento

### POST `/api/leads/ranking`
Calcula scores de múltiplos leads e retorna ranking.

**Body:**
```json
{
  "top": 10,
  "leads": [
    {
      "lead_id": "lead_001",
      "total_interacoes": 15,
      "tempo_navegacao": 600,
      "origem": "anuncio",
      "engajamento_porcento": 65,
      "dias_ultima_atividade": 2,
      "clique_proposta": true
    },
    {
      "lead_id": "lead_002",
      "total_interacoes": 8,
      "tempo_navegacao": 300,
      "origem": "referral",
      "engajamento_porcento": 50,
      "dias_ultima_atividade": 5,
      "clique_proposta": false
    }
  ]
}
```

**Resposta:**
```json
{
  "total_leads": 2,
  "ranking": [
    {
      "lead_id": "lead_001",
      "score": 72,
      "status": "quente",
      "confianca": 0.75,
      "proxima_acao": "Prospeccionar agora via ligação ou Whatsapp"
    },
    {
      "lead_id": "lead_002",
      "score": 45,
      "status": "morno",
      "confianca": 0.55,
      "proxima_acao": "Enviar email educativo, nutrir com conteúdo"
    }
  ],
  "top_lead": {
    "lead_id": "lead_001",
    "score": 72,
    "status": "quente"
  }
}
```

---

## 💡 EPIC 8 - Insights Automáticos

### POST `/api/insights/analisar`
Analisa portfólio de KPIs e gera insights inteligentes.

**Body:**
```json
{
  "kpis": [
    {
      "tipo": "CAC",
      "valor": 350,
      "unidade": "R$",
      "categoria": "aquisicao"
    },
    {
      "tipo": "conversao",
      "valor": 2.5,
      "unidade": "%",
      "categoria": "conversao"
    },
    {
      "tipo": "ROI",
      "valor": 150,
      "unidade": "%",
      "categoria": "valor"
    },
    {
      "tipo": "LTV",
      "valor": 1500,
      "unidade": "R$",
      "categoria": "valor"
    }
  ],
  "historicosPorTipo": {
    "CAC": [250, 280, 300, 320, 350],
    "conversao": [4.5, 3.8, 3.2, 2.8, 2.5]
  }
}
```

**Resposta:**
```json
{
  "total_insights": 2,
  "criticos": 1,
  "insights": [
    {
      "id": "insight_1681234567890",
      "titulo": "Funil de Vendas Comprometido",
      "descricao": "CAC alto com conversão baixa indica problema no funil de vendas",
      "tipo": "alerta",
      "nivel": "critico",
      "metricas_envolvidas": ["CAC", "conversao"],
      "valor_atual": 350,
      "valor_esperado": 200,
      "recomendacao": "Revisa landing page, copy, call-to-action e timing do pitch",
      "acao_john": "Ó, seu funil tá entupido meu amigo! CAC alto + conversão baixa = problema sério.",
      "timestamp": "2026-04-15T10:30:00Z"
    }
  ]
}
```

### POST `/api/insights/anomalia`
Detecta anomalias em uma métrica específica usando Z-score.

**Body:**
```json
{
  "metrica": "CTR",
  "valor_atual": 8.5,
  "historico": [2.1, 2.3, 2.4, 2.2, 2.5]
}
```

**Resposta:**
```json
{
  "anomalia": {
    "metrica": "CTR",
    "valor_atual": 8.5,
    "valor_medio": 2.3,
    "desvio_padrao": 0.14,
    "z_score": 43.57,
    "eh_anomalia": true
  },
  "insight": {
    "id": "insight_1681234567890",
    "titulo": "CTR SUBIU 269.6%",
    "descricao": "A métrica CTR saiu do padrão. Valor atual: 8.50, Média histórica: 2.30",
    "tipo": "anomalia",
    "nivel": "critico",
    "metricas_envolvidas": ["CTR"],
    "valor_esperado": 2.3,
    "valor_atual": 8.5,
    "recomendacao": "CTR subiu mais que o normal. Investi gra, vê se o resultado corresponde.",
    "acao_john": "Ó, CTR disparou! Algo mudou lá. Bora analisar?",
    "timestamp": "2026-04-15T10:30:00Z"
  }
}
```

---

## 📚 EPIC 16 - Editorial Engine (LICEU 6.0)

### POST `/api/editorial/inteligencia/capturar`
Captura inteligência operacional do GAME MKT para direcionar produção educacional.

**Body:**
```json
{
  "empresa_id": "liceu-6.0",
  "projeto_id": "obra-norte-01",
  "periodo_referencia": "2026-Q2",
  "comportamento_usuarios": {
    "engajamento_medio": 67,
    "retencao": 58,
    "conclusao_trilhas": 46
  },
  "metricas_obras": {
    "prazo_medio_dias": 132,
    "retrabalho_percentual": 14,
    "produtividade": 71
  },
  "kpis_marketing": {
    "cac": 210,
    "ltv": 2200,
    "ctr": 3.2,
    "conversao": 7.4,
    "roi": 180
  },
  "insights_operacionais": [
    "Necessidade de reforço em controle de qualidade",
    "Equipes com dificuldade em leitura de cronograma"
  ]
}
```

### POST `/api/editorial/obras`
Cria uma obra editorial no pipeline: proposta -> rascunho -> revisão técnica -> revisão pedagógica -> diagramação -> publicação.

**Body:**
```json
{
  "empresa_id": "liceu-6.0",
  "titulo": "Gestão de Obras Orientada por Dados",
  "descricao": "Manual técnico para engenharia e gestão de obras",
  "categoria": "gestao_de_obras",
  "nivel": "intermediario",
  "autores": ["Equipe LICEU"],
  "revisores": ["Conselho Técnico"]
}
```

### GET `/api/editorial/obras`
Lista obras com filtros opcionais por `status`, `categoria` e `nivel`.

### GET `/api/editorial/obras/:obra_id`
Busca detalhes de uma obra específica.

### PUT `/api/editorial/obras/:obra_id/pipeline`
Atualiza o status editorial.

**Body:**
```json
{
  "status": "revisao_tecnica"
}
```

### POST `/api/editorial/obras/:obra_id/ia-john/estruturar`
IA John gera capítulos, narrativa pedagógica, atividades e quizzes.

**Body:**
```json
{
  "perfil_publico": "tecnico_construcao_civil",
  "nivel_linguagem": "intermediario",
  "foco": ["didatica", "rigor_tecnico", "gamificacao"],
  "quantidade_capitulos": 6
}
```

### POST `/api/editorial/obras/:obra_id/colaboracao-global`
Registra colaboração global por origem.

**Body:**
```json
{
  "origem": "india"
}
```

**Origens disponíveis:**
- `india` (didática e simplificação)
- `china` (rigor técnico e formalização)
- `mundo_arabe` (fundamentos históricos)
- `ia_john` (integração e revisão final)

### POST `/api/editorial/trilhas/gerar`
Gera trilha educacional com progressão estruturada e certificação digital.

### POST `/api/editorial/obras/:obra_id/publicar`
Publica obra após etapa de diagramação e incrementa versão automaticamente.

### GET `/api/editorial/resumo`
Retorna visão consolidada do ciclo editorial e distribuição de pipeline.

**Nota:** o campo `storage_mode` retorna `memory` (fallback) ou `postgres` (persistência real ativa).

---

## 🏥 HEALTH CHECK

### GET `/health`
Status do servidor e EPICs disponíveis.

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-15T10:30:00Z",
  "version": "1.2.0",
  "epics": [
    "Motor de Indicadores",
    "Sistema Fuzzy",
    "Tradução de Siglas",
    "John Brasileiro",
    "Tracking",
    "Lead Scoring",
    "Insights",
    "Editorial Engine LICEU 6.0"
  ]
}
```

---

## 🔗 Integração Frontend Vue

No arquivo `src/store/john.store.ts` do frontend, adicionar:

```typescript
import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

// Exemplo: Obter KPIs
export async function buscarKPIs() {
  const response = await axios.get(`${API_URL}/kpis/multi`)
  return response.data.kpis
}

// Exemplo: Gerar mensagem John
export async function gerarMensagemJohn(tipo: string, valor: number, tendencia?: string) {
  const response = await axios.post(`${API_URL}/john/gerar-mensagem`, {
    tipo,
    valor,
    tendencia
  })
  return response.data
}

// Exemplo: Calcular lead score
export async function calcularLeadScore(leadData: any) {
  const response = await axios.post(`${API_URL}/leads/score`, leadData)
  return response.data
}

// Exemplo: Rastrear evento
export async function rastrearEvento(tipo: string, metadata?: any) {
  await axios.post(`${API_URL}/tracking/evento`, {
    tipo,
    empresa_id: 'game-mkt-001',
    user_id: 'user-123', // do contexto de autenticação
    session_id: 'sess-' + Date.now(),
    url: window.location.href,
    metadata
  })
}
```

---

## 📊 Exemplos de Casos de Uso

### Caso 1: Análise Completa de Campanha
```bash
# 1. Calcular KPIs
curl "http://localhost:3001/api/kpis/multi?custo_campanha=10000&leads_gerados=500&clientes_convertidos=40&receita_total=200000"

# 2. Traduzir resultados
curl http://localhost:3001/api/metricas/CAC/human

# 3. Gerar insights
curl -X POST http://localhost:3001/api/insights/analisar \
  -H "Content-Type: application/json" \
  -d '{...}'

# 4. Gerar mensagem John
curl -X POST http://localhost:3001/api/john/gerar-mensagem \
  -H "Content-Type: application/json" \
  -d '{"tipo":"conversao","valor":8,"tendencia":"subindo"}'
```

### Caso 2: Qualificação de Lead
```bash
# 1. Registrar eventos comportamentais
curl -X POST http://localhost:3001/api/tracking/evento \
  -H "Content-Type: application/json" \
  -d '{"tipo":"page_view","empresa_id":"emp1","user_id":"user1",...}'

# 2. Calcular lead score
curl -X POST http://localhost:3001/api/leads/score \
  -H "Content-Type: application/json" \
  -d '{"lead_id":"lead1","total_interacoes":15,...}'

# 3. Gerar ranking dos melhores leads
curl -X POST http://localhost:3001/api/leads/ranking \
  -H "Content-Type: application/json" \
  -d '{"leads":[...],"top":10}'
```

---

## 🚀 Deployment

### Desenvolvimento
```bash
cd backend
npm install
npm run dev
```

### Produção
```bash
cd backend
npm install
npm run build
npm start
```

### Docker (futuro)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

---

**Documentação Versão:** 1.2.0  
**Última Atualização:** 22 de Abril de 2026  
**Mantido por:** LICEU 6.0 - GAME MKT Intelligence Team
