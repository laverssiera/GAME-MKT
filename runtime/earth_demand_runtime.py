from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

RUNTIME_DIR = Path(__file__).resolve().parent
if str(RUNTIME_DIR) not in sys.path:
    sys.path.insert(0, str(RUNTIME_DIR))


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


def _signal(score: float) -> str:
    if score >= 0.75:
        return "positive"
    if score >= 0.55:
        return "watch"
    if score >= 0.35:
        return "attention"
    return "critical"


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


def evaluate_earth_demand(payload: dict) -> dict:
    population_size = max(_as_int(payload.get("population_size", 0)), 0)
    market_size = _clamp(_as_float(payload.get("market_size", 0.0)))
    awareness_rate = _clamp(_as_float(payload.get("awareness_rate", 0.0)))
    trial_rate = _clamp(_as_float(payload.get("trial_rate", 0.0)))
    repeat_rate = _clamp(_as_float(payload.get("repeat_rate", 0.0)))
    price_accessibility = _clamp(_as_float(payload.get("price_accessibility", 0.0)))
    competitor_pressure = _clamp(_as_float(payload.get("competitor_pressure", 0.0)))
    seasonality = _clamp(_as_float(payload.get("seasonality", 0.0)))
    normalized_population = _clamp(population_size / 10_000_000) if population_size else 0.0

    score = _clamp(
        (
            0.24 * market_size
            + 0.18 * awareness_rate
            + 0.16 * trial_rate
            + 0.15 * repeat_rate
            + 0.12 * price_accessibility
            + 0.10 * seasonality
            + 0.10 * normalized_population
            - 0.15 * competitor_pressure
        )
    )

    return {
        "market_name": payload.get("market_name", "earth_market"),
        "summary": {
            "score": round(score, 4),
            "status": _status(score),
            "signal": _signal(score),
        },
        "drivers": {
            "market_size": round(market_size, 4),
            "awareness_rate": round(awareness_rate, 4),
            "trial_rate": round(trial_rate, 4),
            "repeat_rate": round(repeat_rate, 4),
            "price_accessibility": round(price_accessibility, 4),
            "competitor_pressure": round(competitor_pressure, 4),
            "seasonality": round(seasonality, 4),
            "population_size": population_size,
        },
    }


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Earth demand runtime")
    parser.add_argument("--market-name", default="Earth Market")
    parser.add_argument("--population-size", type=int, default=3_000_000)
    parser.add_argument("--market-size", type=float, default=0.7)
    parser.add_argument("--awareness-rate", type=float, default=0.78)
    parser.add_argument("--trial-rate", type=float, default=0.68)
    parser.add_argument("--repeat-rate", type=float, default=0.72)
    parser.add_argument("--price-accessibility", type=float, default=0.7)
    parser.add_argument("--competitor-pressure", type=float, default=0.28)
    parser.add_argument("--seasonality", type=float, default=0.65)
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
    }
    print(json.dumps(evaluate_earth_demand(payload), indent=2))


if __name__ == "__main__":
    main()
