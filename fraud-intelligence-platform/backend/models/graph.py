from pydantic import BaseModel
from typing import List, Any

class GraphNode(BaseModel):
    id: str
    label: str
    properties: dict

class GraphEdge(BaseModel):
    source_id: str
    target_id: str
    relationship_type: str

class FraudNetworkResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    total_complaints: int

class Campaign(BaseModel):
    campaign_id: str
    name: str
    total_victims: int
    estimated_loss: float
    summary: str
    risk_score: float = 0.0
    linked_complaints: List[str] = []

class RiskResponse(BaseModel):
    complaint_id: str
    risk_score: float
    risk_percentage: str
    explanation: str # "97% because Phone appears in 34 complaints..."
    factors: List[str]

class Recommendation(BaseModel):
    action: str
    target: str
    reason: str

class EvidencePackage(BaseModel):
    complaint_id: str
    timeline: List[dict]
    graph_snapshot: dict
    risk_report: RiskResponse
    download_url: str
