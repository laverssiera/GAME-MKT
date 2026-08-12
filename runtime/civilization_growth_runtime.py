from __future__ import annotations

import argparse
import json
import sys
import importlib.util
from pathlib import Path

# Allow importing backend services when running from repository root.
REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_SRC = REPO_ROOT / "game-mkt-monolito" / "backend"
if str(BACKEND_SRC) not in sys.path:
    sys.path.insert(0, str(BACKEND_SRC))

def _load_module_from_file(module_path: Path):
    spec = importlib.util.spec_from_file_location(module_path.stem, module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load module from {module_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


growth_runtime = _load_module_from_file(BACKEND_SRC / "app" / "services" / "growth_runtime.py")
build_growth_plan = growth_runtime.build_growth_plan
evaluate_cycle = growth_runtime.evaluate_cycle
forecast_metric = growth_runtime.forecast_metric


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Civilization growth runtime")
    parser.add_argument("--baseline", type=float, default=320.0)
    parser.add_argument("--target", type=float, default=520.0)
    parser.add_argument("--horizon-days", type=int, default=90)
    parser.add_argument("--budget", type=float, default=50000.0)
    parser.add_argument("--expected-delta", type=float, default=140.0)
    parser.add_argument("--observed-delta", type=float, default=118.0)
    parser.add_argument("--burn-rate", type=float, default=0.93)
    parser.add_argument("--current-value", type=float, default=320.0)
    parser.add_argument("--weekly-growth-rate", type=float, default=0.08)
    parser.add_argument("--weeks", type=int, default=12)
    return parser


def main() -> None:
    args = _build_parser().parse_args()
    growth_plan_payload = {
        "north_star_metric": "socially-qualified-pipeline",
        "baseline": args.baseline,
        "target": args.target,
        "horizon_days": args.horizon_days,
        "budget": args.budget,
        "experiments": [
            {"name": "Community Challenge", "channel": "community", "impact": 8, "confidence": 0.8, "effort": 3},
            {"name": "Creator Live Funnel", "channel": "social", "impact": 7, "confidence": 0.7, "effort": 2.5},
            {"name": "Referral Squad", "channel": "referral", "impact": 6, "confidence": 0.75, "effort": 2},
        ],
    }

    cycle_payload = {
        "expected_delta": args.expected_delta,
        "observed_delta": args.observed_delta,
        "burn_rate": args.burn_rate,
    }

    forecast_payload = {
        "current_value": args.current_value,
        "weekly_growth_rate": args.weekly_growth_rate,
        "weeks": args.weeks,
    }

    result = {
        "plan": build_growth_plan(growth_plan_payload),
        "cycle": evaluate_cycle(cycle_payload),
        "forecast": forecast_metric(forecast_payload),
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
