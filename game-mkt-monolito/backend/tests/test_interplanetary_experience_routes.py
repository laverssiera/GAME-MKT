import asyncio
import os
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from fastapi import HTTPException

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")


def _load(name: str, rel: str):
    path = Path(__file__).resolve().parents[1] / rel
    spec = spec_from_file_location(name, path)
    assert spec and spec.loader
    mod = module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


interplanetary_mod = _load("interplanetary_route", "app/api/routes/interplanetary_experience.py")
telemetry_mod = _load("interplanetary_telemetry", "app/services/interplanetary_telemetry.py")


def run(coro):
    return asyncio.run(coro)


def test_catalog_returns_items():
    result = run(interplanetary_mod.catalog())

    assert result["total"] >= 3
    assert isinstance(result["items"], list)


def test_telemetry_endpoint_returns_snapshot_shape():
    result = run(interplanetary_mod.telemetry())
    assert isinstance(result["total_events"], int)
    assert result["total_events"] >= 0
    assert isinstance(result["events_by_subject"], dict)
    assert isinstance(result["recent_events"], list)


def test_create_and_simulate_and_purchase_flow():
    create_payload = interplanetary_mod.InterplanetaryExperienceCreateRequest(
        title="Mars Condo Demo",
        scenario="morar_em_marte",
        location="mars",
        base_price=500000,
    )
    created = run(interplanetary_mod.create(create_payload))

    assert created["status"] == "created"
    assert created["event"] == "game.interplanetary.experience.started"

    simulate_payload = interplanetary_mod.InterplanetaryExperienceSimulateRequest(
        experience_id=created["experience_id"],
        immersion_level=0.9,
        emotional_engagement=0.85,
        technical_friction=0.1,
    )
    simulated = run(interplanetary_mod.simulate(simulate_payload))

    assert simulated["event"] == "game.interplanetary.experience.completed"
    assert 0 <= simulated["projected_conversion"] <= 1

    purchase_payload = interplanetary_mod.InterplanetaryExperiencePurchaseRequest(
        experience_id=created["experience_id"],
        customer_id="cust-001",
        buyer_tier="premium",
    )
    purchased = run(interplanetary_mod.purchase(purchase_payload))

    assert purchased["status"] == "closed"
    assert purchased["event"] == "game.holographic.sale.closed"
    assert purchased["final_price"] > created["base_price"]


def test_flow_publishes_expected_nats_events():
    class FakeBus:
        def __init__(self):
            self.published = []

        async def publish(self, subject, payload):
            self.published.append((subject, payload))

    fake_bus = FakeBus()
    original_resolve_event_bus = interplanetary_mod._resolve_event_bus

    try:
        interplanetary_mod._resolve_event_bus = lambda: fake_bus

        created = run(
            interplanetary_mod.create(
                interplanetary_mod.InterplanetaryExperienceCreateRequest(
                    title="Orbital Lab",
                    scenario="colonia_orbital",
                    location="orbital-stations",
                    base_price=600000,
                )
            )
        )

        run(
            interplanetary_mod.simulate(
                interplanetary_mod.InterplanetaryExperienceSimulateRequest(
                    experience_id=created["experience_id"],
                    immersion_level=0.85,
                    emotional_engagement=0.8,
                    technical_friction=0.15,
                )
            )
        )

        run(
            interplanetary_mod.purchase(
                interplanetary_mod.InterplanetaryExperiencePurchaseRequest(
                    experience_id=created["experience_id"],
                    customer_id="cust-evt-1",
                    buyer_tier="institutional",
                )
            )
        )
    finally:
        interplanetary_mod._resolve_event_bus = original_resolve_event_bus

    subjects = [subject for subject, _payload in fake_bus.published]
    assert "game.interplanetary.experience.started" in subjects
    assert "game.interplanetary.experience.completed" in subjects
    assert "game.holographic.sale.closed" in subjects
    assert len(fake_bus.published) == 3


def test_simulate_unknown_experience_returns_404():
    payload = interplanetary_mod.InterplanetaryExperienceSimulateRequest(
        experience_id="exp-nao-existe",
        immersion_level=0.7,
        emotional_engagement=0.7,
        technical_friction=0.2,
    )

    try:
        run(interplanetary_mod.simulate(payload))
        assert False, "expected HTTPException"
    except HTTPException as exc:
        assert exc.status_code == 404
        assert exc.detail == "experience_not_found"
