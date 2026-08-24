from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class URLAnalysis(BaseModel):
    """
    Structured security analysis signals for a single URL.

    Every field is derived from deterministic, offline inspection of the URL
    string. No HTTP requests, DNS lookups, or external services are used.
    """
    url: str
    scheme: str = ""
    domain: str = ""
    port: Optional[int] = None
    path: str = ""
    query_params: Dict[str, str] = Field(default_factory=dict)
    uses_https: bool = False
    is_ip_address: bool = False
    url_length: int = 0
    subdomain_count: int = 0
    url_risk_score: int = Field(default=0, ge=0, le=100)
    risk_factors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
