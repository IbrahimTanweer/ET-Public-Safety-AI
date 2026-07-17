class NotificationEngine:
    def __init__(self):
        pass

    def dispatch_alerts(self, complaint_id: str, risk_score: float):
        """
        Mocks the dispatching of automated alerts when risk is extremely high.
        """
        if risk_score > 95:
            # Mock sending notifications
            print(f"[NOTIFICATION] Alerting Investigating Officer: High Priority Complaint {complaint_id}")
            print(f"[NOTIFICATION] Alerting Bank: Freeze requested for {complaint_id}")
            print(f"[NOTIFICATION] Alerting NCRB: Campaign pattern detected in {complaint_id}")
            
        return True

engine = NotificationEngine()

def get_notification_engine():
    return engine
