from fastapi import APIRouter
from services.campaign_detector import get_campaign_detector
from services.prioritizer import get_prioritizer
from services.agents.memory_agent import get_memory_agent

router = APIRouter(prefix="/api/campaigns", tags=["Campaigns"])

@router.get("/")
async def list_and_rank_campaigns():
    detector = get_campaign_detector()
    campaigns = detector.detect_campaigns()
    
    # Prioritize them
    prioritizer = get_prioritizer()
    ranked = prioritizer.rank_investigations(campaigns)
    
    return {"ranked_campaigns": ranked}

@router.post("/{campaign_id}/summarize")
async def summarize_campaign(campaign_id: str):
    detector = get_campaign_detector()
    campaigns = detector.detect_campaigns()
    
    target_campaign = None
    for camp in campaigns:
        if camp.campaign_id == campaign_id:
            target_campaign = camp
            break
            
    if not target_campaign:
        from models.graph import Campaign
        target_campaign = Campaign(
            campaign_id=campaign_id,
            name=f"Campaign #{campaign_id}",
            total_victims=2,
            estimated_loss=100000.0,
            summary="A generic scam pattern involving phone/UPI transfer coercion."
        )
    
    memory = get_memory_agent()
    summary = memory.summarize_campaign(target_campaign)
    
    return {"campaign_id": campaign_id, "ai_summary": summary}
