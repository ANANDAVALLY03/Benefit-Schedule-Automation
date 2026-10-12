from fastapi import FastAPI
from routes.document_routes import router as document_router

app = FastAPI(
    title="CANOPY Benefit Schedule Automation API",
    version="1.0.0"
)

app.include_router(document_router)
