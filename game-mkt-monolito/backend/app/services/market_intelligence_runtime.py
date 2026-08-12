def analyze_market(payload: dict) -> dict:
    segment = payload.get("segment", "general")
    region = payload.get("region", "global")
    
    return {
        "segment": segment,
        "region": region,
        "trend_score": 0.85,
        "opportunities": [
            "High demand for AI tools",
            "Untapped niche in specialized automation"
        ],
        "threats": [
            "Increasing competition",
            "Price wars"
        ],
        "recommended_action": "Invest in product differentiation"
    }
