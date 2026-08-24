import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import (
    EmailAnalysisRequest, 
    PhishingAnalysisResponse, 
    HealthCheckResponse,
    EmailIntelligenceRequest,
    EmailIntelligenceResponse,
    ReplySuggestionsRequest,
    ReplySuggestionsResponse
)
from app.services import phishing_service
from app.gemini_service import gemini_service
from app.reply_service import reply_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("phishing-engine")

tags_metadata = [
    {
        "name": "Health",
        "description": "System health check, service diagnostic metadata, and model readiness status."
    },
    {
        "name": "Phishing Analysis",
        "description": "Real-time AI/ML email threat detection, normalized risk scoring (0-100), and explainable security indicators."
    },
    {
        "name": "Email Intelligence",
        "description": "Gemini-powered natural language email intelligence: executive summary, action items, key points, risk explanation, and recommended actions."
    },
    {
        "name": "Reply Suggestions",
        "description": "AI-powered contextual reply suggestions (Professional, Friendly, Concise) with server-side security gate protection."
    }
]



@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup validation and shutdown events."""
    logger.info("Initializing AI Email Copilot - Phishing Engine microservice...")
    if phishing_service.is_ready():
        logger.info("Model pipeline verified successfully. Loaded from: %s", phishing_service.get_model_path())
    else:
        logger.error("WARNING: Model pipeline is not loaded or ready. Analysis requests may fail.")
    if gemini_service.is_available():
        logger.info("Gemini Intelligence service configured and available.")
    else:
        logger.info("Gemini Intelligence operating in intelligent fallback mode.")
    yield
    logger.info("Shutting down Phishing Engine microservice.")


app = FastAPI(
    title="AI Email Copilot - Security & Phishing Engine",
    description="""
## Security & Phishing Detection Microservice

An intelligent email security engine combining **Machine Learning (TF-IDF + Logistic Regression)** with **rule-assisted explainable security heuristics** and **server-side Gemini Email Intelligence**.

### Core Capabilities:
- **Binary Phishing Classification**: Accurately distinguishes phishing scams from legitimate emails.
- **Continuous Risk Scoring**: Computes a normalized risk score from `0.0` (Completely Safe) to `100.0` (Severe Threat).
- **Categorical Risk Tiers**: Tiers severity into `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL`.
- **Explainable Threat Indicators**: Provides transparent human-readable explanations detailing why an email was flagged.
- **Deep Security Feature Extraction**: Inspects raw IP URLs, suspicious TLDs, URL shorteners, domain spoofing, header mismatches, urgency coercion, and credential harvesting.
- **Gemini Email Intelligence**: Generates summaries, key points, prioritized action items, and context-aware security recommendations without exposing API keys to the client.
    """,
    version="1.0.0",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend and microservice cross-origin communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/health",
    response_model=HealthCheckResponse,
    tags=["Health"],
    summary="Check service health and model readiness"
)
def health_check():
    """
    Returns the operational status of the service, model loading state, active model path, and Gemini availability.
    """
    model_ready = phishing_service.is_ready()
    return HealthCheckResponse(
        status="healthy" if model_ready else "degraded",
        service="phishing-engine",
        model_loaded=model_ready,
        gemini_available=gemini_service.is_available(),
        model_path=phishing_service.get_model_path(),
        version="1.0.0"
    )


@app.post(
    "/api/v1/analyze",
    response_model=PhishingAnalysisResponse,
    status_code=status.HTTP_200_OK,
    tags=["Phishing Analysis"],
    summary="Analyze an email for phishing threats and calculate risk score",
    responses={
        200: {
            "description": "Successful analysis with threat classification and explanations."
        },
        500: {
            "description": "Internal server error during feature extraction or model inference."
        },
        503: {
            "description": "Inference model is unavailable or not loaded."
        }
    }
)
def analyze_email(request: EmailAnalysisRequest):
    """
    Analyzes an email payload for phishing indicators:
    
    1. **Text & Token Analysis**: Scans email subject and body with TF-IDF vectorization.
    2. **Link Inspection**: Detects raw IP destinations, suspicious TLDs, and URL shorteners.
    3. **Header Validation**: Cross-checks sender address vs. reply-to domain to detect spoofing.
    4. **Coercion & Credential Scans**: Flags urgency words, password resets, and bank detail requests.
    5. **Risk Fusion**: Blends ML probability with heuristic threat rules to produce normalized risk score (0-100).
    """
    if not phishing_service.is_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Phishing model is not loaded or ready. Service is unavailable."
        )

    try:
        return phishing_service.analyze_email(request)
    except Exception as e:
        logger.error("Analysis failed for request from sender '%s': %s", request.sender, e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Phishing analysis failed: {str(e)}"
        )


@app.post(
    "/api/v1/intelligence",
    response_model=EmailIntelligenceResponse,
    status_code=status.HTTP_200_OK,
    tags=["Email Intelligence"],
    summary="Generate Gemini-powered summary, action items, and context-aware security recommendations",
    responses={
        200: {
            "description": "Successful generation of structured email intelligence."
        },
        500: {
            "description": "Internal server error during email intelligence generation."
        }
    }
)
def generate_intelligence(request: EmailIntelligenceRequest):
    """
    Generates structured AI intelligence for an email:
    - **Executive Summary**: 2-5 sentence overview.
    - **Action Items**: Prioritized tasks, meetings, and deadlines (`low`, `medium`, `high`).
    - **Key Points**: 2-6 bullet points.
    - **Risk Explanation**: Threat explanation grounded in authoritative phishing engine analysis.
    - **Recommended Actions**: Context-aware protective vs. routine productivity recommendations.
    """
    try:
        return gemini_service.generate_intelligence(request)
    except Exception as e:
        logger.error("Email intelligence generation failed: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Email intelligence generation failed: {str(e)}"
        )


@app.post(
    "/api/v1/reply-suggestions",
    response_model=ReplySuggestionsResponse,
    status_code=status.HTTP_200_OK,
    tags=["Reply Suggestions"],
    summary="Generate AI reply suggestions (Professional, Friendly, Concise) with security gate protection",
    responses={
        200: {
            "description": "Reply suggestions generated or safely blocked by security gate."
        },
        500: {
            "description": "Internal server error during reply suggestions processing."
        }
    }
)
def generate_reply_suggestions(request: ReplySuggestionsRequest):
    """
    Generates three optional contextual reply drafts (Professional, Friendly, Concise) for safe emails.
    - **Security Gate**: Automatically blocks reply generation if the email is classified as phishing or has HIGH/CRITICAL risk.
    - **Safe Fallbacks**: Provides deterministic fallback replies if Gemini is offline or unconfigured.
    - **Human in Control**: Replies are purely suggestions for user review and manual copying.
    """
    try:
        return reply_service.generate_reply_suggestions(request)
    except Exception as e:
        logger.error("Reply suggestions generation failed: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reply suggestions generation failed: {str(e)}"
        )

