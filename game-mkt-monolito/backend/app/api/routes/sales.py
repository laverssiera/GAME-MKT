import json
import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import FederationIdentityKey, SalesOpportunity, SalesProposal
from app.observability.logger import log_info
from app.services.pricing_runtime import calculate_price
from app.services.sales_runtime import STAGE_WEIGHTS, cross_sell, forecast, renewal

router = APIRouter(prefix="/api/sales", tags=["sales"])


class PricingComponentInput(BaseModel):
    name: str
    amount: float = Field(gt=0)
    category: str | None = None
    quantity: int = Field(default=1, ge=1)


class OpportunityRequest(BaseModel):
    lead_id: str
    origin: str = "unknown"
    estimated_value: float = Field(gt=0)
    stage: str = "qualified"


class ProposalRequest(BaseModel):
    opportunity_id: str
    bundle_id: str | None = None
    price: float = Field(gt=0)
    discount: float = Field(default=0, ge=0, le=0.9)
    components: list[PricingComponentInput] = Field(default_factory=list)


class NegotiateRequest(BaseModel):
    proposal_id: str
    requested_discount: float = Field(default=0, ge=0, le=0.9)
    risk_score: float = Field(default=0.2, ge=0, le=1)


class CloseRequest(BaseModel):
    opportunity_id: str
    outcome: str = "won"
    contract_value: float | None = Field(default=None, gt=0)


class ForecastRequest(BaseModel):
    opportunities: list[dict[str, Any]] = Field(default_factory=list)


class RenewalRequest(BaseModel):
    customer_id: str
    contract_value: float = Field(gt=0)
    uplift: float = Field(default=0.06, ge=0, le=1)


class CrossSellRequest(BaseModel):
    customer_id: str
    current_products: list[str] = Field(default_factory=list)
    recommended_products: list[str] = Field(default_factory=list)


# ── helpers ──────────────────────────────────────────────────────────────────

def _serialize_opportunity(opp: SalesOpportunity) -> dict:
    return {
        "opportunity_id": opp.id,
        "lead_id": opp.lead_id,
        "origin": opp.origin,
        "stage": opp.stage,
        "estimated_value": float(opp.estimated_value),
        "contract_value": float(opp.contract_value) if opp.contract_value else None,
        "close_probability": float(opp.close_probability) if opp.close_probability else None,
        "federation_profile_id": opp.federation_profile_id,
        "closed_at": opp.closed_at.isoformat() if opp.closed_at else None,
        "created_at": opp.created_at.isoformat() if opp.created_at else None,
    }


def _serialize_proposal(prop: SalesProposal) -> dict:
    return {
        "proposal_id": prop.id,
        "opportunity_id": prop.opportunity_id,
        "bundle_id": prop.bundle_id,
        "price": float(prop.price),
        "discount": float(prop.discount) if prop.discount else 0,
        "approval_required": prop.approval_required,
        "status": prop.status,
        "requested_discount": float(prop.requested_discount) if prop.requested_discount else None,
        "risk_score": float(prop.risk_score) if prop.risk_score else None,
        "pricing_snapshot": json.loads(prop.pricing_snapshot) if prop.pricing_snapshot else None,
        "created_at": prop.created_at.isoformat() if prop.created_at else None,
    }


# ── routes ───────────────────────────────────────────────────────────────────

@router.post("/opportunity")
async def opportunity(payload: OpportunityRequest, db: Session = Depends(get_db)):
    opportunity_id = str(uuid.uuid4())
    stage = payload.stage
    close_prob = round(STAGE_WEIGHTS.get(stage, 0.2) * 100, 1)

    # Link to federation profile when lead_id matches a known identity key
    fed_profile_id = None
    for candidate_key in [f"email:{payload.lead_id}", f"external_id:{payload.lead_id}"]:
        row = db.query(FederationIdentityKey).filter(FederationIdentityKey.key_value == candidate_key).first()
        if row:
            fed_profile_id = str(row.profile_id)
            break

    opp = SalesOpportunity(
        id=opportunity_id,
        lead_id=payload.lead_id,
        origin=payload.origin,
        stage=stage,
        estimated_value=payload.estimated_value,
        close_probability=close_prob,
        federation_profile_id=fed_profile_id,
    )
    db.add(opp)
    db.commit()
    log_info("Sales opportunity created", opportunity_id=opportunity_id, lead_id=payload.lead_id)
    return _serialize_opportunity(opp)


@router.post("/proposal")
async def proposal(payload: ProposalRequest, db: Session = Depends(get_db)):
    opp = db.query(SalesOpportunity).filter(SalesOpportunity.id == payload.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Auto-price from pricing engine when components are provided
    pricing_snapshot = None
    if payload.components:
        pricing_snapshot = calculate_price(
            bundle_id=payload.bundle_id or "adhoc",
            components=[c.model_dump() for c in payload.components],
        )
        price = pricing_snapshot["final_price"]
    else:
        price = payload.price

    discount = float(payload.discount)
    proposal_id = str(uuid.uuid4())
    prop = SalesProposal(
        id=proposal_id,
        opportunity_id=payload.opportunity_id,
        bundle_id=payload.bundle_id,
        price=price,
        discount=discount,
        approval_required=discount > 0.1,
        status="draft",
        pricing_snapshot=json.dumps(pricing_snapshot) if pricing_snapshot else None,
    )
    db.add(prop)
    db.commit()
    log_info("Sales proposal created", proposal_id=proposal_id, opportunity_id=payload.opportunity_id)
    return _serialize_proposal(prop)


@router.post("/negotiate")
async def negotiate_proposal(payload: NegotiateRequest, db: Session = Depends(get_db)):
    prop = db.query(SalesProposal).filter(SalesProposal.id == payload.proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    rd = float(payload.requested_discount)
    rs = float(payload.risk_score)
    if rd <= 0.1 and rs < 0.4:
        decision = "approved"
    elif rd <= 0.15 and rs < 0.6:
        decision = "approval_required"
    else:
        decision = "rejected"

    prop.status = decision
    prop.requested_discount = rd
    prop.risk_score = rs
    db.commit()
    return _serialize_proposal(prop)


@router.post("/close")
async def close(payload: CloseRequest, db: Session = Depends(get_db)):
    opp = db.query(SalesOpportunity).filter(SalesOpportunity.id == payload.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    opp.stage = payload.outcome
    if payload.contract_value:
        opp.contract_value = payload.contract_value
    opp.closed_at = datetime.now(UTC)
    db.commit()
    return _serialize_opportunity(opp)


@router.post("/forecast")
async def sales_forecast(payload: ForecastRequest, db: Session = Depends(get_db)):
    if payload.opportunities:
        items = payload.opportunities
    else:
        rows = db.query(SalesOpportunity).all()
        items = [{"estimated_value": float(r.estimated_value), "stage": r.stage} for r in rows]
    return forecast({"opportunities": items})


@router.post("/renewal")
async def sales_renewal(payload: RenewalRequest):
    return renewal(payload.model_dump())


@router.post("/cross-sell")
async def sales_cross_sell(payload: CrossSellRequest):
    return cross_sell(payload.model_dump())
