# 🌳 EPIC 11-18: Marketing de Ecossistema Sustentável

**Status:** ✅ Production Ready v1.1.0  
**Versão:** 1.1.0 (Novo)  
**EPICs:** 8 novos (11-18) + 6 existentes = 18 EPICs total  

---

## 📋 Visão Geral

Implementação de um sistema completo de **bem-estar e equilíbrio** para toda a cadeia de stakeholders (colaboradores, fornecedores, parceiros, clientes). 

**Objetivo:** Medir e otimizar produtividade COM qualidade de vida.

---

## 🎯 EPICs Implementados

### EPIC 11: Motor de Human KPIs
**Issues:** 2/2 ✅

Cria indicadores de bem-estar sem perguntar diretamente.

**Endpoints:**
- `POST /api/wellbeing/human-kpi` - Calcula carga de trabalho automaticamente
- `POST /api/wellbeing/equilibrio` - Calcula score equilíbrio vida/trabalho
- `POST /api/wellbeing/bem-estar` - Score consolidado bem-estar

**Lógica:**
- Carga trabalho: baseada em tarefas abertas, prazos, tempo resposta
- Equilíbrio: 30% carga inversa + 30% tempo offline + 20% pausas + 10% engajamento + 10% horas extras
- Bem-estar: consolidação de 5 fatores com ponderação customizável

**Exemplo:**
```bash
curl -X POST http://localhost:3001/api/wellbeing/human-kpi \
  -H "Content-Type: application/json" \
  -d '{
    "tarefas_abertas": 5,
    "prazos_apertados": 2,
    "tempo_resposta_medio": 30,
    "horas_trabalho_dia": 8,
    "dias_trabalhados_semana": 5
  }'
```

---

### EPIC 12: Alertas Humanizados de Bem-Estar
**Issues:** 2/2 ✅

Motor de alertas contextualizado por ator + John Brasileiro.

**Endpoints:**
- `POST /api/wellbeing/alertas` - Gera alertas baseados em contexto

**Tipos de Alertas:**
1. **Sobrecarga** (carga > 80%) → severidade crítica/alta
2. **Cansaço** (tempo offline < 20h + horas extras > 10) → severidade alta
3. **Pressão** (produtividade caindo + tendência piorando) → severidade crítica
4. **Desbalanceio** (tendência piorando) → severidade média
5. **Melhora** (tendência melhorando + equilibrio saudável) → severidade baixa/motivação

**Integração John:**
```
Crítico: "Ó! {nome} tá em situação crítica. {mensagem}. Bora atuar?"
Alta: "{nome}, presta atenção: {mensagem}"
Média: "{nome}, só dando um toque: {mensagem}"
```

---

### EPIC 13: Decision Tree de Equilíbrio
**Issues:** 2/2 ✅

Árvore de decisão com 5 regras principais:

**Endpoints:**
- `POST /api/wellbeing/decisoes` - Sugere ações automáticas

**Regras Implementadas:**

```
REGRA 1: SE carga > 80% E produtividade < 40% E piorando
         ENTÃO: Redistribuir 30% tarefas
         
REGRA 2: SE horas_extras > 15 E tempo_offline < 30h
         ENTÃO: Pausar novas tarefas
         
REGRA 3: SE prazos_apertados > 5
         ENTÃO: Ampliar prazos 15-20%
         
REGRA 4: SE equilibrio < 30%
         ENTÃO: Aumentar recursos imediatamente
         
REGRA 5: SE tendencia = melhorando E equilibrio > 50%
         ENTÃO: Manter estratégia, monitorar
```

**Predição de Impacto:**
- Estima redução de carga
- Melhoria de equilíbrio
- Melhoria de produtividade
- Confiança (0-1)

**Priorização:**
- Crítica > Alta > Média > Baixa
- Máximo 2 tipos diferentes de ações simultâneas

---

### EPIC 14: Gamificação Saudável
**Issues:** 2/2 ✅

Reconhecimento e ranking NÃO competitivo.

**Endpoints:**
- `POST /api/wellbeing/medalhas` - Verifica conquistas
- `POST /api/wellbeing/ranking` - Ranking saudável (anonimizado parcialmente)

