from pydantic import BaseModel, Field
from fastapi import APIRouter

from app.services.pricing_runtime import (
    build_bundle_offer,
    calculate_price,
    check_discount,
    forecast_pricing,
    get_market_snapshot,
    get_price_history,
    simulate_price,
)

router = APIRouter(prefix="/api/pricing", tags=["pricing"])


class PricingComponent(BaseModel):
    name: str
    amount: float = Field(gt=0)
    category: str | None = None
    quantity: int = Field(default=1, ge=1)


class PricingRequest(BaseModel):
    bundle_id: str
    components: list[PricingComponent]
    region: str = "br-sp"
    customer_profile: str = "enterprise"
    financing_months: int = Field(default=0, ge=0)
    demand_index: float = Field(default=1.0, gt=0)


class PricingSimulationRequest(PricingRequest):
    market_volatility: float = Field(default=0.06, ge=0)


class DiscountCheckRequest(BaseModel):
    customer_profile: str = "enterprise"
    requested_discount: float = Field(ge=0, le=0.9)
    current_margin: float = Field(ge=0, le=1)


class ForecastRequest(BaseModel):
    target_price: float = Field(gt=0)
    expected_margin: float = Field(gt=0, le=1)
    expected_volume: int = Field(gt=0)


@router.post("/calculate")
async def calculate(payload: PricingRequest):
    return calculate_price(**payload.model_dump())


@router.post("/simulate")
async def simulate(payload: PricingSimulationRequest):
    return simulate_price(payload.model_dump())


@router.post("/bundle")
async def bundle(payload: PricingRequest):
    return build_bundle_offer(payload.model_dump())


@router.post("/discount/check")
async def discount_check(payload: DiscountCheckRequest):
    return check_discount(payload.model_dump())


@router.get("/history/{product}")
async def history(product: str):
    return get_price_history(product)


@router.get("/market")
async def market():
    return get_market_snapshot()


@router.post("/forecast")
async def forecast(payload: ForecastRequest):
    return forecast_pricing(payload.model_dump())