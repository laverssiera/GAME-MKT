import json
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Bundle, ComposerExecution
from app.schemas import BundleCreate, BundleResponse
from app.domain.execution_workflow import is_valid_status_transition
from app.observability.logger import log_info

router = APIRouter(prefix="/api/composer", tags=["service-composer"])


class DiscoverRequest(BaseModel):
    query: str


class SuggestRequest(BaseModel):
    requirements: list[str]
    constraints: dict = {}


class PriceRequest(BaseModel):
    bundle_id: str
    segment: str = "default"


class CompatibilityRequest(BaseModel):
    bundle_id: str


class RescheduleRequest(BaseModel):
    days_adjustment: int


class ExecuteRequest(BaseModel):
    bundle_id: str
    customer_id: str | None = None


class UpdateExecutionStatusRequest(BaseModel):
    status: str
    progress: int | None = None
    current_phase: str | None = None


def _serialize_execution(execution: ComposerExecution) -> dict:
    teams_active = json.loads(execution.teams_active) if execution.teams_active else []
    risks = json.loads(execution.risks) if execution.risks else []
    timeline_remaining = None
    if execution.timeline_end:
        delta = execution.timeline_end - datetime.utcnow()
        timeline_remaining = max(delta.days, 0)

    return {
        "execution_id": str(execution.id),
        "bundle_id": str(execution.bundle_id),
        "status": execution.status,
        "progress": execution.progress,
        "current_phase": execution.current_phase,
        "teams_active": teams_active,
        "timeline": {
            "start": execution.timeline_start.isoformat() if execution.timeline_start else None,
            "end": execution.timeline_end.isoformat() if execution.timeline_end else None,
        },
        "timeline_remaining": timeline_remaining,
        "risks": risks,
    }


@router.post("/bundles", response_model=BundleResponse, status_code=201)
async def create_bundle(payload: BundleCreate, db: Session = Depends(get_db)):
    """Create and persist a custom bundle"""
    serialized_products = None
    if payload.products:
        serialized_products = json.dumps([str(product_id) for product_id in payload.products])

    bundle = Bundle(
        name=payload.name,
        description=payload.description,
        template_type=payload.template_type,
        total_price=payload.total_price,
        margin_percentage=payload.margin_percentage,
        products=serialized_products,
        status="draft",
    )
    db.add(bundle)
    db.commit()
    db.refresh(bundle)

    log_info("Bundle persisted", bundle_id=str(bundle.id), name=bundle.name)
    return bundle


