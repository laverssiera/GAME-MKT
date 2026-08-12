from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class LeadCreate(BaseModel):
    """Schema for creating a lead"""
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = None
    source: Optional[str] = None


class LeadUpdate(BaseModel):
    """Schema for updating a lead"""
    name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    score: Optional[int] = None


class LeadResponse(BaseModel):
    """Schema for lead response"""
    id: UUID
    name: str
    email: str
    phone: Optional[str]
    score: int
    status: str
    source: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CampaignCreate(BaseModel):
    """Schema for creating a campaign"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    budget: float = Field(..., gt=0)


class CampaignResponse(BaseModel):
    """Schema for campaign response"""
    id: UUID
    name: str
    description: Optional[str]
    budget: float
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BundleCreate(BaseModel):
    """Schema for creating a bundle"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    template_type: str
    total_price: float = Field(..., gt=0)
    margin_percentage: int = Field(default=40, ge=0, le=100)
    products: Optional[list[UUID]] = None


class BundleResponse(BaseModel):
    """Schema for bundle response"""
    id: UUID
    name: str
    description: Optional[str]
    template_type: str
    total_price: float
    margin_percentage: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
