class ArchimedesConnector:
    async def publish_property_experience(self) -> dict:
        return {
            "synced": True,
            "runtime": "ARCHIMEDES",
            "experiences": [
                "mars_apartment",
                "orbital_office",
                "future_city",
            ],
        }
