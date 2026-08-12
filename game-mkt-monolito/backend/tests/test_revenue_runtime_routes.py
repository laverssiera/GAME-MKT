"""
Tests for the four revenue runtime route modules.
Routes that use DB are exercised with a real SQLite in-memory session.
Pure-logic routes (pricing, omnichannel router/broadcast) are called directly.
"""
import asyncio
import os
import sys
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

# Stub NATS so the chain import succeeds in this environment
for _mod in ["nats", "nats.aio", "nats.aio.client"]:
    sys.modules.setdefault(_mod, type(sys)(_mod))
setattr(sys.modules["nats.aio.client"], "Client", object)


def _load(name: str, rel: str):
    path = Path(__file__).resolve().parents[1] / rel
    spec = spec_from_file_location(name, path)
    assert spec and spec.loader
    mod = module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


pricing_mod = _load("pricing_route", "app/api/routes/pricing.py")
omni_mod = _load("omni_route", "app/api/routes/omnichannel.py")
sales_mod = _load("sales_route", "app/api/routes/sales.py")
fed_mod = _load("fed_route", "app/api/routes/federation.py")

# ── SQLite in-memory session factory for DB-backed routes ────────────────────
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

_test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

# Use regular imports so models register exactly once with the shared Base.metadata
import app.models  # noqa: E402  registers all models with Base.metadata
from app.db.session import Base  # noqa: E402

Base.metadata.create_all(bind=_test_engine)
TestSession = sessionmaker(bind=_test_engine, autocommit=False, autoflush=False)


def _db():
    return TestSession()


def run(coro):
    return asyncio.run(coro)


# ── Pricing tests (pure logic, no DB) ───────────────────────────────────────

def test_pricing_calculate_matches_bundle_example():
    payload = pricing_mod.PricingRequest(
        bundle_id="condominio-inteligente",
        customer_profile="enterprise",
        components=[
            pricing_mod.PricingComponent(name="Obra", category="obra", amount=1_800_000),
            pricing_mod.PricingComponent(name="IoT", category="iot", amount=240_000),
            pricing_mod.PricingComponent(name="John AI", category="john_ai", amount=80_000),
            pricing_mod.PricingComponent(name="Observabilidade", category="observability", amount=120_000),
            pricing_mod.PricingComponent(name="Facilities", category="facilities", amount=300_000),
        ],
    )
    result = run(pricing_mod.calculate(payload))
    assert result["base_price"] == 2_540_000
    assert result["discount"] == 0.12
    assert result["final_price"] == 2_235_200
    assert result["margin_percent"] == 43.2
    assert result["risk_label"] == "baixo"


def test_pricing_simulation_returns_scenarios():
    payload = pricing_mod.PricingSimulationRequest(
        bundle_id="bundle-1",
        components=[pricing_mod.PricingComponent(name="John AI", category="john_ai", amount=80_000)],
        market_volatility=0.1,
    )
    result = run(pricing_mod.simulate(payload))
    assert result["recommended_price"] > 0
    assert set(result["scenarios"].keys()) == {"conservative", "base", "aggressive"}


# ── Omnichannel tests (router is pure logic, send uses DB) ───────────────────

def test_omnichannel_router_fallback_progression():
    first = run(omni_mod.route(omni_mod.RouterRequest(attempted_channels=["whatsapp"])))
    second = run(omni_mod.route(omni_mod.RouterRequest(attempted_channels=["whatsapp", "email"])))
    assert first["next_channel"] == "email"
    assert second["next_channel"] == "push"


def test_omnichannel_send_persists_session():
    db = _db()
    try:
        result = run(omni_mod.send(omni_mod.SendRequest(channel="whatsapp", recipient="+5511999", message="Oi"), db=db))
        assert "session_id" in result
        assert result["channel"] == "whatsapp"
        assert result["status"] == "queued"
    finally:
        db.close()


# ── Sales tests (DB required) ────────────────────────────────────────────────

def test_sales_negotiation_requires_approval_for_mid_discount():
    db = _db()
    try:
        opp = run(sales_mod.opportunity(
            sales_mod.OpportunityRequest(lead_id="lead-1", estimated_value=500_000), db=db
        ))
        prop = run(sales_mod.proposal(
            sales_mod.ProposalRequest(
                opportunity_id=opp["opportunity_id"],
                bundle_id="bundle-1",
                price=500_000,
                discount=0.08,
            ),
            db=db,
        ))
        result = run(sales_mod.negotiate_proposal(
            sales_mod.NegotiateRequest(
                proposal_id=prop["proposal_id"],
                requested_discount=0.14,
                risk_score=0.35,
            ),
            db=db,
        ))
        assert result["status"] == "approval_required"
    finally:
        db.close()


def test_sales_close_updates_stage():
    db = _db()
    try:
        opp = run(sales_mod.opportunity(
            sales_mod.OpportunityRequest(lead_id="lead-2", estimated_value=200_000, stage="negotiation"), db=db
        ))
        closed = run(sales_mod.close(
            sales_mod.CloseRequest(opportunity_id=opp["opportunity_id"], outcome="won", contract_value=195_000.0),
            db=db,
        ))
        assert closed["stage"] == "won"
        assert closed["contract_value"] == 195_000.0
        assert closed["closed_at"] is not None
    finally:
        db.close()


# ── Federation tests (DB required) ───────────────────────────────────────────

def test_federation_resolves_same_identity_and_scores_trust():
    db = _db()
    try:
        first = run(fed_mod.ingest_profile(
            fed_mod.IngestRequest(
                name="Maria Silva", email="maria@example.com",
                whatsapp="5511999999999", channels=["whatsapp"], source="ads",
            ),
            db=db,
        ))
        second = run(fed_mod.ingest_profile(
            fed_mod.IngestRequest(
                name="Maria S.", email="maria@example.com",
                phone="5511999999999", channels=["email", "portal"], source="portal",
            ),
            db=db,
        ))
        resolved = run(fed_mod.resolve_profile(fed_mod.ResolveRequest(email="maria@example.com"), db=db))
        trust = run(fed_mod.profile_trust_score(fed_mod.TrustScoreRequest(email="maria@example.com"), db=db))

        assert first["profile_id"] == second["profile_id"]
        assert resolved["resolved"] is True
        assert trust["trust_score"] >= 0.75
        assert trust["quality"] == "high"
    finally:
        db.close()


def test_federation_merge_two_profiles():
    db = _db()
    try:
        a = run(fed_mod.ingest_profile(
            fed_mod.IngestRequest(email="a@test.com", source="form"), db=db
        ))
        b = run(fed_mod.ingest_profile(
            fed_mod.IngestRequest(phone="5521888888888", source="ads"), db=db
        ))
        result = run(fed_mod.merge_profiles(
            fed_mod.MergeRequest(primary_id=a["profile_id"], secondary_id=b["profile_id"]),
            db=db,
        ))
        assert result["status"] == "merged"
        assert result["profile_id"] == a["profile_id"]
    finally:
        db.close()
