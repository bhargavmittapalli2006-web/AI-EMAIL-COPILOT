from fastapi import FastAPI
from app.schemas import EmailRequest, HealthResponse, EmailAnalysisResponse
from app.services.email_parser import EmailParser
from app.services.sender_analyzer import SenderAnalyzer
from app.services.url_analyzer import URLAnalyzer

app = FastAPI(
    title="AI Email Copilot — Phishing Engine",
    description="Security & Phishing detection microservice for AI Email Copilot.",
    version="0.5.0",
)

email_parser = EmailParser()
sender_analyzer = SenderAnalyzer()
url_analyzer = URLAnalyzer()


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
    Parses an incoming email payload and performs safe sender and URL security analysis.
    Returns the parsed email data, sender security signals, and URL security signals.
    """
    parsed_email = email_parser.parse(
        sender=request.sender,
        subject=request.subject,
        body=request.body,
    )

    sender_result = sender_analyzer.analyze(raw_sender=parsed_email.sender)

    url_results = url_analyzer.analyze_urls(parsed_email.urls)

    return EmailAnalysisResponse(
        email=parsed_email,
        sender_analysis=sender_result,
        url_analysis=url_results,
    )
