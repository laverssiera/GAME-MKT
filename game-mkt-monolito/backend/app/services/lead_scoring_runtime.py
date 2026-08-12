def score_lead(payload: dict) -> dict:
    profile_fit = float(payload.get("profile_fit", 0.5))
    intent_level = float(payload.get("intent_level", 0.5))
    behavioral_score = float(payload.get("behavioral_score", 0.5))
    
    overall_score = (profile_fit * 0.4) + (intent_level * 0.4) + (behavioral_score * 0.2)
    overall_score = min(max(overall_score, 0.0), 1.0)
    
    tier = "D"
    if overall_score >= 0.8:
        tier = "A"
    elif overall_score >= 0.6:
        tier = "B"
    elif overall_score >= 0.4:
        tier = "C"

    return {
        "lead_id": payload.get("lead_id", "unknown"),
        "overall_score": round(overall_score, 2),
        "tier": tier,
        "recommendation": "Sales touch" if tier in ["A", "B"] else "Nurture"
    }
