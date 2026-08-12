from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from app.observability.logger import log_error
from app.events.interplanetary_subscribers import get_interplanetary_subscribers_state
from app.services.interplanetary_telemetry import get_snapshot
from app.services.autonomous_sdr import JohnSDR
from app.services.causal_runtime import CausalEngine
from app.services.civilization_branding import CivilizationBranding
from app.services.ecosystem_memory import EcosystemMemory
from app.services.federation_authority import FederationAuthority
from app.services.interplanetary_sales import InterplanetarySales
from app.services.knowledge_graph import MarketKnowledgeGraph
from app.services.observability import runtime_metrics
from app.services.observability import UnifiedObservability
from app.services.orbital_marketplace import OrbitalMarketplace
from app.services.planetary_campaigns import PlanetaryCampaignEngine
from app.services.runtime_economy import DynamicPricingEngine

router = APIRouter(prefix="/api/interplanetary/runtime", tags=["interplanetary-runtime-core"])


class FederationLeadRequest(BaseModel):
    email: str


class CausalRuntimeRequest(BaseModel):
    lead_drop: float = Field(default=0, ge=0)
    pricing_increase: float = Field(default=0, ge=0)


class DynamicPricingRequest(BaseModel):
    base_price: float = Field(ge=0)
    demand: float = Field(default=0, ge=0)
    scarcity: float = Field(default=0, ge=0)


class InterplanetaryProposalRequest(BaseModel):
    customer: str | None = None


class OrbitalAssetRequest(BaseModel):
    asset_type: str


class EcosystemMemoryStoreRequest(BaseModel):
    subject: str
    payload: dict = Field(default_factory=dict)


class ObservabilitySignalRequest(BaseModel):
    source: str
    metric: str
    value: float


class PlanetaryCampaignRequest(BaseModel):
    target_planet: str


class JohnSDRRequest(BaseModel):
    customer: str


_ecosystem_memory = EcosystemMemory()


def _resolve_event_bus():
    try:
        from app.events.bus import get_event_bus

        return get_event_bus()
    except Exception as event_bus_error:
        log_error("Event bus unavailable", error=str(event_bus_error))
        return None


async def _publish_best_effort(subject: str, payload: dict):
    try:
        event_bus = _resolve_event_bus()
        if event_bus is None:
            return
        await event_bus.publish(subject, payload)
    except Exception as event_error:
        log_error("Failed to publish runtime event", subject=subject, error=str(event_error))


@router.post("/federation/register-lead")
async def register_federated_lead(payload: FederationLeadRequest):
    authority = FederationAuthority()
    result = authority.register_lead(payload.model_dump())
    runtime_metrics["federation_leads"] += 1
    await _publish_best_effort("gamemkt.lead.federated", result)
    return result


@router.post("/causal/analyze")
async def causal_analyze(payload: CausalRuntimeRequest):
    engine = CausalEngine()
    result = engine.analyze(payload.model_dump())
    if result.get("severity") == "HIGH":
        runtime_metrics["causal_alerts"] += 1
        await _publish_best_effort("gamemkt.runtime.causal.alert", result)
    return result


@router.post("/economy/pricing/calculate")
async def calculate_dynamic_pricing(payload: DynamicPricingRequest):
    engine = DynamicPricingEngine()
    result = engine.calculate(payload.model_dump())
    await _publish_best_effort("gamemkt.pricing.dynamic.updated", result)
    return result


@router.post("/sales/proposal")
async def generate_interplanetary_proposal(payload: InterplanetaryProposalRequest):
    sales = InterplanetarySales()
    result = sales.generate_proposal(payload.model_dump())
    runtime_metrics["interplanetary_sales"] += 1
    await _publish_best_effort("gamemkt.sales.contract.generated", result)
    return result


@router.post("/marketplace/asset")
async def create_orbital_asset(payload: OrbitalAssetRequest):
    marketplace = OrbitalMarketplace()
    result = marketplace.create_asset(payload.model_dump())
    await _publish_best_effort("gamemkt.market.signal.detected", result)
    return result


@router.get("/knowledge-graph/build")
async def build_market_knowledge_graph():
    graph = MarketKnowledgeGraph().build()
    await _publish_best_effort(
        "gamemkt.collective.behavior.updated",
        {
            "nodes": len(graph.get("nodes", [])),
            "relationships": len(graph.get("relationships", [])),
        },
    )
    return graph


