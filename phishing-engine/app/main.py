from fastapi import FastAPI
from app.schemas import EmailRequest, HealthResponse, EmailAnalysisResponse
from app.services.email_parser import EmailParser
from app.services.sender_analyzer import SenderAnalyzer

app = FastAPI(
    title="AI Email Copilot — Phishing Engine",
    description="Security & Phishing detection microservice for AI Email Copilot.",
    version="0.4.0",
)

email_parser = EmailParser()
sender_analyzer = SenderAnalyzer()


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Returns service health status."""
    return HealthResponse(
        status="healthy",
        service="phishing-engine",
    )


@app.post("/analyze-email", response_model=EmailAnalysisResponse, tags=["Analysis"])
def analyze_email(request: EmailRequest) -> EmailAnalysisResponse:
    """
    Parses an incoming email payload and performs safe sender security analysis.
    Returns both the parsed email data and sender security signals.
    """
    parsed_email = email_parser.parse(
        sender=request.sender,
        subject=request.subject,
        body=request.body,
    )

    sender_result = sender_analyzer.analyze(raw_sender=parsed_email.sender)

    return EmailAnalysisResponse(
        email=parsed_email,
        sender_analysis=sender_result,
    )
