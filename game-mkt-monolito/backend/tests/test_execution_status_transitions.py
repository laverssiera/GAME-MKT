from app.domain.execution_workflow import is_valid_status_transition


def test_same_status_is_idempotent():
    assert is_valid_status_transition("created", "created") is True


def test_created_to_in_progress_is_valid():
    assert is_valid_status_transition("created", "in_progress") is True


def test_created_to_completed_is_invalid():
    assert is_valid_status_transition("created", "completed") is False


def test_in_progress_to_completed_is_valid():
    assert is_valid_status_transition("in_progress", "completed") is True


def test_completed_to_in_progress_is_invalid():
    assert is_valid_status_transition("completed", "in_progress") is False


def test_rescheduled_to_in_progress_is_valid():
    assert is_valid_status_transition("rescheduled", "in_progress") is True
