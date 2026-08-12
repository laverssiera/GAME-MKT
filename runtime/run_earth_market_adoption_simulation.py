from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

RUNTIME_DIR = Path(__file__).resolve().parent
PYTHON = sys.executable


def _run(script_name: str, script_args: list[str] | None = None) -> dict:
    script_path = RUNTIME_DIR / script_name
    command = [PYTHON, str(script_path)]
    if script_args:
        command.extend(script_args)

    completed = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(completed.stdout)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run consolidated WAVE P15 market adoption simulation")

    parser.add_argument("--population-size", type=int, default=1_500_000)
    parser.add_argument("--reachable-population", type=int, default=900_000)
    parser.add_argument("--awareness-rate", type=float, default=0.62)
    parser.add_argument("--trial-rate", type=float, default=0.49)
    parser.add_argument("--repeat-rate", type=float, default=0.57)
    parser.add_argument("--organic-growth", type=float, default=0.45)
    parser.add_argument("--trust-index", type=float, default=0.64)
    parser.add_argument("--utility-score", type=float, default=0.70)
    parser.add_argument("--price-accessibility", type=float, default=0.58)
    parser.add_argument("--social-proof", type=float, default=0.52)
    parser.add_argument("--campaign-reach", type=float, default=0.66)
    parser.add_argument("--campaign-quality", type=float, default=0.60)
    parser.add_argument("--campaign-frequency", type=float, default=5.0)
    parser.add_argument("--base-demand", type=float, default=0.61)
    parser.add_argument("--seasonality", type=float, default=0.54)
    parser.add_argument("--supply-friction", type=float, default=0.26)
    parser.add_argument("--basket-growth", type=float, default=0.46)
    parser.add_argument("--churn-rate", type=float, default=0.29)
    parser.add_argument("--stakeholder-alignment", type=float, default=0.63)
    parser.add_argument("--partner-activation", type=float, default=0.55)
    parser.add_argument("--regulator-support", type=float, default=0.48)
    parser.add_argument("--community-advocacy", type=float, default=0.60)

    parser.add_argument("--reputation-score", type=float, default=0.81)
    parser.add_argument("--campaign-budget", type=float, default=120000.0)
    parser.add_argument("--campaign-channels", nargs="*", default=["social", "email"])
    parser.add_argument("--active-users", type=int, default=1820)
    parser.add_argument("--engagement-rate", type=float, default=0.74)
    parser.add_argument("--adoption-rate", type=float, default=0.64)
    return parser


def main() -> None:
    args = _build_parser().parse_args()

    adoption_args = [
        "--population-size", str(args.population_size),
        "--reachable-population", str(args.reachable_population),
        "--awareness-rate", str(args.awareness_rate),
        "--trial-rate", str(args.trial_rate),
        "--repeat-rate", str(args.repeat_rate),
        "--organic-growth", str(args.organic_growth),
        "--trust-index", str(args.trust_index),
        "--utility-score", str(args.utility_score),
        "--price-accessibility", str(args.price_accessibility),
        "--social-proof", str(args.social_proof),
        "--campaign-reach", str(args.campaign_reach),
        "--campaign-quality", str(args.campaign_quality),
        "--campaign-frequency", str(args.campaign_frequency),
        "--base-demand", str(args.base_demand),
        "--seasonality", str(args.seasonality),
        "--supply-friction", str(args.supply_friction),
        "--basket-growth", str(args.basket_growth),
        "--churn-rate", str(args.churn_rate),
        "--stakeholder-alignment", str(args.stakeholder_alignment),
        "--partner-activation", str(args.partner_activation),
        "--regulator-support", str(args.regulator_support),
        "--community-advocacy", str(args.community_advocacy),
    ]

    market_args = [
        "--reputation-score", str(args.reputation_score),
        "--campaign-budget", str(args.campaign_budget),
        "--active-users", str(args.active_users),
        "--engagement-rate", str(args.engagement_rate),
        "--adoption-rate", str(args.adoption_rate),
        "--campaign-channels", *args.campaign_channels,
    ]

    adoption = _run("earth_market_adoption_runtime.py", adoption_args)
    market = _run("global_market_runtime.py", market_args)

    adoption_score = float(adoption["summary"]["overall_readiness"])
    market_score = float(market["overall_score"])
    consolidated_score = round((0.6 * adoption_score) + (0.4 * market_score), 4)

    if consolidated_score >= 0.75:
        status = "strong"
        signal = "positive"
    elif consolidated_score >= 0.55:
        status = "moderate"
        signal = "watch"
    else:
        status = "low"
        signal = "critical"

    result = {
        "wave": "P15",
        "runtime": "earth_market_adoption_simulation",
        "modules": {
            "adoption": adoption,
            "global_market": market,
        },
        "summary": {
            "consolidated_score": consolidated_score,
            "status": status,
            "signal": signal,
            "critical_dimensions": adoption["summary"]["critical_dimensions"],
            "watch_dimensions": adoption["summary"]["watch_dimensions"],
        },
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()