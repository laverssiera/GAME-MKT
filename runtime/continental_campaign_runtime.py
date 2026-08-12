from __future__ import annotations

import argparse
import json


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(value, high))


def _status(score: float) -> str:
    if score >= 0.8:
        return "high-confidence"
    if score >= 0.6:
        return "viable"
    if score >= 0.45:
        return "conditional"
    return "low-priority"


def plan_continental_campaign(payload: dict) -> dict:
    campaign_budget = max(float(payload.get("campaign_budget", 0.0)), 0.0)
    market_signal = _clamp(float(payload.get("market_signal", 0.5)))
    demand_score = _clamp(float(payload.get("demand_score", 0.5)))
    response_score = _clamp(float(payload.get("response_score", 0.5)))
    channel_count = max(int(payload.get("channel_count", 1)), 1)
    channels = payload.get("campaign_channels", ["digital", "retail"])

    efficiency_index = _clamp((0.45 * market_signal) + (0.35 * demand_score) + (0.20 * response_score))
    recommended_budget = round(campaign_budget * (0.3 + 0.8 * efficiency_index) / max(channel_count, 1), 2)
    score = _clamp((0.5 * efficiency_index) + (0.5 * min(1.0, len(channels) / 5)))

    return {
        "market_name": payload.get("market_name", "continental_market"),
        "summary": {
            "score": round(score, 4),
            "status": _status(score),
            "recommended_budget": recommended_budget,
            "signal": "positive" if score >= 0.7 else "watch" if score >= 0.45 else "attention",
        },
        "channels": list(channels),
        "planning": {
            "base_budget": round(campaign_budget, 2),
            "efficiency_index": round(efficiency_index, 4),
            "channel_count": channel_count,
            "recommended_focus": "acquire early demand with high-trust channels" if score >= 0.6 else "support conversion before scale",
        },
    }


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Continental campaign planning runtime")
    parser.add_argument("--campaign-budget", type=float, default=150000.0)
    parser.add_argument("--market-signal", type=float, default=0.68)
    parser.add_argument("--demand-score", type=float, default=0.72)
    parser.add_argument("--response-score", type=float, default=0.66)
    parser.add_argument("--channel-count", type=int, default=3)
    parser.add_argument("--campaign-channels", nargs="*", default=["digital", "retail", "partners"])
    return parser


def main() -> None:
    args = _build_parser().parse_args()
    payload = {
        "campaign_budget": args.campaign_budget,
        "market_signal": args.market_signal,
        "demand_score": args.demand_score,
        "response_score": args.response_score,
        "channel_count": args.channel_count,
        "campaign_channels": args.campaign_channels,
    }
    print(json.dumps(plan_continental_campaign(payload), indent=2))


if __name__ == "__main__":
    main()
