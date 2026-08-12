from __future__ import annotations

from typing import Any
from uuid import uuid4


class OrbitalMarketplace:
    def create_asset(self, payload: dict[str, Any]) -> dict[str, Any]:
        return {
            "asset_id": str(uuid4()),
            "asset_type": payload.get("asset_type"),
            "market": [
                "earth",
                "mars",
                "lunar_colonies",
                "orbital_trade",
            ],
            "tradable": True,
        }
