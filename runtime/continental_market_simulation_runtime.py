from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

RUNTIME_DIR = Path(__file__).resolve().parent
if str(RUNTIME_DIR) not in sys.path:
    sys.path.insert(0, str(RUNTIME_DIR))

from continental_campaign_runtime import plan_continental_campaign
from continental_demand_runtime import evaluate_continental_demand
from continental_market_response_runtime import evaluate_market_response


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


def simulate_continental_market(payload: dict) -> dict:
    market_payload = {
        "market_name": payload.get("market_name", "continental_market"),
        "policy_impact": _clamp(float(payload.get("policy_impact", 0.0))),
        "infrastructure_quality": _clamp(float(payload.get("infrastructure_quality", 0.0))),
        "investment_capacity": _clamp(float(payload.get("investment_capacity", 0.0))),
        "regulatory_support": _clamp(float(payload.get("regulatory_support", 0.0))),
        "consumer_trust": _clamp(float(payload.get("consumer_trust", 0.0))),
        "competitor_pressure": _clamp(float(payload.get("competitor_pressure", 0.0))),
        "population_size": max(int(payload.get("population_size", 0)), 0),
    }

    demand = evaluate_continental_demand(payload)
    response = evaluate_market_response(market_payload)
    campaign = plan_continental_campaign(
        {
            "market_name": payload.get("market_name", "continental_market"),
            "campaign_budget": max(float(payload.get("campaign_budget", 0.0)), 0.0),
            "market_signal": response["summary"]["score"],
            "demand_score": demand["summary"]["score"],
            "response_score": response["summary"]["score"],
            "campaign_channels": payload.get("campaign_channels", ["digital", "retail"]),
            "channel_count": max(len(payload.get("campaign_channels", ["digital", "retail"])), 1),
        }
    )

    overall_score = _clamp(
        0.45 * response["summary"]["score"]
        + 0.35 * demand["summary"]["score"]
        + 0.20 * campaign["summary"]["score"]
    )

    return {
        "market_name": payload.get("market_name", "continental_market"),
        "market_response": response,
        "demand": demand,
        "campaign": campaign,
        "summary": {
            "overall_score": round(overall_score, 4),
            "status": _status(overall_score),
            "signal": "positive" if overall_score >= 0.7 else "watch" if overall_score >= 0.5 else "attention",
            "scenario_question": "Se a política, a infraestrutura e o investimento acontecerem juntos, como o mercado reage?",
        },
    }


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Continental market simulation runtime")
    parser.add_argument("--market-name", default="South Atlantic Corridor")
    parser.add_argument("--policy-impact", type=float, default=0.72)
    parser.add_argument("--infrastructure-quality", type=float, default=0.68)
    parser.add_argument("--investment-capacity", type=float, default=0.7)
    parser.add_argument("--regulatory-support", type=float, default=0.65)
    parser.add_argument("--consumer-trust", type=float, default=0.61)
    parser.add_argument("--competitor-pressure", type=float, default=0.35)
    parser.add_argument("--baseline-demand", type=float, default=0.64)
    parser.add_argument("--price-accessibility", type=float, default=0.7)
    parser.add_argument("--campaign-budget", type=float, default=150000.0)
    parser.add_argument("--campaign-channels", nargs="*", default=["digital", "retail", "partners"])
    parser.add_argument("--population-size", type=int, default=3_000_000)
    return parser


def main() -> None:
    args = _build_parser().parse_args()
    payload = {
        "market_name": args.market_name,
        "policy_impact": args.policy_impact,
        "infrastructure_quality": args.infrastructure_quality,
        "investment_capacity": args.investment_capacity,
        "regulatory_support": args.regulatory_support,
        "consumer_trust": args.consumer_trust,
        "competitor_pressure": args.competitor_pressure,
        "baseline_demand": args.baseline_demand,
        "price_accessibility": args.price_accessibility,
        "campaign_budget": args.campaign_budget,
        "campaign_channels": args.campaign_channels,
        "population_size": args.population_size,
    }
    print(json.dumps(simulate_continental_market(payload), indent=2))


if __name__ == "__main__":
    main()
