#!/usr/bin/env bash

# GAME MKT Monolito Backend - API Examples
# Focus: WAVE P15 earth market adoption runtime

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8000}"

echo "[1/3] Health check"
curl -s "$BASE_URL/health" | python -m json.tool
echo

echo "[2/3] P15 evaluate"
curl -s -X POST "$BASE_URL/api/earth-market-adoption/evaluate" \
  -H "Content-Type: application/json" \
  -d '{
    "population_size": 1500000,
    "reachable_population": 900000,
    "awareness_rate": 0.62,
    "trial_rate": 0.49,
    "repeat_rate": 0.57,
    "organic_growth": 0.45,
    "trust_index": 0.64,
    "utility_score": 0.70,
    "price_accessibility": 0.58,
    "social_proof": 0.52,
    "campaign_reach": 0.66,
    "campaign_quality": 0.60,
    "campaign_frequency": 5,
    "base_demand": 0.61,
    "seasonality": 0.54,
    "supply_friction": 0.26,
    "basket_growth": 0.46,
    "churn_rate": 0.29,
    "stakeholder_alignment": 0.63,
    "partner_activation": 0.55,
    "regulator_support": 0.48,
    "community_advocacy": 0.60
  }' | python -m json.tool
echo

echo "[3/3] P15 simulate"
curl -s -X POST "$BASE_URL/api/earth-market-adoption/simulate" \
  -H "Content-Type: application/json" \
  -d '{
    "population_size": 1500000,
    "reachable_population": 900000,
    "awareness_rate": 0.62,
    "trial_rate": 0.49,
    "repeat_rate": 0.57,
    "reputation_score": 0.81,
    "adoption_rate": 0.64,
    "engagement_rate": 0.74
  }' | python -m json.tool
echo

echo "Done: P15 API examples"
