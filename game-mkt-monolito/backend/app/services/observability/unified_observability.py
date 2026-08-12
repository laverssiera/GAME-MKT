from __future__ import annotations

from time import time


class UnifiedObservability:
    def emit_signal(self, source: str, metric: str, value: float) -> dict:
        return {
            "source": source,
            "metric": metric,
            "value": value,
            "timestamp": int(time() * 1000),
            "runtime": "GAME_MKT",
        }
