from fastapi import APIRouter
from services.campaign_detector import get_campaign_detector
from services.prioritizer import get_prioritizer
from services.agents.memory_agent import get_memory_agent

router = APIRouter(prefix="/api/campaigns", tags=["Campaigns"])

@router.get("/")
async def list_and_rank_campaigns():
    # Mocking that we found 3 fraud campaigns
    detector = get_campaign_detector()
    camp1 = detector.cluster_campaigns(["COMP-1", "COMP-2"])
    camp2 = detector.cluster_campaigns(["COMP-3", "COMP-4", "COMP-5"])
    
    # Prioritize them
    prioritizer = get_prioritizer()
    ranked = prioritizer.rank_investigations([camp1, camp2])
    
    return {"ranked_campaigns": ranked}

@router.post("/{campaign_id}/summarize")
async def summarize_campaign(campaign_id: str):
    detector = get_campaign_detector()
    camp = detector.cluster_campaigns([]) # Mocked fetch
    
    memory = get_memory_agent()
    summary = memory.summarize_campaign(camp)
    
    return {"campaign_id": campaign_id, "ai_summary": summary}
