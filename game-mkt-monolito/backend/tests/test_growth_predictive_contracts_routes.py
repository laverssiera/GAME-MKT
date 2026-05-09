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


contracts_mod = _load("contracts_route", "app/api/routes/campaign_contracts.py")
growth_mod = _load("growth_route", "app/api/routes/growth_runtime.py")
predictive_mod = _load("predictive_route", "app/api/routes/predictive_lead_ai.py")


def run(coro):
    return asyncio.run(coro)


def test_campaign_contract_draft_contains_required_clauses():
    payload = contracts_mod.ContractCreateRequest(
        campaign_id="camp-1",
        budget=250_000,
        channels=["ads", "email"],
        objectives=["mql", "sql"],
    )
    result = run(contracts_mod.draft_contract(payload))

    assert result["campaign_id"] == "camp-1"
    assert result["tier"] == "scale"
    assert len(result["clauses"]) >= 5


def test_campaign_contract_validation_detects_missing_clause():
    payload = contracts_mod.ContractValidationRequest(
        clauses=[
            contracts_mod.ClauseInput(name="escopo", value="ok"),
            contracts_mod.ClauseInput(name="sla_operacao", value="ok"),
        ]
    )
    result = run(contracts_mod.validate_campaign_contract(payload))

    assert result["valid"] is False
    assert "metrica_sucesso" in result["missing_clauses"]


def test_growth_runtime_plan_ranks_experiments():
    payload = growth_mod.GrowthPlanRequest(
        baseline=120,
        target=240,
        budget=100_000,
        experiments=[
            growth_mod.GrowthExperimentInput(name="Lookalike", impact=8, confidence=0.7, effort=2),
            growth_mod.GrowthExperimentInput(name="SEO cluster", impact=6, confidence=0.8, effort=3),
        ],
    )
    result = run(growth_mod.plan(payload))

    assert result["delta"] == 120
    assert result["experiments"][0]["ice_score"] >= result["experiments"][1]["ice_score"]


def test_growth_runtime_cycle_returns_decision():
    payload = growth_mod.GrowthCycleRequest(expected_delta=100, observed_delta=112, burn_rate=0.95)
    result = run(growth_mod.evaluate(payload))

    assert result["decision"] == "scale"
    assert result["achievement_ratio"] >= 1.1


def test_predictive_lead_ai_score_and_band():
    payload = predictive_mod.LeadSignalInput(
        lead_id="lead-1",
        fit_score=0.9,
        intent_score=0.8,
        engagement_score=0.7,
        recency_score=0.9,
    )
    result = run(predictive_mod.score(payload))

    assert result["score"] >= 80
    assert result["band"] == "hot"


def test_predictive_lead_ai_rank_orders_descending():
    payload = predictive_mod.LeadBatchRequest(
        leads=[
            predictive_mod.LeadSignalInput(lead_id="a", fit_score=0.2, intent_score=0.3, engagement_score=0.2),
            predictive_mod.LeadSignalInput(lead_id="b", fit_score=0.9, intent_score=0.8, engagement_score=0.9),
        ]
    )
    result = run(predictive_mod.rank(payload))

    assert result["total"] == 2
    assert result["leaders"][0]["lead_id"] == "b"