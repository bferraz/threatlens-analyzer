from pydantic import BaseModel, Field
from typing import Literal


class MermaidAnalysisRequest(BaseModel):
    """Simplified request model for Mermaid analysis."""
    
    mermaidCode: str = Field(
        ...,
        description="Código do diagrama Mermaid",
        examples=["graph TD\n    User[User] -->|HTTPS| API[API Gateway]\n    API -->|gRPC| Service[Backend Service]\n    Service -->|SQL| DB[(Database)]"]
    )
    
    analysisDepth: Literal["quick", "full"] = Field(
        default="full",
        description="Profundidade da análise: 'quick' para análise básica (apenas ameaças HIGH), 'full' para análise completa",
        examples=["full", "quick"]
    )
    
    reportFormat: Literal["markdown", "pdf"] = Field(
        default="markdown",
        description="Formato do relatório gerado",
        examples=["markdown", "pdf"]
    )
