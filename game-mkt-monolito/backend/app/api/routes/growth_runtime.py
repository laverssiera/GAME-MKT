from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.growth_runtime import build_growth_plan, evaluate_cycle, forecast_metric

router = APIRouter(prefix="/api/growth-runtime", tags=["growth-runtime"])


class GrowthExperimentInput(BaseModel):
    name: str
    channel: str = "unknown"
    impact: float = Field(default=1, gt=0)
    confidence: float = Field(default=0.5, ge=0, le=1)
    effort: float = Field(default=1, gt=0)


class GrowthPlanRequest(BaseModel):
    north_star_metric: str = "pipeline_qualificado"
    baseline: float = Field(ge=0)
    target: float = Field(ge=0)
    horizon_days: int = Field(default=90, ge=1)
    budget: float = Field(default=0, ge=0)
    experiments: list[GrowthExperimentInput] = Field(default_factory=list)


class GrowthCycleRequest(BaseModel):
    expected_delta: float = Field(ge=0)
    observed_delta: float
    burn_rate: float = Field(default=1, ge=0)


class GrowthForecastRequest(BaseModel):
    current_value: float = Field(ge=0)
    weekly_growth_rate: float
    weeks: int = Field(default=4, ge=0)


@router.post("/plan")
async def plan(payload: GrowthPlanRequest):
    return build_growth_plan(payload.model_dump())


@router.post("/cycle/evaluate")
async def evaluate(payload: GrowthCycleRequest):
    return evaluate_cycle(payload.model_dump())


@router.post("/forecast")
async def forecast(payload: GrowthForecastRequest):
    return forecast_metric(payload.model_dump())