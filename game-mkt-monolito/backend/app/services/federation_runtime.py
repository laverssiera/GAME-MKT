from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4


PROFILE_STORE: dict[str, dict] = {}
IDENTITY_INDEX: dict[str, str] = {}


def _now() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def _keys_from_payload(payload: dict) -> list[str]:
    keys: list[str] = []
    for field in ["email", "phone", "whatsapp", "instagram", "device_id", "external_id"]:
        value = payload.get(field)
        if value:
            keys.append(f"{field}:{str(value).strip().lower()}")
    return keys


def _merge_into_profile(profile: dict, payload: dict) -> dict:
    channels = set(profile.get("channels", []))
    events = list(profile.get("events", []))
    for channel in payload.get("channels", []):
        channels.add(channel)
    if payload.get("source"):
        events.append({"type": "ingest", "source": payload["source"], "at": _now()})

    for field in ["name", "email", "phone", "whatsapp", "instagram", "device_id", "external_id", "company"]:
        if payload.get(field):
            profile[field] = payload[field]

    profile["channels"] = sorted(channels)
    profile["events"] = events[-25:]
    profile["updated_at"] = _now()
    return profile


def ingest(payload: dict) -> dict:
    keys = _keys_from_payload(payload)
    profile_id = next((IDENTITY_INDEX[key] for key in keys if key in IDENTITY_INDEX), None)
    if profile_id is None:
        profile_id = str(uuid4())
        PROFILE_STORE[profile_id] = {
            "profile_id": profile_id,
            "channels": [],
            "events": [],
            "relationships": [],
            "created_at": _now(),
        }

    profile = _merge_into_profile(PROFILE_STORE[profile_id], payload)
    PROFILE_STORE[profile_id] = profile
    for key in keys:
        IDENTITY_INDEX[key] = profile_id

    return {
        "profile_id": profile_id,
        "merged": len(keys) > 0,
        "channels": profile["channels"],
        "status": "updated",
    }


def merge(payload: dict) -> dict:
    primary = PROFILE_STORE.get(payload["primary_id"])
    secondary = PROFILE_STORE.get(payload["secondary_id"])
    if not primary or not secondary:
        return {"status": "not_found"}

    for field, value in secondary.items():
        if field in {"channels", "events", "relationships"}:
            continue
        if field not in primary or not primary.get(field):
            primary[field] = value

    primary["channels"] = sorted(set(primary.get("channels", []) + secondary.get("channels", [])))
    primary["events"] = (primary.get("events", []) + secondary.get("events", []))[-25:]
    primary["relationships"] = primary.get("relationships", []) + secondary.get("relationships", [])
    primary["updated_at"] = _now()

    for key, current_profile_id in list(IDENTITY_INDEX.items()):
        if current_profile_id == payload["secondary_id"]:
            IDENTITY_INDEX[key] = payload["primary_id"]

    PROFILE_STORE[payload["primary_id"]] = primary
    del PROFILE_STORE[payload["secondary_id"]]
    return {"status": "merged", "profile_id": payload["primary_id"]}


def resolve(payload: dict) -> dict:
    for key in _keys_from_payload(payload):
        profile_id = IDENTITY_INDEX.get(key)
        if profile_id:
            return {"resolved": True, "profile_id": profile_id, "profile": PROFILE_STORE.get(profile_id)}
    return {"resolved": False, "profile_id": None, "profile": None}


def get_profile(profile_id: str) -> dict | None:
    return PROFILE_STORE.get(profile_id)


def add_relationship(payload: dict) -> dict:
    profile = PROFILE_STORE.get(payload["profile_id"])
    if not profile:
        return {"status": "not_found", "profile_id": payload["profile_id"]}

    relation = {
        "type": payload["relationship_type"],
        "target_id": payload["target_id"],
        "created_at": _now(),
    }
    profile.setdefault("relationships", []).append(relation)
    profile["updated_at"] = _now()
    return {"status": "linked", "relationship": relation}


def trust_score(payload: dict) -> dict:
    resolved = resolve(payload)
    if not resolved["resolved"]:
        return {"trust_score": 0.0, "quality": "unverified"}

    profile = resolved["profile"] or {}
    score = 0.2
    if profile.get("email"):
        score += 0.2
    if profile.get("phone") or profile.get("whatsapp"):
        score += 0.2
    if profile.get("device_id"):
        score += 0.15
    if len(profile.get("channels", [])) >= 2:
        score += 0.15
    if len(profile.get("events", [])) >= 2:
        score += 0.1
    score = min(score, 0.95)

    if score >= 0.75:
        quality = "high"
    elif score >= 0.5:
        quality = "medium"
    else:
        quality = "low"

    return {
        "profile_id": resolved["profile_id"],
        "trust_score": round(score, 4),
        "quality": quality,
    }