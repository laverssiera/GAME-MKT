from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4


OPPORTUNITIES: dict[str, dict] = {}
PROPOSALS: dict[str, dict] = {}

STAGE_WEIGHTS = {
    "qualified": 0.25,
    "discovery": 0.35,
    "proposal": 0.55,
    "negotiation": 0.72,
    "won": 1.0,
    "lost": 0.0,
}


def _now() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def create_opportunity(payload: dict) -> dict:
    opportunity_id = str(uuid4())
    stage = payload.get("stage", "qualified")
    estimated_value = float(payload.get("estimated_value", 0))
    opportunity = {
        "opportunity_id": opportunity_id,
        "lead_id": payload["lead_id"],
        "origin": payload.get("origin", "unknown"),
        "stage": stage,
        "estimated_value": estimated_value,
        "close_probability": round(STAGE_WEIGHTS.get(stage, 0.2) * 100, 1),
        "created_at": _now(),
    }
    OPPORTUNITIES[opportunity_id] = opportunity
    return opportunity


def generate_proposal(payload: dict) -> dict:
    proposal_id = str(uuid4())
    discount = float(payload.get("discount", 0))
    proposal = {
        "proposal_id": proposal_id,
        "opportunity_id": payload["opportunity_id"],
        "bundle_id": payload.get("bundle_id"),
        "price": float(payload.get("price", 0)),
        "discount": discount,
        "approval_required": discount > 0.1,
        "status": "draft",
        "created_at": _now(),
    }
    PROPOSALS[proposal_id] = proposal
    return proposal


def negotiate(payload: dict) -> dict:
    proposal = PROPOSALS.get(payload["proposal_id"])
    if not proposal:
        return {
            "status": "not_found",
            "proposal_id": payload["proposal_id"],
        }

    requested_discount = float(payload.get("requested_discount", proposal["discount"]))
    risk_score = float(payload.get("risk_score", 0.2))
    if requested_discount <= 0.1 and risk_score < 0.4:
        decision = "approved"
    elif requested_discount <= 0.15 and risk_score < 0.6:
        decision = "approval_required"
    else:
        decision = "rejected"

    proposal["status"] = decision
    proposal["requested_discount"] = requested_discount
    proposal["risk_score"] = risk_score
    proposal["updated_at"] = _now()
    return proposal


def close_opportunity(payload: dict) -> dict:
    opportunity = OPPORTUNITIES.get(payload["opportunity_id"])
    if not opportunity:
        return {
            "status": "not_found",
            "opportunity_id": payload["opportunity_id"],
        }

    outcome = payload.get("outcome", "won")
    opportunity["stage"] = outcome
    opportunity["closed_at"] = _now()
    opportunity["contract_value"] = float(payload.get("contract_value", opportunity["estimated_value"]))
    return opportunity


def forecast(payload: dict) -> dict:
    items = payload.get("opportunities") or list(OPPORTUNITIES.values())
    weighted_revenue = 0.0
    total_pipeline = 0.0
    for item in items:
        estimated_value = float(item.get("estimated_value", 0))
        weight = STAGE_WEIGHTS.get(item.get("stage", "qualified"), 0.2)
        total_pipeline += estimated_value
        weighted_revenue += estimated_value * weight
    return {
        "opportunities": len(items),
        "pipeline_total": round(total_pipeline, 2),
        "weighted_forecast": round(weighted_revenue, 2),
        "coverage_ratio": round(0.0 if total_pipeline == 0 else weighted_revenue / total_pipeline, 4),
    }


def renewal(payload: dict) -> dict:
    contract_value = float(payload.get("contract_value", 0))
    uplift = float(payload.get("uplift", 0.06))
    return {
        "customer_id": payload["customer_id"],
        "renewal_price": round(contract_value * (1 + uplift), 2),
        "status": "renewal_ready",
    }


def cross_sell(payload: dict) -> dict:
    current_products = set(payload.get("current_products", []))
    candidates = [product for product in payload.get("recommended_products", []) if product not in current_products]
    return {
        "customer_id": payload["customer_id"],
        "recommended": candidates[:3],
        "status": "ready",
    }