from models.graph import EvidencePackage, RiskResponse

class EvidenceBuilder:
    def __init__(self):
        pass

    def build_package(self, complaint_id: str, risk_report: RiskResponse, timeline: list, network_data: dict = None) -> EvidencePackage:
        """
        Compiles all the AI findings, graph screenshots (mocked), and timelines into a court-ready package.
        """
        formatted_timeline = []
        for t in timeline:
            if hasattr(t, "model_dump"):
                formatted_timeline.append(t.model_dump())
            elif isinstance(t, dict):
                formatted_timeline.append(t)
            else:
                formatted_timeline.append(str(t))
                
        node_count = len(network_data.get("nodes", [])) if network_data else 0
        edge_count = len(network_data.get("edges", [])) if network_data else 0
                
        return EvidencePackage(
            complaint_id=complaint_id,
            timeline=formatted_timeline,
            graph_snapshot={"nodes": node_count, "edges": edge_count, "screenshot_url": "mock_graph_img.png"},
            risk_report=risk_report,
            download_url=f"/api/actions/evidence/{complaint_id}/download"
        )

builder = EvidenceBuilder()

def get_evidence_builder():
    return builder
