#!/bin/bash

# GAME MKT Intelligence Engine - Exemplos de Uso via cURL
# Este script demonstra todos os endpoints da API

set -e

BASE_URL="http://localhost:3001"

echo "🚀 GAME MKT Intelligence Engine - Exemplos de API"
echo "=================================================="
echo ""

# ==================== HEALTH CHECK ====================
echo "📊 1. Health Check"
echo "---"
curl -s $BASE_URL/health | jq .
echo ""

# ==================== KPIs ====================
echo "📈 2. Calcular todos os KPIs"
echo "---"
curl -s "$BASE_URL/api/kpis/multi?custo_campanha=5000&leads_gerados=250&clientes_convertidos=20&receita_total=120000&cliques=750&impressoes=25000" | jq .
echo ""

echo "📊 3. Calcular KPI Específico (CAC)"
echo "---"
curl -s -X POST $BASE_URL/api/kpis/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "CAC",
    "custo_campanha": 5000,
    "clientes_convertidos": 20
  }' | jq .
echo ""

# ==================== FUZZY ====================
echo "🧠 4. Calcular Satisfação Fuzzy"
echo "---"
curl -s -X POST $BASE_URL/api/fuzzy/satisfacao \
  -H "Content-Type: application/json" \
  -d '{
    "retorno_site": true,
    "tempo_navegacao": 420,
    "clique_proposta": true,
    "compartilhamento": true,
    "interacao_chat": 7
  }' | jq .
echo ""

echo "⚙️  5. Atualizar Pesos Fuzzy"
echo "---"
curl -s -X PUT $BASE_URL/api/fuzzy/pesos \
  -H "Content-Type: application/json" \
  -d '{
    "retorno_site": 0.2,
    "tempo_navegacao": 0.25,
    "clique_proposta": 0.3,
    "compartilhamento": 0.15,
    "interacao_chat": 0.1
  }' | jq .
echo ""

# ==================== DICIONÁRIO ====================
echo "📝 6. Traduzir Métrica (CAC)"
echo "---"
curl -s "$BASE_URL/api/metricas/CAC/human" | jq .
echo ""

echo "📚 7. Listar Métricas por Categoria"
echo "---"
curl -s "$BASE_URL/api/metricas?categoria=Engajamento" | jq .
echo ""

# ==================== JOHN ====================
echo "🤖 8. Gerar Mensagem do John (Conversão alta)"
echo "---"
curl -s -X POST $BASE_URL/api/john/gerar-mensagem \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "conversao",
    "valor": 12,
    "unidade": "%",
    "tendencia": "subindo"
  }' | jq .
echo ""

echo "💬 9. Renderizar Template do John"
echo "---"
curl -s "$BASE_URL/api/john/template?template=LEADS_QUENTES&leads=15" | jq .
echo ""

# ==================== TRACKING ====================
echo "📍 10. Registrar Evento de Tracking"
echo "---"
curl -s -X POST $BASE_URL/api/tracking/evento \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "page_view",
    "empresa_id": "empresa_123",
    "user_id": "user_456",
    "session_id": "sess_789",
    "url": "https://game-mkt.app/portals",
    "duracao_ms": 45000,
    "metadata": {
      "portal": "Portal do Corretor"
    }
  }' | jq .
echo ""

echo "📦 11. Registrar Batch de Eventos"
echo "---"
curl -s -X POST $BASE_URL/api/tracking/batch \
  -H "Content-Type: application/json" \
  -d '{
    "eventos": [
      {
        "tipo": "page_view",
        "empresa_id": "empresa_123",
        "user_id": "user_456",
        "session_id": "sess_789",
        "url": "https://game-mkt.app",
        "timestamp": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'",
        "duracao_ms": 30000
      },
      {
        "tipo": "button_click",
        "empresa_id": "empresa_123",
        "user_id": "user_456",
        "session_id": "sess_789",
        "metadata": {"button_id": "btn_contact"},
        "timestamp": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'"
      }
    ]
  }' | jq .
echo ""

echo "👤 12. Obter Resumo Comportamental do Usuário"
echo "---"
curl -s "$BASE_URL/api/tracking/resumo/user_456" | jq .
echo ""

# ==================== LEAD SCORING ====================
echo "⭐ 13. Calcular Lead Score"
echo "---"
curl -s -X POST $BASE_URL/api/leads/score \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "lead_789",
    "total_interacoes": 15,
    "tempo_navegacao": 540,
    "origem": "organico",
    "engajamento_porcento": 75,
    "dias_ultima_atividade": 1,
    "clique_proposta": true,
    "compartilhamento": true,
    "interacao_chat": 8
  }' | jq .
echo ""

echo "🏆 14. Ranking de Leads"
echo "---"
curl -s -X POST $BASE_URL/api/leads/ranking \
  -H "Content-Type: application/json" \
  -d '{
    "top": 5,
    "leads": [
      {
        "lead_id": "lead_001",
        "total_interacoes": 15,
        "tempo_navegacao": 600,
        "origem": "organico",
        "engajamento_porcento": 75,
        "dias_ultima_atividade": 1,
        "clique_proposta": true,
        "compartilhamento": true,
        "interacao_chat": 8
      },
      {
        "lead_id": "lead_002",
        "total_interacoes": 8,
        "tempo_navegacao": 300,
        "origem": "anuncio",
        "engajamento_porcento": 50,
        "dias_ultima_atividade": 5,
        "clique_proposta": false,
        "compartilhamento": false,
        "interacao_chat": 2
      },
      {
        "lead_id": "lead_003",
        "total_interacoes": 2,
        "tempo_navegacao": 60,
        "origem": "referral",
        "engajamento_porcento": 20,
        "dias_ultima_atividade": 15,
        "clique_proposta": false,
        "compartilhamento": false,
        "interacao_chat": 0
      }
    ]
  }' | jq .
echo ""

# ==================== INSIGHTS ====================
echo "💡 15. Analisar Portfólio de KPIs (Gerar Insights)"
echo "---"
curl -s -X POST $BASE_URL/api/insights/analisar \
  -H "Content-Type: application/json" \
  -d '{
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
  }' | jq .
echo ""

echo "🔍 16. Detectar Anomalias"
echo "---"
curl -s -X POST $BASE_URL/api/insights/anomalia \
  -H "Content-Type: application/json" \
  -d '{
    "metrica": "CTR",
    "valor_atual": 8.5,
    "historico": [2.1, 2.3, 2.4, 2.2, 2.5]
  }' | jq .
echo ""

echo ""
echo "✅ Exemplos de API concluídos!"
echo "================================"
echo ""
echo "Documentação: /backend/API-DOCUMENTATION.md"
echo "Roadmap: /ROADMAP.md"
echo ""
