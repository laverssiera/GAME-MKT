import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


demand_module = _load_module("earth_demand_runtime", ROOT / "runtime" / "earth_demand_runtime.py")
response_module = _load_module("earth_market_response_runtime", ROOT / "runtime" / "earth_market_response_runtime.py")
simulation_module = _load_module("earth_market_simulation_runtime", ROOT / "runtime" / "earth_market_simulation_runtime.py")


def test_earth_demand_runtime_reports_score_and_status():
    result = demand_module.evaluate_earth_demand(
        {
            "market_name": "Earth Market",
            "population_size": 3_200_000,
            "market_size": 0.7,
            "awareness_rate": 0.8,
            "trial_rate": 0.7,
            "repeat_rate": 0.75,
            "price_accessibility": 0.72,
            "competitor_pressure": 0.28,
            "seasonality": 0.66,
        }
    )

    assert 0 <= result["summary"]["score"] <= 1
    assert result["summary"]["status"] in {"strong", "stable", "watch", "fragile"}
    assert result["summary"]["signal"] in {"positive", "watch", "attention", "critical"}


def test_earth_market_response_runtime_scores_reaction():
    result = response_module.evaluate_market_response(
        {
            "market_name": "Earth Market",
            "policy_impact": 0.82,
            "infrastructure_quality": 0.76,
            "investment_capacity": 0.84,
            "regulatory_support": 0.73,
            "consumer_trust": 0.7,
            "competitor_pressure": 0.3,
            "population_size": 3_500_000,
        }
    )

    assert 0 <= result["summary"]["score"] <= 1
    assert result["summary"]["signal"] in {"positive", "watch", "attention"}
    assert result["reaction"]["market_signal"]


def test_earth_market_simulation_runtime_aggregates_components():
    result = simulation_module.simulate_earth_market(
        {
            "market_name": "Earth Market",
            "population_size": 3_500_000,
            "market_size": 0.7,
            "awareness_rate": 0.8,
            "trial_rate": 0.7,
            "repeat_rate": 0.75,
            "price_accessibility": 0.72,
            "competitor_pressure": 0.28,
            "seasonality": 0.66,
            "policy_impact": 0.82,
            "infrastructure_quality": 0.76,
            "investment_capacity": 0.84,
            "regulatory_support": 0.73,
            "consumer_trust": 0.7,
            "campaign_budget": 180000,
            "campaign_channels": ["digital", "retail"],
        }
    )

    assert 0 <= result["summary"]["overall_score"] <= 1
    assert result["demand"]["summary"]["score"] >= 0
    assert result["market_response"]["summary"]["score"] >= 0
    assert result["summary"]["status"] in {"accelerating", "positive", "watch", "stabilizing"}


def test_earth_market_runtime_handles_string_inputs_and_channel_lists():
    demand = demand_module.evaluate_earth_demand(
        {
            "market_name": "Earth Market",
            "population_size": "3200000",
            "market_size": "0.8",
            "awareness_rate": "0.7",
            "trial_rate": "0.6",
            "repeat_rate": "0.72",
            "price_accessibility": "0.9",
            "competitor_pressure": "not-a-number",
            "seasonality": "0.5",
        }
    )
    assert 0 <= demand["summary"]["score"] <= 1
    assert demand["drivers"]["competitor_pressure"] == 0.0

    response = response_module.evaluate_market_response(
        {
            "market_name": "Earth Market",
            "policy_impact": "0.9",
            "infrastructure_quality": "bad",
            "investment_capacity": "0.8",
            "regulatory_support": "0.75",
            "consumer_trust": "0.7",
            "competitor_pressure": "0.2",
            "population_size": "3500000",
        }
    )
    assert 0 <= response["summary"]["score"] <= 1

    simulation = simulation_module.simulate_earth_market(
        {
            "market_name": "Earth Market",
            "population_size": 3500000,
            "market_size": 0.7,
            "awareness_rate": 0.8,
            "trial_rate": 0.7,
            "repeat_rate": 0.75,
            "price_accessibility": 0.72,
            "competitor_pressure": 0.28,
            "seasonality": 0.66,
            "policy_impact": 0.82,
            "infrastructure_quality": 0.76,
            "investment_capacity": 0.84,
            "regulatory_support": 0.73,
            "consumer_trust": 0.7,
            "campaign_budget": "180000",
            "campaign_channels": "digital,retail,partners",
        }
    )
    assert simulation["campaign"]["channels"] == ["digital", "retail", "partners"]
