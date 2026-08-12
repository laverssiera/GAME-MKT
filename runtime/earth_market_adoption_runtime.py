from __future__ import annotations

import argparse
import json


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(value, high))


def _status(score: float) -> str:
    if score >= 0.75:
        return "strong"
    if score >= 0.55:
        return "moderate"
    return "low"


def _signal(score: float) -> str:
    if score >= 0.75:
        return "positive"
    if score >= 0.55:
        return "watch"
    return "critical"


def _dimension(score: float, drivers: dict[str, float]) -> dict:
    return {
        "score": round(score, 4),
        "status": _status(score),
        "signal": _signal(score),
        "drivers": {k: round(v, 4) for k, v in drivers.items()},
    }


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Earth market adoption runtime (WAVE P15)")

    parser.add_argument("--population-size", type=int, default=1_500_000)
    parser.add_argument("--reachable-population", type=int, default=900_000)

    parser.add_argument("--awareness-rate", type=float, default=0.62)
    parser.add_argument("--trial-rate", type=float, default=0.49)
    parser.add_argument("--repeat-rate", type=float, default=0.57)
    parser.add_argument("--organic-growth", type=float, default=0.45)

    parser.add_argument("--trust-index", type=float, default=0.64)
    parser.add_argument("--utility-score", type=float, default=0.70)
    parser.add_argument("--price-accessibility", type=float, default=0.58)
    parser.add_argument("--social-proof", type=float, default=0.52)

    parser.add_argument("--campaign-reach", type=float, default=0.66)
    parser.add_argument("--campaign-quality", type=float, default=0.60)
    parser.add_argument("--campaign-frequency", type=float, default=5.0)

    parser.add_argument("--base-demand", type=float, default=0.61)
    parser.add_argument("--seasonality", type=float, default=0.54)
    parser.add_argument("--supply-friction", type=float, default=0.26)

    parser.add_argument("--basket-growth", type=float, default=0.46)
    parser.add_argument("--churn-rate", type=float, default=0.29)

    parser.add_argument("--stakeholder-alignment", type=float, default=0.63)
    parser.add_argument("--partner-activation", type=float, default=0.55)
    parser.add_argument("--regulator-support", type=float, default=0.48)
    parser.add_argument("--community-advocacy", type=float, default=0.60)

    return parser