**8 Medalhas Implementadas:**

| Medalha | Critério | Categoria |
|---------|----------|-----------|
| 🤝 Parceiro Confiável | 5 projetos no prazo + satisfação > 90% | Colaboração |
| ⚖️ Equipe Equilibrada | Equilíbrio >= 80 por 4 semanas | Equilíbrio |
| ⚡ Fornecedor Eficiente | Tempo resposta < 24h + qualidade >= 95% | Eficiência |
| 🌱 Herói Sustentabilidade | Ajudou 3+ colegas a melhorar | Sustentabilidade |
| 🧠 Mentalidade Equilíbrio | Promove bem-estar | Equilíbrio |
| 💪 Colaboração Genuína | 3+ parcerias + feedback positivo | Colaboração |
| 🌟 Começo Positivo | Equilíbrio melhorou 20+ pontos | Equilíbrio |
| 💬 Comunicação Clara | 5+ conversas bem-estar | Colaboração |

**Ranking Saudável:**
- Score: 70% equilíbrio + 20% medalhas + 10% tendência
- Ordem: Equilíbrio > Medalhas > Tendência
- Anonimização parcial (só mostra própria posição pública)
- Sem competição agressiva

---

### EPIC 15: Dashboard Bem-Estar
**Issues:** 2/2 ✅

Painel consolidado de saúde do ecossistema.

**Endpoints:**
- `POST /api/wellbeing/saude-ecossistema` - Health score geral
- Agregação de dados por tipo de ator

**Health Score:**
- 35% equipe
- 25% fornecedores  
- 25% parceiros
- 15% clientes

**Status:**
- Excelente: >= 80
- Bom: >= 65
- Atenção: >= 50
- Crítico: < 50

**Saídas:**
- Health score consolidado (0-100)
- Status discreto
- Alertas por componente
- Recomendações estratégicas
- Tendências de mudança

---

### EPIC 16: Notificações Inteligentes
**Issues:** 1/1 ✅

Alertas disparados em múltiplos canais.

**Implementado Em:**
1. ✅ API `/api/wellbeing/alertas`
2. ✅ Integração com John Brasileiro (mensagens humanizadas)
3. 🚧 Dashboard real-time (v1.2)
4. 🚧 Chat WebSocket (v1.2)

**Filtro Anti-Spam:**
- Alertas similares: mínimo 60 minutos entre
- Escalação automática se não resolvido
- Priorização por severidade

---

### EPIC 17: Integração Multi-Portal
**Issues:** 1/1 ✅

Coleta dados de toda cadeia de operações.

**Endpoints:**
- `POST /api/wellbeing/integra-portais` - Unifica dados

**Portais Suportados:**
1. **Portal Tarefas** - Colaboradores, tarefas abertas
2. **Portal Marketing** - Campanhas, leads, engajamento
3. **Portal Obras** - Projetos, prazos, cronograma
4. **Portal Suprimentos** - Fornecedores, pedidos, SLAs

**Dados Consolidados:**
- KPIs unificadas por ator
- Health score consolidado
- Alertas centralizadas
- Cross-portal insights

**Exemplo:**
```bash
curl -X POST http://localhost:3001/api/wellbeing/integra-portais \
  -H "Content-Type: application/json" \
  -d '{
    "dados_portal_tarefas": {
      "colaboradores": [
        {
          "id": "col_123",
          "tarefas_abertas": 5,
          "prazos_apertados": 2,
          "tempo_offline": 40,
          "tempo_resposta_medio": 30
        }
      ]
    },
    "dados_portal_suprimentos": {
      "fornecedores": [
        {
          "id": "forn_456",
          "pedidos_pendentes": 10,
          "prazos_apertados": 5,
          "volume_excessivo": 75,
          "tempo_resposta": 48
        }
      ]
    }
  }'
```

---

## 📊 Tipos de Dados

