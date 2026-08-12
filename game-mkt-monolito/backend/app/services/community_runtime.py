def measure_community_health(payload: dict) -> dict:
    active_users = payload.get("active_users", 0)
    engagement_rate = float(payload.get("engagement_rate", 0))
    
    health_score = (engagement_rate * 100)
    
    return {
        "active_users": active_users,
        "engagement_rate": engagement_rate,
        "health_score": round(health_score, 2),
        "status": "Healthy" if health_score >= 50 else "Needs Attention"
    }
