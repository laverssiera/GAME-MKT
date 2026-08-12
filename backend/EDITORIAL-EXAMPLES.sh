#!/usr/bin/env bash

# GAME MKT - Exemplos de uso da Editora LICEU 6.0
# Requer backend em execução em http://localhost:3001

set -e

API_URL="http://localhost:3001"

echo "=============================================="
echo "📚 GAME MKT Editorial Engine - LICEU 6.0"
echo "=============================================="

echo ""
echo "1) Capturando inteligência operacional"
INTEL_RESPONSE=$(curl -s -X POST "$API_URL/api/editorial/inteligencia/capturar" \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": "liceu-6.0",
    "projeto_id": "obra-central-2026",
    "periodo_referencia": "2026-Q2",
    "comportamento_usuarios": {
      "engajamento_medio": 64,
      "retencao": 52,
      "conclusao_trilhas": 49
    },
    "metricas_obras": {
      "prazo_medio_dias": 118,
      "retrabalho_percentual": 16,
      "produtividade": 73
    },
    "kpis_marketing": {
      "cac": 210,
      "ltv": 2600,
      "ctr": 3.8,
      "conversao": 7.9,
      "roi": 185
    },
    "insights_operacionais": [
      "Padronizar leitura de cronograma",
      "Fortalecer qualidade de execução"
    ]
  }')
echo "$INTEL_RESPONSE"

INTEL_ID=$(echo "$INTEL_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d '"' -f4)

echo ""
echo "2) Criando obra editorial"
OBRA_RESPONSE=$(curl -s -X POST "$API_URL/api/editorial/obras" \
  -H "Content-Type: application/json" \
  -d "{
    \"empresa_id\": \"liceu-6.0\",
    \"titulo\": \"Manual Integrado de Gestão de Obras com IA\",
    \"subtitulo\": \"Do KPI ao conhecimento aplicado\",
    \"descricao\": \"Material estruturado para engenharia e gestão de obras\",
    \"categoria\": \"gestao_de_obras\",
    \"nivel\": \"intermediario\",
    \"autores\": [\"Academia do Saber\", \"John Brasileiro\"],
    \"revisores\": [\"Conselho Técnico\"],
    \"inteligencia_origem_id\": \"$INTEL_ID\"
  }")
echo "$OBRA_RESPONSE"

OBRA_ID=$(echo "$OBRA_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d '"' -f4)

echo ""
echo "3) Estruturando conteúdo com IA John"
curl -s -X POST "$API_URL/api/editorial/obras/$OBRA_ID/ia-john/estruturar" \
  -H "Content-Type: application/json" \
  -d '{
    "perfil_publico": "tecnico_construcao_civil",
    "nivel_linguagem": "intermediario",
    "foco": ["didatica", "rigor_tecnico", "fundamentos_historicos", "gamificacao"],
    "quantidade_capitulos": 6
  }'

echo ""
echo ""
echo "4) Registrando colaboração global (Índia e China)"
curl -s -X POST "$API_URL/api/editorial/obras/$OBRA_ID/colaboracao-global" \
  -H "Content-Type: application/json" \
  -d '{ "origem": "india" }'
echo ""
curl -s -X POST "$API_URL/api/editorial/obras/$OBRA_ID/colaboracao-global" \
  -H "Content-Type: application/json" \
  -d '{ "origem": "china" }'

echo ""
echo ""
echo "4.1) Registrando colaboracao global em lote"
curl -s -X POST "$API_URL/api/editorial/obras/$OBRA_ID/colaboracao-global/lote" \
  -H "Content-Type: application/json" \
  -d '{ "origens": ["mundo_arabe", "ia_john"] }'

echo ""
echo ""
echo "5) Avançando pipeline para revisão técnica"
curl -s -X PUT "$API_URL/api/editorial/obras/$OBRA_ID/pipeline" \
  -H "Content-Type: application/json" \
  -d '{ "status": "revisao_tecnica" }'

echo ""
echo ""
echo "6) Gerando trilha educacional"
curl -s -X POST "$API_URL/api/editorial/trilhas/gerar" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Trilha Profissional em Gestão de Obras",
    "categoria": "gestao_de_obras",
    "publico_alvo": "técnicos e engenheiros",
    "nivel": "intermediario"
  }'

echo ""
echo ""
echo "7) Resumo do sistema editorial"
curl -s "$API_URL/api/editorial/resumo"

echo ""
echo ""
echo "8) Avancando pipeline para revisao pedagogica"
curl -s -X PUT "$API_URL/api/editorial/obras/$OBRA_ID/pipeline" \
  -H "Content-Type: application/json" \
  -d '{ "status": "revisao_pedagogica" }'

echo ""
echo ""
echo "9) Avancando pipeline para diagramacao"
curl -s -X PUT "$API_URL/api/editorial/obras/$OBRA_ID/pipeline" \
  -H "Content-Type: application/json" \
  -d '{ "status": "diagramacao" }'

echo ""
echo ""
echo "10) Publicando obra"
curl -s -X POST "$API_URL/api/editorial/obras/$OBRA_ID/publicar"

echo ""
echo ""
echo "11) Exportando distribuicao da obra"
curl -s -X POST "$API_URL/api/editorial/obras/$OBRA_ID/distribuicao/exportar" \
  -H "Content-Type: application/json" \
  -d '{ "formatos": ["pdf", "epub", "web", "impressao_sob_demanda"] }'

echo ""
echo ""
echo "12) Analytics de aprendizado"
curl -s -X POST "$API_URL/api/editorial/analytics/aprendizado" \
  -H "Content-Type: application/json" \
  -d '{ "periodo_referencia": "2026-Q2" }'

echo ""
echo ""
echo "13) Biblioteca digital da Academia do Saber"
curl -s "$API_URL/api/editorial/academia/biblioteca"

echo ""
echo ""
echo "✅ Fluxo editorial concluído"