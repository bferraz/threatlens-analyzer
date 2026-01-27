import uuid
from typing import Dict, Any
from models.response_models import (
    AnalysisResponse, Component, DataFlow, Threat, Mitigation
)
from services.openai_service import openai_service


class StrideAnalyzer:
    """Service for performing STRIDE threat analysis."""
    
    async def analyze_image(
        self,
        image_base64: str,
        analysis_depth: str = "full",
        report_format: str = "markdown"
    ) -> AnalysisResponse:
        """
        Perform STRIDE analysis on an image.
        
        Args:
            image_base64: Base64 encoded image data
            analysis_depth: 'quick' or 'full'
            report_format: 'markdown' or 'pdf'
            
        Returns:
            AnalysisResponse with threat analysis results
        """
        # Call OpenAI for image analysis
        raw_result = await openai_service.analyze_image(
            image_base64=image_base64,
            analysis_depth=analysis_depth,
            include_severity=True,
            include_assumptions=True
        )
        
        # Validate and transform response
        analysis_result = self._transform_result(raw_result, report_format)
        
        return analysis_result
    
    async def analyze_mermaid(
        self,
        mermaid_code: str,
        analysis_depth: str = "full",
        report_format: str = "markdown"
    ) -> AnalysisResponse:
        """
        Perform STRIDE analysis on Mermaid code.
        
        Args:
            mermaid_code: Mermaid diagram code
            analysis_depth: 'quick' or 'full'
            report_format: 'markdown' or 'pdf'
            
        Returns:
            AnalysisResponse with threat analysis results
        """
        # Call OpenAI for Mermaid analysis
        raw_result = await openai_service.analyze_mermaid(
            mermaid_code=mermaid_code,
            analysis_depth=analysis_depth,
            include_severity=True,
            include_assumptions=True
        )
        
        # Validate and transform response
        analysis_result = self._transform_result(raw_result, report_format)
        
        return analysis_result
    
    def _transform_result(
        self, 
        raw_result: Dict[str, Any],
        report_format: str
    ) -> AnalysisResponse:
        """
        Transform raw OpenAI result into structured response.
        
        Args:
            raw_result: Raw result from OpenAI
            report_format: Format for the report (markdown or pdf)
            
        Returns:
            AnalysisResponse object
        """
        # Parse components
        components = [
            Component(**comp) for comp in raw_result.get("components", [])
        ]
        
        # Parse data flows
        data_flows = [
            DataFlow(**flow) for flow in raw_result.get("data_flows", [])
        ]
        
        # Parse threats
        threats = [
            Threat(**threat) for threat in raw_result.get("threats", [])
        ]
        
        # Parse mitigations
        mitigations = [
            Mitigation(**mitigation) for mitigation in raw_result.get("mitigations", [])
        ]
        
        # Get assumptions and uncertainties
        assumptions = raw_result.get("assumptions", [])
        uncertainties = raw_result.get("uncertainties", [])
        
        # Generate unique report ID
        report_id = str(uuid.uuid4())
        report_extension = "md" if report_format == "markdown" else "pdf"
        report_download_url = f"/api/report/download/{report_id}.{report_extension}"
        
        # Create response
        response = AnalysisResponse(
            components=components,
            data_flows=data_flows,
            threats=threats,
            mitigations=mitigations,
            assumptions=assumptions,
            uncertainties=uncertainties,
            reportDownloadUrl=report_download_url
        )
        
        return response


# Global analyzer instance
stride_analyzer = StrideAnalyzer()
