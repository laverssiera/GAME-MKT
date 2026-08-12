#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8000}"

if ! command -v curl >/dev/null 2>&1; then
  echo "Erro: curl nao encontrado no PATH."
  exit 1
fi

extract_json_field() {
  local json="$1"
  local field="$2"
  python3 - "$json" "$field" <<'PY'
import json
import sys

payload = json.loads(sys.argv[1])
field = sys.argv[2]
value = payload.get(field)
if value is None:
    raise SystemExit(1)
print(value)
PY
}

print_step() {
  local message="$1"
  echo
  echo "==> ${message}"
}

print_step "1/7 Criando minuta de contrato"
DRAFT_RESPONSE=$(curl -sS -X POST "$BASE_URL/api/campaign-contracts/draft" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "camp-2026-001",
    "name": "Contrato Campanha Condominio Inteligente",
    "budget": 250000,
    "duration_days": 90,
    "channels": ["ads", "email", "whatsapp"],
    "objectives": ["mql", "sql"],
    "north_star_metric": "pipeline_qualificado",
    "brand_policy": "manual_padrao_v1"
  }')

echo "$DRAFT_RESPONSE"
CONTRACT_ID=$(extract_json_field "$DRAFT_RESPONSE" "contract_id") || {
  echo "Erro: nao foi possivel extrair contract_id da resposta.";
  exit 1;
}

echo "contract_id capturado: $CONTRACT_ID"

print_step "2/7 Validando clausulas obrigatorias"
VALIDATE_RESPONSE=$(curl -sS -X POST "$BASE_URL/api/campaign-contracts/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "clauses": [
      {"name": "escopo", "value": "Ativar canais"},
      {"name": "sla_operacao", "value": "Resposta em ate 8h"},
      {"name": "metrica_sucesso", "value": "pipeline_qualificado"},
      {"name": "compliance_marca", "value": "manual_padrao_v1"},
      {"name": "politica_orcamento", "value": "Cap mensal BRL 83333"}
    ]
  }')

echo "$VALIDATE_RESPONSE"

print_step "3/7 Assinando contrato"
SIGN_RESPONSE=$(curl -sS -X POST "$BASE_URL/api/campaign-contracts/sign" \
  -H "Content-Type: application/json" \
  -d "{
    \"contract_id\": \"$CONTRACT_ID\",
    \"budget\": 250000,
    \"delegated_limit\": 300000
  }")

echo "$SIGN_RESPONSE"

print_step "4/7 Gerando plano de growth"
PLAN_RESPONSE=$(curl -sS -X POST "$BASE_URL/api/growth-runtime/plan" \
  -H "Content-Type: application/json" \
  -d '{
    "north_star_metric": "pipeline_qualificado",
    "baseline": 120,
    "target": 240,
    "horizon_days": 90,
    "budget": 100000,
    "experiments": [
      {"name": "Lookalike", "channel": "ads", "impact": 8, "confidence": 0.7, "effort": 2},
      {"name": "SEO cluster", "channel": "seo", "impact": 6, "confidence": 0.8, "effort": 3}
    ]
  }')

echo "$PLAN_RESPONSE"

print_step "5/7 Pontuando lead individual"
SCORE_RESPONSE=$(curl -sS -X POST "$BASE_URL/api/predictive-lead-ai/score" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "lead-001",
    "fit_score": 0.9,
    "intent_score": 0.8,
    "engagement_score": 0.7,
    "recency_score": 0.9
  }')

echo "$SCORE_RESPONSE"

print_step "6/7 Rankeando lote de leads"
RANK_RESPONSE=$(curl -sS -X POST "$BASE_URL/api/predictive-lead-ai/rank" \
  -H "Content-Type: application/json" \
  -d '{
    "leads": [
      {"lead_id": "lead-001", "fit_score": 0.9, "intent_score": 0.8, "engagement_score": 0.7, "recency_score": 0.9},
      {"lead_id": "lead-002", "fit_score": 0.6, "intent_score": 0.5, "engagement_score": 0.6, "recency_score": 0.4},
      {"lead_id": "lead-003", "fit_score": 0.3, "intent_score": 0.2, "engagement_score": 0.4, "recency_score": 0.3}
    ]
  }')

echo "$RANK_RESPONSE"

print_step "7/7 Prevendo janela de conversao"
WINDOW_RESPONSE=$(curl -sS -X POST "$BASE_URL/api/predictive-lead-ai/conversion-window" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "lead-001",
    "propensity": 0.83,
    "velocity": 0.75,
    "friction": 0.2
  }')

echo "$WINDOW_RESPONSE"

echo
echo "Fluxo completo executado com sucesso."
