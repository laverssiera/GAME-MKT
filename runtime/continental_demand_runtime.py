from __future__ import annotations

import argparse
import json


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(value, high))


def _status(score: float) -> str:
    if score >= 0.8:
        return "strong"
    if score >= 0.6:
        return "stable"
    if score >= 0.4:
        return "watch"
    return "fragile"


def evaluate_continental_demand(payload: dict) -> dict:
    policy_impact = _clamp(float(payload.get("policy_impact", 0.0)))
    infrastructure_quality = _clamp(float(payload.get("infrastructure_quality", 0.0)))
    investment_capacity = _clamp(float(payload.get("investment_capacity", 0.0)))
    regulatory_support = _clamp(float(payload.get("regulatory_support", 0.0)))
    consumer_trust = _clamp(float(payload.get("consumer_trust", 0.0)))
    competitor_pressure = _clamp(float(payload.get("competitor_pressure", 0.0)))
    baseline_demand = _clamp(float(payload.get("baseline_demand", 0.0)))
    price_accessibility = _clamp(float(payload.get("price_accessibility", 0.0)))

    score = _clamp(
        (
            0.24 * policy_impact
            + 0.18 * infrastructure_quality
            + 0.18 * investment_capacity
            + 0.14 * regulatory_support
            + 0.12 * consumer_trust
            + 0.08 * baseline_demand
            + 0.10 * price_accessibility
            - 0.16 * competitor_pressure
        )
    )

    return {
        "market_name": payload.get("market_name", "continental_market"),
        "summary": {
            "score": round(score, 4),
            "status": _status(score),
            "signal": "positive" if score >= 0.7 else "watch" if score >= 0.45 else "attention",
        },
        "drivers": {
            "policy_impact": round(policy_impact, 4),
            "infrastructure_quality": round(infrastructure_quality, 4),
            "investment_capacity": round(investment_capacity, 4),
            "regulatory_support": round(regulatory_support, 4),
            "consumer_trust": round(consumer_trust, 4),
            "competitor_pressure": round(competitor_pressure, 4),
            "baseline_demand": round(baseline_demand, 4),
            "price_accessibility": round(price_accessibility, 4),
        },
    }


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Continental demand runtime")
    parser.add_argument("--policy-impact", type=float, default=0.72)
    parser.add_argument("--infrastructure-quality", type=float, default=0.68)
    parser.add_argument("--investment-capacity", type=float, default=0.7)
    parser.add_argument("--regulatory-support", type=float, default=0.65)
    parser.add_argument("--consumer-trust", type=float, default=0.61)
    parser.add_argument("--competitor-pressure", type=float, default=0.35)
    parser.add_argument("--baseline-demand", type=float, default=0.64)
    parser.add_argument("--price-accessibility", type=float, default=0.7)
    return parser


def main() -> None:
    args = _build_parser().parse_args()
    payload = {
        "policy_impact": args.policy_impact,
        "infrastructure_quality": args.infrastructure_quality,
        "investment_capacity": args.investment_capacity,
        "regulatory_support": args.regulatory_support,
        "consumer_trust": args.consumer_trust,
        "competitor_pressure": args.competitor_pressure,
        "baseline_demand": args.baseline_demand,
        "price_accessibility": args.price_accessibility,
    }
    print(json.dumps(evaluate_continental_demand(payload), indent=2))


if __name__ == "__main__":
    main()
