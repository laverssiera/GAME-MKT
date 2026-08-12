from fastapi import APIRouter

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/metrics")
async def get_metrics():
    """Get dashboard metrics"""
    return {
        "leads": 1200,
        "leads_qualified": 450,
        "conversion_rate": 14.5,
        "revenue": 9800000,
        "active_campaigns": 8,
        "platforms": ["WEB", "WHATSAPP", "EMAIL", "SMS"],
        "integrations": ["john", "cefeida", "archimedes", "cea"],
    }


@router.get("/realtime")
async def get_realtime_data():
    """Get realtime dashboard data"""
    return {
        "active_leads_now": 23,
        "messages_sent_today": 1240,
        "conversations_active": 45,
        "response_time_avg": 2.3,  # seconds
    }
