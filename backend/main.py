from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from contextlib import asynccontextmanager
from pathlib import Path
import uvicorn
import base64

from config.settings import settings
from config.database import Database
from models.simple_request_models import MermaidAnalysisRequest
from models.response_models import AnalysisResponse, ErrorResponse
from services.analyzer import stride_analyzer
from services.report_generator import report_generator
from services.analysis_routes import router as analysis_router
from utils.validators import validate_mermaid_code


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    print("🚀 Starting ThreatLens Analyzer API...")
    print(f"📊 OpenAI Models: Vision={settings.openai_vision_model}, Text={settings.openai_text_model}")
    print(f"🎯 Max Tokens: {settings.openai_max_tokens}")
    
    # Connect to MongoDB
    try:
        await Database.connect_db(settings)
        print(f"✅ Connected to MongoDB: {settings.mongodb_url}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print("⚠️  API will run without database features")
    
    # Create reports directory if it doesn't exist
    Path(settings.reports_dir).mkdir(exist_ok=True)
    
    yield
    
    # Shutdown
    print("👋 Shutting down ThreatLens Analyzer API...")
    await Database.close_db()
    print("✅ MongoDB connection closed")


# Create FastAPI application
app = FastAPI(
    title="ThreatLens Analyzer API",
    description="""
## 🔒 STRIDE Threat Analysis API

API REST para análise automatizada de ameaças STRIDE em diagramas de arquitetura de software.

### Funcionalidades

* **Análise de Imagens**: Upload de diagramas em base64 (PNG, JPG, JPEG)
* **Análise de Código Mermaid**: Processamento de diagramas Mermaid
* **Análise STRIDE Completa**: 6 categorias de ameaças (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
* **Geração de Relatórios**: Relatórios em Markdown e PDF
* **Mitigações Personalizadas**: Sugestões de correção com passos detalhados

### Categorias STRIDE

* **S - Spoofing**: Falsificação de identidade, autenticação
* **T - Tampering**: Adulteração de dados, integridade
* **R - Repudiation**: Repúdio, auditoria, logs
* **I - Information Disclosure**: Vazamento de informações, confidencialidade
* **D - Denial of Service**: Negação de serviço, disponibilidade
* **E - Elevation of Privilege**: Escalação de privilégios, autorização

### Tecnologias

* FastAPI 0.109.0
* OpenAI GPT-4 Vision & GPT-4
* WeasyPrint para geração de PDFs
* Pydantic para validação

### Documentação

* [Repositório GitHub](https://github.com/seu-usuario/threatlens-analyzer-api)
* [Guia de Início Rápido](./QUICKSTART.md)
""",
    version="1.0.0",
    lifespan=lifespan,
    contact={
        "name": "ThreatLens Team",
        "email": "support@threatlens.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=[
        {
            "name": "Analysis",
            "description": "Análise de ameaças STRIDE em diagramas de arquitetura"
        },
        {
            "name": "Reports",
            "description": "Download e gerenciamento de relatórios gerados"
        }
    ],
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,  # Hide schemas by default
        "docExpansion": "list",
        "filter": True,
        "showCommonExtensions": True,
    }
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em desenvolvimento, permite todas as origens
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analysis_router)

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.__class__.__name__,
            "message": exc.detail,
            "statusCode": exc.status_code
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": str(exc),
            "statusCode": 500
        }
    )


