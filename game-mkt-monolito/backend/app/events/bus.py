import asyncio
import json
from typing import Optional

from nats.aio.client import Client as NATS
from app.core.config import get_settings
from app.observability.logger import log_error, log_info

settings = get_settings()


class NatsEventBus:
    """NATS Event Bus for event-driven architecture"""
    
    _instance: Optional['NatsEventBus'] = None
    _nc: Optional[NATS] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    async def connect(self):
        """Connect to NATS server"""
        try:
            self._nc = NATS()
            await self._nc.connect(settings.nats_url)
            log_info("Connected to NATS", server=settings.nats_url)
        except Exception as e:
            log_error("Failed to connect to NATS", error=str(e))
            raise
    
    async def disconnect(self):
        """Disconnect from NATS"""
        if self._nc:
            await self._nc.close()
            log_info("Disconnected from NATS")
    
    async def publish(self, subject: str, payload: dict):
        """Publish event to NATS"""
        try:
            if not self._nc:
                await self.connect()
            
            await self._nc.publish(subject, json.dumps(payload).encode())
            log_info(f"Event published", subject=subject)
        except Exception as e:
            log_error(f"Failed to publish event", subject=subject, error=str(e))
            raise
    
    async def subscribe(self, subject: str, callback):
        """Subscribe to NATS subject"""
        try:
            if not self._nc:
                await self.connect()
            
            async def handler(msg):
                try:
                    payload = json.loads(msg.data.decode())
                    await callback(payload)
                except Exception as e:
                    log_error(f"Error processing message", subject=subject, error=str(e))
            
            await self._nc.subscribe(subject, cb=handler)
            log_info(f"Subscribed to subject", subject=subject)
        except Exception as e:
            log_error(f"Failed to subscribe", subject=subject, error=str(e))
            raise


def get_event_bus() -> NatsEventBus:
    """Get or create event bus instance"""
    return NatsEventBus()
