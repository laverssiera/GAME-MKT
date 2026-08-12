from sqlalchemy.orm import Session
from typing import Optional

from app.models import Lead


class LeadRepository:
    """Repository for Lead operations"""
    
    @staticmethod
    def create(db: Session, lead_data: dict):
        """Create a new lead"""
        lead = Lead(**lead_data)
        db.add(lead)
        db.commit()
        db.refresh(lead)
        return lead
    
    @staticmethod
    def get_by_id(db: Session, lead_id: str):
        """Get lead by ID"""
        return db.query(Lead).filter(Lead.id == lead_id).first()
    
    @staticmethod
    def get_by_email(db: Session, email: str):
        """Get lead by email"""
        return db.query(Lead).filter(Lead.email == email).first()
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100):
        """Get all leads with pagination"""
        return db.query(Lead).offset(skip).limit(limit).all()
    
    @staticmethod
    def update(db: Session, lead_id: str, update_data: dict):
        """Update a lead"""
        lead = LeadRepository.get_by_id(db, lead_id)
        if lead:
            for key, value in update_data.items():
                if value is not None:
                    setattr(lead, key, value)
            db.commit()
            db.refresh(lead)
        return lead
    
    @staticmethod
    def delete(db: Session, lead_id: str):
        """Delete a lead"""
        lead = LeadRepository.get_by_id(db, lead_id)
        if lead:
            db.delete(lead)
            db.commit()
        return lead
    
    @staticmethod
    def get_by_status(db: Session, status: str, skip: int = 0, limit: int = 100):
        """Get leads by status"""
        return db.query(Lead).filter(Lead.status == status).offset(skip).limit(limit).all()
