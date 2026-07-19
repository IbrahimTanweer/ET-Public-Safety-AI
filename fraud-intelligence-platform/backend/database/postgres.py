# Relational Database Connection (SQLite Engine Fallback)
import sqlite3
import os
from datetime import datetime
from config import config

class RelationalDB:
    def __init__(self):
        self.db_path = "complaints.db"
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 1. Create complaints table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id TEXT PRIMARY KEY,
            text TEXT,
            amount REAL,
            scam_type TEXT,
            created_at TEXT
        )
        """)
        
        # 2. Create timeline events table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS timeline_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id TEXT,
            event_type TEXT,
            description TEXT,
            timestamp TEXT,
            FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
        )
        """)
        
        # 3. Create audit logs table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id TEXT,
            agent_name TEXT,
            decision TEXT,
            confidence REAL,
            timestamp TEXT,
            FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
        )
        """)
        
        conn.commit()
        conn.close()

    def connect(self):
        # Compatibility method
        pass

    def insert_complaint(self, complaint_id: str, text: str, amount: float, scam_type: str):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO complaints (id, text, amount, scam_type, created_at) VALUES (?, ?, ?, ?, ?)",
            (complaint_id, text, amount, scam_type, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()

    def insert_timeline_event(self, complaint_id: str, event_type: str, description: str, timestamp: str = None):
        if not timestamp:
            timestamp = datetime.now().isoformat()
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO timeline_events (complaint_id, event_type, description, timestamp) VALUES (?, ?, ?, ?)",
            (complaint_id, event_type, description, timestamp)
        )
        conn.commit()
        conn.close()

    def insert_audit_log(self, complaint_id: str, agent_name: str, decision: str, confidence: float, timestamp: str = None):
        if not timestamp:
            timestamp = datetime.now().isoformat()
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO audit_logs (complaint_id, agent_name, decision, confidence, timestamp) VALUES (?, ?, ?, ?, ?)",
            (complaint_id, agent_name, decision, confidence, timestamp)
        )
        conn.commit()
        conn.close()

    def get_complaint(self, complaint_id: str) -> dict:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return dict(row)
        return None

    def get_timeline(self, complaint_id: str) -> list[dict]:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM timeline_events WHERE complaint_id = ?", (complaint_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def get_global_metrics(self) -> dict:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total complaints & loss
        cursor.execute("SELECT count(*), sum(amount) FROM complaints")
        total_complaints, total_loss = cursor.fetchone()
        
        # Scam type counts
        cursor.execute("SELECT scam_type, count(*) FROM complaints GROUP BY scam_type")
        scam_types = dict(cursor.fetchall())
        
        conn.close()
        
        return {
            "total_complaints": total_complaints or 0,
            "total_loss": float(total_loss or 0.0),
            "scam_types": scam_types
        }

    def clear_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM complaints")
        cursor.execute("DELETE FROM timeline_events")
        cursor.execute("DELETE FROM audit_logs")
        conn.commit()
        conn.close()

db = RelationalDB()

def get_pg_db():
    return db
