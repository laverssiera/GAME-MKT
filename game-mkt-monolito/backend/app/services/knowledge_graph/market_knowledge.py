from __future__ import annotations


class MarketKnowledgeGraph:
    def build(self) -> dict[str, list[str]]:
        return {
            "nodes": [
                "housing",
                "education",
                "fusion_energy",
                "orbital_real_estate",
                "terraforming",
                "planetary_logistics",
                "martian_experience",
            ],
            "relationships": [
                "customer_desire",
                "social_impact",
                "economic_growth",
                "housing_access",
                "infrastructure_creation",
            ],
        }
