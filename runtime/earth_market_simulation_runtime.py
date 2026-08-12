from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

RUNTIME_DIR = Path(__file__).resolve().parent
if str(RUNTIME_DIR) not in sys.path:
    sys.path.insert(0, str(RUNTIME_DIR))

from earth_demand_runtime import evaluate_earth_demand
from earth_market_response_runtime import evaluate_market_response


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(value, high))


def _status(score: float) -> str:
    if score >= 0.8:
        return "accelerating"
    if score >= 0.65:
        return "positive"
    if score >= 0.5:
        return "watch"
    return "stabilizing"


def simulate_earth_market(payload: dict) -> dict:
    demand = evaluate_earth_demand(payload)
    response = evaluate_market_response(
        {
            "market_name": payload.get("market_name", "earth_market"),
            "policy_impact": _clamp(float(payload.get("policy_impact", 0.0))),
            "infrastructure_quality": _clamp(float(payload.get("infrastructure_quality", 0.0))),
            "investment_capacity": _clamp(float(payload.get("investment_capacity", 0.0))),
            "regulatory_support": _clamp(float(payload.get("regulatory_support", 0.0))),
            "consumer_trust": _clamp(float(payload.get("consumer_trust", 0.0))),
            "competitor_pressure": _clamp(float(payload.get("competitor_pressure", 0.0))),
            "population_size": max(int(payload.get("population_size", 0)), 0),
        }
    )

    campaign_budget = max(float(payload.get("campaign_budget", 0.0)), 0.0)
    channels = payload.get("campaign_channels", ["digital", "retail"])
    channel_score = _clamp(len(channels) / 3.0)
    campaign_score = _clamp((0.65 * min(campaign_budget / 250000.0, 1.0)) + (0.35 * channel_score))

    overall_score = _clamp(
        0.50 * demand["summary"]["score"]
        + 0.40 * response["summary"]["score"]
        + 0.10 * campaign_score
    )

    return {
        "market_name": payload.get("market_name", "earth_market"),
        "demand": demand,
        "market_response": response,
        "campaign": {
            "score": round(campaign_score, 4),
            "recommended_budget": round(campaign_budget, 2),
            "channels": list(channels),
        },
        "summary": {
            "overall_score": round(overall_score, 4),
            "status": _status(overall_score),
            "signal": "positive" if overall_score >= 0.7 else "watch" if overall_score >= 0.5 else "attention",
            "scenario_question": "Se a demanda, a infraestrutura e o investimento evoluírem juntos, como a resposta de mercado se comporta?",
        },
    }


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Earth market simulation runtime")
    parser.add_argument("--market-name", default="Earth Market")
    parser.add_argument("--population-size", type=int, default=3_000_000)
    parser.add_argument("--market-size", type=float, default=0.7)
    parser.add_argument("--awareness-rate", type=float, default=0.78)
    parser.add_argument("--trial-rate", type=float, default=0.68)
    parser.add_argument("--repeat-rate", type=float, default=0.72)
    parser.add_argument("--price-accessibility", type=float, default=0.7)
    parser.add_argument("--competitor-pressure", type=float, default=0.28)
    parser.add_argument("--seasonality", type=float, default=0.65)
    parser.add_argument("--policy-impact", type=float, default=0.82)
    parser.add_argument("--infrastructure-quality", type=float, default=0.76)
    parser.add_argument("--investment-capacity", type=float, default=0.84)
    parser.add_argument("--regulatory-support", type=float, default=0.73)
    parser.add_argument("--consumer-trust", type=float, default=0.7)
    parser.add_argument("--campaign-budget", type=float, default=180000.0)
    parser.add_argument("--campaign-channels", nargs="*", default=["digital", "retail", "partners"])
    return parser


def main() -> None:
    args = _build_parser().parse_args()
    payload = {
        "market_name": args.market_name,
        "population_size": args.population_size,
        "market_size": args.market_size,
        "awareness_rate": args.awareness_rate,
        "trial_rate": args.trial_rate,
        "repeat_rate": args.repeat_rate,
        "price_accessibility": args.price_accessibility,
        "competitor_pressure": args.competitor_pressure,
        "seasonality": args.seasonality,
        "policy_impact": args.policy_impact,
        "infrastructure_quality": args.infrastructure_quality,
        "investment_capacity": args.investment_capacity,
        "regulatory_support": args.regulatory_support,
        "consumer_trust": args.consumer_trust,
        "campaign_budget": args.campaign_budget,
        "campaign_channels": args.campaign_channels,
    }
    print(json.dumps(simulate_earth_market(payload), indent=2))


if __name__ == "__main__":
    main()
