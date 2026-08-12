import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME_PATH = ROOT / "runtime" / "continental_market_simulation_runtime.py"

spec = importlib.util.spec_from_file_location("continental_market_simulation_runtime", RUNTIME_PATH)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)


def test_simulate_continental_market_reacts_to_policy_infrastructure_and_investment():
    result = module.simulate_continental_market(
        {
            "market_name": "South Atlantic Corridor",
            "policy_impact": 0.82,
            "infrastructure_quality": 0.76,
            "investment_capacity": 0.74,
            "regulatory_support": 0.79,
            "consumer_trust": 0.7,
            "competitor_pressure": 0.28,
            "baseline_demand": 0.68,
            "price_accessibility": 0.72,
            "campaign_budget": 180000.0,
            "campaign_channels": ["digital", "regional_partnerships", "retail"],
            "population_size": 3_500_000,
        }
    )

    assert 0 <= result["summary"]["overall_score"] <= 1
    assert result["summary"]["status"] in {"accelerating", "positive", "watch", "stabilizing"}
    assert result["market_response"]["summary"]["score"] >= 0.5
    assert result["demand"]["summary"]["score"] >= 0.5
    assert result["campaign"]["summary"]["recommended_budget"] > 0


def test_simulate_continental_market_clamps_invalid_inputs():
    result = module.simulate_continental_market(
        {
            "policy_impact": 2.0,
            "infrastructure_quality": -1.0,
            "investment_capacity": 5.0,
            "regulatory_support": 0.1,
            "consumer_trust": -0.5,
            "competitor_pressure": 4.0,
            "baseline_demand": 3.0,
            "price_accessibility": 0.2,
            "campaign_budget": -50.0,
            "population_size": 0,
        }
    )

    for key in ["demand", "market_response", "campaign"]:
        assert key in result

    assert 0 <= result["summary"]["overall_score"] <= 1
    assert result["campaign"]["summary"]["recommended_budget"] >= 0
