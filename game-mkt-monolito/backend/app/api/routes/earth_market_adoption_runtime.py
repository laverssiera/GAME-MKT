from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.earth_market_adoption_runtime import (
    evaluate_earth_market_adoption,
    simulate_earth_market_adoption,
)

router = APIRouter(prefix="/api/earth-market-adoption", tags=["earth-market-adoption"])


class EarthMarketAdoptionRequest(BaseModel):
    population_size: int = Field(default=1_500_000, ge=0)
    reachable_population: int = Field(default=900_000, ge=0)

    awareness_rate: float = Field(default=0.62, ge=0, le=1)
    trial_rate: float = Field(default=0.49, ge=0, le=1)
    repeat_rate: float = Field(default=0.57, ge=0, le=1)
    organic_growth: float = Field(default=0.45, ge=0, le=1)

    trust_index: float = Field(default=0.64, ge=0, le=1)
    utility_score: float = Field(default=0.70, ge=0, le=1)
    price_accessibility: float = Field(default=0.58, ge=0, le=1)
    social_proof: float = Field(default=0.52, ge=0, le=1)

    campaign_reach: float = Field(default=0.66, ge=0, le=1)
    campaign_quality: float = Field(default=0.60, ge=0, le=1)
    campaign_frequency: float = Field(default=5.0, ge=0)

    base_demand: float = Field(default=0.61, ge=0, le=1)
    seasonality: float = Field(default=0.54, ge=0, le=1)
    supply_friction: float = Field(default=0.26, ge=0, le=1)

    basket_growth: float = Field(default=0.46, ge=0, le=1)
    churn_rate: float = Field(default=0.29, ge=0, le=1)

    stakeholder_alignment: float = Field(default=0.63, ge=0, le=1)
    partner_activation: float = Field(default=0.55, ge=0, le=1)
    regulator_support: float = Field(default=0.48, ge=0, le=1)
    community_advocacy: float = Field(default=0.60, ge=0, le=1)


class EarthMarketAdoptionSimulationRequest(EarthMarketAdoptionRequest):
    reputation_score: float = Field(default=0.81, ge=0, le=1)
    adoption_rate: float = Field(default=0.64, ge=0, le=1)
    engagement_rate: float = Field(default=0.74, ge=0, le=1)


@router.post("/evaluate")
async def evaluate(payload: EarthMarketAdoptionRequest):
    return evaluate_earth_market_adoption(payload.model_dump())


@router.post("/simulate")
async def simulate(payload: EarthMarketAdoptionSimulationRequest):
    return simulate_earth_market_adoption(payload.model_dump())
