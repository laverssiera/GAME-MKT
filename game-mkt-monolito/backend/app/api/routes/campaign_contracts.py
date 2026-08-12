from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.campaign_contracts import create_contract, sign_contract, validate_contract

router = APIRouter(prefix="/api/campaign-contracts", tags=["campaign-contracts"])


class ClauseInput(BaseModel):
    name: str
    value: str


class ContractCreateRequest(BaseModel):
    campaign_id: str
    name: str = "Contrato de Campanha"
    budget: float = Field(gt=0)
    duration_days: int = Field(default=30, ge=1)
    channels: list[str] = Field(default_factory=list)
    objectives: list[str] = Field(default_factory=list)
    north_star_metric: str = "pipeline_qualificado"
    brand_policy: str = "manual_padrao_v1"


class ContractValidationRequest(BaseModel):
    clauses: list[ClauseInput] = Field(default_factory=list)


class ContractSignRequest(BaseModel):
    contract_id: str
    budget: float = Field(gt=0)
    delegated_limit: float = Field(default=300_000, gt=0)


@router.post("/draft")
async def draft_contract(payload: ContractCreateRequest):
    return create_contract(payload.model_dump())


@router.post("/validate")
async def validate_campaign_contract(payload: ContractValidationRequest):
    return validate_contract(payload.model_dump())


@router.post("/sign")
async def sign_campaign_contract(payload: ContractSignRequest):
    return sign_contract(payload.model_dump())