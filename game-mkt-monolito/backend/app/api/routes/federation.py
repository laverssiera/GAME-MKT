import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import FederationIdentityKey, FederationProfile
from app.observability.logger import log_info

router = APIRouter(prefix="/api/federation", tags=["federation"])


class IngestRequest(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    whatsapp: str | None = None
    instagram: str | None = None
    device_id: str | None = None
    external_id: str | None = None
    company: str | None = None
    source: str | None = None
    channels: list[str] = Field(default_factory=list)


class MergeRequest(BaseModel):
    primary_id: str
    secondary_id: str


class ResolveRequest(BaseModel):
    email: str | None = None
    phone: str | None = None
    whatsapp: str | None = None
    instagram: str | None = None
    device_id: str | None = None
    external_id: str | None = None


class RelationshipRequest(BaseModel):
    profile_id: str
    relationship_type: str
    target_id: str


class TrustScoreRequest(BaseModel):
    email: str | None = None
    phone: str | None = None
    whatsapp: str | None = None
    instagram: str | None = None
    device_id: str | None = None
    external_id: str | None = None


# ── helpers ──────────────────────────────────────────────────────────────────

def _keys_from_data(data: dict) -> list[str]:
    keys = []
    for field in ["email", "phone", "whatsapp", "instagram", "device_id", "external_id"]:
        v = data.get(field)
        if v:
            keys.append(f"{field}:{str(v).strip().lower()}")
    return keys


def _merge_profile_db(profile: FederationProfile, data: dict) -> FederationProfile:
    for field in ["name", "email", "phone", "whatsapp", "instagram", "device_id", "external_id", "company"]:
        if data.get(field):
            setattr(profile, field, data[field])
    channels = set(json.loads(profile.channels or "[]"))
    for ch in data.get("channels", []):
        channels.add(ch)
    profile.channels = json.dumps(sorted(channels))
    events = json.loads(profile.events or "[]")
    if data.get("source"):
        events.append({"type": "ingest", "source": data["source"]})
    profile.events = json.dumps(events[-25:])
    return profile


def _serialize_profile(p: FederationProfile) -> dict:
    return {
        "profile_id": str(p.id),
        "name": p.name,
        "email": p.email,
        "phone": p.phone,
        "whatsapp": p.whatsapp,
        "instagram": p.instagram,
        "device_id": p.device_id,
        "external_id": p.external_id,
        "company": p.company,
        "channels": json.loads(p.channels or "[]"),
        "events": json.loads(p.events or "[]"),
        "relationships": json.loads(p.relationships or "[]"),
    }


def _calc_trust(p: FederationProfile) -> float:
    score = 0.2
    if p.email:
        score += 0.2
    if p.phone or p.whatsapp:
        score += 0.2
    if p.device_id:
        score += 0.15
    if len(json.loads(p.channels or "[]")) >= 2:
        score += 0.15
    if len(json.loads(p.events or "[]")) >= 2:
        score += 0.1
    return round(min(score, 0.95), 4)


def _resolve_profile_id(keys: list[str], db: Session) -> str | None:
    for key in keys:
        row = db.query(FederationIdentityKey).filter(FederationIdentityKey.key_value == key).first()
        if row:
            return str(row.profile_id)
    return None


# ── routes ───────────────────────────────────────────────────────────────────

@router.post("/ingest")
async def ingest_profile(payload: IngestRequest, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude_none=True)
    keys = _keys_from_data(data)

    profile_id = _resolve_profile_id(keys, db)

    if profile_id is None:
        profile_id = str(uuid.uuid4())
        profile = FederationProfile(
            id=uuid.UUID(profile_id),
            channels=json.dumps([]),
            events=json.dumps([]),
            relationships=json.dumps([]),
        )
        db.add(profile)
        db.flush()

    profile = db.query(FederationProfile).filter(FederationProfile.id == uuid.UUID(profile_id)).first()
    profile = _merge_profile_db(profile, data)
    db.add(profile)

    for key in keys:
        existing = db.query(FederationIdentityKey).filter(FederationIdentityKey.key_value == key).first()
        if not existing:
            db.add(FederationIdentityKey(key_value=key, profile_id=uuid.UUID(profile_id)))

    db.commit()
    db.refresh(profile)
    log_info("Federation ingest", profile_id=profile_id)
    return {
        "profile_id": profile_id,
        "merged": len(keys) > 0,
        "channels": json.loads(profile.channels or "[]"),
        "status": "updated",
    }


@router.post("/merge")
async def merge_profiles(payload: MergeRequest, db: Session = Depends(get_db)):
    primary = db.query(FederationProfile).filter(FederationProfile.id == uuid.UUID(payload.primary_id)).first()
    secondary = db.query(FederationProfile).filter(FederationProfile.id == uuid.UUID(payload.secondary_id)).first()
    if not primary or not secondary:
        raise HTTPException(status_code=404, detail="Profile not found")

    for field in ["name", "email", "phone", "whatsapp", "instagram", "device_id", "external_id", "company"]:
        if not getattr(primary, field) and getattr(secondary, field):
            setattr(primary, field, getattr(secondary, field))

    primary.channels = json.dumps(sorted(
        set(json.loads(primary.channels or "[]")) | set(json.loads(secondary.channels or "[]"))
    ))
    merged_events = json.loads(primary.events or "[]") + json.loads(secondary.events or "[]")
    primary.events = json.dumps(merged_events[-25:])
    merged_rels = json.loads(primary.relationships or "[]") + json.loads(secondary.relationships or "[]")
    primary.relationships = json.dumps(merged_rels)

    db.query(FederationIdentityKey).filter(
        FederationIdentityKey.profile_id == uuid.UUID(payload.secondary_id)
    ).update({"profile_id": uuid.UUID(payload.primary_id)})

    db.delete(secondary)
    db.commit()
    db.refresh(primary)
    return {"status": "merged", "profile_id": payload.primary_id}


@router.post("/resolve")
async def resolve_profile(payload: ResolveRequest, db: Session = Depends(get_db)):
    for key in _keys_from_data(payload.model_dump(exclude_none=True)):
        row = db.query(FederationIdentityKey).filter(FederationIdentityKey.key_value == key).first()
        if row:
            p = db.query(FederationProfile).filter(FederationProfile.id == row.profile_id).first()
            return {"resolved": True, "profile_id": str(row.profile_id), "profile": _serialize_profile(p)}
    return {"resolved": False, "profile_id": None, "profile": None}


@router.get("/profile/{profile_id}")
async def profile(profile_id: str, db: Session = Depends(get_db)):
    p = db.query(FederationProfile).filter(FederationProfile.id == uuid.UUID(profile_id)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _serialize_profile(p)


@router.post("/relationship")
async def relationship(payload: RelationshipRequest, db: Session = Depends(get_db)):
    p = db.query(FederationProfile).filter(FederationProfile.id == uuid.UUID(payload.profile_id)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    rels = json.loads(p.relationships or "[]")
    rels.append({"type": payload.relationship_type, "target_id": payload.target_id})
    p.relationships = json.dumps(rels)
    db.commit()
    return {"status": "linked", "relationship": {"type": payload.relationship_type, "target_id": payload.target_id}}


@router.post("/trust-score")
async def profile_trust_score(payload: TrustScoreRequest, db: Session = Depends(get_db)):
    for key in _keys_from_data(payload.model_dump(exclude_none=True)):
        row = db.query(FederationIdentityKey).filter(FederationIdentityKey.key_value == key).first()
        if row:
            p = db.query(FederationProfile).filter(FederationProfile.id == row.profile_id).first()
            score = _calc_trust(p)
            quality = "high" if score >= 0.75 else ("medium" if score >= 0.5 else "low")
            return {"profile_id": str(row.profile_id), "trust_score": score, "quality": quality}
    return {"trust_score": 0.0, "quality": "unverified"}
