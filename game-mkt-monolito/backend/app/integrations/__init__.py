import httpx
from typing import Any

from app.core.config import get_settings

settings = get_settings()


class JohnIntegration:
    """Integration with John Brasileiro AI"""
    
    base_url = settings.john_base_url
    
    @staticmethod
    async def notify_new_lead(lead_data: dict[str, Any]):
        """Notify John about new lead"""
        async with httpx.AsyncClient() as client:
            try:
                await client.post(
                    f"{settings.john_base_url}/integrations/game-mkt/lead/create",
                    json=lead_data,
                    timeout=10.0
                )
            except Exception as e:
                print(f"Error notifying John: {e}")
    
    @staticmethod
    async def qualify_lead(lead_id: str, email: str) -> dict[str, Any]:
        """Qualify lead using John's AI"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{settings.john_base_url}/integrations/game-mkt/lead/qualify",
                    json={"lead_id": lead_id, "email": email},
                    timeout=10.0
                )
                return response.json()
            except Exception as e:
                print(f"Error qualifying lead: {e}")
                return {}


class CefeidaIntegration:
    """Integration with Cefeida Analytics"""
    
    @staticmethod
    async def analyze_campaign(campaign_data: dict[str, Any]) -> dict[str, Any]:
        """Analyze campaign using Cefeida BI"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{settings.cefeida_base_url}/integrations/game-mkt/analyze",
                    json=campaign_data,
                    timeout=10.0
                )
                return response.json()
            except Exception as e:
                print(f"Error analyzing campaign: {e}")
                return {}
    
    @staticmethod
    async def get_market_intelligence(metric: str) -> dict[str, Any]:
        """Get market intelligence from Cefeida"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{settings.cefeida_base_url}/integrations/game-mkt/intelligence",
                    params={"metric": metric},
                    timeout=10.0
                )
                return response.json()
            except Exception as e:
                print(f"Error getting intelligence: {e}")
                return {}


class ArchimedesIntegration:
    """Integration with Archimedes Real Estate"""
    
    @staticmethod
    async def get_projects() -> list[dict[str, Any]]:
        """Get available projects from Archimedes"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{settings.archimedes_base_url}/integrations/game-mkt/projects",
                    timeout=10.0
                )
                return response.json()
            except Exception as e:
                print(f"Error getting projects: {e}")
                return []
