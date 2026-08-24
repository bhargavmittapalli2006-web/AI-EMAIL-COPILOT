import logging
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app import auth_service, email_service
from app.schemas import (
    EmailRequest,
    HealthResponse,
    EmailAnalysisResponse,
    EmailAnalysisRequest,
    PhishingAnalysisResponse,
    HealthCheckResponse,
    EmailIntelligenceRequest,
    EmailIntelligenceResponse,
    ReplySuggestionsRequest,
    ReplySuggestionsResponse,
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
    EmailCreateRequest,
    EmailUpdateRequest,
)
from app.services.email_parser import EmailParser
from app.services.sender_analyzer import SenderAnalyzer
from app.services.url_analyzer import URLAnalyzer
from app.services.content_analyzer import ContentAnalyzer
from app.services.feature_engineer import FeatureEngineer
from app.services import phishing_service
from app.gemini_service import gemini_service
from app.reply_service import reply_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("phishing-engine")

# Initialize pipeline analyzers
email_parser = EmailParser()
sender_analyzer = SenderAnalyzer()
url_analyzer = URLAnalyzer()
content_analyzer = ContentAnalyzer()
feature_engineer = FeatureEngineer()

tags_metadata = [
    {
        "name": "Health",
        "description": "System health check, service diagnostic metadata, and model readiness status."
    },
    {
        "name": "Pipeline Analysis",
        "description": "Multi-stage deterministic security pipeline (Parser -> Sender -> URL -> Content -> Feature Engineering)."
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


from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup validation, database initialization, and shutdown events."""
    logger.info("Initializing AI Email Copilot - Phishing Engine microservice...")
    try:
        init_db()
    except Exception as e:
        logger.error("Failed to initialize SQLite database: %s", e)

    if phishing_service.is_ready():
        logger.info("Validated model pipeline verified successfully. Loaded from: %s", phishing_service.get_model_path())
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

An intelligent email security engine combining **Machine Learning (TF-IDF + Logistic Regression)** with **rule-assisted explainable security heuristics**, **deterministic pipeline analysis**, and **server-side Gemini Email Intelligence**.

### Core Capabilities:
- **Pipeline Analysis (`/analyze-email`)**: Parsed email, sender signals, URL signals, content indicators, and ML-ready features.
- **Binary Phishing Classification (`/api/v1/analyze`)**: Accurately distinguishes phishing scams from legitimate emails.
- **Continuous Risk Scoring**: Computes normalized risk score from `0.0` (Safe) to `100.0` (Severe Threat).
- **Explainable Threat Indicators**: Human-readable explanations detailing why an email was flagged.
- **Gemini Email Intelligence (`/api/v1/intelligence`)**: Executive summaries, action items, key points, and security recommendations.
- **Reply Suggestions (`/api/v1/reply-suggestions`)**: Safe contextual reply drafts with server-side security gate.
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


# ─────────────────────────────────────────────────────────────────────────────
# Health Check Endpoint
# ─────────────────────────────────────────────────────────────────────────────

@app.get(
    "/health",
    response_model=HealthCheckResponse,
    tags=["Health"],
    summary="Check service health and model readiness"
)
def health_check():
    """
    Returns operational status, model readiness, active model path, and Gemini availability.
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


# ─────────────────────────────────────────────────────────────────────────────
# Milestone 1-7 Pipeline Endpoint (/analyze-email)
# ─────────────────────────────────────────────────────────────────────────────

@app.post(
    "/analyze-email",
    response_model=EmailAnalysisResponse,
    tags=["Pipeline Analysis"],
    summary="Full pipeline email security analysis"
)
def analyze_email_pipeline(request: EmailRequest) -> EmailAnalysisResponse:
    """
    Parses incoming email and runs sender, URL, and content security analyzers,
    then transforms the outputs into a structured, numerical ML-ready feature vector.
    """
    parsed_email = email_parser.parse(
        sender=request.sender,
        subject=request.subject,
        body=request.body,
    )

    sender_result = sender_analyzer.analyze(raw_sender=parsed_email.sender)
    url_results = url_analyzer.analyze_urls(parsed_email.urls)
    content_result = content_analyzer.analyze(
        subject=parsed_email.subject,
        body=parsed_email.body,
    )

    features = feature_engineer.extract_features(
        sender_analysis=sender_result,
        url_analysis=url_results,
        content_analysis=content_result,
        email=parsed_email,
    )

    return EmailAnalysisResponse(
        email=parsed_email,
        sender_analysis=sender_result,
        url_analysis=url_results,
        content_analysis=content_result,
        features=features,
    )


# ─────────────────────────────────────────────────────────────────────────────
# ML Phishing Analysis Endpoint (/api/v1/analyze)
# ─────────────────────────────────────────────────────────────────────────────

@app.post(
    "/api/v1/analyze",
    response_model=PhishingAnalysisResponse,
    status_code=status.HTTP_200_OK,
    tags=["Phishing Analysis"],
    summary="Analyze an email for phishing threats and calculate risk score",
    responses={
        200: {"description": "Successful analysis with threat classification and explanations."},
        500: {"description": "Internal server error during feature extraction or model inference."},
        503: {"description": "Inference model is unavailable or not loaded."}
    }
)
def analyze_email(request: EmailAnalysisRequest):
    """
    Analyzes an email payload for phishing threats using the validated ML pipeline:
    1. Text & Token Analysis: Scans email subject and body with TF-IDF vectorization.
    2. Link Inspection: Detects raw IP destinations, suspicious TLDs, and URL shorteners.
    3. Header Validation: Cross-checks sender address vs. reply-to domain to detect spoofing.
    4. Coercion & Credential Scans: Flags urgency words, password resets, and bank detail requests.
    5. Risk Fusion: Blends ML probability with heuristic threat rules to produce normalized risk score (0-100).
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


# ─────────────────────────────────────────────────────────────────────────────
# Email Intelligence Endpoint (/api/v1/intelligence)
# ─────────────────────────────────────────────────────────────────────────────

@app.post(
    "/api/v1/intelligence",
    response_model=EmailIntelligenceResponse,
    status_code=status.HTTP_200_OK,
    tags=["Email Intelligence"],
    summary="Generate Gemini-powered summary, action items, and security recommendations",
    responses={
        200: {"description": "Successful generation of structured email intelligence."},
        500: {"description": "Internal server error during email intelligence generation."}
    }
)
def generate_intelligence(request: EmailIntelligenceRequest):
    """
    Generates structured AI intelligence for an email:
    - Executive Summary: 2-5 sentence overview.
    - Action Items: Prioritized tasks, meetings, and deadlines.
    - Key Points: 2-6 bullet points.
    - Risk Explanation: Threat explanation grounded in authoritative phishing engine analysis.
    - Recommended Actions: Context-aware protective vs. routine productivity recommendations.
    """
    try:
        return gemini_service.generate_intelligence(request)
    except Exception as e:
        logger.error("Email intelligence generation failed: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Email intelligence generation failed: {str(e)}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Reply Suggestions Endpoint (/api/v1/reply-suggestions)
# ─────────────────────────────────────────────────────────────────────────────

@app.post(
    "/api/v1/reply-suggestions",
    response_model=ReplySuggestionsResponse,
    status_code=status.HTTP_200_OK,
    tags=["Reply Suggestions"],
    summary="Generate AI reply suggestions with security gate protection",
    responses={
        200: {"description": "Reply suggestions generated or safely blocked by security gate."},
        500: {"description": "Internal server error during reply suggestions processing."}
    }
)
def generate_reply_suggestions(request: ReplySuggestionsRequest):
    """
    Generates three optional contextual reply drafts (Professional, Friendly, Concise) for safe emails.
    - Security Gate: Automatically blocks reply generation if the email is classified as phishing or has HIGH/CRITICAL risk.
    - Safe Fallbacks: Provides deterministic fallback replies if Gemini is offline or unconfigured.
    """
    try:
        return reply_service.generate_reply_suggestions(request)
    except Exception as e:
        logger.error("Reply suggestions generation failed: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reply suggestions generation failed: {str(e)}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Real Authentication Endpoints (/api/v1/auth)
# ─────────────────────────────────────────────────────────────────────────────

@app.post(
    "/api/v1/auth/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"],
    summary="Register a new user account"
)
def register_user(request: RegisterRequest):
    return auth_service.register_user(
        email=request.email,
        password=request.password,
        display_name=request.display_name,
        role=request.role or "SecOps Analyst"
    )


@app.post(
    "/api/v1/auth/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    tags=["Authentication"],
    summary="Authenticate user and generate session token"
)
def login_user(request: LoginRequest):
    return auth_service.authenticate_user(
        email=request.email,
        password=request.password
    )


@app.post(
    "/api/v1/auth/logout",
    status_code=status.HTTP_200_OK,
    tags=["Authentication"],
    summary="Invalidate user authentication session"
)
def logout_user():
    return {"message": "Session logged out successfully."}


@app.get(
    "/api/v1/auth/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    tags=["Authentication"],
    summary="Get current authenticated user details"
)
def get_current_user_profile(current_user: Dict[str, Any] = Depends(auth_service.get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        display_name=current_user["display_name"],
        role=current_user["role"]
    )


# ─────────────────────────────────────────────────────────────────────────────
# Email Persistence Endpoints (/api/v1/emails)
# ─────────────────────────────────────────────────────────────────────────────

@app.get(
    "/api/v1/emails",
    tags=["Emails"],
    summary="Get user emails with strict user isolation"
)
def get_emails(
    folder: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user)
):
    return email_service.get_user_emails(user_id=current_user["id"], folder=folder)


@app.get(
    "/api/v1/emails/{id}",
    tags=["Emails"],
    summary="Get specific email by ID with strict user isolation"
)
def get_email_by_id(
    id: str,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user)
):
    return email_service.get_email_by_id(user_id=current_user["id"], email_id=id)


@app.post(
    "/api/v1/emails",
    status_code=status.HTTP_201_CREATED,
    tags=["Emails"],
    summary="Create and persist a new email"
)
def create_email(
    request: EmailCreateRequest,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user)
):
    return email_service.create_email(user_id=current_user["id"], data=request.model_dump())


@app.patch(
    "/api/v1/emails/{id}",
    tags=["Emails"],
    summary="Update folder, read, star, or important status for an email"
)
def update_email(
    id: str,
    request: EmailUpdateRequest,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user)
):
    return email_service.update_email(user_id=current_user["id"], email_id=id, updates=request.model_dump(exclude_unset=True))


@app.delete(
    "/api/v1/emails/{id}",
    tags=["Emails"],
    summary="Delete an email"
)
def delete_email(
    id: str,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user)
):
    success = email_service.delete_email(user_id=current_user["id"], email_id=id)
    return {"message": "Email deleted successfully.", "success": success}

