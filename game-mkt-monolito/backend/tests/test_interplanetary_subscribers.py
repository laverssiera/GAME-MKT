import asyncio
import importlib
import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")


subscribers_mod = importlib.import_module("app.events.interplanetary_subscribers")
telemetry_mod = importlib.import_module("app.services.interplanetary_telemetry")


def run(coro):
    return asyncio.run(coro)


def test_handle_interplanetary_event_updates_telemetry_snapshot():
    telemetry_mod.reset_snapshot()

    run(
        subscribers_mod.handle_interplanetary_event(
            "gamemkt.holographic.experience.started",
            {"experience_id": "exp-123", "title": "Mars"},
        )
    )

    snapshot = telemetry_mod.get_snapshot()
    assert snapshot["total_events"] == 1
    assert snapshot["events_by_subject"]["gamemkt.holographic.experience.started"] == 1
    assert len(snapshot["recent_events"]) == 1


def test_start_subscribers_returns_disabled_without_event_bus():
    original_resolve_event_bus = subscribers_mod._resolve_event_bus
    try:
        subscribers_mod._resolve_event_bus = lambda: None
        result = run(subscribers_mod.start_interplanetary_subscribers())
    finally:
        subscribers_mod._resolve_event_bus = original_resolve_event_bus

    assert result["enabled"] is False
    assert result["reason"] == "event_bus_unavailable"


def test_start_subscribers_updates_state_with_fake_bus():
    class FakeBus:
        def __init__(self):
            self.subjects = []

        async def subscribe(self, subject, callback):
            self.subjects.append(subject)

    fake_bus = FakeBus()
    original_resolve_event_bus = subscribers_mod._resolve_event_bus

    try:
        subscribers_mod._resolve_event_bus = lambda: fake_bus
        result = run(subscribers_mod.start_interplanetary_subscribers())
    finally:
        subscribers_mod._resolve_event_bus = original_resolve_event_bus

    state = subscribers_mod.get_interplanetary_subscribers_state()
    assert result["enabled"] is True
    assert result["reason"] == "running"
    assert len(result["subjects"]) == len(subscribers_mod.INTERPLANETARY_SUBJECTS)
    assert state == result
