# 🛡️ AI Fraud Intelligence Platform (Enterprise Edition)

### 🚨 ET AI Hackathon 2026 — Problem Statement 6: AI for Digital Public Safety
A production-grade, multi-agent AI and graph-powered cybercrime intelligence platform designed to ingest raw citizen fraud complaints, extract actionable indicators (phones, UPIs, bank names, phishing websites) using Google Gemini LLMs, construct relational audit trails, cluster co-occurring networks in Neo4j to expose coordinated fraud rings, render interactive 3D force-directed knowledge graphs, and compile court-admissible Sec. 65B evidence packages.

---

## 🌟 Key Platform Features

- **🤖 Multi-Agent AI System**:
  - `ExtractorAgent`: Uses **Gemini 3.1 Flash** with structured Pydantic schemas for zero-shot entity extraction (UPI VPAs, Phone Numbers, Targeted Banks, Phishing URLs, Financial Loss Amounts, Scam Types), timeline construction, and confidence audit logging.
  - `ResolutionAgent`: Canonical entity normalization (lowercasing UPI handles, 10-digit mobile standardization, URL cleaning) to ensure deduplication.
  - `MemoryAgent`: Generates concise executive intelligence briefings and maintains campaign memory.
  - `Deduplicator`: MD5 content hashing and graph lookup to automatically detect duplicate complaints and merge investigations.

- **🕸️ Dual-Database Architecture**:
  - **Neo4j Knowledge Graph**: Native property graph storing entities (`Complaint`, `Phone`, `UPI`, `Bank`, `Website`, `ScamType`, `District`, `Officer`, `Status`, `Law`, `Section`) and relationships (`HAS_PHONE`, `HAS_UPI`, `TARGETED_BANK`, `HAS_WEBSITE`, `CLASSIFIED_AS`, etc.) with $\mathcal{O}(1)$ pointer-chasing traversals.
  - **PostgreSQL / SQLite**: High-throughput relational storage for raw complaint text, structured metadata, chronological timeline logs, and agent decision audit trails.

- **⚡ Non-Linear Specificity-Weighted Risk Engine**:
  - Entity specificity multipliers: **UPI Handle ($1.5\times$)**, **Website URL ($2.0\times$)**, **Phone Number ($1.0\times$)**.
  - Logarithmic diminishing scaling ($\log(1 + \text{overlaps})$) so massive infrastructure hubs do not skew linearly.
  - Integration with Threat Intelligence Blacklist Feeds ($+30.0\times \text{weight}$ penalty).
  - Bounded 0–99% risk scores with 100% audit-ready textual explanations.

- **🔍 Autonomous Campaign Detector**:
  - Unsupervised Connected Components (DFS traversal & Cypher matching) automatically clusters isolated complaints sharing infrastructure into organized **Campaigns** (fraud rings).

- **📊 Advanced React 19 + TypeScript Dashboard**:
  - **Interactive 3D Knowledge Graph**: Powered by `Three.js` and `react-force-graph-3d` for dynamic 3D network traversal and node inspection.
  - **2D Network Topology**: Built with `Cytoscape` for fast 2D graph manipulation.
  - **GIS Crime Hotspot Map**: Powered by `Leaflet` / `react-leaflet` for spatial threat intelligence.
  - **Analytics Engine**: Interactive charts using `Recharts` for category distributions and financial loss stats.
  - **Evidence Center**: One-click compilation of court-admissible Sec. 65B evidence dossiers and Gemini-generated Markdown investigation reports.
  - **Action Dispatch**: Automated recommendations for bank account freezing, SIM blocking, and financial alerts.

---

## 📂 Project Architecture & Folder Tree

