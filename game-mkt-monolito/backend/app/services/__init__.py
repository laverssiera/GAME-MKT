from sqlalchemy.orm import Session

from app.models import Lead
from app.observability.logger import log_info, log_error


class LeadService:
    """Service for Lead business logic"""
    
    @staticmethod
    def calculate_score(lead_data: dict) -> int:
        """Calculate lead score"""
        score = 0
        
        # Email validation
        if lead_data.get('email'):
            score += 20
        
        # Phone validation
        if lead_data.get('phone'):
            score += 20
        
        # Source bonus
        source = lead_data.get('source', '').lower()
        if source == 'referral':
            score += 30
        elif source == 'campaign':
            score += 15
        elif source == 'website':
            score += 10
        
        return min(score, 100)  # Max 100
    
    @staticmethod
    def qualify_lead(lead: Lead) -> dict:
        """Qualify a lead"""
        score = lead.score
        
        if score >= 70:
            status = 'hot'
        elif score >= 40:
            status = 'warm'
        else:
            status = 'cold'
        
        log_info(
            "Lead qualified",
            lead_id=str(lead.id),
            score=score,
            status=status
        )
        
        return {
            'lead_id': str(lead.id),
            'score': score,
            'status': status,
            'qualified': score >= 40
        }
    
    @staticmethod
    def enrich_lead(lead_data: dict) -> dict:
        """Enrich lead data (can integrate with external services)"""
        try:
            # Add calculated fields
            lead_data['score'] = LeadService.calculate_score(lead_data)
            return lead_data
        except Exception as e:
            log_error("Error enriching lead", error=str(e))
            return lead_data


class CampaignService:
    """Service for Campaign business logic"""
    
    @staticmethod
    def analyze_campaign(campaign_data: dict) -> dict:
        """Analyze campaign performance"""
        # Placeholder for analytics integration with Cefeida
        return {
            'campaign_id': campaign_data.get('id'),
            'roi': 0,
            'conversion_rate': 0,
            'recommendation': 'Analyse pending'
        }


class BundleService:
    """Service for Bundle/Service Composer business logic"""
    
    @staticmethod
    def compose_bundle(requirements: list[str], constraints: dict) -> dict:
        """Compose a service bundle based on requirements"""
        # This will be enhanced with Service Composer Engine logic
        return {
            'bundle_id': 'pending',
            'requirements': requirements,
            'composition': [],
            'total_price': 0,
            'margin': 0
        }
