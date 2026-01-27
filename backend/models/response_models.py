from pydantic import BaseModel, Field
from typing import List, Literal


class Component(BaseModel):
    """Represents a component in the architecture."""
    
    id: str = Field(..., description="Unique identifier for the component")
    type: str = Field(..., description="Type of component")
    name: str = Field(..., description="Human-readable name")
    trust_zone: Literal["external", "dmz", "internal", "private", "internet", "public"] = Field(
        ..., description="Trust zone classification"
    )
    confidence: float = Field(..., ge=0.7, le=1.0, description="Confidence score")


class DataFlow(BaseModel):
    """Represents a data flow between components."""
    
    from_: str = Field(..., alias="from", description="Source component ID")
    to: str = Field(..., description="Destination component ID")
    protocol: str = Field(..., description="Communication protocol")
    direction: Literal["unidirectional", "bidirectional"] = Field(
        ..., description="Flow direction"
    )
    data_types: List[str] = Field(..., description="Types of data transferred")
    confidence: float = Field(..., ge=0.7, le=1.0, description="Confidence score")


class Threat(BaseModel):
    """Represents a STRIDE threat."""
    
    targetId: str = Field(..., description="Component ID affected by this threat")
    category: Literal["S", "T", "R", "I", "D", "E"] = Field(
        ..., description="STRIDE category"
    )
    title: str = Field(..., description="Threat title")
    description: str = Field(..., description="Detailed threat description")
    severity: Literal["low", "medium", "high", "critical"] = Field(
        ..., description="Severity level"
    )


class Mitigation(BaseModel):
    """Represents mitigation steps for a component."""
    
    targetId: str = Field(..., description="Component ID")
    title: str = Field(..., description="Mitigation title")
    steps: List[str] = Field(..., min_length=1, description="Implementation steps")


class AnalysisResponse(BaseModel):
    """Response model for threat analysis."""
    
    components: List[Component] = Field(..., description="Identified components")
    data_flows: List[DataFlow] = Field(..., description="Data flows between components")
    threats: List[Threat] = Field(..., description="Identified threats")
    mitigations: List[Mitigation] = Field(..., description="Suggested mitigations")
    assumptions: List[str] = Field(..., description="Analysis assumptions")
    uncertainties: List[str] = Field(..., description="Areas of uncertainty")
    reportDownloadUrl: str = Field(..., description="URL to download the report")
    
    class Config:
        populate_by_name = True


class ErrorResponse(BaseModel):
    """Error response model."""
    
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    statusCode: int = Field(..., description="HTTP status code")
