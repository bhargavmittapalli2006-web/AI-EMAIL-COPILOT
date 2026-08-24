from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import EmailAnalysisRequest, PhishingAnalysisResponse
from app.services import phishing_service

app = FastAPI(
    title="AI Email Copilot - Security & Phishing Engine",
    description="Microservice responsible for email phishing detection, risk scoring, and threat explanations.",
    version="1.0.0"
)

# Enable CORS for future frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint verifying server status and model readiness."""
    return {
        "status": "healthy",
        "service": "phishing-engine",
        "model_loaded": phishing_service.model.is_trained
    }

@app.post("/api/v1/analyze", response_model=PhishingAnalysisResponse, tags=["Phishing Analysis"])
def analyze_email(request: EmailAnalysisRequest):
    """
    Analyzes an email payload for phishing indicators, calculates a risk score (0-100),
    and provides human-readable explanations of flagged security threats.
    """
    try:
        return phishing_service.analyze_email(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Phishing analysis failed: {str(e)}")
