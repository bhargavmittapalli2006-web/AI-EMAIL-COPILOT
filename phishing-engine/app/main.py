import logging
import urllib.parse
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.responses import RedirectResponse
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
    GoogleAuthConfigResponse,
    GoogleAuthUrlResponse,
    EmailCreateRequest,
    EmailUpdateRequest,
    ReminderCreateRequest,
    ReminderUpdateRequest,
    ReminderResponse,
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

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

# Enable CORS for frontend and microservice cross-origin communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
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
def analyze_email(
    request: EmailAnalysisRequest,
    current_user: Optional[Dict[str, Any]] = Depends(auth_service.get_optional_current_user)
):
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
        result = phishing_service.analyze_email(request)
        if current_user and getattr(request, "email_id", None):
            try:
                email_service.save_security_scan(
                    user_id=current_user["id"],
                    email_id=request.email_id,
                    scan_data=result.model_dump()
                )
            except Exception as pe:
                logger.warning("Could not persist security scan audit: %s", pe)
        return result
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
def generate_intelligence(
    request: EmailIntelligenceRequest,
    current_user: Optional[Dict[str, Any]] = Depends(auth_service.get_optional_current_user)
):
    """
    Generates structured AI intelligence for an email:
    - Executive Summary: 2-5 sentence overview.
    - Action Items: Prioritized tasks, meetings, and deadlines.
    - Key Points: 2-6 bullet points.
    - Risk Explanation: Threat explanation grounded in authoritative phishing engine analysis.
    - Recommended Actions: Context-aware protective vs. routine productivity recommendations.
    """
    try:
        result = gemini_service.generate_intelligence(request)
        if current_user and getattr(request, "email_id", None):
            try:
                email_service.save_intelligence_result(
                    user_id=current_user["id"],
                    email_id=request.email_id,
                    intel_data=result.model_dump()
                )
            except Exception as pe:
                logger.warning("Could not persist intelligence result audit: %s", pe)
        return result
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
def generate_reply_suggestions(
    request: ReplySuggestionsRequest,
    current_user: Optional[Dict[str, Any]] = Depends(auth_service.get_optional_current_user)
):
    """
    Generates three optional contextual reply drafts (Professional, Friendly, Concise) for safe emails.
    - Security Gate: Automatically blocks reply generation if the email is classified as phishing or has HIGH/CRITICAL risk.
    - Safe Fallbacks: Provides deterministic fallback replies if Gemini is offline or unconfigured.
    """
    try:
        result = reply_service.generate_reply_suggestions(request)
        if current_user and getattr(request, "email_id", None):
            try:
                email_service.save_reply_suggestion(
                    user_id=current_user["id"],
                    email_id=request.email_id,
                    reply_data=result.model_dump()
                )
            except Exception as pe:
                logger.warning("Could not persist reply suggestion audit: %s", pe)
        return result
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
        role=current_user["role"],
        auth_provider=current_user.get("auth_provider", "local")
    )


# ─────────────────────────────────────────────────────────────────────────────
# Google OAuth 2.0 Endpoints (Phase 22)
# ─────────────────────────────────────────────────────────────────────────────

@app.get(
    "/api/v1/auth/google/config",
    response_model=GoogleAuthConfigResponse,
    tags=["Authentication"],
    summary="Get Google OAuth configuration status"
)
def get_google_oauth_config():
    """Returns whether Google OAuth 2.0 is configured on the backend without disclosing secrets."""
    configured = auth_service.is_google_oauth_configured()
    return GoogleAuthConfigResponse(
        configured=configured,
        client_id=auth_service.get_google_client_id() if configured else None,
        redirect_uri=auth_service.get_google_redirect_uri() if configured else None,
    )


@app.get(
    "/api/v1/auth/google/login",
    response_model=GoogleAuthUrlResponse,
    tags=["Authentication"],
    summary="Generate Google OAuth 2.0 authorization URL"
)
def google_oauth_login(redirect: bool = False):
    """
    Generates a cryptographically secure OAuth 2.0 authorization URL with state CSRF protection.
    If redirect=True, redirects browser directly to Google.
    """
    auth_data = auth_service.get_google_auth_url()
    if redirect:
        return RedirectResponse(url=auth_data["authorization_url"], status_code=status.HTTP_307_TEMPORARY_REDIRECT)
    return GoogleAuthUrlResponse(**auth_data)


