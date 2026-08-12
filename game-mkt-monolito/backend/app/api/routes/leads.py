from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas import LeadCreate, LeadUpdate, LeadResponse
from app.repositories import LeadRepository
from app.services import LeadService
from app.integrations import JohnIntegration
from app.events.bus import get_event_bus
from app.observability.logger import log_info, log_error

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.post("", response_model=LeadResponse, status_code=201)
async def create_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db)
):
    """Create a new lead"""
    try:
        # Check if lead already exists
        existing = LeadRepository.get_by_email(db, payload.email)
        if existing:
            raise HTTPException(status_code=409, detail="Lead already exists")
        
        # Enrich and calculate score
        lead_data = payload.dict()
        lead_data = LeadService.enrich_lead(lead_data)
        
        # Create lead
        lead = LeadRepository.create(db, lead_data)

        # Fire-and-forget integrations to avoid blocking the request path.
        lead_payload = {
            "id": str(lead.id),
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone,
            "score": lead.score,
            "status": lead.status,
            "source": lead.source,
        }

        try:
            await get_event_bus().publish("lead.created", lead_payload)
        except Exception as event_error:
            log_error("Failed to publish lead.created", error=str(event_error), lead_id=str(lead.id))

        try:
            await JohnIntegration.notify_new_lead(lead_payload)
        except Exception as john_error:
            log_error("Failed to notify John", error=str(john_error), lead_id=str(lead.id))
        
        log_info("Lead created", lead_id=str(lead.id), email=lead.email)
        
        return lead
    except HTTPException:
        raise
    except Exception as e:
        log_error("Error creating lead", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: str,
    db: Session = Depends(get_db)
):
    """Get a lead by ID"""
    lead = LeadRepository.get_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.get("/by-status/{status}", response_model=list[LeadResponse])
async def get_leads_by_status(
    status: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get leads by status"""
    leads = LeadRepository.get_by_status(db, status, skip=skip, limit=limit)
    return leads


@router.get("", response_model=list[LeadResponse])
async def list_leads(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all leads"""
    leads = LeadRepository.get_all(db, skip=skip, limit=limit)
    return leads


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: str,
    payload: LeadUpdate,
    db: Session = Depends(get_db)
):
    """Update a lead"""
    lead = LeadRepository.update(db, lead_id, payload.dict(exclude_unset=True))
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.delete("/{lead_id}", status_code=204)
async def delete_lead(
    lead_id: str,
    db: Session = Depends(get_db)
):
    """Delete a lead"""
    lead = LeadRepository.delete(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")


@router.post("/{lead_id}/qualify")
async def qualify_lead(
    lead_id: str,
    db: Session = Depends(get_db)
):
    """Qualify a lead"""
    lead = LeadRepository.get_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    result = LeadService.qualify_lead(lead)
    
    # Update lead status
    LeadRepository.update(db, lead_id, {"status": result["status"]})
    
    return result


