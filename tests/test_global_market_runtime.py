import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME_PATH = ROOT / "runtime" / "global_market_runtime.py"

spec = importlib.util.spec_from_file_location("global_market_runtime", RUNTIME_PATH)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)


def test_monitor_market_reports_all_domains():
    result = module.monitor_market(
        {
            "campaign_name": "Launch Monitor",
            "campaign_budget": 50000,
            "campaign_channels": ["social", "email"],
            "active_users": 1000,
            "engagement_rate": 0.7,
            "reputation_score": 0.85,
            "adoption_rate": 0.65,
        }
    )

    market = result["market_monitor"]
    assert set(market.keys()) == {"reputation", "campaigns", "adoption", "community"}
    assert result["summary"]["focus"] == ["reputation", "campaigns", "adoption", "community"]
    assert result["overall_score"] >= 0
