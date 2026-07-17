from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import complaints, graph, report, campaigns, actions
from database.neo4j_db import close_driver

app = FastAPI(
    title="AI Fraud Intelligence Platform API - Enterprise Edition",
    description="Production-grade Backend for analyzing cybercrime complaints, discovering fraud rings, and dispatching actionable intelligence.",
    version="2.0.0"
)

# Setup CORS for the React Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Should be restricted in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(complaints.router)
app.include_router(campaigns.router)
app.include_router(graph.router)
app.include_router(actions.router)
app.include_router(report.router)

@app.on_event("shutdown")
async def shutdown_event():
    # Close the Neo4j driver connection on shutdown
    close_driver()

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Fraud Intelligence Platform Backend (Enterprise Edition)"}