@router.post("/ecosystem-memory/store")
async def store_ecosystem_event(payload: EcosystemMemoryStoreRequest):
    result = _ecosystem_memory.store(payload.model_dump())
    await _publish_best_effort("gamemkt.observability.signal", payload.model_dump())
    return result


@router.get("/ecosystem-memory/recover")
async def recover_ecosystem_events():
    return {"events": _ecosystem_memory.recover()}


@router.post("/observability/signal")
async def emit_runtime_signal(payload: ObservabilitySignalRequest):
    signal = UnifiedObservability().emit_signal(
        source=payload.source,
        metric=payload.metric,
        value=payload.value,
    )
    await _publish_best_effort("gamemkt.observability.signal", signal)
    return signal


@router.post("/campaigns/planetary")
async def create_planetary_campaign(payload: PlanetaryCampaignRequest):
    campaign = PlanetaryCampaignEngine().create_campaign(payload.model_dump())
    runtime_metrics["planetary_campaigns"] += 1
    await _publish_best_effort("gamemkt.campaign.planetary.started", campaign)
    return campaign


@router.post("/autonomous-sdr/negotiate")
async def negotiate_with_john(payload: JohnSDRRequest):
    negotiation = JohnSDR().negotiate(payload.model_dump())
    if negotiation.get("probability_close", 0) >= 0.9:
        runtime_metrics["predictive_closings"] += 1
    await _publish_best_effort("gamemkt.sales.negotiation.started", negotiation)
    return negotiation


@router.get("/civilization-branding/narrative")
async def generate_civilization_narrative():
    narrative = CivilizationBranding().generate_narrative()
    await _publish_best_effort("gamemkt.brand.civilization.updated", narrative)
    return narrative


@router.get("/command-center/overview")
async def get_command_center_overview():
    telemetry = get_snapshot()
    memory_events = _ecosystem_memory.recover()

    return {
        "runtime": "GAME_MKT",
        "command_center": {
            "live_economy_runtime": {
                "interplanetary_sales": runtime_metrics.get("interplanetary_sales", 0),
                "planetary_campaigns": runtime_metrics.get("planetary_campaigns", 0),
                "gross_revenue": telemetry.get("gross_revenue", 0.0),
            },
            "predictive_war_room": {
                "causal_alerts": runtime_metrics.get("causal_alerts", 0),
                "predictive_closings": runtime_metrics.get("predictive_closings", 0),
            },
            "holographic_operations": {
                "holographic_sessions": runtime_metrics.get("holographic_sessions", 0),
            },
            "autonomous_sales_civilization": {
                "federation_leads": runtime_metrics.get("federation_leads", 0),
            },
        },
        "subscribers": get_interplanetary_subscribers_state(),
        "telemetry": telemetry,
        "ecosystem_memory": {
            "total_events": len(memory_events),
            "recent_events": memory_events[-10:],
        },
    }


@router.get("/command-center/live")
async def get_command_center_live(
    window_hours: int = Query(default=24, ge=1, le=168),
    limit: int = Query(default=20, ge=1, le=200),
):
    telemetry = get_snapshot()
    telemetry_events = telemetry.get("recent_events", [])
    memory_events = _ecosystem_memory.recover()

    threshold = datetime.now(timezone.utc) - timedelta(hours=window_hours)

    filtered_telemetry = []
    for event in telemetry_events:
        recorded_at = event.get("recorded_at")
        try:
            if not recorded_at:
                continue
            event_dt = datetime.fromisoformat(str(recorded_at).replace("Z", "+00:00"))
            if event_dt >= threshold:
                filtered_telemetry.append(event)
        except ValueError:
            continue

    threshold_ms = int(threshold.timestamp() * 1000)
    filtered_memory = [
        event for event in memory_events if int(event.get("timestamp", 0)) >= threshold_ms
    ]

    sales_events = [
        event for event in filtered_telemetry if event.get("subject") == "gamemkt.sales.closed"
    ]
    sales_revenue = round(
        sum(float(event.get("payload", {}).get("final_price", 0.0)) for event in sales_events),
        2,
    )

    return {
        "runtime": "GAME_MKT",
        "window_hours": window_hours,
        "stream": {
            "telemetry_events": len(filtered_telemetry),
            "memory_events": len(filtered_memory),
            "sales_closed": len(sales_events),
            "sales_revenue": sales_revenue,
            "causal_alerts": runtime_metrics.get("causal_alerts", 0),
            "predictive_closings": runtime_metrics.get("predictive_closings", 0),
        },
        "latest": {
            "telemetry": filtered_telemetry[-limit:],
            "memory": filtered_memory[-limit:],
        },
    }
