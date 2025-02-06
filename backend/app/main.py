from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import whiteboard, node, subject, connection, interaction_history, report

import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="Whiteboard API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4173", "http://127.0.0.1:4173"],  # Replace with your frontend's origin(s)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all HTTP headers
)

# Register your routes
app.include_router(whiteboard.router, prefix="/api/whiteboard", tags=["Whiteboard"])
app.include_router(node.router, prefix="/api/node", tags=["Node"])
app.include_router(subject.router, prefix="/api/subject", tags=["Subject"])
app.include_router(connection.router, prefix="/api/connection", tags=["Connection"])
app.include_router(interaction_history.router, prefix="/api/interaction_history", tags=["InteractionHistory"])
app.include_router(report.router, prefix="/api/report", tags=["Report"])


