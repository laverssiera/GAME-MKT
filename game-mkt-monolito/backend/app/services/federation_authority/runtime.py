from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


class FederationAuthority:
    def register_lead(self, payload: dict[str, Any]) -> dict[str, Any]:
        return {
            "federation_id": str(uuid4()),
            "ecosystem_identity": payload.get("email"),
            "connected_monoliths": [
                "ARCHIMEDES",
                "CEA",
                "ACADEMIA",
                "P&D",
                "ECONOTECH",
                "JOHN",
            ],
            "created_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        }
