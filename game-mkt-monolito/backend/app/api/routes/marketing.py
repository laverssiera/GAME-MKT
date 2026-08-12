from fastapi import APIRouter
from pydantic import BaseModel

from app.services.campaign_runtime import create_campaign
from app.services.lead_scoring_runtime import score_lead
from app.services.market_intelligence_runtime import analyze_market

router = APIRouter()

class CampaignRequest(BaseModel):
    name: str = "New Campaign"
    budget: float = 0.0
    channels: list[str] = ["email"]

class LeadScoreRequest(BaseModel):
    lead_id: str
    profile_fit: float = 0.5
    intent_level: float = 0.5
    behavioral_score: float = 0.5

class MarketAnalyzeRequest(BaseModel):
    segment: str = "general"
    region: str = "global"

@router.post("/campaign/create")
async def create_campaign_endpoint(payload: CampaignRequest):
    return create_campaign(payload.model_dump())

@router.post("/lead/score")
async def score_lead_endpoint(payload: LeadScoreRequest):
    return score_lead(payload.model_dump())

@router.post("/market/analyze")
async def analyze_market_endpoint(payload: MarketAnalyzeRequest):
    return analyze_market(payload.model_dump())

@router.get("/dashboard")
async def get_dashboard():
    return {
        "active_campaigns": 5,
        "total_leads_generated": 1500,
        "average_lead_score": 0.75,
        "revenue_attributed": 50000.0,
        "top_performing_channel": "email",
        "market_trend": "positive"
    }
