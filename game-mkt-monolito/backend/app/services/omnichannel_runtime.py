from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4


SESSION_STORE: dict[str, dict] = {}

CHANNEL_PRIORITY = ["whatsapp", "email", "push", "voice", "sms", "telegram", "instagram", "webchat"]


def _timestamp() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


def send_message(payload: dict) -> dict:
    session_id = payload.get("session_id") or str(uuid4())
    session = SESSION_STORE.setdefault(
        session_id,
        {
            "session_id": session_id,
            "messages": [],
            "consents": {},
            "status": "active",
            "created_at": _timestamp(),
        },
    )
    message = {
        "channel": payload["channel"],
        "recipient": payload["recipient"],
        "message": payload["message"],
        "status": "queued",
        "timestamp": _timestamp(),
    }
    session["messages"].append(message)
    session["last_channel"] = payload["channel"]
    session["updated_at"] = _timestamp()
    return {
        "session_id": session_id,
        "channel": payload["channel"],
        "status": "queued",
        "message_index": len(session["messages"]) - 1,
    }


def route_channel(payload: dict) -> dict:
    attempted = payload.get("attempted_channels", [])
    consents = payload.get("consents", {})

    for channel in CHANNEL_PRIORITY:
        if channel in attempted:
            continue
        if consents and consents.get(channel) is False:
            continue
        return {
            "next_channel": channel,
            "fallback_triggered": len(attempted) > 0,
            "reason": "priority_and_consent",
        }

    return {
        "next_channel": "human_handoff",
        "fallback_triggered": True,
        "reason": "no_channel_available",
    }


def broadcast(payload: dict) -> dict:
    recipients = payload.get("recipients", [])
    return {
        "channel": payload["channel"],
        "queued": len(recipients),
        "campaign": payload.get("campaign"),
        "status": "scheduled",
    }


def escalate(payload: dict) -> dict:
    session_id = payload["session_id"]
    session = SESSION_STORE.setdefault(session_id, {"session_id": session_id, "messages": [], "consents": {}})
    target = payload.get("target", "john")
    session["status"] = "escalated"
    session["escalated_to"] = target
    session["escalation_reason"] = payload.get("reason", "manual")
    session["updated_at"] = _timestamp()
    return {
        "session_id": session_id,
        "status": session["status"],
        "escalated_to": target,
    }


def update_consent(payload: dict) -> dict:
    session_id = payload.get("session_id") or str(uuid4())
    session = SESSION_STORE.setdefault(session_id, {"session_id": session_id, "messages": [], "consents": {}})
    session["consents"].update(payload.get("consents", {}))
    session["updated_at"] = _timestamp()
    return {
        "session_id": session_id,
        "consents": session["consents"],
        "status": "updated",
    }


def get_session(session_id: str) -> dict:
    return SESSION_STORE.get(
        session_id,
        {
            "session_id": session_id,
            "messages": [],
            "consents": {},
            "status": "missing",
        },
    )