@app.post(
    "/api/analyze/image",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    tags=["Analysis"],
    summary="🖼️ Análise STRIDE de Imagem",
    description="""
Analisa um diagrama de arquitetura enviado como arquivo de imagem (PNG, JPG, JPEG).

### Como Usar

1. Selecione um arquivo de imagem do seu diagrama
2. (Opcional) Escolha a profundidade da análise
3. (Opcional) Escolha o formato do relatório

### Formatos Aceitos

- PNG
- JPG/JPEG

### Limites

- Tamanho máximo: 10MB
- Timeout: 30 minutos
"""
)
async def analyze_image(
    file: UploadFile = File(..., description="Arquivo de imagem do diagrama (PNG, JPG, JPEG)"),
    analysisDepth: str = Form("full", description="Profundidade: 'quick' ou 'full'"),
    reportFormat: str = Form("markdown", description="Formato: 'markdown' ou 'pdf'")
):
    """
    Analisa ameaças STRIDE em diagrama de arquitetura enviado como imagem.
    """
    try:
        # Validate file type
        if not file.content_type in ["image/png", "image/jpeg", "image/jpg"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo de arquivo não suportado: {file.content_type}. Use PNG, JPG ou JPEG."
            )
        
        # Read file content
        content = await file.read()
        
        # Validate file size (10MB)
        if len(content) > settings.max_image_size_mb * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Arquivo muito grande. Máximo: {settings.max_image_size_mb}MB"
            )
        
        # Convert to base64
        image_base64 = base64.b64encode(content).decode('utf-8')
        
        # Perform analysis
        analysis_result = await stride_analyzer.analyze_image(
            image_base64=image_base64,
            analysis_depth=analysisDepth,
            report_format=reportFormat
        )
        
        # Generate report synchronously to ensure it exists for download
        try:
            print(f"📝 Generating {reportFormat} report...")
            await report_generator.generate_report(
                analysis_result,
                reportFormat
            )
            print(f"✅ Report generated successfully")
        except Exception as report_error:
            print(f"❌ Report generation failed: {report_error}")
            # If PDF generation fails, inform the user
            if reportFormat == "pdf":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Analysis completed but PDF generation failed: {str(report_error)}. Please try using 'markdown' format instead."
                )
        
        return analysis_result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@app.post(
    "/api/analyze/mermaid",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    tags=["Analysis"],
    summary="📝 Análise STRIDE de Código Mermaid",
    description="""
Analisa um diagrama de arquitetura definido em código Mermaid.

### Exemplo de Código Mermaid

```mermaid
graph TD
    User[User] -->|HTTPS| API[API Gateway]
    API -->|gRPC| Service[Backend Service]
    Service -->|SQL| DB[(Database)]
```

### Como Usar

1. Cole o código Mermaid do seu diagrama
2. (Opcional) Escolha a profundidade da análise
3. (Opcional) Escolha o formato do relatório
"""
)
async def analyze_mermaid(request: MermaidAnalysisRequest):
    """
    Analisa ameaças STRIDE em diagrama de arquitetura definido em Mermaid.
    """
    try:
        # Validate Mermaid code
        is_valid, error_msg = validate_mermaid_code(request.mermaidCode)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # Perform analysis
        analysis_result = await stride_analyzer.analyze_mermaid(
            mermaid_code=request.mermaidCode,
            analysis_depth=request.analysisDepth,
            report_format=request.reportFormat
        )
        
        # Generate report synchronously to ensure it exists for download
        try:
            print(f"📝 Generating {request.reportFormat} report...")
            await report_generator.generate_report(
                analysis_result,
                request.reportFormat
            )
            print(f"✅ Report generated successfully")
        except Exception as report_error:
            print(f"❌ Report generation failed: {report_error}")
            # If PDF generation fails, inform the user
            if request.reportFormat == "pdf":
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Analysis completed but PDF generation failed: {str(report_error)}. Please try using 'markdown' format instead."
                )
        
        return analysis_result
    
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@app.get(
    "/api/analyses/{analysis_id}/report",
    tags=["Saved Analyses"],
    summary="📥 Download do Relatório de uma Análise Salva",
    description="Gera e baixa o relatório Markdown de uma análise salva.",
    response_class=FileResponse
)
async def download_saved_analysis_report(analysis_id: str):
    """
    Download report for a saved analysis.
    
    Generates a Markdown report from the saved analysis data and returns it for download.
    """
    try:
        # Get the saved analysis
        analysis_doc = await SavedAnalysisDocument.get(analysis_id)
        
        if not analysis_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
        
        # Create AnalysisResponse from saved data for report generation
        from models.response_models import AnalysisResponse, Component, DataFlow, Threat, Mitigation
        
        analysis_response = AnalysisResponse(
            components=[
                Component(**comp.dict()) 
                for comp in analysis_doc.analysisResult.components
            ],
            data_flows=[
                DataFlow(**flow.dict()) 
                for flow in analysis_doc.analysisResult.data_flows
            ],
            threats=[
                Threat(**threat.dict()) 
                for threat in analysis_doc.analysisResult.threats
            ],
            mitigations=[
                Mitigation(**mit.dict()) 
                for mit in analysis_doc.analysisResult.mitigations
            ],
            assumptions=analysis_doc.analysisResult.assumptions,
            uncertainties=analysis_doc.analysisResult.uncertainties,
            reportDownloadUrl=f"/api/analyses/{analysis_id}/report"
        )
        
        # Generate report
        report_path = await report_generator.generate_report(
            analysis_response,
            format="markdown"
        )
        
        # Return file
        filename = f"{analysis_doc.name.replace(' ', '_')}_report.md"
        
        return FileResponse(
            path=report_path,
            media_type="text/markdown",
            filename=filename
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}"
        )


@app.get(
    "/api/report/download/{report_filename}",
    tags=["Reports"],
    summary="📥 Download de Relatório Gerado",
    description="""
Baixa um relatório de análise STRIDE previamente gerado.

### Formatos Disponíveis

- **.md**: Relatório em Markdown com formatação rica
- **.pdf**: Relatório em PDF com estilos e layout profissional

### Como Obter o Nome do Arquivo

O nome do arquivo é retornado no campo `reportDownloadUrl` da resposta de análise.

Exemplo: `/api/report/download/550e8400-e29b-41d4-a716-446655440000.md`

### Observações

- O relatório pode levar alguns segundos para ser gerado após a análise
- Se o relatório ainda não estiver pronto, retorna erro 404
- Relatórios são mantidos no servidor por tempo limitado
""",
    responses={
        200: {
            "description": "Relatório encontrado e disponível para download",
            "content": {
                "application/pdf": {
                    "schema": {
                        "type": "string",
                        "format": "binary"
                    }
                },
                "text/markdown": {
                    "schema": {
                        "type": "string"
                    }
                }
            }
        },
        400: {
            "description": "Nome de arquivo inválido",
            "content": {
                "application/json": {
                    "example": {
                        "error": "ValidationError",
                        "message": "Invalid report filename",
                        "statusCode": 400
                    }
                }
            }
        },
        404: {
            "description": "Relatório não encontrado",
            "content": {
                "application/json": {
                    "example": {
                        "error": "NotFoundError",
                        "message": "Report not found. It may still be generating, please try again in a moment.",
                        "statusCode": 404
                    }
                }
            }
        }
    }
)
async def download_report(report_filename: str):
    """
    Endpoint para download de relatórios gerados.
    
    Retorna o arquivo de relatório (Markdown ou PDF) para download.
    """
    try:
        # Validate filename (security check)
        if ".." in report_filename or "/" in report_filename or "\\" in report_filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid report filename"
            )
        
        # Get report path
        report_path = await report_generator.get_report(report_filename)
        
        # Determine media type
        if report_filename.endswith('.pdf'):
            media_type = "application/pdf"
        else:
            media_type = "text/markdown"
        
        return FileResponse(
            path=report_path,
            media_type=media_type,
            filename=report_filename
        )
    
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found. It may still be generating, please try again in a moment."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve report: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )
