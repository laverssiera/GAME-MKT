from __future__ import annotations

from typing import Any


class CausalEngine:
    def analyze(self, runtime: dict[str, Any]) -> dict[str, Any]:
        if runtime.get("lead_drop", 0) > 40 and runtime.get("pricing_increase", 0) > 20:
            return {
                "severity": "HIGH",
                "cause": "pricing_pressure",
                "effects": [
                    "pipeline_drop",
                    "engagement_fall",
                    "market_retraction",
                ],
            }
        return {"severity": "LOW"}
