def analyze_competitors(payload: dict) -> dict:
    competitors = payload.get("competitors", [])
    
    return {
        "analyzed_competitors": len(competitors),
        "market_position": "Challenger",
        "key_differentiators": ["Brand", "Technology"],
        "price_index": 1.05
    }
