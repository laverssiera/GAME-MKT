from __future__ import annotations

from app.observability.logger import log_error, log_info
from app.events.interplanetary_events import INTERPLANETARY_SUBJECTS
from app.services.interplanetary_telemetry import record_event

_SUBSCRIBERS_STATE = {
    "enabled": False,
    "reason": "not_started",
    "subjects": [],
}


def _resolve_event_bus():
    try:
        from app.events.bus import get_event_bus

        return get_event_bus()
    except Exception as event_bus_error:
        log_error("Interplanetary subscribers unavailable", error=str(event_bus_error))
        return None


async def handle_interplanetary_event(subject: str, payload: dict):
    record_event(subject, payload, source="subscriber")
    log_info("Interplanetary event consumed", subject=subject)


def get_interplanetary_subscribers_state() -> dict:
    return {
        "enabled": bool(_SUBSCRIBERS_STATE.get("enabled", False)),
        "reason": _SUBSCRIBERS_STATE.get("reason"),
        "subjects": list(_SUBSCRIBERS_STATE.get("subjects", [])),
    }


async def start_interplanetary_subscribers() -> dict:
    event_bus = _resolve_event_bus()
    if event_bus is None:
        _SUBSCRIBERS_STATE.update({
            "enabled": False,
            "reason": "event_bus_unavailable",
            "subjects": [],
        })
        return get_interplanetary_subscribers_state()

    subscribed = []
    for subject in INTERPLANETARY_SUBJECTS:
        try:
            async def callback(payload, _subject=subject):
                await handle_interplanetary_event(_subject, payload)

            await event_bus.subscribe(subject, callback)
            subscribed.append(subject)
        except Exception as subscribe_error:
            log_error(
                "Failed to subscribe interplanetary subject",
                subject=subject,
                error=str(subscribe_error),
            )

    _SUBSCRIBERS_STATE.update({
        "enabled": len(subscribed) > 0,
        "reason": "running" if len(subscribed) > 0 else "no_subjects_subscribed",
        "subjects": subscribed,
    })
    return get_interplanetary_subscribers_state()