### HumanKPI
```typescript
{
  id: string
  actor_id: string
  actor_tipo: 'colaborador' | 'fornecedor' | 'parceiro' | 'cliente'
  empresa_id: string
  
  // Carga
  carga_trabalho: number // 0-100%
  tarefas_abertas: number
  prazos_apertados: number
  tempo_resposta_medio: number // minutos
  
  // Bem-estar
  tempo_offline: number // horas/semana
  pausas_realizadas: number
  engajamento_voluntario: number // 0-100
  horas_extras_estimadas: number
  
  // Métricas
  equilibrio: number // 0-100
  score_bem_estar: number // 0-100
  tendencia: 'melhorando' | 'estavel' | 'piorando'
  
  created_at: Date
}
```

### AlertaBemEstar
```typescript
{
  id: string
  tipo: 'sobrecarga' | 'cansaco' | 'pressao' | 'desbalanceio'
  actor_id: string
  actor_tipo: ActorTipo
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  mensagem: string
  acao_sugerida: string
  timestamp: Date
  lido: boolean
}
```

### SuggestaoAcao
```typescript
{
  id: string
  tipo: 'redistribuir' | 'pausar' | 'ampliar_prazo' | 'aumentar_recursos'
  condicoes: string[]
  acao: string
  impacto_esperado: string
  prioridade: 'baixa' | 'media' | 'alta'
  timestamp: Date
}
```

### EcossistemaSaude
```typescript
{
  health_score: number // 0-100
  status: 'excelente' | 'bom' | 'atencao' | 'critico'
  timestamp: Date
  componentes: {
    equipe: number
    fornecedores: number
    parceiros: number
    clientes: number
  }
  alertas: string[]
  recomendacoes: string[]
}
```

---

## 🔌 API Endpoints Novos

### Human KPIs
```
POST /api/wellbeing/human-kpi
POST /api/wellbeing/equilibrio  
POST /api/wellbeing/bem-estar
```

### Alertas
```
POST /api/wellbeing/alertas
```

### Decision Tree
```
POST /api/wellbeing/decisoes
```

### Gamificação
```
POST /api/wellbeing/medalhas
POST /api/wellbeing/ranking
```

### Saúde Ecossistema
```
POST /api/wellbeing/saude-ecossistema
POST /api/wellbeing/integra-portais
```

---

## 🎓 Exemplos de Uso

### 1. Calcular bem-estar colaborador
```bash
curl -X POST http://localhost:3001/api/wellbeing/bem-estar \
  -H "Content-Type: application/json" \
  -d '{
    "equilibrio": 75,
    "carga": 40,
    "pausas": 70,
    "saude_mental": 60,
    "satisfacao": 65
  }'
# Resposta: { score_bem_estar: 68, timestamp: ... }
```

### 2. Obter alertas de bem-estar
```bash
curl -X POST http://localhost:3001/api/wellbeing/alertas \
  -H "Content-Type: application/json" \
  -d '{
    "actor_id": "col_123",
    "actor_tipo": "colaborador",
    "equilibrio_status": "sobrecarga",
    "carga_trabalho": 85,
    "produtividade": 30,
    "tempo_offline": 15,
    "horas_extras": 15,
    "tendencia": "piorando"
  }'
# Resposta: { alertas: [...], total: 3 }
```

### 3. Sugerir ações de rebalanceamento
```bash
curl -X POST http://localhost:3001/api/wellbeing/decisoes \
  -H "Content-Type: application/json" \
  -d '{
    "carga_trabalho": 90,
    "equilibrio_score": 25,
    "produtividade": 35,
    "tarefas_abertas": 15,
    "tendencia": "piorando"
  }'
# Resposta: { sugestoes: [...], total: 3, pode_simultaneas: true }
```

### 4. Obter ranking saudável
```bash
curl -X POST http://localhost:3001/api/wellbeing/ranking \
  -H "Content-Type: application/json" \
  -d '{
    "usuarios": [
      {
        "id": "col_123",
        "actor_tipo": "colaborador",
        "nome": "João",
        "equilibrio": 75,
        "medalhas_count": 3,
        "tendencia": "melhorando"
      },
      {
        "id": "col_456",
        "actor_tipo": "colaborador",
        "nome": "Maria",
        "equilibrio": 82,
        "medalhas_count": 2,
        "tendencia": "estavel"
      }
    ]
  }'
# Resposta: { ranking: [...], total: 2, categoria: "todos" }
```

