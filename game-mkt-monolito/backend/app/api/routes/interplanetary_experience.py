from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.observability.logger import log_error
from app.services.interplanetary_experience import (
    create_experience,
    list_catalog,
    purchase_experience,
    simulate_experience,
)
from app.services.interplanetary_telemetry import get_snapshot

router = APIRouter(prefix="/api/interplanetary/experience", tags=["interplanetary-experience"])


class InterplanetaryExperienceCreateRequest(BaseModel):
    title: str
    scenario: str = "morar_em_marte"
    location: str = "mars"
    base_price: float = Field(default=0, ge=0)
    currency: str = "BRL"
    duration_minutes: int = Field(default=45, ge=5, le=240)


class InterplanetaryExperienceSimulateRequest(BaseModel):
    experience_id: str
    immersion_level: float = Field(default=0.7, ge=0, le=1)
    emotional_engagement: float = Field(default=0.7, ge=0, le=1)
    technical_friction: float = Field(default=0.2, ge=0, le=1)


class InterplanetaryExperiencePurchaseRequest(BaseModel):
    experience_id: str
    customer_id: str
    buyer_tier: str = "standard"


def _resolve_event_bus():
    try:
        from app.events.bus import get_event_bus

        return get_event_bus()
    except Exception as event_bus_error:
        log_error("Event bus unavailable", error=str(event_bus_error))
        return None


async def _publish_best_effort(subject: str, payload: dict):
    try:
        event_bus = _resolve_event_bus()
        if event_bus is None:
            return
        await event_bus.publish(subject, payload)
    except Exception as event_error:
        log_error("Failed to publish interplanetary event", subject=subject, error=str(event_error))


@router.post("/create")
async def create(payload: InterplanetaryExperienceCreateRequest):
    result = create_experience(payload.model_dump())
    await _publish_best_effort(
        "gamemkt.holographic.experience.started",
        {
            "experience_id": result["experience_id"],
            "title": result["title"],
            "scenario": result["scenario"],
            "location": result["location"],
            "status": result["status"],
        },
    )
    return result


@router.post("/simulate")
async def simulate(payload: InterplanetaryExperienceSimulateRequest):
    try:
        result = simulate_experience(payload.model_dump())
        await _publish_best_effort(
            "gamemkt.holographic.city.visited",
            {
                "experience_id": result["experience_id"],
                "immersion_score": result["immersion_score"],
                "projected_conversion": result["projected_conversion"],
            },
        )
        return result
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err)) from err


@router.post("/purchase")
async def purchase(payload: InterplanetaryExperiencePurchaseRequest):
    try:
        result = purchase_experience(payload.model_dump())
        await _publish_best_effort(
            "gamemkt.sales.closed",
            {
                "sale_id": result["sale_id"],
                "experience_id": result["experience_id"],
                "customer_id": result["customer_id"],
                "final_price": result["final_price"],
                "currency": result["currency"],
            },
        )
        return result
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err)) from err


@router.get("/catalog")
async def catalog():
    return list_catalog()


@router.get("/telemetry")
async def telemetry():
    return get_snapshot()
