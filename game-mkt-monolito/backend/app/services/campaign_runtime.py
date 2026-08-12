def create_campaign(payload: dict) -> dict:
    name = payload.get("name", "Untitled Campaign")
    budget = float(payload.get("budget", 0))
    channels = payload.get("channels", ["email"])
    
    return {
        "campaign_id": f"cmp_{hash(name) % 10000}",
        "name": name,
        "status": "draft",
        "budget": budget,
        "channels": channels,
        "message": "Campaign created successfully"
    }
