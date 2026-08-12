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
    parser = argparse.ArgumentParser(description="Run all ONDA 14 social simulation runtimes")

    parser.add_argument("--active-users", type=int, default=1240)
    parser.add_argument("--engagement-rate", type=float, default=0.68)

    parser.add_argument("--lead-id", default="lead-social-014")
    parser.add_argument("--profile-fit", type=float, default=0.86)
    parser.add_argument("--intent-level", type=float, default=0.72)
    parser.add_argument("--behavioral-score", type=float, default=0.91)

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

    engagement_args = [
        "--active-users", str(args.active_users),
        "--engagement-rate", str(args.engagement_rate),
    ]
    behavior_args = [
        "--lead-id", str(args.lead_id),
        "--profile-fit", str(args.profile_fit),
        "--intent-level", str(args.intent_level),
        "--behavioral-score", str(args.behavioral_score),
    ]
    growth_args = [
        "--baseline", str(args.baseline),
        "--target", str(args.target),
        "--horizon-days", str(args.horizon_days),
        "--budget", str(args.budget),
        "--expected-delta", str(args.expected_delta),
        "--observed-delta", str(args.observed_delta),
        "--burn-rate", str(args.burn_rate),
        "--current-value", str(args.current_value),
        "--weekly-growth-rate", str(args.weekly_growth_rate),
        "--weeks", str(args.weeks),
    ]

    result = {
        "engagement": _run("civilization_engagement_runtime.py", engagement_args),
        "behavior": _run("civilization_behavior_runtime.py", behavior_args),
        "growth": _run("civilization_growth_runtime.py", growth_args),
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
