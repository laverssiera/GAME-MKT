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


route_mod = _load("earth_market_adoption_route", "app/api/routes/earth_market_adoption_runtime.py")


def run(coro):
    return asyncio.run(coro)


def test_earth_market_adoption_evaluate_returns_six_dimensions():
    payload = route_mod.EarthMarketAdoptionRequest(
        population_size=1_000_000,
        reachable_population=700_000,
    )

    result = run(route_mod.evaluate(payload))

    assert result["wave"] == "P15"
    assert result["runtime"] == "earth_market_adoption"
    assert len(result["dimensions"]) == 6
    assert 0 <= result["summary"]["overall_readiness"] <= 1


def test_earth_market_adoption_simulate_returns_consolidated_score_bounds():
    payload = route_mod.EarthMarketAdoptionSimulationRequest(
        population_size=1_200_000,
        reachable_population=800_000,
        reputation_score=0.84,
        adoption_rate=0.69,
        engagement_rate=0.77,
    )

    result = run(route_mod.simulate(payload))

    assert result["wave"] == "P15"
    assert result["runtime"] == "earth_market_adoption_simulation"
    assert 0 <= result["summary"]["consolidated_score"] <= 1
    assert "adoption" in result["modules"]
    assert "market_context" in result["modules"]
