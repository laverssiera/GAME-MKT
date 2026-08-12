from __future__ import annotations


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


def simulate_earth_market_adoption(payload: dict) -> dict:
    adoption = evaluate_earth_market_adoption(payload)

    reputation_score = _clamp(float(payload.get("reputation_score", 0.81)))
    adoption_rate = _clamp(float(payload.get("adoption_rate", 0.64)))
    engagement_rate = _clamp(float(payload.get("engagement_rate", 0.74)))

    market_score = round((reputation_score + adoption_rate + engagement_rate) / 3, 4)
    adoption_score = float(adoption["summary"]["overall_readiness"])
    consolidated_score = round((0.6 * adoption_score) + (0.4 * market_score), 4)

    return {
        "wave": "P15",
        "runtime": "earth_market_adoption_simulation",
        "modules": {
            "adoption": adoption,
            "market_context": {
                "reputation_score": reputation_score,
                "adoption_rate": adoption_rate,
                "engagement_rate": engagement_rate,
                "market_score": market_score,
            },
        },
        "summary": {
            "consolidated_score": consolidated_score,
            "status": _status(consolidated_score),
            "signal": _signal(consolidated_score),
            "critical_dimensions": adoption["summary"]["critical_dimensions"],
            "watch_dimensions": adoption["summary"]["watch_dimensions"],
        },
    }
