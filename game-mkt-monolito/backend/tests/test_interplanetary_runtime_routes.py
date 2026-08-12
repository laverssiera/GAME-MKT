import asyncio
import os
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")


def _load(name: str, rel: str):
    path = Path(__file__).resolve().parents[1] / rel
    spec = spec_from_file_location(name, path)
    assert spec and spec.loader
    mod = module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


runtime_mod = _load("interplanetary_runtime_route", "app/api/routes/interplanetary_runtime.py")


def run(coro):
    return asyncio.run(coro)


def test_register_federated_lead_returns_identity_and_monoliths():
    before = runtime_mod.runtime_metrics["federation_leads"]

    result = run(
        runtime_mod.register_federated_lead(
            runtime_mod.FederationLeadRequest(email="lead@example.com")
        )
    )

    assert "federation_id" in result
    assert result["ecosystem_identity"] == "lead@example.com"
    assert len(result["connected_monoliths"]) == 6
    assert runtime_mod.runtime_metrics["federation_leads"] == before + 1


def test_causal_analyze_high_severity_increments_alert_metric():
    before = runtime_mod.runtime_metrics["causal_alerts"]

    result = run(
        runtime_mod.causal_analyze(
            runtime_mod.CausalRuntimeRequest(lead_drop=55, pricing_increase=25)
        )
    )

    assert result["severity"] == "HIGH"
    assert result["cause"] == "pricing_pressure"
    assert runtime_mod.runtime_metrics["causal_alerts"] == before + 1


def test_dynamic_pricing_returns_final_price_and_multiplier():
    result = run(
        runtime_mod.calculate_dynamic_pricing(
            runtime_mod.DynamicPricingRequest(base_price=1000, demand=20, scarcity=10)
        )
    )

    assert round(result["multiplier"], 2) == 1.4
    assert round(result["final_price"], 2) == 1400.0


def test_sales_proposal_and_marketplace_asset():
    sales_before = runtime_mod.runtime_metrics["interplanetary_sales"]

    proposal = run(
        runtime_mod.generate_interplanetary_proposal(
            runtime_mod.InterplanetaryProposalRequest(customer="Acme")
        )
    )
    asset = run(
        runtime_mod.create_orbital_asset(
            runtime_mod.OrbitalAssetRequest(asset_type="orbital_real_estate")
        )
    )

    assert "proposal_id" in proposal
    assert proposal["projected_revenue"] == 12000000
    assert runtime_mod.runtime_metrics["interplanetary_sales"] == sales_before + 1

    assert "asset_id" in asset
    assert asset["asset_type"] == "orbital_real_estate"
    assert asset["tradable"] is True


def test_knowledge_graph_returns_nodes_and_relationships():
    graph = run(runtime_mod.build_market_knowledge_graph())
    assert "nodes" in graph
    assert "relationships" in graph
    assert len(graph["nodes"]) >= 5
    assert len(graph["relationships"]) >= 3


def test_ecosystem_memory_store_and_recover():
    stored = run(
        runtime_mod.store_ecosystem_event(
            runtime_mod.EcosystemMemoryStoreRequest(
                subject="gamemkt.market.signal.detected",
                payload={"signal": "high-demand"},
            )
        )
    )
    recovered = run(runtime_mod.recover_ecosystem_events())

    assert stored["stored"] is True
    assert len(recovered["events"]) >= 1
    assert recovered["events"][-1]["subject"] == "gamemkt.market.signal.detected"


def test_observability_signal_emits_runtime_name():
    signal = run(
        runtime_mod.emit_runtime_signal(
            runtime_mod.ObservabilitySignalRequest(
                source="runtime-test",
                metric="latency_ms",
                value=17.5,
            )
        )
    )

    assert signal["runtime"] == "GAME_MKT"
    assert signal["metric"] == "latency_ms"
    assert signal["value"] == 17.5


def test_planetary_campaign_increments_metric():
    before = runtime_mod.runtime_metrics["planetary_campaigns"]
    campaign = run(
        runtime_mod.create_planetary_campaign(
            runtime_mod.PlanetaryCampaignRequest(target_planet="mars")
        )
    )

    assert "campaign_id" in campaign
    assert campaign["target_planet"] == "mars"
    assert runtime_mod.runtime_metrics["planetary_campaigns"] == before + 1


def test_john_sdr_and_branding_runtime():
    closings_before = runtime_mod.runtime_metrics["predictive_closings"]

    negotiation = run(
        runtime_mod.negotiate_with_john(
            runtime_mod.JohnSDRRequest(customer="Liceu")
        )
    )
    narrative = run(runtime_mod.generate_civilization_narrative())

    assert "negotiation_id" in negotiation
    assert negotiation["probability_close"] == 0.92
    assert runtime_mod.runtime_metrics["predictive_closings"] == closings_before + 1

    assert "positioning" in narrative
    assert len(narrative["strategic_narratives"]) >= 5


def test_command_center_overview_consolidates_runtime_state():
    run(
        runtime_mod.store_ecosystem_event(
            runtime_mod.EcosystemMemoryStoreRequest(
                subject="gamemkt.observability.signal",
                payload={"metric": "latency_ms", "value": 12.3},
            )
        )
    )
    run(
        runtime_mod.generate_interplanetary_proposal(
            runtime_mod.InterplanetaryProposalRequest(customer="CmdCenter")
        )
    )

    overview = run(runtime_mod.get_command_center_overview())

    assert overview["runtime"] == "GAME_MKT"
    assert "command_center" in overview
    assert "live_economy_runtime" in overview["command_center"]
    assert "predictive_war_room" in overview["command_center"]
    assert "holographic_operations" in overview["command_center"]
    assert "autonomous_sales_civilization" in overview["command_center"]
    assert "subscribers" in overview
    assert "telemetry" in overview
    assert "ecosystem_memory" in overview
    assert overview["command_center"]["live_economy_runtime"]["interplanetary_sales"] >= 1


def test_command_center_live_returns_windowed_stream():
    run(
        runtime_mod.store_ecosystem_event(
            runtime_mod.EcosystemMemoryStoreRequest(
                subject="gamemkt.observability.signal",
                payload={"metric": "throughput", "value": 99},
            )
        )
    )
    run(
        runtime_mod.causal_analyze(
            runtime_mod.CausalRuntimeRequest(lead_drop=48, pricing_increase=24)
        )
    )

    live = run(runtime_mod.get_command_center_live(window_hours=24, limit=5))

    assert live["runtime"] == "GAME_MKT"
    assert live["window_hours"] == 24
    assert "stream" in live
    assert "latest" in live
    assert "telemetry" in live["latest"]
    assert "memory" in live["latest"]
    assert live["stream"]["memory_events"] >= 1
