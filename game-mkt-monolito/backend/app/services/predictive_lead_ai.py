from __future__ import annotations


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(value, high))


def score_lead(payload: dict) -> dict:
    fit_score = float(payload.get("fit_score", 0.5))
    intent_score = float(payload.get("intent_score", 0.5))
    engagement_score = float(payload.get("engagement_score", 0.5))
    recency_score = float(payload.get("recency_score", 0.5))

    weighted = (
        (fit_score * 0.35)
        + (intent_score * 0.30)
        + (engagement_score * 0.20)
        + (recency_score * 0.15)
    )
    propensity = _clamp(weighted, 0.0, 1.0)
    score = int(round(propensity * 100))

    if score >= 80:
        band = "hot"
        action = "encaminhar_para_vendas_imediatamente"
    elif score >= 55:
        band = "warm"
        action = "ativar_cadencia_personalizada"
    else:
        band = "cold"
        action = "nutrir_com_conteudo_educacional"

    return {
        "lead_id": payload.get("lead_id"),
        "propensity": round(propensity, 4),
        "score": score,
        "band": band,
        "recommended_action": action,
    }


def rank_leads(payload: dict) -> dict:
    leads = payload.get("leads", [])
    scored = [score_lead(item) for item in leads]
    scored.sort(key=lambda item: item["score"], reverse=True)

    return {
        "total": len(scored),
        "leaders": scored,
        "top_3": scored[:3],
    }


def predict_conversion_window(payload: dict) -> dict:
    propensity = float(payload.get("propensity", 0.5))
    velocity = float(payload.get("velocity", 0.5))
    friction = float(payload.get("friction", 0.2))

    raw_days = 60 * (1 - propensity) + 30 * (1 - velocity) + 30 * friction
    days = int(round(_clamp(raw_days, 3, 120)))
    confidence = _clamp(0.85 - (friction * 0.4), 0.35, 0.92)

    return {
        "lead_id": payload.get("lead_id"),
        "conversion_window_days": days,
        "confidence": round(confidence, 4),
    }