@app.get(
    "/api/v1/auth/google/callback",
    tags=["Authentication"],
    summary="Google OAuth 2.0 authorization callback"
)
async def google_oauth_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    error_description: Optional[str] = None,
):
    """
    Handles Google OAuth redirect: validates state, exchanges code, verifies OpenID Connect identity,
    creates/links application session, and redirects user to frontend application.
    """
    frontend_base = auth_service.get_frontend_url().rstrip("/")
    if error:
        err_msg = error_description or error
        return RedirectResponse(
            url=f"{frontend_base}/?oauth_error={urllib.parse.quote(err_msg)}",
            status_code=status.HTTP_307_TEMPORARY_REDIRECT
        )


    if not code or not state:
        return RedirectResponse(
            url=f"{frontend_base}/?oauth_error={urllib.parse.quote('Missing Google authorization code or state.')}",
            status_code=status.HTTP_307_TEMPORARY_REDIRECT
        )

    try:
        user_session = await auth_service.exchange_google_code_and_authenticate(code=code, state=state)
        token = user_session["token"]
        return RedirectResponse(
            url=f"{frontend_base}/?oauth_token={urllib.parse.quote(token)}",
            status_code=status.HTTP_307_TEMPORARY_REDIRECT
        )
    except HTTPException as he:
        return RedirectResponse(
            url=f"{frontend_base}/?oauth_error={urllib.parse.quote(str(he.detail))}",
            status_code=status.HTTP_307_TEMPORARY_REDIRECT
        )
    except Exception as exc:
        logger.error("Unhandled Google OAuth callback error: %s", exc)
        return RedirectResponse(
            url=f"{frontend_base}/?oauth_error={urllib.parse.quote('Authentication failed due to an unexpected error.')}",
            status_code=status.HTTP_307_TEMPORARY_REDIRECT
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


@app.post(
    "/api/v1/emails/import",
    tags=["Emails"],
    summary="Import authoritative dataset emails into user's authenticated mailbox"
)
def import_emails(
    force: bool = False,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user)
):
    """
    Imports the cleaned email dataset into the authenticated user's mailbox.
    Idempotent: prevents duplicate records and respects user deletions unless force=True.
    """
    return email_service.import_dataset_emails_for_user(
        user_id=current_user["id"],
        recipient_email=current_user["email"],
        force=force
    )


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



# ─────────────────────────────────────────────────────────────────────────────
# 6. User Reminders Endpoints (Phase 20 — Strict User Isolation)
# ─────────────────────────────────────────────────────────────────────────────

@app.post(
    "/api/v1/reminders",
    response_model=ReminderResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Reminders"],
    summary="Create a user-scoped deadline or task reminder"
)
def create_user_reminder(
    request: ReminderCreateRequest,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user)
):
    """Creates a reminder strictly associated with the authenticated user."""
    return email_service.create_reminder(user_id=current_user["id"], data=request.model_dump())


@app.get(
    "/api/v1/reminders",
    response_model=List[ReminderResponse],
    tags=["Reminders"],
    summary="List all reminders for the authenticated user"
)
def list_user_reminders(
    email_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user)
):
    """Retrieves all reminders for the authenticated user."""
    return email_service.get_reminders(user_id=current_user["id"], email_id=email_id)


@app.get(
    "/api/v1/reminders/{id}",
    response_model=ReminderResponse,
    tags=["Reminders"],
    summary="Get a specific reminder by ID"
)
def get_user_reminder(
    id: str,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user)
):
    """Retrieves a single reminder strictly scoped to the authenticated user."""
    reminder = email_service.get_reminder_by_id(user_id=current_user["id"], reminder_id=id)
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found or access denied."
        )
    return reminder


@app.patch(
    "/api/v1/reminders/{id}",
    response_model=ReminderResponse,
    tags=["Reminders"],
    summary="Update a reminder (completed status, priority, title, description, due date)"
)
def update_user_reminder(
    id: str,
    request: ReminderUpdateRequest,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user)
):
    """Updates a reminder strictly scoped to the authenticated user."""
    updated = email_service.update_reminder(
        user_id=current_user["id"],
        reminder_id=id,
        updates=request.model_dump(exclude_unset=True)
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found or access denied."
        )
    return updated


@app.delete(
    "/api/v1/reminders/{id}",
    tags=["Reminders"],
    summary="Delete a reminder"
)
def delete_user_reminder(
    id: str,
    current_user: Dict[str, Any] = Depends(auth_service.get_current_user)
):
    """Deletes a reminder strictly scoped to the authenticated user."""
    success = email_service.delete_reminder(user_id=current_user["id"], reminder_id=id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found or access denied."
        )
    return {"message": "Reminder deleted successfully.", "success": True}


