from __future__ import annotations


def _ice_score(impact: float, confidence: float, effort: float) -> float:
    safe_effort = max(effort, 0.1)
    return round((impact * confidence) / safe_effort, 4)


def build_growth_plan(payload: dict) -> dict:
    baseline = float(payload.get("baseline", 0))
    target = float(payload.get("target", baseline))
    horizon_days = int(payload.get("horizon_days", 90))
    budget = float(payload.get("budget", 0))
    experiments = payload.get("experiments", [])

    ranked = []
    total_score = 0.0
    for experiment in experiments:
        score = _ice_score(
            float(experiment.get("impact", 1)),
            float(experiment.get("confidence", 0.5)),
            float(experiment.get("effort", 1)),
        )
        total_score += score
        ranked.append({
            "name": experiment.get("name", "experiment"),
            "channel": experiment.get("channel", "unknown"),
            "ice_score": score,
        })

    ranked.sort(key=lambda item: item["ice_score"], reverse=True)
    for item in ranked:
        share = 0.0 if total_score == 0 else item["ice_score"] / total_score
        item["budget_share"] = round(share, 4)
        item["recommended_budget"] = round(budget * share, 2)

    return {
        "north_star_metric": payload.get("north_star_metric", "pipeline_qualificado"),
        "baseline": baseline,
        "target": target,
        "delta": round(target - baseline, 2),
        "horizon_days": horizon_days,
        "experiments": ranked,
    }


def evaluate_cycle(payload: dict) -> dict:
    expected_delta = float(payload.get("expected_delta", 0))
    observed_delta = float(payload.get("observed_delta", 0))
    burn_rate = float(payload.get("burn_rate", 0))

    achievement = 1.0 if expected_delta <= 0 else observed_delta / expected_delta
    if achievement >= 1.05 and burn_rate <= 1.0:
        decision = "scale"
    elif achievement >= 0.7:
        decision = "iterate"
    else:
        decision = "stop"

    return {
        "achievement_ratio": round(achievement, 4),
        "decision": decision,
        "next_action": {
            "scale": "Aumentar investimento em 20% na proxima sprint.",
            "iterate": "Refinar criativo e segmentacao antes da proxima rodada.",
            "stop": "Encerrar experimento e mover budget para o proximo da fila.",
        }[decision],
    }


def forecast_metric(payload: dict) -> dict:
    current = float(payload.get("current_value", 0))
    weekly_growth_rate = float(payload.get("weekly_growth_rate", 0))
    weeks = int(payload.get("weeks", 4))

    projected = current
    for _ in range(max(weeks, 0)):
        projected = projected * (1 + weekly_growth_rate)

    return {
        "current_value": round(current, 2),
        "weeks": weeks,
        "weekly_growth_rate": weekly_growth_rate,
        "projected_value": round(projected, 2),
    }