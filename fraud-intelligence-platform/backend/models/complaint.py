from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TimelineEvent(BaseModel):
    timestamp: datetime
    event_type: str
    description: str

class AuditLog(BaseModel):
    agent_name: str
    decision: str
    confidence: float
    timestamp: datetime = datetime.now()

class ComplaintRequest(BaseModel):
    complaint: str

class ExtractedEntities(BaseModel):
    phone: Optional[str] = None
    upi: Optional[str] = None
    bank: Optional[str] = None
    website: Optional[str] = None
    amount: Optional[float] = None
    scam_type: Optional[str] = None

class ComplaintResponse(BaseModel):
    message: str
    complaint_id: str
    is_duplicate: bool = False
    entities_extracted: Optional[ExtractedEntities] = None
    timeline: Optional[List[TimelineEvent]] = None
    audit_logs: Optional[List[AuditLog]] = None
