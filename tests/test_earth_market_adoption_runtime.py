import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME_PATH = ROOT / "runtime" / "earth_market_adoption_runtime.py"

spec = importlib.util.spec_from_file_location("earth_market_adoption_runtime", RUNTIME_PATH)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)


def test_evaluate_earth_market_adoption_bounds_and_projection_consistency():
    result = module.evaluate_earth_market_adoption(
        {
            "population_size": 2_000_000,
            "reachable_population": 1_200_000,
            "awareness_rate": 0.78,
            "trial_rate": 0.62,
            "repeat_rate": 0.66,
            "organic_growth": 0.59,
            "trust_index": 0.71,
            "utility_score": 0.8,
            "price_accessibility": 0.61,
            "social_proof": 0.69,
            "campaign_reach": 0.73,
            "campaign_quality": 0.7,
            "campaign_frequency": 6,
            "base_demand": 0.75,
            "seasonality": 0.6,
            "supply_friction": 0.2,
            "basket_growth": 0.57,
            "churn_rate": 0.18,
            "stakeholder_alignment": 0.72,
            "partner_activation": 0.66,
            "regulator_support": 0.58,
            "community_advocacy": 0.7,
        }
    )

    for _, dim in result["dimensions"].items():
        assert 0 <= dim["score"] <= 1

    summary = result["summary"]
    projections = result["projections"]

    assert 0 <= summary["overall_readiness"] <= 1
    assert projections["expected_adopters"] >= 0
    assert projections["projected_demand_units"] >= 0
    assert projections["expected_adopters"] <= projections["reachable_population"]
    assert projections["adoption_gap"] == projections["reachable_population"] - projections["expected_adopters"]


def test_evaluate_earth_market_adoption_clamps_out_of_range_inputs():
    result = module.evaluate_earth_market_adoption(
        {
            "population_size": 100,
            "reachable_population": 200,
            "awareness_rate": 5,
            "trial_rate": -2,
            "repeat_rate": 3,
            "organic_growth": -1,
            "trust_index": 2,
            "utility_score": -0.5,
            "price_accessibility": 2,
            "social_proof": -2,
            "campaign_reach": 3,
            "campaign_quality": 2,
            "campaign_frequency": 20,
            "base_demand": 2,
            "seasonality": -1,
            "supply_friction": 2,
            "basket_growth": 4,
            "churn_rate": 5,
            "stakeholder_alignment": 3,
            "partner_activation": 2,
            "regulator_support": -3,
            "community_advocacy": 4,
        }
    )

    for _, dim in result["dimensions"].items():
        assert 0 <= dim["score"] <= 1

    assert 0 <= result["summary"]["overall_readiness"] <= 1
    assert result["projections"]["reachable_population"] <= result["projections"]["population_size"]
