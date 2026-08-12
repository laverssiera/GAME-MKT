from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.predictive_lead_ai import predict_conversion_window, rank_leads, score_lead

router = APIRouter(prefix="/api/predictive-lead-ai", tags=["predictive-lead-ai"])


class LeadSignalInput(BaseModel):
    lead_id: str
    fit_score: float = Field(default=0.5, ge=0, le=1)
    intent_score: float = Field(default=0.5, ge=0, le=1)
    engagement_score: float = Field(default=0.5, ge=0, le=1)
    recency_score: float = Field(default=0.5, ge=0, le=1)


class LeadBatchRequest(BaseModel):
    leads: list[LeadSignalInput] = Field(default_factory=list)


class ConversionWindowRequest(BaseModel):
    lead_id: str
    propensity: float = Field(default=0.5, ge=0, le=1)
    velocity: float = Field(default=0.5, ge=0, le=1)
    friction: float = Field(default=0.2, ge=0, le=1)


@router.post("/score")
async def score(payload: LeadSignalInput):
    return score_lead(payload.model_dump())


@router.post("/rank")
async def rank(payload: LeadBatchRequest):
    return rank_leads(payload.model_dump())


@router.post("/conversion-window")
async def conversion_window(payload: ConversionWindowRequest):
    return predict_conversion_window(payload.model_dump())