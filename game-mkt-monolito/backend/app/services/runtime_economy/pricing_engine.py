from __future__ import annotations

from typing import Any


class DynamicPricingEngine:
    def calculate(self, payload: dict[str, Any]) -> dict[str, float]:
        demand = float(payload.get("demand", 0))
        scarcity = float(payload.get("scarcity", 0))
        base_price = float(payload.get("base_price", 0))

        multiplier = 1 + (demand * 0.01) + (scarcity * 0.02)
        return {
            "final_price": base_price * multiplier,
            "multiplier": multiplier,
        }
