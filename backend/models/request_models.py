from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, Literal


class AnalysisRequest(BaseModel):
    """Request model for threat analysis."""
    
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "description": "📝 EXEMPLO 1: Análise de Código Mermaid",
                    "inputType": "mermaid",
                    "mermaidText": "graph TD\n    User[User] -->|HTTPS| API[API Gateway]\n    API -->|gRPC| Service[Backend Service]\n    Service -->|SQL| DB[(Database)]",
                    "analysisDepth": "full",
                    "reportFormat": "markdown",
                    "includeSeverity": True,
                    "includeAssumptions": True
                },
                {
                    "description": "🖼️ EXEMPLO 2: Análise de Imagem (Base64) - SUBSTITUA imageData pelo seu base64 real!",
                    "inputType": "image",
                    "imageData": "COLE_AQUI_O_BASE64_DA_SUA_IMAGEM_PNG_JPG_OU_JPEG",
                    "analysisDepth": "full",
                    "reportFormat": "markdown",
                    "includeSeverity": True,
                    "includeAssumptions": True
                }
            ]
        }
    )
    
    inputType: Literal["image", "mermaid"] = Field(
        ...,
        description="⚙️ ESCOLHA O TIPO: 'image' = Enviar imagem em base64 | 'mermaid' = Enviar código Mermaid",
        examples=["image", "mermaid"]
    )
    
    # For image input
    imageData: Optional[str] = Field(
        None,
        description="🖼️ [OBRIGATÓRIO SE inputType='image'] Base64 da imagem. Pode incluir ou não o prefixo 'data:image/...;base64,'. Use um conversor online ou Python para converter sua imagem PNG/JPG para base64",
        examples=["iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...resto_do_base64", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB..."]
    )
    imageFileName: Optional[str] = Field(
        default="uploaded_image.png",
        description="🖼️ [OPCIONAL] Nome do arquivo da imagem (apenas para referência/logs). Se não informado, usa um nome padrão.",
        examples=["diagrama_arquitetura.png", "system_design.jpg", "minha_arquitetura.jpeg"]
    )
    
    # For mermaid input
    mermaidText: Optional[str] = Field(
        None,
        description="📝 [OBRIGATÓRIO SE inputType='mermaid'] Código do diagrama Mermaid",
        examples=["graph TD\n    A[User] --> B[API]\n    B --> C[Database]"]
    )
    
    # Analysis options
    analysisDepth: Literal["quick", "full"] = Field(
        default="full",
        description="Analysis depth: 'quick' for basic analysis (HIGH threats only), 'full' for comprehensive (all severities)",
        examples=["full", "quick"]
    )
    reportFormat: Literal["markdown", "pdf"] = Field(
        default="markdown",
        description="Format of the generated report",
        examples=["markdown", "pdf"]
    )
    includeSeverity: bool = Field(
        default=True,
        description="Include severity classification (low/medium/high) in threats",
        examples=[True, False]
    )
    includeAssumptions: bool = Field(
        default=True,
        description="Include assumptions and uncertainties in analysis results",
        examples=[True, False]
    )
    
    @field_validator('imageData')
    @classmethod
    def validate_image_data(cls, v, info):
        """Validate imageData is provided when inputType is image."""
        if info.data.get('inputType') == 'image' and not v:
            raise ValueError("imageData is required when inputType is 'image'")
        
        # Remove data URI prefix if present (e.g., "data:image/jpeg;base64,")
        if v and v.startswith('data:'):
            try:
                v = v.split(',', 1)[1]
            except IndexError:
                raise ValueError("Invalid data URI format")
        
        return v
    
    @field_validator('mermaidText')
    @classmethod
    def validate_mermaid_text(cls, v, info):
        """Validate mermaidText is provided when inputType is mermaid."""
        if info.data.get('inputType') == 'mermaid' and not v:
            raise ValueError("mermaidText is required when inputType is 'mermaid'")
        if v and len(v.strip()) == 0:
            raise ValueError("mermaidText cannot be empty")
        return v