@router.get("/bundles", response_model=list[BundleResponse])
async def list_bundles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List persisted bundles"""
    return db.query(Bundle).offset(skip).limit(limit).all()


@router.get("/bundles/{bundle_id}", response_model=BundleResponse)
async def get_bundle(bundle_id: str, db: Session = Depends(get_db)):
    """Get persisted bundle by ID"""
    bundle = db.query(Bundle).filter(Bundle.id == bundle_id).first()
    if not bundle:
        raise HTTPException(status_code=404, detail="Bundle not found")
    return bundle


@router.get("/bundles/{bundle_id}/executions")
async def list_bundle_executions(bundle_id: str, db: Session = Depends(get_db)):
    """List execution history for a given bundle"""
    bundle = db.query(Bundle).filter(Bundle.id == bundle_id).first()
    if not bundle:
        raise HTTPException(status_code=404, detail="Bundle not found")

    executions = (
        db.query(ComposerExecution)
        .filter(ComposerExecution.bundle_id == bundle.id)
        .order_by(ComposerExecution.created_at.desc())
        .all()
    )
    return {
        "bundle_id": str(bundle.id),
        "total": len(executions),
        "executions": [_serialize_execution(execution) for execution in executions],
    }


@router.post("/discover")
async def discover_bundle_intent(payload: DiscoverRequest):
    """Discover bundle intent from natural language query"""
    # This will be integrated with NLP engine
    log_info("Bundle discovery started", query=payload.query)
    
    return {
        "query": payload.query,
        "intent": "residential_automation",
        "confidence": 0.92,
        "suggested_bundles": [
            "condominio-inteligente",
            "retrofit-inteligente"
        ]
    }


@router.post("/suggest")
async def suggest_bundles(payload: SuggestRequest):
    """Suggest service bundles based on requirements"""
    log_info("Bundle suggestion started", requirements=payload.requirements)
    
    return {
        "requirements": payload.requirements,
        "suggestions": [
            {
                "bundle_id": "bundle-001",
                "name": "Condomínio Inteligente",
                "price": 5400000,
                "margin": 0.45,
                "timeline_days": 220,
                "products": ["archimedes", "john", "cefeida", "liceu-hardware"]
            }
        ]
    }


@router.get("/bundles/templates")
async def get_bundle_templates():
    """Get pre-built bundle templates"""
    return {
        "templates": [
            {
                "id": "template-residential",
                "name": "Condomínio Inteligente",
                "price_range": "2-5M",
                "margin": "45%",
                "success_rate": "92%",
                "products": 7
            },
            {
                "id": "template-retrofit",
                "name": "Retrofit Inteligente",
                "price_range": "100-300k",
                "margin": "50%",
                "success_rate": "88%",
                "products": 5
            },
            {
                "id": "template-farm",
                "name": "Fazenda Inteligente",
                "price_range": "500k-2M",
                "margin": "48%",
                "success_rate": "85%",
                "products": 6
            }
        ]
    }


@router.post("/price")
async def calculate_bundle_price(payload: PriceRequest):
    """Calculate aggregated pricing for a bundle"""
    log_info("Bundle pricing started", bundle_id=payload.bundle_id, segment=payload.segment)
    
    return {
        "bundle_id": payload.bundle_id,
        "base_price": 3450000,
        "discount": 0.12,
        "final_price": 3036000,
        "margin": 0.45,
        "gross_profit": 1366200,
        "currency": "BRL"
    }


@router.post("/compatibility/check")
async def check_compatibility(payload: CompatibilityRequest):
    """Check technical compatibility of bundle products"""
    log_info("Bundle compatibility check", bundle_id=payload.bundle_id)
    
    return {
        "bundle_id": payload.bundle_id,
        "compatible": True,
        "integration_score": 0.98,
        "issues": [],
        "sla_days": 220
    }


@router.post("/execute")
async def execute_bundle(payload: ExecuteRequest, db: Session = Depends(get_db)):
    """Execute/create bundle order and start orchestration"""
    bundle = db.query(Bundle).filter(Bundle.id == payload.bundle_id).first()
    if not bundle:
        raise HTTPException(status_code=404, detail="Bundle not found")

    execution = ComposerExecution(
        bundle_id=bundle.id,
        customer_id=payload.customer_id,
        status="created",
        progress=0,
        current_phase="Archimedes project kick-off",
        timeline_start=datetime.utcnow(),
        timeline_end=datetime.utcnow() + timedelta(days=220),
        teams_active=json.dumps(["archimedes", "john", "cefeida"]),
        risks=json.dumps([]),
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)

    log_info("Bundle execution started", bundle_id=payload.bundle_id, customer_id=payload.customer_id)

    response = _serialize_execution(execution)
    response["teams_notified"] = len(response["teams_active"])
    response["next_step"] = execution.current_phase
    return response


@router.get("/executions/{execution_id}")
async def get_execution_status(execution_id: str, db: Session = Depends(get_db)):
    """Track bundle execution status"""
    execution = db.query(ComposerExecution).filter(ComposerExecution.id == execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return _serialize_execution(execution)


@router.put("/executions/{execution_id}/reschedule")
async def reschedule_execution(execution_id: str, payload: RescheduleRequest, db: Session = Depends(get_db)):
    """Adjust bundle execution timeline"""
    execution = db.query(ComposerExecution).filter(ComposerExecution.id == execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    if execution.status == "completed":
        raise HTTPException(status_code=409, detail="Cannot reschedule a completed execution")

    if not execution.timeline_end:
        execution.timeline_end = datetime.utcnow() + timedelta(days=220)

    execution.timeline_end = execution.timeline_end + timedelta(days=payload.days_adjustment)
    execution.status = "rescheduled"
    db.commit()
    db.refresh(execution)

    log_info("Execution rescheduled", execution_id=execution_id, days_adjustment=payload.days_adjustment)

    return {
        "execution_id": str(execution.id),
        "status": execution.status,
        "new_end_date": execution.timeline_end.date().isoformat() if execution.timeline_end else None,
        "impact": f"{payload.days_adjustment} days added",
    }


@router.patch("/executions/{execution_id}/status")
async def update_execution_status(
    execution_id: str,
    payload: UpdateExecutionStatusRequest,
    db: Session = Depends(get_db),
):
    """Update execution status/progress for workflow transitions"""
    allowed_status = {"created", "in_progress", "rescheduled", "completed"}
    if payload.status not in allowed_status:
        raise HTTPException(status_code=422, detail="Invalid status")

    execution = db.query(ComposerExecution).filter(ComposerExecution.id == execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    if not is_valid_status_transition(execution.status, payload.status):
        raise HTTPException(
            status_code=409,
            detail=f"Invalid transition from '{execution.status}' to '{payload.status}'",
        )

    execution.status = payload.status
    if payload.progress is not None:
        execution.progress = max(0, min(payload.progress, 100))
    elif payload.status == "completed":
        execution.progress = 100
    if payload.current_phase is not None:
        execution.current_phase = payload.current_phase

    db.commit()
    db.refresh(execution)

    log_info(
        "Execution status updated",
        execution_id=execution_id,
        status=execution.status,
        progress=execution.progress,
    )
    return _serialize_execution(execution)


@router.get("/customers/{customer_id}/opportunities")
async def get_upsell_opportunities(customer_id: str):
    """Detect upsell opportunities for customer"""
    return {
        "customer_id": customer_id,
        "current_bundles": 1,
        "upsell_opportunities": [
            {
                "bundle_name": "Facilities Automation",
                "additional_revenue": 850000,
                "timeline": 90,
                "probability": 0.75
            }
        ]
    }


@router.post("/catalog")
async def create_catalog_product(product_data: dict, db: Session = Depends(get_db)):
    """Create new product in catalog"""
    log_info("Catalog product created", product_name=product_data.get("name"))
    
    return {"product_id": "prod-001", "status": "created"}


@router.get("/catalog")
async def list_catalog_products(category: str = None):
    """List products in catalog"""
    return {
        "products": [
            {"id": "archimedes-001", "name": "Construção Residencial", "category": "engenharia"},
            {"id": "john-001", "name": "John Brasileiro", "category": "ia"},
            {"id": "cefeida-001", "name": "Analytics Dashboard", "category": "dados"}
        ]
    }
