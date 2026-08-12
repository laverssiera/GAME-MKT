from __future__ import annotations

import argparse
import json
import sys
import importlib.util
from pathlib import Path

# Allow importing backend services when running from repository root.
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


measure_community_health = _load_function_from_file(
    BACKEND_SRC / "app" / "services" / "community_runtime.py",
    "measure_community_health",
)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Civilization engagement runtime")
    parser.add_argument("--active-users", type=int, default=1240)
    parser.add_argument("--engagement-rate", type=float, default=0.68)
    return parser


def main() -> None:
    args = _build_parser().parse_args()
    payload = {
        "active_users": args.active_users,
        "engagement_rate": args.engagement_rate,
    }
    result = measure_community_health(payload)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
