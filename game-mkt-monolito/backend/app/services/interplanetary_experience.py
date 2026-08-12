from __future__ import annotations

from datetime import datetime, timedelta, timezone
import uuid


_EXPERIENCES: dict[str, dict] = {}

_CATALOG = [
    {
        "experience_id": "exp-mars-habitat",
        "title": "Mars Habitat Prime",
        "scenario": "morar_em_marte",
        "location": "mars",
        "base_price": 480000.0,
        "currency": "BRL",
    },
    {
        "experience_id": "exp-moon-condo",
        "title": "Moon Condo Alpha",
        "scenario": "condominio_lunar",
        "location": "moon",
        "base_price": 380000.0,
        "currency": "BRL",
    },
    {
        "experience_id": "exp-oceanic-city",
        "title": "Oceanic City Residence",
        "scenario": "cidade_submarina",
        "location": "oceanic-cities",
        "base_price": 320000.0,
        "currency": "BRL",
    },
]


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(value, high))


def create_experience(payload: dict) -> dict:
    experience_id = f"exp-{uuid.uuid4().hex[:10]}"
    base_price = float(payload.get("base_price", 0))
    duration_minutes = int(payload.get("duration_minutes", 45))

    experience = {
        "experience_id": experience_id,
        "title": payload.get("title", "Interplanetary Experience"),
        "scenario": payload.get("scenario", "morar_em_marte"),
        "location": payload.get("location", "mars"),
        "base_price": round(base_price, 2),
        "currency": payload.get("currency", "BRL"),
        "duration_minutes": duration_minutes,
        "status": "created",
        "event": "gamemkt.holographic.experience.started",
        "created_at": _utc_now_iso(),
    }
    _EXPERIENCES[experience_id] = experience
    return experience


def simulate_experience(payload: dict) -> dict:
    experience_id = payload.get("experience_id")
    if experience_id not in _EXPERIENCES:
        raise ValueError("experience_not_found")

    immersion_level = float(payload.get("immersion_level", 0.7))
    emotional_engagement = float(payload.get("emotional_engagement", 0.7))
    technical_friction = float(payload.get("technical_friction", 0.2))

    immersion = _clamp((immersion_level * 0.6) + (emotional_engagement * 0.4), 0.0, 1.0)
    projected_conversion = _clamp(0.15 + (immersion * 0.7) - (technical_friction * 0.4), 0.01, 0.95)

    return {
        "experience_id": experience_id,
        "immersion_score": round(immersion, 4),
        "projected_conversion": round(projected_conversion, 4),
        "recommended_next_step": "agendar_sessao_holografica" if projected_conversion >= 0.4 else "refinar_narrativa",
        "event": "gamemkt.holographic.city.visited",
    }


def purchase_experience(payload: dict) -> dict:
    experience_id = payload.get("experience_id")
    if experience_id not in _EXPERIENCES:
        raise ValueError("experience_not_found")

    exp = _EXPERIENCES[experience_id]
    buyer_tier = payload.get("buyer_tier", "standard")
    tier_multiplier = {
        "standard": 1.0,
        "premium": 1.25,
        "institutional": 1.5,
    }.get(buyer_tier, 1.0)

    final_price = round(float(exp["base_price"]) * tier_multiplier, 2)
    exp["status"] = "sold"

    return {
        "sale_id": f"sale-{uuid.uuid4().hex[:10]}",
        "experience_id": experience_id,
        "customer_id": payload.get("customer_id"),
        "buyer_tier": buyer_tier,
        "final_price": final_price,
        "currency": exp["currency"],
        "status": "closed",
        "event": "gamemkt.sales.closed",
        "delivery_eta": (datetime.now(timezone.utc) + timedelta(days=2)).date().isoformat(),
    }


def list_catalog() -> dict:
    return {
        "total": len(_CATALOG),
        "items": _CATALOG,
    }
