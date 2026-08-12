from fastapi import APIRouter
from pydantic import BaseModel

from app.services.holographic_commerce import HolographicCommerce

router = APIRouter(prefix="/api/interplanetary", tags=["interplanetary-runtime"])


class HolographicExperienceRequest(BaseModel):
    type: str | None = None


@router.post("/holographic/experience")
async def create_holographic_experience(payload: HolographicExperienceRequest):
    runtime = HolographicCommerce()
    return runtime.create_experience(payload.model_dump())
