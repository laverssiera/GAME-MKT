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


score_lead = _load_function_from_file(
    BACKEND_SRC / "app" / "services" / "lead_scoring_runtime.py",
    "score_lead",
)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Civilization behavior runtime")
    parser.add_argument("--lead-id", default="lead-social-014")
    parser.add_argument("--profile-fit", type=float, default=0.86)
    parser.add_argument("--intent-level", type=float, default=0.72)
    parser.add_argument("--behavioral-score", type=float, default=0.91)
    return parser


def main() -> None:
    args = _build_parser().parse_args()
    payload = {
        "lead_id": args.lead_id,
        "profile_fit": args.profile_fit,
        "intent_level": args.intent_level,
        "behavioral_score": args.behavioral_score,
    }
    result = score_lead(payload)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
