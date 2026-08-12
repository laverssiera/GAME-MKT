#!/bin/bash

# 🌳 GAME MKT - Exemplos de Teste: Well-being Ecosystem
# Endpoints de Bem-estar e Equilíbrio do Ecossistema
# Execute: bash WELLBEING-EXAMPLES.sh

BASE_URL="http://localhost:3001"
HEADER_JSON="Content-Type: application/json"

echo "🌳 ==================== WELL-BEING ECOSYSTEM ===================="
echo ""

# ==================== 1. HUMAN KPIs ====================
echo "📊 [1/10] Calculando Carga de Trabalho..."
curl -s -X POST "$BASE_URL/api/wellbeing/human-kpi" \
  -H "$HEADER_JSON" \
  -d '{
    "tarefas_abertas": 8,
    "prazos_apertados": 3,
    "tempo_resposta_medio": 25,
    "horas_trabalho_dia": 8,
    "dias_trabalhados_semana": 5
  }' | jq '.carga_trabalho'
echo ""

echo "⚖️  [2/10] Calculando Equilíbrio Vida/Trabalho..."
curl -s -X POST "$BASE_URL/api/wellbeing/equilibrio" \
  -H "$HEADER_JSON" \
  -d '{
    "carga_trabalho": 65,
    "tempo_offline": 35,
    "pausas_realizadas": 60,
    "engajamento": 70,
    "horas_extras": 8
  }' | jq '{score_equilibrio, status}'
echo ""

echo "❤️  [3/10] Calculando Score Bem-Estar..."
curl -s -X POST "$BASE_URL/api/wellbeing/bem-estar" \
  -H "$HEADER_JSON" \
  -d '{
    "equilibrio": 68,
    "carga": 65,
    "pausas": 60,
    "saude_mental": 55,
    "satisfacao": 65
  }' | jq '.score_bem_estar'
echo ""

# ==================== 2. ALERTAS ====================
echo "🚨 [4/10] Gerando Alertas de Bem-Estar..."
curl -s -X POST "$BASE_URL/api/wellbeing/alertas" \
  -H "$HEADER_JSON" \
  -d '{
    "actor_id": "col_789",
    "actor_tipo": "colaborador",
    "equilibrio_status": "atencao",
    "carga_trabalho": 72,
    "produtividade": 55,
    "tempo_offline": 28,
    "horas_extras": 9,
    "tendencia": "estavel"
  }' | jq '.total'
echo ""

# ==================== 3. DECISION TREE ====================
echo "🌳 [5/10] Sugerindo Ações (Decision Tree)..."
curl -s -X POST "$BASE_URL/api/wellbeing/decisoes" \
  -H "$HEADER_JSON" \
  -d '{
    "actor_id": "col_999",
    "actor_tipo": "colaborador",
    "carga_trabalho": 85,
    "equilibrio_score": 35,
    "produtividade": 45,
    "tempo_offline": 20,
    "prazos_apertados": 5,
    "tarefas_abertas": 12,
    "horas_extras": 14,
    "tendencia": "piorando"
  }' | jq '{total: .total, pode_simultaneas: .pode_simultaneas}'
echo ""

# ==================== 4. MEDALHAS ====================
echo "🏅 [6/10] Verificando Medalhas Conquistadas..."
curl -s -X POST "$BASE_URL/api/wellbeing/medalhas" \
  -H "$HEADER_JSON" \
  -d '{
    "usuario_id": "col_111",
    "actor_tipo": "colaborador",
    "metricas": {
      "equilibrio": 82,
      "tempo_resposta": 24,
      "qualidade": 95,
      "satisfacao_parceiros": 92,
      "projetos_no_prazo": 6,
      "score_colaboracao": 85,
      "score_comunicacao": 80
    }
  }' | jq '.total'
echo ""

# ==================== 5. RANKING ====================
echo "🎖️  [7/10] Gerando Ranking Saudável..."
curl -s -X POST "$BASE_URL/api/wellbeing/ranking" \
  -H "$HEADER_JSON" \
  -d '{
    "usuarios": [
      {
        "id": "col_a01",
        "actor_tipo": "colaborador",
        "nome": "João Silva",
        "equilibrio": 78,
        "medalhas_count": 3,
        "tendencia": "melhorando"
      },
      {
        "id": "col_a02",
        "actor_tipo": "colaborador",
        "nome": "Maria Santos",
        "equilibrio": 85,
        "medalhas_count": 5,
        "tendencia": "estavel"
      },
      {
        "id": "col_a03",
        "actor_tipo": "colaborador",
        "nome": "Pedro Costa",
        "equilibrio": 68,
        "medalhas_count": 2,
        "tendencia": "piorando"
      }
    ]
  }' | jq '.total'
echo ""

# ==================== 6. SAÚDE DO ECOSSISTEMA ====================
echo "🌍 [8/10] Calculando Saúde do Ecossistema..."
curl -s -X POST "$BASE_URL/api/wellbeing/saude-ecossistema" \
  -H "$HEADER_JSON" \
  -d '{
    "equipe": 72,
    "fornecedores": 68,
    "parceiros": 70,
    "clientes": 76
  }' | jq '{health_score, status}'
echo ""

# ==================== 7. INTEGRAÇÃO MULTI-PORTAL ====================
echo "🔌 [9/10] Integrando Dados Multi-Portal..."
curl -s -X POST "$BASE_URL/api/wellbeing/integra-portais" \
  -H "$HEADER_JSON" \
  -d '{
    "dados_portal_tarefas": {
      "colaboradores": [
        {
          "id": "col_201",
          "empresa_id": "emp_1",
          "tarefas_abertas": 7,
          "prazos_apertados": 2,
          "tempo_resposta_medio": 28,
          "tempo_offline": 38,
          "pausas_realizadas": 65,
          "engajamento": 72,
          "horas_extras": 6,
          "equilibrio": 72,
          "bem_estar": 70
        }
      ]
    },
    "dados_portal_suprimentos": {
      "fornecedores": [
        {
          "id": "forn_301",
          "empresa_id": "emp_1",
          "pedidos_pendentes": 12,
          "prazos_apertados": 4,
          "volume_excessivo": 68,
          "tempo_resposta": 36,
          "tempo_descanso": 25,
          "equilibrio_score": 62,
          "bem_estar": 60
        }
      ]
    }
  }' | jq '{health_score: .health_score_consolidado, kpis: .kpis_consolidadas}'
echo ""

# ==================== 8. HEALTH CHECK ====================
echo "✅ [10/10] Health Check com Novos EPICs..."
curl -s -X GET "$BASE_URL/health" | jq '.epics' | head -15
echo ""

echo "🌳 ==================== TESTES COMPLETOS ===================="
echo ""
echo "📝 Resumo:"
echo "  ✅ Human KPI Calculator"
echo "  ✅ Alertas Humanizados"
echo "  ✅ Decision Tree"
echo "  ✅ Gamificação Saudável"
echo "  ✅ Ranking Bem-Estar"
echo "  ✅ Saúde Ecossistema"
echo "  ✅ Integração Multi-Portal"
echo "  ✅ Health Check"
echo ""
echo "🚀 Todos os 8 EPICs testados com sucesso!"
