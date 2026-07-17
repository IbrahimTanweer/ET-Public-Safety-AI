from models.graph import EvidencePackage, RiskResponse

class EvidenceBuilder:
    def __init__(self):
        pass

    def build_package(self, complaint_id: str, risk_report: RiskResponse, timeline: list) -> EvidencePackage:
        """
        Compiles all the AI findings, graph screenshots (mocked), and timelines into a court-ready package.
        """
        return EvidencePackage(
            complaint_id=complaint_id,
            timeline=[t.model_dump() for t in timeline],
            graph_snapshot={"nodes": 12, "edges": 15, "screenshot_url": "mock_graph_img.png"},
            risk_report=risk_report,
            download_url=f"/api/actions/evidence/{complaint_id}/download"
        )

builder = EvidenceBuilder()

def get_evidence_builder():
    return builder
