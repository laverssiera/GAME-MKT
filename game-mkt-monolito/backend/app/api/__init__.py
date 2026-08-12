from fastapi import APIRouter

from app.api.routes.leads import router as leads_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.composer import router as composer_router
from app.api.routes.campaigns import router as campaigns_router
from app.api.routes.pricing import router as pricing_router
from app.api.routes.omnichannel import router as omnichannel_router
from app.api.routes.sales import router as sales_router
from app.api.routes.federation import router as federation_router
from app.api.routes.campaign_contracts import router as campaign_contracts_router
from app.api.routes.growth_runtime import router as growth_runtime_router
from app.api.routes.predictive_lead_ai import router as predictive_lead_ai_router
from app.api.routes.interplanetary_experience import router as interplanetary_experience_router
from app.api.routes.interplanetary import router as interplanetary_router
from app.api.routes.interplanetary_runtime import router as interplanetary_runtime_router
from app.api.routes.marketing import router as marketing_router
from app.api.routes.earth_market_adoption_runtime import router as earth_market_adoption_runtime_router

router = APIRouter()

router.include_router(leads_router)
router.include_router(dashboard_router)
router.include_router(composer_router)
router.include_router(campaigns_router)
router.include_router(pricing_router)
router.include_router(omnichannel_router)
router.include_router(sales_router)
router.include_router(federation_router)
router.include_router(campaign_contracts_router)
router.include_router(growth_runtime_router)
router.include_router(predictive_lead_ai_router)
router.include_router(interplanetary_experience_router)
router.include_router(interplanetary_router)
router.include_router(marketing_router, prefix="/marketing", tags=["Marketing"])
router.include_router(interplanetary_runtime_router)
router.include_router(earth_market_adoption_runtime_router)