```text
ET-Public-Safety-AI/
└── fraud-intelligence-platform/
    ├── backend/
    │   ├── database/
    │   │   ├── neo4j_db.py          # Neo4j driver connection & session handlers
    │   │   └── postgres.py          # Relational SQLite/Postgres transaction manager
    │   ├── models/
    │   │   ├── complaint.py         # Pydantic schemas for requests, entities, timelines & audit logs
    │   │   └── graph.py             # Pydantic schemas for nodes, edges, campaigns & risk responses
    │   ├── routes/
    │   │   ├── complaints.py        # Single & bulk complaint ingestion endpoints
    │   │   ├── graph.py             # Network topology (/network/{phone}) & dashboard metrics (/stats)
    │   │   ├── campaigns.py         # Campaign clusters list & AI summarization
    │   │   ├── actions.py           # Recommendations, evidence packages & threat feeds
    │   │   └── report.py            # Gemini investigation report compilation
    │   ├── services/
    │   │   ├── agents/              # Multi-agent core (ExtractorAgent, ResolutionAgent, MemoryAgent)
    │   │   ├── campaign_detector.py # Connected component campaign clustering
    │   │   ├── deduplicator.py      # Hash-based duplicate complaint analyzer
    │   │   ├── feature_store.py     # Graph-backed entity metrics calculator
    │   │   ├── risk_engine.py       # Non-linear specificity-weighted risk scorer
    │   │   ├── recommendation_engine.py # Action dispatch generator (Bank/SIM freeze)
    │   │   ├── evidence_builder.py  # Court-admissible Sec. 65B package compiler
    │   │   └── report_generator.py  # Lead-investigator LLM report compiler
    │   ├── app.py                   # FastAPI initialization & CORS middleware
    │   ├── config.py                # Environment variable loader
    │   └── requirements.txt         # Backend Python dependencies
    │
    └── frontend/
        ├── src/
        │   ├── components/
        │   │   ├── layout/          # MainLayout, Sidebar navigation, Header
        │   │   └── ui/              # Reusable UI cards, buttons, badges, modals
        │   ├── features/
        │   │   ├── command-center/  # Real-time operational dashboard overview
        │   │   ├── investigation/   # Priority investigation queue
        │   │   ├── complaints/      # Single & bulk case intake interface
        │   │   ├── graph/           # 3D/2D Force-Directed Knowledge Graph Visualizer
        │   │   ├── campaigns/       # Campaign intelligence & fraud ring triaging
        │   │   ├── intelligence/    # Threat intelligence feed importer
        │   │   ├── reports/         # Evidence center & Sec. 65B dossier viewer
        │   │   ├── analytics/       # Recharts intelligence analytics
        │   │   └── admin/           # System settings & database reset
        │   ├── App.tsx              # React Router v7 routes configuration
        │   └── main.tsx             # Application root entry point
        ├── package.json             # Frontend npm dependencies
        └── vite.config.ts           # Vite build configuration
```

---

## 🚀 Getting Started

### 1. Backend Setup

#### Prerequisites
- **Python 3.10+**
- (Optional) **Neo4j Desktop / Neo4j AuraDB** (if omitted, standard Bolt connection configuration applies)

#### Setup & Execution
1. Navigate to the backend directory:
   ```bash
   cd fraud-intelligence-platform/backend
   ```
2. Create and activate a virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file inside `fraud-intelligence-platform/backend`:
   ```env
   # Gemini API Key (Required for AI extraction and reports)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Neo4j Database Settings
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=password
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn app:app --reload --port 8000
   ```
   The backend API will run at **`http://localhost:8000`** (Swagger docs at `http://localhost:8000/docs`).

---

### 2. Frontend Setup

#### Prerequisites
- **Node.js 20.19+ / 22.12+**
- **npm** or **yarn**

#### Setup & Execution
1. Navigate to the frontend directory:
   ```bash
   cd fraud-intelligence-platform/frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to **`http://localhost:5173`**.

---

## 🧪 Key API Endpoints (Swagger UI)

Navigate to **`http://localhost:8000/docs`** to test endpoints interactively:

- **Case Intake (`POST /api/complaints/`)**: Submits an unstructured complaint narrative for zero-shot entity extraction, timeline logging, and graph construction.
- **Bulk Batch Ingestion (`POST /api/complaints/bulk`)**: Processes multiple raw complaints in parallel.
- **Dashboard Stats (`GET /api/stats`)**: Fetches relational metrics, total financial losses, scam type distributions, and distinct entity counts.
- **Network Topology (`GET /api/network/{phone}`)**: Queries Neo4j for all connected complaints, nodes, and relationships for a target entity.
- **Risk Assessment (`GET /api/risk/{complaint_id}`)**: Computes non-linear, entity-weighted risk scores and audit explanations.
- **Campaign Intelligence (`GET /api/campaigns/`)**: Runs connected component clustering to list active fraud rings ranked by priority.
- **AI Executive Summary (`POST /api/campaigns/{campaign_id}/summarize`)**: Triggers `MemoryAgent` to compile executive intelligence briefings.
- **Evidence Packages (`GET /api/actions/evidence/{complaint_id}`)**: Generates Sec. 65B compliant evidence dossiers and graph snapshots.
- **AI Report Generator (`POST /api/report/`)**: Invokes Gemini LLM to generate a formal, Markdown-formatted investigation report.
- **Threat Intelligence Import (`POST /api/actions/import_threat_feed`)**: Imports blacklisted phones, UPI VPAs, and URLs directly into Neo4j.
- **Database Reset (`POST /api/actions/reset`)**: Clears both relational and graph databases.