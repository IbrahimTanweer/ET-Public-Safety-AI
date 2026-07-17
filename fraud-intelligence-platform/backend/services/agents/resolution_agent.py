from models.complaint import ExtractedEntities

class ResolutionAgent:
    def __init__(self):
        pass

    def normalize_entities(self, entities: ExtractedEntities) -> ExtractedEntities:
        """
        Normalizes entities to prevent duplicates.
        e.g., lowercase UPI, standardize phone numbers.
        """
        if entities.upi:
            entities.upi = entities.upi.lower().strip()
        
        if entities.phone:
            # Strip non-numeric and take last 10 digits
            cleaned_phone = "".join(filter(str.isdigit, entities.phone))
            if len(cleaned_phone) >= 10:
                entities.phone = cleaned_phone[-10:]
                
        if entities.website:
            entities.website = entities.website.lower().replace("https://", "").replace("http://", "").strip("/")
            
        return entities

resolution_agent = ResolutionAgent()

def get_resolution_agent():
    return resolution_agent
