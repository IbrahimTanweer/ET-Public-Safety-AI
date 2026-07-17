from fastapi import APIRouter, HTTPException
from models.complaint import ComplaintRequest, ComplaintResponse
from services.agents.extractor_agent import get_extractor_agent
from services.agents.resolution_agent import get_resolution_agent
from services.deduplicator import get_deduplicator
from services.graph_builder import get_graph_builder
from services.feature_store import get_feature_store
import uuid

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

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
    builder = get_graph_builder()
    builder.build_complaint_graph(complaint_id, entities)
    
    return ComplaintResponse(
        message="Complaint processed successfully.",
        complaint_id=complaint_id,
        is_duplicate=False,
        entities_extracted=entities,
        timeline=timeline,
        audit_logs=audit
    )
