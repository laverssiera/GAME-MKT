import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, String, Integer, Numeric, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class Lead(Base):
    """Lead model"""
    
    __tablename__ = "leads"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(20), nullable=True)
    score = Column(Integer, default=0)
    status = Column(String(50), default="cold")  # cold, warm, hot, qualified
    source = Column(String(100), nullable=True)  # website, campaign, referral, etc
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Campaign(Base):
    """Campaign model"""
    
    __tablename__ = "campaigns"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    budget = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), default="draft")  # draft, active, paused, ended
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Product(Base):
    """Product/Service model"""
    
    __tablename__ = "products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # archimedes, cea, john, etc
    price = Column(Numeric(10, 2), nullable=False)
    description = Column(String(1000), nullable=True)
    features = Column(String(2000), nullable=True)  # JSON serialized
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Bundle(Base):
    """Service Bundle model (Service Composer)"""
    
    __tablename__ = "bundles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    template_type = Column(String(100), nullable=False)  # residential, commercial, etc
    total_price = Column(Numeric(12, 2), nullable=False)
    margin_percentage = Column(Integer, default=40)
    products = Column(String(4000), nullable=True)  # JSON serialized
    status = Column(String(50), default="draft")  # draft, active, sold
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ComposerExecution(Base):
    """Execution workflow for composed bundles"""

    __tablename__ = "composer_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bundle_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    customer_id = Column(String(255), nullable=True)
    status = Column(String(50), default="created")  # created, in_progress, rescheduled, completed
    progress = Column(Integer, default=0)
    current_phase = Column(String(255), nullable=True)
    timeline_start = Column(DateTime, default=datetime.utcnow)
    timeline_end = Column(DateTime, nullable=True)
    teams_active = Column(String(4000), nullable=True)  # JSON serialized array
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ──────────────────────────────────────────────────────────────────────────────
# Lead Federation
# ──────────────────────────────────────────────────────────────────────────────

class FederationProfile(Base):
    """Unified identity profile — one record per real person in the ecosystem."""

    __tablename__ = "federation_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(50), nullable=True)
    whatsapp = Column(String(50), nullable=True)
    instagram = Column(String(100), nullable=True)
    device_id = Column(String(255), nullable=True)
    external_id = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    channels = Column(String(1000), nullable=True)   # JSON list
    events = Column(String(16000), nullable=True)    # JSON list – last 25
    relationships = Column(String(8000), nullable=True)  # JSON list
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FederationIdentityKey(Base):
    """Lookup index: key_value ('email:x@x.com') → profile_id."""

    __tablename__ = "federation_identity_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key_value = Column(String(500), unique=True, nullable=False, index=True)
    profile_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ──────────────────────────────────────────────────────────────────────────────
# Omnichannel
# ──────────────────────────────────────────────────────────────────────────────

class OmnichannelSession(Base):
    """Active communication session across channels."""

    __tablename__ = "omnichannel_sessions"

    id = Column(String(255), primary_key=True)
    messages = Column(String(32000), nullable=True)   # JSON list
    consents = Column(String(2000), nullable=True)    # JSON object
    status = Column(String(50), default="active")
    last_channel = Column(String(100), nullable=True)
    escalated_to = Column(String(100), nullable=True)
    escalation_reason = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ──────────────────────────────────────────────────────────────────────────────
# Sales Orchestration
# ──────────────────────────────────────────────────────────────────────────────

class SalesOpportunity(Base):
    """Sales pipeline opportunity."""

    __tablename__ = "sales_opportunities"

    id = Column(String(255), primary_key=True)
    lead_id = Column(String(255), nullable=False, index=True)
    origin = Column(String(100), nullable=True)
    stage = Column(String(100), default="qualified")
    estimated_value = Column(Numeric(14, 2), nullable=False)
    contract_value = Column(Numeric(14, 2), nullable=True)
    close_probability = Column(Numeric(5, 2), nullable=True)
    federation_profile_id = Column(String(255), nullable=True, index=True)
    closed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SalesProposal(Base):
    """Proposal linked to an opportunity."""

    __tablename__ = "sales_proposals"

    id = Column(String(255), primary_key=True)
    opportunity_id = Column(String(255), nullable=False, index=True)
    bundle_id = Column(String(255), nullable=True)
    price = Column(Numeric(14, 2), nullable=False)
    discount = Column(Numeric(5, 4), nullable=True, default=0)
    approval_required = Column(Boolean, default=False)
    status = Column(String(50), default="draft")
    requested_discount = Column(Numeric(5, 4), nullable=True)
    risk_score = Column(Numeric(5, 4), nullable=True)
    pricing_snapshot = Column(String(8000), nullable=True)  # JSON from pricing engine
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
