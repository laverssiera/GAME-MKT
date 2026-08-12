import os
from datetime import datetime, timedelta
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

_composer_path = Path(__file__).resolve().parents[1] / "app" / "api" / "routes" / "composer.py"
_spec = spec_from_file_location("composer_route_module", _composer_path)
assert _spec is not None and _spec.loader is not None
composer_module = module_from_spec(_spec)
_spec.loader.exec_module(composer_module)

RescheduleRequest = composer_module.RescheduleRequest
UpdateExecutionStatusRequest = composer_module.UpdateExecutionStatusRequest
list_bundle_executions = composer_module.list_bundle_executions
reschedule_execution = composer_module.reschedule_execution
update_execution_status = composer_module.update_execution_status


class FakeQuery:
    def __init__(self, data):
        self._data = data

    def filter(self, *_args, **_kwargs):
        return self

    def order_by(self, *_args, **_kwargs):
        return self

    def first(self):
        return self._data[0] if self._data else None

    def all(self):
        return self._data


class FakeSession:
    def __init__(self, bundles=None, executions=None):
        self.bundles = bundles or []
        self.executions = executions or []
        self.committed = False
        self.refreshed = False

    def query(self, model):
        model_name = model.__name__
        if model_name == "Bundle":
            return FakeQuery(self.bundles)
        return FakeQuery(self.executions)

    def commit(self):
        self.committed = True

    def refresh(self, _obj):
        self.refreshed = True


@pytest.mark.asyncio
async def test_reschedule_completed_execution_returns_409():
    execution = SimpleNamespace(
        id="exec-1",
        status="completed",
        timeline_end=datetime.utcnow() + timedelta(days=10),
    )
    db = FakeSession(executions=[execution])

    with pytest.raises(HTTPException) as exc:
        await reschedule_execution("exec-1", RescheduleRequest(days_adjustment=7), db=db)

    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_update_execution_status_invalid_transition_returns_409():
    execution = SimpleNamespace(
        id="exec-1",
        status="completed",
        progress=100,
        current_phase="Delivery completed",
        bundle_id="bundle-1",
        timeline_start=datetime.utcnow(),
        timeline_end=datetime.utcnow() + timedelta(days=1),
        teams_active='["archimedes"]',
        risks="[]",
    )
    db = FakeSession(executions=[execution])

    with pytest.raises(HTTPException) as exc:
        await update_execution_status(
            "exec-1",
            UpdateExecutionStatusRequest(status="in_progress", progress=80),
            db=db,
        )

    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_list_bundle_executions_returns_history():
    bundle = SimpleNamespace(id="bundle-1")
    execution = SimpleNamespace(
        id="exec-1",
        status="created",
        progress=0,
        current_phase="Kick-off",
        bundle_id="bundle-1",
        timeline_start=datetime.utcnow(),
        timeline_end=datetime.utcnow() + timedelta(days=30),
        teams_active='["archimedes", "john"]',
        risks="[]",
        created_at=datetime.utcnow(),
    )
    db = FakeSession(bundles=[bundle], executions=[execution])

    result = await list_bundle_executions("bundle-1", db=db)

    assert result["bundle_id"] == "bundle-1"
    assert result["total"] == 1
    assert result["executions"][0]["status"] == "created"
