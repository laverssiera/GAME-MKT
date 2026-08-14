from __future__ import annotations

import argparse
import json


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(value, high))


def _status(score: float) -> str:
    if score >= 0.8:
        return "accelerating"
    if score >= 0.6:
        return "positive"
    if score >= 0.45:
        return "watch"
    return "stabilizing"


def _as_float(value, default: float = 0.0) -> float:
    if value is None or value == "":
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _as_int(value, default: int = 0) -> int:
    if value is None or value == "":
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def evaluate_market_response(payload: dict) -> dict:
    policy_impact = _clamp(_as_float(payload.get("policy_impact", 0.0)))
    infrastructure_quality = _clamp(_as_float(payload.get("infrastructure_quality", 0.0)))
    investment_capacity = _clamp(_as_float(payload.get("investment_capacity", 0.0)))
    regulatory_support = _clamp(_as_float(payload.get("regulatory_support", 0.0)))
    consumer_trust = _clamp(_as_float(payload.get("consumer_trust", 0.0)))
    competitor_pressure = _clamp(_as_float(payload.get("competitor_pressure", 0.0)))
    population_size = max(_as_int(payload.get("population_size", 0)), 0)
    normalized_population = _clamp(population_size / 10_000_000) if population_size else 0.0

    score = _clamp(
        (
            0.30 * policy_impact
            + 0.20 * infrastructure_quality
            + 0.20 * investment_capacity
            + 0.15 * regulatory_support
            + 0.15 * consumer_trust
            + 0.10 * normalized_population
            - 0.20 * competitor_pressure
        )
    )

    return {
        "market_name": payload.get("market_name", "earth_market"),
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
            "population_size": population_size,
        },
        "reaction": {
            "market_signal": "demand expands rapidly" if score >= 0.75 else "demand grows steadily" if score >= 0.55 else "demand remains fragile",
            "scenario_note": "If policy, infrastructure and capital land together, the market responds with clear momentum.",
        },
    }


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Earth market response runtime")
    parser.add_argument("--market-name", default="Earth Market")
    parser.add_argument("--policy-impact", type=float, default=0.82)
    parser.add_argument("--infrastructure-quality", type=float, default=0.76)
    parser.add_argument("--investment-capacity", type=float, default=0.84)
    parser.add_argument("--regulatory-support", type=float, default=0.73)
    parser.add_argument("--consumer-trust", type=float, default=0.7)
    parser.add_argument("--competitor-pressure", type=float, default=0.3)
    parser.add_argument("--population-size", type=int, default=3_500_000)
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
        "population_size": args.population_size,
    }
    print(json.dumps(evaluate_market_response(payload), indent=2))


if __name__ == "__main__":
    main()
