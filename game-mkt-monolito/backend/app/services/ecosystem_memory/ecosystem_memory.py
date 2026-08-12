from __future__ import annotations

from time import time
from typing import Any


class EcosystemMemory:
    def __init__(self) -> None:
        self.memory: list[dict[str, Any]] = []

    def store(self, event: dict[str, Any]) -> dict[str, bool]:
        self.memory.append({
            **event,
            "timestamp": int(time() * 1000),
        })
        return {"stored": True}

    def recover(self) -> list[dict[str, Any]]:
        return self.memory
