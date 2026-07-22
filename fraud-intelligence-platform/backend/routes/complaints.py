from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.complaint import ComplaintRequest, ComplaintResponse
from services.agents.extractor_agent import get_extractor_agent
from services.agents.resolution_agent import get_resolution_agent
from services.deduplicator import get_deduplicator
from services.graph_builder import get_graph_builder
from services.feature_store import get_feature_store
from database.postgres import get_pg_db
import uuid
import hashlib

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.get("/")
async def get_all_complaints():
    db = get_pg_db()
    complaints = db.get_all_complaints()
    return {"complaints": complaints}

@router.post("/", response_model=ComplaintResponse)
async def upload_complaint(request: ComplaintRequest):
    # 1. Detect Duplicates
    dedup = get_deduplicator()
    existing_id = dedup.get_existing_id(request.complaint)
    if existing_id:
        return ComplaintResponse(
            message="Duplicate complaint detected. Merging into existing investigation.",
            complaint_id=existing_id,
            is_duplicate=True
        )
    
    complaint_id = f"COMP-{str(uuid.uuid4())[:8]}"
    dedup.register_complaint(request.complaint, complaint_id)
    
    # 2. Extract Entities, Timeline, and Audit via Agent
    extractor = get_extractor_agent()
    entities, timeline, audit = extractor.extract_and_audit(request.complaint)
    
    # 3. Normalize Entities
    resolver = get_resolution_agent()
    entities = resolver.normalize_entities(entities)
    
    # 4. Update Feature Store
    feature_store = get_feature_store()
    if entities.phone:
        feature_store.update_entity_features(entities.phone, entities.amount or 0.0)
    
    # 5. Build Graph in Neo4j
    complaint_hash = hashlib.md5(request.complaint.encode('utf-8')).hexdigest()
    amount = entities.amount or 0.0
    
    builder = get_graph_builder()
    builder.build_complaint_graph(
        complaint_id, 
        entities, 
        text=request.complaint, 
        amount=amount, 
        hash_val=complaint_hash
    )
    
    if not builder.validate_graph_creation(complaint_id):
        raise HTTPException(status_code=500, detail="Graph validation failed. Relationships were not properly created in Neo4j.")
    
    # 6. Save in Relational Database (SQLite)
    db = get_pg_db()
    db.insert_complaint(complaint_id, request.complaint, amount, entities.scam_type or "Unknown")
    for event in timeline:
        t_str = event.timestamp.isoformat() if hasattr(event.timestamp, "isoformat") else str(event.timestamp)
        db.insert_timeline_event(complaint_id, event.event_type, event.description, t_str)
    for log in audit:
        t_str = log.timestamp.isoformat() if hasattr(log.timestamp, "isoformat") else str(log.timestamp)
        db.insert_audit_log(complaint_id, log.agent_name, log.decision, log.confidence, t_str)
    
    return ComplaintResponse(
        message="Complaint processed successfully.",
        complaint_id=complaint_id,
        is_duplicate=False,
        entities_extracted=entities,
        timeline=timeline,
        audit_logs=audit
    )

class BulkComplaintRequest(BaseModel):
    complaints: list[str]

@router.post("/bulk")
async def bulk_upload_complaints(request: BulkComplaintRequest):
    results = []
    db = get_pg_db()
    
    for comp_text in request.complaints:
        # Check duplicates
        dedup = get_deduplicator()
        existing_id = dedup.get_existing_id(comp_text)
        if existing_id:
            results.append({
                "complaint": comp_text[:50] + "...",
                "status": "duplicate",
                "complaint_id": existing_id
            })
            continue
            
        complaint_id = f"COMP-{str(uuid.uuid4())[:8]}"
        
        # Ingest and process
        extractor = get_extractor_agent()
        entities, timeline, audit = extractor.extract_and_audit(comp_text)
        
        resolver = get_resolution_agent()
        entities = resolver.normalize_entities(entities)
        
        feature_store = get_feature_store()
        if entities.phone:
            feature_store.update_entity_features(entities.phone, entities.amount or 0.0)
            
        complaint_hash = hashlib.md5(comp_text.encode('utf-8')).hexdigest()
        amount = entities.amount or 0.0
        
        builder = get_graph_builder()
        builder.build_complaint_graph(
            complaint_id, 
            entities, 
            text=comp_text, 
            amount=amount, 
            hash_val=complaint_hash
        )
        
        if not builder.validate_graph_creation(complaint_id):
            results.append({
                "complaint": comp_text[:50] + "...",
                "status": "failed_graph_validation",
                "complaint_id": complaint_id
            })
            continue
        
        # Save SQL entries
        db.insert_complaint(complaint_id, comp_text, amount, entities.scam_type or "Unknown")
        for event in timeline:
            t_str = event.timestamp.isoformat() if hasattr(event.timestamp, "isoformat") else str(event.timestamp)
            db.insert_timeline_event(complaint_id, event.event_type, event.description, t_str)
        for log in audit:
            t_str = log.timestamp.isoformat() if hasattr(log.timestamp, "isoformat") else str(log.timestamp)
            db.insert_audit_log(complaint_id, log.agent_name, log.decision, log.confidence, t_str)
            
        results.append({
            "complaint": comp_text[:50] + "...",
            "status": "processed",
            "complaint_id": complaint_id
        })
        
    return {"message": f"Successfully processed {len(request.complaints)} complaints.", "results": results}
