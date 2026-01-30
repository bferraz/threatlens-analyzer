from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from datetime import datetime
from models.database_models import SavedAnalysisDocument, ThreatCheck, MitigationCheck
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analyses", tags=["analyses"])


# Request/Response models
class SaveAnalysisRequest(BaseModel):
    """Request model for saving a new analysis"""
    name: str
    description: Optional[str] = None
    diagramType: str
    diagramContent: Optional[str] = None
    analysisResult: dict
    tags: List[str] = []


class UpdateThreatCheckRequest(BaseModel):
    """Request model for updating a threat check"""
    threatId: str
    isResolved: bool
    resolvedAt: Optional[str] = None
    notes: Optional[str] = None


class UpdateMitigationCheckRequest(BaseModel):
    """Request model for updating a mitigation check"""
    mitigationId: str
    stepIndex: Optional[int] = None
    isCompleted: bool
    completedAt: Optional[str] = None
    notes: Optional[str] = None


class AnalysisSummary(BaseModel):
    """Summary model for listing analyses"""
    id: str
    name: str
    description: Optional[str]
    diagramType: str
    createdAt: str
    updatedAt: str
    tags: List[str]
    stats: dict


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_analysis(request: SaveAnalysisRequest):
    """
    Create a new saved analysis
    """
    try:
        # Check if analysis with same name already exists
        existing = await SavedAnalysisDocument.find_one({"name": request.name})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An analysis with the name '{request.name}' already exists"
            )
        
        # Create new document
        analysis = SavedAnalysisDocument(
            name=request.name,
            description=request.description,
            diagramType=request.diagramType,
            diagramContent=request.diagramContent,
            analysisResult=request.analysisResult,
            tags=request.tags,
            threatChecks=[],
            mitigationChecks=[],
        )
        
        # Save to MongoDB
        await analysis.insert()
        
        logger.info(f"Created new analysis: {analysis.id}")
        
        return {
            "id": str(analysis.id),
            "message": "Analysis saved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save analysis: {str(e)}"
        )


@router.get("/check-name")
async def check_name_exists(name: str):
    """
    Check if an analysis with the given name already exists
    """
    try:
        existing = await SavedAnalysisDocument.find_one({"name": name})
        return {"exists": existing is not None, "name": name}
    except Exception as e:
        logger.error(f"Error checking name: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check name: {str(e)}"
        )


@router.get("", response_model=List[AnalysisSummary])
async def list_analyses(
    search: Optional[str] = None,
    tags: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
):
    """
    Get all saved analyses with optional filtering
    """
    try:
        # Build query
        query = {}
        
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]
        
        if tags:
            tag_list = [t.strip() for t in tags.split(",")]
            query["tags"] = {"$in": tag_list}
        
        # Execute query
        analyses = await SavedAnalysisDocument.find(query).skip(skip).limit(limit).to_list()
        
        # Build summaries
        summaries = []
        for analysis in analyses:
            # Calculate stats
            total_threats = len(analysis.analysisResult.threats)
            resolved_threats = len([c for c in analysis.threatChecks if c.isResolved])
            critical_threats = len([t for t in analysis.analysisResult.threats if t.severity == "critical"])
            
            total_mitigation_steps = sum(len(m.steps) for m in analysis.analysisResult.mitigations)
            completed_mitigations = len([c for c in analysis.mitigationChecks if c.isCompleted])
            
            summaries.append(AnalysisSummary(
                id=str(analysis.id),
                name=analysis.name,
                description=analysis.description,
                diagramType=analysis.diagramType,
                createdAt=analysis.createdAt.isoformat(),
                updatedAt=analysis.updatedAt.isoformat(),
                tags=analysis.tags,
                stats={
                    "totalThreats": total_threats,
                    "resolvedThreats": resolved_threats,
                    "criticalThreats": critical_threats,
                    "totalMitigations": total_mitigation_steps,
                    "completedMitigations": completed_mitigations,
                }
            ))
        
        return summaries
        
    except Exception as e:
        logger.error(f"Error listing analyses: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list analyses: {str(e)}"
        )


@router.get("/{analysis_id}")
async def get_analysis(analysis_id: str):
    """
    Get a specific analysis by ID
    """
    try:
        analysis = await SavedAnalysisDocument.get(analysis_id)
        
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis with id {analysis_id} not found"
            )
        
        # Convert to dict and add id
        result = analysis.model_dump()
        result["id"] = str(analysis.id)
        result["createdAt"] = analysis.createdAt.isoformat()
        result["updatedAt"] = analysis.updatedAt.isoformat()
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analysis: {str(e)}"
        )


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(analysis_id: str):
    """
    Delete an analysis
    """
    try:
        analysis = await SavedAnalysisDocument.get(analysis_id)
        
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis with id {analysis_id} not found"
            )
        
        await analysis.delete()
        logger.info(f"Deleted analysis: {analysis_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete analysis: {str(e)}"
        )


@router.patch("/{analysis_id}/threats/{threat_id}")
async def update_threat_check(
    analysis_id: str,
    threat_id: str,
    request: UpdateThreatCheckRequest
):
    """
    Update or create a threat check
    """
    try:
        analysis = await SavedAnalysisDocument.get(analysis_id)
        
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis with id {analysis_id} not found"
            )
        
        # Find existing check
        existing_check_idx = None
        for idx, check in enumerate(analysis.threatChecks):
            if check.threatId == threat_id:
                existing_check_idx = idx
                break
        
        # Update or create check
        new_check = ThreatCheck(
            threatId=threat_id,
            isResolved=request.isResolved,
            resolvedAt=request.resolvedAt,
            notes=request.notes
        )
        
        if existing_check_idx is not None:
            analysis.threatChecks[existing_check_idx] = new_check
        else:
            analysis.threatChecks.append(new_check)
        
        # Update timestamp
        analysis.updatedAt = datetime.utcnow()
        
        # Save
        await analysis.save()
        
        logger.info(f"Updated threat check for analysis {analysis_id}, threat {threat_id}")
        
        return {"message": "Threat check updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating threat check: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update threat check: {str(e)}"
        )


@router.patch("/{analysis_id}/mitigations/{mitigation_id}")
async def update_mitigation_check(
    analysis_id: str,
    mitigation_id: str,
    request: UpdateMitigationCheckRequest
):
    """
    Update or create a mitigation check
    """
    try:
        analysis = await SavedAnalysisDocument.get(analysis_id)
        
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis with id {analysis_id} not found"
            )
        
        # Find existing check (considering stepIndex)
        existing_check_idx = None
        for idx, check in enumerate(analysis.mitigationChecks):
            if (check.mitigationId == mitigation_id and 
                check.stepIndex == request.stepIndex):
                existing_check_idx = idx
                break
        
        # Update or create check
        new_check = MitigationCheck(
            mitigationId=mitigation_id,
            stepIndex=request.stepIndex,
            isCompleted=request.isCompleted,
            completedAt=request.completedAt,
            notes=request.notes
        )
        
        if existing_check_idx is not None:
            analysis.mitigationChecks[existing_check_idx] = new_check
        else:
            analysis.mitigationChecks.append(new_check)
        
        # Update timestamp
        analysis.updatedAt = datetime.utcnow()
        
        # Save
        await analysis.save()
        
        logger.info(f"Updated mitigation check for analysis {analysis_id}, mitigation {mitigation_id}")
        
        return {"message": "Mitigation check updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating mitigation check: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update mitigation check: {str(e)}"
        )
