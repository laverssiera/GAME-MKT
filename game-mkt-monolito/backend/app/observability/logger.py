import logging
import json
from datetime import datetime

logger = logging.getLogger("game-mkt")
logger.setLevel(logging.INFO)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
console_handler.setFormatter(formatter)

# Add handler
if not logger.handlers:
    logger.addHandler(console_handler)


def log_info(message: str, **kwargs):
    """Log info level"""
    data = {"timestamp": datetime.utcnow().isoformat(), "message": message, **kwargs}
    logger.info(json.dumps(data))


def log_error(message: str, **kwargs):
    """Log error level"""
    data = {"timestamp": datetime.utcnow().isoformat(), "message": message, **kwargs}
    logger.error(json.dumps(data))


def log_warning(message: str, **kwargs):
    """Log warning level"""
    data = {"timestamp": datetime.utcnow().isoformat(), "message": message, **kwargs}
    logger.warning(json.dumps(data))
