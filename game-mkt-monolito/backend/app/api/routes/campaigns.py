from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Campaign
from app.schemas import CampaignCreate, CampaignResponse
from app.observability.logger import log_info, log_error

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])


@router.post("", response_model=CampaignResponse, status_code=201)
async def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db)):
    """Create a new campaign"""
    try:
        campaign = Campaign(
            name=payload.name,
            description=payload.description,
            budget=payload.budget,
            status="draft",
        )
        db.add(campaign)
        db.commit()
        db.refresh(campaign)

        log_info("Campaign created", campaign_id=str(campaign.id), name=campaign.name)
        return campaign
    except Exception as exc:
        log_error("Failed to create campaign", error=str(exc))
        raise HTTPException(status_code=500, detail="Failed to create campaign")


@router.get("", response_model=list[CampaignResponse])
async def list_campaigns(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List campaigns with pagination"""
    return db.query(Campaign).offset(skip).limit(limit).all()


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: str, db: Session = Depends(get_db)):
    """Get campaign by ID"""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign