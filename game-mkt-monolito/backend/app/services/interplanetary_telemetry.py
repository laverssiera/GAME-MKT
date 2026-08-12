from __future__ import annotations

from datetime import datetime, timezone


_MAX_RECENT_EVENTS = 100

_STATE = {
    "total_events": 0,
    "events_by_subject": {},
    "recent_events": [],
    "gross_revenue": 0.0,
    "last_event_at": None,
}


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def record_event(subject: str, payload: dict, source: str = "subscriber") -> dict:
    _STATE["total_events"] += 1
    _STATE["events_by_subject"][subject] = _STATE["events_by_subject"].get(subject, 0) + 1

    if subject == "gamemkt.sales.closed":
        _STATE["gross_revenue"] += float(payload.get("final_price", 0.0))

    event_row = {
        "subject": subject,
        "source": source,
        "payload": payload,
        "recorded_at": _utc_now_iso(),
    }
    _STATE["recent_events"].append(event_row)
    _STATE["recent_events"] = _STATE["recent_events"][-_MAX_RECENT_EVENTS:]
    _STATE["last_event_at"] = event_row["recorded_at"]

    return event_row


def get_snapshot() -> dict:
    return {
        "total_events": _STATE["total_events"],
        "events_by_subject": dict(_STATE["events_by_subject"]),
        "gross_revenue": round(float(_STATE["gross_revenue"]), 2),
        "last_event_at": _STATE["last_event_at"],
        "recent_events": list(_STATE["recent_events"]),
    }


def reset_snapshot() -> None:
    _STATE["total_events"] = 0
    _STATE["events_by_subject"] = {}
    _STATE["recent_events"] = []
    _STATE["gross_revenue"] = 0.0
    _STATE["last_event_at"] = None
