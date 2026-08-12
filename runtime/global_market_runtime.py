from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_SRC = REPO_ROOT / "game-mkt-monolito" / "backend"
if str(BACKEND_SRC) not in sys.path:
    sys.path.insert(0, str(BACKEND_SRC))


def _load_function_from_file(module_path: Path, function_name: str):
    spec = importlib.util.spec_from_file_location(module_path.stem, module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load module from {module_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return getattr(module, function_name)


create_campaign = _load_function_from_file(
    BACKEND_SRC / "app" / "services" / "campaign_runtime.py",
    "create_campaign",
)
measure_community_health = _load_function_from_file(
    BACKEND_SRC / "app" / "services" / "community_runtime.py",
    "measure_community_health",
)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Global market runtime")
    parser.add_argument("--reputation-score", type=float, default=0.81)
    parser.add_argument("--campaign-budget", type=float, default=120000.0)
    parser.add_argument("--campaign-channels", nargs="*", default=["social", "email"])
    parser.add_argument("--active-users", type=int, default=1820)
    parser.add_argument("--engagement-rate", type=float, default=0.74)
    parser.add_argument("--adoption-rate", type=float, default=0.64)
    parser.add_argument("--community-health-threshold", type=float, default=50.0)
    return parser


def _score_reputation(reputation_score: float) -> dict:
    if reputation_score >= 0.8:
        status = "strong"
    elif reputation_score >= 0.6:
        status = "stable"
    else:
        status = "fragile"

    return {
        "reputation_score": round(reputation_score, 2),
        "status": status,
        "signal": "positive" if status != "fragile" else "attention",
    }


def _score_adoption(adoption_rate: float) -> dict:
    return {
        "adoption_rate": round(adoption_rate, 2),
        "status": "accelerating" if adoption_rate >= 0.6 else "emerging",
        "signal": "positive" if adoption_rate >= 0.6 else "watch",
    }


def monitor_market(payload: dict) -> dict:
    campaign = create_campaign(
        {
            "name": payload.get("campaign_name", "Global Market Monitor"),
            "budget": payload.get("campaign_budget", 0),
            "channels": payload.get("campaign_channels", ["social", "email"]),
        }
    )
    community = measure_community_health(
        {
            "active_users": payload.get("active_users", 0),
            "engagement_rate": payload.get("engagement_rate", 0),
        }
    )

    reputation = _score_reputation(float(payload.get("reputation_score", 0)))
    adoption = _score_adoption(float(payload.get("adoption_rate", 0)))

    overall_score = round(
        (
            reputation_score := float(payload.get("reputation_score", 0))
            + adoption["adoption_rate"]
            + (community["health_score"] / 100)
        )
        / 3,
        2,
    )

    return {
        "market_monitor": {
            "reputation": reputation,
            "campaigns": {
                "campaign_id": campaign["campaign_id"],
                "name": campaign["name"],
                "status": campaign["status"],
                "budget": campaign["budget"],
                "channels": campaign["channels"],
            },
            "adoption": adoption,
            "community": {
                "active_users": community["active_users"],
                "engagement_rate": community["engagement_rate"],
                "health_score": community["health_score"],
                "status": community["status"],
            },
        },
        "overall_score": overall_score,
        "summary": {
            "status": "healthy" if overall_score >= 0.7 else "watch",
            "focus": [
                "reputation",
                "campaigns",
                "adoption",
                "community",
            ],
        },
    }


def main() -> None:
    args = _build_parser().parse_args()
    payload = {
        "campaign_name": "Global Market Monitor",
        "campaign_budget": args.campaign_budget,
        "campaign_channels": args.campaign_channels,
        "active_users": args.active_users,
        "engagement_rate": args.engagement_rate,
        "reputation_score": args.reputation_score,
        "adoption_rate": args.adoption_rate,
    }
    result = monitor_market(payload)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