### 5. Saúde geral do ecossistema
```bash
curl -X POST http://localhost:3001/api/wellbeing/saude-ecossistema \
  -H "Content-Type: application/json" \
  -d '{
    "equipe": 72,
    "fornecedores": 68,
    "parceiros": 70,
    "clientes": 75
  }'
# Resposta: { health_score: 71, status: "bom", alertas: [], ... }
```

---

## 📈 Fluxo de Uso Recomendado

1. **Coleta de Dados** (Integração Multi-Portal)
   ```
   POST /api/wellbeing/integra-portais
   ```

2. **Cálculo de Métricas** (Human KPIs)
   ```
   POST /api/wellbeing/human-kpi
   POST /api/wellbeing/equilibrio
   POST /api/wellbeing/bem-estar
   ```

3. **Geração de Alertas**
   ```
   POST /api/wellbeing/alertas
   ```

4. **Sugestão de Ações**
   ```
   POST /api/wellbeing/decisoes
   ```

5. **Dashboard & Ranking**
   ```
   POST /api/wellbeing/saude-ecossistema
   POST /api/wellbeing/ranking
   POST /api/wellbeing/medalhas
   ```

6. **John Comunica** (Integrado em alertas)
   ```
   Motor de mensagens já integrado
   ```

---

## 🛠️ Serviços Backend

### 1. HumanKPICalculator
- `calcularCargaTrabalho()` - Carga automática
- `calcularEquilibrio()` - Score 0-100
- `calcularBemEstar()` - Consolidação
- `detectarTendencia()` - Tendência de mudança
- `compararComBenchmark()` - Comparação grupo

### 2. MotorAlertasHumanos
- `gerar()` - Gera alertas contextualizados
- `deveEnviar()` - Anti-spam
- `escalar()` - Escalação automática
- `formatarParaJohn()` - Formatação John

### 3. MotorDecisaoHumano
- `decidir()` - Decision tree com 5 regras
- `avaliarImpacto()` - Predição de impacto
- `priorizarAcoes()` - Ordenação por prioridade
- `preverResultado()` - Simulação de resultado

### 4. GamificacaoSaudavel
- `verificarConquista()` - Verifica 8 medalhas
- `gerarRankingSaudavel()` - Ranking não competitivo
- `mensagemConquista()` - Personalização
- `compararComGrupo()` - Benchmark
- `sugerirMetaEquilibrio()` - Meta realista

### 5. MotorSaudeEcossistema
- `calcularSaudeEcossistema()` - Health score geral
- `analisarTendencias()` - Análise temporal
- `simularImpacto()` - Simulação de ações
- `agRegarPorAtor()` - Agregação dashboard
- `unificarDadosMultiPortal()` - Consolidação

---

## 🚀 Deploy & Configuração

### Backend
```bash
cd backend
npm install
npm run build
npm run start
```

### Health Check
```bash
curl http://localhost:3001/health
```

### Versão
```
1.1.0 - 14 EPICs (8 novos)
```

---

## 📌 Status por EPIC

| EPIC | Issues | Status |
|------|--------|--------|
| 11 - Human KPIs | 2/2 | ✅ Completo |
| 12 - Alertas Humanizados | 2/2 | ✅ Completo |
| 13 - Decision Tree | 2/2 | ✅ Completo |
| 14 - Gamificação | 2/2 | ✅ Completo |
| 15 - Dashboard | 2/2 | ✅ Completo |
| 16 - Notificações | 1/1 | ✅ Completo |
| 17 - Integração | 1/1 | ✅ Completo |
| 18 - John (Bem-estar) | - | ✅ Integrado |

---

## 🎯 v1.2 Roadmap

- [ ] Dashboard Vue com gráficos
- [ ] WebSocket real-time
- [ ] Persistência PostgreSQL
- [ ] Avatar 3D GLB
- [ ] Integração HubSpot/Salesforce
- [ ] Relatórios exportáveis

---

**Desenvolvido com ❤️ para LICEU 6.0**
