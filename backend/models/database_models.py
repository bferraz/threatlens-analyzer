from beanie import Document
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


# Embedded models (not separate collections)
class Component(BaseModel):
    """Component embedded model"""
    id: str
    type: str
    name: str
    trust_zone: Literal["external", "dmz", "internal", "private", "internet", "public"]
    confidence: float


class DataFlow(BaseModel):
    """Data flow embedded model"""
    from_: str = Field(..., alias="from")
    to: str
    protocol: str
    direction: Literal["unidirectional", "bidirectional"]
    data_types: List[str]
    confidence: float
    
    class Config:
        populate_by_name = True


class Threat(BaseModel):
    """Threat embedded model"""
    targetId: str
    category: Literal["S", "T", "R", "I", "D", "E"]
    title: str
    description: str
    severity: Literal["low", "medium", "high", "critical"]


class Mitigation(BaseModel):
    """Mitigation embedded model"""
    targetId: str
    title: str
    steps: List[str]


class AnalysisResult(BaseModel):
    """Analysis result embedded model"""
    components: List[Component]
    data_flows: List[DataFlow]
    threats: List[Threat]
    mitigations: List[Mitigation]
    assumptions: List[str]
    uncertainties: List[str]
    reportDownloadUrl: str


class ThreatCheck(BaseModel):
    """Threat check progress embedded model"""
    threatId: str
    isResolved: bool
    resolvedAt: Optional[str] = None
    notes: Optional[str] = None


class MitigationCheck(BaseModel):
    """Mitigation check progress embedded model"""
    mitigationId: str
    stepIndex: Optional[int] = None
    isCompleted: bool
    completedAt: Optional[str] = None
    notes: Optional[str] = None


# Main document that will be stored in MongoDB
class SavedAnalysisDocument(Document):
    """
    SavedAnalysis document model for MongoDB.
    This represents a saved threat analysis with progress tracking.
    """
    name: str
    description: Optional[str] = None
    diagramType: Literal["mermaid", "image"]
    diagramContent: Optional[str] = None  # Mermaid code or base64 image
    analysisResult: AnalysisResult
    threatChecks: List[ThreatCheck] = Field(default_factory=list)
    mitigationChecks: List[MitigationCheck] = Field(default_factory=list)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    tags: List[str] = Field(default_factory=list)
    
    class Settings:
        name = "saved_analyses"  # MongoDB collection name
        indexes = [
            "name",
            "createdAt",
            "tags",
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "E-Commerce Platform Analysis",
                "description": "Security analysis for the main e-commerce architecture",
                "diagramType": "mermaid",
                "tags": ["production", "e-commerce", "high-priority"]
            }
        }
