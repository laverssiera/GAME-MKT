STATUS_TRANSITIONS: dict[str, set[str]] = {
    "created": {"in_progress", "rescheduled"},
    "in_progress": {"rescheduled", "completed"},
    "rescheduled": {"in_progress", "completed"},
    "completed": set(),
}


def is_valid_status_transition(current_status: str, next_status: str) -> bool:
    """Validate allowed transitions in composer execution workflow."""
    if current_status == next_status:
        return True
    return next_status in STATUS_TRANSITIONS.get(current_status, set())
