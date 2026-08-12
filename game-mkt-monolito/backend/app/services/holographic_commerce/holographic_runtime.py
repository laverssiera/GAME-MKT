from __future__ import annotations

from typing import Any
from uuid import uuid4


class HolographicCommerce:
    def create_experience(self, payload: dict[str, Any]) -> dict[str, Any]:
        return {
            "experience_id": str(uuid4()),
            "type": payload.get("type"),
            "destinations": [
                "mars_city",
                "lunar_habitat",
                "orbital_condominium",
                "underwater_city",
                "future_sao_paulo",
            ],
            "monetization": {
                "subscription": True,
                "nft_assets": True,
                "premium_access": True,
            },
        }
