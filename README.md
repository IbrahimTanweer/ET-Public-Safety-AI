# AI-Powered Fraud Intelligence Platform (Enterprise Edition)

### 🚨 ET AI Hackathon 2026 — Problem Statement 6: AI for Digital Public Safety
A production-grade, graph-powered cybercrime intelligence platform designed to ingest raw citizen fraud complaints, extract actionable indicators (phones, UPIs, websites) using Google Gemini, construct relational audit trails, cluster co-occurring networks in Neo4j to expose coordinated fraud rings, and compile court-admissible evidence packages.

---

## 🛠️ The Architecture & How It Works

This platform uses a dual-database architecture paired with Google Gemini NLU models to shift crime investigation from reactive lookups to predictive threat neutralization:

1. **AI Extraction Agent (Gemini)**: Reads incoming complaints and automatically classifies the scam type, resolves financial loss amounts, logs audit trails, and extracts key indicators.
2. **Relational Database Layer (SQLite/Postgres)**: Persists raw complaint rows, chronological timelines, and agent decision trail audit logs.
3. **Graph Intelligence (Neo4j)**: Builds real-time connections between complaints and entities. If multiple complaints share the same Phone, UPI ID, or Phishing Website, a graph link is formed.
4. **Campaign Detector (Union-Find)**: Scans graph components and groups complaints sharing common links into structured **Campaigns** (fraud rings).
5. **AI Report Generator (Gemini)**: Automatically drafts court-admissible Investigation Reports and Executive Briefings based on graph analytics.

---

## 📂 Project Structure

```text
ET-Public-Safety-AI/
└── fraud-intelligence-platform/
    └── backend/
        ├── database/
        │   ├── neo4j_db.py       # Neo4j connection & in-memory graph fallback
        │   └── postgres.py       # SQLite relational transaction engine
        ├── models/
        │   ├── complaint.py      # Pydantic schemas for complaints, timeline & audits
        │   └── graph.py          # Schemas for graph nodes, edges & campaigns
        ├── routes/
        │   ├── complaints.py     # Ingest, bulk upload & processing
        │   ├── graph.py          # Network topology & dashboard metrics (/stats)
        │   ├── campaigns.py      # Campaign clusters list & AI summarization
        │   ├── actions.py        # Recommendations, evidence packages & threat feeds
        │   └── report.py         # Gemini investigation report compilation
        ├── services/
        │   ├── agents/           # Gemini extractor & resolution agents
        │   ├── campaign_detector.py # Connected component campaign builder
        │   ├── deduplicator.py   # Neo4j hash-based duplicate analysis
        │   ├── feature_store.py  # Graph-backed entity metrics calculator
        │   ├── risk_engine.py    # Risk scorer analyzing graph overlaps
        │   └── report_generator.py # Lead-investigator LLM prompt compiler
        ├── .env                  # Local secrets and database credentials
        ├── app.py                # FastAPI app initialization & CORS setup
        └── config.py             # Configuration loader & dotenv parser
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10 or higher**
- (Optional) **Docker Desktop** (if you want to run a local Neo4j database server)

### 2. Installation
Navigate to the backend directory and set up a virtual environment:
```bash
cd fraud-intelligence-platform/backend
python -m venv .venv
```

Activate the environment:
- On **Windows (PowerShell)**: `.venv\Scripts\Activate.ps1`
- On **Windows (Command Prompt)**: `.venv\Scripts\activate.bat`
- On **macOS / Linux**: `source .venv/bin/activate`

Install dependencies:
```bash
pip install -r requirements.txt
```

### 3. Environment Setup
Create a `.env` file in the `fraud-intelligence-platform/backend` folder:
```env
# Gemini API Key (Required for AI extraction and reports)
GEMINI_API_KEY=your_gemini_api_key

# (Optional) Neo4j settings. If empty, the platform automatically 
# launches an in-memory graph database fallback for instant execution.
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
```

### 4. Running the Server
```bash
uvicorn app:app --reload --port 8000
```
The server will start running on **`http://127.0.0.1:8000`**.

---

## 🧪 Testing the APIs (Swagger UI)

Open your browser and navigate to **`http://127.0.0.1:8000/docs`**. You can interactively test the following endpoints:

- **Ingest (`POST /api/complaints/`)**: Submits a new raw complaint text to start the extraction and graph build.
- **Bulk Upload (`POST /api/complaints/bulk`)**: Accepts an array of complaints and processes them in parallel.
- **Dashboard Stats (`GET /api/stats`)**: Queries SQL and Graph databases for global dashboard metrics (total complaints, financial loss, distinct entity counts, scam types).
- **Fraud Network (`GET /api/network/{phone}`)**: Fetches all connected nodes and relationships for a specific phone number.
- **Campaigns (`GET /api/campaigns/`)**: Lists active campaigns detected using connected components.
- **Evidence Packages (`GET /api/actions/evidence/{complaint_id}`)**: Generates court-ready files including risk metrics and timelines.
- **Purge Database (`POST /api/actions/reset`)**: Wipes both SQLite and Graph tables clean to start fresh.