def evaluate_earth_market_adoption(payload: dict) -> dict:
    population_size = max(int(payload.get("population_size", 0)), 0)
    reachable_population = max(int(payload.get("reachable_population", 0)), 0)
    reachable_population = min(reachable_population, population_size) if population_size else reachable_population

    awareness_rate = _clamp(float(payload.get("awareness_rate", 0.0)))
    trial_rate = _clamp(float(payload.get("trial_rate", 0.0)))
    repeat_rate = _clamp(float(payload.get("repeat_rate", 0.0)))
    organic_growth = _clamp(float(payload.get("organic_growth", 0.0)))

    trust_index = _clamp(float(payload.get("trust_index", 0.0)))
    utility_score = _clamp(float(payload.get("utility_score", 0.0)))
    price_accessibility = _clamp(float(payload.get("price_accessibility", 0.0)))
    social_proof = _clamp(float(payload.get("social_proof", 0.0)))

    campaign_reach = _clamp(float(payload.get("campaign_reach", 0.0)))
    campaign_quality = _clamp(float(payload.get("campaign_quality", 0.0)))
    campaign_frequency = max(float(payload.get("campaign_frequency", 0.0)), 0.0)
    campaign_frequency_norm = _clamp(campaign_frequency / 8.0)

    base_demand = _clamp(float(payload.get("base_demand", 0.0)))
    seasonality = _clamp(float(payload.get("seasonality", 0.0)))
    supply_friction = _clamp(float(payload.get("supply_friction", 0.0)))

    basket_growth = _clamp(float(payload.get("basket_growth", 0.0)))
    churn_rate = _clamp(float(payload.get("churn_rate", 0.0)))
    churn_resilience = _clamp(1.0 - churn_rate)

    stakeholder_alignment = _clamp(float(payload.get("stakeholder_alignment", 0.0)))
    partner_activation = _clamp(float(payload.get("partner_activation", 0.0)))
    regulator_support = _clamp(float(payload.get("regulator_support", 0.0)))
    community_advocacy = _clamp(float(payload.get("community_advocacy", 0.0)))

    market_adoption = _clamp(
        (0.35 * awareness_rate)
        + (0.25 * trial_rate)
        + (0.25 * repeat_rate)
        + (0.15 * organic_growth)
    )

    population_response = _clamp(
        (0.40 * trust_index)
        + (0.30 * utility_score)
        + (0.20 * price_accessibility)
        + (0.10 * social_proof)
    )

    campaign_impact = _clamp(
        (0.45 * campaign_reach)
        + (0.35 * campaign_quality)
        + (0.20 * campaign_frequency_norm)
    )

    demand = _clamp(
        (0.40 * base_demand)
        + (0.25 * seasonality)
        + (0.20 * campaign_impact)
        + (0.15 * (1.0 - supply_friction))
    )

    consumer_behavior = _clamp(
        (0.30 * trial_rate)
        + (0.30 * repeat_rate)
        + (0.20 * basket_growth)
        + (0.20 * churn_resilience)
    )

    stakeholder_engagement = _clamp(
        (0.40 * stakeholder_alignment)
        + (0.25 * partner_activation)
        + (0.20 * regulator_support)
        + (0.15 * community_advocacy)
    )

    overall_readiness = _clamp(
        (0.24 * market_adoption)
        + (0.18 * population_response)
        + (0.16 * campaign_impact)
        + (0.18 * demand)
        + (0.14 * consumer_behavior)
        + (0.10 * stakeholder_engagement)
    )

    expected_adopters = int(round(reachable_population * market_adoption * population_response))
    projected_demand_units = int(round(reachable_population * demand * (0.30 + (0.70 * consumer_behavior))))

    dimensions = {
        "market_adoption": _dimension(
            market_adoption,
            {
                "awareness_rate": awareness_rate,
                "trial_rate": trial_rate,
                "repeat_rate": repeat_rate,
                "organic_growth": organic_growth,
            },
        ),
        "population_response": _dimension(
            population_response,
            {
                "trust_index": trust_index,
                "utility_score": utility_score,
                "price_accessibility": price_accessibility,
                "social_proof": social_proof,
            },
        ),
        "campaign_impact": _dimension(
            campaign_impact,
            {
                "campaign_reach": campaign_reach,
                "campaign_quality": campaign_quality,
                "campaign_frequency_norm": campaign_frequency_norm,
            },
        ),
        "demand": _dimension(
            demand,
            {
                "base_demand": base_demand,
                "seasonality": seasonality,
                "supply_friction": supply_friction,
                "campaign_impact": campaign_impact,
            },
        ),
        "consumer_behavior": _dimension(
            consumer_behavior,
            {
                "trial_rate": trial_rate,
                "repeat_rate": repeat_rate,
                "basket_growth": basket_growth,
                "churn_resilience": churn_resilience,
            },
        ),
        "stakeholder_engagement": _dimension(
            stakeholder_engagement,
            {
                "stakeholder_alignment": stakeholder_alignment,
                "partner_activation": partner_activation,
                "regulator_support": regulator_support,
                "community_advocacy": community_advocacy,
            },
        ),
    }

    critical_dimensions = [
        name for name, details in dimensions.items() if details["signal"] == "critical"
    ]
    watch_dimensions = [
        name for name, details in dimensions.items() if details["signal"] == "watch"
    ]

    return {
        "wave": "P15",
        "runtime": "earth_market_adoption",
        "dimensions": dimensions,
        "summary": {
            "overall_readiness": round(overall_readiness, 4),
            "status": _status(overall_readiness),
            "signal": _signal(overall_readiness),
            "critical_dimensions": critical_dimensions,
            "watch_dimensions": watch_dimensions,
        },
        "projections": {
            "population_size": population_size,
            "reachable_population": reachable_population,
            "expected_adopters": expected_adopters,
            "projected_demand_units": projected_demand_units,
            "adoption_gap": max(reachable_population - expected_adopters, 0),
        },
    }


def main() -> None:
    args = _build_parser().parse_args()
    payload = {
        "population_size": args.population_size,
        "reachable_population": args.reachable_population,
        "awareness_rate": args.awareness_rate,
        "trial_rate": args.trial_rate,
        "repeat_rate": args.repeat_rate,
        "organic_growth": args.organic_growth,
        "trust_index": args.trust_index,
        "utility_score": args.utility_score,
        "price_accessibility": args.price_accessibility,
        "social_proof": args.social_proof,
        "campaign_reach": args.campaign_reach,
        "campaign_quality": args.campaign_quality,
        "campaign_frequency": args.campaign_frequency,
        "base_demand": args.base_demand,
        "seasonality": args.seasonality,
        "supply_friction": args.supply_friction,
        "basket_growth": args.basket_growth,
        "churn_rate": args.churn_rate,
        "stakeholder_alignment": args.stakeholder_alignment,
        "partner_activation": args.partner_activation,
        "regulator_support": args.regulator_support,
        "community_advocacy": args.community_advocacy,
    }
    result = evaluate_earth_market_adoption(payload)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()