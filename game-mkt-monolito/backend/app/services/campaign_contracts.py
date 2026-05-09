from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4


REQUIRED_CLAUSES = (
    "escopo",
    "sla_operacao",
    "metrica_sucesso",
    "compliance_marca",
    "politica_orcamento",
)


def _now() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def _governance_tier(budget: float) -> str:
    if budget >= 1_000_000:
        return "enterprise"
    if budget >= 200_000:
        return "scale"
    return "starter"


def create_contract(payload: dict) -> dict:
    budget = float(payload.get("budget", 0))
    duration_days = int(payload.get("duration_days", 30))
    channels = payload.get("channels", [])
    objectives = payload.get("objectives", [])
    contract_id = str(uuid4())
    tier = _governance_tier(budget)

    sla_hours = {
        "enterprise": 4,
        "scale": 8,
        "starter": 24,
    }[tier]

    clauses = [
        {
            "name": "escopo",
            "value": f"Ativar {len(channels)} canais para {len(objectives)} objetivos de crescimento.",
        },
        {
            "name": "sla_operacao",
            "value": f"Resposta operacional em ate {sla_hours}h.",
        },
        {
            "name": "metrica_sucesso",
            "value": payload.get("north_star_metric", "pipeline_qualificado"),
        },
        {
            "name": "compliance_marca",
            "value": payload.get("brand_policy", "manual_padrao_v1"),
        },
        {
            "name": "politica_orcamento",
            "value": f"Cap mensal de BRL {round(budget / max(1, duration_days / 30), 2)}.",
        },
    ]

    return {
        "contract_id": contract_id,
        "campaign_id": payload.get("campaign_id"),
        "name": payload.get("name", "Contrato de Campanha"),
        "status": "draft",
        "tier": tier,
        "budget": budget,
        "duration_days": duration_days,
        "channels": channels,
        "objectives": objectives,
        "clauses": clauses,
        "created_at": _now(),
    }


def validate_contract(payload: dict) -> dict:
    clauses = payload.get("clauses", [])
    clause_names = {str(clause.get("name", "")).strip().lower() for clause in clauses}
    missing = [item for item in REQUIRED_CLAUSES if item not in clause_names]

    approved = len(missing) == 0
    return {
        "valid": approved,
        "missing_clauses": missing,
        "required_clauses": list(REQUIRED_CLAUSES),
        "status": "ready_for_signature" if approved else "incomplete",
    }


def sign_contract(payload: dict) -> dict:
    delegated_limit = float(payload.get("delegated_limit", 300_000))
    budget = float(payload.get("budget", 0))
    requires_board = budget > delegated_limit

    return {
        "contract_id": payload["contract_id"],
        "signed": not requires_board,
        "status": "board_approval_required" if requires_board else "signed",
        "signed_at": None if requires_board else _now(),
    }